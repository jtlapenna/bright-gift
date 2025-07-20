const fs = require('fs');
const path = require('path');

// Image mapping from original to WebP
const imageMapping = {
  'eco-banner.png': 'eco-banner.webp',
  'eco-og.png': 'eco-og.webp',
  'eco-social.png': 'eco-social.webp',
  'plant-lovers-under-75.png': 'plant-lovers-under-75.webp',
  'blog-gifts-under-25-for-coworkers-banner.jpg': 'blog-gifts-under-25-for-coworkers-banner.webp',
  'wfh-under-50-OG.png': 'wfh-under-50-OG.webp',
  'wfh-under-50-banner.png': 'wfh-under-50-banner.webp',
  'wfh-under-50-social.png': 'wfh-under-50-social.webp'
};

function updateImageReferences() {
  console.log('🖼️  UPDATING IMAGE REFERENCES TO WEBP\n');
  
  const blogDir = 'src/content/blog';
  const files = fs.readdirSync(blogDir);
  
  let updatedFiles = 0;
  let totalReplacements = 0;
  
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(blogDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let fileUpdated = false;
      
      // Check for image references in frontmatter
      Object.entries(imageMapping).forEach(([oldImage, newImage]) => {
        const oldPattern = new RegExp(`(${oldImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
        if (oldPattern.test(content)) {
          content = content.replace(oldPattern, newImage);
          fileUpdated = true;
          totalReplacements++;
          console.log(`✅ ${file}: ${oldImage} → ${newImage}`);
        }
      });
      
      if (fileUpdated) {
        fs.writeFileSync(filePath, content);
        updatedFiles++;
      }
    }
  });
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Files Updated: ${updatedFiles}`);
  console.log(`   Total Replacements: ${totalReplacements}`);
  
  if (updatedFiles > 0) {
    console.log(`\n✅ Successfully updated ${updatedFiles} blog posts!`);
    console.log(`💡 Next steps:`);
    console.log(`   1. Test blog posts to ensure images load correctly`);
    console.log(`   2. Verify WebP compatibility in target browsers`);
    console.log(`   3. Monitor page load performance improvements`);
  } else {
    console.log(`\n⏭️  No image references found to update.`);
  }
}

// Run the script
updateImageReferences(); 