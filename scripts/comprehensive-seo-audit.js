#!/usr/bin/env node

/**
 * Comprehensive SEO Pre-Fix Audit Script
 * Identifies all SEO issues before implementing fixes
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 COMPREHENSIVE SEO PRE-FIX AUDIT\n');

class SEOAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      filesWithIssues: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0
    };
  }

  addIssue(severity, category, file, line, description, fix) {
    this.issues.push({
      severity,
      category,
      file,
      line,
      description,
      fix,
      timestamp: new Date().toISOString()
    });
    
    this.stats[`${severity}Issues`]++;
    this.stats.filesWithIssues++;
  }

  addWarning(category, file, description) {
    this.warnings.push({
      category,
      file,
      description,
      timestamp: new Date().toISOString()
    });
  }

  // 1. Check for duplicate content config files
  checkContentConfig() {
    console.log('1. Checking content configuration...');
    
    const configJs = fs.existsSync('src/content/config.js');
    const configTs = fs.existsSync('src/content/config.ts');
    
    if (configJs && configTs) {
      this.addIssue('critical', 'config', 'src/content/', 0, 
        'Duplicate content config files exist (config.js and config.ts)', 
        'Delete src/content/config.js');
    }
    
    if (!configTs) {
      this.addIssue('critical', 'config', 'src/content/', 0, 
        'Content config file missing', 
        'Create src/content/config.ts');
    }
    
    // Check for syntax errors in config.ts
    if (configTs) {
      try {
        const content = fs.readFileSync('src/content/config.ts', 'utf8');
        if (content.includes('const giftGuides = defineCollection\n  schema:')) {
          this.addIssue('critical', 'config', 'src/content/config.ts', 36, 
            'Missing opening brace in giftGuides definition', 
            'Add opening brace: const giftGuides = defineCollection({');
        }
      } catch (error) {
        this.addIssue('critical', 'config', 'src/content/config.ts', 0, 
          'Config file has syntax errors', 
          'Fix TypeScript syntax errors');
      }
    }
  }

  // 2. Check for imageJpg references
  checkImageReferences() {
    console.log('2. Checking for problematic image references...');
    
    const files = [
      'src/pages/blog/[...slug].astro',
      'src/pages/index.astro'
    ];
    
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.includes('imageJpg') || line.includes('imageJpg')) {
            this.addIssue('high', 'images', file, index + 1, 
              `References to imageJpg field: ${line.trim()}`, 
              'Remove imageJpg references, use only .webp images');
          }
        });
      }
    });
  }

  // 3. Check for fake structured data
  checkStructuredData() {
    console.log('3. Checking structured data for fake ratings...');
    
    const files = [
      'src/pages/blog/[...slug].astro',
      'src/pages/index.astro',
      'src/pages/category/[category].astro'
    ];
    
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.includes('"ratingValue": "4.8"') || 
              line.includes('"reviewCount": "150"') ||
              line.includes('"bestRating": "5"') ||
              line.includes('"worstRating": "1"')) {
            this.addIssue('high', 'structured-data', file, index + 1, 
              `Fake structured data ratings: ${line.trim()}`, 
              'Remove fake ratings or replace with real data');
          }
        });
      }
    });
  }

  // 4. Check for inconsistent affiliate link attributes
  checkAffiliateLinks() {
    console.log('4. Checking affiliate link consistency...');
    
    const blogFiles = glob.sync('src/content/blog/*.md');
    
    blogFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes('rel="nofollow noopener"') && 
            (line.includes('amazon.com') || line.includes('arjdj2msd.com'))) {
          this.addIssue('medium', 'affiliate-links', file, index + 1, 
            `Inconsistent affiliate link attribute: ${line.trim()}`, 
            'Change to rel="sponsored noopener"');
        }
      });
    });
  }

  // 5. Check for malformed canonical URLs
  checkCanonicalUrls() {
    console.log('5. Checking canonical URL format...');
    
    const blogFiles = glob.sync('src/content/blog/*.md');
    
    blogFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.startsWith('canonical:') && 
            !line.includes('https://bright-gift.com/') && 
            !line.startsWith('canonical: https://')) {
          this.addIssue('medium', 'canonical', file, index + 1, 
            `Malformed canonical URL: ${line.trim()}`, 
            'Add full domain (no trailing slash needed with trailingSlash: never)');
        }
      });
    });
  }

  // 6. Check for JavaScript redirects
  checkJavaScriptRedirects() {
    console.log('6. Checking for JavaScript redirects...');
    
    const files = [
      'src/pages/gift-idea-generator/index.astro'
    ];
    
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.includes('window.location.replace') || 
              line.includes('window.location.href')) {
            this.addIssue('high', 'redirects', file, index + 1, 
              `JavaScript redirect found: ${line.trim()}`, 
              'Replace with Astro.redirect()');
          }
        });
      }
    });
  }

  // 7. Check sitemap completeness
  checkSitemapCompleteness() {
    console.log('7. Checking sitemap completeness...');
    
    if (fs.existsSync('public/sitemap.xml')) {
      const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
      const blogPostCount = (sitemap.match(/<loc>https:\/\/bright-gift.com\/blog\/[^\/]+<\/loc>/g) || []).length;
      
      if (blogPostCount < 40) {
        this.addIssue('critical', 'sitemap', 'public/sitemap.xml', 0, 
          `Sitemap only contains ${blogPostCount} blog posts (expected 40+)`, 
          'Regenerate sitemap with all blog posts');
      }
    } else {
      this.addIssue('critical', 'sitemap', 'public/sitemap.xml', 0, 
        'Sitemap file missing', 
        'Generate sitemap.xml');
    }
  }

  // 8. Check robots.txt consistency
  checkRobotsTxt() {
    console.log('8. Checking robots.txt consistency...');
    
    const staticRobots = fs.existsSync('public/robots.txt');
    const dynamicRobots = fs.existsSync('src/pages/robots.txt.ts');
    
    if (staticRobots && dynamicRobots) {
      this.addIssue('medium', 'robots', 'src/pages/robots.txt.ts', 0, 
        'Both static and dynamic robots.txt exist', 
        'Delete one method to avoid conflicts');
    }
    
    if (!staticRobots && !dynamicRobots) {
      this.addIssue('critical', 'robots', 'public/robots.txt', 0, 
        'No robots.txt file found', 
        'Create robots.txt file');
    }
  }

  // 9. Check for duplicate preload resources
  checkDuplicatePreloads() {
    console.log('9. Checking for duplicate preload resources...');
    
    const file = 'src/layouts/Layout.astro';
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const preloadLines = content.split('\n').filter(line => line.includes('rel="preload"'));
      
      const duplicates = preloadLines.filter((line, index) => 
        preloadLines.indexOf(line) !== index
      );
      
      if (duplicates.length > 0) {
        this.addIssue('low', 'performance', file, 0, 
          `Duplicate preload resources found: ${duplicates.length} duplicates`, 
          'Remove duplicate preload declarations');
      }
    }
  }

  // 10. Check for missing error handling
  checkErrorHandling() {
    console.log('10. Checking error handling...');
    
    const file = 'src/pages/blog/[...slug].astro';
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('warn(`[WARN] Missing required frontmatter field') && 
          !content.includes('throw new Error')) {
        this.addWarning('robustness', file, 
          'Missing required fields only log warnings, no error handling');
      }
    }
  }

  // Run all checks
  runAudit() {
    console.log('Starting comprehensive SEO audit...\n');
    
    this.checkContentConfig();
    this.checkImageReferences();
    this.checkStructuredData();
    this.checkAffiliateLinks();
    this.checkCanonicalUrls();
    this.checkJavaScriptRedirects();
    this.checkSitemapCompleteness();
    this.checkRobotsTxt();
    this.checkDuplicatePreloads();
    this.checkErrorHandling();
    
    this.generateReport();
  }

  // Generate audit report
  generateReport() {
    console.log('\n📊 AUDIT RESULTS\n');
    
    // Summary statistics
    console.log(`Total Issues Found: ${this.issues.length}`);
    console.log(`Critical: ${this.stats.criticalIssues}`);
    console.log(`High: ${this.stats.highIssues}`);
    console.log(`Medium: ${this.stats.mediumIssues}`);
    console.log(`Low: ${this.stats.lowIssues}`);
    console.log(`Warnings: ${this.warnings.length}\n`);
    
    // Group issues by severity
    const criticalIssues = this.issues.filter(i => i.severity === 'critical');
    const highIssues = this.issues.filter(i => i.severity === 'high');
    const mediumIssues = this.issues.filter(i => i.severity === 'medium');
    const lowIssues = this.issues.filter(i => i.severity === 'low');
    
    // Display issues by priority
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      criticalIssues.forEach(issue => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.description}`);
        console.log(`    Fix: ${issue.fix}\n`);
      });
    }
    
    if (highIssues.length > 0) {
      console.log('🔴 HIGH PRIORITY ISSUES:');
      highIssues.forEach(issue => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.description}`);
        console.log(`    Fix: ${issue.fix}\n`);
      });
    }
    
    if (mediumIssues.length > 0) {
      console.log('🟡 MEDIUM PRIORITY ISSUES:');
      mediumIssues.forEach(issue => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.description}`);
        console.log(`    Fix: ${issue.fix}\n`);
      });
    }
    
    if (lowIssues.length > 0) {
      console.log('🟢 LOW PRIORITY ISSUES:');
      lowIssues.forEach(issue => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.description}`);
        console.log(`    Fix: ${issue.fix}\n`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  ${warning.file} - ${warning.description}\n`);
      });
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      issues: this.issues,
      warnings: this.warnings
    };
    
    fs.writeFileSync('seo-audit-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: seo-audit-report.json');
    
    // Return success status
    return this.stats.criticalIssues === 0 && this.stats.highIssues === 0;
  }
}

// Run the audit
const auditor = new SEOAuditor();
const success = auditor.runAudit();

if (success) {
  console.log('\n✅ Audit completed - No critical or high priority issues found');
  process.exit(0);
} else {
  console.log('\n❌ Audit completed - Critical or high priority issues found');
  process.exit(1);
}
