const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase, TABLES } = require('../config/supabase');
const { checkSiteAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/v1/sites
 * Get all sites for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get sites that the user has access to
    const { data: sites, error } = await supabase
      .from(TABLES.SITES)
      .select(`
        *,
        site_users!inner(user_id)
      `)
      .eq('site_users.user_id', userId);

    if (error) {
      console.error('Error fetching sites:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch sites'
        }
      });
    }

    // Get basic metrics for each site
    const sitesWithMetrics = await Promise.all(
      sites.map(async (site) => {
        // Get post counts
        const { count: totalPosts } = await supabase
          .from(TABLES.BLOG_WORKFLOW_STATE)
          .select('*', { count: 'exact', head: true })
          .eq('site_id', site.id);

        const { count: publishedPosts } = await supabase
          .from(TABLES.BLOG_WORKFLOW_STATE)
          .select('*', { count: 'exact', head: true })
          .eq('site_id', site.id)
          .eq('status', 'published');

        const { count: activeWorkflows } = await supabase
          .from(TABLES.WORKFLOW_EXECUTIONS)
          .select('*', { count: 'exact', head: true })
          .eq('site_id', site.id)
          .in('status', ['pending', 'running']);

        return {
          id: site.id,
          name: site.name,
          url: site.url,
          status: site.status,
          healthScore: site.health_score || 0,
          metrics: {
            totalPosts: totalPosts || 0,
            publishedPosts: publishedPosts || 0,
            draftPosts: (totalPosts || 0) - (publishedPosts || 0),
            activeWorkflows: activeWorkflows || 0
          },
          lastUpdated: site.last_updated,
          createdAt: site.created_at,
          settings: site.settings || {}
        };
      })
    );

    res.json({
      sites: sitesWithMetrics
    });
  } catch (error) {
    console.error('Error in sites route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch sites'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}
 * Get specific site details
 */
router.get('/:siteId', checkSiteAccess, async (req, res) => {
  try {
    const { siteId } = req.params;

    // Get site details
    const { data: site, error } = await supabase
      .from(TABLES.SITES)
      .select('*')
      .eq('id', siteId)
      .single();

    if (error || !site) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Site not found'
        }
      });
    }

    // Get detailed metrics
    const { count: totalPosts } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId);

    const { count: publishedPosts } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .eq('status', 'published');

    const { count: draftPosts } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .eq('status', 'draft');

    const { count: activeWorkflows } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .in('status', ['pending', 'running']);

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from(TABLES.WORKFLOW_EXECUTIONS)
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      id: site.id,
      name: site.name,
      url: site.url,
      status: site.status,
      healthScore: site.health_score || 0,
      metrics: {
        totalPosts: totalPosts || 0,
        publishedPosts: publishedPosts || 0,
        draftPosts: draftPosts || 0,
        activeWorkflows: activeWorkflows || 0,
        monthlyViews: site.monthly_views || 0,
        monthlyRevenue: site.monthly_revenue || 0
      },
      lastUpdated: site.last_updated,
      createdAt: site.created_at,
      settings: site.settings || {},
      recentActivity: recentActivity || []
    });
  } catch (error) {
    console.error('Error fetching site details:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch site details'
      }
    });
  }
});

/**
 * PUT /api/v1/sites/{siteId}
 * Update site settings
 */
router.put('/:siteId', checkSiteAccess, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { name, url, settings } = req.body;

    // Validate input
    if (!name && !url && !settings) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one field must be provided for update'
        }
      });
    }

    // Prepare update data
    const updateData = {
      last_updated: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (url) updateData.url = url;
    if (settings) updateData.settings = settings;

    // Update site
    const { data: updatedSite, error } = await supabase
      .from(TABLES.SITES)
      .update(updateData)
      .eq('id', siteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating site:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update site'
        }
      });
    }

    res.json({
      message: 'Site updated successfully',
      site: {
        id: updatedSite.id,
        name: updatedSite.name,
        url: updatedSite.url,
        status: updatedSite.status,
        settings: updatedSite.settings,
        lastUpdated: updatedSite.last_updated
      }
    });
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update site'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/health
 * Get site health score and factors
 */
router.get('/:siteId/health', checkSiteAccess, async (req, res) => {
  try {
    const { siteId } = req.params;

    // Get site health data
    const { data: site, error } = await supabase
      .from(TABLES.SITES)
      .select('health_score, health_factors, last_health_check')
      .eq('id', siteId)
      .single();

    if (error || !site) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Site not found'
        }
      });
    }

    // Calculate health factors (simplified version)
    const factors = [
      {
        name: 'Content Freshness',
        value: 90,
        weight: 0.3,
        description: 'Content is regularly updated'
      },
      {
        name: 'SEO Performance',
        value: 75,
        weight: 0.25,
        description: 'Good keyword rankings'
      },
      {
        name: 'Traffic Growth',
        value: 80,
        weight: 0.2,
        description: 'Steady traffic increase'
      },
      {
        name: 'Revenue Performance',
        value: 85,
        weight: 0.15,
        description: 'Meeting revenue targets'
      },
      {
        name: 'Technical Health',
        value: 95,
        weight: 0.1,
        description: 'Site loads quickly'
      }
    ];

    res.json({
      score: site.health_score || 85,
      factors: site.health_factors || factors,
      lastCalculated: site.last_health_check || new Date().toISOString(),
      recommendations: [
        'Improve SEO meta descriptions',
        'Add more internal links',
        'Optimize images for faster loading'
      ]
    });
  } catch (error) {
    console.error('Error fetching site health:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch site health'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/content-types
 * Get content types configured for this site
 */
router.get('/:siteId/content-types', checkSiteAccess, async (req, res) => {
  try {
    const { siteId } = req.params;

    // Get site content types from settings
    const { data: site, error } = await supabase
      .from(TABLES.SITES)
      .select('settings')
      .eq('id', siteId)
      .single();

    if (error || !site) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Site not found'
        }
      });
    }

    const contentTypes = site.settings?.contentTypes || [];

    res.json({
      contentTypes,
      total: contentTypes.length
    });
  } catch (error) {
    console.error('Error fetching content types:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch content types'
      }
    });
  }
});

/**
 * PUT /api/v1/sites/{siteId}/content-types
 * Update content types for this site
 */
router.put('/:siteId/content-types', checkSiteAccess, [
  body('contentTypes').isArray().withMessage('Content types must be an array'),
  body('contentTypes.*.name').isString().withMessage('Content type name must be a string'),
  body('contentTypes.*.description').optional().isString().withMessage('Description must be a string'),
  body('contentTypes.*.color').optional().isString().withMessage('Color must be a string')
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { contentTypes } = req.body;

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

    // Get current site settings
    const { data: site, error: fetchError } = await supabase
      .from(TABLES.SITES)
      .select('settings')
      .eq('id', siteId)
      .single();

    if (fetchError || !site) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Site not found'
        }
      });
    }

    // Update settings with new content types
    const updatedSettings = {
      ...site.settings,
      contentTypes: contentTypes
    };

    const { data: updatedSite, error: updateError } = await supabase
      .from(TABLES.SITES)
      .update({
        settings: updatedSettings,
        last_updated: new Date().toISOString()
      })
      .eq('id', siteId)
      .select('settings')
      .single();

    if (updateError) {
      console.error('Error updating content types:', updateError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update content types'
        }
      });
    }

    res.json({
      message: 'Content types updated successfully',
      contentTypes: updatedSite.settings.contentTypes,
      total: updatedSite.settings.contentTypes.length
    });
  } catch (error) {
    console.error('Error updating content types:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update content types'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/content-types/usage
 * Get usage statistics for content types on this site
 */
router.get('/:siteId/content-types/usage', checkSiteAccess, async (req, res) => {
  try {
    const { siteId } = req.params;

    // Get content type usage from posts
    const { data: posts, error } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('content_type, status')
      .eq('site_id', siteId);

    if (error) {
      console.error('Error fetching content type usage:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch content type usage'
        }
      });
    }

    // Calculate usage statistics
    const usage = posts.reduce((acc, post) => {
      const contentType = post.content_type || 'unknown';
      if (!acc[contentType]) {
        acc[contentType] = {
          total: 0,
          published: 0,
          draft: 0,
          inProgress: 0
        };
      }
      
      acc[contentType].total++;
      if (post.status === 'published') {
        acc[contentType].published++;
      } else if (post.status === 'draft') {
        acc[contentType].draft++;
      } else {
        acc[contentType].inProgress++;
      }
      
      return acc;
    }, {});

    res.json({
      usage,
      totalPosts: posts.length,
      contentTypes: Object.keys(usage)
    });
  } catch (error) {
    console.error('Error fetching content type usage:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch content type usage'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/content-types/suggestions
 * Get suggested content types based on site theme and existing content
 */
router.get('/:siteId/content-types/suggestions', checkSiteAccess, async (req, res) => {
  try {
    const { siteId } = req.params;

    // Get site details to understand theme
    const { data: site, error: siteError } = await supabase
      .from(TABLES.SITES)
      .select('name, description, settings')
      .eq('id', siteId)
      .single();

    if (siteError || !site) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Site not found'
        }
      });
    }

    // Get existing content types from posts
    const { data: posts, error: postsError } = await supabase
      .from(TABLES.BLOG_WORKFLOW_STATE)
      .select('content_type, title')
      .eq('site_id', siteId);

    if (postsError) {
      console.error('Error fetching posts for suggestions:', postsError);
    }

    // Analyze site name and description for theme
    const siteName = site.name.toLowerCase();
    const siteDescription = (site.description || '').toLowerCase();
    
    // Generate suggestions based on site theme
    const suggestions = generateContentTypeSuggestions(siteName, siteDescription, posts || []);

    res.json({
      suggestions,
      siteTheme: {
        name: site.name,
        description: site.description,
        detectedThemes: suggestions.themes
      },
      existingContentTypes: posts ? [...new Set(posts.map(p => p.content_type).filter(Boolean))] : []
    });
  } catch (error) {
    console.error('Error generating content type suggestions:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate suggestions'
      }
    });
  }
});

/**
 * Generate content type suggestions based on site theme
 */
function generateContentTypeSuggestions(siteName, siteDescription, posts) {
  const suggestions = [];
  const themes = [];

  // Detect themes from site name and description
  if (siteName.includes('gift') || siteDescription.includes('gift')) {
    themes.push('gift');
    suggestions.push(
      { name: 'gift-guide', description: 'Gift recommendation articles', color: '#3B82F6' },
      { name: 'product-review', description: 'Product reviews and recommendations', color: '#10B981' },
      { name: 'seasonal', description: 'Holiday and seasonal gift guides', color: '#F59E0B' },
      { name: 'educational', description: 'Gift-giving tips and guides', color: '#8B5CF6' }
    );
  }

  if (siteName.includes('cannabis') || siteDescription.includes('cannabis') || 
      siteName.includes('weed') || siteDescription.includes('weed')) {
    themes.push('cannabis');
    suggestions.push(
      { name: 'product-review', description: 'Product reviews and recommendations', color: '#10B981' },
      { name: 'strain-guide', description: 'Cannabis strain information', color: '#3B82F6' },
      { name: 'educational', description: 'Cannabis education and guides', color: '#8B5CF6' },
      { name: 'legal-updates', description: 'Legal and regulatory updates', color: '#EF4444' },
      { name: 'wellness-tips', description: 'Health and wellness tips', color: '#06B6D4' }
    );
  }

  if (siteName.includes('baby') || siteDescription.includes('baby') ||
      siteName.includes('parent') || siteDescription.includes('parent')) {
    themes.push('parenting');
    suggestions.push(
      { name: 'development-guide', description: 'Child development guides', color: '#3B82F6' },
      { name: 'product-review', description: 'Baby product reviews', color: '#10B981' },
      { name: 'parenting-tips', description: 'Parenting advice and tips', color: '#8B5CF6' },
      { name: 'safety-guide', description: 'Safety and health information', color: '#EF4444' },
      { name: 'feeding-guide', description: 'Feeding and nutrition guides', color: '#F59E0B' }
    );
  }

  if (siteName.includes('tech') || siteDescription.includes('tech') ||
      siteName.includes('software') || siteDescription.includes('software')) {
    themes.push('technology');
    suggestions.push(
      { name: 'tutorial', description: 'Step-by-step tutorials', color: '#3B82F6' },
      { name: 'product-review', description: 'Tech product reviews', color: '#10B981' },
      { name: 'news', description: 'Technology news and updates', color: '#F59E0B' },
      { name: 'how-to', description: 'How-to guides and tips', color: '#8B5CF6' },
      { name: 'comparison', description: 'Product comparisons', color: '#06B6D4' }
    );
  }

  // Generic suggestions if no specific theme detected
  if (themes.length === 0) {
    themes.push('general');
    suggestions.push(
      { name: 'article', description: 'General articles and content', color: '#3B82F6' },
      { name: 'product-review', description: 'Product reviews and recommendations', color: '#10B981' },
      { name: 'educational', description: 'Educational content and guides', color: '#8B5CF6' },
      { name: 'news', description: 'News and updates', color: '#F59E0B' },
      { name: 'how-to', description: 'How-to guides and tutorials', color: '#06B6D4' }
    );
  }

  // Add suggestions based on existing content types
  const existingTypes = [...new Set(posts.map(p => p.content_type).filter(Boolean))];
  existingTypes.forEach(type => {
    if (!suggestions.find(s => s.name === type)) {
      suggestions.push({
        name: type,
        description: `Existing content type: ${type}`,
        color: '#6B7280'
      });
    }
  });

  return {
    suggestions,
    themes
  };
}

module.exports = router; 