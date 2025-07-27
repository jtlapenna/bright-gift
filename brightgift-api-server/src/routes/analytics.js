const express = require('express');
const { authenticateToken, checkBrightGiftAccess } = require('../middleware/auth');
const brightGiftService = require('../services/brightgiftService');

const router = express.Router();

/**
 * GET /api/v1/brightgift/analytics
 * Get Bright-Gift analytics data
 */
router.get('/', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const filters = {
      period: req.query.period || '30d',
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const analytics = await brightGiftService.getAnalytics(filters);

    res.json({
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch analytics'
      }
    });
  }
});

/**
 * GET /api/v1/brightgift/analytics/posts/:id
 * Get analytics for specific post
 */
router.get('/posts/:id', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await brightGiftService.getPost(id);

    // Calculate post-specific analytics
    const postAnalytics = {
      post_id: post.post_id,
      title: post.title,
      status: post.status,
      content_type: post.content_type,
      recipient: post.recipient,
      budget: post.budget,
      occasion: post.occasion,
      views: post.views || 0,
      revenue: post.revenue || 0,
      seo_score: post.seo_score || 0,
      readability_score: post.readability_score || 0,
      word_count: post.word_count || 0,
      created_at: post.created_at,
      last_updated: post.last_updated,
      performance_metrics: {
        conversion_rate: post.views > 0 ? (post.revenue / post.views) * 100 : 0,
        avg_time_on_page: post.avg_time_on_page || 0,
        bounce_rate: post.bounce_rate || 0
      }
    };

    res.json({
      data: postAnalytics
    });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    if (error.message === 'Post not found') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Post not found'
        }
      });
    }
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch post analytics'
      }
    });
  }
});

/**
 * GET /api/v1/brightgift/analytics/affiliates
 * Get affiliate performance analytics
 */
router.get('/affiliates', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    // Mock affiliate analytics data (replace with real implementation)
    const affiliateAnalytics = {
      total_revenue: 2400.50,
      total_clicks: 12500,
      total_conversions: 562,
      avg_conversion_rate: 0.045,
      platforms: {
        amazon: {
          revenue: 1800.25,
          clicks: 8500,
          conversions: 425,
          conversion_rate: 0.05
        },
        etsy: {
          revenue: 350.75,
          clicks: 2200,
          conversions: 88,
          conversion_rate: 0.04
        },
        shopify: {
          revenue: 249.50,
          clicks: 1800,
          conversions: 49,
          conversion_rate: 0.027
        }
      },
      top_performing_posts: [
        {
          post_id: 'post-001',
          title: 'Best Gifts for Tech Lovers in 2024',
          revenue: 450.25,
          clicks: 1250,
          conversions: 56
        },
        {
          post_id: 'post-002',
          title: 'Unique Gift Ideas Under $50',
          revenue: 320.75,
          clicks: 980,
          conversions: 42
        }
      ]
    };

    res.json({
      data: affiliateAnalytics
    });
  } catch (error) {
    console.error('Error fetching affiliate analytics:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch affiliate analytics'
      }
    });
  }
});

/**
 * GET /api/v1/brightgift/analytics/seasonal
 * Get seasonal performance analytics
 */
router.get('/seasonal', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    // Mock seasonal analytics data (replace with real implementation)
    const seasonalAnalytics = {
      year: year,
      total_revenue: 8500.75,
      total_views: 45000,
      seasonal_breakdown: {
        q1: {
          revenue: 1200.50,
          views: 8500,
          top_occasions: ['valentines-day', 'birthday', 'anniversary']
        },
        q2: {
          revenue: 1800.25,
          views: 12000,
          top_occasions: ['mothers-day', 'fathers-day', 'graduation']
        },
        q3: {
          revenue: 2200.75,
          views: 15000,
          top_occasions: ['summer-birthday', 'back-to-school', 'wedding']
        },
        q4: {
          revenue: 3298.25,
          views: 9500,
          top_occasions: ['christmas', 'hanukkah', 'new-year']
        }
      },
      top_performing_occasions: [
        {
          occasion: 'christmas',
          revenue: 1800.50,
          views: 8500,
          conversion_rate: 0.052
        },
        {
          occasion: 'birthday',
          revenue: 1200.25,
          views: 12000,
          conversion_rate: 0.035
        },
        {
          occasion: 'valentines-day',
          revenue: 950.75,
          views: 6800,
          conversion_rate: 0.041
        }
      ]
    };

    res.json({
      data: seasonalAnalytics
    });
  } catch (error) {
    console.error('Error fetching seasonal analytics:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch seasonal analytics'
      }
    });
  }
});

module.exports = router; 