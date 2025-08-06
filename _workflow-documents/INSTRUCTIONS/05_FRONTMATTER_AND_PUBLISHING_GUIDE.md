# BrightGift Frontmatter and Publishing Guide

## 📋 **Overview**

This is the single source of truth for all frontmatter schemas, publishing workflows, and content management processes for BrightGift. It consolidates all publishing-related information into one comprehensive guide.

**Purpose:** Ensure consistent, SEO-optimized content metadata across all blog posts
**System:** Astro Content Collections with YAML frontmatter
**Goal:** Streamlined publishing process with comprehensive metadata

---

## 🎯 **Frontmatter Philosophy**

### **Core Principles**
1. **Single Source of Truth:** All metadata lives in the markdown file
2. **SEO-First:** Every field contributes to search optimization
3. **Consistency:** Standardized schema across all content
4. **Portability:** Content is self-contained and version-controlled
5. **Automation-Friendly:** Fields designed for AI and tool integration

### **Benefits**
- **No Database Dependencies:** Content is fully portable
- **Version Control:** All changes tracked in Git
- **Agent-Friendly:** Standardized format for AI content generation
- **API Ready:** Frontmatter can be parsed and served programmatically

---

## 📋 **Complete Frontmatter Schema**

### **Required Fields (All Posts)**

```yaml
---
# Basic Content Information
title: "Blog Post Title (H1)"
description: "Internal description for blog previews and cards"
date: "2024-01-15"
status: "published" # draft, published, archived

# SEO & Meta (Critical for Search)
metaTitle: "SEO-optimized title for search results (50-60 chars)"
metaDescription: "SEO description for search results (140-160 chars)"
keywords: ["primary keyword", "secondary keyword", "related terms"]

# Images (All Required)
image: "/images/blog/slug/slug-banner.webp"
ogImage: "/images/blog/slug/slug-og.webp"
socialImage: "/images/blog/slug/slug-social.webp"
---
```

### **Content Categorization Fields**

```yaml
---
# Categorization (Required for Gift Guides)
tags: ["recipient", "budget", "occasion", "style"]
category: "gift-guide" # gift-guide, how-to, educational, trending
readTime: 8 # Estimated reading time in minutes

# Gift-Specific Fields (Gift Guides Only)
recipient: "plant-lovers" # Target audience
budget: "under-50" # Price range category
occasion: "birthday" # Gift occasion
style: "eco-friendly" # Gift style/theme
---
```

### **Optional Enhancement Fields**

```yaml
---
# Content Quality & Performance
author: "BrightGift Team"
featured: true # Featured on homepage
wordCount: 1250 # Actual word count
seoScore: 85 # SEO optimization score (0-100)
readabilityScore: 78 # Reading level score

# Social Media Integration
socialPosts:
  twitter:
    text: "Check out these amazing gift ideas! 🎁"
    hashtags: ["giftideas", "gifts", "brightgift"]
  instagram:
    caption: "🎁 Perfect gifts for plant lovers! Swipe for more..."
    hashtags: ["giftideas", "gifts", "brightgift", "plantgifts"]
  pinterest:
    description: "Amazing gift ideas for plant lovers - perfect for any occasion!"
    hashtags: ["giftideas", "gifts", "brightgift", "plantgifts"]

# Affiliate Link Tracking
affiliateLinks:
  - text: "Monstera Plant Care Kit"
    url: "https://www.amazon.com/s?k=monstera+care+kit&tag=bright-gift-20"
    platform: "amazon"
    price: "$29.99"
  - text: "The Well-Tended Perennial Garden"
    url: "https://bookshop.org/a/brightgift/9780881926484"
    platform: "bookshop"
    price: "$24.95"
---
```

---

## 📝 **Field-by-Field Guide**

### **Basic Content Fields**

#### **title** (Required)
- **Purpose:** Main H1 heading and page title
- **Format:** Clear, descriptive, includes primary keyword
- **Length:** 50-70 characters for optimal display
- **Example:** `"25 Thoughtful Gifts for Plant Lovers Under $50"`

#### **description** (Required)
- **Purpose:** Internal description for blog cards and previews
- **Format:** Compelling summary that encourages clicks
- **Length:** 120-160 characters
- **Example:** `"Discover perfect gifts for the plant enthusiasts in your life, from care essentials to decorative accessories."`

#### **date** (Required)
- **Purpose:** Publication date for chronological ordering
- **Format:** YYYY-MM-DD
- **Example:** `"2024-01-15"`

#### **status** (Required)
- **Purpose:** Content publication state
- **Options:** `"draft"`, `"published"`, `"archived"`
- **Default:** `"draft"` until ready to publish

### **SEO & Meta Fields**

#### **metaTitle** (Required)
- **Purpose:** SEO-optimized title for search results
- **Format:** Primary keyword first, compelling and clickable
- **Length:** 50-60 characters (strict limit)
- **Example:** `"Plant Lover Gifts Under $50 | 25 Perfect Ideas"`

#### **metaDescription** (Required)
- **Purpose:** SEO description shown in search results
- **Format:** Problem + solution + call-to-action
- **Length:** 140-160 characters (strict limit)
- **Example:** `"Find the perfect gifts for plant lovers! 25 thoughtful ideas under $50, from care essentials to unique accessories. Shop now!"`

#### **keywords** (Required)
- **Purpose:** Target keywords for SEO optimization
- **Format:** Array of relevant keywords and phrases
- **Limit:** 5-10 keywords maximum
- **Example:** `["plant gifts", "gifts for plant lovers", "plant care gifts", "indoor plant accessories", "plant lover presents"]`

### **Image Fields**

#### **image** (Required - Banner Image)
- **Purpose:** Main blog post banner (1536×1024px)
- **Format:** `/images/blog/[slug]/[slug]-banner.webp`
- **Requirements:** No text, brand-consistent style
- **Example:** `"/images/blog/plant-lover-gifts/plant-lover-gifts-banner.webp"`

#### **ogImage** (Required - Open Graph)
- **Purpose:** Social media link previews (1200×630px)
- **Format:** `/images/blog/[slug]/[slug]-og.webp`
- **Requirements:** No text, optimized for social sharing
- **Example:** `"/images/blog/plant-lover-gifts/plant-lover-gifts-og.webp"`

#### **socialImage** (Required - Social Media)
- **Purpose:** Instagram/Pinterest posts (1200×1200px)
- **Format:** `/images/blog/[slug]/[slug]-social.webp`
- **Requirements:** Can include text, square format
- **Example:** `"/images/blog/plant-lover-gifts/plant-lover-gifts-social.webp"`

### **Categorization Fields**

#### **tags** (Required for Gift Guides)
- **Purpose:** Content categorization and filtering
- **Format:** Array of descriptive tags
- **Categories:** recipient, budget, occasion, style
- **Example:** `["plant-lovers", "under-50", "birthday", "eco-friendly"]`

#### **category** (Required)
- **Purpose:** Primary content type classification
- **Options:** `"gift-guide"`, `"how-to"`, `"educational"`, `"trending"`
- **Example:** `"gift-guide"`

#### **readTime** (Required)
- **Purpose:** Estimated reading time for user experience
- **Format:** Number of minutes
- **Calculation:** ~200 words per minute
- **Example:** `8`

---

## 🚀 **Publishing Workflow**

### **Content Creation Process**

#### **1. Planning Phase**
- [ ] Keyword research and target keyword selection
- [ ] Content outline and structure planning
- [ ] Image concept and style planning
- [ ] Frontmatter template preparation

#### **2. Content Writing**
- [ ] Write complete blog post following style guide
- [ ] Include 10-15 gift ideas with detailed descriptions
- [ ] Add affiliate links with proper formatting
- [ ] Optimize for target keywords naturally

#### **3. Image Creation**
- [ ] Generate banner image (1536×1024px, no text)
- [ ] Create OG image (1200×630px, no text)
- [ ] Design social image (1200×1200px, text allowed)
- [ ] Upload all images to correct directory

#### **4. Frontmatter Completion**
- [ ] Fill all required fields
- [ ] Add relevant tags and categorization
- [ ] Include affiliate link tracking
- [ ] Set status to "published"

#### **5. Pre-Publishing Review**
- [ ] Verify all frontmatter fields are complete
- [ ] Check image paths and file existence
- [ ] Test all affiliate and internal links
- [ ] Review SEO optimization and keyword integration
- [ ] Confirm reading level and content quality

#### **6. Publishing**
- [ ] Commit changes to Git repository
- [ ] Deploy to production
- [ ] Verify live post displays correctly
- [ ] Submit to search engines if needed

---

## 📊 **Content Management Guidelines**

### **File Naming Conventions**

#### **Blog Post Files:**
- **Format:** `kebab-case-title.md`
- **Location:** `src/content/blog/`
- **Example:** `25-thoughtful-gifts-for-plant-lovers-under-50.md`

#### **Image Files:**
- **Banner:** `[slug]-banner.webp`
- **OG Image:** `[slug]-og.webp`
- **Social:** `[slug]-social.webp`
- **Location:** `public/images/blog/[slug]/`

### **Directory Structure**
```
src/content/blog/
├── 25-thoughtful-gifts-for-plant-lovers-under-50.md
├── best-coffee-gifts-for-coffee-enthusiasts.md
└── ...

public/images/blog/
├── 25-thoughtful-gifts-for-plant-lovers-under-50/
│   ├── plant-lovers-banner.webp
│   ├── plant-lovers-og.webp
│   └── plant-lovers-social.webp
└── ...
```

### **Content Status Management**

#### **Draft Status:**
- **Purpose:** Work-in-progress content
- **Visibility:** Not visible on live site
- **Use Case:** Content being written or reviewed

#### **Published Status:**
- **Purpose:** Live, public content
- **Visibility:** Visible on site and in search results
- **Use Case:** Complete, reviewed, ready-for-public content

#### **Archived Status:**
- **Purpose:** Outdated or seasonal content
- **Visibility:** Hidden from main navigation
- **Use Case:** Holiday content out of season, outdated information

---

## 🔍 **SEO Optimization Guidelines**

### **Meta Title Optimization**
- **Include primary keyword** at the beginning
- **Keep under 60 characters** to avoid truncation
- **Make it compelling** and click-worthy
- **Include brand name** if space allows
- **Avoid keyword stuffing**

### **Meta Description Optimization**
- **Start with the problem** the content solves
- **Include primary keyword** naturally
- **Add a clear call-to-action**
- **Stay within 140-160 characters**
- **Make it compelling** for click-through

### **Keyword Integration**
- **Primary keyword** in title, meta title, first paragraph
- **Secondary keywords** in H2 headings and throughout content
- **Long-tail keywords** in gift descriptions and practical tips
- **Natural integration** - avoid forced or awkward placement
- **Semantic keywords** and related terms for context

---

## 📱 **Social Media Integration**

### **Social Posts Configuration**

#### **Twitter/X Posts:**
```yaml
twitter:
  text: "Check out these amazing gift ideas! 🎁"
  hashtags: ["giftideas", "gifts", "brightgift"]
```

#### **Instagram Posts:**
```yaml
instagram:
  caption: "🎁 Perfect gifts for plant lovers! Swipe for more ideas..."
  hashtags: ["giftideas", "gifts", "brightgift", "plantgifts"]
```

#### **Pinterest Pins:**
```yaml
pinterest:
  description: "Amazing gift ideas for plant lovers - perfect for any occasion!"
  hashtags: ["giftideas", "gifts", "brightgift", "plantgifts"]
```

### **Social Media Best Practices**
- **Platform-Specific Content:** Tailor captions for each platform
- **Relevant Hashtags:** Use specific, searchable hashtags
- **Engaging Captions:** Include emojis and compelling language
- **Clear Value Proposition:** Highlight what readers will gain

---

## 🔧 **Technical Implementation**

### **Astro Content Collections Integration**

#### **Content Schema Validation:**
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    status: z.enum(['draft', 'published', 'archived']),
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(160),
    keywords: z.array(z.string()),
    image: z.string(),
    ogImage: z.string(),
    socialImage: z.string(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    readTime: z.number().optional(),
  })
});
```

### **Dynamic Routing and Display**
- **Blog Index:** Display all published posts with frontmatter data
- **Individual Posts:** Render content with SEO meta tags from frontmatter
- **Category Pages:** Filter and display posts by category/tags
- **Search Functionality:** Index frontmatter fields for search

---

## 📋 **Quality Checklist**

### **Pre-Publishing Frontmatter Review**
- [ ] All required fields completed
- [ ] Meta title under 60 characters
- [ ] Meta description 140-160 characters
- [ ] Primary keyword in title and meta title
- [ ] All image paths correct and files exist
- [ ] Tags relevant and properly formatted
- [ ] Date format correct (YYYY-MM-DD)
- [ ] Status set to "published"
- [ ] Affiliate links properly tracked
- [ ] Social media content appropriate for each platform

### **SEO Optimization Check**
- [ ] Primary keyword in title, meta title, first paragraph
- [ ] Secondary keywords in headings and content
- [ ] Meta description compelling and keyword-optimized
- [ ] Keywords array includes relevant terms
- [ ] Content length meets minimum requirements
- [ ] Internal linking included
- [ ] Images optimized with proper alt text

---

*This is the single source of truth for all BrightGift frontmatter and publishing processes.*