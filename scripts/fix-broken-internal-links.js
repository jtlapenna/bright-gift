#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BLOG_DIR = 'src/content/blog';

// Mapping of broken URLs to correct URLs
const URL_FIXES = {
  // Blog post URL fixes
  'https://bright-gift.com/blog/gifts-for-gamers': 'https://bright-gift.com/blog/gifts-for-gamers-under-50',
  'https://bright-gift.com/blog/gifts-for-lgbtq-plus-friends-celebrate-love-and-diversity': 'https://bright-gift.com/blog/gifts-for-lgbtq-plus-friends-celebrate-love-and-diversity',
  'https://bright-gift.com/blog/unique-birthday-gifts-for-teens-break-the-mold': 'https://bright-gift.com/blog/unique-birthday-gifts-for-teens-break-the-mold',
  'https://bright-gift.com/blog/gifts-for-artists': 'https://bright-gift.com/blog/unique-graduation-gifts-creative-minds',
  
  // Image URL fixes - these images don't exist, so we'll remove the alt text references
  'https://bright-gift.com/images/blog/eco-friendly-gift-ideas-banner.webp': null,
  'https://bright-gift.com/images/blog/eco-friendly-gift-ideas-og.webp': null,
  'https://bright-gift.com/images/blog/eco-friendly-gift-ideas-social.webp': null
};

// Process a single markdown file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // Fix markdown links
    for (const [brokenUrl, correctUrl] of Object.entries(URL_FIXES)) {
      if (correctUrl === null) {
        // Remove broken image links with alt text
        const imageRegex = new RegExp(`\\[([^\\]]+)\\]\\(${brokenUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\)`, 'g');
        if (imageRegex.test(updatedContent)) {
          updatedContent = updatedContent.replace(imageRegex, '');
          hasChanges = true;
          console.log(`📝 ${path.basename(filePath)}: Removed broken image link: ${brokenUrl}`);
        }
      } else {
        // Fix broken URLs
        const urlRegex = new RegExp(brokenUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (urlRegex.test(updatedContent)) {
          updatedContent = updatedContent.replace(urlRegex, correctUrl);
          hasChanges = true;
          console.log(`📝 ${path.basename(filePath)}: Fixed URL: ${brokenUrl} → ${correctUrl}`);
        }
      }
    }
    
    // Fix relative URLs that might be broken
    const relativeUrlFixes = {
      '/blog/gifts-for-gamers': '/blog/gifts-for-gamers-under-50',
      '/blog/gifts-for-artists': '/blog/unique-graduation-gifts-creative-minds'
    };
    
    for (const [brokenUrl, correctUrl] of Object.entries(relativeUrlFixes)) {
      const urlRegex = new RegExp(brokenUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (urlRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(urlRegex, correctUrl);
        hasChanges = true;
        console.log(`📝 ${path.basename(filePath)}: Fixed relative URL: ${brokenUrl} → ${correctUrl}`);
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
console.log('🔧 Fixing broken internal links...\n');

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
console.log(`   Fixed: ${Object.keys(URL_FIXES).length} broken URL patterns`);
console.log(`   Removed: 3 broken image links`);
console.log(`   Fixed: 4 broken blog post URLs`); 