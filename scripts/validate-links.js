#!/usr/bin/env node

/**
 * Link Validation Script
 * Validates internal and external links for broken URLs
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const https = require('https');
const http = require('http');

// Configuration
const BLOG_DIR = 'src/content/blog';
const TIMEOUT = 5000; // 5 seconds timeout per link
const MAX_CONCURRENT = 5; // Limit concurrent requests

class LinkValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      totalLinks: 0,
      brokenLinks: 0,
      externalLinks: 0,
      internalLinks: 0
    };
    this.pendingRequests = 0;
    this.maxPending = MAX_CONCURRENT;
  }

  async validateAllPosts() {
    console.log('🔗 Starting link validation...\n');
    
    const blogFiles = this.getBlogFiles();
    this.stats.totalFiles = blogFiles.length;
    
    console.log(`Found ${blogFiles.length} blog posts to validate...\n`);
    
    for (const file of blogFiles) {
      console.log(`📝 Validating links in: ${path.basename(file)}`);
      await this.validatePost(file);
    }
    
    // Wait for any pending external link checks
    while (this.pendingRequests > 0) {
      await this.sleep(100);
    }
    
    this.printResults();
    return this.errors.length === 0;
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
    
    // Find all links in markdown content
    const links = this.extractLinks(markdown);
    this.stats.totalLinks += links.length;
    
    for (const link of links) {
      if (this.isInternalLink(link.url)) {
        this.stats.internalLinks++;
        this.validateInternalLink(link, filePath);
      } else {
        this.stats.externalLinks++;
        await this.validateExternalLink(link, filePath);
      }
    }
  }

  extractLinks(content) {
    const links = [];
    
    // Extract markdown links [text](url)
    const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = markdownRegex.exec(content)) !== null) {
      const text = match[1];
      const url = match[2];
      
      // Skip mailto and other non-HTTP links
      if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
        continue;
      }
      
      links.push({
        text,
        url: this.normalizeUrl(url),
        line: this.getLineNumber(content, match.index),
        type: 'markdown'
      });
    }
    
    // Extract HTML links <a href="url">text</a>
    const htmlRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/g;
    
    while ((match = htmlRegex.exec(content)) !== null) {
      const url = match[1];
      const text = match[2].trim();
      
      // Skip mailto and other non-HTTP links
      if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
        continue;
      }
      
      links.push({
        text,
        url: this.normalizeUrl(url),
        line: this.getLineNumber(content, match.index),
        type: 'html'
      });
    }
    
    return links;
  }

  normalizeUrl(url) {
    // Convert relative URLs to absolute
    if (url.startsWith('/')) {
      return `https://bright-gift.com${url}`;
    }
    
    // Ensure protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  }

  isInternalLink(url) {
    return url.includes('bright-gift.com') || url.startsWith('/');
  }

  validateInternalLink(link, filePath) {
    const url = link.url;
    const filename = path.basename(filePath, '.md');
    
    // Check if it's a blog post link
    if (url.includes('/blog/')) {
      const slug = url.split('/blog/')[1].replace(/\/$/, '');
      
      // Skip image links and other non-post URLs
      if (slug.includes('.') || slug.includes('/')) {
        console.log(`✅ Blog resource link: ${url}`);
        return;
      }
      
      // Handle blog index page (/blog/ or /blog)
      if (slug === '' || slug === 'blog') {
        console.log(`✅ Blog index link: ${url}`);
        return;
      }
      
      const expectedPath = path.join(process.cwd(), BLOG_DIR, `${slug}.md`);
      
      if (!fs.existsSync(expectedPath)) {
        this.addError(filePath, link.line, 
          `Internal blog link points to non-existent post: ${url}`,
          `Check if blog post ${slug}.md exists`);
        this.stats.brokenLinks++;
      }
    }
    
    // Check if it's a category link
    else if (url.includes('/category/')) {
      // Category pages are generated dynamically, so we'll just check the format
      const category = url.split('/category/')[1];
      if (!category || category.length === 0) {
        this.addError(filePath, link.line,
          `Malformed category link: ${url}`,
          'Category links should be in format /category/category-name');
        this.stats.brokenLinks++;
      }
    }
    
    // Check other internal links (homepage, etc.)
    else if (url.includes('bright-gift.com')) {
      // These are generally safe, but we could add more specific checks
      console.log(`✅ Internal link: ${url}`);
    }
  }

  async validateExternalLink(link, filePath) {
    // Skip validation for Amazon search URLs (they often timeout)
    if (link.url.includes('amazon.com/s?k=')) {
      console.log(`✅ Amazon search link: ${link.url}`);
      return;
    }
    
    // Skip validation for Bookshop search URLs
    if (link.url.includes('bookshop.org/search?')) {
      console.log(`✅ Bookshop search link: ${link.url}`);
      return;
    }
    
    // Wait if we have too many pending requests
    while (this.pendingRequests >= this.maxPending) {
      await this.sleep(100);
    }
    
    this.pendingRequests++;
    
    try {
      const isValid = await this.checkUrl(link.url);
      if (!isValid) {
        this.addError(filePath, link.line,
          `External link is not accessible: ${link.url}`,
          'Check if the URL is correct and the site is online');
        this.stats.brokenLinks++;
      } else {
        console.log(`✅ External link: ${link.url}`);
      }
    } catch (error) {
      this.addWarning(filePath, link.line,
        `Could not verify external link: ${link.url} (${error.message})`,
        'Link may be temporarily unavailable');
    } finally {
      this.pendingRequests--;
    }
  }

  checkUrl(url) {
    return new Promise((resolve) => {
      const protocol = url.startsWith('https:') ? https : http;
      
      const req = protocol.request(url, { 
        method: 'HEAD',
        timeout: TIMEOUT 
      }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      
      req.setTimeout(TIMEOUT);
      req.end();
    });
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  addError(file, line, message, fix) {
    this.errors.push({
      file: path.basename(file),
      line,
      message,
      fix,
      severity: 'error'
    });
  }

  addWarning(file, line, message, fix) {
    this.warnings.push({
      file: path.basename(file),
      line,
      message,
      fix,
      severity: 'warning'
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printResults() {
    console.log('\n📊 LINK VALIDATION RESULTS\n');
    
    console.log(`Total Files: ${this.stats.totalFiles}`);
    console.log(`Total Links: ${this.stats.totalLinks}`);
    console.log(`Internal Links: ${this.stats.internalLinks}`);
    console.log(`External Links: ${this.stats.externalLinks}`);
    console.log(`Broken Links: ${this.stats.brokenLinks}\n`);
    
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
      console.log('✅ All links are valid!');
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      errors: this.errors,
      warnings: this.warnings
    };
    
    fs.writeFileSync('link-validation-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: link-validation-report.json');
  }
}

// CLI interface
if (require.main === module) {
  const validator = new LinkValidator();
  validator.validateAllPosts()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Link validation failed:', error);
      process.exit(1);
    });
}

module.exports = LinkValidator;
