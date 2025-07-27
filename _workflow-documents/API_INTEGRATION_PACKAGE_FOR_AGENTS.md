# 🚀 API Integration Package for Multi-Site Agents

This package contains everything other site agents need to integrate with the Multi-Site Hub API.

## 📋 Quick Start

1. **Read the [API Integration Guide](#api-integration-guide)** - Core integration instructions
2. **Review the [Content Type System](#content-type-system)** - How to categorize content
3. **Check the [Frontmatter Schema](#frontmatter-schema)** - Standardized metadata format
4. **Use the [API Reference](#api-reference)** - Complete endpoint documentation

---

## 🔗 API Integration Guide

### Authentication
All API calls require JWT authentication:

```bash
# Login to get token
curl -X POST https://your-hub.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "agent@yoursite.com", "password": "your-password"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-hub.com/api/v1/sites
```

### Site Registration
1. **Register your site** with the hub
2. **Configure content types** specific to your theme
3. **Start sending post data** via the API

### Content Submission Flow
1. Create post with standardized frontmatter
2. Submit to hub via API
3. Track workflow status
4. Receive approval/publishing updates

---

## 📝 Content Type System

### Overview
Each site defines its own content types based on their theme. The hub supports flexible categorization.

### Setting Up Content Types
```bash
# Get suggested content types for your site
GET /api/v1/sites/{siteId}/content-types/suggestions

# Configure your content types
PUT /api/v1/sites/{siteId}/content-types
{
  "contentTypes": [
    {
      "name": "product-review",
      "description": "Product reviews and recommendations",
      "color": "#3B82F6"
    },
    {
      "name": "educational",
      "description": "How-to guides and tutorials", 
      "color": "#10B981"
    }
  ]
}
```

### Example Content Types by Theme

**Cannabis Sites:**
- `product-review`, `strain-guide`, `educational`, `legal-updates`, `wellness-tips`

**Baby/Parenting Sites:**
- `development-guide`, `product-review`, `parenting-tips`, `safety-guide`, `feeding-guide`

**Tech Sites:**
- `tutorial`, `product-review`, `news`, `how-to`, `comparison`

**Gift Sites:**
- `gift-guide`, `product-review`, `seasonal`, `educational`

---

## 📄 Frontmatter Schema

### Standardized Frontmatter Format
All blog posts should use this standardized frontmatter format:

```yaml
---
title: "Your Post Title"
description: "SEO description for the post"
date: 2024-01-15
author: "Your Name"
contentType: "product-review"  # Your site's content type
category: "reviews"            # Optional subcategory
tags: ["review", "product", "recommendation"]
image: "/images/post-image.webp"
ogImage: "/images/post-og-image.webp"
socialImage: "/images/post-social-image.webp"
keywords: ["keyword1", "keyword2", "keyword3"]
status: "draft"                # draft, published, review
excerpt: "Brief excerpt for previews"
wordCount: 1500
seoScore: 85
---
```

### Required Fields
- `title`: Post title
- `description`: SEO description
- `date`: Publication date
- `contentType`: Your site's content type
- `status`: Post status

### Optional Fields
- `category`: Subcategory
- `tags`: Array of tags
- `image`: Featured image
- `ogImage`: Open Graph image
- `socialImage`: Social media image
- `keywords`: SEO keywords
- `excerpt`: Post excerpt
- `wordCount`: Word count
- `seoScore`: SEO score

---

## 🔌 API Reference

### Core Endpoints

#### Authentication
```bash
POST /api/v1/auth/login          # Login
POST /api/v1/auth/register       # Register
GET /api/v1/auth/me              # Get current user
```

#### Sites
```bash
GET /api/v1/sites                                    # List sites
GET /api/v1/sites/{siteId}                          # Get site details
PUT /api/v1/sites/{siteId}                          # Update site
GET /api/v1/sites/{siteId}/content-types            # Get content types
PUT /api/v1/sites/{siteId}/content-types            # Update content types
GET /api/v1/sites/{siteId}/content-types/suggestions # Get suggestions
```

#### Blog Posts
```bash
GET /api/v1/sites/{siteId}/posts                    # List posts
GET /api/v1/sites/{siteId}/posts/{postId}           # Get post details
POST /api/v1/sites/{siteId}/posts                   # Create post
PUT /api/v1/sites/{siteId}/posts/{postId}           # Update post
DELETE /api/v1/sites/{siteId}/posts/{postId}        # Delete post
POST /api/v1/sites/{siteId}/posts/{postId}/publish  # Publish post
POST /api/v1/sites/{siteId}/posts/{postId}/approve  # Approve post
```

#### Search & Filtering
```bash
GET /api/v1/sites/{siteId}/search/posts?contentType=product-review
GET /api/v1/sites/{siteId}/search/posts?status=published
GET /api/v1/sites/{siteId}/search/posts?tags=review,recommendation
```

#### Bulk Operations
```bash
POST /api/v1/sites/{siteId}/bulk/posts/approve      # Bulk approve
POST /api/v1/sites/{siteId}/bulk/posts/reject       # Bulk reject
POST /api/v1/sites/{siteId}/bulk/posts/publish      # Bulk publish
POST /api/v1/sites/{siteId}/bulk/posts/update-by-content-type # Update by type
```

#### Analytics
```bash
GET /api/v1/sites/{siteId}/analytics                # Site analytics
GET /api/v1/sites/{siteId}/analytics/posts/{postId} # Post analytics
```

### Response Format
All API responses follow this format:

```json
{
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

---

## 🛠️ Integration Examples

### Example 1: Cannabis Site Agent

```javascript
// 1. Configure content types
const contentTypes = [
  { name: "strain-guide", description: "Cannabis strain information", color: "#3B82F6" },
  { name: "product-review", description: "Product reviews", color: "#10B981" },
  { name: "legal-updates", description: "Legal updates", color: "#EF4444" },
  { name: "wellness-tips", description: "Health tips", color: "#06B6D4" }
];

await fetch(`/api/v1/sites/${siteId}/content-types`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ contentTypes })
});

// 2. Submit a post
const post = {
  title: "Best CBD Strains for Anxiety",
  description: "Top CBD strains for anxiety relief",
  contentType: "strain-guide",
  content: "# Best CBD Strains for Anxiety...",
  tags: ["cbd", "anxiety", "strains"],
  status: "draft"
};

await fetch(`/api/v1/sites/${siteId}/posts`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(post)
});
```

### Example 2: Baby Site Agent

```javascript
// 1. Get suggested content types
const suggestions = await fetch(`/api/v1/sites/${siteId}/content-types/suggestions`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 2. Configure content types
const contentTypes = [
  { name: "development-guide", description: "Child development guides", color: "#3B82F6" },
  { name: "product-review", description: "Baby product reviews", color: "#10B981" },
  { name: "parenting-tips", description: "Parenting advice", color: "#8B5CF6" },
  { name: "safety-guide", description: "Safety information", color: "#EF4444" }
];

// 3. Submit a post
const post = {
  title: "Best Baby Monitors 2024",
  description: "Top baby monitors for new parents",
  contentType: "product-review",
  content: "# Best Baby Monitors 2024...",
  tags: ["baby-monitor", "safety", "reviews"],
  status: "draft"
};
```

### Example 3: Tech Site Agent

```javascript
// 1. Configure content types
const contentTypes = [
  { name: "tutorial", description: "Step-by-step tutorials", color: "#3B82F6" },
  { name: "product-review", description: "Tech product reviews", color: "#10B981" },
  { name: "news", description: "Technology news", color: "#F59E0B" },
  { name: "comparison", description: "Product comparisons", color: "#06B6D4" }
];

// 2. Submit a tutorial
const post = {
  title: "How to Set Up a Home Server",
  description: "Complete guide to setting up a home server",
  contentType: "tutorial",
  content: "# How to Set Up a Home Server...",
  tags: ["server", "tutorial", "home-lab"],
  status: "draft"
};
```

---

## 📊 Monitoring & Analytics

### Track Post Performance
```bash
# Get post analytics
GET /api/v1/sites/{siteId}/analytics/posts/{postId}

# Get content type performance
GET /api/v1/sites/{siteId}/content-types/usage
```

### Monitor Workflow Status
```bash
# Get post status
GET /api/v1/sites/{siteId}/posts/{postId}

# Check workflow progress
GET /api/v1/sites/{siteId}/workflows
```

---

## 🔧 Best Practices

### Content Type Naming
- Use kebab-case: `product-review`, `strain-guide`
- Be descriptive but concise
- Keep consistent across your site

### Frontmatter Consistency
- Always include required fields
- Use consistent tag naming
- Optimize images for different platforms

### API Usage
- Implement proper error handling
- Use pagination for large datasets
- Cache responses when appropriate
- Monitor rate limits

### Workflow Integration
- Track post status changes
- Respond to approval/rejection notifications
- Update local content based on hub feedback

---

## 📞 Support & Resources

### Documentation
- [Complete API Documentation](../api-server/README.md)
- [Frontmatter Schema Guide](../_workflow-documents/STANDARDIZED_FRONTMATTER_SCHEMA.md)
- [Database Schema](../_workflow-documents/n8n-new-flow/supabase_schema_and_sql.md)

### Integration Help
- Review the [API Integration Guide](#api-integration-guide) above
- Check the [Content Type System](#content-type-system) for your theme
- Use the [API Reference](#api-reference) for endpoint details

### Testing
- Use the health check endpoint: `GET /health`
- Test with sample data before production
- Validate frontmatter format

---

## 🎯 Next Steps

1. **Review this package** and understand the integration requirements
2. **Set up authentication** with the hub
3. **Configure content types** for your site theme
4. **Implement the frontmatter schema** in your content creation
5. **Start submitting posts** via the API
6. **Monitor performance** and analytics

The hub is designed to be flexible and support any site theme. Your content types and categorization can be completely customized to match your site's needs while still integrating seamlessly with the multi-site management system. 