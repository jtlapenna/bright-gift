#!/usr/bin/env node

/**
 * Preview Branch Auto-Fixer
 * Only runs on preview branch and provides enhanced feedback
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import the main fixer
const BlogFixer = require('./blog-fixer.js');

class PreviewFixer extends BlogFixer {
  constructor() {
    super();
    this.isPreviewBranch = this.checkPreviewBranch();
  }

  checkPreviewBranch() {
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      return currentBranch === 'preview';
    } catch (error) {
      console.log('⚠️  Could not determine current branch, proceeding with fixes...');
      return true; // Assume preview branch if we can't determine
    }
  }

  async fixAllPosts() {
    if (!this.isPreviewBranch) {
      console.log('🚫 Preview fixes skipped - not on preview branch');
      console.log('💡 Switch to preview branch to run fixes: git checkout preview');
      return;
    }

    console.log('🔧 Starting PREVIEW branch auto-fixes...\n');
    console.log('📋 This will automatically fix common issues before merging to main\n');
    
    const blogFiles = this.getBlogFiles();
    
    let totalFixes = 0;
    let filesFixed = 0;
    
    for (const file of blogFiles) {
      console.log(`📝 Fixing: ${path.basename(file)}`);
      const originalContent = fs.readFileSync(file, 'utf8');
      
      await this.fixPost(file);
      
      const newContent = fs.readFileSync(file, 'utf8');
      if (originalContent !== newContent) {
        filesFixed++;
        totalFixes += this.fixesApplied.length;
        console.log(`✅ Fixed: ${path.basename(file)}`);
      } else {
        console.log(`✅ No fixes needed: ${path.basename(file)}`);
      }
    }
    
    this.printPreviewResults(totalFixes, filesFixed);
  }

  printPreviewResults(totalFixes, filesFixed) {
    console.log('\n🎯 PREVIEW AUTO-FIX COMPLETE');
    console.log('=' * 50);
    
    if (totalFixes === 0) {
      console.log('✅ No fixes were needed! Content is already optimized.');
    } else {
      console.log(`📊 Summary:`);
      console.log(`   🔧 Total fixes applied: ${totalFixes}`);
      console.log(`   📁 Files modified: ${filesFixed}`);
      
      console.log('\n📋 Applied fixes:');
      this.fixesApplied.forEach(fix => console.log(`   • ${fix}`));
      
      console.log('\n💡 Next Steps:');
      console.log('1. Review the changes: git diff');
      console.log('2. Test the fixes: npm run validate:preview');
      console.log('3. Add enhancements: npm run enhance:preview');
      console.log('4. Commit changes: git add . && git commit -m "fix: auto-fix validation issues"');
    }
    
    console.log('\n🔗 Helpful Commands:');
    console.log('   npm run validate:preview # Check if fixes resolved issues');
    console.log('   npm run enhance:preview  # Add enhancements');
    console.log('   git diff                 # Review changes');
    console.log('   git status               # Check modified files');
  }

  printResults() {
    // Override parent method to use preview-specific results
    this.printPreviewResults(this.fixesApplied.length, 0);
  }
}

// CLI interface
if (require.main === module) {
  const fixer = new PreviewFixer();
  fixer.fixAllPosts();
}

module.exports = PreviewFixer; 