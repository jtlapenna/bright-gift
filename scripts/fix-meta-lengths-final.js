#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(process.cwd(), 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

console.log('🔧 Fixing meta description lengths...\n');

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: body } = matter(content);
  
  if (data.description && data.description.length > 160) {
    const originalLength = data.description.length;
    
    // Truncate to ~155 characters at word boundary
    let truncated = data.description.substring(0, 155);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 140) {
      truncated = truncated.substring(0, lastSpace);
    }
    truncated += '...';
    
    data.description = truncated;
    
    const newContent = matter.stringify(body, data);
    fs.writeFileSync(filePath, newContent);
    
    console.log(`✅ ${file}: ${originalLength} → ${truncated.length} chars`);
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} meta descriptions!`);
console.log('📊 All descriptions are now ≤160 characters for optimal SEO.');
