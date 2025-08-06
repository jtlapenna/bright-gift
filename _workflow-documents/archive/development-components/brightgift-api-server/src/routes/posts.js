const express = require('express');
const { query, body, validationResult } = require('express-validator');
const { authenticateToken, checkBrightGiftAccess } = require('../middleware/auth');
const brightGiftService = require('../services/brightgiftService');

const router = express.Router();

/**
 * GET /api/v1/brightgift/posts
 * Get all Bright-Gift posts with filtering and pagination
 */
router.get('/', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      content_type: req.query.contentType,
      recipient: req.query.recipient,
      budget: req.query.budget,
      occasion: req.query.occasion,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sort: req.query.sort || 'created_at',
      order: req.query.order || 'desc'
    };

    const result = await brightGiftService.getPosts(filters);

    res.json({
      data: result.posts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / filters.limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch posts'
      }
    });
  }
});

/**
 * GET /api/v1/brightgift/posts/:id
 * Get single Bright-Gift post
 */
router.get('/:id', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await brightGiftService.getPost(id);

    res.json({
      data: post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
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
        message: 'Failed to fetch post'
      }
    });
  }
});

/**
 * POST /api/v1/brightgift/posts
 * Create new Bright-Gift post
 */
router.post('/', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      post_id: `brightgift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const post = await brightGiftService.createPost(postData);

    res.status(201).json({
      data: post,
      message: 'Post created successfully'
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
 * PUT /api/v1/brightgift/posts/:id
 * Update Bright-Gift post
 */
router.put('/:id', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await brightGiftService.updatePost(id, req.body);

    res.json({
      data: post,
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Error updating post:', error);
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
        message: 'Failed to update post'
      }
    });
  }
});

/**
 * DELETE /api/v1/brightgift/posts/:id
 * Delete Bright-Gift post
 */
router.delete('/:id', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const { id } = req.params;
    await brightGiftService.deletePost(id);

    res.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
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
        message: 'Failed to delete post'
      }
    });
  }
});

/**
 * POST /api/v1/brightgift/posts/:id/publish
 * Publish Bright-Gift post
 */
router.post('/:id/publish', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await brightGiftService.publishPost(id);

    res.json({
      data: post,
      message: 'Post published successfully'
    });
  } catch (error) {
    console.error('Error publishing post:', error);
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
        message: 'Failed to publish post'
      }
    });
  }
});

/**
 * POST /api/v1/brightgift/posts/:id/approve
 * Approve Bright-Gift post
 */
router.post('/:id/approve', authenticateToken, checkBrightGiftAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await brightGiftService.approvePost(id, req.user.id);

    res.json({
      data: post,
      message: 'Post approved successfully'
    });
  } catch (error) {
    console.error('Error approving post:', error);
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
        message: 'Failed to approve post'
      }
    });
  }
});

module.exports = router; 