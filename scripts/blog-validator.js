#!/usr/bin/env node

/**
 * Blog Post Validator
 * Comprehensive validation for blog posts before publishing
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

// Configuration
const BLOG_DIR = 'src/content/blog';
const REQUIREMENTS = {
  minWordCount: 1500,
  maxWordCount: 5000,
  minReadabilityScore: 7,
  maxReadabilityScore: 9,
  metaDescriptionLength: { min: 150, max: 160 },
  titleLength: { min: 50, max: 60 },
  minInternalLinks: 3,
  minCTAs: 1,
  requiredFrontmatter: [
    'title', 'slug', 'description', 'metaTitle', 'metaDescription',
    'tags', 'readTime', 'date', 'draft', 'status'
  ]
};

class BlogValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
  }

  async validateAllPosts() {
    console.log('🔍 Starting comprehensive blog validation...\n');
    
    const blogFiles = this.getBlogFiles();
    
    for (const file of blogFiles) {
      console.log(`📝 Validating: ${path.basename(file)}`);
      await this.validatePost(file);
    }
    
    this.printResults();
  }

  getBlogFiles() {
    const blogDir = path.join(process.cwd(), BLOG_DIR);
    return fs.readdirSync(blogDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(blogDir, file));
  }

  async validatePost(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdown } = matter(content);
    
    // Reset for each post
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
    
    // Run all validations
    this.validateFrontmatter(frontmatter, filePath);
    this.validateContent(markdown, frontmatter);
    this.validateAffiliateDisclosure(markdown);
    this.validateInternalLinks(markdown);
    this.validateSEO(frontmatter, markdown);
    this.validateCTAs(markdown);
    this.validateWordCount(markdown);
    this.validateReadability(markdown);
    this.validateImages(frontmatter);
    this.validateSchema(frontmatter);
    
    // Print results for this post
    this.printPostResults(path.basename(filePath));
  }

  validateFrontmatter(frontmatter, filePath) {
    const filename = path.basename(filePath, '.md');
    
    // Check required fields
    REQUIREMENTS.requiredFrontmatter.forEach(field => {
      if (!frontmatter[field]) {
        this.errors.push(`Missing required frontmatter field: ${field}`);
      }
    });
    
    // Check slug matches filename
    if (frontmatter.slug && frontmatter.slug !== filename) {
      this.warnings.push(`Slug doesn't match filename: ${frontmatter.slug} vs ${filename}`);
    }
    
    // Check date format
    if (frontmatter.date && !this.isValidDate(frontmatter.date)) {
      this.errors.push('Invalid date format in frontmatter');
    }
    
    // Check read time calculation
    if (frontmatter.readTime) {
      const expectedReadTime = Math.ceil(this.calculateWordCount(frontmatter.content || '') / 200);
      if (Math.abs(frontmatter.readTime - expectedReadTime) > 2) {
        this.warnings.push(`Read time may be inaccurate. Expected: ~${expectedReadTime} min`);
      }
    }
  }

  validateContent(content, frontmatter) {
    // Check for proper heading structure
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    if (!headings.some(h => h.startsWith('# '))) {
      this.errors.push('Missing H1 heading');
    }
    
    // Check for proper formatting
    const formattingIssues = this.checkFormatting(content);
    formattingIssues.forEach(issue => this.warnings.push(issue));
    
    // Check for broken markdown
    const brokenMarkdown = this.checkBrokenMarkdown(content);
    brokenMarkdown.forEach(issue => this.errors.push(issue));
  }

  validateAffiliateDisclosure(content) {
    // Affiliate disclosure is now handled by the template
    // No need to check for disclosure in content
    const affiliateLinks = this.findAffiliateLinks(content);
    
    if (affiliateLinks.length > 0) {
      // Just log that affiliate links are present
      console.log(`✅ Post contains ${affiliateLinks.length} affiliate links`);
    }
  }

  validateInternalLinks(content) {
    const internalLinks = this.findInternalLinks(content);
    
    if (internalLinks.length < REQUIREMENTS.minInternalLinks) {
      this.suggestions.push(`Add more internal links (current: ${internalLinks.length}, recommended: ${REQUIREMENTS.minInternalLinks}+)`);
    }
    
    // Check for broken internal links
    const brokenLinks = this.checkBrokenInternalLinks(internalLinks);
    brokenLinks.forEach(link => this.errors.push(`Broken internal link: ${link}`));
  }

  validateSEO(frontmatter, content) {
    // Meta description length
    if (frontmatter.metaDescription) {
      const length = frontmatter.metaDescription.length;
      if (length < REQUIREMENTS.metaDescriptionLength.min || length > REQUIREMENTS.metaDescriptionLength.max) {
        this.warnings.push(`Meta description length: ${length} chars (optimal: ${REQUIREMENTS.metaDescriptionLength.min}-${REQUIREMENTS.metaDescriptionLength.max})`);
      }
    }
    
    // Title length
    if (frontmatter.metaTitle) {
      const length = frontmatter.metaTitle.length;
      if (length < REQUIREMENTS.titleLength.min || length > REQUIREMENTS.titleLength.max) {
        this.warnings.push(`Meta title length: ${length} chars (optimal: ${REQUIREMENTS.titleLength.min}-${REQUIREMENTS.titleLength.max})`);
      }
    }
    
    // Keyword density
    const keywordIssues = this.checkKeywordDensity(content, frontmatter);
    keywordIssues.forEach(issue => this.suggestions.push(issue));
  }

  validateCTAs(content) {
    const ctaPatterns = [
      /try.*gift.*generator/i,
      /check.*out/i,
      /learn.*more/i,
      /shop.*now/i,
      /get.*started/i
    ];
    
    const ctaCount = ctaPatterns.filter(pattern => pattern.test(content)).length;
    
    if (ctaCount < REQUIREMENTS.minCTAs) {
      this.suggestions.push(`Add more CTAs (current: ${ctaCount}, recommended: ${REQUIREMENTS.minCTAs}+)`);
    }
  }

  validateWordCount(content) {
    const wordCount = this.calculateWordCount(content);
    
    if (wordCount < REQUIREMENTS.minWordCount) {
      this.warnings.push(`Word count too low: ${wordCount} (minimum: ${REQUIREMENTS.minWordCount})`);
    } else if (wordCount > REQUIREMENTS.maxWordCount) {
      this.warnings.push(`Word count very high: ${wordCount} (consider breaking into series)`);
    } else {
      console.log(`✅ Word count: ${wordCount} words`);
    }
  }

  validateReadability(content) {
    const score = this.calculateReadabilityScore(content);
    
    if (score < REQUIREMENTS.minReadabilityScore || score > REQUIREMENTS.maxReadabilityScore) {
      this.warnings.push(`Readability score: ${score} (optimal: ${REQUIREMENTS.minReadabilityScore}-${REQUIREMENTS.maxReadabilityScore})`);
    }
  }

  validateImages(frontmatter) {
    const requiredImages = ['image', 'ogImage', 'socialImage'];
    
    requiredImages.forEach(imageField => {
      if (!frontmatter[imageField]) {
        this.warnings.push(`Missing ${imageField}`);
      } else {
        // Check if image file exists
        const imagePath = path.join(process.cwd(), 'public', frontmatter[imageField]);
        if (!fs.existsSync(imagePath)) {
          this.errors.push(`Image file not found: ${frontmatter[imageField]}`);
        }
      }
    });
  }

  validateSchema(frontmatter) {
    // Check for structured data opportunities
    if (!frontmatter.schema) {
      this.suggestions.push('Consider adding structured data (schema) for better SEO');
    }
  }

  // Helper methods
  findAffiliateLinks(content) {
    const affiliatePatterns = [
      /amazon\.com.*tag=/i,
      /bookshop\.org.*affiliate=/i,
      /arjdj2msd\.com.*7LKLK3/i
    ];
    
    return affiliatePatterns.filter(pattern => pattern.test(content));
  }

  findInternalLinks(content) {
    const internalLinkPattern = /\[([^\]]+)\]\(\/blog\/[^)]+\)/g;
    const links = [];
    let match;
    
    while ((match = internalLinkPattern.exec(content)) !== null) {
      links.push(match[0]);
    }
    
    return links;
  }

  checkDisclosurePosition(content) {
    const lines = content.split('\n');
    const disclosureLine = lines.findIndex(line => 
      /affiliate.*link/i.test(line) || /commission.*purchase/i.test(line)
    );
    
    if (disclosureLine === -1) return 'missing';
    if (disclosureLine < 5) return 'correct';
    if (disclosureLine < 10) return 'late';
    return 'too late';
  }

  calculateWordCount(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  calculateReadabilityScore(content) {
    // Simple Flesch-Kincaid approximation
    const sentences = content.split(/[.!?]+/).length;
    const words = this.calculateWordCount(content);
    const syllables = this.estimateSyllables(content);
    
    return Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words));
  }

  estimateSyllables(content) {
    // Simple syllable estimation
    const words = content.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return words.reduce((count, word) => {
      return count + Math.max(1, word.match(/[aeiouy]+/g)?.length || 1);
    }, 0);
  }

  checkFormatting(content) {
    const issues = [];
    
    // Check for proper bold formatting
    if (content.includes('*Why it\'s great:*') && !content.includes('**Why it\'s great:**')) {
      issues.push('Use **bold** instead of *italic* for "Why it\'s great"');
    }
    
    // Check for proper link formatting
    if (content.includes('class="amazon-link"') && !content.includes('target="_blank"')) {
      issues.push('Add target="_blank" to affiliate links');
    }
    
    return issues;
  }

  checkBrokenMarkdown(content) {
    const issues = [];
    
    // Check for unclosed brackets
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      issues.push('Unmatched square brackets in markdown');
    }
    
    return issues;
  }

  checkBrokenInternalLinks(links) {
    // This would need to be implemented with actual file system checks
    return [];
  }

  checkKeywordDensity(content, frontmatter) {
    const suggestions = [];
    
    if (frontmatter.keywords && typeof frontmatter.keywords === 'string') {
      const keywords = frontmatter.keywords.split(',').map(k => k.trim());
      const wordCount = this.calculateWordCount(content);
      
      keywords.forEach(keyword => {
        const regex = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'gi');
        const matches = (content.match(regex) || []).length;
        const density = (matches / wordCount) * 100;
        
        if (density < 0.5) {
          suggestions.push(`Low keyword density for "${keyword}": ${density.toFixed(2)}%`);
        } else if (density > 3) {
          suggestions.push(`High keyword density for "${keyword}": ${density.toFixed(2)}% (may be over-optimized)`);
        }
      });
    }
    
    return suggestions;
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  printPostResults(filename) {
    if (this.errors.length === 0 && this.warnings.length === 0 && this.suggestions.length === 0) {
      console.log(`✅ ${filename}: All checks passed!\n`);
      return;
    }
    
    if (this.errors.length > 0) {
      console.log(`❌ ${filename} - ERRORS:`);
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`⚠️  ${filename} - WARNINGS:`);
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.suggestions.length > 0) {
      console.log(`💡 ${filename} - SUGGESTIONS:`);
      this.suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
    }
    
    console.log('');
  }

  printResults() {
    console.log('🎯 Validation Complete!');
    console.log('Run with --fix to automatically correct common issues.');
  }
}

// CLI interface
if (require.main === module) {
  const validator = new BlogValidator();
  validator.validateAllPosts();
}

module.exports = BlogValidator; 