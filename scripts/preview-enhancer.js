#!/usr/bin/env node

/**
 * Preview Branch Enhancer
 * Only runs on preview branch and provides enhanced feedback
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import the main enhancer
const BlogEnhancer = require('./blog-enhancer.js');

class PreviewEnhancer extends BlogEnhancer {
  constructor() {
    super();
    this.isPreviewBranch = this.checkPreviewBranch();
  }

  checkPreviewBranch() {
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      return currentBranch === 'preview';
    } catch (error) {
      console.log('⚠️  Could not determine current branch, proceeding with enhancements...');
      return true; // Assume preview branch if we can't determine
    }
  }

  async enhanceAllPosts() {
    if (!this.isPreviewBranch) {
      console.log('🚫 Preview enhancements skipped - not on preview branch');
      console.log('💡 Switch to preview branch to run enhancements: git checkout preview');
      return;
    }

    console.log('🚀 Starting PREVIEW branch enhancements...\n');
    console.log('📋 This will add SEO optimizations and features before merging to main\n');
    
    const blogFiles = this.getBlogFiles();
    
    let totalEnhancements = 0;
    let filesEnhanced = 0;
    
    for (const file of blogFiles) {
      console.log(`📝 Enhancing: ${path.basename(file)}`);
      const originalContent = fs.readFileSync(file, 'utf8');
      
      await this.enhancePost(file);
      
      const newContent = fs.readFileSync(file, 'utf8');
      if (originalContent !== newContent) {
        filesEnhanced++;
        totalEnhancements += this.enhancementsApplied.length;
        console.log(`✅ Enhanced: ${path.basename(file)}`);
      } else {
        console.log(`✅ No enhancements needed: ${path.basename(file)}`);
      }
    }
    
    this.printPreviewResults(totalEnhancements, filesEnhanced);
  }

  printPreviewResults(totalEnhancements, filesEnhanced) {
    console.log('\n🎯 PREVIEW ENHANCEMENT COMPLETE');
    console.log('=' * 50);
    
    if (totalEnhancements === 0) {
      console.log('✅ No enhancements were needed! Content is already optimized.');
    } else {
      console.log(`📊 Summary:`);
      console.log(`   🚀 Total enhancements applied: ${totalEnhancements}`);
      console.log(`   📁 Files enhanced: ${filesEnhanced}`);
      
      console.log('\n📋 Applied enhancements:');
      this.enhancementsApplied.forEach(enhancement => console.log(`   • ${enhancement}`));
      
      console.log('\n💡 Next Steps:');
      console.log('1. Review the enhancements: git diff');
      console.log('2. Test the improvements: npm run validate:preview');
      console.log('3. Commit enhancements: git add . && git commit -m "feat: add content enhancements"');
      console.log('4. When ready: git checkout main && git merge preview');
    }
    
    console.log('\n🔗 Helpful Commands:');
    console.log('   npm run validate:preview # Check if enhancements improved content');
    console.log('   git diff                 # Review enhancement changes');
    console.log('   git status               # Check enhanced files');
    console.log('   npm run build            # Test build with enhancements');
  }

  printResults() {
    // Override parent method to use preview-specific results
    this.printPreviewResults(this.enhancementsApplied.length, 0);
  }
}

// CLI interface
if (require.main === module) {
  const enhancer = new PreviewEnhancer();
  enhancer.enhanceAllPosts();
}

module.exports = PreviewEnhancer; 