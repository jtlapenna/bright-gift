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

// Function to fix Amazon links in a file (both HTML and Markdown)
function fixAmazonLinks(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix HTML Amazon links
    const htmlAmazonPattern = /(<a[^>]*href="https:\/\/www\.amazon\.com[^"]*"[^>]*>)/g;
    content = content.replace(htmlAmazonPattern, (match) => {
      if (!match.includes('rel=')) {
        modified = true;
        return match.replace('>', ' rel="noopener nofollow">');
      } else if (!match.includes('nofollow')) {
        modified = true;
        return match.replace('rel="', 'rel="nofollow ').replace('rel="nofollow ', 'rel="nofollow ');
      }
      return match;
    });
    
    // Fix Markdown Amazon links - convert to HTML with nofollow
    const markdownAmazonPattern = /\[([^\]]*)\]\(https:\/\/www\.amazon\.com[^)]*\)/g;
    content = content.replace(markdownAmazonPattern, (match, linkText) => {
      modified = true;
      // Extract the URL from the markdown link
      const urlMatch = match.match(/\[([^\]]*)\]\((https:\/\/www\.amazon\.com[^)]*)\)/);
      if (urlMatch) {
        const url = urlMatch[2];
        return `<a href="${url}" class="amazon-link" target="_blank" rel="noopener nofollow">${linkText}</a>`;
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
  console.log('\n📋 Strategy:');
  console.log(`   - Fix HTML Amazon links (add nofollow)`);
  console.log(`   - Convert Markdown Amazon links to HTML with nofollow`);
  console.log(`   - Target: All amazon.com links`);
  
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
    console.log('   2. Build and deploy');
    console.log('   3. Monitor Ahrefs for improvement');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { findMarkdownFiles, fixAmazonLinks };
