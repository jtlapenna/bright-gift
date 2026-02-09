#!/usr/bin/env node

/**
 * Complete SEO Validation Script
 * Runs all SEO validation checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path'); // Purpose: write report to a stable path

console.log('🔍 Running Complete SEO Validation...\n');

class SEOValidator {
  constructor() {
    this.results = {
      content: { passed: false, errors: 0 },
      templates: { passed: false, errors: 0 },
      overall: { passed: false, totalErrors: 0 }
    };
  }

  // Run content validation
  validateContent() {
    console.log('1. Validating content...');
    try {
      execSync('node scripts/seo-validation/validate-content.js', { stdio: 'inherit' });
      this.results.content.passed = true;
      console.log('✅ Content validation passed\n');
    } catch (error) {
      this.results.content.passed = false;
      console.log('❌ Content validation failed\n');
    }
  }

  // Run template validation
  validateTemplates() {
    console.log('2. Validating templates...');
    try {
      execSync('node scripts/seo-validation/validate-templates.js', { stdio: 'inherit' });
      this.results.templates.passed = true;
      console.log('✅ Template validation passed\n');
    } catch (error) {
      this.results.templates.passed = false;
      console.log('❌ Template validation failed\n');
    }
  }

  // Check for critical SEO issues
  checkCriticalIssues() {
    console.log('3. Checking for critical SEO issues...');
    
    const criticalIssues = [];
    
    // Check for imageJpg references (exclude commented code)
    try {
      const result = execSync('grep -r "imageJpg" src/ | grep -v "//" | grep -v "REMOVED" || true', { encoding: 'utf8' });
      if (result.trim()) {
        criticalIssues.push('ImageJpg references found in templates');
      }
    } catch (error) {
      // grep returns non-zero exit code when no matches found
    }
    
    // Check for fake structured data
    try {
      const result = execSync('grep -r "ratingValue.*4.8" src/ || true', { encoding: 'utf8' });
      if (result.trim()) {
        criticalIssues.push('Fake structured data ratings found');
      }
    } catch (error) {
      // grep returns non-zero exit code when no matches found
    }
    
    // Check for JavaScript redirects (exclude OAuth pages)
    try {
      const result = execSync('grep -r "window.location.replace" src/ | grep -v "oauth" | grep -v "callback" || true', { encoding: 'utf8' });
      if (result.trim()) {
        criticalIssues.push('JavaScript redirects found');
      }
    } catch (error) {
      // grep returns non-zero exit code when no matches found
    }
    
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES FOUND:');
      criticalIssues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
      console.log('');
      return false;
    } else {
      console.log('✅ No critical SEO issues found\n');
      return true;
    }
  }

  // Generate overall report
  generateReport() {
    console.log('📊 OVERALL SEO VALIDATION RESULTS\n');
    
    const contentStatus = this.results.content.passed ? '✅ PASSED' : '❌ FAILED';
    const templateStatus = this.results.templates.passed ? '✅ PASSED' : '❌ FAILED';
    
    console.log(`Content Validation: ${contentStatus}`);
    console.log(`Template Validation: ${templateStatus}`);
    
    // Check if all validations passed
    this.results.overall.passed = this.results.content.passed && this.results.templates.passed;
    
    if (this.results.overall.passed) {
      console.log('\n🎉 ALL SEO VALIDATIONS PASSED!');
      console.log('Your site is ready for deployment.');
    } else {
      console.log('\n⚠️  SEO VALIDATIONS FAILED!');
      console.log('Please fix the issues above before deploying.');
    }
    
    // Save overall report
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        overallPassed: this.results.overall.passed,
        contentPassed: this.results.content.passed,
        templatePassed: this.results.templates.passed
      }
    };
    
    const reportPath = path.join(__dirname, '../../_workflow-documents/reports/seo-validation-overall-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: _workflow-documents/reports/seo-validation-overall-report.json');
    
    return this.results.overall.passed;
  }

  // Run all validations
  run() {
    this.validateContent();
    this.validateTemplates();
    const criticalIssuesPassed = this.checkCriticalIssues();
    
    this.results.overall.passed = this.results.content.passed && this.results.templates.passed && criticalIssuesPassed;
    
    this.generateReport();
    
    return this.results.overall.passed;
  }
}

// Run validation
const validator = new SEOValidator();
const success = validator.run();

if (success) {
  console.log('\n✅ SEO validation completed successfully');
  process.exit(0);
} else {
  console.log('\n❌ SEO validation failed - please fix issues before deploying');
  process.exit(1);
}
