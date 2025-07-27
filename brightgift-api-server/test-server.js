#!/usr/bin/env node

// Simple test script for Bright-Gift API Server
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'brightgift-api-test',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock Bright-Gift endpoints
app.get('/api/v1/brightgift/posts', (req, res) => {
  res.json({
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
  });
});

app.get('/api/v1/brightgift/content-types', (req, res) => {
  res.json({
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
  });
});

app.get('/api/v1/brightgift/analytics', (req, res) => {
  res.json({
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
  });
});

// Mock authentication endpoint
app.post('/api/v1/brightgift/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@brightgift.com' && password === 'password') {
    res.json({
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
    });
  } else {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials'
      }
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🎁 Bright-Gift API Test Server running on port ${PORT}`);
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