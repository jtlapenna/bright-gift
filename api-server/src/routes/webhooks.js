const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase, TABLES, WORKFLOW_STATUS, POST_STATUS } = require('../config/supabase');
const { verifyWebhookSignature } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/v1/webhooks/workflow-status
 * Receive workflow status updates from n8n
 */
router.post('/workflow-status', verifyWebhookSignature, [
  body('workflowId').isString(),
  body('siteId').isString(),
  body('status').isIn(Object.values(WORKFLOW_STATUS)),
  body('progress').optional().isInt({ min: 0, max: 100 }),
  body('results').optional().isObject(),
  body('error').optional().isString()
], async (req, res) => {
  try {
    const { workflowId, siteId, status, progress, results, error } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid webhook payload',
          details: errors.array()
        }
      });
    }

    // Update workflow execution
    const updateData = {
      status,
      last_updated: new Date().toISOString()
    };

    if (progress !== undefined) {
      updateData.progress = progress;
    }

    if (results) {
      updateData.results = results;
    }

    if (status === WORKFLOW_STATUS.COMPLETED || status === WORKFLOW_STATUS.FAILED) {
      updateData.completed_at = new Date().toISOString();
    }

    if (error) {
      updateData.metadata = {
        error,
        failed_at: new Date().toISOString()
      };
    }

    const { data: workflow, updateError } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .update(updateData)
      .eq('id', workflowId)
      .eq('site_id', siteId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating workflow status:', updateError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update workflow status'
        }
      });
    }

    // Log the status update
    await supabase
      .from('workflow_logs')
      .insert({
        workflow_id: workflowId,
        site_id: siteId,
        level: status === WORKFLOW_STATUS.FAILED ? 'error' : 'info',
        message: `Workflow status updated to ${status}`,
        metadata: {
          progress,
          results,
          error
        }
      });

    // Send WebSocket notification
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.siteId === siteId) {
          client.send(JSON.stringify({
            type: 'workflow_update',
            data: {
              workflowId,
              status,
              progress,
              results,
              error
            }
          }));
        }
      });
    }

    res.json({
      message: 'Workflow status updated successfully',
      workflow: {
        id: workflow.id,
        status: workflow.status,
        progress: workflow.progress
      }
    });
  } catch (error) {
    console.error('Error processing workflow status webhook:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process workflow status update'
      }
    });
  }
});

/**
 * POST /api/v1/webhooks/post-status
 * Receive post status updates from n8n workflows
 */
router.post('/post-status', verifyWebhookSignature, [
  body('postId').isString(),
  body('siteId').isString(),
  body('status').isIn(Object.values(POST_STATUS)),
  body('data').optional().isObject()
], async (req, res) => {
  try {
    const { postId, siteId, status, data } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid webhook payload',
          details: errors.array()
        }
      });
    }

    // Update post status
    const updateData = {
      status,
      last_updated: new Date().toISOString()
    };

    // Handle specific status updates
    if (status === POST_STATUS.PUBLISHED) {
      updateData.published_at = new Date().toISOString();
    }

    if (data) {
      // Update specific fields based on data
      if (data.content) updateData.content = data.content;
      if (data.title) updateData.title = data.title;
      if (data.excerpt) updateData.excerpt = data.excerpt;
      if (data.word_count) updateData.word_count = data.word_count;
      if (data.preview_url) updateData.preview_url = data.preview_url;
      if (data.final_url) updateData.final_url = data.final_url;
      if (data.featured_image) updateData.featured_image = data.featured_image;
      if (data.current_phase) updateData.current_phase = data.current_phase;
      if (data.next_workflow_phase) updateData.next_workflow_phase = data.next_workflow_phase;
      if (data.workflow_phases_completed) updateData.workflow_phases_completed = data.workflow_phases_completed;
    }

    const { data: post, updateError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .update(updateData)
      .eq('post_id', postId)
      .eq('site_id', siteId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating post status:', updateError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update post status'
        }
      });
    }

    // Update related data if provided
    if (data) {
      await Promise.all([
        // Update SEO data
        data.seo && supabase
          .from('post_seo_data')
          .upsert({
            post_id: postId,
            meta_title: data.seo.meta_title,
            meta_description: data.seo.meta_description,
            keywords: data.seo.keywords,
            slug: data.seo.slug,
            seo_score: data.seo.score,
            readability_score: data.seo.readability_score,
            keyword_density: data.seo.keyword_density
          }),

        // Update social posts
        data.social && Promise.all(
          data.social.map(socialPost =>
            supabase
              .from('post_social_content')
              .upsert({
                post_id: postId,
                platform: socialPost.platform,
                content: socialPost.content,
                image_url: socialPost.image,
                scheduled_at: socialPost.scheduled_at,
                status: socialPost.status || 'pending'
              })
          )
        ),

        // Update images
        data.images && Promise.all(
          data.images.map(image =>
            supabase
              .from('post_images')
              .upsert({
                post_id: postId,
                image_type: image.type,
                image_url: image.url,
                alt_text: image.alt,
                width: image.width,
                height: image.height,
                is_optimized: image.optimized
              })
          )
        )
      ]);
    }

    // Log the status update
    await supabase
      .from('workflow_executions')
      .insert({
        post_id: postId,
        site_id: siteId,
        workflow_type: 'post_status_update',
        status: 'completed',
        metadata: {
          previous_status: post.status,
          new_status: status,
          data: data || {}
        }
      });

    // Send WebSocket notification
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.siteId === siteId) {
          client.send(JSON.stringify({
            type: 'post_update',
            data: {
              postId,
              status,
              data
            }
          }));
        }
      });
    }

    res.json({
      message: 'Post status updated successfully',
      post: {
        id: post.post_id,
        title: post.title,
        status: post.status,
        updatedAt: post.last_updated
      }
    });
  } catch (error) {
    console.error('Error processing post status webhook:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process post status update'
      }
    });
  }
});

/**
 * POST /api/v1/webhooks/site-health
 * Receive site health updates from monitoring workflows
 */
router.post('/site-health', verifyWebhookSignature, [
  body('siteId').isString(),
  body('healthScore').isInt({ min: 0, max: 100 }),
  body('factors').isArray(),
  body('recommendations').optional().isArray()
], async (req, res) => {
  try {
    const { siteId, healthScore, factors, recommendations } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid webhook payload',
          details: errors.array()
        }
      });
    }

    // Update site health data
    const { data: site, updateError } = await supabase
      .from(TABLES.SITES)
      .update({
        health_score: healthScore,
        health_factors: factors,
        last_health_check: new Date().toISOString(),
        last_updated: new Date().toISOString()
      })
      .eq('id', siteId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating site health:', updateError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update site health'
        }
      });
    }

    // Send WebSocket notification
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.siteId === siteId) {
          client.send(JSON.stringify({
            type: 'health_update',
            data: {
              siteId,
              healthScore,
              factors,
              recommendations
            }
          }));
        }
      });
    }

    res.json({
      message: 'Site health updated successfully',
      site: {
        id: site.id,
        name: site.name,
        healthScore: site.health_score,
        lastHealthCheck: site.last_health_check
      }
    });
  } catch (error) {
    console.error('Error processing site health webhook:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process site health update'
      }
    });
  }
});

/**
 * POST /api/v1/webhooks/analytics
 * Receive analytics data updates
 */
router.post('/analytics', verifyWebhookSignature, [
  body('postId').isString(),
  body('siteId').isString(),
  body('metrics').isObject()
], async (req, res) => {
  try {
    const { postId, siteId, metrics } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid webhook payload',
          details: errors.array()
        }
      });
    }

    // Update or create analytics record
    const { data: analytics, error } = await supabase
      .from('post_analytics')
      .upsert({
        post_id: postId,
        site_id: siteId,
        views: metrics.views || 0,
        unique_visitors: metrics.uniqueVisitors || 0,
        page_views: metrics.pageViews || 0,
        likes: metrics.likes || 0,
        shares: metrics.shares || 0,
        comments: metrics.comments || 0,
        bounce_rate: metrics.bounceRate || 0,
        avg_time_on_page: metrics.avgTimeOnPage || 0,
        revenue: metrics.revenue || 0,
        conversion_rate: metrics.conversionRate || 0,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating analytics:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update analytics'
        }
      });
    }

    // Send WebSocket notification
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.siteId === siteId) {
          client.send(JSON.stringify({
            type: 'analytics_update',
            data: {
              postId,
              metrics
            }
          }));
        }
      });
    }

    res.json({
      message: 'Analytics updated successfully',
      analytics: {
        postId: analytics.post_id,
        views: analytics.views,
        revenue: analytics.revenue,
        lastUpdated: analytics.last_updated
      }
    });
  } catch (error) {
    console.error('Error processing analytics webhook:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process analytics update'
      }
    });
  }
});

module.exports = router; 