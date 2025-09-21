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
    
    // Check for JavaScript redirects
    lines.forEach((line, index) => {
      if (line.includes('window.location.replace') || 
          line.includes('window.location.href')) {
        this.addError(filePath, index + 1,
          `JavaScript redirect found: ${line.trim()}`,
          'Replace with Astro.redirect() for SEO');
        hasErrors = true;
      }
    });
    
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
      if (!content.includes('meta name="description"') && 
          !content.includes('meta property="og:description"')) {
        this.addWarning(filePath, 0,
          'Missing meta description tag',
          'Add meta description for better SEO');
      }
      
      if (!content.includes('meta property="og:title"') && 
          !content.includes('meta name="twitter:title"')) {
        this.addWarning(filePath, 0,
          'Missing Open Graph title tag',
          'Add og:title for social media sharing');
      }
    }
    
    // Check for proper canonical URLs
    if (content.includes('canonical') && 
        !content.includes('https://bright-gift.com/')) {
      this.addError(filePath, content.indexOf('canonical') + 1,
        'Canonical URL missing full domain',
        'Use full domain: https://bright-gift.com/...');
      hasErrors = true;
    }
    
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
    
    fs.writeFileSync('template-validation-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: template-validation-report.json');
    
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
