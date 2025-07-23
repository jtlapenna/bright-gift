#!/usr/bin/env node

/**
 * BrightGift Blog Automation Script
 * 
 * This script replicates the n8n automation workflow for creating complete blog posts:
 * 1. Generate blog idea from content strategy
 * 2. Create blog content with SEO optimization
 * 3. Generate image prompts
 * 4. Create social media posts
 * 5. Set up file structure and commit changes
 * 
 * Usage: node scripts/create-blog-automation.js [--topic "specific topic"] [--type "gift-guide|educational|data-driven"]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const CONFIG = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  contentDir: 'src/content/blog',
  imagesDir: 'public/images/blog',
  socialPostsDir: '_workflow-documents/social-posts',
  contentIdeasFile: '_workflow-documents/planning/non-gift-guide-content-ideas.md',
  blogStyleGuide: '_workflow-documents/planning/04.2_blog_style_guide.md',
  seoGuide: '_workflow-documents/planning/04.3_SEO_Guide.md'
};

// Blog content templates
const BLOG_TEMPLATES = {
  'gift-guide': {
    structure: [
      'Introduction with problem statement',
      'Why this audience makes great gift recipients',
      'Gift categories by budget',
      'Tips for choosing perfect gifts',
      'Budget-friendly combinations',
      'Conclusion with AI generator CTA'
    ],
    keywords: ['gifts for', 'gift guide', 'gift ideas', 'perfect gifts'],
    tags: ['gift guide', 'gifts', 'gift ideas', 'budget gifts']
  },
  'educational': {
    structure: [
      'Introduction with hook and problem',
      'Main concept explanation',
      'Step-by-step process or framework',
      'Practical examples and tips',
      'Common mistakes to avoid',
      'Conclusion with actionable takeaways'
    ],
    keywords: ['how to', 'guide', 'tips', 'strategies'],
    tags: ['how to', 'guide', 'tips', 'educational']
  },
  'data-driven': {
    structure: [
      'Introduction with data hook',
      'Key statistics and findings',
      'Analysis and insights',
      'Practical applications',
      'Trends and predictions',
      'Conclusion with implications'
    ],
    keywords: ['statistics', 'data', 'trends', 'analysis'],
    tags: ['data', 'statistics', 'trends', 'analysis']
  }
};

class BlogAutomation {
  constructor() {
    this.currentBlog = null;
    this.blogSlug = null;
    this.blogType = 'educational';
    this.topic = null;
  }

  async init() {
    console.log('🎁 BrightGift Blog Automation Starting...\n');
    
    // Parse command line arguments
    this.parseArguments();
    
    // Validate environment
    this.validateEnvironment();
    
    // Load configuration files
    await this.loadConfiguration();
  }

  parseArguments() {
    const args = process.argv.slice(2);
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--topic' && args[i + 1]) {
        this.topic = args[i + 1];
        i++;
      } else if (args[i] === '--type' && args[i + 1]) {
        this.blogType = args[i + 1];
        i++;
      }
    }
  }

  validateEnvironment() {
    if (!CONFIG.openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    // Check if required directories exist
    const requiredDirs = [CONFIG.contentDir, CONFIG.imagesDir, CONFIG.socialPostsDir];
    requiredDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        throw new Error(`Required directory does not exist: ${dir}`);
      }
    });
  }

  async loadConfiguration() {
    console.log('📋 Loading configuration files...');
    
    // Load content ideas
    this.contentIdeas = fs.readFileSync(CONFIG.contentIdeasFile, 'utf8');
    
    // Load style guides
    this.blogStyleGuide = fs.readFileSync(CONFIG.blogStyleGuide, 'utf8');
    this.seoGuide = fs.readFileSync(CONFIG.seoGuide, 'utf8');
    
    console.log('✅ Configuration loaded successfully\n');
  }

  async generateBlogIdea() {
    console.log('💡 Generating blog idea...');
    
    if (this.topic) {
      this.currentBlog = {
        title: this.topic,
        type: this.blogType,
        priority: 'high'
      };
    } else {
      // Extract next priority blog from content ideas
      const priorityMatch = this.contentIdeas.match(/### \*\*Phase \d+:.*?\n(\d+\. \*\*"([^"]+)"\*\*)/s);
      
      if (priorityMatch) {
        this.currentBlog = {
          title: priorityMatch[2],
          type: this.blogType,
          priority: 'high'
        };
      } else {
        throw new Error('No priority blog ideas found in content ideas file');
      }
    }
    
    this.blogSlug = this.generateSlug(this.currentBlog.title);
    console.log(`✅ Blog idea selected: "${this.currentBlog.title}"\n`);
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async generateBlogContent() {
    console.log('✍️ Generating blog content...');
    
    const prompt = this.buildBlogPrompt();
    const content = await this.callOpenAI(prompt);
    
    // Parse the response and extract frontmatter and content
    const { frontmatter, content: blogContent } = this.parseBlogResponse(content);
    
    // Create the blog file
    const blogPath = path.join(CONFIG.contentDir, `${this.blogSlug}.md`);
    const fullBlogContent = `---\n${frontmatter}\n---\n\n${blogContent}`;
    
    fs.writeFileSync(blogPath, fullBlogContent);
    console.log(`✅ Blog content created: ${blogPath}\n`);
  }

  buildBlogPrompt() {
    const template = BLOG_TEMPLATES[this.blogType];
    
    return `You are an expert content writer for BrightGift, a gift recommendation website. Create a comprehensive blog post following these exact specifications:

BLOG TITLE: "${this.currentBlog.title}"

BLOG TYPE: ${this.blogType}

CONTENT REQUIREMENTS:
- Word count: 2,000-3,000 words
- Reading level: 7th-8th grade
- Tone: Friendly, helpful, expert but approachable
- Structure: ${template.structure.join(', ')}

SEO REQUIREMENTS:
- Primary keyword: "${template.keywords[0]}"
- Secondary keywords: ${template.keywords.slice(1).join(', ')}
- Meta title: 50-60 characters, include primary keyword
- Meta description: 140-160 characters, include keyword and CTA
- Tags: ${template.tags.join(', ')}

STYLE GUIDE REQUIREMENTS:
- Use second person ("you") throughout
- Include contractions for conversational tone
- Use active voice
- Include one CTA to the AI Gift Idea Generator in conclusion
- No duplicate CTAs throughout the post
- Include internal linking opportunities

FRONTMATTER FORMAT:
---
title: "Exact blog title"
metaTitle: "SEO-optimized title (50-60 chars)"
metaDescription: "SEO description with keyword and CTA (140-160 chars)"
description: "Internal description for blog previews"
date: "${new Date().toISOString().split('T')[0]}"
image: "/images/blog/${this.blogSlug}/${this.blogSlug}-banner.webp"
ogImage: "/images/blog/${this.blogSlug}/${this.blogSlug}-banner.webp"
tags: [${template.tags.map(tag => `"${tag}"`).join(', ')}]
keywords: [${template.keywords.map(keyword => `"${keyword}"`).join(', ')}]
readTime: [calculate based on word count]
featured: true
draft: false
---

RESPONSE FORMAT:
Return ONLY the frontmatter and content in this exact format:

---FRONTMATTER---
[YAML frontmatter here]
---CONTENT---
[Blog content here]

Do not include any other text, explanations, or formatting outside of the frontmatter and content sections.`;
  }

  parseBlogResponse(response) {
    const frontmatterMatch = response.match(/---FRONTMATTER---\n([\s\S]*?)\n---CONTENT---/);
    const contentMatch = response.match(/---CONTENT---\n([\s\S]*?)$/);
    
    if (!frontmatterMatch || !contentMatch) {
      throw new Error('Invalid blog response format');
    }
    
    return {
      frontmatter: frontmatterMatch[1].trim(),
      content: contentMatch[1].trim()
    };
  }

  async generateImagePrompts() {
    console.log('🎨 Generating image prompts...');
    
    const prompt = `You are an AI art director for BrightGift, a modern gift recommendation brand. Write stylized image prompts for use with the GPT-4 API image model gpt-image-1, based on this blog title: "${this.currentBlog.title}"

You must follow BrightGift's distinct image style and formatting guidelines.

IMAGE TYPES:
• "banner" → Blog banner (wide horizontal layout, no visible text or logos). 16:9 ratio, 1200px wide.
• "social" → Social media image (square format, CAN include title text). 1:1 ratio, 1200x1200.

BRIGHTGIFT IMAGE STYLE (Required in Every Prompt):
Modern flat illustration with soft 3D-style characters and objects, combined with subtle 2D decorative elements. Use warm, vibrant pastels (teal #00A99D, coral-orange #FF6B35, sunshine yellow #FFD700). Layout must be clean and giftable, using rounded forms, balanced negative space, and minimal visual clutter. The tone should feel cheerful, light, editorial, and creative — never realistic or photorealistic. Use text only in social images. Background colors can vary within our color palette.

OUTPUT FORMAT:
Return JSON in this exact format:
{
  "slug": "${this.blogSlug}",
  "prompts": [
    {
      "label": "banner",
      "text": "[FULL STYLED PROMPT HERE]"
    },
    {
      "label": "social", 
      "text": "[FULL STYLED PROMPT HERE]"
    }
  ]
}`;

    const response = await this.callOpenAI(prompt);
    const imagePrompts = JSON.parse(response);
    
    // Create images directory
    const imagesDir = path.join(CONFIG.imagesDir, this.blogSlug);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Save image prompts
    const promptsPath = path.join(imagesDir, `${this.blogSlug}-image-prompts.json`);
    fs.writeFileSync(promptsPath, JSON.stringify(imagePrompts, null, 2));
    
    // Create sample image names file
    const sampleNamesPath = path.join(imagesDir, 'sample-image-names.md');
    const sampleNamesContent = this.generateSampleImageNames();
    fs.writeFileSync(sampleNamesPath, sampleNamesContent);
    
    console.log(`✅ Image prompts created: ${promptsPath}\n`);
  }

  generateSampleImageNames() {
    return `# Sample Image Names for "${this.currentBlog.title}"

## Required Images

### Banner Image (16:9 ratio, 1200×630px)
- **Filename:** \`${this.blogSlug}-banner.webp\`
- **Location:** \`/public/images/blog/${this.blogSlug}/\`
- **Purpose:** Main blog banner image
- **Status:** ⏳ Pending generation

### Social Image (1:1 ratio, 1200×1200px)
- **Filename:** \`${this.blogSlug}-social.webp\`
- **Location:** \`/public/images/blog/${this.blogSlug}/\`
- **Purpose:** Instagram, Pinterest, and other social media sharing
- **Status:** ⏳ Pending generation

## Image Style Guidelines
- **BrightGift Style:** Modern flat illustration with soft 3D-style characters and objects
- **Color Palette:** Teal (#00A99D), coral-orange (#FF6B35), sunshine yellow (#FFD700)
- **Tone:** Cheerful, light, editorial, and creative
- **No Text:** Banner images should not include text
- **Text Allowed:** Social image can include the title

## Image Prompts
See \`${this.blogSlug}-image-prompts.json\` for detailed prompts following the BrightGift style guide.`;
  }

  async generateSocialPosts() {
    console.log('📱 Generating social media posts...');
    
    const prompt = `Create social media posts for this blog post:

TITLE: "${this.currentBlog.title}"
URL: https://bright-gift.com/blog/${this.blogSlug}/
TYPE: ${this.blogType}

Create posts for:
1. Twitter (3 posts, 280 chars max each)
2. Instagram (3 posts, engaging with questions)
3. Pinterest (3 posts, optimized for saving)
4. Facebook (3 posts, community-focused)

Each platform should have different angles:
- Twitter: Focus on tips and quick insights
- Instagram: Focus on engagement and questions
- Pinterest: Focus on saving and comprehensive value
- Facebook: Focus on community discussion

Include relevant hashtags for each platform. Use the BrightGift brand voice: friendly, helpful, expert but approachable.

Format the response as a markdown file with clear sections for each platform.`;

    const response = await this.callOpenAI(prompt);
    
    // Create social posts file
    const socialPostsPath = path.join(CONFIG.socialPostsDir, `${this.blogSlug}.md`);
    const socialPostsContent = this.formatSocialPosts(response);
    fs.writeFileSync(socialPostsPath, socialPostsContent);
    
    console.log(`✅ Social posts created: ${socialPostsPath}\n`);
  }

  formatSocialPosts(content) {
    return `# ${this.currentBlog.title} - Social Media Posts

**Blog URL:** https://bright-gift.com/blog/${this.blogSlug}/  
**Image Path:** \`public/images/blog/${this.blogSlug}/\`

---

${content}`;
  }

  async commitChanges() {
    console.log('💾 Committing changes...');
    
    try {
      // Add all new files
      execSync('git add .', { stdio: 'inherit' });
      
      // Commit with descriptive message
      const commitMessage = `feat(blog): create ${this.blogType} blog "${this.currentBlog.title}"

- Generate comprehensive blog content with SEO optimization
- Create image prompts following BrightGift style guide
- Generate social media posts for all platforms
- Set up proper file structure and documentation
- Ready for image generation and publishing`;
      
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      
      console.log('✅ Changes committed successfully\n');
    } catch (error) {
      console.log('⚠️ Commit failed, but files are saved locally\n');
    }
  }

  async callOpenAI(prompt) {
    // This is a placeholder for the actual OpenAI API call
    // In a real implementation, you would use the OpenAI SDK
    console.log('🤖 Calling OpenAI API...');
    
    // For now, return a mock response
    return `Mock response for: ${prompt.substring(0, 100)}...`;
  }

  async run() {
    try {
      await this.init();
      await this.generateBlogIdea();
      await this.generateBlogContent();
      await this.generateImagePrompts();
      await this.generateSocialPosts();
      await this.commitChanges();
      
      console.log('🎉 Blog automation completed successfully!');
      console.log(`📝 Blog: ${CONFIG.contentDir}/${this.blogSlug}.md`);
      console.log(`🎨 Images: ${CONFIG.imagesDir}/${this.blogSlug}/`);
      console.log(`📱 Social: ${CONFIG.socialPostsDir}/${this.blogSlug}.md`);
      console.log('\nNext steps:');
      console.log('1. Generate images using the prompts');
      console.log('2. Review and edit the blog content');
      console.log('3. Publish when ready');
      
    } catch (error) {
      console.error('❌ Blog automation failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the automation
if (require.main === module) {
  const automation = new BlogAutomation();
  automation.run();
}

module.exports = BlogAutomation; 