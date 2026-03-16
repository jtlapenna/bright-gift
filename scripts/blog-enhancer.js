#!/usr/bin/env node

/**
 * Blog Post Enhancer
 * Adds advanced features and optimizations to blog posts
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class BlogEnhancer {
  constructor() {
    this.enhancementsApplied = [];
  }

  async enhanceAllPosts() {
    console.log('🚀 Starting blog enhancements...\n');
    
    const blogFiles = this.getBlogFiles();
    
    for (const file of blogFiles) {
      console.log(`📝 Enhancing: ${path.basename(file)}`);
      await this.enhancePost(file);
    }
    
    this.printResults();
  }

  getBlogFiles() {
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    return fs.readdirSync(blogDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(blogDir, file));
  }

  async enhancePost(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdown } = matter(content);
    
    let enhancedContent = markdown;
    let enhancedFrontmatter = { ...frontmatter };
    
    // Apply enhancements
    enhancedContent = this.addSmartCTAs(enhancedContent, frontmatter);
    enhancedContent = this.addInternalLinkSuggestions(enhancedContent, frontmatter);
    enhancedContent = this.addSchemaMarkup(enhancedContent, frontmatter);
    enhancedContent = this.addSocialMediaOptimization(enhancedContent, frontmatter);
    enhancedFrontmatter = this.enhanceFrontmatter(enhancedFrontmatter, markdown);
    
    // Write back if changes were made
    if (enhancedContent !== markdown || JSON.stringify(enhancedFrontmatter) !== JSON.stringify(frontmatter)) {
      const newContent = matter.stringify(enhancedContent, enhancedFrontmatter);
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Enhanced: ${path.basename(filePath)}`);
    } else {
      console.log(`✅ No enhancements needed: ${path.basename(filePath)}`);
    }
  }

  addSmartCTAs(content, frontmatter) {
    let enhanced = content;
    
    // Add Gift Idea Generator CTA if not present
    if (!content.includes('Gift Idea Generator') && !content.includes('bright-gift.com')) {
      const ctaBlock = `
> 🎯 **Not sure what to buy?** Our [Gift Idea Generator](https://bright-gift.com) can help you find the perfect gift based on their interests, budget, and occasion!

`;
      
      // Insert after introduction
      const lines = enhanced.split('\n');
      const introEndIndex = this.findIntroEndIndex(lines);
      lines.splice(introEndIndex + 1, 0, ctaBlock);
      enhanced = lines.join('\n');
      this.enhancementsApplied.push('Added Gift Idea Generator CTA');
    }
    
    // Add related posts CTA if not present
    if (!content.includes('More Gift Inspiration') && !content.includes('Related Posts')) {
      const relatedPostsCTA = `
## More Gift Inspiration

Looking for other gift ideas? Check out our guides to:

* [Gifts for Plant Lovers](/blog/gifts-for-plant-lovers/) for nature-inspired presents
* [Top Gifts for Yoga Enthusiasts](/blog/top-gifts-for-yoga-enthusiasts-beginners-to-advanced-practitioners/) for wellness-focused gifts
* [Gifts for Gamers Under $50](/blog/gifts-for-gamers-under-50/) for tech-savvy recipients
* [Eco-Friendly Gifts for Outdoor Lovers](/blog/eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature/) for sustainable options

`;
      
      // Insert before conclusion
      const lines = enhanced.split('\n');
      const conclusionIndex = lines.findIndex(line => line.includes('## Conclusion'));
      if (conclusionIndex !== -1) {
        lines.splice(conclusionIndex, 0, relatedPostsCTA);
        enhanced = lines.join('\n');
        this.enhancementsApplied.push('Added related posts section');
      }
    }
    
    return enhanced;
  }

  addInternalLinkSuggestions(content, frontmatter) {
    // This would analyze content and suggest relevant internal links
    // For now, return content unchanged
    return content;
  }

  addSchemaMarkup(content, frontmatter) {
    // Add structured data for better SEO
    if (!frontmatter.schema) {
      const schema = this.generateSchemaMarkup(frontmatter);
      if (schema) {
        // Add schema to frontmatter
        frontmatter.schema = schema;
        this.enhancementsApplied.push('Added schema markup');
      }
    }
    
    return content;
  }

  addSocialMediaOptimization(content, frontmatter) {
    // Add social media optimization if missing
    if (!frontmatter.socialPosts) {
      frontmatter.socialPosts = this.generateSocialPosts(frontmatter);
      this.enhancementsApplied.push('Added social media optimization');
    }
    
    return content;
  }

  enhanceFrontmatter(frontmatter, content) {
    const enhanced = { ...frontmatter };
    
    // Add missing SEO fields
    if (!enhanced.keywords && enhanced.title) {
      enhanced.keywords = this.generateKeywords(enhanced.title, content);
      this.enhancementsApplied.push('Generated keywords');
    }
    
    // Add missing tags
    if (!enhanced.tags || enhanced.tags.length === 0) {
      enhanced.tags = this.generateTags(enhanced.title, content);
      this.enhancementsApplied.push('Generated tags');
    }
    
    // Add category if missing
    if (!enhanced.category) {
      enhanced.category = this.determineCategory(enhanced.title, content);
      this.enhancementsApplied.push('Added category');
    }
    
    return enhanced;
  }

  findIntroEndIndex(lines) {
    // Find the end of the introduction (after first paragraph)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('## ') && i > 5) {
        return i - 1;
      }
    }
    return 5; // Default to after 5 lines
  }

  generateSchemaMarkup(frontmatter) {
    // Generate JSON-LD schema for blog post
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": frontmatter.title,
      "description": frontmatter.metaDescription,
      "author": {
        "@type": "Organization",
        "name": "BrightGift"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BrightGift",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bright-gift.com/bright-gift-logo.png"
        }
      },
      "datePublished": frontmatter.date,
      "image": frontmatter.image ? `https://bright-gift.com${frontmatter.image}` : undefined,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://bright-gift.com/blog/${frontmatter.slug}/`
      }
    };
  }

  generateSocialPosts(frontmatter) {
    const title = frontmatter.title;
    const description = frontmatter.metaDescription;
    
    return {
      instagram: {
        caption: `🎁 ${title}\n\n${description}\n\n#giftideas #gifts #brightgift`,
        hashtags: "giftideas,gifts,brightgift"
      },
      twitter: {
        text: `${title}\n\n${description}\n\n#giftideas #gifts #brightgift`,
        hashtags: "giftideas,gifts,brightgift"
      },
      facebook: {
        text: `${title}\n\n${description}\n\nWhat do you think of these gift ideas? Share your thoughts below! 👇`,
        hashtags: "giftideas,gifts,brightgift"
      },
      linkedin: {
        text: `${title}\n\n${description}\n\nLooking for thoughtful gift ideas? Check out this comprehensive guide for inspiration.`,
        hashtags: "giftideas,gifts,brightgift,giftguide"
      }
    };
  }

  generateKeywords(title, content) {
    // Extract keywords from title and content
    const words = (title + ' ' + content).toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const wordFreq = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    // Get top keywords
    const keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
      .join(', ');
    
    return keywords;
  }

  generateTags(title, content) {
    const tags = [];
    
    // Add category-based tags
    if (title.toLowerCase().includes('gift') || content.toLowerCase().includes('gift')) {
      tags.push('gift-guides');
    }
    
    if (title.toLowerCase().includes('budget') || content.toLowerCase().includes('under')) {
      tags.push('budget-gifts');
    }
    
    if (title.toLowerCase().includes('eco') || content.toLowerCase().includes('sustainable')) {
      tags.push('eco-friendly');
    }
    
    if (title.toLowerCase().includes('luxury') || content.toLowerCase().includes('premium')) {
      tags.push('luxury-gifts');
    }
    
    // Add recipient-based tags
    const recipients = ['mom', 'dad', 'kids', 'teens', 'couples', 'coworkers', 'friends'];
    recipients.forEach(recipient => {
      if (title.toLowerCase().includes(recipient) || content.toLowerCase().includes(recipient)) {
        tags.push(`${recipient}-gifts`);
      }
    });
    
    return tags;
  }

  determineCategory(title, content) {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('gift') || text.includes('present')) {
      return 'gift-guides';
    }
    
    if (text.includes('how') || text.includes('guide')) {
      return 'how-to';
    }
    
    if (text.includes('statistics') || text.includes('data')) {
      return 'data-driven';
    }
    
    return 'gift-guides'; // Default
  }

  printResults() {
    console.log('\n🎯 Enhancement complete!');
    if (this.enhancementsApplied.length > 0) {
      console.log('Applied enhancements:');
      this.enhancementsApplied.forEach(enhancement => console.log(`  • ${enhancement}`));
    } else {
      console.log('No enhancements were needed.');
    }
  }
}

// CLI interface
if (require.main === module) {
  const enhancer = new BlogEnhancer();
  enhancer.enhanceAllPosts();
}

module.exports = BlogEnhancer; 
