#!/usr/bin/env node

/**
 * Add Canonical URLs Script
 * Adds explicit canonical URLs to all blog posts that don't have them
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

console.log('🔗 Adding canonical URLs to blog posts...\n');

const blogDir = path.join(__dirname, '../src/content/blog');
const files = fs.readdirSync(blogDir);
let processed = 0;
let added = 0;

for (const file of files) {
  if (file.endsWith('.md')) {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: body } = matter(content);
    
    // Skip if already has canonical URL
    if (data.canonical) {
      console.log(`⏭️  Skipping ${file} - already has canonical URL`);
      processed++;
      continue;
    }
    
    // Generate canonical URL
    const slug = data.slug || file.replace('.md', '');
    const canonicalUrl = `https://bright-gift.com/blog/${slug}`;
    
    // Add canonical URL to frontmatter
    data.canonical = canonicalUrl;
    
    // Reconstruct the file
    const newContent = matter.stringify(body, data);
    
    // Write back to file
    fs.writeFileSync(filePath, newContent);
    
    console.log(`✅ Added canonical URL to ${file}: ${canonicalUrl}`);
    added++;
    processed++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Total files processed: ${processed}`);
console.log(`   Canonical URLs added: ${added}`);
console.log(`   Files already had canonical: ${processed - added}`);
console.log('\n🎉 Canonical URL addition complete!');
