#!/usr/bin/env node

const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Mock data for Bright-Gift
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
    title: 'Unique Gift Ideas Under $50',
    content_type: 'budget-guide',
    recipient: 'budget-conscious',
    budget: 'under-50',
    occasion: 'holiday',
    status: 'published',
    views: 980,
    revenue: 65.25,
    seo_score: 82,
    readability_score: 75,
    word_count: 950,
    created_at: '2024-01-10T09:15:00Z',
    last_updated: '2024-01-12T11:30:00Z'
  },
  {
    post_id: 'brightgift-003',
    site_id: 'brightgift',
    title: 'Christmas Gift Guide 2024',
    content_type: 'seasonal',
    recipient: 'general',
    budget: '50-150',
    occasion: 'christmas',
    status: 'draft',
    views: 0,
    revenue: 0,
    seo_score: 0,
    readability_score: 0,
    word_count: 0,
    created_at: '2024-01-20T08:00:00Z',
    last_updated: '2024-01-20T08:00:00Z'
  }
];

// Authentication middleware
const authenticateToken = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Parse JSON body
const parseBody = (req) => {
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
};

// Simple request handler
const requestHandler = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (path === '/health' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'brightgift-api-production',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
    return;
  }

  // Authentication endpoints
  if (path === '/api/v1/brightgift/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    const { email, password } = body;
    
    if (email === 'admin@brightgift.com' && password === 'password') {
      const token = jwt.sign({
        userId: 'user-123',
        siteId: 'brightgift',
        role: 'admin',
        email: 'admin@brightgift.com'
      }, JWT_SECRET, { expiresIn: '24h' });

      res.writeHead(200);
      res.end(JSON.stringify({
        data: {
          token,
          user: {
            id: 'user-123',
            email: 'admin@brightgift.com',
            name: 'Bright-Gift Admin',
            siteId: 'brightgift',
            role: 'admin'
          }
        },
        message: 'Login successful'
      }));
    } else {
      res.writeHead(401);
      res.end(JSON.stringify({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        }
      }));
    }
    return;
  }

  if (path === '/api/v1/brightgift/auth/me' && method === 'GET') {
    const user = authenticateToken(req);
    if (!user) {
      res.writeHead(401);
      res.end(JSON.stringify({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token required'
        }
      }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify({
      data: {
        id: user.userId,
        email: user.email,
        name: 'Bright-Gift Admin',
        siteId: user.siteId,
        role: user.role,
        permissions: ['read', 'write', 'publish', 'approve']
      }
    }));
    return;
  }

  // Posts endpoints
  if (path === '/api/v1/brightgift/posts' && method === 'GET') {
    const user = authenticateToken(req);
    if (!user || user.siteId !== 'brightgift') {
      res.writeHead(401);
      res.end(JSON.stringify({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied to Bright-Gift site'
        }
      }));
      return;
    }

    // Apply filters
    let filteredPosts = [...mockPosts];
    const { status, contentType, recipient, budget, occasion } = parsedUrl.query;
    
    if (status) filteredPosts = filteredPosts.filter(p => p.status === status);
    if (contentType) filteredPosts = filteredPosts.filter(p => p.content_type === contentType);
    if (recipient) filteredPosts = filteredPosts.filter(p => p.recipient === recipient);
    if (budget) filteredPosts = filteredPosts.filter(p => p.budget === budget);
    if (occasion) filteredPosts = filteredPosts.filter(p => p.occasion === occasion);

    res.writeHead(200);
    res.end(JSON.stringify({
      data: filteredPosts,
      pagination: {
        page: 1,
        limit: 20,
        total: filteredPosts.length,
        totalPages: 1
      }
    }));
    return;
  }

  if (path.startsWith('/api/v1/brightgift/posts/') && method === 'GET') {
    const user = authenticateToken(req);
    if (!user || user.siteId !== 'brightgift') {
      res.writeHead(401);
      res.end(JSON.stringify({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied to Bright-Gift site'
        }
      }));
      return;
    }

    const postId = path.split('/').pop();
    const post = mockPosts.find(p => p.post_id === postId);
    
    if (!post) {
      res.writeHead(404);
      res.end(JSON.stringify({
        error: {
          code: 'NOT_FOUND',
          message: 'Post not found'
        }
      }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify({
      data: post
    }));
    return;
  }

  // Content types endpoints
  if (path === '/api/v1/brightgift/content-types' && method === 'GET') {
    const user = authenticateToken(req);
    if (!user || user.siteId !== 'brightgift') {
      res.writeHead(401);
      res.end(JSON.stringify({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied to Bright-Gift site'
        }
      }));
      return;
    }

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

    res.writeHead(200);
    res.end(JSON.stringify({
      data: contentTypes,
      total: contentTypes.length
    }));
    return;
  }

  // Analytics endpoints
  if (path === '/api/v1/brightgift/analytics' && method === 'GET') {
    const user = authenticateToken(req);
    if (!user || user.siteId !== 'brightgift') {
      res.writeHead(401);
      res.end(JSON.stringify({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied to Bright-Gift site'
        }
      }));
      return;
    }

    const analytics = {
      totalPosts: mockPosts.length,
      publishedPosts: mockPosts.filter(p => p.status === 'published').length,
      draftPosts: mockPosts.filter(p => p.status === 'draft').length,
      inProgressPosts: mockPosts.filter(p => p.status === 'in_progress').length,
      totalViews: mockPosts.reduce((sum, p) => sum + (p.views || 0), 0),
      totalRevenue: mockPosts.reduce((sum, p) => sum + (p.revenue || 0), 0),
      avgSeoScore: mockPosts.length > 0 ? 
        mockPosts.reduce((sum, p) => sum + (p.seo_score || 0), 0) / mockPosts.length : 0,
      contentTypeBreakdown: {
        'gift-guide': {
          count: 1,
          published: 1,
          totalViews: 1250,
          totalRevenue: 89.50
        },
        'budget-guide': {
          count: 1,
          published: 1,
          totalViews: 980,
          totalRevenue: 65.25
        },
        'seasonal': {
          count: 1,
          draft: 1,
          totalViews: 0,
          totalRevenue: 0
        }
      }
    };

    res.writeHead(200);
    res.end(JSON.stringify({
      data: analytics
    }));
    return;
  }

  // 404 for unknown routes
  res.writeHead(404);
  res.end(JSON.stringify({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  }));
};

// Create server
const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`🎁 Bright-Gift API Production Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API base: http://localhost:${PORT}/api/v1/brightgift`);
  console.log(`\n🧪 Test endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   POST /api/v1/brightgift/auth/login`);
  console.log(`   GET  /api/v1/brightgift/auth/me`);
  console.log(`   GET  /api/v1/brightgift/posts`);
  console.log(`   GET  /api/v1/brightgift/content-types`);
  console.log(`   GET  /api/v1/brightgift/analytics`);
  console.log(`\n📝 Test login: curl -X POST http://localhost:${PORT}/api/v1/brightgift/auth/login -H "Content-Type: application/json" -d '{"email": "admin@brightgift.com", "password": "password"}'`);
  console.log(`\n🔐 Ready for real database connection!`);
}); 