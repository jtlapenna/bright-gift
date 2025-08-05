#!/usr/bin/env node

/**
 * Blog Post Auto-Fixer
 * Automatically corrects common issues in blog posts
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class BlogFixer {
  constructor() {
    this.fixesApplied = [];
  }

  async fixAllPosts() {
    console.log('🔧 Starting automatic blog fixes...\n');
    
    const blogFiles = this.getBlogFiles();
    
    for (const file of blogFiles) {
      console.log(`📝 Fixing: ${path.basename(file)}`);
      await this.fixPost(file);
    }
    
    this.printResults();
  }

  getBlogFiles() {
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    return fs.readdirSync(blogDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(blogDir, file));
  }

  async fixPost(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdown } = matter(content);
    
    let fixedContent = markdown;
    let fixedFrontmatter = { ...frontmatter };
    
    // Apply fixes
    fixedContent = this.fixAffiliateDisclosure(fixedContent);
    fixedContent = this.fixFormatting(fixedContent);
    fixedContent = this.fixInternalLinks(fixedContent);
    fixedFrontmatter = this.fixFrontmatter(fixedFrontmatter, markdown);
    
    // Write back if changes were made
    if (fixedContent !== markdown || JSON.stringify(fixedFrontmatter) !== JSON.stringify(frontmatter)) {
      const newContent = matter.stringify(fixedContent, fixedFrontmatter);
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
    } else {
      console.log(`✅ No fixes needed: ${path.basename(filePath)}`);
    }
  }

  fixAffiliateDisclosure(content) {
    // Remove any hardcoded affiliate disclaimers from content
    // since they're now handled by the template
    let fixed = content;
    
    const disclosurePatterns = [
      /\*As an Amazon Associate.*\*/g,
      /\*This post contains affiliate links.*\*/g,
      /This post contains affiliate links\. We may earn a commission if you click through and make a purchase, at no additional cost to you\./g
    ];
    
    let removed = false;
    disclosurePatterns.forEach(pattern => {
      if (pattern.test(fixed)) {
        fixed = fixed.replace(pattern, '');
        removed = true;
      }
    });
    
    if (removed) {
      this.fixesApplied.push('Removed hardcoded affiliate disclosure (now handled by template)');
    }
    
    return fixed;
  }

  fixFormatting(content) {
    let fixed = content;
    
    // Fix "Why it's great" formatting
    fixed = fixed.replace(/\*Why it's great:\*/g, '**Why it\'s great:**');
    
    // Fix affiliate link formatting
    fixed = fixed.replace(
      /<a href="([^"]+)" class="amazon-link"([^>]*)>/g,
      '<a href="$1" class="amazon-link" target="_blank" rel="noopener"$2>'
    );
    
    // Fix markdown link formatting
    fixed = fixed.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (match, text, url) => {
        if (url.includes('amazon.com') || url.includes('bookshop.org') || url.includes('arjdj2msd.com')) {
          return `[${text}](${url})`;
        }
        return match;
      }
    );
    
    if (fixed !== content) {
      this.fixesApplied.push('Fixed formatting issues');
    }
    
    return fixed;
  }

  fixInternalLinks(content) {
    // This would implement automatic internal link suggestions
    // For now, just return the content unchanged
    return content;
  }

  fixFrontmatter(frontmatter, content) {
    const fixed = { ...frontmatter };
    
    // Auto-calculate read time if missing or inaccurate
    if (!fixed.readTime || this.isReadTimeInaccurate(fixed.readTime, content)) {
      const wordCount = this.calculateWordCount(content);
      fixed.readTime = Math.ceil(wordCount / 200);
      this.fixesApplied.push('Updated read time calculation');
    }
    
    // Auto-generate meta description if missing
    if (!fixed.metaDescription) {
      fixed.metaDescription = this.generateMetaDescription(content);
      this.fixesApplied.push('Generated missing meta description');
    }
    
    // Auto-generate meta title if missing
    if (!fixed.metaTitle) {
      fixed.metaTitle = this.generateMetaTitle(fixed.title);
      this.fixesApplied.push('Generated missing meta title');
    }
    
    // Ensure required fields
    if (!fixed.draft) fixed.draft = false;
    if (!fixed.status) fixed.status = 'published';
    if (!fixed.featured) fixed.featured = false;
    
    return fixed;
  }

  findAffiliateLinks(content) {
    const affiliatePatterns = [
      /amazon\.com.*tag=/i,
      /bookshop\.org.*affiliate=/i,
      /arjdj2msd\.com.*7LKLK3/i
    ];
    
    return affiliatePatterns.filter(pattern => pattern.test(content));
  }

  calculateWordCount(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  isReadTimeInaccurate(readTime, content) {
    const wordCount = this.calculateWordCount(content);
    const expectedReadTime = Math.ceil(wordCount / 200);
    return Math.abs(readTime - expectedReadTime) > 2;
  }

  generateMetaDescription(content) {
    // Extract first paragraph and limit to 160 characters
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    if (paragraphs.length > 0) {
      let description = paragraphs[0].replace(/[#*`]/g, '').trim();
      if (description.length > 160) {
        description = description.substring(0, 157) + '...';
      }
      return description;
    }
    return 'Discover thoughtful gift ideas and recommendations for every occasion.';
  }

  generateMetaTitle(title) {
    if (!title) return 'Gift Ideas and Recommendations';
    
    // Limit to 60 characters
    if (title.length > 60) {
      return title.substring(0, 57) + '...';
    }
    return title;
  }

  printResults() {
    console.log('\n🎯 Auto-fix complete!');
    if (this.fixesApplied.length > 0) {
      console.log('Applied fixes:');
      this.fixesApplied.forEach(fix => console.log(`  • ${fix}`));
    } else {
      console.log('No fixes were needed.');
    }
  }
}

// CLI interface
if (require.main === module) {
  const fixer = new BlogFixer();
  fixer.fixAllPosts();
}

module.exports = BlogFixer; 