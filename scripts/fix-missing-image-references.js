#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Function to check if an image file exists
function imageExists(imagePath) {
  const fullPath = path.join(__dirname, '..', 'public', imagePath);
  return fs.existsSync(fullPath);
}

// Function to fix missing image references
function fixMissingImageReferences(filePath) {
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
        if (!imageExists(imagePath)) {
          // Remove the field if the image doesn't exist
          delete data[field];
          modified = true;
          fixes.push(`Removed missing ${field}: ${imagePath}`);
        }
      }
    }

    if (modified) {
      const newFileContent = matter.stringify(content, data);
      fs.writeFileSync(filePath, newFileContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      fixes.forEach(fix => console.log(`   ${fix}`));
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
  console.log('🔧 Fixing Missing Image References');
  console.log('==================================\n');
  
  // List of files with missing image issues from the audit
  const filesToFix = [
    'src/content/blog/25-thoughtful-gifts-for-girlfriend-that-show-you-care.md',
    'src/content/blog/fun-gifts-for-kids-birthday-parties.md',
    'src/content/blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience.md',
    'src/content/blog/the-science-of-human-connection-why-we-need-each-other.md'
  ];
  
  let fixedCount = 0;
  
  console.log('🔄 Processing files with missing image references...\n');
  
  for (const filePath of filesToFix) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`📝 Processing: ${filePath}`);
      
      if (fixMissingImageReferences(fullPath)) {
        fixedCount++;
      }
      
      console.log(''); // Empty line for readability
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  }
  
  console.log('🎯 Summary:');
  console.log(`📊 Total files processed: ${filesToFix.length}`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Review the changes to ensure they look correct');
    console.log('2. Test the site to make sure it still works properly');
    console.log('3. Re-run Ahrefs audit to check for improvement');
    console.log('4. Consider creating the missing images if needed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixMissingImageReferences };
