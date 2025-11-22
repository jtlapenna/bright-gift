#!/usr/bin/env node

/**
 * SEO Content Validation Script
 * Validates all blog content against SEO standards
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Validating Content SEO Standards...\n');

class ContentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      filesWithErrors: 0,
      totalErrors: 0,
      totalWarnings: 0
    };
  }

  addError(file, line, message, fix) {
    this.errors.push({
      file,
      line,
      message,
      fix,
      severity: 'error'
    });
    this.stats.totalErrors++;
  }

  addWarning(file, line, message, fix) {
    this.warnings.push({
      file,
      line,
      message,
      fix,
      severity: 'warning'
    });
    this.stats.totalWarnings++;
  }

  // Validate individual blog post
  validateBlogPost(filePath) {
    this.stats.totalFiles++;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let hasErrors = false;

    // Check for imageJpg references
    lines.forEach((line, index) => {
      if (line.includes('imageJpg') || line.includes('imageJpg')) {
        this.addError(filePath, index + 1,
          `ImageJpg reference found: ${line.trim()}`,
          'Remove imageJpg references, use only .webp images');
        hasErrors = true;
      }
    });

    // Check canonical URL format
    const canonicalMatch = content.match(/^canonical:\s*(.+)$/m);
    if (canonicalMatch) {
      const canonical = canonicalMatch[1].trim();
      // Handle YAML multi-line syntax (>-) and quotes
      const cleanCanonical = canonical.replace(/^>-?\s*/, '').replace(/^['"]|['"]$/g, '').trim();

      // Skip if canonical is empty or just YAML syntax
      if (cleanCanonical && cleanCanonical !== '>-') {
        if (!cleanCanonical.startsWith('https://bright-gift.com/blog/') ||
            cleanCanonical.endsWith('/')) {
          this.addError(filePath, content.indexOf(canonicalMatch[0]) + 1,
            `Malformed canonical URL: ${cleanCanonical}`,
            'Format: https://bright-gift.com/blog/post-slug');
          hasErrors = true;
        }
      }
    }

    // Check affiliate link attributes
    // Check for old "nofollow" format
    const nofollowLinks = content.match(/rel="[^"]*nofollow[^"]*"/g);
    if (nofollowLinks) {
      nofollowLinks.forEach((link) => {
        this.addWarning(filePath, content.indexOf(link) + 1,
          `Outdated affiliate link attribute: ${link}`,
          'Change to rel="noopener sponsored"');
      });
    }

    // Check for missing "sponsored" attribute on affiliate links
    const affiliateDomains = ['amazon.com', 'bookshop.org', 'arjdj2msd.com'];
    const affiliateLinkPattern = /<a[^>]*href="https?:\/\/(www\.)?(amazon\.com|bookshop\.org|arjdj2msd\.com)[^"]*"[^>]*>/g;
    const allAffiliateLinks = content.match(affiliateLinkPattern);

    if (allAffiliateLinks) {
      allAffiliateLinks.forEach((link) => {
        if (!link.includes('rel="noopener sponsored"') && !link.includes('rel="sponsored noopener"')) {
          if (link.includes('rel=')) {
            this.addWarning(filePath, content.indexOf(link) + 1,
              `Affiliate link missing "sponsored" attribute: ${link.substring(0, 100)}...`,
              'Add rel="noopener sponsored" to affiliate links');
          } else {
            this.addWarning(filePath, content.indexOf(link) + 1,
              `Affiliate link missing rel attribute: ${link.substring(0, 100)}...`,
              'Add target="_blank" rel="noopener sponsored" to affiliate links');
          }
        }
      });
    }

    // Check for malformed duplicate attributes
    const duplicatePattern = /target="_blank"[^>]*target="_blank"/g;
    if (duplicatePattern.test(content)) {
      this.addError(filePath, content.indexOf(content.match(duplicatePattern)[0]) + 1,
        'Malformed affiliate link with duplicate target attributes',
        'Remove duplicate attributes, use: target="_blank" rel="noopener sponsored"');
      hasErrors = true;
    }

    const duplicateRelPattern = /rel="[^"]*"[^>]*rel="[^"]*"/g;
    if (duplicateRelPattern.test(content)) {
      this.addError(filePath, content.indexOf(content.match(duplicateRelPattern)[0]) + 1,
        'Malformed affiliate link with duplicate rel attributes',
        'Remove duplicate attributes, use: target="_blank" rel="noopener sponsored"');
      hasErrors = true;
    }

    // Check for fake structured data
    if (content.includes('"ratingValue": "4.8"') ||
        content.includes('"reviewCount": "150"')) {
      this.addError(filePath, content.indexOf('"ratingValue"') + 1,
        'Fake structured data ratings found',
        'Remove fake ratings or replace with real data');
      hasErrors = true;
    }

    // Check image format (handle ImageKit URLs with query parameters)
    const imageMatches = content.match(/image:\s*["']([^"']+)["']/g);
    if (imageMatches) {
      imageMatches.forEach(match => {
        const imagePath = match.match(/["']([^"']+)["']/)[1];
        // Check if URL contains .webp before query parameters (handles ImageKit URLs)
        const urlWithoutQuery = imagePath.split('?')[0];
        if (!urlWithoutQuery.endsWith('.webp')) {
          this.addError(filePath, content.indexOf(match) + 1,
            `Non-webp image found: ${imagePath}`,
            'Convert to .webp format for better SEO');
          hasErrors = true;
        }
      });
    }

    // Check title length
    const titleMatch = content.match(/^title:\s*["']([^"']+)["']$/m);
    if (titleMatch) {
      const title = titleMatch[1];
      if (title.length < 10 || title.length > 60) {
        this.addWarning(filePath, content.indexOf(titleMatch[0]) + 1,
          `Title length ${title.length} characters (should be 10-60)`,
          'Optimize title length for SEO');
      }
    }

    // Check description length
    const descMatch = content.match(/^description:\s*["']([^"']+)["']$/m);
    if (descMatch) {
      const description = descMatch[1];
      if (description.length < 120 || description.length > 160) {
        this.addWarning(filePath, content.indexOf(descMatch[0]) + 1,
          `Description length ${description.length} characters (should be 120-160)`,
          'Optimize description length for SEO');
      }
    }

    if (hasErrors) {
      this.stats.filesWithErrors++;
    }
  }

  // Validate all blog posts
  validateAllBlogPosts() {
    const blogFiles = glob.sync('src/content/blog/*.md');

    console.log(`Found ${blogFiles.length} blog posts to validate...\n`);

    blogFiles.forEach(file => {
      this.validateBlogPost(file);
    });
  }

  // Generate validation report
  generateReport() {
    console.log('📊 CONTENT VALIDATION RESULTS\n');

    console.log(`Total Files: ${this.stats.totalFiles}`);
    console.log(`Files with Errors: ${this.stats.filesWithErrors}`);
    console.log(`Total Errors: ${this.stats.totalErrors}`);
    console.log(`Total Warnings: ${this.stats.totalWarnings}\n`);

    if (this.errors.length > 0) {
      console.log('🚨 ERRORS FOUND:');
      this.errors.forEach(error => {
        console.log(`  ${error.file}:${error.line} - ${error.message}`);
        console.log(`    Fix: ${error.fix}\n`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  ${warning.file}:${warning.line} - ${warning.message}`);
        console.log(`    Fix: ${warning.fix}\n`);
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All content passes SEO validation!');
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      errors: this.errors,
      warnings: this.warnings
    };

    const reportPath = path.join(__dirname, '../../_workflow-documents/reports/content-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: _workflow-documents/reports/content-validation-report.json');

    return this.errors.length === 0;
  }
}

// Run validation
const validator = new ContentValidator();
validator.validateAllBlogPosts();
const success = validator.generateReport();

if (success) {
  console.log('\n✅ Content validation passed');
  process.exit(0);
} else {
  console.log('\n❌ Content validation failed');
  process.exit(1);
}
