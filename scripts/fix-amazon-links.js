#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all markdown files
function findMarkdownFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findMarkdownFiles(fullPath, files);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix Amazon links in a file
function fixAmazonLinks(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern to match Amazon links that don't have nofollow
    const amazonLinkPattern = /(<a[^>]*href="https:\/\/www\.amazon\.com[^"]*"[^>]*rel="[^"]*noopener[^"]*"[^>]*>)/g;
    
    // Replace links that don't have nofollow
    content = content.replace(amazonLinkPattern, (match) => {
      if (!match.includes('nofollow')) {
        modified = true;
        return match.replace('rel="noopener"', 'rel="noopener nofollow"');
      }
      return match;
    });
    
    // Also fix links that have no rel attribute at all
    const noRelPattern = /(<a[^>]*href="https:\/\/www\.amazon\.com[^"]*"[^>]*>)/g;
    content = content.replace(noRelPattern, (match) => {
      if (!match.includes('rel=')) {
        modified = true;
        return match.replace('>', ' rel="noopener nofollow">');
      }
      return match;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔍 Finding all markdown files...');
  
  const contentDir = path.join(__dirname, '../src/content');
  const markdownFiles = findMarkdownFiles(contentDir);
  
  console.log(`📁 Found ${markdownFiles.length} markdown files`);
  
  let fixedCount = 0;
  let totalCount = 0;
  
  for (const file of markdownFiles) {
    totalCount++;
    if (fixAmazonLinks(file)) {
      fixedCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Total files processed: ${totalCount}`);
  console.log(`   Files modified: ${fixedCount}`);
  console.log(`   Files unchanged: ${totalCount - fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n🎯 Next steps:');
    console.log('   1. Review the changes');
    console.log('   2. Commit and deploy');
    console.log('   3. Wait for Ahrefs to re-crawl');
    console.log('   4. Monitor health score improvement');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { findMarkdownFiles, fixAmazonLinks };
