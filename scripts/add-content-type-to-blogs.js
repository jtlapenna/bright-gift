#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Content type classification rules
const contentTypeRules = {
  'gift-guide': [
    'gifts-for-',
    'best-gifts-for-',
    'unique-gifts-for-',
    'affordable-gifts-for-',
    'top-gifts-for-',
    'special-gifts-for-',
    '25-amazing-gifts-from-black-owned-businesses-under-75',
    '25-thoughtful-housewarming-gifts-for-new-homeowners-under-75',
    '20-ethical-gift-ideas-for-eco-conscious-loved-ones-under-75',
    'eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature',
    '25-books-to-gift-this-holiday-season',
    'best-books-for-different-reading-levels',
    'top-gifts-for-yoga-enthusiasts-beginners-to-advanced-practitioners',
    'gifts-for-new-homeowners-2025',
    'gifts-for-girlfriend-unique-romantic-ideas',
    'unique-graduation-gifts-creative-minds',
    'gifts-for-book-lovers-under-50',
    'last-minute-birthday-gifts-for-busy-professionals',
    'fun-gifts-for-kids-birthday-parties',
    'gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience',
    'chic-wedding-gifts-for-the-stylish-couple',
    'best-home-gifts-on-amazon-2024',
    'unique-gifts-for-board-game-enthusiasts',
    'best-gifts-for-dads-who-love-outdoor-adventures',
    'affordable-gifts-for-pet-lovers-under-30',
    'special-birthday-gifts-for-lgbtq-youth',
    'eco-friendly-gift-ideas-for-every-budget',
    '25-unique-anniversary-gift-ideas-under-50'
  ],
  'educational': [
    'how-to-choose-the-perfect-gift-complete-guide',
    'how-ai-is-revolutionizing-gift-shopping-complete-guide'
  ],
  'data-driven': [
    'gift-giving-statistics-what-people-really-want'
  ]
};

function determineContentType(filename) {
  const slug = filename.replace('.md', '');
  
  // Check data-driven first (most specific)
  if (contentTypeRules['data-driven'].includes(slug)) {
    return 'data-driven';
  }
  
  // Check educational
  if (contentTypeRules['educational'].includes(slug)) {
    return 'educational';
  }
  
  // Check gift-guide patterns
  for (const pattern of contentTypeRules['gift-guide']) {
    if (slug.includes(pattern) || slug === pattern) {
      return 'gift-guide';
    }
  }
  
  // Default to gift-guide for any remaining files
  return 'gift-guide';
}

function addContentTypeToFrontmatter(filePath, contentType) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if contentType already exists
  if (content.includes('contentType:')) {
    console.log(`⚠️  ${path.basename(filePath)} already has contentType field`);
    return false;
  }
  
  // Find the end of frontmatter (---)
  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    console.log(`❌ ${path.basename(filePath)} has invalid frontmatter`);
    return false;
  }
  
  // Insert contentType before the closing ---
  const beforeClosing = content.substring(0, frontmatterEnd);
  const afterClosing = content.substring(frontmatterEnd);
  
  const newContent = beforeClosing + `contentType: "${contentType}"\n` + afterClosing;
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  return true;
}

function main() {
  const blogDir = path.join(__dirname, '..', 'src', 'content', 'blog');
  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  
  console.log('🎯 Adding contentType to blog posts...\n');
  
  let updated = 0;
  let skipped = 0;
  
  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const contentType = determineContentType(file);
    
    console.log(`📝 ${file} → ${contentType}`);
    
    if (addContentTypeToFrontmatter(filePath, contentType)) {
      updated++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\n✅ Updated: ${updated} files`);
  console.log(`⏭️  Skipped: ${skipped} files (already had contentType)`);
  console.log(`\n🎉 Content type classification complete!`);
}

if (require.main === module) {
  main();
}

module.exports = { determineContentType, addContentTypeToFrontmatter }; 