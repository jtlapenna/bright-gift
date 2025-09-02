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

// Function to remove all Amazon links from a file
function removeAmazonLinks(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    let modified = false;
    const changes = [];

    // Remove Amazon links from frontmatter
    const imageFields = ['image', 'ogImage', 'socialImage', 'imageJpg', 'ogImageJpg'];
    
    for (const field of imageFields) {
      if (data[field] && data[field].includes('amazon.com')) {
        delete data[field];
        modified = true;
        changes.push(`Removed Amazon link from ${field}`);
      }
    }

    // Remove Amazon links from content
    let newContent = content;
    
    // Remove HTML Amazon links
    const amazonHtmlRegex = /<a[^>]*href="https:\/\/www\.amazon\.com[^"]*"[^>]*>([^<]*)<\/a>/g;
    const htmlMatches = newContent.match(amazonHtmlRegex);
    if (htmlMatches) {
      newContent = newContent.replace(amazonHtmlRegex, (match, linkText) => {
        modified = true;
        changes.push(`Removed Amazon HTML link: ${linkText}`);
        return linkText; // Keep just the text, remove the link
      });
    }

    // Remove markdown Amazon links
    const amazonMarkdownRegex = /\[([^\]]*)\]\(https:\/\/www\.amazon\.com[^)]*\)/g;
    const markdownMatches = newContent.match(amazonMarkdownRegex);
    if (markdownMatches) {
      newContent = newContent.replace(amazonMarkdownRegex, (match, linkText) => {
        modified = true;
        changes.push(`Removed Amazon markdown link: ${linkText}`);
        return linkText; // Keep just the text, remove the link
      });
    }

    // Remove any remaining Amazon URLs
    const amazonUrlRegex = /https:\/\/www\.amazon\.com[^\s\)]*/g;
    const urlMatches = newContent.match(amazonUrlRegex);
    if (urlMatches) {
      newContent = newContent.replace(amazonUrlRegex, (url) => {
        modified = true;
        changes.push(`Removed Amazon URL: ${url}`);
        return ''; // Remove the URL completely
      });
    }

    if (modified) {
      const newFileContent = matter.stringify(newContent, data);
      fs.writeFileSync(filePath, newFileContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      changes.forEach(change => console.log(`   ${change}`));
      return { fixed: true, changes };
    } else {
      console.log(`✅ Clean: ${filePath}`);
      return { fixed: false, changes: [] };
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { fixed: false, changes: [`Error: ${error.message}`] };
  }
}

// Main execution
function main() {
  console.log('🔧 Remove All Amazon Links Tool');
  console.log('===============================\n');
  
  console.log('📁 Scanning for blog markdown files...');
  const markdownFiles = findMarkdownFiles(path.join(__dirname, '..', 'src', 'content', 'blog'));
  console.log(`📊 Found ${markdownFiles.length} blog files\n`);
  
  let fixedCount = 0;
  let totalChanges = 0;
  
  console.log('🔄 Processing files...\n');
  
  for (const filePath of markdownFiles) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`📝 Processing: ${relativePath}`);
    
    const result = removeAmazonLinks(filePath);
    
    if (result.fixed) {
      fixedCount++;
      totalChanges += result.changes.length;
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎯 Summary:');
  console.log(`📊 Total files processed: ${markdownFiles.length}`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`🔧 Total changes made: ${totalChanges}`);
  
  if (fixedCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Review the changes to ensure they look correct');
    console.log('2. Test the site to make sure it still works properly');
    console.log('3. Re-run Ahrefs audit to check for improvement');
    console.log('4. Consider alternative affiliate strategies if needed');
    console.log('\n⚠️  Note: This removes ALL Amazon links to eliminate 503 errors');
    console.log('   You may want to implement a different affiliate strategy');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findMarkdownFiles, removeAmazonLinks };
