#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const BLOG_DIR = 'src/content/blog';
const MAX_DESCRIPTION_LENGTH = 160;
const MAX_TITLE_LENGTH = 60;

// Helper function to truncate text at word boundary
function truncateAtWord(text, maxLength) {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

// Process a single markdown file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let inFrontmatter = false;
    let frontmatterLines = [];
    let contentLines = [];
    let hasChanges = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
          frontmatterLines.push(line);
        } else {
          inFrontmatter = false;
          frontmatterLines.push(line);
          contentLines = lines.slice(i + 1);
          break;
        }
      } else if (inFrontmatter) {
        frontmatterLines.push(line);
      }
    }
    
    if (frontmatterLines.length < 3) {
      console.log(`⚠️  Skipping ${path.basename(filePath)}: No valid frontmatter`);
      return;
    }
    
    // Parse YAML frontmatter
    const frontmatterText = frontmatterLines.slice(1, -1).join('\n');
    const frontmatter = yaml.load(frontmatterText);
    
    // Check and fix description
    if (frontmatter.description && frontmatter.description.length > MAX_DESCRIPTION_LENGTH) {
      const original = frontmatter.description;
      frontmatter.description = truncateAtWord(frontmatter.description, MAX_DESCRIPTION_LENGTH);
      console.log(`📝 ${path.basename(filePath)}: Description trimmed from ${original.length} to ${frontmatter.description.length} chars`);
      hasChanges = true;
    }
    
    // Check and fix title
    if (frontmatter.title && frontmatter.title.length > MAX_TITLE_LENGTH) {
      const original = frontmatter.title;
      frontmatter.title = truncateAtWord(frontmatter.title, MAX_TITLE_LENGTH);
      console.log(`📝 ${path.basename(filePath)}: Title trimmed from ${original.length} to ${frontmatter.title.length} chars`);
      hasChanges = true;
    }
    
    // Write back if changes were made
    if (hasChanges) {
      const newFrontmatter = yaml.dump(frontmatter, { lineWidth: 1000 });
      const newContent = `---\n${newFrontmatter}---\n${contentLines.join('\n')}`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ ${path.basename(filePath)}: Updated`);
    } else {
      console.log(`✅ ${path.basename(filePath)}: No changes needed`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔧 Fixing meta description and title lengths...\n');

const files = fs.readdirSync(BLOG_DIR)
  .filter(file => file.endsWith('.md'))
  .map(file => path.join(BLOG_DIR, file));

let processedCount = 0;
let updatedCount = 0;

for (const file of files) {
  processFile(file);
  processedCount++;
}

console.log(`\n📊 Summary:`);
console.log(`   Processed: ${processedCount} files`);
console.log(`   Meta descriptions: Max ${MAX_DESCRIPTION_LENGTH} characters`);
console.log(`   Titles: Max ${MAX_TITLE_LENGTH} characters`); 