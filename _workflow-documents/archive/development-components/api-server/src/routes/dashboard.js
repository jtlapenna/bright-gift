const express = require('express');
const { query, validationResult } = require('express-validator');
const { supabase, TABLES } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/v1/dashboard/overview
 * Get global dashboard overview across all user's sites
 */
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all sites for the user
    const { data: sites, error: sitesError } = await supabase
      .from(TABLES.SITES)
      .select('*')
      .eq('user_id', userId);

    if (sitesError) {
      console.error('Error fetching sites:', sitesError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch sites'
        }
      });
    }

    if (!sites || sites.length === 0) {
      return res.json({
        totalSites: 0,
        totalPosts: 0,
        totalWorkflows: 0,
        avgHealthScore: 0,
        totalRevenue: 0,
        totalViews: 0,
        recentActivity: [],
        topPerformingSites: [],
        systemHealth: 'healthy'
      });
    }

    const siteIds = sites.map(site => site.id);

    // Get aggregate metrics across all sites
    const [
      postsData,
      workflowsData,
      analyticsData,
      activityData
    ] = await Promise.all([
      // Get posts data
      supabase
        .from(TABLES.BLOG_WORKFLOW_STATE)
        .select('site_id, status, created_at')
        .in('site_id', siteIds),

      // Get workflows data
      supabase
        .from(TABLES.WORKFLOW_EXECUTIONS)
        .select('site_id, status, started_at')
        .in('site_id', siteIds)
        .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

      // Get analytics data
      supabase
        .from('site_performance_analytics')
        .select('site_id, total_page_views, total_revenue, date')
        .in('site_id', siteIds)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),

      // Get recent activity
      supabase
        .from('user_actions')
        .select('site_id, action, timestamp, action_details')
        .in('site_id', siteIds)
        .order('timestamp', { ascending: false })
        .limit(20)
    ]);

    // Calculate aggregate metrics
    const totalPosts = postsData.data?.length || 0;
    const publishedPosts = postsData.data?.filter(p => p.status === 'published').length || 0;
    const draftPosts = postsData.data?.filter(p => p.status === 'draft').length || 0;

    const totalWorkflows = workflowsData.data?.length || 0;
    const activeWorkflows = workflowsData.data?.filter(w => w.status === 'running').length || 0;
    const completedWorkflows = workflowsData.data?.filter(w => w.status === 'completed').length || 0;

    const totalViews = analyticsData.data?.reduce((sum, a) => sum + (a.total_page_views || 0), 0) || 0;
    const totalRevenue = analyticsData.data?.reduce((sum, a) => sum + (a.total_revenue || 0), 0) || 0;

    const avgHealthScore = sites.reduce((sum, site) => sum + (site.health_score || 0), 0) / sites.length;

    // Get top performing sites
    const sitePerformance = sites.map(site => {
      const sitePosts = postsData.data?.filter(p => p.site_id === site.id) || [];
      const siteWorkflows = workflowsData.data?.filter(w => w.site_id === site.id) || [];
      const siteAnalytics = analyticsData.data?.filter(a => a.site_id === site.id) || [];

      return {
        id: site.id,
        name: site.name,
        url: site.url,
        healthScore: site.health_score || 0,
        postsCount: sitePosts.length,
        publishedPosts: sitePosts.filter(p => p.status === 'published').length,
        activeWorkflows: siteWorkflows.filter(w => w.status === 'running').length,
        totalViews: siteAnalytics.reduce((sum, a) => sum + (a.total_page_views || 0), 0),
        totalRevenue: siteAnalytics.reduce((sum, a) => sum + (a.total_revenue || 0), 0)
      };
    });

    const topPerformingSites = sitePerformance
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 5);

    // Get recent activity across all sites
    const recentActivity = activityData.data?.map(activity => {
      const site = sites.find(s => s.id === activity.site_id);
      return {
        id: activity.id,
        type: activity.action,
        message: generateActivityMessage(activity),
        timestamp: activity.timestamp,
        siteId: activity.site_id,
        siteName: site?.name || 'Unknown Site',
        metadata: activity.action_details || {}
      };
    }) || [];

    // Determine system health
    const systemHealth = determineSystemHealth({
      avgHealthScore,
      activeWorkflows,
      completedWorkflows,
      totalWorkflows
    });

    res.json({
      totalSites: sites.length,
      totalPosts,
      publishedPosts,
      draftPosts,
      totalWorkflows,
      activeWorkflows,
      completedWorkflows,
      avgHealthScore: Math.round(avgHealthScore * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalViews,
      recentActivity,
      topPerformingSites,
      systemHealth,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days: 30
      }
    });
  } catch (error) {
    console.error('Error in dashboard overview route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch dashboard overview'
      }
    });
  }
});

/**
 * GET /api/v1/dashboard/global-analytics
 * Get global analytics across all sites
 */
router.get('/global-analytics', authenticateToken, [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d', startDate, endDate } = req.query;

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

    // Get user's sites
    const { data: sites, error: sitesError } = await supabase
      .from(TABLES.SITES)
      .select('id')
      .eq('user_id', userId);

    if (sitesError || !sites || sites.length === 0) {
      return res.json({
        traffic: { totalViews: 0, uniqueVisitors: 0, trends: [] },
        revenue: { totalRevenue: 0, trends: [] },
        content: { totalPosts: 0, publishedPosts: 0, trends: [] },
        workflows: { totalWorkflows: 0, successRate: 0, trends: [] }
      });
    }

    const siteIds = sites.map(site => site.id);

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - getPeriodDays(period) * 24 * 60 * 60 * 1000);

    // Get analytics data
    const [analyticsData, postsData, workflowsData] = await Promise.all([
      // Site performance analytics
      supabase
        .from('site_performance_analytics')
        .select('*')
        .in('site_id', siteIds)
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
        .order('date', { ascending: true }),

      // Blog posts
      supabase
        .from(TABLES.BLOG_WORKFLOW_STATE)
        .select('site_id, status, created_at')
        .in('site_id', siteIds)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString()),

      // Workflow executions
      supabase
        .from(TABLES.WORKFLOW_EXECUTIONS)
        .select('site_id, status, started_at, completed_at')
        .in('site_id', siteIds)
        .gte('started_at', start.toISOString())
        .lte('started_at', end.toISOString())
    ]);

    // Calculate global metrics
    const traffic = calculateGlobalTrafficMetrics(analyticsData.data || []);
    const revenue = calculateGlobalRevenueMetrics(analyticsData.data || []);
    const content = calculateGlobalContentMetrics(postsData.data || []);
    const workflows = calculateGlobalWorkflowMetrics(workflowsData.data || []);

    res.json({
      traffic,
      revenue,
      content,
      workflows,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('Error in global analytics route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch global analytics'
      }
    });
  }
});

/**
 * GET /api/v1/dashboard/recent-activity
 * Get recent activity across all sites
 */
router.get('/recent-activity', authenticateToken, [
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

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

    // Get user's sites
    const { data: sites, error: sitesError } = await supabase
      .from(TABLES.SITES)
      .select('id, name')
      .eq('user_id', userId);

    if (sitesError || !sites || sites.length === 0) {
      return res.json({
        activities: [],
        pagination: {
          page: 1,
          limit: parseInt(limit),
          total: 0,
          totalPages: 0
        }
      });
    }

    const siteIds = sites.map(site => site.id);

    // Get recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from('user_actions')
      .select(`
        *,
        users:user_id(id, name, email, avatar)
      `)
      .in('site_id', siteIds)
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch recent activity'
        }
      });
    }

    // Transform activities
    const transformedActivities = activities.map(activity => {
      const site = sites.find(s => s.id === activity.site_id);
      const user = activity.users || {};
      
      return {
        id: activity.id,
        type: activity.action,
        message: generateActivityMessage(activity),
        timestamp: activity.timestamp,
        siteId: activity.site_id,
        siteName: site?.name || 'Unknown Site',
        userId: activity.user_id,
        user: {
          name: user.name || 'Unknown User',
          avatar: user.avatar || null
        },
        metadata: activity.action_details || {},
        postId: activity.post_id
      };
    });

    res.json({
      activities: transformedActivities,
      pagination: {
        page: 1,
        limit: parseInt(limit),
        total: activities.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error in recent activity route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch recent activity'
      }
    });
  }
});

// Helper functions
function getPeriodDays(period) {
  const periods = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };
  return periods[period] || 30;
}

function calculateGlobalTrafficMetrics(data) {
  if (!data.length) {
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      trends: []
    };
  }

  const totalViews = data.reduce((sum, item) => sum + (item.total_page_views || 0), 0);
  const uniqueVisitors = data.reduce((sum, item) => sum + (item.unique_visitors || 0), 0);

  const trends = data.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = { views: 0, visitors: 0 };
    }
    acc[date].views += item.total_page_views || 0;
    acc[date].visitors += item.unique_visitors || 0;
    return acc;
  }, {});

  const trendsArray = Object.entries(trends).map(([date, metrics]) => ({
    date,
    views: metrics.views,
    visitors: metrics.visitors
  })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalViews,
    uniqueVisitors,
    trends: trendsArray
  };
}

function calculateGlobalRevenueMetrics(data) {
  if (!data.length) {
    return {
      totalRevenue: 0,
      affiliateRevenue: 0,
      adRevenue: 0,
      trends: []
    };
  }

  const totalRevenue = data.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
  const affiliateRevenue = data.reduce((sum, item) => sum + (item.affiliate_revenue || 0), 0);
  const adRevenue = totalRevenue - affiliateRevenue;

  const trends = data.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = { revenue: 0 };
    }
    acc[date].revenue += item.total_revenue || 0;
    return acc;
  }, {});

  const trendsArray = Object.entries(trends).map(([date, metrics]) => ({
    date,
    revenue: metrics.revenue
  })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue,
    affiliateRevenue,
    adRevenue,
    trends: trendsArray
  };
}

function calculateGlobalContentMetrics(data) {
  if (!data.length) {
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      trends: [],
      contentTypeBreakdown: {}
    };
  }

  const totalPosts = data.length;
  const publishedPosts = data.filter(post => post.status === 'published').length;
  const draftPosts = data.filter(post => post.status === 'draft').length;

  // Content type breakdown
  const contentTypeBreakdown = data.reduce((acc, post) => {
    const contentType = post.content_type || 'unknown';
    if (!acc[contentType]) {
      acc[contentType] = {
        count: 0,
        published: 0,
        draft: 0,
        inProgress: 0
      };
    }
    
    acc[contentType].count++;
    if (post.status === 'published') {
      acc[contentType].published++;
    } else if (post.status === 'draft') {
      acc[contentType].draft++;
    } else {
      acc[contentType].inProgress++;
    }
    
    return acc;
  }, {});

  const trends = data.reduce((acc, post) => {
    const date = post.created_at.split('T')[0];
    if (!acc[date]) {
      acc[date] = { total: 0, published: 0, draft: 0 };
    }
    acc[date].total++;
    if (post.status === 'published') acc[date].published++;
    if (post.status === 'draft') acc[date].draft++;
    return acc;
  }, {});

  const trendsArray = Object.entries(trends).map(([date, metrics]) => ({
    date,
    total: metrics.total,
    published: metrics.published,
    draft: metrics.draft
  })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    trends: trendsArray,
    contentTypeBreakdown
  };
}

function calculateGlobalWorkflowMetrics(data) {
  if (!data.length) {
    return {
      totalWorkflows: 0,
      successRate: 0,
      avgDuration: 0,
      trends: []
    };
  }

  const totalWorkflows = data.length;
  const successful = data.filter(w => w.status === 'completed').length;
  const successRate = (successful / totalWorkflows) * 100;

  const avgDuration = data.reduce((sum, w) => {
    if (w.completed_at && w.started_at) {
      const duration = new Date(w.completed_at) - new Date(w.started_at);
      return sum + duration;
    }
    return sum;
  }, 0) / successful;

  const trends = data.reduce((acc, workflow) => {
    const date = workflow.started_at.split('T')[0];
    if (!acc[date]) {
      acc[date] = { total: 0, successful: 0 };
    }
    acc[date].total++;
    if (workflow.status === 'completed') acc[date].successful++;
    return acc;
  }, {});

  const trendsArray = Object.entries(trends).map(([date, metrics]) => ({
    date,
    total: metrics.total,
    successful: metrics.successful,
    successRate: metrics.total > 0 ? (metrics.successful / metrics.total) * 100 : 0
  })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalWorkflows,
    successRate: Math.round(successRate * 100) / 100,
    avgDuration: Math.round(avgDuration / 1000), // Convert to seconds
    trends: trendsArray
  };
}

function determineSystemHealth(metrics) {
  const { avgHealthScore, activeWorkflows, completedWorkflows, totalWorkflows } = metrics;
  
  if (avgHealthScore >= 80 && activeWorkflows < 10) {
    return 'excellent';
  } else if (avgHealthScore >= 60 && activeWorkflows < 20) {
    return 'good';
  } else if (avgHealthScore >= 40) {
    return 'fair';
  } else {
    return 'poor';
  }
}

function generateActivityMessage(activity) {
  const actionMessages = {
    'post_created': 'Created a new blog post',
    'post_updated': 'Updated a blog post',
    'post_published': 'Published a blog post',
    'post_approved': 'Approved a blog post',
    'post_rejected': 'Rejected a blog post',
    'workflow_started': 'Started a new workflow',
    'workflow_completed': 'Completed a workflow',
    'workflow_failed': 'Workflow failed',
    'workflow_cancelled': 'Cancelled a workflow',
    'seo_research_completed': 'Completed SEO research',
    'content_generated': 'Generated new content',
    'images_created': 'Created images for content',
    'site_settings_updated': 'Updated site settings',
    'user_invited': 'Invited a new user',
    'analytics_exported': 'Exported analytics data'
  };

  const baseMessage = actionMessages[activity.action] || `Performed action: ${activity.action}`;
  
  if (activity.post_id && activity.action_details?.post_title) {
    return `${baseMessage}: "${activity.action_details.post_title}"`;
  }

  return baseMessage;
}

module.exports = router; 