# Frontmatter + API Integration Guide for Multi-Site Content Automation

## 🎯 Overview

This guide explains how the **standardized frontmatter schema** integrates with the **comprehensive API system** to create a powerful, portable, and agent-friendly content automation platform that can be shared across all sites.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Content       │    │   API Server    │    │   Dashboard     │
│   Agents        │◄──►│   (Express.js)  │◄──►│   (Frontend)    │
│                 │    │                 │    │                 │
│ • Generate      │    │ • Parse         │    │ • Display       │
│   frontmatter   │    │   frontmatter   │    │   content       │
│ • Write content │    │ • Serve JSON    │    │ • Manage        │
│ • Create images │    │ • Handle CRUD   │    │   workflows     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Markdown      │    │   Supabase      │    │   Real-time     │
│   Files         │    │   Database      │    │   Updates       │
│                 │    │                 │    │                 │
│ • Self-contained│    │ • Analytics     │    │ • WebSocket     │
│ • Version       │    │ • Workflow      │    │ • Live data     │
│   controlled    │    │   state         │    │ • Notifications │
│ • Portable      │    │ • User actions  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📋 Complete API Endpoint Summary

### **Core Endpoints**
- **Authentication**: `/api/v1/auth/*` - Login, register, user management
- **Sites**: `/api/v1/sites/*` - Site management and health scores
- **Posts**: `/api/v1/sites/{siteId}/posts/*` - Full post lifecycle management
- **Workflows**: `/api/v1/sites/{siteId}/workflows/*` - Workflow control and monitoring

### **Analytics Endpoints** 📊
- `GET /api/v1/sites/{siteId}/analytics` - Comprehensive site analytics
- `GET /api/v1/sites/{siteId}/analytics/posts/{postId}` - Post-specific analytics
- `GET /api/v1/sites/{siteId}/analytics/workflows` - Workflow performance analytics

### **Activity Feed** 📈
- `GET /api/v1/sites/{siteId}/activity` - Activity feed with filtering
- `POST /api/v1/sites/{siteId}/activity` - Log new activities
- `GET /api/v1/sites/{siteId}/activity/stats` - Activity statistics

### **Global Dashboard** 🌐
- `GET /api/v1/dashboard/overview` - Global overview across all sites
- `GET /api/v1/dashboard/global-analytics` - Aggregate analytics
- `GET /api/v1/dashboard/recent-activity` - Cross-site activity

### **Search & Filtering** 🔍
- `GET /api/v1/sites/{siteId}/search/posts` - Advanced post search
- `GET /api/v1/sites/{siteId}/search/workflows` - Workflow search
- `GET /api/v1/sites/{siteId}/search/suggestions` - Autocomplete suggestions

### **Bulk Operations** ⚡
- `POST /api/v1/sites/{siteId}/bulk/posts/approve` - Bulk approve posts
- `POST /api/v1/sites/{siteId}/bulk/posts/reject` - Bulk reject posts
- `POST /api/v1/sites/{siteId}/bulk/posts/publish` - Bulk publish posts
- `POST /api/v1/sites/{siteId}/bulk/workflows/cancel` - Bulk cancel workflows
- `POST /api/v1/sites/{siteId}/bulk/workflows/retry` - Bulk retry workflows

### **Webhooks** 🔗
- `POST /api/v1/webhooks/workflow-status` - n8n workflow updates
- `POST /api/v1/webhooks/post-status` - Post status updates
- `POST /api/v1/webhooks/analytics` - Analytics updates

---

## 🔄 Frontmatter ↔ API Integration

### **1. Content Creation Flow**

```mermaid
graph LR
    A[Agent Generates Content] --> B[Creates Markdown + Frontmatter]
    B --> C[n8n Workflow Processes]
    C --> D[Updates Database via API]
    D --> E[Dashboard Displays Data]
    E --> F[User Reviews & Approves]
    F --> G[API Updates Frontmatter]
    G --> H[Content Published]
```

### **2. Frontmatter to API Mapping**

The API can read frontmatter and serve it as JSON:

```javascript
// API Route: Parse frontmatter from markdown
const matter = require('gray-matter');

function parseFrontmatter(markdownContent) {
  const { data, content } = matter(markdownContent);
  
  return {
    id: data.slug,
    title: data.title,
    status: data.status,
    contentType: data.contentType,
    seo: {
      score: data.quality?.seoScore || 0,
      keywords: data.keywords || [],
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription
    },
    social: data.socialPosts || {},
    analytics: data.analytics || {},
    workflow: data.workflow || {},
    affiliateLinks: data.affiliateLinks || [],
    images: {
      banner: data.image,
      og: data.ogImage,
      social: data.socialImage
    },
    content: content,
    wordCount: content.split(' ').length,
    readTime: Math.ceil(content.split(' ').length / 200)
  };
}
```

### **3. API to Frontmatter Sync**

Updates from the API can be written back to frontmatter:

```javascript
// Update frontmatter with API changes
function updateFrontmatter(filePath, updates) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: markdown } = matter(content);
  
  // Merge updates
  const updatedData = { ...data, ...updates };
  
  // Write back to file
  const updatedContent = matter.stringify(markdown, updatedData);
  fs.writeFileSync(filePath, updatedContent);
}

// Example: Update analytics data
updateFrontmatter('post.md', {
  analytics: {
    views: 1250,
    revenue: 25.50,
    lastUpdated: new Date().toISOString()
  },
  workflow: {
    currentPhase: 'published',
    phasesCompleted: ['seo_research', 'content_generation', 'publishing']
  }
});
```

---

## 🚀 Implementation for Content Agents

### **1. Agent-Friendly Schema**

Agents only need to generate these core fields:

```yaml
---
title: "Blog Post Title"
description: "SEO-optimized description"
keywords: ["keyword1", "keyword2", "keyword3"]
tags: ["tag1", "tag2", "tag3"]
contentType: "gift-guide"
recipient: "tech-lovers"
budget: "under-50"
occasion: "christmas"
---
```

### **2. System-Generated Fields**

The system automatically adds:

```yaml
---
# Auto-generated by system
slug: "auto-generated-from-title"
date: "2024-01-15"
status: "draft"
image: "/images/blog/slug/slug-banner.webp"
ogImage: "/images/blog/slug/slug-og.webp"
socialImage: "/images/blog/slug/slug-social.webp"

# Workflow tracking
workflow:
  currentPhase: "content_generation"
  phasesCompleted: ["seo_research"]
  lastUpdated: "2024-01-15T10:30:00Z"

# Analytics (updated by API)
analytics:
  views: 0
  revenue: 0
  lastUpdated: "2024-01-15T10:30:00Z"
---
```

### **3. Agent Integration Example**

```javascript
// Agent generates content with minimal frontmatter
const agentContent = {
  title: "25 Amazing Gifts from Black-Owned Businesses Under $75",
  description: "Discover thoughtful gifts that support diverse entrepreneurs...",
  keywords: ["Black-owned business gifts", "support small business"],
  tags: ["Black-owned businesses", "gift guide", "under $75"],
  contentType: "gift-guide",
  recipient: "conscious-consumers",
  budget: "under-75",
  content: "# Introduction\n\nFinding the perfect gift..."
};

// System processes and enriches
const enrichedContent = await processAgentContent(agentContent);
// Result: Complete frontmatter + content ready for API
```

---

## 📊 Dashboard Integration

### **1. Reading Frontmatter Data**

The dashboard can read frontmatter directly or via API:

```javascript
// Direct file reading
async function getPostData(slug) {
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
    workflow: data.workflow || {}
  };
}

// Via API
async function getPostDataViaAPI(slug) {
  const response = await fetch(`/api/v1/sites/${siteId}/posts/${slug}`);
  return response.json();
}
```

### **2. Real-time Updates**

WebSocket integration for live updates:

```javascript
// Connect to WebSocket for real-time updates
const ws = new WebSocket(`ws://localhost:3001?siteId=${siteId}`);

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  switch (update.type) {
    case 'post_update':
      updatePostInUI(update.data);
      break;
    case 'workflow_update':
      updateWorkflowInUI(update.data);
      break;
    case 'analytics_update':
      updateAnalyticsInUI(update.data);
      break;
  }
};
```

---

## 🔧 Cross-Site Deployment

### **1. Standardized Configuration**

Each site uses the same schema but with site-specific configuration:

```yaml
# Site-specific config
siteConfig:
  siteId: "site_123"
  domain: "brightgift.com"
  theme: "default"
  autoPublish: true
  seoOptimization: true

# Content remains portable
title: "Blog Post Title"
description: "SEO-optimized description"
keywords: ["keyword1", "keyword2"]
```

### **2. Migration Script**

```javascript
// Migrate existing content to new schema
async function migrateContent(oldContent) {
  const newFrontmatter = {
    // Required fields
    title: oldContent.title,
    description: oldContent.description,
    date: oldContent.date,
    status: oldContent.status || 'draft',
    contentType: oldContent.category || 'blog',
    
    // SEO fields
    metaTitle: oldContent.metaTitle,
    metaDescription: oldContent.metaDescription,
    keywords: oldContent.keywords || [],
    
    // Images
    image: oldContent.image,
    ogImage: oldContent.ogImage,
    socialImage: oldContent.socialImage,
    
    // System fields
    slug: oldContent.slug,
    workflow: {
      currentPhase: 'published',
      phasesCompleted: ['content_generation', 'publishing']
    },
    analytics: {
      views: 0,
      revenue: 0,
      lastUpdated: new Date().toISOString()
    }
  };
  
  return matter.stringify(oldContent.body, newFrontmatter);
}
```

### **3. Agent Sharing**

Share this schema with other sites:

```bash
# Export schema and examples
cp _workflow-documents/STANDARDIZED_FRONTMATTER_SCHEMA.md /shared/
cp _workflow-documents/FRONTMATTER_API_INTEGRATION_GUIDE.md /shared/

# Include API documentation
cp api-server/README.md /shared/
cp _workflow-documents/API_USAGE_GUIDE_FOR_AGENTS.md /shared/
```

---

## 🎯 Benefits Summary

### **For Content Agents**
- ✅ **Simple Schema**: Only need to generate core content fields
- ✅ **Self-Contained**: Content is portable and version-controlled
- ✅ **Validation**: Built-in schema validation ensures consistency
- ✅ **Extensible**: New fields can be added without breaking existing content

### **For System Integration**
- ✅ **API Ready**: Frontmatter can be parsed and served via comprehensive API
- ✅ **Real-time**: WebSocket integration for live updates
- ✅ **Analytics**: Built-in analytics tracking and reporting
- ✅ **Workflow**: Full workflow state management and control

### **For Cross-Site Compatibility**
- ✅ **Portable**: Same schema works across all sites
- ✅ **Standardized**: Consistent data structure for all agents
- ✅ **Future-Proof**: Works with any content management system
- ✅ **Scalable**: Can handle multiple sites and agents

### **For Dashboard Development**
- ✅ **Rich Data**: All metadata available for display
- ✅ **Real-time Updates**: Live notifications and updates
- ✅ **Advanced Features**: Search, filtering, bulk operations
- ✅ **Analytics**: Comprehensive reporting and insights

---

## 🚀 Next Steps

### **1. Immediate Implementation**
1. **Update Content Schema**: Migrate existing content to new frontmatter schema
2. **Deploy API**: Set up the comprehensive API server
3. **Test Integration**: Verify frontmatter ↔ API integration works
4. **Update Agents**: Modify content generation prompts to use new schema

### **2. Cross-Site Deployment**
1. **Share Schema**: Distribute standardized schema to other sites
2. **Create Migration Scripts**: Automate content migration
3. **Deploy API**: Set up API servers for each site
4. **Train Agents**: Update agents to use new schema

### **3. Advanced Features**
1. **Real-time Dashboard**: Build comprehensive dashboard with live updates
2. **Advanced Analytics**: Implement detailed reporting and insights
3. **Workflow Automation**: Enhance n8n integration with new endpoints
4. **Bulk Operations**: Implement advanced bulk management features

This frontmatter + API approach creates a powerful, portable, and agent-friendly system that can be easily shared across all sites while maintaining full compatibility with existing workflows and providing rich functionality for dashboards and automation. 