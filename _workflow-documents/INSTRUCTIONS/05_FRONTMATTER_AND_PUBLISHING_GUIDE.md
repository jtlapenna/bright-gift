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
6. **Dashboard-Ready:** All fields support dashboard analytics and workflow tracking

### **Benefits**
- **No Database Dependencies:** Content is fully portable
- **Version Control:** All changes tracked in Git
- **Agent-Friendly:** Standardized format for AI content generation
- **API Ready:** Frontmatter can be parsed and served programmatically
- **Analytics-Ready:** Comprehensive tracking for dashboard metrics

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
imageJpg: "/images/blog/slug/slug-banner.jpg"
ogImageJpg: "/images/blog/slug/slug-og.jpg"

# Site-Agnostic API Fields
siteId: "brightgift"
workflowId: "workflow_1234567890_abc123"
postId: "workflow_1234567890_abc123"
generatedAt: "2024-01-15T10:30:00.000Z"
version: "1.0"
currentSection: "content-generation"
workflowStatus: "processing"

# Content Quality Metrics
wordCount: 1250
readTime: 8
seoScore: 85
readabilityScore: 78
contentQuality: "pending"

# Affiliate Tracking
affiliateCount: 0
affiliateDisclosure: false
affiliatePlatforms: {}

# Original Input Tracking
originalInput:
  prompt: "Create a gift guide for plant lovers"
  inputType: "prompt" # prompt, topic, brief
  selectedTopic: null
  selectedContent: null
  additionalNotes: "Focus on budget-friendly options"
  timestamp: "2024-01-15T10:30:00.000Z"
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

# Social Media Integration
socialPosts:
  twitter:
    text: "Check out these amazing gift ideas! 🎁"
    hashtags: ["giftideas", "gifts", "brightgift"]
  instagram:
    caption: "🎁 Perfect gifts for plant lovers! Swipe for more..."
    hashtags: ["giftideas", "gifts", "brightgift", "plantgifts"]
  facebook:
    text: "🎁 Perfect gifts for plant lovers! What do you think?"
    hashtags: ["giftideas", "gifts", "brightgift"]
  linkedin:
    text: "Looking for thoughtful gift ideas? Check out this guide."
    hashtags: ["giftideas", "gifts", "brightgift", "giftguide"]

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

# Analytics Fields (Updated by dashboard)
analytics:
  viewCount: 0
  revenue: 0.00
  affiliateClicks: 0
  socialEngagement: {}
  keywordRankings: {}
  competitionLevel: "medium"
---
```

---

## 📝 **Field-by-Field Guide**

### **Basic Content Fields**

#### **title** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Main H1 heading and page title
- **Format:** Clear, descriptive, includes primary keyword
- **Length:** 50-70 characters for optimal display
- **Example:** `"25 Thoughtful Gifts for Plant Lovers Under $50"`

#### **description** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Internal description for blog cards and previews
- **Format:** Compelling summary that encourages clicks
- **Length:** 120-160 characters
- **Example:** `"Discover perfect gifts for the plant enthusiasts in your life, from care essentials to decorative accessories."`

#### **date** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Publication date for chronological ordering
- **Format:** YYYY-MM-DD
- **Example:** `"2024-01-15"`

#### **status** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Content publication state
- **Options:** `"draft"`, `"published"`, `"archived"`
- **Default:** `"draft"` until ready to publish

### **SEO & Meta Fields**

#### **metaTitle** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** SEO-optimized title for search results
- **Format:** Primary keyword first, compelling and clickable
- **Length:** 50-60 characters (strict limit)
- **Example:** `"Plant Lover Gifts Under $50 | 25 Perfect Ideas"`

#### **metaDescription** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** SEO description shown in search results
- **Format:** Problem + solution + call-to-action
- **Length:** 140-160 characters (strict limit)
- **Example:** `"Find the perfect gifts for plant lovers! 25 thoughtful ideas under $50, from care essentials to unique accessories. Shop now!"`

#### **keywords** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Target keywords for SEO optimization
- **Format:** Array of relevant keywords and phrases
- **Limit:** 5-10 keywords maximum
- **Example:** `["plant gifts", "gifts for plant lovers", "plant care gifts", "indoor plant accessories", "plant lover presents"]`

### **Image Fields**

#### **image** (Required - Banner Image) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Main blog post banner (1536×1024px)
- **Format:** `/images/blog/[slug]/[slug]-banner.webp`
- **Requirements:** No text, brand-consistent style
- **Example:** `"/images/blog/plant-lover-gifts/plant-lover-gifts-banner.webp"`

#### **ogImage** (Required - Open Graph) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Social media link previews (1200×630px)
- **Format:** `/images/blog/[slug]/[slug]-og.webp`
- **Requirements:** No text, optimized for social sharing
- **Example:** `"/images/blog/plant-lover-gifts/plant-lover-gifts-og.webp"`

#### **imageJpg** (Required - Banner JPG) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Banner image in JPG format for compatibility
- **Format:** `/images/blog/[slug]/[slug]-banner.jpg`
- **Requirements:** Same as banner.webp but JPG format

#### **ogImageJpg** (Required - OG JPG) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Open Graph image in JPG format for compatibility
- **Format:** `/images/blog/[slug]/[slug]-og.jpg`
- **Requirements:** Same as og.webp but JPG format

### **Site-Agnostic API Fields**

#### **siteId** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Site identifier for multi-site platform
- **Format:** String identifier
- **Example:** `"brightgift"`

#### **workflowId** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Unique workflow execution identifier
- **Format:** Generated workflow ID
- **Example:** `"workflow_1234567890_abc123"`

#### **postId** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Unique post identifier
- **Format:** Generated post ID
- **Example:** `"workflow_1234567890_abc123"`

#### **generatedAt** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Timestamp when content was generated
- **Format:** ISO 8601 timestamp
- **Example:** `"2024-01-15T10:30:00.000Z"`

#### **version** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Content generation version
- **Format:** Semantic version
- **Example:** `"1.0"`

#### **currentSection** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Current workflow section
- **Format:** Section identifier
- **Example:** `"content-generation"`

#### **workflowStatus** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Current workflow status
- **Format:** Status string
- **Example:** `"processing"`

### **Content Quality Metrics**

#### **wordCount** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Actual word count for analytics
- **Format:** Integer
- **Example:** `1250`

#### **readTime** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Estimated reading time for user experience
- **Format:** Number of minutes
- **Calculation:** ~200 words per minute
- **Example:** `8`

#### **seoScore** (Required) 🔄 **PLACEHOLDER - WILL BE UPDATED LATER**
- **Purpose:** SEO optimization score
- **Format:** Integer (0-100)
- **Current:** `0` (placeholder)
- **Future:** Calculated by SEO analysis tools
- **Example:** `85`

#### **readabilityScore** (Required) 🔄 **PLACEHOLDER - WILL BE UPDATED LATER**
- **Purpose:** Content readability score
- **Format:** Integer (0-100)
- **Current:** `0` (placeholder)
- **Future:** Calculated by readability analysis
- **Example:** `78`

#### **contentQuality** (Required) 🔄 **PLACEHOLDER - WILL BE UPDATED LATER**
- **Purpose:** Content quality status
- **Format:** String
- **Options:** `"pending"`, `"approved"`, `"needs_review"`
- **Current:** `"pending"` (placeholder)
- **Future:** Updated by review workflow
- **Example:** `"pending"`

### **Affiliate Tracking Fields**

#### **affiliateCount** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Total number of affiliate links detected by AI assistant
- **Format:** Integer
- **Source:** AI assistant counts affiliate links in content
- **Example:** `5`

#### **affiliateDisclosure** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Whether affiliate disclosure is present (detected by AI assistant)
- **Format:** Boolean
- **Source:** AI assistant analyzes content for disclosure statements
- **Example:** `true`

#### **affiliatePlatforms** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Breakdown of affiliate links by platform (categorized by AI assistant)
- **Format:** Object with platform counts
- **Source:** AI assistant categorizes each affiliate link by platform
- **Example:** `{"amazon": 3, "bookshop": 2, "etsy": 1}`

### **Affiliate Link Detection Strategy**

The system uses AI assistant analysis to detect and categorize affiliate links:

#### **AI Assistant Detection Process:**
1. **Content Analysis:** AI scans the entire blog post content
2. **Link Identification:** Identifies all links that appear to be affiliate links
3. **Platform Categorization:** Categorizes each link by platform (Amazon, Bookshop, Etsy, etc.)
4. **Disclosure Detection:** Analyzes content for disclosure statements
5. **Structured Output:** Returns affiliate data in standardized JSON format

#### **Supported Platforms:**
- **Amazon:** Links containing Amazon affiliate tags
- **Bookshop:** Links to Bookshop.org with affiliate parameters
- **Etsy:** Links to Etsy with affiliate tracking
- **Other:** Any other affiliate platforms detected

#### **AI Assistant Response Format:**
```json
{
  "affiliateLinks": [
    {
      "text": "Monstera Plant Care Kit",
      "url": "https://www.amazon.com/s?k=monstera+care+kit&tag=bright-gift-20",
      "platform": "amazon",
      "price": "$29.99",
      "description": "Complete care kit for monstera plants"
    }
  ],
  "affiliateDisclosure": true,
  "disclosureText": "This post contains affiliate links. We earn a commission from qualifying purchases."
}
```

#### **Benefits of AI Assistant Approach:**
- **Site-Agnostic:** Works across all sites without hardcoded patterns
- **Flexible Detection:** Can identify any affiliate link format
- **Accurate Categorization:** Properly categorizes links by platform
- **Disclosure Detection:** Automatically detects disclosure statements
- **Future-Proof:** Adapts to new affiliate platforms automatically

### **Original Input Tracking**

#### **originalInput** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Track the original user input that generated the content
- **Format:** Object with input details
- **Example:**
```yaml
originalInput:
  prompt: "Create a gift guide for plant lovers"
  inputType: "prompt" # prompt, topic, brief
  selectedTopic: null
  selectedContent: null
  additionalNotes: "Focus on budget-friendly options"
  timestamp: "2024-01-15T10:30:00.000Z"
```

### **Categorization Fields**

#### **tags** (Required for Gift Guides) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Content categorization and filtering
- **Format:** Array of descriptive tags
- **Categories:** recipient, budget, occasion, style
- **Example:** `["plant-lovers", "under-50", "birthday", "eco-friendly"]`

#### **category** (Required) ✅ **CURRENTLY AVAILABLE**
- **Purpose:** Primary content type classification
- **Options:** `"gift-guide"`, `"how-to"`, `"educational"`, `"trending"`
- **Example:** `"gift-guide"`

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
- [ ] Convert to both WebP and JPG formats
- [ ] Upload all images to correct directory

#### **4. Frontmatter Completion**
- [ ] Fill all required fields
- [ ] Add relevant tags and categorization
- [ ] Include affiliate link tracking
- [ ] Add original input tracking
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
- **Banner:** `[slug]-banner.webp` and `[slug]-banner.jpg`
- **OG Image:** `[slug]-og.webp` and `[slug]-og.jpg`
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
│   ├── plant-lovers-banner.jpg
│   ├── plant-lovers-og.webp
│   └── plant-lovers-og.jpg
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

#### **Bluesky Posts:**
```yaml
bluesky:
  text: "Check out these amazing gift ideas! 🎁"
  hashtags: ["giftideas", "gifts", "brightgift"]
```

#### **Pinterest Posts:**
```yaml
pinterest:
  description: "🎁 Perfect gifts for plant lovers! Discover more ideas..."
  hashtags: ["giftideas", "gifts", "brightgift", "plantgifts"]
```

#### **Facebook Posts:**
```yaml
facebook:
  text: "🎁 Perfect gifts for plant lovers! What do you think?"
  hashtags: ["giftideas", "gifts", "brightgift"]
```

#### **Instagram Posts:**
```yaml
instagram:
  caption: "🎁 Perfect gifts for plant lovers! Swipe for more ideas..."
  hashtags: ["giftideas", "gifts", "brightgift", "plantgifts"]
```

#### **X (Twitter) Posts:**
```yaml
x:
  text: "Check out these amazing gift ideas! 🎁"
  hashtags: ["giftideas", "gifts", "brightgift"]
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
    imageJpg: z.string(),
    ogImageJpg: z.string(),
    siteId: z.string(),
    workflowId: z.string(),
    postId: z.string(),
    generatedAt: z.string(),
    version: z.string(),
    currentSection: z.string(),
    workflowStatus: z.string(),
    wordCount: z.number(),
    readTime: z.number(),
    seoScore: z.number(),
    readabilityScore: z.number(),
    contentQuality: z.string(),
    affiliateCount: z.number(),
    affiliateDisclosure: z.boolean(),
    affiliatePlatforms: z.record(z.number()),
    originalInput: z.object({
      prompt: z.string(),
      inputType: z.string(),
      selectedTopic: z.string().nullable(),
      selectedContent: z.string().nullable(),
      additionalNotes: z.string().nullable(),
      timestamp: z.string()
    }),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    socialPosts: z.record(z.any()).optional(),
    affiliateLinks: z.array(z.any()).optional(),
    analytics: z.record(z.any()).optional()
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
- [ ] Original input tracking complete
- [ ] Site-agnostic fields populated
- [ ] Quality metrics included

### **SEO Optimization Check**
- [ ] Primary keyword in title, meta title, first paragraph
- [ ] Secondary keywords in headings and content
- [ ] Meta description compelling and keyword-optimized
- [ ] Keywords array includes relevant terms
- [ ] Content length meets minimum requirements
- [ ] Internal linking included
- [ ] Images optimized with proper alt text

---

## 🔄 **Implementation Status Summary**

### **✅ Currently Available Fields:**
- Basic content fields (title, description, date, status)
- SEO & meta fields (metaTitle, metaDescription, keywords)
- Image fields (image, ogImage, imageJpg, ogImageJpg)
- Site-agnostic API fields (siteId, workflowId, postId, generatedAt, version, currentSection, workflowStatus)
- Content metrics (wordCount, readTime)
- Original input tracking (originalInput object)
- Categorization fields (tags, category)
- **Affiliate Tracking (affiliateCount, affiliateDisclosure, affiliatePlatforms)** - Now available via AI assistant detection
- Social media content (socialPosts for Bluesky, Pinterest, Facebook, Instagram, X)

### **🔄 Placeholder Fields (Will Be Updated Later):**
- **Quality Metrics:** seoScore, readabilityScore, contentQuality
- **Analytics Fields:** viewCount, revenue, affiliateClicks, socialEngagement, keywordRankings, competitionLevel

### **📅 Future Implementation Timeline:**
1. **Phase 1 (Current):** Content generation with AI assistant affiliate detection ✅
2. **Phase 2 (Next):** SEO analysis tools to update seoScore and readabilityScore
3. **Phase 3 (Later):** Analytics integration to update viewCount, revenue, etc.

---

*This is the single source of truth for all BrightGift frontmatter and publishing processes.*