#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(process.cwd(), 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

console.log('🔍 Checking title lengths...\n');

const longTitles = [];

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);
  
  if (data.title) {
    const length = data.title.length;
    if (length > 60) {
      longTitles.push({
        file,
        length,
        title: data.title
      });
    }
  }
});

if (longTitles.length > 0) {
  console.log(`❌ Found ${longTitles.length} titles that are too long (>60 chars):\n`);
  longTitles.forEach(({ file, length, title }) => {
    console.log(`📄 ${file}`);
    console.log(`   Length: ${length} chars`);
    console.log(`   Title: ${title}\n`);
  });
} else {
  console.log('✅ All titles are within optimal length (≤60 chars)');
}

console.log(`\n📊 Summary:`);
console.log(`- Total files checked: ${files.length}`);
console.log(`- Long titles: ${longTitles.length}`);
console.log(`- Optimal titles: ${files.length - longTitles.length}`);
