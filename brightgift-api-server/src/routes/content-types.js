const express = require('express');
const { authenticateToken, checkBrightGiftAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/v1/brightgift/content-types
 * Get Bright-Gift content types
 */
router.get('/', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    // Bright-Gift specific content types
    const contentTypes = [
      {
        name: 'gift-guide',
        description: 'Gift recommendation articles',
        color: '#3B82F6',
        examples: ['Best Gifts for Tech Lovers', 'Unique Gift Ideas Under $50']
      },
      {
        name: 'product-review',
        description: 'Product reviews and recommendations',
        color: '#10B981',
        examples: ['Amazon Echo Dot Review', 'Best Coffee Makers 2024']
      },
      {
        name: 'seasonal',
        description: 'Holiday and seasonal gift guides',
        color: '#F59E0B',
        examples: ['Christmas Gift Guide', 'Valentine\'s Day Gifts']
      },
      {
        name: 'educational',
        description: 'Gift-giving tips and guides',
        color: '#8B5CF6',
        examples: ['How to Choose the Perfect Gift', 'Gift Etiquette Guide']
      },
      {
        name: 'budget-guide',
        description: 'Budget-friendly gift ideas',
        color: '#06B6D4',
        examples: ['Gifts Under $25', 'Affordable Luxury Gifts']
      },
      {
        name: 'occasion-specific',
        description: 'Gifts for specific occasions',
        color: '#EF4444',
        examples: ['Wedding Gift Ideas', 'Graduation Gift Guide']
      }
    ];

    res.json({
      data: contentTypes,
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
 * PUT /api/v1/brightgift/content-types
 * Update Bright-Gift content types
 */
router.put('/', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const { contentTypes } = req.body;

    // In a real implementation, you would save this to the database
    // For now, we'll just return the updated content types
    res.json({
      data: contentTypes,
      message: 'Content types updated successfully',
      total: contentTypes.length
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