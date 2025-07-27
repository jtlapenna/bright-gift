const express = require('express');
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

module.exports = router; 