# 🎁 Bright-Gift API Server Integration Guide

## Overview
This guide provides instructions for setting up a Bright-Gift API server that integrates with the Multi-Site Hub dashboard. The API server will provide real data to the hub's frontend and connect to the existing Supabase database.

---

## 🏗️ **Project Structure**

Create the following structure in your Bright-Gift repository:

```
brightgift-api-server/
├── src/
│   ├── index.js                 # Main server file
│   ├── config/
│   │   ├── supabase.js         # Supabase configuration
│   │   ├── environment.js      # Environment variables
│   │   └── database.js         # Database connection
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── posts.js            # Blog post management
│   │   ├── analytics.js        # Analytics and reporting
│   │   ├── workflows.js        # n8n workflow integration
│   │   └── content-types.js    # Content type management
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   ├── validation.js       # Request validation
│   │   └── cors.js             # CORS configuration
│   ├── services/
│   │   ├── brightgiftService.js # Bright-Gift specific logic
│   │   ├── analyticsService.js  # Analytics processing
│   │   └── workflowService.js   # Workflow management
│   └── utils/
│       ├── logger.js           # Logging utilities
│       └── helpers.js          # Helper functions
├── .env                        # Environment variables
├── package.json
└── README.md
```

---

## 📦 **Dependencies**

Install these packages:

```bash
npm init -y
npm install express cors helmet dotenv jsonwebtoken bcryptjs
npm install @supabase/supabase-js
npm install joi # for validation
npm install morgan # for logging
npm install --save-dev nodemon
```

---

## 🔧 **Environment Configuration**

Create a `.env` file with these variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration (Use the existing Supabase project)
SUPABASE_URL=https://pdbgsvtmznaduhcopphq.supabase.co
SUPABASE_ANON_KEY=your-anon-key-from-multi-site-hub
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-multi-site-hub

# Bright-Gift Specific
BRIGHTGIFT_SITE_ID=brightgift
BRIGHTGIFT_DOMAIN=https://brightgift.com

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# CORS (Allow Multi-Site Hub frontend)
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=debug
```

---

## 🗄️ **Database Schema**

The API server should work with the existing Supabase schema from the multi-site hub. Key tables:

### **blog_workflow_state**
```sql
-- This table already exists in Supabase
-- Contains all blog posts with Bright-Gift specific fields
```

### **analytics**
```sql
-- This table already exists in Supabase
-- Contains post analytics and performance data
```

### **affiliate_performance**
```sql
-- This table already exists in Supabase
-- Contains affiliate link performance data
```

---

## 🔌 **Required API Endpoints**

The Multi-Site Hub expects these endpoints:

### **Authentication**
```javascript
// POST /api/v1/brightgift/auth/login
// POST /api/v1/brightgift/auth/logout
// GET /api/v1/brightgift/auth/me
```

### **Blog Posts**
```javascript
// GET /api/v1/brightgift/posts
// GET /api/v1/brightgift/posts/:id
// POST /api/v1/brightgift/posts
// PUT /api/v1/brightgift/posts/:id
// DELETE /api/v1/brightgift/posts/:id
// POST /api/v1/brightgift/posts/:id/publish
// POST /api/v1/brightgift/posts/:id/approve
```

### **Analytics**
```javascript
// GET /api/v1/brightgift/analytics
// GET /api/v1/brightgift/analytics/posts/:id
// GET /api/v1/brightgift/analytics/affiliates
// GET /api/v1/brightgift/analytics/seasonal
```

### **Content Types**
```javascript
// GET /api/v1/brightgift/content-types
// PUT /api/v1/brightgift/content-types
// GET /api/v1/brightgift/content-types/usage
```

### **Workflows**
```javascript
// GET /api/v1/brightgift/workflows
// POST /api/v1/brightgift/workflows/trigger
```

---

## 📊 **Data Format Requirements**

### **Blog Post Response Format**
```json
{
  "data": {
    "post_id": "post-001",
    "site_id": "brightgift",
    "title": "Best Gifts for Tech Lovers in 2024",
    "current_phase": "WRITING",
    "next_workflow_phase": "REVIEW",
    "status": "in_progress",
    "content_type": "gift-guide",
    "recipient": "tech-enthusiasts",
    "budget": "100-200",
    "occasion": "birthday",
    "seasonal_relevance": "year-round",
    "gift_count": 15,
    "target_audience": "tech-savvy-adults",
    "seo_score": 85,
    "readability_score": 78,
    "word_count": 1200,
    "featured": true,
    "preview_url": "https://preview.brightgift.com/blog/tech-gifts-2024",
    "final_url": "https://brightgift.com/blog/tech-gifts-2024",
    "created_at": "2024-01-15T10:30:00Z",
    "last_updated": "2024-01-15T14:45:00Z",
    "metadata": {
      "keywords": ["tech gifts", "gadgets", "electronics"],
      "affiliate_links": []
    }
  }
}
```

### **Analytics Response Format**
```json
{
  "data": {
    "totalViews": 12500,
    "totalRevenue": 2400.50,
    "avgConversionRate": 0.045,
    "analytics": [
      {
        "id": "uuid",
        "post_id": "post-001",
        "site_id": "brightgift",
        "date": "2024-01-15",
        "views": 1250,
        "unique_visitors": 980,
        "likes": 45,
        "shares": 23,
        "revenue": 89.50,
        "conversion_rate": 0.045
      }
    ],
    "affiliatePerformance": [
      {
        "id": "uuid",
        "post_id": "post-001",
        "affiliate_platform": "amazon",
        "product_id": "B08N5WRWNW",
        "clicks": 125,
        "conversions": 5,
        "revenue": 45.99,
        "commission_rate": 0.04,
        "date": "2024-01-15"
      }
    ]
  }
}
```

---

## 🔐 **Authentication Implementation**

### **JWT Token Structure**
```javascript
// Token payload should include:
{
  "userId": "user-123",
  "siteId": "brightgift",
  "role": "admin", // or "editor", "viewer"
  "iat": 1642248600,
  "exp": 1642335000
}
```

### **Middleware Example**
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```

---

## 🗄️ **Supabase Integration**

### **Database Connection**
```javascript
// config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };
```

### **Example Query**
```javascript
// services/brightgiftService.js
const { supabase } = require('../config/supabase');

const getPosts = async (filters = {}) => {
  let query = supabase
    .from('blog_workflow_state')
    .select('*')
    .eq('site_id', 'brightgift');

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.content_type) {
    query = query.eq('content_type', filters.content_type);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return data;
};

module.exports = { getPosts };
```

---

## 🚀 **Server Setup**

### **Main Server File**
```javascript
// src/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5174'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/v1/brightgift/auth', require('./routes/auth'));
app.use('/api/v1/brightgift/posts', require('./routes/posts'));
app.use('/api/v1/brightgift/analytics', require('./routes/analytics'));
app.use('/api/v1/brightgift/content-types', require('./routes/content-types'));
app.use('/api/v1/brightgift/workflows', require('./routes/workflows'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'brightgift-api' });
});

app.listen(PORT, () => {
  console.log(`Bright-Gift API Server running on port ${PORT}`);
});
```

---

## 🔄 **Integration with Multi-Site Hub**

### **Frontend Configuration Update**
The Multi-Site Hub frontend expects the API to be available at:
```
http://localhost:3001/api/v1/brightgift
```

### **Environment Variables in Multi-Site Hub**
Update the Multi-Site Hub's `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3001
```

---

## 🧪 **Testing Requirements**

### **Test Endpoints**
```bash
# Test health check
curl http://localhost:3001/health

# Test posts endpoint
curl http://localhost:3001/api/v1/brightgift/posts

# Test with authentication
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/v1/brightgift/posts
```

### **Expected Test Data**
The API should return data that matches the existing Supabase schema and includes Bright-Gift specific fields like:
- `content_type` (gift-guide, product-review, seasonal, etc.)
- `recipient` (tech-enthusiasts, coffee-lovers, etc.)
- `budget` (under-50, 50-150, etc.)
- `occasion` (birthday, holiday, etc.)

---

## 📋 **Implementation Checklist**

- [ ] Set up project structure
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up Supabase connection
- [ ] Implement authentication middleware
- [ ] Create all required API endpoints
- [ ] Implement data validation
- [ ] Add error handling
- [ ] Set up CORS for Multi-Site Hub
- [ ] Test all endpoints
- [ ] Update Multi-Site Hub frontend configuration
- [ ] Test integration

---

## 🚨 **Important Notes**

1. **Use Existing Supabase**: Don't create a new database. Use the existing Supabase project from the Multi-Site Hub.

2. **Data Consistency**: Ensure the API returns data in the exact format expected by the Multi-Site Hub frontend.

3. **Authentication**: Implement JWT authentication that works with the Multi-Site Hub's authentication system.

4. **CORS**: Configure CORS to allow requests from the Multi-Site Hub frontend (localhost:5174).

5. **Error Handling**: Implement proper error handling and logging for debugging.

6. **Performance**: Consider implementing caching for analytics data.

---

## 📞 **Integration Support**

Once the API server is implemented, the Multi-Site Hub will:
1. Connect to your API endpoints
2. Display real Bright-Gift data in the dashboard
3. Allow management of Bright-Gift content through the hub interface

The API server should be the single source of truth for all Bright-Gift data, replacing the mock data currently used in the Multi-Site Hub. 