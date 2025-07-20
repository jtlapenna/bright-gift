#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BLOG_DIR = 'src/content/blog';

// Fix malformed URLs with duplicate text
const URL_FIXES = {
  'https://bright-gift.com/blog/gifts-for-gamers-under-50-under-50-under-50': 'https://bright-gift.com/blog/gifts-for-gamers-under-50',
  'https://bright-gift.com/blog/gifts-for-gamers-under-50-under-50': 'https://bright-gift.com/blog/gifts-for-gamers-under-50',
  '/blog/gifts-for-gamers-under-50-under-50-under-50': '/blog/gifts-for-gamers-under-50',
  '/blog/gifts-for-gamers-under-50-under-50': '/blog/gifts-for-gamers-under-50'
};

// Process a single markdown file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // Fix malformed URLs
    for (const [malformedUrl, correctUrl] of Object.entries(URL_FIXES)) {
      const urlRegex = new RegExp(malformedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (urlRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(urlRegex, correctUrl);
        hasChanges = true;
        console.log(`📝 ${path.basename(filePath)}: Fixed malformed URL: ${malformedUrl} → ${correctUrl}`);
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ ${path.basename(filePath)}: Updated`);
    } else {
      console.log(`✅ ${path.basename(filePath)}: No malformed URLs found`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔧 Fixing malformed URLs...\n');

const files = fs.readdirSync(BLOG_DIR)
  .filter(file => file.endsWith('.md'))
  .map(file => path.join(BLOG_DIR, file));

let processedCount = 0;

for (const file of files) {
  processFile(file);
  processedCount++;
}

console.log(`\n📊 Summary:`);
console.log(`   Processed: ${processedCount} files`);
console.log(`   Fixed: ${Object.keys(URL_FIXES).length} malformed URL patterns`); 