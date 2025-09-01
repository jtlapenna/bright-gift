#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Function to recursively find all markdown files
function findMarkdownFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findMarkdownFiles(fullPath, files);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix Amazon links in a file (content + frontmatter)
function fixAmazonLinks(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    let modified = false;
    
    // Fix HTML Amazon links in content
    const htmlAmazonPattern = /(<a[^>]*href="https:\/\/www\.amazon\.com[^"]*"[^>]*>)/g;
    let newContent = content.replace(htmlAmazonPattern, (match) => {
      if (!match.includes('rel=')) {
        modified = true;
        return match.replace('>', ' rel="noopener nofollow">');
      } else if (!match.includes('nofollow')) {
        modified = true;
        return match.replace('rel="', 'rel="nofollow ').replace('rel="nofollow ', 'rel="nofollow ');
      }
      return match;
    });
    
    // Fix Markdown Amazon links in content
    const markdownAmazonPattern = /\[([^\]]*)\]\(https:\/\/www\.amazon\.com[^)]*\)/g;
    newContent = newContent.replace(markdownAmazonPattern, (match, linkText) => {
      modified = true;
      const urlMatch = match.match(/\[([^\]]*)\]\((https:\/\/www\.amazon\.com[^)]*)\)/);
      if (urlMatch) {
        const url = urlMatch[2];
        return `<a href="${url}" class="amazon-link" target="_blank" rel="noopener nofollow">${linkText}</a>`;
      }
      return match;
    });
    
    // Fix Amazon links in frontmatter
    let newData = { ...data };
    const frontmatterKeys = Object.keys(newData);
    
    for (const key of frontmatterKeys) {
      const value = newData[key];
      if (typeof value === 'string' && value.includes('amazon.com')) {
        // Remove Amazon links from frontmatter
        modified = true;
        delete newData[key];
        console.log(`   🗑️  Removed frontmatter key: ${key} (contained Amazon link)`);
      } else if (Array.isArray(value)) {
        // Handle arrays that might contain Amazon links
        const newArray = value.filter(item => {
          if (typeof item === 'string' && item.includes('amazon.com')) {
            modified = true;
            console.log(`   🗑️  Removed array item: ${item} (Amazon link)`);
            return false;
          }
          return true;
        });
        if (newArray.length !== value.length) {
          newData[key] = newArray;
        }
      }
    }
    
    if (modified) {
      // Reconstruct the file with matter
      const newFileContent = matter.stringify(newContent, newData);
      fs.writeFileSync(filePath, newFileContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔍 Finding all markdown files...');
  
  const contentDir = path.join(__dirname, '../src/content');
  const markdownFiles = findMarkdownFiles(contentDir);
  
  console.log(`📁 Found ${markdownFiles.length} markdown files`);
  console.log('\n📋 Strategy:');
  console.log(`   - Fix HTML Amazon links (add nofollow)`);
  console.log(`   - Convert Markdown Amazon links to HTML with nofollow`);
  console.log(`   - Remove Amazon links from frontmatter (YAML metadata)`);
  console.log(`   - Target: ALL amazon.com references`);
  
  let fixedCount = 0;
  let totalCount = 0;
  
  for (const file of markdownFiles) {
    totalCount++;
    if (fixAmazonLinks(file)) {
      fixedCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Total files processed: ${totalCount}`);
  console.log(`   Files modified: ${fixedCount}`);
  console.log(`   Files unchanged: ${totalCount - fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n🎯 Next steps:');
    console.log('   1. Review the changes');
    console.log('   2. Build and deploy');
    console.log('   3. Monitor Ahrefs for improvement');
    console.log('   4. Verify no Amazon links remain in frontmatter');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { findMarkdownFiles, fixAmazonLinks };
