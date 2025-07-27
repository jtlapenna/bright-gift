const express = require('express');
const { query, validationResult } = require('express-validator');
const { supabase, TABLES } = require('../config/supabase');
const { checkSiteAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/v1/sites/{siteId}/posts/search
 * Search posts with advanced filtering
 */
router.get('/posts', checkSiteAccess, [
  query('q').optional().isString(),
  query('status').optional().isIn(['draft', 'published', 'review', 'failed']),
  query('contentType').optional().isString(),
  query('tags').optional().isString(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('seoScoreMin').optional().isInt({ min: 0, max: 100 }),
  query('seoScoreMax').optional().isInt({ min: 0, max: 100 }),
  query('wordCountMin').optional().isInt({ min: 0 }),
  query('wordCountMax').optional().isInt({ min: 0 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['created_at', 'updated_at', 'title', 'seo_score', 'views', 'revenue']),
  query('order').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const {
      q, status, contentType, tags, dateFrom, dateTo,
      seoScoreMin, seoScoreMax, wordCountMin, wordCountMax,
      page = 1, limit = 20, sort = 'created_at', order = 'desc'
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

    // Build base query
    let query = supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select(`
        *,
        workflow_executions(*)
      `)
      .eq('site_id', siteId);

    // Apply search filters
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,content.ilike.%${q}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query = query.overlaps('tags', tagArray);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    if (wordCountMin) {
      query = query.gte('word_count', wordCountMin);
    }

    if (wordCountMax) {
      query = query.lte('word_count', wordCountMax);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error searching posts:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search posts'
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

        // Get analytics data
        const { data: analytics } = await supabase
          .from('post_analytics')
          .select('*')
          .eq('post_id', post.post_id)
          .single();

        // Apply SEO score filtering if specified
        if (seoScoreMin && seoData && seoData.seo_score < seoScoreMin) {
          return null;
        }
        if (seoScoreMax && seoData && seoData.seo_score > seoScoreMax) {
          return null;
        }

        return {
          id: post.post_id,
          title: post.title,
          status: post.status,
          contentType: post.content_type,
          tags: post.tags || [],
          createdAt: post.created_at,
          updatedAt: post.last_updated,
          wordCount: post.word_count || 0,
          seo: seoData ? {
            score: seoData.seo_score || 0,
            keywords: seoData.keywords || [],
            metaTitle: seoData.meta_title,
            metaDescription: seoData.meta_description
          } : null,
          analytics: analytics ? {
            views: analytics.views || 0,
            revenue: analytics.revenue || 0,
            conversionRate: analytics.conversion_rate || 0
          } : null,
          workflow: {
            currentPhase: post.current_phase,
            phasesCompleted: post.workflow_phases_completed || []
          }
        };
      })
    );

    // Filter out null results from SEO score filtering
    const filteredPosts = enrichedPosts.filter(post => post !== null);

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .modify(q => {
        if (q) q = q.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
        if (status) q = q.eq('status', status);
        if (contentType) q = q.eq('content_type', contentType);
        if (dateFrom) q = q.gte('created_at', dateFrom);
        if (dateTo) q = q.lte('created_at', dateTo);
        return q;
      });

    res.json({
      posts: filteredPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      },
      filters: {
        query: q,
        status,
        contentType,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        dateRange: { from: dateFrom, to: dateTo },
        seoScoreRange: { min: seoScoreMin, max: seoScoreMax },
        wordCountRange: { min: wordCountMin, max: wordCountMax }
      }
    });
  } catch (error) {
    console.error('Error in post search route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search posts'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/workflows/search
 * Search workflows with advanced filtering
 */
router.get('/workflows', checkSiteAccess, [
  query('q').optional().isString(),
  query('status').optional().isIn(['pending', 'running', 'completed', 'failed', 'cancelled']),
  query('type').optional().isString(),
  query('phase').optional().isString(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['started_at', 'completed_at', 'name', 'type']),
  query('order').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const {
      q, status, type, phase, dateFrom, dateTo,
      page = 1, limit = 20, sort = 'started_at', order = 'desc'
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

    // Build base query
    let query = supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('*')
      .eq('site_id', siteId);

    // Apply search filters
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('workflow_type', type);
    }

    if (phase) {
      query = query.eq('current_phase', phase);
    }

    if (dateFrom) {
      query = query.gte('started_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('started_at', dateTo);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: workflows, error, count } = await query;

    if (error) {
      console.error('Error searching workflows:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to search workflows'
        }
      });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .modify(q => {
        if (q) q = q.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
        if (status) q = q.eq('status', status);
        if (type) q = q.eq('workflow_type', type);
        if (phase) q = q.eq('current_phase', phase);
        if (dateFrom) q = q.gte('started_at', dateFrom);
        if (dateTo) q = q.lte('started_at', dateTo);
        return q;
      });

    res.json({
      workflows: workflows.map(wf => ({
        id: wf.id,
        name: wf.name,
        type: wf.workflow_type,
        status: wf.status,
        currentPhase: wf.current_phase,
        startedAt: wf.started_at,
        completedAt: wf.completed_at,
        duration: wf.duration_seconds,
        progress: wf.progress || 0,
        results: wf.results || {},
        metadata: wf.metadata || {}
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      },
      filters: {
        query: q,
        status,
        type,
        phase,
        dateRange: { from: dateFrom, to: dateTo }
      }
    });
  } catch (error) {
    console.error('Error in workflow search route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search workflows'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/search/suggestions
 * Get search suggestions and autocomplete
 */
router.get('/suggestions', checkSiteAccess, [
  query('q').isString().isLength({ min: 1, max: 100 }),
  query('type').optional().isIn(['posts', 'workflows', 'tags', 'keywords'])
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { q, type = 'posts' } = req.query;

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

    let suggestions = [];

    switch (type) {
      case 'posts':
        // Get post title suggestions
        const { data: posts } = await supabase
          .from(TABLES.BLOG_WORKFLOW_STATE)
          .select('title, post_id')
          .eq('site_id', siteId)
          .ilike('title', `%${q}%`)
          .limit(10);

        suggestions = posts.map(post => ({
          type: 'post',
          id: post.post_id,
          text: post.title,
          value: post.title
        }));
        break;

      case 'tags':
        // Get tag suggestions
        const { data: postsWithTags } = await supabase
          .from(TABLES.BLOG_WORKFLOW_STATE)
          .select('tags')
          .eq('site_id', siteId)
          .not('tags', 'is', null);

        const allTags = postsWithTags
          .flatMap(post => post.tags || [])
          .filter(tag => tag.toLowerCase().includes(q.toLowerCase()));

        const uniqueTags = [...new Set(allTags)];
        suggestions = uniqueTags.slice(0, 10).map(tag => ({
          type: 'tag',
          text: tag,
          value: tag
        }));
        break;

      case 'keywords':
        // Get keyword suggestions from SEO data
        const { data: seoData } = await supabase
          .from('post_seo_data')
          .select('keywords')
          .not('keywords', 'is', null);

        const allKeywords = seoData
          .flatMap(data => data.keywords || [])
          .filter(keyword => keyword.toLowerCase().includes(q.toLowerCase()));

        const uniqueKeywords = [...new Set(allKeywords)];
        suggestions = uniqueKeywords.slice(0, 10).map(keyword => ({
          type: 'keyword',
          text: keyword,
          value: keyword
        }));
        break;

      case 'workflows':
        // Get workflow name suggestions
        const { data: workflows } = await supabase
          .from(TABLES.WORKFLOW_EXECUTIONS)
          .select('name, id')
          .eq('site_id', siteId)
          .ilike('name', `%${q}%`)
          .limit(10);

        suggestions = workflows.map(wf => ({
          type: 'workflow',
          id: wf.id,
          text: wf.name,
          value: wf.name
        }));
        break;
    }

    res.json({
      query: q,
      type,
      suggestions,
      total: suggestions.length
    });
  } catch (error) {
    console.error('Error in search suggestions route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get search suggestions'
      }
    });
  }
});

module.exports = router; 