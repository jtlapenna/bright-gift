# API Usage Guide for Multi-Site Content Automation

## Overview
This guide provides complete documentation for using the multi-site content automation API server. The API manages blog posts, workflows, and real-time updates across multiple sites.

## 🚀 Quick Start

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 Authentication Endpoints

### 1. User Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### 2. Get Current User
```bash
GET /auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. User Registration
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

---

## 🏠 Site Management

### 1. List User's Sites
```bash
GET /sites
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "sites": [
    {
      "id": "site_123",
      "name": "BrightGift",
      "url": "https://brightgift.com",
      "status": "active",
      "healthScore": 85,
      "metrics": {
        "totalPosts": 45,
        "publishedPosts": 42,
        "draftPosts": 3,
        "activeWorkflows": 2
      }
    }
  ]
}
```

### 2. Get Site Details
```bash
GET /sites/{siteId}
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. Get Site Health Score
```bash
GET /sites/{siteId}/health
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📝 Blog Post Management

### 1. List All Posts for a Site
```bash
GET /sites/{siteId}/posts?status=published&page=1&limit=20&sort=created_at&order=desc
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `status`: Filter by status (draft, published, review, failed)
- `page`: Page number for pagination
- `limit`: Number of posts per page (default: 20)
- `sort`: Sort by (created_at, updated_at, title, views, seo_score)
- `order`: Sort order (asc, desc)

**Response:**
```json
{
  "posts": [
    {
      "id": "post_123",
      "title": "10 Best React Practices for 2024",
      "status": "published",
      "content": "Full blog content...",
      "excerpt": "Brief excerpt...",
      "wordCount": 2500,
      "url": "https://brightgift.com/posts/react-practices",
      "previewUrl": "https://preview.brightgift.com/posts/react-practices",
      "seo": {
        "score": 85,
        "readabilityScore": 78,
        "keywords": ["react", "javascript"],
        "metaTitle": "10 Best React Practices for 2024",
        "metaDescription": "Learn the top React practices..."
      },
      "social": [
        {
          "platform": "twitter",
          "content": "Check out these amazing React practices!",
          "image": "https://example.com/social-image.jpg",
          "scheduledAt": "2024-01-15T10:00:00Z",
          "publishedAt": "2024-01-15T10:00:00Z",
          "engagement": {
            "likes": 45,
            "shares": 12,
            "comments": 8
          }
        }
      ],
      "images": [
        {
          "type": "banner",
          "url": "https://example.com/banner.jpg",
          "alt": "React practices banner",
          "width": 1200,
          "height": 630,
          "optimized": true
        },
        {
          "type": "og",
          "url": "https://example.com/og-image.jpg",
          "alt": "Open Graph image",
          "width": 1200,
          "height": 630,
          "optimized": true
        }
      ],
      "metrics": {
        "views": 1250,
        "uniqueVisitors": 890,
        "pageViews": 1875,
        "likes": 45,
        "shares": 12,
        "comments": 8,
        "bounceRate": 0.35,
        "avgTimeOnPage": 180,
        "revenue": 45.50,
        "conversionRate": 0.025
      },
      "workflow": {
        "currentPhase": "live_deployment",
        "nextPhase": null,
        "phasesCompleted": ["seo_research", "content_generation", "content_review", "image_generation", "publishing", "approval"],
        "executions": [...]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 2. Get Single Post Details
```bash
GET /sites/{siteId}/posts/{postId}
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. Create New Post
```bash
POST /sites/{siteId}/posts
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "New Blog Post Title",
  "content": "Blog post content...",
  "excerpt": "Brief excerpt...",
  "tags": ["tag1", "tag2"],
  "author": "John Doe"
}
```

### 4. Update Post
```bash
PUT /sites/{siteId}/posts/{postId}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["updated", "tags"]
}
```

### 5. Approve Post
```bash
POST /sites/{siteId}/posts/{postId}/approve
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "comments": "Great post! Ready for publishing."
}
```

### 6. Reject Post
```bash
POST /sites/{siteId}/posts/{postId}/reject
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "reason": "Content needs more depth and better examples."
}
```

### 7. Publish Post
```bash
POST /sites/{siteId}/posts/{postId}/publish
Authorization: Bearer YOUR_JWT_TOKEN
```

### 8. Delete Post
```bash
DELETE /sites/{siteId}/posts/{postId}
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## ⚙️ Workflow Management

### 1. List Workflows for a Site
```bash
GET /sites/{siteId}/workflows?status=running&type=seo&page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `status`: Filter by status (pending, running, completed, failed, cancelled)
- `type`: Filter by type (seo, content, publish, social)
- `page`: Page number
- `limit`: Number of workflows per page

**Response:**
```json
{
  "workflows": [
    {
      "id": "wf_123",
      "name": "SEO Research - BrightGift",
      "type": "seo",
      "status": "running",
      "siteId": "site_123",
      "postId": "post_456",
      "startedAt": "2024-01-15T10:00:00Z",
      "completedAt": null,
      "progress": 65,
      "estimatedCompletion": "2024-01-15T11:30:00Z",
      "config": {
        "keywords": ["react", "javascript"],
        "targetAudience": "developers",
        "contentLength": "2000-3000"
      },
      "results": {
        "keywordsFound": 15,
        "competitionAnalysis": "medium",
        "searchVolume": "high"
      },
      "logs": [
        {
          "timestamp": "2024-01-15T10:05:00Z",
          "level": "info",
          "message": "Starting SEO research for keywords..."
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

### 2. Get Workflow Details
```bash
GET /sites/{siteId}/workflows/{workflowId}
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. Start New Workflow
```bash
POST /sites/{siteId}/workflows
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "type": "seo",
  "name": "SEO Research for React Topics",
  "config": {
    "keywords": ["react hooks", "react performance"],
    "targetAudience": "developers",
    "contentLength": "2000-3000",
    "language": "en"
  },
  "postId": "post_123"
}
```

### 4. Cancel Workflow
```bash
POST /sites/{siteId}/workflows/{workflowId}/cancel
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Retry Failed Workflow
```bash
POST /sites/{siteId}/workflows/{workflowId}/retry
Authorization: Bearer YOUR_JWT_TOKEN
```

### 6. Get Workflow Logs
```bash
GET /sites/{siteId}/workflows/{workflowId}/logs
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔌 WebSocket Real-time Updates

### Connect to WebSocket
```javascript
const ws = new WebSocket('ws://localhost:3001?siteId=site_123');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

### Available Events:
1. **workflow_update** - Workflow status changes
2. **post_update** - Post status changes
3. **health_update** - Site health score changes
4. **analytics_update** - New analytics data

### Event Data Structure:
```json
{
  "type": "workflow_update",
  "data": {
    "workflowId": "wf_123",
    "status": "completed",
    "progress": 100,
    "results": {
      "keywordsFound": 15,
      "contentGenerated": true
    }
  }
}
```

---

## 🔗 Webhook Integration (for n8n)

### 1. Workflow Status Updates
```bash
POST /webhooks/workflow-status
Content-Type: application/json
X-Webhook-Signature: sha256=YOUR_SIGNATURE

{
  "workflowId": "wf_123",
  "siteId": "site_123",
  "status": "completed",
  "progress": 100,
  "results": {
    "keywordsFound": 15,
    "contentGenerated": true
  },
  "timestamp": "2024-01-15T11:30:00Z"
}
```

### 2. Post Status Updates
```bash
POST /webhooks/post-status
Content-Type: application/json
X-Webhook-Signature: sha256=YOUR_SIGNATURE

{
  "postId": "post_123",
  "siteId": "site_123",
  "status": "published",
  "data": {
    "content": "Updated content...",
    "seo": {
      "score": 85,
      "keywords": ["react", "javascript"]
    },
    "social": [
      {
        "platform": "twitter",
        "content": "Social post content",
        "image": "social-image-url"
      }
    ],
    "images": [
      {
        "type": "banner",
        "url": "banner-image-url",
        "optimized": true
      }
    ]
  }
}
```

### 3. Analytics Updates
```bash
POST /webhooks/analytics
Content-Type: application/json
X-Webhook-Signature: sha256=YOUR_SIGNATURE

{
  "postId": "post_123",
  "siteId": "site_123",
  "metrics": {
    "views": 1250,
    "uniqueVisitors": 890,
    "revenue": 45.50,
    "conversionRate": 0.025
  }
}
```

---

## 📊 Data Models

### Post Status Values:
- `draft` - Initial draft
- `in_progress` - Being worked on
- `review` - Ready for review
- `approved` - Approved for publishing
- `rejected` - Rejected, needs revision
- `published` - Live on the site
- `failed` - Workflow failed

### Workflow Status Values:
- `pending` - Waiting to start
- `running` - Currently executing
- `completed` - Successfully finished
- `failed` - Execution failed
- `cancelled` - Manually cancelled

### Workflow Types:
- `seo` - SEO research and optimization
- `content` - Content generation
- `publish` - Publishing workflow
- `social` - Social media automation

### Image Types:
- `banner` - Main banner image
- `og` - Open Graph image
- `social` - Social media image
- `content` - Content image

---

## 🛠️ Error Handling

### Error Response Format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "title",
        "issue": "Title is required"
      }
    ]
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `WORKFLOW_ERROR` - Workflow execution failed
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd api-server
npm install
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your actual values
```

### 3. Set up Supabase
- Create Supabase project
- Run schema from `_workflow-documents/n8n-new-flow/supabase_schema_and_sql.md`
- Get API keys and update `.env`

### 4. Start Server
```bash
npm run dev  # Development
npm start    # Production
```

### 5. Test Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## 📝 Usage Examples

### Complete Workflow Example:
1. **Login and get token**
2. **List sites** to get siteId
3. **Start SEO workflow** for a new post
4. **Monitor workflow progress** via WebSocket
5. **Get workflow results** and create post
6. **Approve and publish** the post
7. **Monitor analytics** updates

### Dashboard Integration Example:
```javascript
// 1. Authenticate
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token } = await loginResponse.json();

// 2. Get user's sites
const sitesResponse = await fetch('/api/v1/sites', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { sites } = await sitesResponse.json();

// 3. Get posts for a site
const postsResponse = await fetch(`/api/v1/sites/${siteId}/posts`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { posts } = await postsResponse.json();

// 4. Set up real-time updates
const ws = new WebSocket(`ws://localhost:3001?siteId=${siteId}`);
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Update UI based on real-time data
};
```

---

## 🔗 Related Files

- `api-server/README.md` - Detailed API documentation
- `_workflow-documents/n8n-new-flow/supabase_schema_and_sql.md` - Database schema
- `_workflow-documents/API_ENDPOINTS_SPECIFICATION.md` - Complete endpoint specification
- `_workflow-documents/API_IMPLEMENTATION_PRIORITY_GUIDE.md` - Implementation phases

---

## 🚀 Next Steps

1. **Set up Supabase database** using the provided schema
2. **Configure environment variables** in `.env`
3. **Test authentication** and basic endpoints
4. **Integrate with n8n workflows** via webhooks
5. **Build frontend dashboard** using these endpoints
6. **Set up real-time updates** via WebSocket

The API is now ready to support your multi-site content automation system! 🎉 