#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define which domains should get nofollow
const NOFOLLOW_DOMAINS = [
  'amazon.com',
  'amazon.co.uk',
  'amazon.ca',
  'amazon.de',
  'amazon.fr',
  'amazon.it',
  'amazon.es',
  'amazon.co.jp',
  'amazon.in',
  'amazon.com.au',
  'amazon.com.br',
  'amazon.com.mx'
];

// Define domains that should keep dofollow (trusted partners)
const DOFOLLOW_DOMAINS = [
  'bookshop.org',
  'etsy.com',
  'uncommongoods.com',
  'anthropologie.com',
  'westelm.com',
  'cb2.com',
  'crateandbarrel.com'
];

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

// Function to determine if a link should be nofollow
function shouldBeNofollow(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    // Check if it's a nofollow domain
    if (NOFOLLOW_DOMAINS.some(d => domain.includes(d))) {
      return true;
    }
    
    // Check if it's a dofollow domain
    if (DOFOLLOW_DOMAINS.some(d => domain.includes(d))) {
      return false;
    }
    
    // Default: nofollow for external links (conservative approach)
    return true;
  } catch (error) {
    // If URL parsing fails, default to nofollow
    return true;
  }
}

// Function to fix affiliate links in a file
function fixAffiliateLinks(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern to match external links
    const externalLinkPattern = /<a([^>]*href="(https?:\/\/[^"]*)"[^>]*)>/g;
    
    content = content.replace(externalLinkPattern, (match, beforeHref, url) => {
      if (shouldBeNofollow(url)) {
        // Check if nofollow is already present
        if (!match.includes('rel=')) {
          modified = true;
          return `<a${beforeHref} rel="noopener nofollow">`;
        } else if (!match.includes('nofollow')) {
          modified = true;
          return match.replace('rel="', 'rel="nofollow ').replace('rel="nofollow ', 'rel="nofollow ');
        }
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
  console.log(`   Nofollow domains: ${NOFOLLOW_DOMAINS.join(', ')}`);
  console.log(`   Dofollow domains: ${DOFOLLOW_DOMAINS.join(', ')}`);
  console.log(`   Default: nofollow for external links (conservative)`);
  
  let fixedCount = 0;
  let totalCount = 0;
  
  for (const file of markdownFiles) {
    totalCount++;
    if (fixAffiliateLinks(file)) {
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
    console.log('   3. Monitor Ahrefs health score improvement');
    console.log('   4. Check that affiliate functionality still works');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { findMarkdownFiles, fixAffiliateLinks, shouldBeNofollow };
