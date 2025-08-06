# Content Automation System - Export Package

## 📋 Overview
This document contains everything needed to build the content automation system in a new project. It includes file structure, dependencies, configuration templates, and integration points.

## 🏗️ New Project Structure

```
content-automation-system/
├── package.json
├── README.md
├── .env.example
├── .gitignore
├── src/
│   ├── cli/
│   │   ├── index.js              # Main CLI entry point
│   │   ├── commands/
│   │   │   ├── generate.js       # Generate blog content
│   │   │   ├── preview.js        # Preview and approval
│   │   │   ├── publish.js        # Publish content
│   │   │   └── social.js         # Social media automation
│   │   └── utils/
│   │       ├── prompts.js        # AI prompts
│   │       ├── validation.js     # Input validation
│   │       └── formatting.js     # Output formatting
│   ├── generators/
│   │   ├── blog-ideas.js         # Blog idea generation
│   │   ├── blog-content.js       # Blog content generation
│   │   ├── image-prompts.js      # Image prompt generation
│   │   └── social-posts.js       # Social post generation
│   ├── processors/
│   │   ├── images.js             # Image processing
│   │   ├── seo.js                # SEO optimization
│   │   └── formatting.js         # Content formatting
│   ├── preview/
│   │   ├── server.js             # Preview server
│   │   ├── components/           # React components
│   │   └── styles/               # CSS styles
│   ├── social/
│   │   ├── platforms/            # Platform-specific handlers
│   │   ├── scheduling.js         # Post scheduling
│   │   └── analytics.js          # Social analytics
│   └── utils/
│       ├── file-system.js        # File operations
│       ├── git.js                # Git operations
│       ├── api.js                # API integrations
│       └── config.js             # Configuration management
├── config/
│   ├── sites/                    # Site-specific configurations
│   │   ├── bright-gift.json      # BrightGift configuration
│   │   └── template.json         # Template for new sites
│   ├── templates/                # Content templates
│   │   ├── blog-types/           # Different blog type templates
│   │   ├── image-prompts/        # Image prompt templates
│   │   └── social-posts/         # Social post templates
│   └── prompts/                  # AI prompt templates
│       ├── blog-ideas.md
│       ├── blog-content.md
│       ├── image-prompts.md
│       └── social-posts.md
├── tests/
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── fixtures/                 # Test data
├── docs/
│   ├── setup.md                  # Setup instructions
│   ├── usage.md                  # Usage guide
│   ├── api.md                    # API documentation
│   └── deployment.md             # Deployment guide
└── scripts/
    ├── setup.js                  # Initial setup script
    ├── migrate.js                # Migration utilities
    └── backup.js                 # Backup utilities
```

## 📦 Required Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "commander": "^11.0.0",           // CLI framework
    "inquirer": "^9.2.0",             // Interactive prompts
    "openai": "^4.0.0",               // OpenAI API
    "express": "^4.18.0",             // Preview server
    "react": "^18.0.0",               // Preview UI
    "react-dom": "^18.0.0",           // React DOM
    "gray-matter": "^4.0.0",          // Frontmatter parsing
    "marked": "^5.0.0",               // Markdown processing
    "sharp": "^0.32.0",               // Image processing
    "node-cron": "^3.0.0",            // Scheduling
    "simple-git": "^3.0.0",           // Git operations
    "dotenv": "^16.0.0",              // Environment variables
    "chalk": "^5.0.0",                // Terminal colors
    "ora": "^7.0.0",                  // Loading spinners
    "figlet": "^1.6.0",               // ASCII art
    "boxen": "^7.0.0"                 // Terminal boxes
  },
  "devDependencies": {
    "jest": "^29.0.0",                // Testing
    "eslint": "^8.0.0",               // Linting
    "prettier": "^3.0.0",             // Formatting
    "nodemon": "^3.0.0",              // Development
    "webpack": "^5.0.0",              // Bundling
    "babel-loader": "^9.0.0"          // Babel loader
  }
}
```

## 🔧 Configuration Templates

### Site Configuration Template
```json
{
  "name": "site-name",
  "domain": "example.com",
  "contentDir": "src/content/blog",
  "imagesDir": "public/images/blog",
  "socialPostsDir": "_workflow-documents/social-posts",
  "styleGuide": "_workflow-documents/planning/04.2_blog_style_guide.md",
  "seoGuide": "_workflow-documents/planning/04.3_SEO_Guide.md",
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
}
```

### Environment Variables Template
```bash
# OpenAI Configuration
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
```

## 📁 Files to Export from Current Project

### Documentation Files
- `_workflow-documents/planning/04.2_blog_style_guide.md`
- `_workflow-documents/planning/04.3_SEO_Guide.md`
- `_workflow-documents/planning/afrofiliate-integration-strategy.md`
- `_workflow-documents/planning/non-gift-guide-content-ideas.md`
- `_workflow-documents/planning/14_content_automation_system_implementation_plan.md`

### Content Templates
- `src/content/blog/` (sample blog posts for reference)
- `_workflow-documents/social-posts/` (social post templates)

### Configuration Files
- `astro.config.mjs` (for reference)
- `package.json` (for dependency reference)
- `tailwind.config.js` (for styling reference)

### Scripts (for reference)
- `scripts/create-blog-automation.js`
- `scripts/test-automation.js`
- `scripts/README-automation.md`

## 🔗 Integration Points

### With Existing Astro Projects
1. **Content Generation** - Generate markdown files in `src/content/blog/`
2. **Image Processing** - Process and place images in `public/images/blog/`
3. **Social Posts** - Generate social posts in `_workflow-documents/social-posts/`
4. **Git Integration** - Commit and push changes to repository
5. **Preview System** - Serve preview of generated content

### With Other CMS/Static Site Generators
1. **Content Export** - Export to various formats (Markdown, JSON, YAML)
2. **Image Optimization** - Process images for different platforms
3. **Social Integration** - Post to multiple social platforms
4. **Analytics** - Track content performance across platforms

## 🚀 Setup Instructions for New Project

### 1. Initialize Project
```bash
mkdir content-automation-system
cd content-automation-system
npm init -y
```

### 2. Install Dependencies
```bash
npm install [all dependencies listed above]
```

### 3. Copy Configuration Files
- Copy site configuration templates
- Set up environment variables
- Configure AI prompts

### 4. Set Up Development Environment
```bash
npm run setup
npm run dev
```

### 5. Test with Sample Site
```bash
npm run test:integration
```

## 📊 Migration Strategy

### Phase 1: Core System (Week 1-2)
- Build CLI framework
- Implement content generators
- Set up preview system

### Phase 2: Integration (Week 3-4)
- Connect with existing BrightGift project
- Test with real content
- Optimize for production

### Phase 3: Multi-Site (Week 5-6)
- Create site templates
- Build configuration system
- Test with multiple sites

### Phase 4: Advanced Features (Week 7-8)
- Social media automation
- Analytics integration
- Advanced AI features

## 🎯 Success Metrics

- **Content Generation Speed**: < 5 minutes per blog post
- **Image Processing**: < 2 minutes per image set
- **Social Post Creation**: < 1 minute per platform
- **Preview Generation**: < 30 seconds
- **Error Rate**: < 1% for automated processes
- **User Approval Rate**: > 90% for generated content

## 🔄 Continuous Improvement

- **A/B Testing**: Test different content types and formats
- **Performance Monitoring**: Track generation times and success rates
- **User Feedback**: Collect feedback on generated content quality
- **AI Model Updates**: Stay current with latest AI models and capabilities
- **Platform Updates**: Monitor social media API changes

---

**Next Steps:**
1. Create the new project directory
2. Set up the basic project structure
3. Install core dependencies
4. Begin with CLI framework development
5. Test with BrightGift as the first integration 