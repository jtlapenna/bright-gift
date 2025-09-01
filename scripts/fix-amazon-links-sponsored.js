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
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
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

    // Fix HTML Amazon links in content - change nofollow to sponsored
    const htmlAmazonPattern = /(<a[^>]*href="https:\/\/www\.amazon\.com[^"]*"[^>]*>)/g;
    let newContent = content.replace(htmlAmazonPattern, (match) => {
      if (match.includes('rel=')) {
        // Replace nofollow with sponsored
        if (match.includes('rel="nofollow"')) {
          modified = true;
          return match.replace('rel="nofollow"', 'rel="sponsored"');
        } else if (match.includes('rel="noopener nofollow"')) {
          modified = true;
          return match.replace('rel="noopener nofollow"', 'rel="noopener sponsored"');
        } else if (match.includes('rel="nofollow ')) {
          modified = true;
          return match.replace('rel="nofollow ', 'rel="sponsored ');
        }
      } else {
        // Add sponsored if no rel attribute
        modified = true;
        return match.replace('>', ' rel="sponsored">');
      }
      return match;
    });

    // Fix Markdown Amazon links in content - convert to HTML with sponsored
    const markdownAmazonPattern = /\[([^\]]*)\]\(https:\/\/www\.amazon\.com[^)]*\)/g;
    newContent = newContent.replace(markdownAmazonPattern, (match, linkText) => {
      modified = true;
      const urlMatch = match.match(/\[([^\]]*)\]\((https:\/\/www\.amazon\.com[^)]*)\)/);
      if (urlMatch) {
        const url = urlMatch[2];
        return `<a href="${url}" class="amazon-link" target="_blank" rel="sponsored">${linkText}</a>`;
      }
      return match;
    });

    // Remove Amazon links from frontmatter (they shouldn't be there)
    let newData = { ...data };
    const frontmatterKeys = Object.keys(newData);

    for (const key of frontmatterKeys) {
      const value = newData[key];
      if (typeof value === 'string' && value.includes('amazon.com')) {
        modified = true;
        delete newData[key];
        console.log(`   🗑️  Removed frontmatter key: ${key} (contained Amazon link)`);
      } else if (Array.isArray(value)) {
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
  console.log('🔧 Fixing Amazon Affiliate Links to Use rel="sponsored"');
  console.log('📁 Scanning for markdown files...');
  
  const markdownFiles = findMarkdownFiles('.');
  console.log(`📊 Found ${markdownFiles.length} markdown files`);
  
  let fixedCount = 0;
  let totalCount = markdownFiles.length;
  
  console.log('\n🔄 Processing files...\n');
  
  for (const filePath of markdownFiles) {
    const relativePath = path.relative('.', filePath);
    console.log(`📝 Processing: ${relativePath}`);
    
    if (fixAmazonLinks(filePath)) {
      fixedCount++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎯 Summary:');
  console.log(`📊 Total files processed: ${totalCount}`);
  console.log(`✅ Files modified: ${fixedCount}`);
  console.log(`⏭️  Files unchanged: ${totalCount - fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Review the changes to ensure they look correct');
    console.log('2. Test the site to make sure links still work');
    console.log('3. Re-run Ahrefs audit to check for improvement');
    console.log('4. Monitor for any remaining 503 errors');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findMarkdownFiles, fixAmazonLinks };
