const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { supabase, TABLES, POST_STATUS } = require('../config/supabase');
const { checkSiteAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/v1/sites/{siteId}/posts
 * Get all posts for a site with filtering and pagination
 */
router.get('/', checkSiteAccess, [
  query('status').optional().isIn(Object.values(POST_STATUS)),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['created_at', 'updated_at', 'title', 'views', 'seo_score']),
  query('order').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { 
      status, 
      page = 1, 
      limit = 20, 
      sort = 'created_at', 
      order = 'desc' 
    } = req.query;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: errors.array()
        }
      });
    }

    // Build query
    let query = supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select(`
        *,
        workflow_executions(*)
      `)
      .eq('site_id', siteId);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch posts'
        }
      });
    }

    // Enrich posts with additional data
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        // Get SEO data
        const { data: seoData } = await supabase
          .from('post_seo_data')
          .select('*')
          .eq('post_id', post.post_id)
          .single();

        // Get social posts
        const { data: socialPosts } = await supabase
          .from('post_social_content')
          .select('*')
          .eq('post_id', post.post_id);

        // Get images
        const { data: images } = await supabase
          .from('post_images')
          .select('*')
          .eq('post_id', post.post_id);

        // Get analytics data
        const { data: analytics } = await supabase
          .from('post_analytics')
          .select('*')
          .eq('post_id', post.post_id)
          .single();

        return {
          id: post.post_id,
          title: post.title,
          status: post.status,
          siteId: post.site_id,
          contentType: post.content_type,
          category: post.category,
          createdAt: post.created_at,
          updatedAt: post.last_updated,
          publishedAt: post.published_at,
          author: post.author || 'System',
          tags: post.tags || [],
          content: post.content,
          excerpt: post.excerpt,
          featuredImage: post.featured_image,
          url: post.final_url,
          previewUrl: post.preview_url,
          wordCount: post.word_count || 0,
          seo: seoData ? {
            metaTitle: seoData.meta_title,
            metaDescription: seoData.meta_description,
            keywords: seoData.keywords,
            slug: seoData.slug,
            score: seoData.seo_score,
            readabilityScore: seoData.readability_score,
            keywordDensity: seoData.keyword_density
          } : null,
          social: socialPosts ? socialPosts.map(sp => ({
            platform: sp.platform,
            content: sp.content,
            image: sp.image_url,
            scheduledAt: sp.scheduled_at,
            publishedAt: sp.published_at,
            engagement: sp.engagement_metrics
          })) : [],
          images: images ? images.map(img => ({
            type: img.image_type, // banner, og, social, content
            url: img.image_url,
            alt: img.alt_text,
            width: img.width,
            height: img.height,
            optimized: img.is_optimized
          })) : [],
          metrics: analytics ? {
            views: analytics.views || 0,
            uniqueVisitors: analytics.unique_visitors || 0,
            likes: analytics.likes || 0,
            shares: analytics.shares || 0,
            comments: analytics.comments || 0,
            bounceRate: analytics.bounce_rate || 0,
            avgTimeOnPage: analytics.avg_time_on_page || 0,
            revenue: analytics.revenue || 0
          } : {
            views: 0,
            uniqueVisitors: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            bounceRate: 0,
            avgTimeOnPage: 0,
            revenue: 0
          },
          workflow: {
            currentPhase: post.current_phase,
            nextPhase: post.next_workflow_phase,
            phasesCompleted: post.workflow_phases_completed || [],
            executions: post.workflow_executions || []
          }
        };
      })
    );

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .modify(q => status ? q.eq('status', status) : q);

    res.json({
      posts: enrichedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in posts route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch posts'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/posts/{postId}
 * Get single post with all details
 */
router.get('/:postId', checkSiteAccess, async (req, res) => {
  try {
    const { siteId, postId } = req.params;

    // Get post data
    const { data: post, error } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select(`
        *,
        workflow_executions(*)
      `)
      .eq('post_id', postId)
      .eq('site_id', siteId)
      .single();

    if (error || !post) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    // Get all related data
    const [seoData, socialPosts, images, analytics, workflowLogs] = await Promise.all([
      // SEO data
      supabase
        .from('post_seo_data')
        .select('*')
        .eq('post_id', postId)
        .single(),
      
      // Social posts
      supabase
        .from('post_social_content')
        .select('*')
        .eq('post_id', postId),
      
      // Images
      supabase
        .from('post_images')
        .select('*')
        .eq('post_id', postId),
      
      // Analytics
      supabase
        .from('post_analytics')
        .select('*')
        .eq('post_id', postId)
        .single(),
      
      // Workflow logs
      supabase
        .from('workflow_executions')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
    ]);

    const enrichedPost = {
      id: post.post_id,
      title: post.title,
      status: post.status,
      siteId: post.site_id,
      contentType: post.content_type,
      category: post.category,
      createdAt: post.created_at,
      updatedAt: post.last_updated,
      publishedAt: post.published_at,
      approvedAt: post.approved_at,
      approvedBy: post.approved_by,
      author: post.author || 'System',
      tags: post.tags || [],
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      url: post.final_url,
      previewUrl: post.preview_url,
      wordCount: post.word_count || 0,
      seo: seoData.data ? {
        metaTitle: seoData.data.meta_title,
        metaDescription: seoData.data.meta_description,
        keywords: seoData.data.keywords,
        slug: seoData.data.slug,
        score: seoData.data.seo_score,
        readabilityScore: seoData.data.readability_score,
        keywordDensity: seoData.data.keyword_density,
        titleLength: seoData.data.title_length,
        descriptionLength: seoData.data.description_length
      } : null,
      social: socialPosts.data ? socialPosts.data.map(sp => ({
        id: sp.id,
        platform: sp.platform,
        content: sp.content,
        image: sp.image_url,
        scheduledAt: sp.scheduled_at,
        publishedAt: sp.published_at,
        engagement: sp.engagement_metrics,
        status: sp.status
      })) : [],
      images: images.data ? images.data.map(img => ({
        id: img.id,
        type: img.image_type,
        url: img.image_url,
        alt: img.alt_text,
        width: img.width,
        height: img.height,
        optimized: img.is_optimized,
        fileSize: img.file_size,
        createdAt: img.created_at
      })) : [],
      metrics: analytics.data ? {
        views: analytics.data.views || 0,
        uniqueVisitors: analytics.data.unique_visitors || 0,
        pageViews: analytics.data.page_views || 0,
        likes: analytics.data.likes || 0,
        shares: analytics.data.shares || 0,
        comments: analytics.data.comments || 0,
        bounceRate: analytics.data.bounce_rate || 0,
        avgTimeOnPage: analytics.data.avg_time_on_page || 0,
        revenue: analytics.data.revenue || 0,
        conversionRate: analytics.data.conversion_rate || 0,
        lastUpdated: analytics.data.last_updated
      } : {
        views: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        bounceRate: 0,
        avgTimeOnPage: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: null
      },
      workflow: {
        currentPhase: post.current_phase,
        nextPhase: post.next_workflow_phase,
        phasesCompleted: post.workflow_phases_completed || [],
        executions: post.workflow_executions || [],
        logs: workflowLogs.data || [],
        metadata: post.metadata || {}
      }
    };

    res.json(enrichedPost);
  } catch (error) {
    console.error('Error fetching post details:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch post details'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/posts
 * Create new post
 */
router.post('/', checkSiteAccess, [
  body('title').isLength({ min: 1, max: 200 }),
  body('content').isLength({ min: 100 }),
  body('excerpt').optional().isLength({ max: 500 }),
  body('tags').optional().isArray(),
  body('author').optional().isLength({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { title, content, excerpt, tags, author } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    // Calculate word count
    const wordCount = content.split(/\s+/).length;

    // Create post
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: post, error } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .insert({
        post_id: postId,
        site_id: siteId,
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        tags: tags || [],
        author: author || req.user.name,
        status: POST_STATUS.DRAFT,
        current_phase: 'content_generation',
        word_count: wordCount,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create post'
        }
      });
    }

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post.post_id,
        title: post.title,
        status: post.status,
        wordCount: post.word_count,
        createdAt: post.created_at
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create post'
      }
    });
  }
});

/**
 * PUT /api/v1/sites/{siteId}/posts/{postId}
 * Update post
 */
router.put('/:postId', checkSiteAccess, [
  body('title').optional().isLength({ min: 1, max: 200 }),
  body('content').optional().isLength({ min: 100 }),
  body('excerpt').optional().isLength({ max: 500 }),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const { siteId, postId } = req.params;
    const { title, content, excerpt, tags } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    // Get existing post
    const { data: existingPost, error: fetchError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('*')
      .eq('post_id', postId)
      .eq('site_id', siteId)
      .single();

    if (fetchError || !existingPost) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    // Prepare update data
    const updateData = {
      last_updated: new Date().toISOString()
    };

    if (title) updateData.title = title;
    if (content) {
      updateData.content = content;
      updateData.word_count = content.split(/\s+/).length;
    }
    if (excerpt) updateData.excerpt = excerpt;
    if (tags) updateData.tags = tags;

    // Update post
    const { data: updatedPost, error } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .update(updateData)
      .eq('post_id', postId)
      .eq('site_id', siteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update post'
        }
      });
    }

    res.json({
      message: 'Post updated successfully',
      post: {
        id: updatedPost.post_id,
        title: updatedPost.title,
        status: updatedPost.status,
        wordCount: updatedPost.word_count,
        updatedAt: updatedPost.last_updated
      }
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update post'
      }
    });
  }
});

/**
 * DELETE /api/v1/sites/{siteId}/posts/{postId}
 * Delete post
 */
router.delete('/:postId', checkSiteAccess, async (req, res) => {
  try {
    const { siteId, postId } = req.params;

    // Check if post exists
    const { data: post, error: fetchError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('post_id')
      .eq('post_id', postId)
      .eq('site_id', siteId)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    // Delete related data first
    await Promise.all([
      supabase.from('post_seo_data').delete().eq('post_id', postId),
      supabase.from('post_social_content').delete().eq('post_id', postId),
      supabase.from('post_images').delete().eq('post_id', postId),
      supabase.from('post_analytics').delete().eq('post_id', postId),
      supabase.from('workflow_executions').delete().eq('post_id', postId)
    ]);

    // Delete main post
    const { error } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .delete()
      .eq('post_id', postId)
      .eq('site_id', siteId);

    if (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete post'
        }
      });
    }

    res.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete post'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/posts/{postId}/publish
 * Publish post
 */
router.post('/:postId/publish', checkSiteAccess, async (req, res) => {
  try {
    const { siteId, postId } = req.params;

    // Update post status to published
    const { data: post, error } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .update({
        status: POST_STATUS.PUBLISHED,
        published_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      })
      .eq('post_id', postId)
      .eq('site_id', siteId)
      .select()
      .single();

    if (error || !post) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    // TODO: Trigger GitHub merge to main branch
    // TODO: Update final URL
    // TODO: Publish social posts

    res.json({
      message: 'Post published successfully',
      post: {
        id: post.post_id,
        title: post.title,
        status: post.status,
        publishedAt: post.published_at
      }
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to publish post'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/posts/{postId}/approve
 * Approve post for publishing
 */
router.post('/:postId/approve', checkSiteAccess, async (req, res) => {
  try {
    const { siteId, postId } = req.params;
    const { comments } = req.body;

    // Update post status to approved
    const { data: post, error } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .update({
        status: POST_STATUS.APPROVED,
        approved_at: new Date().toISOString(),
        approved_by: req.user.id,
        last_updated: new Date().toISOString()
      })
      .eq('post_id', postId)
      .eq('site_id', siteId)
      .select()
      .single();

    if (error || !post) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    // Log approval action
    await supabase
      .from('workflow_executions')
      .insert({
        post_id: postId,
        site_id: siteId,
        workflow_type: 'approval',
        status: 'completed',
        metadata: {
          approved_by: req.user.id,
          comments: comments || '',
          action: 'approve'
        }
      });

    res.json({
      message: 'Post approved successfully',
      post: {
        id: post.post_id,
        title: post.title,
        status: post.status,
        approvedAt: post.approved_at,
        approvedBy: post.approved_by
      }
    });
  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to approve post'
      }
    });
  }
});

/**
 * POST /api/v1/sites/{siteId}/posts/{postId}/reject
 * Reject post
 */
router.post('/:postId/reject', checkSiteAccess, [
  body('reason').isLength({ min: 1, max: 1000 })
], async (req, res) => {
  try {
    const { siteId, postId } = req.params;
    const { reason } = req.body;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rejection reason is required',
          details: errors.array()
        }
      });
    }

    // Update post status to rejected
    const { data: post, error } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .update({
        status: POST_STATUS.REJECTED,
        last_updated: new Date().toISOString(),
        metadata: {
          ...req.body.metadata,
          rejection_reason: reason,
          rejected_by: req.user.id,
          rejected_at: new Date().toISOString()
        }
      })
      .eq('post_id', postId)
      .eq('site_id', siteId)
      .select()
      .single();

    if (error || !post) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Post not found'
        }
      });
    }

    // Log rejection action
    await supabase
      .from('workflow_executions')
      .insert({
        post_id: postId,
        site_id: siteId,
        workflow_type: 'rejection',
        status: 'completed',
        metadata: {
          rejected_by: req.user.id,
          reason: reason,
          action: 'reject'
        }
      });

    res.json({
      message: 'Post rejected successfully',
      post: {
        id: post.post_id,
        title: post.title,
        status: post.status,
        rejectionReason: reason
      }
    });
  } catch (error) {
    console.error('Error rejecting post:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reject post'
      }
    });
  }
});

module.exports = router; 