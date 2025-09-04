#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🔧 Starting meta description fixer...\n');

// Find all markdown files in the blog content directory
const contentDir = path.join(__dirname, '..', 'src', 'content', 'blog');
const files = glob.sync('*.md', { cwd: contentDir });

console.log(`📁 Found ${files.length} files to process\n`);

let totalFixed = 0;
const issues = [];

// Process each file
for (const file of files) {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the description using regex
  const descriptionMatch = content.match(/description:\s*>?-?\s*\n([\s\S]*?)(?=\n[a-zA-Z])/);
  
  if (descriptionMatch) {
    // Clean up the description text
    let description = descriptionMatch[1]
      .replace(/^\s*-?\s*/gm, '') // Remove leading dashes and spaces
      .replace(/\n/g, ' ')        // Replace newlines with spaces
      .trim();
    
    console.log(`Processing: ${file}`);
    console.log(`Current description (${description.length} chars): "${description}"`);
    
    if (description.length > 160) {
      issues.push({
        file,
        description,
        length: description.length
      });
      
      // Truncate to 155 characters and add ellipsis if needed
      let newDescription = description.substring(0, 155);
      
      // Try to break at a word boundary
      const lastSpace = newDescription.lastIndexOf(' ');
      if (lastSpace > 140) {
        newDescription = newDescription.substring(0, lastSpace);
      }
      
      // Add ellipsis if we truncated
      if (newDescription.length < description.length) {
        newDescription += '...';
      }
      
      console.log(`  ✓ Fixed description (${newDescription.length} chars): "${newDescription}"`);
      
      // Replace the description in the content
      const newContent = content.replace(
        /description:\s*>?-?\s*\n[\s\S]*?(?=\n[a-zA-Z])/,
        `description: >${newDescription}\nkeywords`
      );
      
      fs.writeFileSync(filePath, newContent, 'utf8');
      totalFixed++;
      console.log(`📝 Modified: ${file}\n`);
    } else {
      console.log(`  ✅ Description length OK\n`);
    }
  } else {
    console.log(`  ⚠️  No description found in ${file}\n`);
  }
}

console.log('\n📊 Summary:');
console.log(`   Files processed: ${files.length}`);
console.log(`   Files modified: ${totalFixed}`);
console.log(`   Issues found: ${issues.length}`);

if (issues.length > 0) {
  console.log('\n🔍 Issues found:');
  issues.forEach(issue => {
    console.log(`   ${issue.file}: ${issue.length} chars`);
  });
}

console.log('\n✅ Meta description fixer complete!');
