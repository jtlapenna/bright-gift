#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Fixing YAML syntax errors from meta description script...\n');

// Find all markdown files in the blog content directory
const contentDir = path.join(__dirname, '..', 'src', 'content', 'blog');
const files = glob.sync('*.md', { cwd: contentDir });

console.log(`📁 Found ${files.length} files to process\n`);

let totalFixed = 0;

// Process each file
for (const file of files) {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  let newContent = content;
  let fileModified = false;
  
  // Fix the broken YAML syntax patterns
  // Pattern 1: description: >Text without newline
  newContent = newContent.replace(
    /description: >([^\n]+)/g,
    (match, text) => {
      fileModified = true;
      return `description: >-\n  ${text}`;
    }
  );
  
  // Pattern 2: keywords without colon
  newContent = newContent.replace(
    /^keywords$/gm,
    () => {
      fileModified = true;
      return 'keywords:';
    }
  );
  
  if (fileModified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`📝 Fixed YAML syntax in: ${file}`);
    totalFixed++;
  }
}

console.log(`\n✅ Fixed YAML syntax in ${totalFixed} files!`);
