const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeBlogImages() {
  console.log('🖼️ Starting blog image optimization...');
  
  const blogImagesDir = path.join(__dirname, '../public/images/blog');
  
  if (!fs.existsSync(blogImagesDir)) {
    console.log('📁 Blog images directory not found, skipping...');
    return;
  }
  
  const blogDirs = fs.readdirSync(blogImagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`📂 Found ${blogDirs.length} blog directories to process...`);
  
  for (const blogDir of blogDirs) {
    const fullPath = path.join(blogImagesDir, blogDir);
    const files = fs.readdirSync(fullPath);
    
    for (const file of files) {
      if (file.match(/\.(png|jpg|jpeg)$/i)) {
        const filePath = path.join(fullPath, file);
        const fileName = path.basename(file, path.extname(file));
        
        try {
          console.log(`🔄 Processing: ${blogDir}/${file}`);
          
          // Create WebP version
          await sharp(filePath)
            .webp({ quality: 85 })
            .toFile(path.join(fullPath, `${fileName}.webp`));
          
          // Create mobile-optimized version (348x232 as per audit)
          await sharp(filePath)
            .resize(348, 232, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(path.join(fullPath, `${fileName}-mobile.webp`));
          
          console.log(`✅ Optimized: ${blogDir}/${file}`);
        } catch (error) {
          console.error(`❌ Error optimizing ${blogDir}/${file}:`, error.message);
        }
      }
    }
  }
  
  console.log('🎉 Blog image optimization complete!');
}

optimizeBlogImages().catch(console.error); 