# API Usage Guide for Multi-Site Content Automation

## Overview
This guide provides complete documentation for using the multi-site content automation API server. The API manages blog posts, workflows, analytics, activity feeds, and real-time updates across multiple sites.

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

**Response:**
```json
{
  "posts": [
    {
      "id": "post_123",
      "title": "10 Best React Practices for 2024",
      "status": "published",
      "wordCount": 2500,
      "seo": {
        "score": 85,
        "keywords": ["react", "javascript", "frontend"]
      },
      "social": [
        {
          "platform": "twitter",
          "content": "Check out these React best practices!",
          "image": "social-image-url"
        }
      ],
      "images": [
        {
          "type": "banner",
          "url": "banner-image-url",
          "optimized": true
        }
      ],
      "metrics": {
        "views": 1250,
        "likes": 45,
        "shares": 12,
        "revenue": 25.50
      },
      "workflow": {
        "currentPhase": "published",
        "phasesCompleted": ["seo_research", "content_generation", "image_generation"]
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
  "tags": ["tag1", "tag2"],
  "seoKeywords": ["keyword1", "keyword2"]
}
```

### 4. Update Post
```bash
PUT /sites/{siteId}/posts/{postId}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

### 5. Publish Post
```bash
POST /sites/{siteId}/posts/{postId}/publish
Authorization: Bearer YOUR_JWT_TOKEN
```

### 6. Approve Post
```bash
POST /sites/{siteId}/posts/{postId}/approve
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 Analytics Endpoints

### 1. Get Site Analytics
```bash
GET /sites/{siteId}/analytics?period=30d&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "traffic": {
    "totalViews": 12500,
    "uniqueVisitors": 8900,
    "pageViews": 18750,
    "bounceRate": 0.35,
    "avgSessionDuration": 180,
    "trends": [
      {
        "date": "2024-01-15",
        "views": 450,
        "visitors": 320
      }
    ]
  },
  "revenue": {
    "totalRevenue": 2400,
    "affiliateRevenue": 1800,
    "adRevenue": 600,
    "conversionRate": 0.025,
    "trends": [
      {
        "date": "2024-01-15",
        "revenue": 85,
        "conversions": 2
      }
    ]
  },
  "content": {
    "topPosts": [
      {
        "id": "post_123",
        "title": "10 Best React Practices",
        "views": 1250,
        "revenue": 45
      }
    ],
    "postPerformance": {
      "published": 42,
      "draft": 3,
      "avgViewsPerPost": 298
    }
  },
  "seo": {
    "organicTraffic": 8900,
    "keywords": 156,
    "avgPosition": 12.5,
    "clickThroughRate": 0.045
  },
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z",
    "days": 31
  }
}
```

### 2. Get Post Analytics
```bash
GET /sites/{siteId}/analytics/posts/{postId}
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "postId": "post_123",
  "siteId": "site_123",
  "views": 1250,
  "uniqueVisitors": 980,
  "pageViews": 1350,
  "likes": 45,
  "shares": 12,
  "comments": 8,
  "bounceRate": 0.25,
  "avgTimeOnPage": 180,
  "revenue": 25.50,
  "conversionRate": 0.02,
  "social": [
    {
      "platform": "twitter",
      "content": "Check out this post!",
      "engagement": {
        "likes": 15,
        "retweets": 5,
        "clicks": 23
      },
      "publishedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "seo": {
    "score": 85,
    "keywords": ["react", "javascript"],
    "metaTitle": "10 Best React Practices for 2024",
    "metaDescription": "Learn the top React practices...",
    "readabilityScore": 78
  },
  "lastUpdated": "2024-01-15T16:45:00Z"
}
```

### 3. Get Workflow Analytics
```bash
GET /sites/{siteId}/analytics/workflows?period=30d&phase=seo_research
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "siteId": "site_123",
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z",
    "days": 31
  },
  "totalWorkflows": 25,
  "successRate": 92.5,
  "avgDuration": 180,
  "avgPerformanceScore": 87.3,
  "phaseBreakdown": {
    "seo_research": {
      "total": 10,
      "successful": 9,
      "successRate": 90,
      "avgDuration": 120
    },
    "content_generation": {
      "total": 8,
      "successful": 8,
      "successRate": 100,
      "avgDuration": 300
    }
  },
  "errorAnalysis": {
    "execution_error": 2,
    "timeout": 1
  },
  "performanceTrends": [
    {
      "date": "2024-01-15",
      "successRate": 95.5,
      "workflows": 3
    }
  ]
}
```

---

## 📈 Activity Feed

### 1. Get Site Activity
```bash
GET /sites/{siteId}/activity?type=post_published&page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "activities": [
    {
      "id": "activity_123",
      "type": "post_published",
      "message": "Published a blog post: \"10 Best React Practices for 2024\"",
      "timestamp": "2024-01-15T10:30:00Z",
      "siteId": "site_123",
      "userId": "user_456",
      "user": {
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "metadata": {
        "postId": "post_123",
        "postTitle": "10 Best React Practices for 2024"
      },
      "postId": "post_123"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 2. Get Activity Statistics
```bash
GET /sites/{siteId}/activity/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "totalActivities": 150,
  "actionBreakdown": {
    "post_published": 45,
    "workflow_completed": 30,
    "post_approved": 25,
    "seo_research_completed": 20
  },
  "dailyActivity": {
    "2024-01-15": 5,
    "2024-01-14": 3,
    "2024-01-13": 7
  },
  "topUsers": [
    {
      "userId": "user_456",
      "name": "John Doe",
      "count": 45
    }
  ],
  "period": {
    "start": "2023-12-16T00:00:00Z",
    "end": "2024-01-15T23:59:59Z",
    "days": 30
  }
}
```

---

## 🌐 Global Dashboard

### 1. Get Global Overview
```bash
GET /dashboard/overview
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "totalSites": 3,
  "totalPosts": 125,
  "publishedPosts": 110,
  "draftPosts": 15,
  "totalWorkflows": 45,
  "activeWorkflows": 3,
  "completedWorkflows": 40,
  "avgHealthScore": 82.5,
  "totalRevenue": 1250.75,
  "totalViews": 45000,
  "recentActivity": [
    {
      "id": "activity_123",
      "type": "post_published",
      "message": "Published a blog post: \"React Best Practices\"",
      "timestamp": "2024-01-15T10:30:00Z",
      "siteId": "site_123",
      "siteName": "BrightGift",
      "metadata": {}
    }
  ],
  "topPerformingSites": [
    {
      "id": "site_123",
      "name": "BrightGift",
      "url": "https://brightgift.com",
      "healthScore": 85,
      "postsCount": 45,
      "publishedPosts": 42,
      "activeWorkflows": 2,
      "totalViews": 25000,
      "totalRevenue": 750.25
    }
  ],
  "systemHealth": "excellent",
  "period": {
    "start": "2023-12-16T00:00:00Z",
    "end": "2024-01-15T23:59:59Z",
    "days": 30
  }
}
```

### 2. Get Global Analytics
```bash
GET /dashboard/global-analytics?period=30d
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "traffic": {
    "totalViews": 45000,
    "uniqueVisitors": 32000,
    "trends": [
      {
        "date": "2024-01-15",
        "views": 1500,
        "visitors": 1100
      }
    ]
  },
  "revenue": {
    "totalRevenue": 1250.75,
    "affiliateRevenue": 950.50,
    "adRevenue": 300.25,
    "trends": [
      {
        "date": "2024-01-15",
        "revenue": 45.25
      }
    ]
  },
  "content": {
    "totalPosts": 125,
    "publishedPosts": 110,
    "draftPosts": 15,
    "trends": [
      {
        "date": "2024-01-15",
        "total": 3,
        "published": 2,
        "draft": 1
      }
    ]
  },
  "workflows": {
    "totalWorkflows": 45,
    "successRate": 92.5,
    "avgDuration": 180,
    "trends": [
      {
        "date": "2024-01-15",
        "total": 2,
        "successful": 2,
        "successRate": 100
      }
    ]
  },
  "period": {
    "start": "2023-12-16T00:00:00Z",
    "end": "2024-01-15T23:59:59Z",
    "days": 30
  }
}
```

### 3. Get Recent Activity Across All Sites
```bash
GET /dashboard/recent-activity?limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## ⚙️ Workflow Management

### 1. List Workflows
```bash
GET /sites/{siteId}/workflows?status=running&type=seo&page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
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
  }
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
4. **activity_update** - New activity logged
5. **analytics_update** - Analytics data updated

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
    "uniqueVisitors": 980,
    "likes": 45,
    "shares": 12,
    "revenue": 25.50
  }
}
```

---

## 📊 Query Parameters

### Common Parameters
- `page` - Page number for pagination (default: 1)
- `limit` - Number of items per page (default: 20, max: 100)
- `sort` - Sort field (e.g., `created_at`, `title`, `views`)
- `order` - Sort order (`asc` or `desc`)

### Analytics Parameters
- `period` - Time period (`7d`, `30d`, `90d`, `1y`)
- `startDate` - Custom start date (ISO 8601)
- `endDate` - Custom end date (ISO 8601)

### Filtering Parameters
- `status` - Filter by status (e.g., `published`, `draft`, `running`)
- `type` - Filter by type (e.g., `seo`, `content`, `post_published`)

---

## 🔐 Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "title",
      "issue": "Title is required"
    }
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `WORKFLOW_ERROR` - Workflow execution failed
- `RATE_LIMITED` - Too many requests

---

## 🚀 Best Practices

1. **Authentication**: Always include the JWT token in the Authorization header
2. **Pagination**: Use pagination for large datasets to improve performance
3. **Real-time Updates**: Use WebSocket connections for live updates
4. **Error Handling**: Always handle error responses gracefully
5. **Rate Limiting**: Respect rate limits (1000 requests/hour for standard endpoints)
6. **Caching**: Cache analytics data for 5-15 minutes to reduce API calls
7. **Webhooks**: Use webhook signatures for security when integrating with n8n

---

## 📝 Example Usage

### Complete Workflow Example
```javascript
// 1. Login and get token
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// 2. Get user's sites
const sitesResponse = await fetch('/api/v1/sites', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { sites } = await sitesResponse.json();

// 3. Start a workflow
const workflowResponse = await fetch(`/api/v1/sites/${sites[0].id}/workflows`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'seo',
    name: 'SEO Research',
    config: { keywords: ['react', 'javascript'] }
  })
});

// 4. Monitor with WebSocket
const ws = new WebSocket(`ws://localhost:3001?siteId=${sites[0].id}`);
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Workflow update:', update);
};
```

This comprehensive API provides everything needed to build a powerful multi-site content automation dashboard with real-time updates, analytics, and workflow management. 