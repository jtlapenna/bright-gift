#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Fixing duplicate keywords entries...\n');

// Find all markdown files in the blog content directory
const contentDir = path.join(__dirname, '..', 'src', 'content', 'blog');
const files = glob.sync('*.md', { cwd: contentDir });

console.log(`📁 Found ${files.length} files to process\n`);

let totalFixed = 0;

// Process each file
for (const file of files) {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Split content into lines
  const lines = content.split('\n');
  const newLines = [];
  let inKeywords = false;
  let keywordsFound = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a keywords line
    if (line.trim().startsWith('keywords:')) {
      if (keywordsFound) {
        // Skip this duplicate keywords entry
        console.log(`📝 Removing duplicate keywords in: ${file}`);
        totalFixed++;
        continue;
      } else {
        keywordsFound = true;
        inKeywords = true;
        newLines.push(line);
        continue;
      }
    }
    
    // If we're in keywords section and hit a non-indented line, we're done
    if (inKeywords && line.trim() && !line.startsWith(' ') && !line.startsWith('-')) {
      inKeywords = false;
    }
    
    newLines.push(line);
  }
  
  if (totalFixed > 0) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  }
}

console.log(`\n✅ Fixed duplicate keywords in ${totalFixed} files!`);
