# API Endpoints Specification for Individual Site Dashboard

## Overview
This document outlines all the API endpoints needed to support the individual site dashboard functionality. These endpoints will replace the mock data and provide real-time data from the backend systems (n8n workflows, Supabase database, etc.).

## Base URL
```
https://api.multisitehub.com/v1
```

## Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

---

## Site Management Endpoints

### Get Site Details
```
GET /sites/{siteId}
```
**Response:**
```json
{
  "id": "site_123",
  "name": "TechBlog Pro",
  "url": "https://techblogpro.com",
  "status": "active",
  "healthScore": 85,
  "metrics": {
    "totalPosts": 45,
    "publishedPosts": 42,
    "draftPosts": 3,
    "monthlyViews": 12500,
    "monthlyRevenue": 2400,
    "activeWorkflows": 2
  },
  "lastUpdated": "2024-01-15T10:30:00Z",
  "createdAt": "2023-06-15T08:00:00Z",
  "settings": {
    "theme": "default",
    "autoPublish": true,
    "seoOptimization": true
  }
}
```

### Update Site Settings
```
PUT /sites/{siteId}
```
**Request Body:**
```json
{
  "name": "Updated Site Name",
  "url": "https://newsite.com",
  "settings": {
    "autoPublish": false,
    "seoOptimization": true
  }
}
```

---

## Blog Posts Endpoints

### Get All Posts for Site
```
GET /sites/{siteId}/posts
```
**Query Parameters:**
- `status` (optional): Filter by status (draft, published, review, failed)
- `page` (optional): Page number for pagination
- `limit` (optional): Number of posts per page (default: 20)
- `sort` (optional): Sort by (created_at, updated_at, title)
- `order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "posts": [
    {
      "id": "post_123",
      "title": "10 Best React Practices for 2024",
      "status": "published",
      "siteId": "site_123",
      "createdAt": "2024-01-10T14:30:00Z",
      "updatedAt": "2024-01-12T16:45:00Z",
      "publishedAt": "2024-01-12T16:45:00Z",
      "author": "John Doe",
      "tags": ["react", "javascript", "frontend"],
      "content": "Full blog post content...",
      "excerpt": "Brief excerpt...",
      "featuredImage": "https://example.com/image.jpg",
      "url": "https://techblogpro.com/posts/react-practices-2024",
      "metrics": {
        "views": 1250,
        "likes": 45,
        "shares": 12,
        "comments": 8
      },
      "seo": {
        "metaTitle": "10 Best React Practices for 2024",
        "metaDescription": "Learn the top React practices...",
        "keywords": ["react", "javascript", "frontend"],
        "slug": "react-practices-2024"
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

### Get Single Post
```
GET /sites/{siteId}/posts/{postId}
```

### Create New Post
```
POST /sites/{siteId}/posts
```
**Request Body:**
```json
{
  "title": "New Blog Post Title",
  "content": "Blog post content...",
  "excerpt": "Brief excerpt...",
  "tags": ["tag1", "tag2"],
  "author": "John Doe",
  "featuredImage": "https://example.com/image.jpg",
  "seo": {
    "metaTitle": "SEO Title",
    "metaDescription": "SEO Description",
    "keywords": ["keyword1", "keyword2"],
    "slug": "custom-slug"
  }
}
```

### Update Post
```
PUT /sites/{siteId}/posts/{postId}
```

### Delete Post
```
DELETE /sites/{siteId}/posts/{postId}
```

### Publish Post
```
POST /sites/{siteId}/posts/{postId}/publish
```

### Unpublish Post
```
POST /sites/{siteId}/posts/{postId}/unpublish
```

---

## Workflow Management Endpoints

### Get All Workflows for Site
```
GET /sites/{siteId}/workflows
```
**Query Parameters:**
- `status` (optional): Filter by status (running, completed, failed, pending)
- `type` (optional): Filter by type (seo, content, publish, social)
- `page` (optional): Page number for pagination
- `limit` (optional): Number of workflows per page

**Response:**
```json
{
  "workflows": [
    {
      "id": "workflow_123",
      "name": "SEO Research - TechBlog Pro",
      "type": "seo",
      "status": "running",
      "siteId": "site_123",
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

### Get Single Workflow
```
GET /sites/{siteId}/workflows/{workflowId}
```

### Start New Workflow
```
POST /sites/{siteId}/workflows
```
**Request Body:**
```json
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

### Cancel Workflow
```
POST /sites/{siteId}/workflows/{workflowId}/cancel
```

### Retry Failed Workflow
```
POST /sites/{siteId}/workflows/{workflowId}/retry
```

### Get Workflow Logs
```
GET /sites/{siteId}/workflows/{workflowId}/logs
```

---

## Analytics Endpoints

### Get Site Analytics
```
GET /sites/{siteId}/analytics
```
**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, 1y)
- `startDate` (optional): Custom start date
- `endDate` (optional): Custom end date

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
  }
}
```

### Get Post Analytics
```
GET /sites/{siteId}/posts/{postId}/analytics
```

### Get Workflow Analytics
```
GET /sites/{siteId}/workflows/analytics
```

---

## Health Score Endpoints

### Get Site Health Score
```
GET /sites/{siteId}/health
```
**Response:**
```json
{
  "score": 85,
  "factors": [
    {
      "name": "Content Freshness",
      "value": 90,
      "weight": 0.3,
      "description": "Content is regularly updated"
    },
    {
      "name": "SEO Performance",
      "value": 75,
      "weight": 0.25,
      "description": "Good keyword rankings"
    },
    {
      "name": "Traffic Growth",
      "value": 80,
      "weight": 0.2,
      "description": "Steady traffic increase"
    },
    {
      "name": "Revenue Performance",
      "value": 85,
      "weight": 0.15,
      "description": "Meeting revenue targets"
    },
    {
      "name": "Technical Health",
      "value": 95,
      "weight": 0.1,
      "description": "Site loads quickly"
    }
  ],
  "lastCalculated": "2024-01-15T10:30:00Z",
  "recommendations": [
    "Improve SEO meta descriptions",
    "Add more internal links",
    "Optimize images for faster loading"
  ]
}
```

---

## Activity Feed Endpoints

### Get Site Activity
```
GET /sites/{siteId}/activity
```
**Query Parameters:**
- `type` (optional): Filter by activity type
- `page` (optional): Page number
- `limit` (optional): Number of activities per page

**Response:**
```json
{
  "activities": [
    {
      "id": "activity_123",
      "type": "post_published",
      "message": "New post published: '10 Best React Practices for 2024'",
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
      }
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

---

## Error Handling

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
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `WORKFLOW_ERROR`: Workflow execution failed
- `RATE_LIMITED`: Too many requests

---

## Webhook Endpoints

### Workflow Status Updates
```
POST /webhooks/workflow-status
```
**Headers:**
```
X-Webhook-Signature: <signature>
```

**Body:**
```json
{
  "workflowId": "workflow_123",
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

### Post Status Updates
```
POST /webhooks/post-status
```

### Site Health Updates
```
POST /webhooks/site-health
```

---

## Real-time Updates

For real-time updates, use WebSocket connections:

```
wss://api.multisitehub.com/v1/ws/sites/{siteId}
```

**Events:**
- `workflow_update`: Workflow progress/status changes
- `post_update`: Post status changes
- `analytics_update`: New analytics data
- `health_update`: Health score changes

---

## Rate Limiting

- **Standard endpoints**: 1000 requests per hour
- **Analytics endpoints**: 100 requests per hour
- **Workflow endpoints**: 50 requests per hour
- **WebSocket connections**: 10 concurrent connections per user

---

## Implementation Notes

1. **Caching**: Analytics data should be cached for 5-15 minutes
2. **Pagination**: All list endpoints support pagination
3. **Filtering**: Most endpoints support filtering by status, date, etc.
4. **Real-time**: Use WebSockets for live updates
5. **Security**: All endpoints require authentication and site-specific authorization
6. **Monitoring**: All endpoints should be monitored for performance and errors 