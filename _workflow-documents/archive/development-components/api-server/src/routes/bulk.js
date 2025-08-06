const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase, TABLES, POST_STATUS, WORKFLOW_STATUS } = require('../config/supabase');
const { checkSiteAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/v1/sites/{siteId}/posts/bulk-approve
 * Bulk approve multiple posts
 */
router.post('/posts/approve', checkSiteAccess, [
  body('postIds').isArray({ min: 1 }).withMessage('At least one post ID is required'),
  body('postIds.*').isString().withMessage('Post IDs must be strings'),
  body('comments').optional().isString().withMessage('Comments must be a string')
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { postIds, comments } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors.array()
        }
      });
    }

    // Verify all posts belong to the site and are in review status
    const { data: posts, error: fetchError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('post_id, title, status')
      .eq('site_id', siteId)
      .in('post_id', postIds);

    if (fetchError) {
      console.error('Error fetching posts:', fetchError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch posts'
        }
      });
    }

    if (posts.length !== postIds.length) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some posts not found or do not belong to this site'
        }
      });
    }

    // Check if all posts are in review status
    const invalidPosts = posts.filter(post => post.status !== 'review');
    if (invalidPosts.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some posts are not in review status',
          details: invalidPosts.map(post => ({
            postId: post.post_id,
            title: post.title,
            status: post.status
          }))
        }
      });
    }

    // Bulk update posts
    const now = new Date().toISOString();
    const { data: updatedPosts, error: updateError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .update({
        status: POST_STATUS.APPROVED,
        approved_by: req.user.id,
        approved_at: now,
        last_updated: now
      })
      .eq('site_id', siteId)
      .in('post_id', postIds)
      .select('post_id, title, status, approved_at');

    if (updateError) {
      console.error('Error updating posts:', updateError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to approve posts'
        }
      });
    }

    // Log activities for each approved post
    const activities = postIds.map(postId => ({
      site_id: siteId,
      user_id: req.user.id,
      action: 'post_approved',
      post_id: postId,
      action_details: {
        comments: comments || null,
        bulk_operation: true,
        total_approved: postIds.length
      },
      timestamp: now
    }));

    await supabase.from('user_actions').insert(activities);

    res.json({
      message: `Successfully approved ${updatedPosts.length} posts`,
      approvedPosts: updatedPosts,
      totalApproved: updatedPosts.length,
      comments: comments || null
    });
  } catch (error) {
    console.error('Error in bulk approve route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to approve posts'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/posts/bulk-reject
 * Bulk reject multiple posts
 */
router.post('/posts/reject', checkSiteAccess, [
  body('postIds').isArray({ min: 1 }).withMessage('At least one post ID is required'),
  body('postIds.*').isString().withMessage('Post IDs must be strings'),
  body('reason').isString().withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { postIds, reason } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors.array()
        }
      });
    }

    // Verify all posts belong to the site and are in review status
    const { data: posts, error: fetchError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('post_id, title, status')
      .eq('site_id', siteId)
      .in('post_id', postIds);

    if (fetchError) {
      console.error('Error fetching posts:', fetchError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch posts'
        }
      });
    }

    if (posts.length !== postIds.length) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some posts not found or do not belong to this site'
        }
      });
    }

    // Check if all posts are in review status
    const invalidPosts = posts.filter(post => post.status !== 'review');
    if (invalidPosts.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some posts are not in review status',
          details: invalidPosts.map(post => ({
            postId: post.post_id,
            title: post.title,
            status: post.status
          }))
        }
      });
    }

    // Bulk update posts
    const now = new Date().toISOString();
    const { data: updatedPosts, error: updateError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .update({
        status: POST_STATUS.REJECTED,
        last_updated: now,
        metadata: {
          rejection_reason: reason,
          rejected_by: req.user.id,
          rejected_at: now
        }
      })
      .eq('site_id', siteId)
      .in('post_id', postIds)
      .select('post_id, title, status, metadata');

    if (updateError) {
      console.error('Error updating posts:', updateError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reject posts'
        }
      });
    }

    // Log activities for each rejected post
    const activities = postIds.map(postId => ({
      site_id: siteId,
      user_id: req.user.id,
      action: 'post_rejected',
      post_id: postId,
      action_details: {
        reason: reason,
        bulk_operation: true,
        total_rejected: postIds.length
      },
      timestamp: now
    }));

    await supabase.from('user_actions').insert(activities);

    res.json({
      message: `Successfully rejected ${updatedPosts.length} posts`,
      rejectedPosts: updatedPosts,
      totalRejected: updatedPosts.length,
      reason: reason
    });
  } catch (error) {
    console.error('Error in bulk reject route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reject posts'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/posts/bulk-publish
 * Bulk publish multiple approved posts
 */
router.post('/posts/publish', checkSiteAccess, [
  body('postIds').isArray({ min: 1 }).withMessage('At least one post ID is required'),
  body('postIds.*').isString().withMessage('Post IDs must be strings'),
  body('publishDate').optional().isISO8601().withMessage('Publish date must be ISO 8601 format')
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { postIds, publishDate } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors.array()
        }
      });
    }

    // Verify all posts belong to the site and are approved
    const { data: posts, error: fetchError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('post_id, title, status')
      .eq('site_id', siteId)
      .in('post_id', postIds);

    if (fetchError) {
      console.error('Error fetching posts:', fetchError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch posts'
        }
      });
    }

    if (posts.length !== postIds.length) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some posts not found or do not belong to this site'
        }
      });
    }

    // Check if all posts are approved
    const invalidPosts = posts.filter(post => post.status !== 'approved');
    if (invalidPosts.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some posts are not approved',
          details: invalidPosts.map(post => ({
            postId: post.post_id,
            title: post.title,
            status: post.status
          }))
        }
      });
    }

    // Bulk update posts
    const now = new Date().toISOString();
    const publishTime = publishDate || now;
    
    const { data: updatedPosts, error: updateError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .update({
        status: POST_STATUS.PUBLISHED,
        published_at: publishTime,
        last_updated: now,
        current_phase: 'live_deployment'
      })
      .eq('site_id', siteId)
      .in('post_id', postIds)
      .select('post_id, title, status, published_at');

    if (updateError) {
      console.error('Error updating posts:', updateError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to publish posts'
        }
      });
    }

    // Log activities for each published post
    const activities = postIds.map(postId => ({
      site_id: siteId,
      user_id: req.user.id,
      action: 'post_published',
      post_id: postId,
      action_details: {
        publish_date: publishTime,
        bulk_operation: true,
        total_published: postIds.length
      },
      timestamp: now
    }));

    await supabase.from('user_actions').insert(activities);

    res.json({
      message: `Successfully published ${updatedPosts.length} posts`,
      publishedPosts: updatedPosts,
      totalPublished: updatedPosts.length,
      publishDate: publishTime
    });
  } catch (error) {
    console.error('Error in bulk publish route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to publish posts'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/workflows/bulk-cancel
 * Bulk cancel multiple running workflows
 */
router.post('/workflows/cancel', checkSiteAccess, [
  body('workflowIds').isArray({ min: 1 }).withMessage('At least one workflow ID is required'),
  body('workflowIds.*').isString().withMessage('Workflow IDs must be strings'),
  body('reason').optional().isString().withMessage('Cancellation reason must be a string')
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { workflowIds, reason } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors.array()
        }
      });
    }

    // Verify all workflows belong to the site and are running
    const { data: workflows, error: fetchError } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('id, name, status')
      .eq('site_id', siteId)
      .in('id', workflowIds);

    if (fetchError) {
      console.error('Error fetching workflows:', fetchError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch workflows'
        }
      });
    }

    if (workflows.length !== workflowIds.length) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some workflows not found or do not belong to this site'
        }
      });
    }

    // Check if all workflows are running
    const invalidWorkflows = workflows.filter(wf => wf.status !== 'running');
    if (invalidWorkflows.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some workflows are not running',
          details: invalidWorkflows.map(wf => ({
            workflowId: wf.id,
            name: wf.name,
            status: wf.status
          }))
        }
      });
    }

    // Bulk update workflows
    const now = new Date().toISOString();
    const { data: updatedWorkflows, error: updateError } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .update({
        status: WORKFLOW_STATUS.CANCELLED,
        completed_at: now,
        metadata: {
          cancellation_reason: reason || 'Bulk cancelled by user',
          cancelled_by: req.user.id,
          cancelled_at: now
        }
      })
      .eq('site_id', siteId)
      .in('id', workflowIds)
      .select('id, name, status, completed_at');

    if (updateError) {
      console.error('Error updating workflows:', updateError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to cancel workflows'
        }
      });
    }

    // Log activities for each cancelled workflow
    const activities = workflowIds.map(workflowId => ({
      site_id: siteId,
      user_id: req.user.id,
      action: 'workflow_cancelled',
      action_details: {
        workflow_id: workflowId,
        reason: reason || 'Bulk cancelled by user',
        bulk_operation: true,
        total_cancelled: workflowIds.length
      },
      timestamp: now
    }));

    await supabase.from('user_actions').insert(activities);

    res.json({
      message: `Successfully cancelled ${updatedWorkflows.length} workflows`,
      cancelledWorkflows: updatedWorkflows,
      totalCancelled: updatedWorkflows.length,
      reason: reason || 'Bulk cancelled by user'
    });
  } catch (error) {
    console.error('Error in bulk cancel workflows route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to cancel workflows'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/workflows/bulk-retry
 * Bulk retry multiple failed workflows
 */
router.post('/workflows/retry', checkSiteAccess, [
  body('workflowIds').isArray({ min: 1 }).withMessage('At least one workflow ID is required'),
  body('workflowIds.*').isString().withMessage('Workflow IDs must be strings')
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { workflowIds } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors.array()
        }
      });
    }

    // Verify all workflows belong to the site and are failed
    const { data: workflows, error: fetchError } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('id, name, status, workflow_type')
      .eq('site_id', siteId)
      .in('id', workflowIds);

    if (fetchError) {
      console.error('Error fetching workflows:', fetchError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch workflows'
        }
      });
    }

    if (workflows.length !== workflowIds.length) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some workflows not found or do not belong to this site'
        }
      });
    }

    // Check if all workflows are failed
    const invalidWorkflows = workflows.filter(wf => wf.status !== 'failed');
    if (invalidWorkflows.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Some workflows are not failed',
          details: invalidWorkflows.map(wf => ({
            workflowId: wf.id,
            name: wf.name,
            status: wf.status
          }))
        }
      });
    }

    // Bulk update workflows to pending status
    const now = new Date().toISOString();
    const { data: updatedWorkflows, error: updateError } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .update({
        status: WORKFLOW_STATUS.PENDING,
        started_at: null,
        completed_at: null,
        metadata: {
          retry_count: supabase.raw('COALESCE(metadata->>\'retry_count\', \'0\')::int + 1'),
          retried_by: req.user.id,
          retried_at: now
        }
      })
      .eq('site_id', siteId)
      .in('id', workflowIds)
      .select('id, name, status, workflow_type');

    if (updateError) {
      console.error('Error updating workflows:', updateError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retry workflows'
        }
      });
    }

    // Log activities for each retried workflow
    const activities = workflowIds.map(workflowId => ({
      site_id: siteId,
      user_id: req.user.id,
      action: 'workflow_retried',
      action_details: {
        workflow_id: workflowId,
        bulk_operation: true,
        total_retried: workflowIds.length
      },
      timestamp: now
    }));

    await supabase.from('user_actions').insert(activities);

    res.json({
      message: `Successfully queued ${updatedWorkflows.length} workflows for retry`,
      retriedWorkflows: updatedWorkflows,
      totalRetried: updatedWorkflows.length
    });
  } catch (error) {
    console.error('Error in bulk retry workflows route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retry workflows'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/posts/bulk-update-by-content-type
 * Bulk update posts filtered by content type
 */
router.post('/posts/update-by-content-type', checkSiteAccess, [
  body('contentType').isString().withMessage('Content type is required'),
  body('updates').isObject().withMessage('Updates object is required'),
  body('updates.status').optional().isIn(Object.values(POST_STATUS)),
  body('updates.tags').optional().isArray(),
  body('updates.metadata').optional().isObject()
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { contentType, updates } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors.array()
        }
      });
    }

    // Get all posts of the specified content type for this site
    const { data: posts, error: fetchError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('post_id, title, status, content_type')
      .eq('site_id', siteId)
      .eq('content_type', contentType);

    if (fetchError) {
      console.error('Error fetching posts:', fetchError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch posts'
        }
      });
    }

    if (posts.length === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `No posts found with content type: ${contentType}`
        }
      });
    }

    const postIds = posts.map(post => post.post_id);

    // Prepare update data
    const updateData = {
      last_updated: new Date().toISOString()
    };

    if (updates.status) {
      updateData.status = updates.status;
    }
    if (updates.tags) {
      updateData.tags = updates.tags;
    }
    if (updates.metadata) {
      updateData.metadata = updates.metadata;
    }

    // Bulk update posts
    const { data: updatedPosts, error: updateError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .update(updateData)
      .eq('site_id', siteId)
      .in('post_id', postIds)
      .select('post_id, title, status, content_type');

    if (updateError) {
      console.error('Error updating posts:', updateError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update posts'
        }
      });
    }

    // Log activities for each updated post
    const activities = postIds.map(postId => ({
      site_id: siteId,
      user_id: req.user.id,
      action: 'post_bulk_updated',
      post_id: postId,
      action_details: {
        content_type: contentType,
        updates: updates,
        bulk_operation: true,
        total_updated: postIds.length
      },
      timestamp: new Date().toISOString()
    }));

    await supabase.from('user_actions').insert(activities);

    res.json({
      message: `Successfully updated ${updatedPosts.length} posts of content type: ${contentType}`,
      updatedPosts: updatedPosts,
      totalUpdated: updatedPosts.length,
      contentType: contentType,
      updates: updates
    });
  } catch (error) {
    console.error('Error in bulk update by content type route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update posts'
      }
    });
  }
});

module.exports = router; 