const { supabase, TABLES } = require('../config/supabase');

/**
 * Bright-Gift specific service for managing gift-related content
 */
class BrightGiftService {
  /**
   * Get all posts for Bright-Gift site
   */
  async getPosts(filters = {}) {
    // Mock data for testing - replace with real Supabase query
    const mockPosts = [
      {
        post_id: 'brightgift-001',
        site_id: 'brightgift',
        title: 'Best Gifts for Tech Lovers in 2024',
        content_type: 'gift-guide',
        recipient: 'tech-enthusiasts',
        budget: '100-200',
        occasion: 'birthday',
        status: 'published',
        views: 1250,
        revenue: 89.50,
        seo_score: 85,
        readability_score: 78,
        word_count: 1200,
        created_at: '2024-01-15T10:30:00Z',
        last_updated: '2024-01-15T14:45:00Z'
      },
      {
        post_id: 'brightgift-002',
        site_id: 'brightgift',
        title: 'Christmas Gift Guide 2024: Top Picks for Everyone',
        content_type: 'seasonal',
        recipient: 'general',
        budget: '50-150',
        occasion: 'christmas',
        status: 'published',
        views: 2100,
        revenue: 145.75,
        seo_score: 92,
        readability_score: 85,
        word_count: 1800,
        created_at: '2024-01-10T09:15:00Z',
        last_updated: '2024-01-12T11:30:00Z'
      },
      {
        post_id: 'brightgift-003',
        site_id: 'brightgift',
        title: 'Why We Remember Gifts We Give More Than Receive',
        content_type: 'educational',
        recipient: 'general',
        budget: 'any',
        occasion: 'any',
        status: 'published',
        views: 980,
        revenue: 65.25,
        seo_score: 82,
        readability_score: 75,
        word_count: 1200,
        created_at: '2024-01-20T08:00:00Z',
        last_updated: '2024-01-20T08:00:00Z'
      },
      {
        post_id: 'brightgift-004',
        site_id: 'brightgift',
        title: 'Best Coffee Makers for Coffee Lovers: 2024 Reviews',
        content_type: 'product-review',
        recipient: 'coffee-lovers',
        budget: '200-500',
        occasion: 'any',
        status: 'published',
        views: 850,
        revenue: 120.40,
        seo_score: 88,
        readability_score: 80,
        word_count: 1500,
        created_at: '2024-01-18T14:20:00Z',
        last_updated: '2024-01-19T16:30:00Z'
      },
      {
        post_id: 'brightgift-005',
        site_id: 'brightgift',
        title: 'Gift-Giving Statistics 2024: What People Really Want',
        content_type: 'data-driven',
        recipient: 'general',
        budget: 'any',
        occasion: 'any',
        status: 'published',
        views: 650,
        revenue: 45.80,
        seo_score: 78,
        readability_score: 72,
        word_count: 900,
        created_at: '2024-01-22T11:45:00Z',
        last_updated: '2024-01-22T11:45:00Z'
      },
      {
        post_id: 'brightgift-006',
        site_id: 'brightgift',
        title: 'How to Wrap Gifts Like a Pro: Step-by-Step Guide',
        content_type: 'how-to',
        recipient: 'general',
        budget: 'any',
        occasion: 'any',
        status: 'published',
        views: 720,
        revenue: 38.90,
        seo_score: 75,
        readability_score: 70,
        word_count: 800,
        created_at: '2024-01-25T10:15:00Z',
        last_updated: '2024-01-25T10:15:00Z'
      },
      {
        post_id: 'brightgift-007',
        site_id: 'brightgift',
        title: 'Gift Cards vs Physical Gifts: Which Should You Choose?',
        content_type: 'comparison',
        recipient: 'general',
        budget: 'any',
        occasion: 'any',
        status: 'published',
        views: 590,
        revenue: 42.60,
        seo_score: 80,
        readability_score: 75,
        word_count: 1100,
        created_at: '2024-01-28T09:30:00Z',
        last_updated: '2024-01-28T09:30:00Z'
      },
      {
        post_id: 'brightgift-008',
        site_id: 'brightgift',
        title: 'TikTok Viral Gifts 2024: Trending Products Everyone Wants',
        content_type: 'trending',
        recipient: 'trend-conscious',
        budget: '50-200',
        occasion: 'any',
        status: 'published',
        views: 1800,
        revenue: 95.20,
        seo_score: 85,
        readability_score: 78,
        word_count: 1300,
        created_at: '2024-01-30T13:20:00Z',
        last_updated: '2024-01-30T13:20:00Z'
      }
    ];

    // Apply filters
    let filteredPosts = mockPosts;
    if (filters.status) {
      filteredPosts = filteredPosts.filter(post => post.status === filters.status);
    }
    if (filters.content_type) {
      filteredPosts = filteredPosts.filter(post => post.content_type === filters.content_type);
    }
    if (filters.recipient) {
      filteredPosts = filteredPosts.filter(post => post.recipient === filters.recipient);
    }
    if (filters.budget) {
      filteredPosts = filteredPosts.filter(post => post.budget === filters.budget);
    }
    if (filters.occasion) {
      filteredPosts = filteredPosts.filter(post => post.occasion === filters.occasion);
    }

    // Apply sorting
    const sort = filters.sort || 'created_at';
    const order = filters.order || 'desc';
    filteredPosts.sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    return {
      posts: paginatedPosts,
      total: filteredPosts.length
    };
  }

  /**
   * Get single post by ID
   */
  async getPost(postId) {
    // Mock data for testing - replace with real Supabase query
    const mockPosts = [
      {
        post_id: 'brightgift-001',
        site_id: 'brightgift',
        title: 'Best Gifts for Tech Lovers in 2024',
        content_type: 'gift-guide',
        recipient: 'tech-enthusiasts',
        budget: '100-200',
        occasion: 'birthday',
        status: 'published',
        views: 1250,
        revenue: 89.50,
        seo_score: 85,
        readability_score: 78,
        word_count: 1200,
        created_at: '2024-01-15T10:30:00Z',
        last_updated: '2024-01-15T14:45:00Z'
      },
      {
        post_id: 'brightgift-002',
        site_id: 'brightgift',
        title: 'Christmas Gift Guide 2024: Top Picks for Everyone',
        content_type: 'seasonal',
        recipient: 'general',
        budget: '50-150',
        occasion: 'christmas',
        status: 'published',
        views: 2100,
        revenue: 145.75,
        seo_score: 92,
        readability_score: 85,
        word_count: 1800,
        created_at: '2024-01-10T09:15:00Z',
        last_updated: '2024-01-12T11:30:00Z'
      },
      {
        post_id: 'brightgift-003',
        site_id: 'brightgift',
        title: 'Why We Remember Gifts We Give More Than Receive',
        content_type: 'educational',
        recipient: 'general',
        budget: 'any',
        occasion: 'any',
        status: 'published',
        views: 980,
        revenue: 65.25,
        seo_score: 82,
        readability_score: 75,
        word_count: 1200,
        created_at: '2024-01-20T08:00:00Z',
        last_updated: '2024-01-20T08:00:00Z'
      }
    ];

    const post = mockPosts.find(p => p.post_id === postId);
    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  }

  /**
   * Create new post
   */
  async createPost(postData) {
    // Mock implementation - replace with real Supabase insert
    const post = {
      ...postData,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
    return post;
  }

  /**
   * Update post
   */
  async updatePost(postId, updateData) {
    // Mock implementation - replace with real Supabase update
    const post = {
      post_id: postId,
      ...updateData,
      last_updated: new Date().toISOString()
    };
    return post;
  }

  /**
   * Delete post
   */
  async deletePost(postId) {
    // Mock implementation - replace with real Supabase delete
    return { success: true };
  }

  /**
   * Publish post
   */
  async publishPost(postId) {
    // Mock implementation - replace with real Supabase update
    const post = {
      post_id: postId,
      status: 'published',
      last_updated: new Date().toISOString()
    };
    return post;
  }

  /**
   * Approve post
   */
  async approvePost(postId, approvedBy) {
    // Mock implementation - replace with real Supabase update
    const post = {
      post_id: postId,
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
    return post;
  }

  /**
   * Get analytics data
   */
  async getAnalytics(filters = {}) {
    // Mock data for testing - replace with real Supabase query
    const mockPosts = [
      {
        post_id: 'brightgift-001',
        site_id: 'brightgift',
        title: 'Best Gifts for Tech Lovers in 2024',
        content_type: 'gift-guide',
        recipient: 'tech-enthusiasts',
        budget: '100-200',
        occasion: 'birthday',
        status: 'published',
        views: 1250,
        revenue: 89.50,
        seo_score: 85,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        post_id: 'brightgift-002',
        site_id: 'brightgift',
        title: 'Christmas Gift Guide 2024: Top Picks for Everyone',
        content_type: 'seasonal',
        recipient: 'general',
        budget: '50-150',
        occasion: 'christmas',
        status: 'published',
        views: 2100,
        revenue: 145.75,
        seo_score: 92,
        created_at: '2024-01-10T09:15:00Z'
      },
      {
        post_id: 'brightgift-003',
        site_id: 'brightgift',
        title: 'Why We Remember Gifts We Give More Than Receive',
        content_type: 'educational',
        recipient: 'general',
        budget: 'any',
        occasion: 'any',
        status: 'published',
        views: 980,
        revenue: 65.25,
        seo_score: 82,
        created_at: '2024-01-20T08:00:00Z'
      },
      {
        post_id: 'brightgift-004',
        site_id: 'brightgift',
        title: 'Best Coffee Makers for Coffee Lovers: 2024 Reviews',
        content_type: 'product-review',
        recipient: 'coffee-lovers',
        budget: '200-500',
        occasion: 'any',
        status: 'published',
        views: 850,
        revenue: 120.40,
        seo_score: 88,
        created_at: '2024-01-18T14:20:00Z'
      },
      {
        post_id: 'brightgift-005',
        site_id: 'brightgift',
        title: 'Gift-Giving Statistics 2024: What People Really Want',
        content_type: 'data-driven',
        recipient: 'general',
        budget: 'any',
        occasion: 'any',
        status: 'published',
        views: 650,
        revenue: 45.80,
        seo_score: 78,
        created_at: '2024-01-22T11:45:00Z'
      },
      {
        post_id: 'brightgift-006',
        site_id: 'brightgift',
        title: 'How to Wrap Gifts Like a Pro: Step-by-Step Guide',
        content_type: 'how-to',
        recipient: 'general',
        budget: 'any',
        occasion: 'any',
        status: 'published',
        views: 720,
        revenue: 38.90,
        seo_score: 75,
        created_at: '2024-01-25T10:15:00Z'
      },
      {
        post_id: 'brightgift-007',
        site_id: 'brightgift',
        title: 'Gift Cards vs Physical Gifts: Which Should You Choose?',
        content_type: 'comparison',
        recipient: 'general',
        budget: 'any',
        occasion: 'any',
        status: 'published',
        views: 590,
        revenue: 42.60,
        seo_score: 80,
        created_at: '2024-01-28T09:30:00Z'
      },
      {
        post_id: 'brightgift-008',
        site_id: 'brightgift',
        title: 'TikTok Viral Gifts 2024: Trending Products Everyone Wants',
        content_type: 'trending',
        recipient: 'trend-conscious',
        budget: '50-200',
        occasion: 'any',
        status: 'published',
        views: 1800,
        revenue: 95.20,
        seo_score: 85,
        created_at: '2024-01-30T13:20:00Z'
      }
    ];

    // Calculate analytics
    const analytics = {
      totalPosts: mockPosts.length,
      publishedPosts: mockPosts.filter(p => p.status === 'published').length,
      draftPosts: mockPosts.filter(p => p.status === 'draft').length,
      inProgressPosts: mockPosts.filter(p => p.status === 'in_progress').length,
      totalViews: mockPosts.reduce((sum, p) => sum + (p.views || 0), 0),
      totalRevenue: mockPosts.reduce((sum, p) => sum + (p.revenue || 0), 0),
      avgSeoScore: mockPosts.length > 0 ? 
        mockPosts.reduce((sum, p) => sum + (p.seo_score || 0), 0) / mockPosts.length : 0,
      contentTypeBreakdown: this.getContentTypeBreakdown(mockPosts),
      recipientBreakdown: this.getRecipientBreakdown(mockPosts),
      budgetBreakdown: this.getBudgetBreakdown(mockPosts),
      occasionBreakdown: this.getOccasionBreakdown(mockPosts)
    };

    return analytics;
  }

  /**
   * Get content type breakdown
   */
  getContentTypeBreakdown(posts) {
    return posts.reduce((acc, post) => {
      const type = post.content_type || 'unknown';
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalViews: 0,
          totalRevenue: 0,
          avgViews: 0,
          avgRevenue: 0,
          published: 0,
          draft: 0
        };
      }

      acc[type].count++;
      acc[type].totalViews += post.views || 0;
      acc[type].totalRevenue += post.revenue || 0;

      if (post.status === 'published') {
        acc[type].published++;
      } else if (post.status === 'draft') {
        acc[type].draft++;
      }

      return acc;
    }, {});
  }

  /**
   * Get recipient breakdown
   */
  getRecipientBreakdown(posts) {
    return posts.reduce((acc, post) => {
      const recipient = post.recipient || 'unknown';
      if (!acc[recipient]) {
        acc[recipient] = {
          count: 0,
          totalViews: 0,
          totalRevenue: 0
        };
      }

      acc[recipient].count++;
      acc[recipient].totalViews += post.views || 0;
      acc[recipient].totalRevenue += post.revenue || 0;

      return acc;
    }, {});
  }

  /**
   * Get budget breakdown
   */
  getBudgetBreakdown(posts) {
    return posts.reduce((acc, post) => {
      const budget = post.budget || 'unknown';
      if (!acc[budget]) {
        acc[budget] = {
          count: 0,
          totalViews: 0,
          totalRevenue: 0
        };
      }

      acc[budget].count++;
      acc[budget].totalViews += post.views || 0;
      acc[budget].totalRevenue += post.revenue || 0;

      return acc;
    }, {});
  }

  /**
   * Get occasion breakdown
   */
  getOccasionBreakdown(posts) {
    return posts.reduce((acc, post) => {
      const occasion = post.occasion || 'unknown';
      if (!acc[occasion]) {
        acc[occasion] = {
          count: 0,
          totalViews: 0,
          totalRevenue: 0
        };
      }

      acc[occasion].count++;
      acc[occasion].totalViews += post.views || 0;
      acc[occasion].totalRevenue += post.revenue || 0;

      return acc;
    }, {});
  }
}

module.exports = new BrightGiftService(); 