# Standardized Frontmatter Schema for Multi-Site Content Automation

## Overview
This document defines a standardized frontmatter schema that can be used across all sites in the multi-site content automation system. This ensures consistency, portability, and easier integration between different sites and agents.

## 🎯 Benefits of Frontmatter-Based System

### **Simplicity & Portability**
- **Single Source of Truth**: All metadata lives in the markdown file
- **No Database Dependencies**: Content is self-contained and portable
- **Version Control Friendly**: Changes tracked in Git history
- **Cross-Site Compatible**: Same structure works across all sites

### **Agent-Friendly**
- **Standardized Format**: Agents know exactly what fields to generate
- **Validation Built-in**: Schema ensures data consistency
- **Easy Parsing**: YAML is human-readable and machine-parseable
- **Extensible**: New fields can be added without breaking existing content

### **System Integration**
- **API Ready**: Frontmatter can be parsed and served via API
- **Dashboard Compatible**: All data available for dashboard display
- **Workflow Integration**: n8n can read/write frontmatter directly
- **Analytics Ready**: Metadata available for tracking and reporting

---

## 📋 Complete Frontmatter Schema

### **Required Fields**
```yaml
---
# Basic Content Information
title: "Blog Post Title"
description: "SEO-optimized description for search results"
date: "2024-01-15"
status: "draft" # draft, published, archived
contentType: "gift-guide" # gift-guide, blog, faq, tool-landing

# SEO & Meta
metaTitle: "SEO Title (50-60 characters)"
metaDescription: "SEO Description (140-160 characters)"
keywords: ["keyword1", "keyword2", "keyword3"]
slug: "auto-generated-from-title"

# Images
image: "/images/blog/slug/slug-banner.webp"
ogImage: "/images/blog/slug/slug-og.webp"
socialImage: "/images/blog/slug/slug-social.webp"
---
```

### **Optional Fields**
```yaml
---
# Content Categorization
tags: ["tag1", "tag2", "tag3"]
category: "gift-guide" # gift-guide, seasonal, faq, tool-landing
author: "Author Name"
readTime: 8

# Gift-Specific Fields (for gift guides)
recipient: "tech-lovers" # target audience
budget: "under-50" # price range
occasion: "christmas" # gift occasion
style: "eco-friendly" # gift style

# SEO & Performance
seoScore: 85
readabilityScore: 78
wordCount: 2500
featured: true

# Social Media Content
socialPosts:
  twitter:
    text: "Check out these amazing gift ideas! 🎁"
    hashtags: ["giftideas", "gifts", "brightgift"]
    scheduledAt: "2024-01-15T10:00:00Z"
  instagram:
    caption: "🎁 Perfect gifts for tech lovers! Swipe for more ideas..."
    hashtags: ["giftideas", "gifts", "brightgift", "techgifts"]
    scheduledAt: "2024-01-15T11:00:00Z"
  facebook:
    text: "Looking for the perfect gift? Check out these amazing ideas!"
    hashtags: ["giftideas", "gifts", "brightgift"]
    scheduledAt: "2024-01-15T12:00:00Z"
  pinterest:
    description: "Amazing gift ideas for tech lovers - perfect for any occasion!"
    hashtags: ["giftideas", "gifts", "brightgift", "techgifts"]
    scheduledAt: "2024-01-15T13:00:00Z"

# Affiliate & Product Links
affiliateLinks:
  - text: "Product Name"
    url: "https://amazon.com/product"
    platform: "amazon"
    price: "$25.99"
    commission: 0.04
  - text: "Another Product"
    url: "https://bookshop.org/book"
    platform: "bookshop"
    price: "$15.99"
    commission: 0.10

# Analytics & Performance
analytics:
  views: 1250
  uniqueVisitors: 980
  likes: 45
  shares: 12
  revenue: 25.50
  conversionRate: 0.02
  lastUpdated: "2024-01-15T16:45:00Z"

# Workflow & Automation
workflow:
  currentPhase: "published"
  phasesCompleted: ["seo_research", "content_generation", "image_generation", "publishing"]
  lastUpdated: "2024-01-15T10:30:00Z"
  approvedBy: "user_123"
  approvedAt: "2024-01-15T10:30:00Z"

# Site-Specific Configuration
siteConfig:
  siteId: "site_123"
  domain: "brightgift.com"
  theme: "default"
  autoPublish: true
  seoOptimization: true

# Content Relationships
relatedPosts:
  - slug: "related-post-1"
    title: "Related Post Title"
    relevance: 0.85
  - slug: "related-post-2"
    title: "Another Related Post"
    relevance: 0.72

# Publishing Information
publishing:
  publishedAt: "2024-01-15T10:30:00Z"
  publishedBy: "user_123"
  url: "https://brightgift.com/blog/slug"
  previewUrl: "https://preview.brightgift.com/blog/slug"
  canonicalUrl: "https://brightgift.com/blog/slug"

# Content Quality Metrics
quality:
  readabilityScore: 78
  seoScore: 85
  engagementScore: 92
  conversionScore: 75
  overallScore: 82.5

# Custom Fields (site-specific)
custom:
  brandAffiliation: "amazon"
  seasonalRelevance: "christmas"
  targetAudience: "tech-enthusiasts"
  contentTier: "premium"
---
```

---

## 🔧 Implementation Guide

### **1. For Content Agents**

Agents should generate content with this standardized frontmatter:

```yaml
---
title: "25 Amazing Gifts from Black-Owned Businesses Under $75"
description: "Discover thoughtful gifts that support diverse entrepreneurs while finding the perfect present for your loved ones."
date: "2024-01-15"
status: "draft"
contentType: "gift-guide"
metaTitle: "Black-Owned Business Gifts: 25 Amazing Ideas Under $75"
metaDescription: "Discover thoughtful gifts that support diverse entrepreneurs! Find 25 amazing Black-owned business gifts under $75."
keywords: ["Black-owned business gifts", "Black-owned brands", "support Black-owned businesses"]
tags: ["Black-owned businesses", "diverse-owned", "gift guide", "under $75"]
recipient: "conscious-consumers"
budget: "under-75"
occasion: "any-occasion"
style: "support-small-business"
socialPosts:
  twitter:
    text: "🎁 Support diverse entrepreneurs with these amazing Black-owned business gifts under $75!"
    hashtags: ["blackowned", "giftideas", "supportsmallbusiness"]
  instagram:
    caption: "🎁 These Black-owned businesses are creating incredible products! Support diverse entrepreneurs with these thoughtful gifts under $75. #blackowned #giftideas #supportsmallbusiness"
    hashtags: ["blackowned", "giftideas", "supportsmallbusiness", "diverseowned"]
affiliateLinks:
  - text: "BeautyStat Universal C Serum"
    url: "https://amazon.com/product"
    platform: "amazon"
    price: "$45"
    commission: 0.04
---
```

### **2. For n8n Workflows**

n8n workflows should parse and validate frontmatter:

```javascript
// n8n Code Node: Frontmatter Validation
function validateFrontmatter(frontmatter) {
  const required = ['title', 'description', 'date', 'status', 'contentType'];
  const errors = [];
  
  for (const field of required) {
    if (!frontmatter[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate date format
  if (frontmatter.date && !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date)) {
    errors.push('Invalid date format. Use YYYY-MM-DD');
  }
  
  // Validate status
  const validStatuses = ['draft', 'published', 'archived'];
  if (frontmatter.status && !validStatuses.includes(frontmatter.status)) {
    errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### **3. For API Integration**

The API can parse frontmatter and serve it as JSON:

```javascript
// API Route: Parse frontmatter from markdown
const matter = require('gray-matter');

function parseFrontmatter(markdownContent) {
  const { data, content } = matter(markdownContent);
  
  return {
    frontmatter: data,
    content: content,
    wordCount: content.split(' ').length,
    readTime: Math.ceil(content.split(' ').length / 200) // 200 words per minute
  };
}
```

### **4. For Dashboard Display**

The dashboard can read frontmatter directly from files:

```javascript
// Dashboard: Read frontmatter for display
async function getPostMetadata(slug) {
  const filePath = `src/content/blog/${slug}.md`;
  const content = await fs.readFile(filePath, 'utf8');
  const { data } = matter(content);
  
  return {
    id: slug,
    title: data.title,
    status: data.status,
    seoScore: data.quality?.seoScore || 0,
    socialPosts: data.socialPosts || {},
    analytics: data.analytics || {},
    workflow: data.workflow || {},
    // ... other fields
  };
}
```

---

## 📊 Database Integration

### **Frontmatter to Database Mapping**

When needed, frontmatter can be synced to the database:

```sql
-- Sync frontmatter to database tables
INSERT INTO blog_workflow_state (
  post_id, site_id, title, status, current_phase,
  metadata, created_at, last_updated
) VALUES (
  'post_123', 'site_456', 'Post Title', 'draft', 'content_generation',
  '{"seoScore": 85, "socialPosts": {...}, "analytics": {...}}',
  NOW(), NOW()
);
```

### **Database to Frontmatter Sync**

Updates from the database can be written back to frontmatter:

```javascript
// Update frontmatter with database changes
function updateFrontmatter(filePath, updates) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: markdown } = matter(content);
  
  // Merge updates
  const updatedData = { ...data, ...updates };
  
  // Write back to file
  const updatedContent = matter.stringify(markdown, updatedData);
  fs.writeFileSync(filePath, updatedContent);
}
```

---

## 🚀 Migration Strategy

### **Phase 1: Schema Definition**
1. Define the standardized schema
2. Create validation functions
3. Update content generation prompts

### **Phase 2: Content Migration**
1. Update existing content to new schema
2. Validate all frontmatter
3. Test with existing workflows

### **Phase 3: System Integration**
1. Update API to read from frontmatter
2. Modify dashboard to use frontmatter
3. Update n8n workflows

### **Phase 4: Cross-Site Deployment**
1. Share schema with other sites
2. Create migration scripts
3. Deploy standardized system

---

## 📝 Benefits Summary

### **For Content Creation**
- ✅ **Standardized Format**: All agents know exactly what to generate
- ✅ **Self-Contained**: No external dependencies
- ✅ **Version Controlled**: Changes tracked in Git
- ✅ **Human Readable**: Easy to review and edit

### **For System Integration**
- ✅ **API Ready**: Can be parsed and served via API
- ✅ **Dashboard Compatible**: All data available for display
- ✅ **Workflow Friendly**: n8n can read/write directly
- ✅ **Analytics Ready**: Metadata available for tracking

### **For Cross-Site Compatibility**
- ✅ **Portable**: Same structure works across all sites
- ✅ **Extensible**: New fields can be added easily
- ✅ **Validated**: Schema ensures consistency
- ✅ **Future-Proof**: Works with any content management system

This standardized frontmatter approach creates a much simpler, more portable system that can be easily shared across all sites and agents while maintaining full compatibility with the existing API and dashboard infrastructure. 