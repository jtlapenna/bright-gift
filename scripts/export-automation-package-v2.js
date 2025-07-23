#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const EXPORT_DIR = 'content-automation-export-v2';
const CURRENT_DIR = process.cwd();

// Comprehensive list of files and directories to export
const EXPORT_ITEMS = [
  // Core Documentation (CRITICAL)
  '_workflow-documents/blogbot-instructions.md',
  '_workflow-documents/planning/04.4_image_prompt_instructions.md',
  '_workflow-documents/planning/brightgift_prompting_guide.md',
  '_workflow-documents/planning/afrofiliate-blog-linking-guide.md',
  '_workflow-documents/planning/bookshop-blog-linking-guide.md',
  '_workflow-documents/planning/afrofiliate-integration-strategy.md',
  '_workflow-documents/planning/04.1_blog-system.md',
  '_workflow-documents/planning/04_SEO_Strategy_Canvas.md',
  '_workflow-documents/planning/11_automated-seo-keyword-discovery-plan.md',
  '_workflow-documents/planning/sample-afrofiliate-blog-post.md',
  
  // Planning Documents (Already included)
  '_workflow-documents/planning/04.2_blog_style_guide.md',
  '_workflow-documents/planning/04.3_SEO_Guide.md',
  '_workflow-documents/planning/afrofiliate-integration-strategy.md',
  '_workflow-documents/planning/non-gift-guide-content-ideas.md',
  '_workflow-documents/planning/14_content_automation_system_implementation_plan.md',
  '_workflow-documents/planning/15_content_automation_export_package.md',
  '_workflow-documents/planning/16_comprehensive_export_audit.md',
  
  // Additional Documentation
  '_workflow-documents/planning/13_enhancement_ideas.md',
  '_workflow-documents/planning/09_brightgift_content_automation_plan.md',
  '_workflow-documents/planning/07_AI_Agent_Implementation_Plan_v6.md',
  '_workflow-documents/planning/06_AI_Prompting_Framework_Canvas.md',
  '_workflow-documents/planning/05_Affiliate_Strategy_Canvas.md',
  '_workflow-documents/planning/03_Homepage_Tool_Layout_Canvas.md',
  '_workflow-documents/planning/02_Tech_Stack_Architecture_Canvas.md',
  '_workflow-documents/planning/01_Project_Overview_Canvas.md',
  '_workflow-documents/planning/00_brightgift-idea-agent-reference.md',
  
  // Core Code Files (CRITICAL)
  'src/utils/',
  'src/pages/api/',
  'src/pages/index.astro',
  'src/pages/blog/',
  'src/layouts/',
  'src/content/',
  'src/styles/',
  'src/assets/',
  'src/env.d.ts',
  
  // Configuration Files
  'astro.config.mjs',
  'tailwind.config.mjs',
  'tsconfig.json',
  'package.json',
  'package-lock.json',
  '.gitignore',
  '.nvmrc',
  
  // Utility Scripts
  'scripts/optimize-images.js',
  'scripts/optimize-large-images.js',
  'scripts/meta-tag-audit.js',
  'scripts/image-audit.js',
  'scripts/validate-yaml.js',
  'scripts/fix-meta-lengths.js',
  'scripts/fix-broken-internal-links.js',
  'scripts/add-internal-links-to-orphan-pages.js',
  'scripts/audit-internal-links.js',
  'scripts/check-remaining-issues.js',
  'scripts/fix-image-alt-text.js',
  'scripts/fix-malformed-urls.js',
  'scripts/add-missing-meta-content.js',
  'scripts/update-image-references.js',
  'scripts/export-phosphor-svgs.cjs',
  'scripts/trigger-n8n-idea-generation.js',
  
  // Content Examples
  'src/content/blog/',
  'public/images/blog/',
  '_workflow-documents/social-posts/',
  
  // Integration Files
  '_workflow-documents/BrightGift_SEO_Idea_Workflow.json',
  '_workflow-documents/simplified-blog-image-upload-workflow.json',
  '_workflow-documents/BrightGift_Blog_Processing_Workflow.json',
  '_workflow-documents/BrightGift_Social_Poster.json',
  '_workflow-documents/BrightGift_Blog_and_Image_Generator_Workflow.json',
  
  // Public Assets
  'public/_redirects',
  'public/favicon.svg',
  'public/bright-gift-logo.png',
  'public/hero-image.png',
  'public/homepage-banner.webp',
  'public/icons/',
  'public/placeholders/',
  
  // Additional Files
  'README.md',
  'internal-link-audit-report.json',
  'parse_social_content_enhanced.js',
  'fix-frontmatter.js',
  'test-server.js',
  'start.sh',
  'test-endpoint.js',
  'railway.toml',
  'monitor-deployment.js',
  'nixpacks.toml',
  'index.js'
];

// Files to create in export
const NEW_FILES = {
  'package.json': generatePackageJson(),
  'README.md': generateReadme(),
  '.env.example': generateEnvExample(),
  '.gitignore': generateGitignore(),
  'setup.js': generateSetupScript(),
  'GETTING_STARTED.md': generateGettingStartedGuide()
};

class ComprehensiveExportManager {
  constructor() {
    this.exportPath = path.join(CURRENT_DIR, EXPORT_DIR);
  }

  async run() {
    console.log('🚀 Starting Comprehensive Content Automation System Export...\n');
    
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
      
      console.log('\n✅ Comprehensive export completed successfully!');
      console.log(`📦 Export location: ${this.exportPath}`);
      console.log(`🗜️  Zip file: ${this.exportPath}.zip`);
      console.log('\n📋 Next steps:');
      console.log('1. Extract the zip file to your new project location');
      console.log('2. Read GETTING_STARTED.md for complete setup instructions');
      console.log('3. Run: npm install');
      console.log('4. Copy .env.example to .env and configure');
      console.log('5. Run: node setup.js');
      console.log('6. Start development: npm run dev');
      
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
      'docs/integration.md': generateIntegrationDocs(),
      'config/sites/bright-gift.json': generateBrightGiftConfig(),
      'config/sites/template.json': generateSiteTemplate(),
      'config/prompts/blog-ideas.md': generateBlogIdeasPrompt(),
      'config/prompts/blog-content.md': generateBlogContentPrompt(),
      'config/prompts/image-prompts.md': generateImagePromptsPrompt(),
      'config/prompts/social-posts.md': generateSocialPostsPrompt(),
      'config/templates/blog-types/gift-guide.md': generateGiftGuideTemplate(),
      'config/templates/blog-types/educational.md': generateEducationalTemplate(),
      'config/templates/blog-types/data-driven.md': generateDataDrivenTemplate()
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

// File generators (simplified versions)
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

1. Read \`GETTING_STARTED.md\` for complete setup instructions
2. Install dependencies: \`npm install\`
3. Copy \`.env.example\` to \`.env\` and configure
4. Run setup: \`npm run setup\`
5. Start development: \`npm run dev\`

## Documentation

- [Getting Started](GETTING_STARTED.md)
- [Setup Guide](docs/setup.md)
- [Usage Guide](docs/usage.md)
- [API Documentation](docs/api.md)
- [Integration Guide](docs/integration.md)

## Reference Files

All reference files from the original project are in the \`reference/\` directory.
`;
}

function generateGettingStartedGuide() {
  return `# Getting Started Guide

## 🚀 Complete Setup Instructions

### Step 1: Extract and Setup
\`\`\`bash
# Extract the export package
unzip content-automation-export-v2.zip
cd content-automation-export-v2

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
\`\`\`

### Step 2: Configure Environment
Edit \`.env\` file with your API keys:
\`\`\`bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview

# Site Configuration
SITE_NAME=your_site_name
SITE_DOMAIN=your_domain.com

# Social Media APIs (optional)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
PINTEREST_ACCESS_TOKEN=your_pinterest_token
FACEBOOK_ACCESS_TOKEN=your_facebook_token
BLUESKY_IDENTIFIER=your_bluesky_identifier
BLUESKY_PASSWORD=your_bluesky_password
\`\`\`

### Step 3: Configure Your Site
Edit \`config/sites/my-site.json\`:
\`\`\`json
{
  "name": "your-site-name",
  "domain": "your-domain.com",
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
  }
}
\`\`\`

### Step 4: Run Setup
\`\`\`bash
# Run the setup script
node setup.js

# Start development
npm run dev
\`\`\`

### Step 5: Test Integration
\`\`\`bash
# Test with your existing site
npm run test:integration

# Generate a sample blog post
npm start generate blog
\`\`\`

## 📚 Key Reference Files

### For AI Content Generation:
1. \`reference/_workflow-documents/blogbot-instructions.md\` - How to write blog posts
2. \`reference/_workflow-documents/planning/04.4_image_prompt_instructions.md\` - How to generate images
3. \`reference/src/utils/promptBuilder.js\` - AI prompt logic
4. \`reference/src/pages/api/generate.ts\` - Main generation API

### For Affiliate Integration:
1. \`reference/_workflow-documents/planning/afrofiliate-blog-linking-guide.md\` - Afrofiliate setup
2. \`reference/_workflow-documents/planning/bookshop-blog-linking-guide.md\` - Bookshop.org setup
3. \`reference/_workflow-documents/planning/afrofiliate-integration-strategy.md\` - Complete strategy

### For Content Strategy:
1. \`reference/_workflow-documents/planning/04.2_blog_style_guide.md\` - Content guidelines
2. \`reference/_workflow-documents/planning/04.3_SEO_Guide.md\` - SEO guidelines
3. \`reference/_workflow-documents/planning/non-gift-guide-content-ideas.md\` - Content ideas

### For Technical Implementation:
1. \`reference/astro.config.mjs\` - Astro configuration
2. \`reference/src/pages/index.astro\` - Main frontend
3. \`reference/src/pages/blog/[...slug].astro\` - Blog template
4. \`reference/package.json\` - Dependencies and scripts

## 🔄 Next Steps

1. **Review Reference Files** - Study the existing implementation
2. **Configure Your Site** - Set up your specific configuration
3. **Test with Real Content** - Generate content for your site
4. **Customize Prompts** - Adapt AI prompts for your brand
5. **Integrate Social Media** - Set up social posting automation
6. **Monitor Performance** - Track content and affiliate performance

## 🆘 Need Help?

- Check the \`docs/\` directory for detailed documentation
- Review the \`reference/\` directory for working examples
- Study the configuration files in \`config/\`
- Test with the provided sample content
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

// Simplified documentation generators
function generateSetupDocs() { return '# Setup Guide\n\nSee GETTING_STARTED.md for complete setup instructions.'; }
function generateUsageDocs() { return '# Usage Guide\n\nSee reference files for usage examples.'; }
function generateApiDocs() { return '# API Documentation\n\nSee reference/src/pages/api/ for API examples.'; }
function generateIntegrationDocs() { return '# Integration Guide\n\nSee reference files for integration examples.'; }
function generateBrightGiftConfig() { return JSON.stringify({ "name": "bright-gift", "domain": "bright-gift.com" }, null, 2); }
function generateSiteTemplate() { return JSON.stringify({ "name": "site-name", "domain": "example.com" }, null, 2); }
function generateBlogIdeasPrompt() { return '# Blog Ideas Prompt\n\nSee reference files for prompt examples.'; }
function generateBlogContentPrompt() { return '# Blog Content Prompt\n\nSee reference files for prompt examples.'; }
function generateImagePromptsPrompt() { return '# Image Prompts Prompt\n\nSee reference files for prompt examples.'; }
function generateSocialPostsPrompt() { return '# Social Posts Prompt\n\nSee reference files for prompt examples.'; }
function generateGiftGuideTemplate() { return '# Gift Guide Template\n\nSee reference files for template examples.'; }
function generateEducationalTemplate() { return '# Educational Template\n\nSee reference files for template examples.'; }
function generateDataDrivenTemplate() { return '# Data Driven Template\n\nSee reference files for template examples.'; }

// Run the export
if (require.main === module) {
  const exporter = new ComprehensiveExportManager();
  exporter.run();
}

module.exports = ComprehensiveExportManager; 