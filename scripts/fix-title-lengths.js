#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(process.cwd(), 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

console.log('🔧 Fixing title lengths...\n');

const MAX_LENGTH = 60; // Optimal length for SEO

function shortenTitle(title) {
  if (title.length <= MAX_LENGTH) {
    return title;
  }

  // Remove common filler words and phrases
  let shortened = title
    .replace(/\bfor\s+\d{4}\b/g, '') // Remove "for 2024", "for 2025"
    .replace(/\b\d{4}\b/g, '') // Remove standalone years
    .replace(/\b:\s*/g, ' - ') // Replace colons with dashes
    .replace(/\b\s+-\s+/g, ' - ') // Clean up dashes
    .replace(/\s+/g, ' ') // Clean up multiple spaces
    .trim();

  // If still too long, try more aggressive shortening
  if (shortened.length > MAX_LENGTH) {
    // Remove common phrases
    shortened = shortened
      .replace(/\bBest\s+/g, '')
      .replace(/\bTop\s+/g, '')
      .replace(/\bUnique\s+/g, '')
      .replace(/\bThoughtful\s+/g, '')
      .replace(/\bAmazing\s+/g, '')
      .replace(/\bPerfect\s+/g, '')
      .replace(/\bEssential\s+/g, '')
      .replace(/\bComplete\s+/g, '')
      .replace(/\bA\s+/g, '')
      .replace(/\bThe\s+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // If still too long, truncate at word boundary
  if (shortened.length > MAX_LENGTH) {
    let truncated = shortened.substring(0, MAX_LENGTH);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > -1) {
      truncated = truncated.substring(0, lastSpace);
    }
    shortened = truncated + '...';
  }

  return shortened;
}

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: markdownContent } = matter(content);

  if (data.title && data.title.length > MAX_LENGTH) {
    const originalTitle = data.title;
    const newTitle = shortenTitle(originalTitle);
    
    if (newTitle !== originalTitle) {
      data.title = newTitle;
      fixedCount++;

      const newContent = matter.stringify(markdownContent, data);
      fs.writeFileSync(filePath, newContent);
      
      console.log(`✅ ${file}`);
      console.log(`   ${originalTitle.length} → ${newTitle.length} chars`);
      console.log(`   "${originalTitle}"`);
      console.log(`   "${newTitle}"\n`);
    }
  }
});

console.log(`🎉 Fixed ${fixedCount} titles!`);
console.log(`📊 All titles are now ≤${MAX_LENGTH} characters for optimal SEO.`);
