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

// Function to check if an image file exists
function imageExists(imagePath) {
  const fullPath = path.join(__dirname, '..', 'public', imagePath);
  return fs.existsSync(fullPath);
}

// Function to fix all JPG references
function fixJpgReferences(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    let modified = false;
    const fixes = [];

    // Check frontmatter image references
    const imageFields = ['image', 'ogImage', 'socialImage', 'imageJpg', 'ogImageJpg'];
    
    for (const field of imageFields) {
      if (data[field]) {
        const imagePath = data[field];
        if (imagePath.endsWith('.jpg')) {
          // Try to find a .webp alternative
          const webpPath = imagePath.replace('.jpg', '.webp');
          if (imageExists(webpPath)) {
            data[field] = webpPath;
            modified = true;
            fixes.push(`Fixed ${field}: ${imagePath} → ${webpPath}`);
          } else {
            // Remove the field if no alternative exists
            delete data[field];
            modified = true;
            fixes.push(`Removed missing ${field}: ${imagePath}`);
          }
        }
      }
    }

    // Check content for JPG image references
    let newContent = content;
    
    // Fix HTML img tags
    const imgRegex = /<img[^>]+src="([^"]*\.jpg)"[^>]*>/g;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      const jpgPath = match[1];
      const webpPath = jpgPath.replace('.jpg', '.webp');
      if (imageExists(webpPath)) {
        newContent = newContent.replace(jpgPath, webpPath);
        modified = true;
        fixes.push(`Fixed HTML img: ${jpgPath} → ${webpPath}`);
      } else {
        fixes.push(`Warning: No WebP alternative for ${jpgPath}`);
      }
    }

    // Fix markdown image syntax
    const markdownImgRegex = /!\[([^\]]*)\]\(([^)]*\.jpg)\)/g;
    while ((match = markdownImgRegex.exec(content)) !== null) {
      const jpgPath = match[2];
      const webpPath = jpgPath.replace('.jpg', '.webp');
      if (imageExists(webpPath)) {
        newContent = newContent.replace(jpgPath, webpPath);
        modified = true;
        fixes.push(`Fixed markdown img: ${jpgPath} → ${webpPath}`);
      } else {
        fixes.push(`Warning: No WebP alternative for ${jpgPath}`);
      }
    }

    if (modified) {
      const newFileContent = matter.stringify(newContent, data);
      fs.writeFileSync(filePath, newFileContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      fixes.forEach(fix => console.log(`   ${fix}`));
      return true;
    } else if (fixes.length > 0) {
      console.log(`⚠️  Warnings: ${filePath}`);
      fixes.forEach(fix => console.log(`   ${fix}`));
      return false;
    } else {
      console.log(`✅ Clean: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔧 Fix All JPG References Tool');
  console.log('==============================\n');
  
  console.log('📁 Scanning for blog markdown files...');
  const markdownFiles = findMarkdownFiles(path.join(__dirname, '..', 'src', 'content', 'blog'));
  console.log(`📊 Found ${markdownFiles.length} blog files\n`);
  
  let fixedCount = 0;
  let warningCount = 0;
  
  console.log('🔄 Processing files...\n');
  
  for (const filePath of markdownFiles) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`📝 Processing: ${relativePath}`);
    
    const result = fixJpgReferences(filePath);
    
    if (result) {
      fixedCount++;
    } else if (result === false) {
      warningCount++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎯 Summary:');
  console.log(`📊 Total files processed: ${markdownFiles.length}`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`⚠️  Files with warnings: ${warningCount}`);
  
  if (fixedCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Review the changes to ensure they look correct');
    console.log('2. Test the site to make sure images display properly');
    console.log('3. Re-run Ahrefs audit to check for improvement');
    console.log('4. Consider removing unused JPG files from the repository');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findMarkdownFiles, fixJpgReferences };
