const express = require('express');
const { body } = require('express-validator'); // Keep for type hints, but remove from middleware
const { authenticateToken, checkBrightGiftAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/v1/brightgift/content-types
 * Get Bright-Gift content types
 */
router.get('/', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    // Updated Bright-Gift content types optimized for maximum traffic
    const contentTypes = [
      {
        name: 'gift-guide',
        description: 'Core traffic driver - curated gift recommendations by category, recipient, or occasion',
        color: '#3B82F6',
        trafficType: 'SEO',
        examples: ['Best Gifts for Tech Lovers', 'Unique Gifts Under $50']
      },
      {
        name: 'seasonal',
        description: 'Holiday and time-sensitive content for peak traffic during gift-giving seasons',
        color: '#F59E0B',
        trafficType: 'Seasonal',
        examples: ['Christmas Gift Guide 2024', 'Valentine\'s Day Gifts for Him']
      },
      {
        name: 'educational',
        description: 'Psychology and relationship content for social media sharing and engagement',
        color: '#8B5CF6',
        trafficType: 'Social',
        examples: ['Psychology of Gift-Giving', 'How to Choose the Perfect Gift']
      },
      {
        name: 'product-review',
        description: 'Product-specific recommendations for affiliate revenue and commercial intent',
        color: '#10B981',
        trafficType: 'Affiliate',
        examples: ['Best Coffee Makers for Coffee Lovers', 'Top Gaming Headsets 2024']
      },
      {
        name: 'data-driven',
        description: 'Statistics and research content for authority building and backlinks',
        color: '#EF4444',
        trafficType: 'Authority',
        examples: ['Gift-Giving Statistics 2024', 'What People Really Want for Christmas']
      },
      {
        name: 'how-to',
        description: 'Educational content for long-tail keyword traffic and decision-making',
        color: '#06B6D4',
        trafficType: 'Long-tail',
        examples: ['How to Wrap Gifts Like a Pro', 'How to Choose a Wedding Gift']
      },
      {
        name: 'comparison',
        description: 'Comparison content for decision-making traffic and affiliate revenue',
        color: '#84CC16',
        trafficType: 'Decision',
        examples: ['Gift Cards vs Physical Gifts', 'Amazon vs Etsy for Gifts']
      },
      {
        name: 'trending',
        description: 'Viral and current events content for social media amplification',
        color: '#EC4899',
        trafficType: 'Viral',
        examples: ['TikTok Viral Gifts 2024', 'Gifts Inspired by Popular TV Shows']
      }
    ];

    res.json({
      contentTypes,
      total: contentTypes.length,
      trafficStrategy: {
        seo: ['gift-guide', 'seasonal', 'how-to', 'comparison'],
        social: ['educational', 'trending', 'data-driven'],
        affiliate: ['product-review', 'gift-guide', 'comparison'],
        authority: ['data-driven', 'educational']
      }
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
 * PUT /api/v1/brightgift/content-types
 * Update Bright-Gift content types
 */
router.put('/', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const { contentTypes } = req.body;

    // In a real implementation, you would save this to the database
    // For now, we'll just return the updated content types
    const updatedContentTypes = contentTypes || [
      'gift-guide', 'seasonal', 'educational', 'product-review', 
      'data-driven', 'how-to', 'comparison', 'trending'
    ];

    res.json({
      message: 'Content types updated successfully',
      contentTypes: updatedContentTypes,
      total: updatedContentTypes.length
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
 * GET /api/v1/brightgift/content-types/usage
 * Get content type usage statistics
 */
router.get('/usage', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    // Mock usage statistics (replace with real implementation)
    const usage = {
      'gift-guide': {
        count: 45,
        published: 38,
        draft: 5,
        inProgress: 2,
        totalViews: 12500,
        totalRevenue: 1800.50
      },
      'product-review': {
        count: 28,
        published: 25,
        draft: 2,
        inProgress: 1,
        totalViews: 8500,
        totalRevenue: 1200.75
      },
      'seasonal': {
        count: 32,
        published: 30,
        draft: 1,
        inProgress: 1,
        totalViews: 15000,
        totalRevenue: 2200.25
      },
      'educational': {
        count: 18,
        published: 15,
        draft: 2,
        inProgress: 1,
        totalViews: 6800,
        totalRevenue: 950.50
      },
      'budget-guide': {
        count: 22,
        published: 20,
        draft: 1,
        inProgress: 1,
        totalViews: 9200,
        totalRevenue: 1350.75
      },
      'occasion-specific': {
        count: 15,
        published: 12,
        draft: 2,
        inProgress: 1,
        totalViews: 5200,
        totalRevenue: 780.25
      }
    };

    res.json({
      data: usage,
      totalPosts: Object.values(usage).reduce((sum, type) => sum + type.count, 0),
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
 * GET /api/v1/brightgift/content-types/suggestions
 * Get suggested content types based on Bright-Gift theme
 */
router.get('/suggestions', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const suggestions = {
      suggestions: [
        {
          name: 'gift-guide',
          description: 'Gift recommendation articles',
          color: '#3B82F6',
          reason: 'Core content type for gift recommendation site'
        },
        {
          name: 'product-review',
          description: 'Product reviews and recommendations',
          color: '#10B981',
          reason: 'Essential for affiliate marketing and product recommendations'
        },
        {
          name: 'seasonal',
          description: 'Holiday and seasonal gift guides',
          color: '#F59E0B',
          reason: 'Important for holiday-specific content and SEO'
        },
        {
          name: 'educational',
          description: 'Gift-giving tips and guides',
          color: '#8B5CF6',
          reason: 'Educational content builds authority and helps with SEO'
        },
        {
          name: 'budget-guide',
          description: 'Budget-friendly gift ideas',
          color: '#06B6D4',
          reason: 'Popular search term and user need'
        },
        {
          name: 'occasion-specific',
          description: 'Gifts for specific occasions',
          color: '#EF4444',
          reason: 'Targets specific user intent and occasions'
        }
      ],
      themes: ['gift', 'recommendations', 'affiliate-marketing'],
      existingContentTypes: ['gift-guide', 'product-review', 'seasonal', 'educational']
    };

    res.json(suggestions);
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

module.exports = router; 