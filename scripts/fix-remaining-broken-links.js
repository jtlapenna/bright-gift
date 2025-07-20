#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BLOG_DIR = 'src/content/blog';

// Mapping of broken URLs to working alternatives or removal
const BROKEN_LINK_FIXES = {
  // These blog posts don't exist, so we'll remove the links or replace with working alternatives
  '/blog/gifts-for-lgbtq-plus-friends-celebrate-love-and-diversity': null, // Remove - post doesn't exist
  '/blog/unique-birthday-gifts-for-teens-break-the-mold': null, // Remove - post doesn't exist
  'https://bright-gift.com/blog/gifts-for-lgbtq-plus-friends-celebrate-love-and-diversity': null,
  'https://bright-gift.com/blog/unique-birthday-gifts-for-teens-break-the-mold': null
};

// Process a single markdown file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // Fix broken links
    for (const [brokenUrl, replacement] of Object.entries(BROKEN_LINK_FIXES)) {
      if (replacement === null) {
        // Remove broken links completely
        const linkRegex = new RegExp(`\\[([^\\]]+)\\]\\(${brokenUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\)`, 'g');
        if (linkRegex.test(updatedContent)) {
          updatedContent = updatedContent.replace(linkRegex, '');
          hasChanges = true;
          console.log(`📝 ${path.basename(filePath)}: Removed broken link: ${brokenUrl}`);
        }
      } else {
        // Replace with working alternative
        const linkRegex = new RegExp(brokenUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (linkRegex.test(updatedContent)) {
          updatedContent = updatedContent.replace(linkRegex, replacement);
          hasChanges = true;
          console.log(`📝 ${path.basename(filePath)}: Fixed link: ${brokenUrl} → ${replacement}`);
        }
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ ${path.basename(filePath)}: Updated`);
    } else {
      console.log(`✅ ${path.basename(filePath)}: No broken links found`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔧 Fixing remaining broken internal links...\n');

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
console.log(`   Fixed: ${Object.keys(BROKEN_LINK_FIXES).length} broken link patterns`);
console.log(`   Removed: Links to non-existent blog posts`); 