# Multi-Site Quick Reference Guide for Agents

## Overview

This quick reference guide provides essential information for agents working with the multi-tenant blog system. Use this guide for quick lookups and common tasks.

## Table of Contents

1. [Essential Frontmatter](#essential-frontmatter)
2. [Affiliate Integration](#affiliate-integration)
3. [API Endpoints](#api-endpoints)
4. [Common Tasks](#common-tasks)
5. [Troubleshooting](#troubleshooting)

## Essential Frontmatter

### Minimum Required Fields

```yaml
---
title: "Your Post Title"
description: "Post description under 160 characters"
date: '2024-12-19'
status: published
category: gift-guide
content_type: gift-guide
metaTitle: "SEO Title | {Brand}"
metaDescription: "SEO description under 160 characters"
keywords:
  - primary keyword
  - secondary keyword
image: /images/blog/post-banner.webp
ogImage: /images/blog/post-og.webp
 
# Dashboard analytics (recommended)
wordCount: 0
readTime: 0
seoScore: 0
readabilityScore: 0

# Multi-site/workflow (recommended)
siteId: {site-id}
postId: {post-or-workflow-id}
workflowId: {workflow-id}
generatedAt: '2025-01-01T00:00:00.000Z'
lastUpdated: '2025-01-01T00:00:00.000Z'

# Affiliates (flexible per site)
affiliateDisclosure: false
affiliatePlatforms: { }
affiliateLinks: [ ]
---
```

### Quick Template

```yaml
---
title: "25 Best Gifts for [Recipient] Under $[Budget]"
description: "Discover [number] thoughtful gifts for [recipient] under $[budget]. [Benefit statement]."
date: '2024-12-19'
status: published
category: gift-guide
content_type: gift-guide
tags:
  - gifts
  - [recipient]
  - under-[budget]
  - [occasion]

# Target Audience
recipient: [moms/dads/kids/couples/etc]
budget: [under-25/25-50/50-100/100-250/250-plus]
occasion: [birthday/anniversary/holiday/etc]

# SEO
metaTitle: "[Number] Best Gifts for [Recipient] Under $[Budget] | {Brand}"
metaDescription: "Discover [number] thoughtful gifts for [recipient] under $[budget]. [Benefit statement]."
keywords:
  - gifts for [recipient]
  - [recipient] gifts under [budget]
  - [occasion] gifts for [recipient]
  - affordable [recipient] gifts

# Images
image: /images/blog/[post-slug]/banner.webp
ogImage: /images/blog/[post-slug]/og.webp
socialImage: /images/blog/[post-slug]/social.webp

# Social Media
socialTitle: "[Number] Best Gifts for [Recipient] 🎁"
socialDescription: "Discover perfect gifts for [recipient]! [Benefit statement]. #gifts #[recipient] #[occasion]"
hashtags:
  - gifts
  - [recipient]
  - [occasion]
  - affordable

# Affiliates (counts + links)
affiliateDisclosure: false
affiliatePlatforms: { amazon: 0, bookshop: 0, afrofiliate: 0 }
affiliateLinks:
  - { text: "Example Product", url: "https://...", platform: "amazon", price: "$25-$40", description: "Short description." }

# Analytics
priority: high
featured: true
reading_time: 8
difficulty: beginner

# Multi-Site
site_id: {site-name}
language: en-US
region: US

# Dashboard analytics (recommended)
wordCount: 0
readTime: 0
seoScore: 0
readabilityScore: 0

# Multi-site/workflow (recommended)
siteId: {site-id}
postId: {post-or-workflow-id}
workflowId: {workflow-id}
generatedAt: '2025-01-01T00:00:00.000Z'
lastUpdated: '2025-01-01T00:00:00.000Z'
---
```

## Affiliate Integration

### Required for Affiliate Posts

```yaml
# In frontmatter
affiliate_disclosure: true

# OR in content
This post contains affiliate links. We may earn a commission if you click through and make a purchase, at no additional cost to you.
```

### Supported Link Formats

#### Amazon
```markdown
[View on Amazon](https://www.amazon.com/s?k=keyword&tag={site-tag})
```
```html
<a href="https://www.amazon.com/s?k=keyword&tag={site-tag}" class="amazon-link" target="_blank" rel="noopener">View on Amazon</a>
```

#### Bookshop.org
```markdown
[View on Bookshop.org](https://bookshop.org/search?keywords=keyword&affiliate={site-id})
```
```html
<a href="https://bookshop.org/a/{site-id}/ISBN" class="bookshop-link" target="_blank" rel="noopener">View on Bookshop.org</a>
```

#### Afrofiliate
```markdown
[View on Afrofiliate](https://afrofiliate.com/search?q=keyword&ref={site-id})
```
```html
<a href="https://afrofiliate.com/search?q=keyword&ref={site-id}" class="afrofiliate-link" target="_blank" rel="noopener">View on Afrofiliate</a>
```

### Affiliates Data Model (for dashboard)

```yaml
# Counts per platform (flexible keys per site)
affiliatePlatforms: { amazon: 12, bookshop: 2, afrofiliate: 1 }

# Full link list for auditing and analytics
affiliateLinks:
  - text: "Product Name"
    url: "https://..."
    platform: "amazon" # or bookshop, afrofiliate, etc.
    price: "$30-$50"
    description: "Short description"
```

#### Custom Platforms
```markdown
[View on {Platform}](https://{platform}.com/search?q=keyword&ref={site-id})
```
```html
<a href="https://{platform}.com/search?q=keyword&ref={site-id}">View on {Platform}</a>
```

## API Endpoints

### Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/v1/{siteId}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@{site}.com","password":"password"}'
```

### Get Posts
```bash
# All posts
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3001/api/v1/{siteId}/posts"

# Specific post
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3001/api/v1/{siteId}/posts/{postId}"
```

### Get Analytics
```bash
# Affiliate analytics
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3001/api/v1/{siteId}/analytics/affiliate"

# General analytics
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3001/api/v1/{siteId}/analytics"
```

### Get Keywords
```bash
# Keyword bank
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3001/api/v1/{siteId}/keyword-bank"
```

## Common Tasks

### Create New Post

1. **Create frontmatter** using the template above
2. **Add affiliate disclosure** if including affiliate links
3. **Include proper images** (banner, og, social)
4. **Add relevant keywords** for SEO
5. **Categorize properly** (category, content_type, tags)
6. **Set target audience** (recipient, budget, occasion)
7. **Configure site-specific settings** (site_id, affiliate platforms)

### Add Affiliate Links

1. **Include disclosure** in frontmatter or content
2. **Use proper link formats** (see above)
3. **Test links** to ensure affiliate tags/IDs are correct
4. **Add to affiliate_platforms** in frontmatter
5. **Use site-specific platforms** as configured

### Optimize for SEO

1. **Include primary keyword** in title and first paragraph
2. **Keep meta description** under 160 characters
3. **Use relevant keywords** naturally in content
4. **Include long-tail keywords** for better targeting
5. **Use site-specific keywords** when applicable

### Social Media Optimization

1. **Create engaging titles** with emojis
2. **Write compelling descriptions** that encourage sharing
3. **Use relevant hashtags** (3-5 per post)
4. **Optimize images** for each platform
5. **Follow site-specific guidelines** for social media

## Troubleshooting

### Common Issues

#### Post Not Showing in Dashboard
- **Check status**: Must be `published`
- **Verify date**: Must have valid publication date
- **Check category**: Must have valid category and content_type
- **Verify site_id**: Must match correct site configuration

#### Affiliate Links Not Detected
- **Add disclosure**: Include "affiliate links" text
- **Check format**: Use proper URL patterns
- **Verify tags**: Ensure affiliate tags/IDs are correct
- **Check platform**: Ensure platform is configured for site
- **Populate counts**: Ensure `affiliatePlatforms` counts match extracted links
- **List links**: Ensure `affiliateLinks` contains all affiliate URLs

#### Images Not Loading
- **Check path**: Verify image paths are correct
- **Check format**: Use WebP format
- **Check size**: Ensure images meet size requirements
- **Verify site structure**: Ensure images follow site-specific structure

#### SEO Issues
- **Check title length**: Keep under 60 characters
- **Check description length**: Keep under 160 characters
- **Include keywords**: Add relevant keywords naturally
- **Use site-specific SEO**: Follow site-specific SEO guidelines

### Debug Commands

```bash
# Test API health
curl http://localhost:3001/health

# Test authentication
curl -X POST http://localhost:3001/api/v1/{siteId}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@{site}.com","password":"password"}'

# Test affiliate analytics
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3001/api/v1/{siteId}/analytics/affiliate" | jq

# Check specific post
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3001/api/v1/{siteId}/posts/{postId}" | jq
```

### Validation Checklist

- [ ] Title is compelling and under 60 characters
- [ ] Description is under 160 characters
- [ ] Keywords are relevant and targeted
- [ ] Images are properly sized and optimized
- [ ] Affiliate disclosure is included (if applicable)
- [ ] Social media content is engaging
- [ ] Content is properly categorized
- [ ] Meta data is complete and accurate
- [ ] Status is set to `published`
- [ ] Date is in correct format (YYYY-MM-DD)
- [ ] Site-specific requirements are met
- [ ] Affiliate platforms are site-specific
- [ ] wordCount, readTime, seoScore, readabilityScore present
- [ ] affiliatePlatforms counts and affiliateLinks list populated
- [ ] siteId/postId/workflowId present (if workflow-managed)

## Quick Tips

### Content Creation
- **Use templates**: Start with the provided template
- **Be consistent**: Follow the same format across posts
- **Optimize for search**: Include relevant keywords naturally
- **Think social**: Create content that encourages sharing
- **Follow site guidelines**: Use site-specific requirements

### Affiliate Marketing
- **Always disclose**: Include affiliate disclosure
- **Use multiple platforms**: Amazon, Bookshop, Afrofiliate, custom platforms
- **Test links**: Verify affiliate tags/IDs work
- **Track performance**: Monitor click-through rates
- **Use site-specific programs**: Follow site's affiliate agreements

### SEO Optimization
- **Research keywords**: Use tools to find relevant keywords
- **Write compelling titles**: Include primary keyword
- **Optimize descriptions**: Keep under 160 characters
- **Use internal linking**: Link to related posts
- **Follow site-specific SEO**: Use site's SEO guidelines

### Image Management
- **Use WebP format**: Better compression and quality
- **Optimize sizes**: Follow the size specifications
- **Use descriptive names**: Include post slug in image names
- **Create multiple versions**: Banner, OG, social, thumbnail
- **Follow site structure**: Use site-specific image organization

### Multi-Site Considerations
- **Site-specific branding**: Use correct brand names
- **Local SEO**: Include location-specific keywords
- **Custom platforms**: Use site-specific affiliate programs
- **Regional content**: Adapt content for local audiences
- **Language considerations**: Use appropriate language settings

---

*Last updated: January 2025*
*Version: 1.0* 