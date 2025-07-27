# Example Site Configuration

## Content Types Example

```json
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
    },
    {
      "name": "news",
      "description": "Industry news and updates",
      "color": "#F59E0B"
    }
  ]
}
```

## Frontmatter Example

```yaml
---
title: "Your Post Title"
description: "SEO description for the post"
date: 2024-01-15
author: "Your Name"
contentType: "product-review"
category: "reviews"
tags: ["review", "product", "recommendation"]
image: "/images/post-image.webp"
ogImage: "/images/post-og-image.webp"
socialImage: "/images/post-social-image.webp"
keywords: ["keyword1", "keyword2", "keyword3"]
status: "draft"
excerpt: "Brief excerpt for previews"
wordCount: 1500
seoScore: 85
---
```

## API Endpoints Example

```bash
# Authentication
POST /api/v1/auth/login

# Site Management
GET /api/v1/sites/{siteId}
PUT /api/v1/sites/{siteId}/content-types

# Content Management
POST /api/v1/sites/{siteId}/posts
GET /api/v1/sites/{siteId}/posts
GET /api/v1/sites/{siteId}/search/posts

# Analytics
GET /api/v1/sites/{siteId}/analytics
GET /api/v1/sites/{siteId}/content-types/usage
```
