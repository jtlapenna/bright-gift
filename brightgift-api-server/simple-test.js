#!/usr/bin/env node

const http = require('http');
const url = require('url');

const PORT = 3001;

// Simple request handler
const requestHandler = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Route handling
  if (path === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'brightgift-api-simple-test',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
    return;
  }
  
  if (path === '/api/v1/brightgift/posts' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      data: [
        {
          post_id: 'brightgift-test-001',
          site_id: 'brightgift',
          title: 'Test Gift Guide for Tech Lovers',
          content_type: 'gift-guide',
          recipient: 'tech-enthusiasts',
          budget: '100-200',
          occasion: 'birthday',
          status: 'published',
          views: 1250,
          revenue: 89.50,
          created_at: '2024-01-15T10:30:00Z'
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      }
    }));
    return;
  }
  
  if (path === '/api/v1/brightgift/content-types' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      data: [
        {
          name: 'gift-guide',
          description: 'Gift recommendation articles',
          color: '#3B82F6'
        },
        {
          name: 'product-review',
          description: 'Product reviews and recommendations',
          color: '#10B981'
        }
      ],
      total: 2
    }));
    return;
  }
  
  if (path === '/api/v1/brightgift/analytics' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      data: {
        totalPosts: 1,
        publishedPosts: 1,
        totalViews: 1250,
        totalRevenue: 89.50,
        contentTypeBreakdown: {
          'gift-guide': {
            count: 1,
            published: 1,
            totalViews: 1250,
            totalRevenue: 89.50
          }
        }
      }
    }));
    return;
  }
  
  if (path === '/api/v1/brightgift/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        
        if (email === 'admin@brightgift.com' && password === 'password') {
          res.writeHead(200);
          res.end(JSON.stringify({
            data: {
              token: 'mock-jwt-token-for-testing',
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
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid JSON'
          }
        }));
      }
    });
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
  console.log(`🎁 Bright-Gift API Simple Test Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API base: http://localhost:${PORT}/api/v1/brightgift`);
  console.log(`\n🧪 Test endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/v1/brightgift/posts`);
  console.log(`   GET  /api/v1/brightgift/content-types`);
  console.log(`   GET  /api/v1/brightgift/analytics`);
  console.log(`   POST /api/v1/brightgift/auth/login`);
  console.log(`\n📝 Test login: curl -X POST http://localhost:${PORT}/api/v1/brightgift/auth/login -H "Content-Type: application/json" -d '{"email": "admin@brightgift.com", "password": "password"}'`);
}); 