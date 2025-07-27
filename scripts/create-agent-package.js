#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Create Agent Integration Package
 * 
 * This script creates a packaged directory containing all the necessary
 * documents for other agents to integrate with the Multi-Site Hub API.
 */

const PACKAGE_DIR = '_workflow-documents/agent-integration-package';
const DOCUMENTS = [
  {
    source: '_workflow-documents/AGENT_PACKAGE_SUMMARY.md',
    dest: '00_PACKAGE_SUMMARY.md'
  },
  {
    source: '_workflow-documents/AGENT_INTEGRATION_CHECKLIST.md',
    dest: '01_INTEGRATION_CHECKLIST.md'
  },
  {
    source: '_workflow-documents/API_INTEGRATION_PACKAGE_FOR_AGENTS.md',
    dest: '02_API_INTEGRATION_GUIDE.md'
  },
  {
    source: '_workflow-documents/STANDARDIZED_FRONTMATTER_SCHEMA.md',
    dest: '03_FRONTMATTER_SCHEMA.md'
  },
  {
    source: 'api-server/README.md',
    dest: '04_API_SERVER_DOCUMENTATION.md'
  },
  {
    source: '_workflow-documents/n8n-new-flow/supabase_schema_and_sql.md',
    dest: '05_DATABASE_SCHEMA.md'
  }
];

function createPackage() {
  console.log('📦 Creating Agent Integration Package...\n');

  // Create package directory
  if (!fs.existsSync(PACKAGE_DIR)) {
    fs.mkdirSync(PACKAGE_DIR, { recursive: true });
    console.log(`✅ Created package directory: ${PACKAGE_DIR}`);
  }

  // Copy documents
  let copiedCount = 0;
  let errorCount = 0;

  DOCUMENTS.forEach(({ source, dest }) => {
    const sourcePath = path.join(process.cwd(), source);
    const destPath = path.join(process.cwd(), PACKAGE_DIR, dest);

    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied: ${source} → ${dest}`);
        copiedCount++;
      } else {
        console.log(`⚠️  Missing: ${source}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Error copying ${source}: ${error.message}`);
      errorCount++;
    }
  });

  // Create README for the package
  const packageReadme = `# 🚀 Multi-Site Hub Agent Integration Package

This package contains everything you need to integrate your site with the Multi-Site Hub API.

## 📋 Quick Start

1. **Start here**: [Package Summary](./00_PACKAGE_SUMMARY.md)
2. **Follow the checklist**: [Integration Checklist](./01_INTEGRATION_CHECKLIST.md)
3. **Read the full guide**: [API Integration Guide](./02_API_INTEGRATION_GUIDE.md)
4. **Review the schema**: [Frontmatter Schema](./03_FRONTMATTER_SCHEMA.md)
5. **Check the API docs**: [API Server Documentation](./04_API_SERVER_DOCUMENTATION.md)
6. **Database info**: [Database Schema](./05_DATABASE_SCHEMA.md)

## 🎯 What's Included

- **Complete API documentation** with examples
- **Step-by-step integration checklist**
- **Standardized frontmatter schema**
- **Database schema and setup instructions**
- **Code examples for different site themes**

## 🚀 Ready to Integrate?

Start with the [Integration Checklist](./01_INTEGRATION_CHECKLIST.md) and then dive into the [API Integration Guide](./02_API_INTEGRATION_GUIDE.md) for detailed instructions.

---

**Package created**: ${new Date().toISOString()}
**Hub API Version**: 1.0.0
`;

  fs.writeFileSync(path.join(process.cwd(), PACKAGE_DIR, 'README.md'), packageReadme);
  console.log(`✅ Created: README.md`);

  // Create a simple example configuration file
  const exampleConfig = `# Example Site Configuration

## Content Types Example

\`\`\`json
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
\`\`\`

## Frontmatter Example

\`\`\`yaml
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
\`\`\`

## API Endpoints Example

\`\`\`bash
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
\`\`\`
`;

  fs.writeFileSync(path.join(process.cwd(), PACKAGE_DIR, 'EXAMPLE_CONFIG.md'), exampleConfig);
  console.log(`✅ Created: EXAMPLE_CONFIG.md`);

  // Summary
  console.log(`\n📊 Package Summary:`);
  console.log(`   ✅ Documents copied: ${copiedCount}`);
  console.log(`   ⚠️  Missing files: ${errorCount}`);
  console.log(`   📁 Package location: ${PACKAGE_DIR}`);
  console.log(`\n🎉 Agent Integration Package created successfully!`);
  console.log(`\n📤 To share with agents:`);
  console.log(`   1. Zip the '${PACKAGE_DIR}' directory`);
  console.log(`   2. Send the zip file to other agents`);
  console.log(`   3. Agents can extract and follow the README.md`);
};

// Run the script
if (require.main === module) {
  createPackage();
}

module.exports = { createPackage }; 