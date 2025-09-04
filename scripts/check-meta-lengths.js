#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = path.join(process.cwd(), 'src/content/blog');
const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

console.log('🔍 Checking meta description lengths...\n');

const longDescriptions = [];

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);
  
  if (data.description) {
    const length = data.description.length;
    if (length > 160) {
      longDescriptions.push({
        file,
        length,
        description: data.description.substring(0, 100) + '...'
      });
    }
  }
});

if (longDescriptions.length > 0) {
  console.log(`❌ Found ${longDescriptions.length} meta descriptions that are too long (>160 chars):\n`);
  longDescriptions.forEach(({ file, length, description }) => {
    console.log(`📄 ${file}`);
    console.log(`   Length: ${length} chars`);
    console.log(`   Preview: ${description}\n`);
  });
} else {
  console.log('✅ All meta descriptions are within optimal length (≤160 chars)');
}

console.log(`\n📊 Summary:`);
console.log(`- Total files checked: ${files.length}`);
console.log(`- Long descriptions: ${longDescriptions.length}`);
console.log(`- Optimal descriptions: ${files.length - longDescriptions.length}`);
