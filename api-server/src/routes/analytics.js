const express = require('express');
const { query, validationResult } = require('express-validator');
const { supabase, TABLES } = require('../config/supabase');
const { checkSiteAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/v1/sites/{siteId}/analytics
 * Get comprehensive site analytics
 */
router.get('/', checkSiteAccess, [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const { siteId } = req.params;
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

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - getPeriodDays(period) * 24 * 60 * 60 * 1000);

    // Get traffic analytics
    const { data: trafficData, error: trafficError } = await supabase
      .from('site_performance_analytics')
      .select('*')
      .eq('site_id', siteId)
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', end.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (trafficError) {
      console.error('Error fetching traffic data:', trafficError);
    }

    // Get post performance data
    const { data: postData, error: postError } = await supabase
      .from('content_performance_insights')
      .select('*')
      .eq('site_id', siteId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    if (postError) {
      console.error('Error fetching post data:', postError);
    }

    // Get workflow analytics
    const { data: workflowData, error: workflowError } = await supabase
      .from('workflow_execution_analytics')
      .select('*')
      .eq('site_id', siteId)
      .gte('started_at', start.toISOString())
      .lte('started_at', end.toISOString());

    if (workflowError) {
      console.error('Error fetching workflow data:', workflowError);
    }

    // Calculate aggregated metrics
    const traffic = calculateTrafficMetrics(trafficData || []);
    const revenue = calculateRevenueMetrics(trafficData || []);
    const content = calculateContentMetrics(postData || []);
    const seo = calculateSEOMetrics(postData || []);

    res.json({
      traffic,
      revenue,
      content,
      seo,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('Error in analytics route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch analytics'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/posts/{postId}/analytics
 * Get analytics for a specific post
 */
router.get('/posts/:postId', checkSiteAccess, async (req, res) => {
  try {
    const { siteId, postId } = req.params;

    // Get post analytics
    const { data: analytics, error } = await supabase
      .from('post_analytics')
      .select('*')
      .eq('post_id', postId)
      .eq('site_id', siteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Post analytics not found'
          }
        });
      }
      throw error;
    }

    // Get social performance data
    const { data: socialData } = await supabase
      .from('post_social_content')
      .select('*')
      .eq('post_id', postId);

    // Get SEO data
    const { data: seoData } = await supabase
      .from('post_seo_data')
      .select('*')
      .eq('post_id', postId)
      .single();

    res.json({
      postId,
      siteId,
      views: analytics.views || 0,
      uniqueVisitors: analytics.unique_visitors || 0,
      pageViews: analytics.page_views || 0,
      likes: analytics.likes || 0,
      shares: analytics.shares || 0,
      comments: analytics.comments || 0,
      bounceRate: analytics.bounce_rate || 0,
      avgTimeOnPage: analytics.avg_time_on_page || 0,
      revenue: analytics.revenue || 0,
      conversionRate: analytics.conversion_rate || 0,
      social: socialData ? socialData.map(post => ({
        platform: post.platform,
        content: post.content,
        engagement: post.engagement || {},
        publishedAt: post.published_at
      })) : [],
      seo: seoData ? {
        score: seoData.seo_score || 0,
        keywords: seoData.keywords || [],
        metaTitle: seoData.meta_title,
        metaDescription: seoData.meta_description,
        readabilityScore: seoData.readability_score || 0
      } : null,
      lastUpdated: analytics.last_updated
    });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch post analytics'
      }
    });
  }
});

/**
 * GET /api/v1/sites/{siteId}/workflows/analytics
 * Get workflow performance analytics
 */
router.get('/workflows', checkSiteAccess, [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']),
  query('phase').optional().isString()
], async (req, res) => {
  try {
    const { siteId } = req.params;
    const { period = '30d', phase } = req.query;

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

    // Calculate date range
    const end = new Date();
    const start = new Date(end.getTime() - getPeriodDays(period) * 24 * 60 * 60 * 1000);

    // Build query
    let query = supabase
      .from('workflow_execution_analytics')
      .select('*')
      .eq('site_id', siteId)
      .gte('started_at', start.toISOString())
      .lte('started_at', end.toISOString());

    if (phase) {
      query = query.eq('phase_id', phase);
    }

    const { data: workflowData, error } = await query;

    if (error) {
      console.error('Error fetching workflow analytics:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch workflow analytics'
        }
      });
    }

    // Calculate workflow metrics
    const metrics = calculateWorkflowMetrics(workflowData || []);

    res.json({
      siteId,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      },
      totalWorkflows: workflowData.length,
      successRate: metrics.successRate,
      avgDuration: metrics.avgDuration,
      avgPerformanceScore: metrics.avgPerformanceScore,
      phaseBreakdown: metrics.phaseBreakdown,
      errorAnalysis: metrics.errorAnalysis,
      performanceTrends: metrics.performanceTrends
    });
  } catch (error) {
    console.error('Error in workflow analytics route:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch workflow analytics'
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

function calculateTrafficMetrics(data) {
  if (!data.length) {
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      trends: []
    };
  }

  const totalViews = data.reduce((sum, item) => sum + (item.total_page_views || 0), 0);
  const uniqueVisitors = data.reduce((sum, item) => sum + (item.unique_visitors || 0), 0);
  const pageViews = data.reduce((sum, item) => sum + (item.total_page_views || 0), 0);
  const avgBounceRate = data.reduce((sum, item) => sum + (item.avg_bounce_rate || 0), 0) / data.length;
  const avgSessionDuration = data.reduce((sum, item) => sum + (item.avg_session_duration || 0), 0) / data.length;

  const trends = data.map(item => ({
    date: item.date,
    views: item.total_page_views || 0,
    visitors: item.unique_visitors || 0
  }));

  return {
    totalViews,
    uniqueVisitors,
    pageViews,
    bounceRate: avgBounceRate,
    avgSessionDuration,
    trends
  };
}

function calculateRevenueMetrics(data) {
  if (!data.length) {
    return {
      totalRevenue: 0,
      affiliateRevenue: 0,
      adRevenue: 0,
      conversionRate: 0,
      trends: []
    };
  }

  const totalRevenue = data.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
  const affiliateRevenue = data.reduce((sum, item) => sum + (item.affiliate_revenue || 0), 0);
  const adRevenue = totalRevenue - affiliateRevenue;
  const avgConversionRate = data.reduce((sum, item) => sum + (item.conversion_rate || 0), 0) / data.length;

  const trends = data.map(item => ({
    date: item.date,
    revenue: item.total_revenue || 0,
    conversions: Math.round((item.total_revenue || 0) * (item.conversion_rate || 0))
  }));

  return {
    totalRevenue,
    affiliateRevenue,
    adRevenue,
    conversionRate: avgConversionRate,
    trends
  };
}

function calculateContentMetrics(data) {
  if (!data.length) {
    return {
      topPosts: [],
      postPerformance: {
        published: 0,
        draft: 0,
        avgViewsPerPost: 0
      },
      contentTypeBreakdown: {}
    };
  }

  const topPosts = data
    .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
    .slice(0, 10)
    .map(post => ({
      id: post.post_id,
      title: post.title || 'Untitled',
      contentType: post.content_type,
      views: post.views || 0,
      revenue: post.revenue || 0,
      performanceScore: post.performance_score || 0
    }));

  const published = data.filter(post => post.status === 'published').length;
  const draft = data.filter(post => post.status === 'draft').length;
  const avgViewsPerPost = data.reduce((sum, post) => sum + (post.views || 0), 0) / data.length;

  // Content type breakdown
  const contentTypeBreakdown = data.reduce((acc, post) => {
    const contentType = post.content_type || 'unknown';
    if (!acc[contentType]) {
      acc[contentType] = {
        count: 0,
        totalViews: 0,
        totalRevenue: 0,
        avgViews: 0,
        avgRevenue: 0,
        published: 0,
        draft: 0
      };
    }
    
    acc[contentType].count++;
    acc[contentType].totalViews += post.views || 0;
    acc[contentType].totalRevenue += post.revenue || 0;
    
    if (post.status === 'published') {
      acc[contentType].published++;
    } else if (post.status === 'draft') {
      acc[contentType].draft++;
    }
    
    return acc;
  }, {});

  // Calculate averages for each content type
  Object.keys(contentTypeBreakdown).forEach(type => {
    const typeData = contentTypeBreakdown[type];
    typeData.avgViews = Math.round(typeData.totalViews / typeData.count);
    typeData.avgRevenue = Math.round((typeData.totalRevenue / typeData.count) * 100) / 100;
  });

  return {
    topPosts,
    postPerformance: {
      published,
      draft,
      avgViewsPerPost: Math.round(avgViewsPerPost)
    },
    contentTypeBreakdown
  };
}

function calculateSEOMetrics(data) {
  if (!data.length) {
    return {
      organicTraffic: 0,
      keywords: 0,
      avgPosition: 0,
      clickThroughRate: 0
    };
  }

  const organicTraffic = data.reduce((sum, post) => sum + (post.organic_traffic || 0), 0);
  const keywords = data.reduce((sum, post) => sum + ((post.keywords && post.keywords.length) || 0), 0);
  const avgPosition = data.reduce((sum, post) => sum + (post.avg_position || 0), 0) / data.length;
  const avgCTR = data.reduce((sum, post) => sum + (post.click_through_rate || 0), 0) / data.length;

  return {
    organicTraffic,
    keywords,
    avgPosition: Math.round(avgPosition * 100) / 100,
    clickThroughRate: Math.round(avgCTR * 1000) / 1000
  };
}

function calculateWorkflowMetrics(data) {
  if (!data.length) {
    return {
      successRate: 0,
      avgDuration: 0,
      avgPerformanceScore: 0,
      phaseBreakdown: {},
      errorAnalysis: {},
      performanceTrends: []
    };
  }

  const successful = data.filter(w => w.status === 'completed').length;
  const successRate = (successful / data.length) * 100;

  const avgDuration = data.reduce((sum, w) => {
    const duration = w.duration_seconds || 0;
    return sum + duration;
  }, 0) / data.length;

  const avgPerformanceScore = data.reduce((sum, w) => {
    const score = w.performance_score || 0;
    return sum + score;
  }, 0) / data.length;

  // Phase breakdown
  const phaseBreakdown = data.reduce((acc, w) => {
    const phase = w.phase_id || 'unknown';
    if (!acc[phase]) {
      acc[phase] = { total: 0, successful: 0, avgDuration: 0 };
    }
    acc[phase].total++;
    if (w.status === 'completed') acc[phase].successful++;
    acc[phase].avgDuration += w.duration_seconds || 0;
    return acc;
  }, {});

  // Calculate averages for phases
  Object.keys(phaseBreakdown).forEach(phase => {
    const phaseData = phaseBreakdown[phase];
    phaseData.avgDuration = phaseData.avgDuration / phaseData.total;
    phaseData.successRate = (phaseData.successful / phaseData.total) * 100;
  });

  // Error analysis
  const errorAnalysis = data
    .filter(w => w.status === 'failed')
    .reduce((acc, w) => {
      const errorType = w.error_message ? 'execution_error' : 'timeout';
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {});

  // Performance trends (last 7 days)
  const trends = [];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  last7Days.forEach(date => {
    const dayData = data.filter(w => 
      w.started_at && w.started_at.startsWith(date)
    );
    const daySuccessRate = dayData.length > 0 
      ? (dayData.filter(w => w.status === 'completed').length / dayData.length) * 100 
      : 0;
    
    trends.push({
      date,
      successRate: Math.round(daySuccessRate * 100) / 100,
      workflows: dayData.length
    });
  });

  return {
    successRate: Math.round(successRate * 100) / 100,
    avgDuration: Math.round(avgDuration),
    avgPerformanceScore: Math.round(avgPerformanceScore * 100) / 100,
    phaseBreakdown,
    errorAnalysis,
    performanceTrends: trends
  };
}

module.exports = router; 