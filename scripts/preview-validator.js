#!/usr/bin/env node

/**
 * Preview Branch Validator
 * Only runs on preview branch and provides enhanced feedback
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import the main validator
const BlogValidator = require('./blog-validator.js');

class PreviewValidator extends BlogValidator {
  constructor() {
    super();
    this.isPreviewBranch = this.checkPreviewBranch();
  }

  checkPreviewBranch() {
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      return currentBranch === 'preview';
    } catch (error) {
      console.log('⚠️  Could not determine current branch, proceeding with validation...');
      return true; // Assume preview branch if we can't determine
    }
  }

  async validateAllPosts() {
    if (!this.isPreviewBranch) {
      console.log('🚫 Preview validation skipped - not on preview branch');
      console.log('💡 Switch to preview branch to run validation: git checkout preview');
      return;
    }

    console.log('🔍 Starting PREVIEW branch validation...\n');
    console.log('📋 This validation will check content quality before merging to main\n');
    
    const blogFiles = this.getBlogFiles();
    
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalSuggestions = 0;
    
    for (const file of blogFiles) {
      console.log(`📝 Validating: ${path.basename(file)}`);
      await this.validatePost(file);
      
      totalErrors += this.errors.length;
      totalWarnings += this.warnings.length;
      totalSuggestions += this.suggestions.length;
    }
    
    this.printPreviewResults(totalErrors, totalWarnings, totalSuggestions);
  }

  printPreviewResults(totalErrors, totalWarnings, totalSuggestions) {
    console.log('\n🎯 PREVIEW VALIDATION COMPLETE');
    console.log('=' * 50);
    
    if (totalErrors === 0 && totalWarnings === 0 && totalSuggestions === 0) {
      console.log('✅ All posts pass validation! Ready to merge to main.');
    } else {
      console.log(`📊 Summary:`);
      console.log(`   ❌ Errors: ${totalErrors} (must fix before merge)`);
      console.log(`   ⚠️  Warnings: ${totalWarnings} (should fix)`);
      console.log(`   💡 Suggestions: ${totalSuggestions} (optional improvements)`);
      
      if (totalErrors > 0) {
        console.log('\n🚨 CRITICAL: Fix all errors before merging to main!');
        console.log('💡 Run: npm run fix:preview');
      }
      
      if (totalWarnings > 0) {
        console.log('\n⚠️  RECOMMENDED: Fix warnings for better content quality');
        console.log('💡 Run: npm run enhance:preview');
      }
      
      console.log('\n📋 Next Steps:');
      console.log('1. Fix critical errors: npm run fix:preview');
      console.log('2. Add enhancements: npm run enhance:preview');
      console.log('3. Re-validate: npm run validate:preview');
      console.log('4. When ready: git add . && git commit -m "fix: resolve validation issues"');
      console.log('5. Merge to main: git checkout main && git merge preview');
    }
    
    console.log('\n🔗 Helpful Commands:');
    console.log('   npm run fix:preview      # Auto-fix common issues');
    console.log('   npm run enhance:preview  # Add enhancements');
    console.log('   npm run validate:preview # Re-check after fixes');
  }

  printPostResults(filename) {
    if (this.errors.length === 0 && this.warnings.length === 0 && this.suggestions.length === 0) {
      console.log(`✅ ${filename}: All checks passed!\n`);
      return;
    }
    
    if (this.errors.length > 0) {
      console.log(`❌ ${filename} - CRITICAL ERRORS (must fix):`);
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`⚠️  ${filename} - WARNINGS (should fix):`);
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.suggestions.length > 0) {
      console.log(`💡 ${filename} - SUGGESTIONS (optional):`);
      this.suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
    }
    
    console.log('');
  }
}

// CLI interface
if (require.main === module) {
  const validator = new PreviewValidator();
  validator.validateAllPosts();
}

module.exports = PreviewValidator; 