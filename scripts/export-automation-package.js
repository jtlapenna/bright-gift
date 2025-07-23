#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const EXPORT_DIR = 'content-automation-export';
const CURRENT_DIR = process.cwd();

// Files and directories to export
const EXPORT_ITEMS = [
  // Documentation
  '_workflow-documents/planning/04.2_blog_style_guide.md',
  '_workflow-documents/planning/04.3_SEO_Guide.md',
  '_workflow-documents/planning/afrofiliate-integration-strategy.md',
  '_workflow-documents/planning/non-gift-guide-content-ideas.md',
  '_workflow-documents/planning/14_content_automation_system_implementation_plan.md',
  '_workflow-documents/planning/15_content_automation_export_package.md',
  
  // Sample content
  'src/content/blog/how-to-choose-the-perfect-gift-complete-guide.md',
  'src/content/blog/25-amazing-gifts-from-black-owned-businesses-under-75.md',
  
  // Social posts
  '_workflow-documents/social-posts/',
  
  // Configuration files
  'astro.config.mjs',
  'package.json',
  'tailwind.config.js',
  'tsconfig.json',
  
  // Scripts
  'scripts/create-blog-automation.js',
  'scripts/test-automation.js',
  'scripts/README-automation.md',
  
  // Image examples
  'public/images/blog/how-to-choose-the-perfect-gift-complete-guide/',
  'public/images/blog/25-amazing-gifts-from-black-owned-businesses-under-75/'
];

// Files to create in export
const NEW_FILES = {
  'package.json': generatePackageJson(),
  'README.md': generateReadme(),
  '.env.example': generateEnvExample(),
  '.gitignore': generateGitignore(),
  'setup.js': generateSetupScript()
};

class ExportManager {
  constructor() {
    this.exportPath = path.join(CURRENT_DIR, EXPORT_DIR);
  }

  async run() {
    console.log('🚀 Starting Content Automation System Export...\n');
    
    try {
      // Create export directory
      this.createExportDirectory();
      
      // Copy existing files
      await this.copyExistingFiles();
      
      // Create new files
      this.createNewFiles();
      
      // Create project structure
      this.createProjectStructure();
      
      // Generate documentation
      this.generateDocumentation();
      
      // Create zip file
      this.createZipFile();
      
      console.log('\n✅ Export completed successfully!');
      console.log(`📦 Export location: ${this.exportPath}`);
      console.log(`🗜️  Zip file: ${this.exportPath}.zip`);
      console.log('\n📋 Next steps:');
      console.log('1. Extract the zip file to your new project location');
      console.log('2. Run: npm install');
      console.log('3. Copy .env.example to .env and configure');
      console.log('4. Run: node setup.js');
      console.log('5. Start development: npm run dev');
      
    } catch (error) {
      console.error('❌ Export failed:', error.message);
      process.exit(1);
    }
  }

  createExportDirectory() {
    console.log('📁 Creating export directory...');
    
    if (fs.existsSync(this.exportPath)) {
      fs.rmSync(this.exportPath, { recursive: true, force: true });
    }
    
    fs.mkdirSync(this.exportPath, { recursive: true });
  }

  async copyExistingFiles() {
    console.log('📋 Copying existing files...');
    
    for (const item of EXPORT_ITEMS) {
      const sourcePath = path.join(CURRENT_DIR, item);
      const destPath = path.join(this.exportPath, 'reference', item);
      
      if (fs.existsSync(sourcePath)) {
        const destDir = path.dirname(destPath);
        fs.mkdirSync(destDir, { recursive: true });
        
        if (fs.statSync(sourcePath).isDirectory()) {
          this.copyDirectory(sourcePath, destPath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
        
        console.log(`  ✅ ${item}`);
      } else {
        console.log(`  ⚠️  ${item} (not found)`);
      }
    }
  }

  copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  createNewFiles() {
    console.log('📝 Creating new project files...');
    
    for (const [filename, content] of Object.entries(NEW_FILES)) {
      const filePath = path.join(this.exportPath, filename);
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ ${filename}`);
    }
  }

  createProjectStructure() {
    console.log('🏗️  Creating project structure...');
    
    const directories = [
      'src/cli/commands',
      'src/cli/utils',
      'src/generators',
      'src/processors',
      'src/preview/components',
      'src/preview/styles',
      'src/social/platforms',
      'src/utils',
      'config/sites',
      'config/templates/blog-types',
      'config/templates/image-prompts',
      'config/templates/social-posts',
      'config/prompts',
      'tests/unit',
      'tests/integration',
      'tests/fixtures',
      'docs',
      'scripts'
    ];
    
    for (const dir of directories) {
      const dirPath = path.join(this.exportPath, dir);
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`  ✅ ${dir}/`);
    }
  }

  generateDocumentation() {
    console.log('📚 Generating documentation...');
    
    const docs = {
      'docs/setup.md': generateSetupDocs(),
      'docs/usage.md': generateUsageDocs(),
      'docs/api.md': generateApiDocs(),
      'config/sites/bright-gift.json': generateBrightGiftConfig(),
      'config/sites/template.json': generateSiteTemplate(),
      'config/prompts/blog-ideas.md': generateBlogIdeasPrompt(),
      'config/prompts/blog-content.md': generateBlogContentPrompt(),
      'config/prompts/image-prompts.md': generateImagePromptsPrompt(),
      'config/prompts/social-posts.md': generateSocialPostsPrompt()
    };
    
    for (const [filename, content] of Object.entries(docs)) {
      const filePath = path.join(this.exportPath, filename);
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ ${filename}`);
    }
  }

  createZipFile() {
    console.log('🗜️  Creating zip file...');
    
    try {
      execSync(`cd "${CURRENT_DIR}" && zip -r "${EXPORT_DIR}.zip" "${EXPORT_DIR}"`, { stdio: 'inherit' });
      console.log('  ✅ Zip file created');
    } catch (error) {
      console.log('  ⚠️  Could not create zip file (zip command not available)');
    }
  }
}

// File generators
function generatePackageJson() {
  return JSON.stringify({
    "name": "content-automation-system",
    "version": "1.0.0",
    "description": "AI-powered content automation system for blogs and social media",
    "main": "src/cli/index.js",
    "scripts": {
      "start": "node src/cli/index.js",
      "dev": "nodemon src/cli/index.js",
      "test": "jest",
      "test:watch": "jest --watch",
      "lint": "eslint src/",
      "format": "prettier --write src/",
      "setup": "node setup.js"
    },
    "dependencies": {
      "commander": "^11.0.0",
      "inquirer": "^9.2.0",
      "openai": "^4.0.0",
      "express": "^4.18.0",
      "react": "^18.0.0",
      "react-dom": "^18.0.0",
      "gray-matter": "^4.0.0",
      "marked": "^5.0.0",
      "sharp": "^0.32.0",
      "node-cron": "^3.0.0",
      "simple-git": "^3.0.0",
      "dotenv": "^16.0.0",
      "chalk": "^5.0.0",
      "ora": "^7.0.0",
      "figlet": "^1.6.0",
      "boxen": "^7.0.0"
    },
    "devDependencies": {
      "jest": "^29.0.0",
      "eslint": "^8.0.0",
      "prettier": "^3.0.0",
      "nodemon": "^3.0.0",
      "webpack": "^5.0.0",
      "babel-loader": "^9.0.0"
    },
    "keywords": ["content", "automation", "ai", "blog", "social-media"],
    "author": "Your Name",
    "license": "MIT"
  }, null, 2);
}

function generateReadme() {
  return `# Content Automation System

AI-powered content automation system for blogs and social media.

## Features

- 🤖 AI-powered blog content generation
- 🎨 Automated image prompt creation
- 📱 Social media post generation
- 👀 Preview and approval system
- 🔄 Multi-site support
- 📊 Analytics integration

## Quick Start

1. Install dependencies: \`npm install\`
2. Copy \`.env.example\` to \`.env\` and configure
3. Run setup: \`npm run setup\`
4. Start development: \`npm run dev\`

## Documentation

- [Setup Guide](docs/setup.md)
- [Usage Guide](docs/usage.md)
- [API Documentation](docs/api.md)

## Reference Files

All reference files from the original project are in the \`reference/\` directory.
`;
}

function generateEnvExample() {
  return `# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview

# Site Configuration
SITE_NAME=your_site_name
SITE_DOMAIN=your_domain.com

# Social Media APIs
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
PINTEREST_ACCESS_TOKEN=your_pinterest_token
FACEBOOK_ACCESS_TOKEN=your_facebook_token
BLUESKY_IDENTIFIER=your_bluesky_identifier
BLUESKY_PASSWORD=your_bluesky_password

# Image Processing
IMAGEKIT_PUBLIC_KEY=your_imagekit_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint

# Database (for analytics)
DATABASE_URL=your_database_url

# Preview Server
PREVIEW_PORT=3001
PREVIEW_HOST=localhost
`;
}

function generateGitignore() {
  return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
*.tgz
*.tar.gz

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;
}

function generateSetupScript() {
  return `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Content Automation System...\\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from .env.example...');
  fs.copyFileSync('.env.example', '.env');
  console.log('⚠️  Please edit .env file with your configuration\\n');
} else {
  console.log('✅ .env file already exists\\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\\n');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Create initial site configuration
console.log('⚙️  Creating initial site configuration...');
const configDir = path.join(__dirname, 'config', 'sites');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

const defaultConfig = {
  "name": "my-site",
  "domain": "example.com",
  "contentDir": "src/content/blog",
  "imagesDir": "public/images/blog",
  "socialPostsDir": "_workflow-documents/social-posts",
  "styleGuide": "reference/_workflow-documents/planning/04.2_blog_style_guide.md",
  "seoGuide": "reference/_workflow-documents/planning/04.3_SEO_Guide.md",
  "affiliatePrograms": {
    "amazon": {
      "enabled": true,
      "tag": "your-amazon-tag"
    },
    "bookshop": {
      "enabled": true,
      "tag": "your-bookshop-tag"
    },
    "afrofiliate": {
      "enabled": true,
      "brands": []
    }
  },
  "socialPlatforms": {
    "twitter": {
      "enabled": false,
      "apiKey": "",
      "apiSecret": ""
    },
    "instagram": {
      "enabled": false,
      "accessToken": ""
    },
    "pinterest": {
      "enabled": false,
      "accessToken": ""
    },
    "facebook": {
      "enabled": false,
      "accessToken": ""
    },
    "bluesky": {
      "enabled": false,
      "identifier": "",
      "password": ""
    }
  },
  "imageGeneration": {
    "model": "gpt-image-1",
    "style": "brightgift",
    "dimensions": {
      "banner": "1200x630",
      "social": "1200x1200",
      "og": "1200x630"
    }
  }
};

fs.writeFileSync(
  path.join(configDir, 'my-site.json'),
  JSON.stringify(defaultConfig, null, 2)
);

console.log('✅ Initial configuration created\\n');

console.log('🎉 Setup complete!');
console.log('\\n📋 Next steps:');
console.log('1. Edit .env file with your API keys');
console.log('2. Configure your site in config/sites/my-site.json');
console.log('3. Run: npm run dev');
console.log('4. Check reference/ directory for examples');
`;
}

function generateSetupDocs() {
  return `# Setup Guide

## Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Git repository

## Installation

1. Clone or extract the project
2. Install dependencies: \`npm install\`
3. Copy \`.env.example\` to \`.env\`
4. Configure your environment variables
5. Run setup: \`npm run setup\`

## Configuration

### Environment Variables

Edit \`.env\` file with your API keys and settings.

### Site Configuration

Create a site configuration in \`config/sites/\`:

\`\`\`json
{
  "name": "my-site",
  "domain": "example.com",
  "contentDir": "src/content/blog",
  "imagesDir": "public/images/blog"
}
\`\`\`

## Development

- Start development: \`npm run dev\`
- Run tests: \`npm test\`
- Lint code: \`npm run lint\`
- Format code: \`npm run format\`

## Reference Files

All reference files from the original project are in the \`reference/\` directory.
`;
}

function generateUsageDocs() {
  return `# Usage Guide

## CLI Commands

### Generate Blog Content

\`\`\`bash
npm start generate blog
\`\`\`

### Preview Content

\`\`\`bash
npm start preview
\`\`\`

### Publish Content

\`\`\`bash
npm start publish
\`\`\`

### Social Media

\`\`\`bash
npm start social
\`\`\`

## Interactive Mode

Run without arguments for interactive mode:

\`\`\`bash
npm start
\`\`\`

## Configuration

See \`config/sites/\` for site-specific configurations.
`;
}

function generateApiDocs() {
  return `# API Documentation

## Content Generators

### Blog Ideas Generator

\`\`\`javascript
const { generateBlogIdeas } = require('./src/generators/blog-ideas');

const ideas = await generateBlogIdeas({
  site: 'my-site',
  count: 10,
  type: 'gift-guide'
});
\`\`\`

### Blog Content Generator

\`\`\`javascript
const { generateBlogContent } = require('./src/generators/blog-content');

const content = await generateBlogContent({
  title: 'Blog Title',
  type: 'gift-guide',
  site: 'my-site'
});
\`\`\`

## Image Processors

### Image Prompt Generator

\`\`\`javascript
const { generateImagePrompts } = require('./src/generators/image-prompts');

const prompts = await generateImagePrompts({
  title: 'Blog Title',
  excerpt: 'Blog excerpt...',
  style: 'brightgift'
});
\`\`\`

## Social Media

### Social Post Generator

\`\`\`javascript
const { generateSocialPosts } = require('./src/generators/social-posts');

const posts = await generateSocialPosts({
  blogContent: '...',
  platforms: ['twitter', 'instagram']
});
\`\`\`
`;
}

function generateBrightGiftConfig() {
  return JSON.stringify({
    "name": "bright-gift",
    "domain": "bright-gift.com",
    "contentDir": "src/content/blog",
    "imagesDir": "public/images/blog",
    "socialPostsDir": "_workflow-documents/social-posts",
    "styleGuide": "reference/_workflow-documents/planning/04.2_blog_style_guide.md",
    "seoGuide": "reference/_workflow-documents/planning/04.3_SEO_Guide.md",
    "affiliatePrograms": {
      "amazon": {
        "enabled": true,
        "tag": "brightgift-20"
      },
      "bookshop": {
        "enabled": true,
        "tag": "brightgift"
      },
      "afrofiliate": {
        "enabled": true,
        "brands": [
          {
            "name": "Be Yourself",
            "url": "https://beyourself.com",
            "category": "clothing"
          },
          {
            "name": "Caribe",
            "url": "https://caribe.com",
            "category": "sports"
          }
        ]
      }
    },
    "socialPlatforms": {
      "twitter": {
        "enabled": true,
        "apiKey": "",
        "apiSecret": ""
      },
      "instagram": {
        "enabled": true,
        "accessToken": ""
      },
      "pinterest": {
        "enabled": true,
        "accessToken": ""
      },
      "facebook": {
        "enabled": true,
        "accessToken": ""
      },
      "bluesky": {
        "enabled": true,
        "identifier": "",
        "password": ""
      }
    },
    "imageGeneration": {
      "model": "gpt-image-1",
      "style": "brightgift",
      "dimensions": {
        "banner": "1200x630",
        "social": "1200x1200",
        "og": "1200x630"
      }
    }
  }, null, 2);
}

function generateSiteTemplate() {
  return JSON.stringify({
    "name": "site-name",
    "domain": "example.com",
    "contentDir": "src/content/blog",
    "imagesDir": "public/images/blog",
    "socialPostsDir": "_workflow-documents/social-posts",
    "styleGuide": "reference/_workflow-documents/planning/04.2_blog_style_guide.md",
    "seoGuide": "reference/_workflow-documents/planning/04.3_SEO_Guide.md",
    "affiliatePrograms": {
      "amazon": {
        "enabled": true,
        "tag": "your-amazon-tag"
      },
      "bookshop": {
        "enabled": true,
        "tag": "your-bookshop-tag"
      },
      "afrofiliate": {
        "enabled": true,
        "brands": []
      }
    },
    "socialPlatforms": {
      "twitter": {
        "enabled": false,
        "apiKey": "",
        "apiSecret": ""
      },
      "instagram": {
        "enabled": false,
        "accessToken": ""
      },
      "pinterest": {
        "enabled": false,
        "accessToken": ""
      },
      "facebook": {
        "enabled": false,
        "accessToken": ""
      },
      "bluesky": {
        "enabled": false,
        "identifier": "",
        "password": ""
      }
    },
    "imageGeneration": {
      "model": "gpt-image-1",
      "style": "brightgift",
      "dimensions": {
        "banner": "1200x630",
        "social": "1200x1200",
        "og": "1200x630"
      }
    }
  }, null, 2);
}

function generateBlogIdeasPrompt() {
  return `# Blog Ideas Generation Prompt

You are an expert content strategist for [SITE_NAME]. Generate blog post ideas that will drive traffic and engagement.

## Requirements

- Focus on [SITE_DOMAIN]'s target audience
- Include a mix of content types (gift guides, educational, data-driven)
- Prioritize SEO-friendly topics
- Consider seasonal relevance
- Include affiliate opportunities where appropriate

## Output Format

Return a JSON array of blog ideas:

\`\`\`json
[
  {
    "title": "Blog Post Title",
    "type": "gift-guide|educational|data-driven",
    "priority": "high|medium|low",
    "targetAudience": "description",
    "seoKeywords": ["keyword1", "keyword2"],
    "affiliateOpportunities": ["amazon", "bookshop", "afrofiliate"],
    "estimatedWordCount": 2000,
    "seasonalRelevance": "year-round|christmas|valentines|etc"
  }
]
\`\`\`

## Content Types

### Gift Guides
- Product recommendations
- Price-based guides
- Occasion-specific guides
- Demographic-specific guides

### Educational
- How-to guides
- Tips and tricks
- Industry insights
- Best practices

### Data-Driven
- Statistics and trends
- Research findings
- Survey results
- Market analysis
`;
}

function generateBlogContentPrompt() {
  return `# Blog Content Generation Prompt

You are an expert content writer for [SITE_NAME]. Create high-quality, SEO-optimized blog content.

## Requirements

- Follow the style guide in [STYLE_GUIDE_PATH]
- Optimize for SEO using guidelines in [SEO_GUIDE_PATH]
- Include proper frontmatter
- Use internal linking
- Include affiliate links where appropriate
- Target word count: [WORD_COUNT]
- Focus on [TARGET_AUDIENCE]

## Content Structure

1. **Introduction** - Hook the reader and introduce the topic
2. **Main Content** - Organized sections with clear headings
3. **Conclusion** - Summarize key points and call-to-action
4. **Related Content** - Internal links to other relevant posts

## Frontmatter Template

\`\`\`yaml
---
title: "Blog Post Title"
description: "SEO-optimized description"
date: "YYYY-MM-DD"
image: "/images/blog/[slug]/[slug]-banner.webp"
ogImage: "/images/blog/[slug]/[slug]-banner.webp"
tags: ["tag1", "tag2", "tag3"]
author: "[SITE_NAME] Team"
category: "[CATEGORY]"
---
\`\`\`

## Affiliate Integration

- Include Amazon affiliate links for relevant products
- Add Bookshop.org links for book recommendations
- Integrate Afrofiliate links for Black-owned businesses
- Use proper affiliate disclosure

## SEO Optimization

- Include target keywords naturally
- Use proper heading structure (H1, H2, H3)
- Optimize meta description
- Include internal and external links
- Use alt text for images
`;
}

function generateImagePromptsPrompt() {
  return `# Image Prompt Generation Prompt

You are an AI art director for [SITE_NAME]. Create image prompts for blog content.

## Style Guidelines

Follow the [SITE_NAME] brand style:
- Modern flat illustration with soft 3D-style characters and objects
- Warm, vibrant pastels (teal #00A99D, coral-orange #FF6B35, sunshine yellow #FFD700)
- Clean, giftable layouts with rounded forms
- Cheerful, light, editorial tone
- No text in banner/OG images (text allowed in social)

## Image Types

### Banner (16:9, 1200x630px)
- Wide horizontal layout
- No text or logos
- Focus on main theme/subject

### Social (1:1, 1200x1200px)
- Square format
- Can include title text
- Social media optimized

### OG (16:9, 1200x630px)
- Open Graph preview
- No text or logos
- Facebook/Twitter optimized

## Output Format

\`\`\`json
{
  "slug": "blog-post-slug",
  "prompts": [
    {
      "label": "banner",
      "text": "Full styled prompt with dimensions and style signature"
    },
    {
      "label": "social", 
      "text": "Full styled prompt with dimensions and style signature"
    },
    {
      "label": "og",
      "text": "Full styled prompt with dimensions and style signature"
    }
  ]
}
\`\`\`

## Prompt Requirements

- Include clear dimensional instructions
- End with the BrightGift Style Signature
- Focus on physical objects and scenes
- Avoid surrealism or complex environments
- Use descriptive, fluent language
`;
}

function generateSocialPostsPrompt() {
  return `# Social Media Post Generation Prompt

You are a social media expert for [SITE_NAME]. Create engaging social posts for blog content.

## Platforms

Generate posts for:
- Twitter (280 characters)
- Instagram (caption + hashtags)
- Pinterest (description + hashtags)
- Facebook (post text)
- Bluesky (280 characters)

## Content Guidelines

- Adapt tone for each platform
- Include relevant hashtags
- Add call-to-action
- Link to blog post
- Use platform-specific features

## Output Format

\`\`\`json
{
  "blogUrl": "https://[SITE_DOMAIN]/blog/[slug]",
  "imagePath": "public/images/blog/[slug]/",
  "posts": {
    "twitter": [
      {
        "text": "Post text with link",
        "hashtags": ["#hashtag1", "#hashtag2"]
      }
    ],
    "instagram": [
      {
        "caption": "Post caption with hashtags",
        "hashtags": ["#hashtag1", "#hashtag2"]
      }
    ],
    "pinterest": [
      {
        "description": "Pin description with hashtags",
        "hashtags": ["#hashtag1", "#hashtag2"]
      }
    ],
    "facebook": [
      {
        "text": "Facebook post text"
      }
    ],
    "bluesky": [
      {
        "text": "Bluesky post text"
      }
    ]
  }
}
\`\`\`

## Post Strategy

- Create 3-5 variations per platform
- Include key messaging points
- Target different audience segments
- Use seasonal timing when relevant
- Include engagement questions
`;
}

// Run the export
if (require.main === module) {
  const exporter = new ExportManager();
  exporter.run();
}

module.exports = ExportManager; 