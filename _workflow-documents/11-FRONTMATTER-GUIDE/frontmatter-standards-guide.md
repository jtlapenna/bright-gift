# Multi-Site Frontmatter Standards Guide

## Overview

This guide establishes comprehensive frontmatter standards for blog posts that integrate with the multi-tenant dashboard system. These standards ensure consistent data structure, proper categorization, and optimal performance across all sites.

## Table of Contents

1. [Basic Structure](#basic-structure)
2. [Required Fields](#required-fields)
3. [Content Categorization](#content-categorization)
4. [SEO & Meta Data](#seo--meta-data)
5. [Image Management](#image-management)
6. [Social Media Integration](#social-media-integration)
7. [Affiliate Integration](#affiliate-integration)
8. [Analytics & Tracking](#analytics--tracking)
9. [Multi-Site Configuration](#multi-site-configuration)
10. [Validation & Quality Control](#validation--quality-control)

## Basic Structure

### Standard Frontmatter Template

```yaml
---
# Basic Post Information
title: "Your Post Title"
slug: "your-post-slug"
description: >-
  A compelling description of your post that will appear in search results
  and social media shares. Keep it under 160 characters for optimal SEO.

# Publication & Status
date: '2024-12-19'
status: published  # draft, published, scheduled
author: "Author Name"
last_modified: '2024-12-20'

# Content Categorization
category: gift-guide
content_type: gift-guide
tags:
  - gifts
  - holiday
  - moms
  - under-50

# Target Audience
recipient: moms
budget: 50-100
occasion: mothers-day
season: spring

# SEO & Meta
metaTitle: "SEO-Optimized Title | {Brand Name}"
metaDescription: "SEO-optimized description under 160 characters"
keywords:
  - primary keyword
  - secondary keyword
  - long tail keyword

# Image Management
image: /images/blog/post-banner.webp
ogImage: /images/blog/post-og.webp
socialImage: /images/blog/post-social.webp
thumbnail: /images/blog/post-thumbnail.webp

# Social Media
socialTitle: "Engaging Social Media Title"
socialDescription: "Compelling description for social sharing"
hashtags:
  - #gifts
  - #moms
  - #holiday

# Affiliate Integration
affiliate_disclosure: true
affiliate_platforms:
  - amazon
  - bookshop
  - afrofiliate
  - {custom-platform}

# Analytics & Performance
expected_revenue_per_click: 2.50
target_conversion_rate: 0.02
priority: high  # high, medium, low

# Multi-Site Configuration
site_id: {site-name}
language: en-US
region: US

# Advanced Features
featured: true
pinned: false
allow_comments: true
---
```

## Required Fields

### Essential Information

```yaml
---
# Always Required
title: "Your Post Title"
description: "Post description for SEO and social sharing"
date: '2024-12-19'
status: published
category: gift-guide
content_type: gift-guide

# SEO Required
metaTitle: "SEO Title | {Brand}"
metaDescription: "SEO description under 160 characters"
keywords:
  - primary keyword
  - secondary keyword

# Image Required
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

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Post title (max 60 chars for SEO) |
| `description` | string | Yes | Post description (max 160 chars) |
| `date` | date | Yes | Publication date (YYYY-MM-DD) |
| `status` | enum | Yes | `published`, `draft`, `scheduled` |
| `category` | string | Yes | Primary content category |
| `content_type` | string | Yes | Content type for analytics |
| `metaTitle` | string | Yes | SEO-optimized title |
| `metaDescription` | string | Yes | SEO description |
| `keywords` | array | Yes | SEO keywords |
| `image` | string | Yes | Main post image |
| `ogImage` | string | Yes | Open Graph image |
| `wordCount` | integer | Rec. | Total words in post body |
| `readTime` | integer | Rec. | Estimated minutes to read |
| `seoScore` | integer | Rec. | 0–100 SEO quality score |
| `readabilityScore` | integer | Rec. | 0–100 readability score |
| `siteId` | string | Rec. | Site identifier for dashboard |
| `postId` | string | Rec. | Unique post/workflow ID |
| `workflowId` | string | Rec. | Workflow/run identifier |
| `generatedAt` | datetime | Rec. | ISO timestamp of generation |
| `lastUpdated` | datetime | Rec. | ISO timestamp of last update |
| `affiliateDisclosure` | boolean | Rec. | Affiliate disclosure toggle |
| `affiliatePlatforms` | object | Rec. | Per-platform counts (e.g., `{ amazon: 12 }`) |
| `affiliateLinks` | array | Rec. | Array of affiliate link objects |

## Content Categorization

### Categories

```yaml
category: gift-guide  # Primary category
content_type: gift-guide  # For analytics grouping
tags:
  - gifts
  - holiday
  - moms
  - under-50
  - amazon
```

### Available Categories

- **gift-guide**: Gift recommendations and guides
- **book-review**: Book reviews and recommendations
- **lifestyle**: Lifestyle and personal development
- **holiday**: Holiday-specific content
- **how-to**: Tutorials and guides
- **review**: Product reviews
- **news**: Industry news and updates
- **{custom-category}**: Site-specific categories

### Target Audience

```yaml
recipient: moms  # Target audience
budget: 50-100  # Price range
occasion: mothers-day  # Specific occasion
season: spring  # Seasonal relevance
```

### Recipient Types

- `moms`: Mother-related content
- `dads`: Father-related content
- `kids`: Children-related content
- `teens`: Teenager-related content
- `couples`: Couple-related content
- `professionals`: Work-related content
- `students`: Education-related content
- `general`: General audience
- `{custom-recipient}`: Site-specific audiences

### Budget Ranges

- `under-25`: Budget-friendly options
- `25-50`: Mid-range options
- `50-100`: Premium options
- `100-250`: Luxury options
- `250-plus`: High-end options

### Occasions

- `birthday`: Birthday gifts
- `anniversary`: Anniversary gifts
- `holiday`: Holiday gifts
- `graduation`: Graduation gifts
- `wedding`: Wedding gifts
- `housewarming`: Housewarming gifts
- `just-because`: General gifts
- `{custom-occasion}`: Site-specific occasions

## SEO & Meta Data

### SEO Optimization

```yaml
metaTitle: "25 Best Gifts for Moms Under $50 | {Brand Name}"
metaDescription: "Discover 25 thoughtful gifts for moms under $50. From cozy reading accessories to must-read books that will delight any bookworm."
keywords:
  - gifts for moms
  - mom gifts under 50
  - birthday gifts for mom
  - mother's day gifts
  - affordable mom gifts
```

### SEO Best Practices

1. **Title Length**: Keep under 60 characters
2. **Description Length**: Keep under 160 characters
3. **Keyword Density**: Include primary keyword in title and first paragraph
4. **Long-tail Keywords**: Include specific, targeted keywords
5. **Local SEO**: Include location-specific keywords when relevant

### Meta Data Structure

```yaml
# Primary SEO
metaTitle: "SEO-Optimized Title | {Brand Name}"
metaDescription: "Compelling description that encourages clicks"

# Keywords (for internal search)
keywords:
  - primary keyword
  - secondary keyword
  - long tail keyword
  - related keyword

# Schema Markup
schema:
  type: "Article"
  author: "Author Name"
  publisher: "{Brand Name}"
  datePublished: "2024-12-19"
  dateModified: "2024-12-20"
```

## Image Management

### Image Standards

```yaml
# Required Images
image: /images/blog/post-banner.webp          # Main post image
ogImage: /images/blog/post-og.webp            # Open Graph (1200x630)
socialImage: /images/blog/post-social.webp    # Social sharing (1200x630)
thumbnail: /images/blog/post-thumbnail.webp   # Thumbnail (300x200)

# Optional Images
gallery:
  - /images/blog/post-gallery-1.webp
  - /images/blog/post-gallery-2.webp
  - /images/blog/post-gallery-3.webp
```

### Image Specifications

| Image Type | Dimensions | Format | Purpose |
|------------|------------|--------|---------|
| `image` | 1200x630 | WebP | Main post image |
| `ogImage` | 1200x630 | WebP | Open Graph sharing |
| `socialImage` | 1200x630 | WebP | Social media sharing |
| `thumbnail` | 300x200 | WebP | Thumbnail/preview |

### Image Naming Convention

```
/images/blog/{post-slug}/{image-type}.webp
```

Examples:
- `/images/blog/gifts-for-moms/banner.webp`
- `/images/blog/gifts-for-moms/og.webp`
- `/images/blog/gifts-for-moms/social.webp`

## Social Media Integration

### Social Media Optimization

```yaml
# Social Media Specific
socialTitle: "25 Thoughtful Gifts for Moms Under $50 🎁"
socialDescription: "Discover perfect gifts for the special moms in your life! From cozy reading accessories to must-read books. #gifts #moms #holiday"
hashtags:
  - gifts
  - moms
  - holiday
  - affordable
  - thoughtful

# Platform Specific
twitter:
  title: "25 Gifts for Moms Under $50"
  description: "Perfect gifts for any mom! 🎁"
  hashtags: ["gifts", "moms", "affordable"]

pinterest:
  title: "25 Thoughtful Gifts for Moms"
  description: "Affordable and meaningful gift ideas"
  board: "Gift Ideas"
```

### Social Media Best Practices

1. **Engaging Titles**: Use emojis and action words
2. **Compelling Descriptions**: Create curiosity and urgency
3. **Relevant Hashtags**: Use 3-5 relevant hashtags
4. **Platform Optimization**: Tailor content for each platform
5. **Visual Appeal**: Ensure images work well on social platforms

## Affiliate Integration

### Affiliate Disclosure

```yaml
# Required for affiliate posts
affiliate_disclosure: true

# OR include in content: "This post contains affiliate links"
```

### Affiliate Configuration

```yaml
# Platform Configuration
affiliatePlatforms: { amazon: 0, bookshop: 0, afrofiliate: 0 }

# Revenue Tracking
expected_revenue_per_click: 2.50
target_conversion_rate: 0.02

# Performance Metrics
affiliate_links_count: 15
revenue_potential: 37.50

# Full link list (dashboard)
affiliateLinks:
  - text: "Product Name"
    url: "https://..."
    platform: "amazon"
    price: "$30-$50"
    description: "Short description"
```

### Affiliate Best Practices

1. **Always Disclose**: Include affiliate disclosure
2. **Natural Integration**: Integrate links naturally in content
3. **Multiple Platforms**: Use various affiliate platforms
4. **Track Performance**: Monitor click-through rates
5. **Update Regularly**: Keep affiliate links current
6. **Site-Specific**: Use site-specific affiliate programs

## Analytics & Tracking

### Performance Metrics

```yaml
# Analytics Configuration
priority: high  # high, medium, low
featured: true
pinned: false

# Performance Tracking
expected_views: 5000
target_conversion_rate: 0.02
expected_revenue_per_click: 2.50

# Content Performance
reading_time: 5  # minutes
difficulty: intermediate  # beginner, intermediate, advanced
engagement_score: 8.5  # 1-10 scale
```

### Analytics Fields

| Field | Type | Description |
|-------|------|-------------|
| `priority` | enum | Content priority level |
| `featured` | boolean | Featured content flag |
| `pinned` | boolean | Pinned content flag |
| `reading_time` | integer | Estimated reading time |
| `difficulty` | enum | Content difficulty level |
| `engagement_score` | float | Predicted engagement score |

## Multi-Site Configuration

### Site-Specific Settings

```yaml
# Site Configuration
site_id: {site-name}
language: en-US
region: US
timezone: America/New_York

# Site-Specific Categories
local_categories:
  - local-events
  - regional-gifts
  - community-highlights

# Local SEO
local_keywords:
  - "gifts in {city}"
  - "{city} gift shops"
  - "local gift ideas"

# Site-Specific Affiliate Programs
affiliate_platforms:
  - amazon
  - bookshop
  - {site-specific-platform}
```

### Multi-Language Support

```yaml
# Language Configuration
language: en-US
translated_from: null  # Original language if translated
available_languages:
  - en-US
  - es-ES
  - fr-FR

# Translation Metadata
translation:
  original_post: null
  translator: "AI Assistant"
  translation_date: "2024-12-19"
```

## Validation & Quality Control

### Required Validation

```yaml
# Content Quality
wordCount: 1500
reading_level: intermediate
seoScore: 85  # 1-100 scale
readabilityScore: 80

# Technical Validation
has_images: true
has_affiliate_disclosure: true
has_proper_meta: true
has_keywords: true

# Content Validation
is_original: true
fact_checked: true
spell_checked: true
```

### Quality Control Checklist

- [ ] Title is compelling and SEO-optimized
- [ ] Description is under 160 characters
- [ ] Keywords are relevant and targeted
- [ ] Images are properly sized and optimized
- [ ] Affiliate disclosure is included (if applicable)
- [ ] Social media content is engaging
- [ ] Content is properly categorized
- [ ] Meta data is complete and accurate
- [ ] Site-specific requirements are met
- [ ] wordCount/readTime present and accurate
- [ ] seoScore/readabilityScore present (0–100)
- [ ] affiliatePlatforms counts match actual links
- [ ] affiliateLinks array populated for auditing
- [ ] siteId/postId/workflowId present (if workflow-managed)

### Automated Validation

The system automatically validates:

1. **Required Fields**: All required fields are present
2. **Field Lengths**: Titles and descriptions meet length requirements
3. **Image Formats**: Images are in correct format and size
4. **Affiliate Compliance**: Proper disclosure for affiliate posts
5. **SEO Optimization**: Meta data is properly formatted
6. **Content Quality**: Word count and reading level are appropriate
7. **Site-Specific Rules**: Custom validation for each site

## Best Practices

### For Content Creators

1. **Consistent Formatting**: Follow the template structure
2. **SEO Optimization**: Include relevant keywords naturally
3. **Image Optimization**: Use proper image sizes and formats
4. **Social Media**: Create engaging social content
5. **Affiliate Compliance**: Always include proper disclosure
6. **Site-Specific**: Follow site-specific guidelines

### For Developers

1. **Template Validation**: Ensure all required fields are present
2. **Image Processing**: Automatically optimize and resize images
3. **SEO Analysis**: Provide SEO score and recommendations
4. **Performance Tracking**: Monitor content performance metrics
5. **Quality Assurance**: Implement automated quality checks
6. **Custom Validation**: Add site-specific validation rules

### For Site Administrators

1. **Content Standards**: Enforce consistent formatting
2. **SEO Monitoring**: Track SEO performance across posts
3. **Analytics Review**: Monitor content performance regularly
4. **Quality Control**: Ensure all posts meet standards
5. **Training**: Provide guidelines to content creators
6. **Site-Specific**: Manage site-specific requirements

## Examples

### Complete Example

```yaml
---
title: "25 Thoughtful Gifts for Book Lovers Under $50"
slug: "gifts-for-book-lovers-under-50"
description: >-
  Discover perfect gifts for the bibliophiles in your life, from cozy reading
  accessories to must-read books that will delight any bookworm.

# Publication
date: '2024-12-19'
status: published
author: "Sarah Johnson"
last_modified: '2024-12-20'

# Categorization
category: gift-guide
content_type: gift-guide
tags:
  - book-lovers
  - under-50
  - reading
  - literary
  - accessories

# Target Audience
recipient: book-lovers
budget: under-50
occasion: birthday
season: all-year

# SEO
metaTitle: "25 Best Gifts for Book Lovers Under $50 | {Brand Name}"
metaDescription: "Discover 25 thoughtful gifts for book lovers under $50. From cozy reading accessories to must-read books that will delight any bookworm."
keywords:
  - gifts for book lovers
  - book lover gifts
  - reading gifts
  - literary gifts
  - book club gifts
  - reading accessories

# Images
image: /images/blog/gifts-for-book-lovers/banner.webp
ogImage: /images/blog/gifts-for-book-lovers/og.webp
socialImage: /images/blog/gifts-for-book-lovers/social.webp
thumbnail: /images/blog/gifts-for-book-lovers/thumbnail.webp

# Social Media
socialTitle: "25 Thoughtful Gifts for Book Lovers 📚"
socialDescription: "Discover perfect gifts for the bibliophiles in your life! From cozy reading accessories to must-read books. #booklovers #gifts #reading"
hashtags:
  - booklovers
  - gifts
  - reading
  - literary

# Affiliate
affiliateDisclosure: true
affiliatePlatforms: { amazon: 10, bookshop: 2 }
affiliateLinks:
  - text: "Example Book"
    url: "https://bookshop.org/a/{site-id}/123456"
    platform: "bookshop"
    price: "$15-$25"
    description: "Great read."
expected_revenue_per_click: 2.50
target_conversion_rate: 0.02

# Analytics
priority: high
featured: true
reading_time: 8
difficulty: beginner
engagement_score: 9.2

# Multi-Site
site_id: {site-name}
language: en-US
region: US

# Dashboard analytics & workflow
wordCount: 1500
readTime: 8
seoScore: 85
readabilityScore: 80
siteId: "brightgift"
postId: "workflow_123"
workflowId: "thread_abc"
generatedAt: '2025-01-01T00:00:00.000Z'
lastUpdated: '2025-01-02T00:00:00.000Z'
---
```

---

*Last updated: January 2025*
*Version: 1.0* 