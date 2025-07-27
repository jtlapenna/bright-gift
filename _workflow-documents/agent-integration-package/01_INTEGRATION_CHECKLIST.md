# ✅ Agent Integration Checklist

Use this checklist to integrate your site with the Multi-Site Hub API.

## 🔐 Authentication Setup
- [ ] Get API credentials from hub admin
- [ ] Test login endpoint: `POST /api/v1/auth/login`
- [ ] Verify JWT token works with protected endpoints
- [ ] Set up token refresh mechanism

## 🏗️ Site Configuration
- [ ] Register your site with the hub
- [ ] Get your `siteId` from the hub
- [ ] Test site access: `GET /api/v1/sites/{siteId}`

## 📝 Content Type Setup
- [ ] Get content type suggestions: `GET /api/v1/sites/{siteId}/content-types/suggestions`
- [ ] Review suggested content types for your theme
- [ ] Configure your content types: `PUT /api/v1/sites/{siteId}/content-types`
- [ ] Verify content types are saved: `GET /api/v1/sites/{siteId}/content-types`

## 📄 Frontmatter Implementation
- [ ] Review the standardized frontmatter schema
- [ ] Update your content creation process to include required fields:
  - [ ] `title`
  - [ ] `description`
  - [ ] `date`
  - [ ] `contentType` (your site's content type)
  - [ ] `status`
- [ ] Add optional fields as needed:
  - [ ] `category`
  - [ ] `tags`
  - [ ] `image`
  - [ ] `ogImage`
  - [ ] `socialImage`
  - [ ] `keywords`
  - [ ] `excerpt`
  - [ ] `wordCount`
  - [ ] `seoScore`

## 🔌 API Integration
- [ ] Test post creation: `POST /api/v1/sites/{siteId}/posts`
- [ ] Test post retrieval: `GET /api/v1/sites/{siteId}/posts`
- [ ] Test post update: `PUT /api/v1/sites/{siteId}/posts/{postId}`
- [ ] Test search functionality: `GET /api/v1/sites/{siteId}/search/posts`
- [ ] Test content type filtering: `?contentType=your-content-type`

## 📊 Monitoring Setup
- [ ] Test analytics endpoint: `GET /api/v1/sites/{siteId}/analytics`
- [ ] Test content type usage: `GET /api/v1/sites/{siteId}/content-types/usage`
- [ ] Set up workflow status monitoring
- [ ] Implement error handling for API calls

## 🧪 Testing
- [ ] Create test posts with different content types
- [ ] Verify posts appear in hub dashboard
- [ ] Test bulk operations if needed
- [ ] Verify analytics data is being collected
- [ ] Test error scenarios (invalid data, network issues)

## 🚀 Production Deployment
- [ ] Update production environment variables
- [ ] Deploy updated content creation process
- [ ] Monitor first few posts in production
- [ ] Verify analytics are working correctly
- [ ] Set up alerts for API failures

## 📈 Optimization
- [ ] Review content type performance analytics
- [ ] Optimize content types based on performance
- [ ] Implement caching for API responses
- [ ] Set up automated content submission if needed

## 📞 Support
- [ ] Save hub admin contact information
- [ ] Document your integration process
- [ ] Set up monitoring for API health
- [ ] Plan for API version updates

---

## 🎯 Quick Reference

### Essential Endpoints
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

### Required Frontmatter Fields
```yaml
---
title: "Your Post Title"
description: "SEO description"
date: 2024-01-15
contentType: "your-content-type"
status: "draft"
---
```

### Common Content Types by Theme
- **Cannabis**: `strain-guide`, `product-review`, `legal-updates`, `wellness-tips`
- **Baby**: `development-guide`, `product-review`, `parenting-tips`, `safety-guide`
- **Tech**: `tutorial`, `product-review`, `news`, `how-to`, `comparison`
- **Gift**: `gift-guide`, `product-review`, `seasonal`, `educational`

---

**Need help?** Check the [API Integration Package](./API_INTEGRATION_PACKAGE_FOR_AGENTS.md) for detailed documentation and examples. 