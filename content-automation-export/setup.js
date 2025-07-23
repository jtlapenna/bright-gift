#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Content Automation System...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from .env.example...');
  fs.copyFileSync('.env.example', '.env');
  console.log('⚠️  Please edit .env file with your configuration\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
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

console.log('✅ Initial configuration created\n');

console.log('🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file with your API keys');
console.log('2. Configure your site in config/sites/my-site.json');
console.log('3. Run: npm run dev');
console.log('4. Check reference/ directory for examples');
