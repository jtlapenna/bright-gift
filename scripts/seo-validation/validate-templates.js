#!/usr/bin/env node

/**
 * SEO Template Validation Script
 * Validates all .astro templates for SEO issues
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Validating Template SEO Standards...\n');

class TemplateValidator {
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

  // Validate individual template file
  validateTemplate(filePath) {
    this.stats.totalFiles++;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const usesSharedLayout = /<Layout\b/.test(content);
    const hasLayoutDescriptionProp = /(?:metaDescription|description)=\{?/.test(content);
    const hasLayoutTitleProp = /(?:metaTitle|title)=\{?/.test(content);
    const isRedirectOnlyPage = /Astro\.redirect\s*\(/.test(content) && !usesSharedLayout;
    
    let hasErrors = false;
    
    // Check for imageJpg references (ignore commented code)
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if ((trimmedLine.includes('imageJpg') || trimmedLine.includes('imageJpg')) && 
          !trimmedLine.startsWith('//') && 
          !trimmedLine.startsWith('*') &&
          !trimmedLine.startsWith('<!--')) {
        this.addError(filePath, index + 1, 
          `ImageJpg reference found: ${trimmedLine}`, 
          'Remove imageJpg references, use only .webp images');
        hasErrors = true;
      }
    });
    
    // Check for fake structured data
    lines.forEach((line, index) => {
      if (line.includes('"ratingValue": "4.8"') || 
          line.includes('"reviewCount": "150"') ||
          line.includes('"bestRating": "5"') ||
          line.includes('"worstRating": "1"')) {
        this.addError(filePath, index + 1,
          `Fake structured data found: ${line.trim()}`,
          'Remove fake ratings or replace with real data');
        hasErrors = true;
      }
    });
    
    // Check for JavaScript redirects (exclude OAuth pages)
    if (!filePath.includes('oauth') && !filePath.includes('callback')) {
      // Purpose: only flag real redirects (writes/calls), not reads like `window.location.href`.
      const redirectPattern = /(window\.location\.(replace|assign)\s*\(|(?:window\.)?location\.href\s*=(?![=])|document\.location\s*=(?![=]))/;
      lines.forEach((line, index) => {
        if (redirectPattern.test(line)) {
          this.addError(filePath, index + 1,
            `JavaScript redirect found: ${line.trim()}`,
            'Replace with Astro.redirect() for SEO');
          hasErrors = true;
        }
      });
    }
    
    // Check for missing alt attributes
    const imgTags = content.match(/<img[^>]*>/g);
    if (imgTags) {
      imgTags.forEach((imgTag, index) => {
        if (!imgTag.includes('alt=')) {
          this.addError(filePath, content.indexOf(imgTag) + 1,
            `Missing alt attribute: ${imgTag}`,
            'Add descriptive alt attribute for accessibility and SEO');
          hasErrors = true;
        }
      });
    }
    
    // Check for duplicate preload resources
    const preloadLines = lines.filter(line => line.includes('rel="preload"'));
    const duplicates = preloadLines.filter((line, index) => 
      preloadLines.indexOf(line) !== index
    );
    
    if (duplicates.length > 0) {
      this.addWarning(filePath, 0,
        `Duplicate preload resources found: ${duplicates.length} duplicates`,
        'Remove duplicate preload declarations');
    }
    
    // Check for proper meta tags
    if (filePath.includes('blog') || filePath.includes('index')) {
      if (!isRedirectOnlyPage &&
          !usesSharedLayout &&
          !content.includes('meta name="description"') && 
          !content.includes('meta property="og:description"')) {
        this.addWarning(filePath, 0,
          'Missing meta description tag',
          'Add meta description for better SEO');
      }
      
      if (!isRedirectOnlyPage && usesSharedLayout && !hasLayoutDescriptionProp) {
        this.addWarning(filePath, 0,
          'Layout page is missing description props',
          'Pass description or metaDescription into Layout for better SEO');
      }
      
      if (!isRedirectOnlyPage &&
          !usesSharedLayout &&
          !content.includes('meta property="og:title"') && 
          !content.includes('meta name="twitter:title"')) {
        this.addWarning(filePath, 0,
          'Missing Open Graph title tag',
          'Add og:title for social media sharing');
      }

      if (!isRedirectOnlyPage && usesSharedLayout && !hasLayoutTitleProp) {
        this.addWarning(filePath, 0,
          'Layout page is missing title props',
          'Pass title or metaTitle into Layout for better SEO');
      }
    }
    
    // Check for actual relative canonical tags/props without flagging helper props like canonicalPath.
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const hasCanonicalLink = /rel=["']canonical["']/.test(trimmedLine);
      const canonicalLiteral = trimmedLine.match(/\bcanonical=(["'])(.*?)\1/);
      const canonicalExpression = trimmedLine.match(/\bcanonical=\{([^}]+)\}/);
      const linkHref = trimmedLine.match(/\bhref=(["'])(.*?)\1/);

      const hasRelativeCanonicalLink =
        hasCanonicalLink &&
        linkHref &&
        linkHref[2] &&
        !linkHref[2].startsWith('https://bright-gift.com/');

      const hasRelativeCanonicalLiteral =
        canonicalLiteral &&
        canonicalLiteral[2] &&
        !canonicalLiteral[2].startsWith('https://bright-gift.com/');

      const hasRelativeCanonicalExpression =
        canonicalExpression &&
        /^\s*["'`]\//.test(canonicalExpression[1]);

      if (hasRelativeCanonicalLink || hasRelativeCanonicalLiteral || hasRelativeCanonicalExpression) {
        this.addError(filePath, index + 1,
          'Canonical URL missing full domain',
          'Use full domain: https://bright-gift.com/...');
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      this.stats.filesWithErrors++;
    }
  }

  // Validate all template files
  validateAllTemplates() {
    const templateFiles = glob.sync('src/**/*.astro');
    
    console.log(`Found ${templateFiles.length} template files to validate...\n`);
    
    templateFiles.forEach(file => {
      this.validateTemplate(file);
    });
  }

  // Generate validation report
  generateReport() {
    console.log('📊 TEMPLATE VALIDATION RESULTS\n');
    
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
      console.log('✅ All templates pass SEO validation!');
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.stats,
      errors: this.errors,
      warnings: this.warnings
    };
    
    const reportPath = path.join(__dirname, '../../_workflow-documents/reports/template-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: _workflow-documents/reports/template-validation-report.json');
    
    return this.errors.length === 0;
  }
}

// Run validation
const validator = new TemplateValidator();
validator.validateAllTemplates();
const success = validator.generateReport();

if (success) {
  console.log('\n✅ Template validation passed');
  process.exit(0);
} else {
  console.log('\n❌ Template validation failed');
  process.exit(1);
}
