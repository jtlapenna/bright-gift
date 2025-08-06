#!/usr/bin/env node

const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');

// Mock data with updated content types
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

// Updated content types with traffic strategy
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

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'bright-gift-secret-key';

// Mock user for authentication
const mockUser = {
  id: 'user-001',
  email: 'admin@bright-gift.com',
  name: 'Bright Gift Admin',
  role: 'admin'
};

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Helper function to send JSON response
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

// Helper function to parse request body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        resolve({});
      }
    });
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // Health check endpoint
    if (path === '/api/v1/brightgift/health' && method === 'GET') {
      sendJsonResponse(res, 200, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'bright-gift-api',
        version: '1.0.0'
      });
      return;
    }

    // Authentication endpoint
    if (path === '/api/v1/brightgift/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const { email, password } = body;

      // Mock authentication
      if (email === 'admin@bright-gift.com' && password === 'password') {
        const token = generateToken(mockUser);
        sendJsonResponse(res, 200, {
          message: 'Login successful',
          token,
          user: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role
          }
        });
      } else {
        sendJsonResponse(res, 401, {
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Invalid credentials'
          }
        });
      }
      return;
    }

    // Verify token for protected endpoints
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendJsonResponse(res, 401, {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header'
        }
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      sendJsonResponse(res, 401, {
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
      return;
    }

    // Posts endpoints
    if (path === '/api/v1/brightgift/posts' && method === 'GET') {
      const { contentType, status, recipient, budget, occasion, page = 1, limit = 20 } = parsedUrl.query;
      
      let filteredPosts = mockPosts;
      
      if (contentType) {
        filteredPosts = filteredPosts.filter(post => post.content_type === contentType);
      }
      if (status) {
        filteredPosts = filteredPosts.filter(post => post.status === status);
      }
      if (recipient) {
        filteredPosts = filteredPosts.filter(post => post.recipient === recipient);
      }
      if (budget) {
        filteredPosts = filteredPosts.filter(post => post.budget === budget);
      }
      if (occasion) {
        filteredPosts = filteredPosts.filter(post => post.occasion === occasion);
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

      sendJsonResponse(res, 200, {
        posts: paginatedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredPosts.length,
          totalPages: Math.ceil(filteredPosts.length / limit)
        }
      });
      return;
    }

    // Single post endpoint
    if (path.match(/^\/api\/v1\/brightgift\/posts\/[^\/]+$/) && method === 'GET') {
      const postId = path.split('/').pop();
      const post = mockPosts.find(p => p.post_id === postId);
      
      if (!post) {
        sendJsonResponse(res, 404, {
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found'
          }
        });
        return;
      }

      sendJsonResponse(res, 200, { post });
      return;
    }

    // Content types endpoint
    if (path === '/api/v1/brightgift/content-types' && method === 'GET') {
      sendJsonResponse(res, 200, {
        contentTypes,
        total: contentTypes.length,
        trafficStrategy: {
          seo: ['gift-guide', 'seasonal', 'how-to', 'comparison'],
          social: ['educational', 'trending', 'data-driven'],
          affiliate: ['product-review', 'gift-guide', 'comparison'],
          authority: ['data-driven', 'educational']
        }
      });
      return;
    }

    // Analytics endpoints
    if (path === '/api/v1/brightgift/analytics' && method === 'GET') {
      const totalPosts = mockPosts.length;
      const publishedPosts = mockPosts.filter(p => p.status === 'published').length;
      const totalViews = mockPosts.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalRevenue = mockPosts.reduce((sum, p) => sum + (p.revenue || 0), 0);
      const avgSeoScore = mockPosts.reduce((sum, p) => sum + (p.seo_score || 0), 0) / totalPosts;

      // Content type breakdown
      const contentTypeBreakdown = mockPosts.reduce((acc, post) => {
        const type = post.content_type;
        if (!acc[type]) {
          acc[type] = {
            count: 0,
            totalViews: 0,
            totalRevenue: 0,
            avgViews: 0,
            avgRevenue: 0
          };
        }
        acc[type].count++;
        acc[type].totalViews += post.views || 0;
        acc[type].totalRevenue += post.revenue || 0;
        return acc;
      }, {});

      // Calculate averages
      Object.keys(contentTypeBreakdown).forEach(type => {
        const data = contentTypeBreakdown[type];
        data.avgViews = Math.round(data.totalViews / data.count);
        data.avgRevenue = Math.round((data.totalRevenue / data.count) * 100) / 100;
      });

      sendJsonResponse(res, 200, {
        overview: {
          totalPosts,
          publishedPosts,
          totalViews,
          totalRevenue,
          avgSeoScore: Math.round(avgSeoScore)
        },
        contentTypeBreakdown,
        topPosts: mockPosts
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
      });
      return;
    }

    // Affiliate analytics endpoint
    if (path === '/api/v1/brightgift/analytics/affiliates' && method === 'GET') {
      const affiliatePosts = mockPosts.filter(p => p.content_type === 'product-review');
      const totalAffiliateRevenue = affiliatePosts.reduce((sum, p) => sum + (p.revenue || 0), 0);
      const avgAffiliateRevenue = affiliatePosts.length > 0 ? totalAffiliateRevenue / affiliatePosts.length : 0;

      sendJsonResponse(res, 200, {
        totalAffiliatePosts: affiliatePosts.length,
        totalAffiliateRevenue,
        avgAffiliateRevenue: Math.round(avgAffiliateRevenue * 100) / 100,
        topAffiliatePosts: affiliatePosts
          .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
          .slice(0, 5)
      });
      return;
    }

    // Seasonal analytics endpoint
    if (path === '/api/v1/brightgift/analytics/seasonal' && method === 'GET') {
      const seasonalPosts = mockPosts.filter(p => p.content_type === 'seasonal');
      const totalSeasonalViews = seasonalPosts.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalSeasonalRevenue = seasonalPosts.reduce((sum, p) => sum + (p.revenue || 0), 0);

      sendJsonResponse(res, 200, {
        totalSeasonalPosts: seasonalPosts.length,
        totalSeasonalViews,
        totalSeasonalRevenue,
        avgSeasonalViews: seasonalPosts.length > 0 ? Math.round(totalSeasonalViews / seasonalPosts.length) : 0,
        seasonalPosts
      });
      return;
    }

    // 404 for unmatched routes
    sendJsonResponse(res, 404, {
      error: {
        code: 'ENDPOINT_NOT_FOUND',
        message: 'Endpoint not found'
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    sendJsonResponse(res, 500, {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Bright-Gift API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/v1/brightgift/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/v1/brightgift/auth/login`);
  console.log(`📝 Posts: GET http://localhost:${PORT}/api/v1/brightgift/posts`);
  console.log(`📊 Analytics: GET http://localhost:${PORT}/api/v1/brightgift/analytics`);
  console.log(`🏷️ Content Types: GET http://localhost:${PORT}/api/v1/brightgift/content-types`);
}); 