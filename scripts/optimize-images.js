const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Large images that need optimization
const largeImages = [
  'public/images/blog/best-home-gifts-on-amazon-2024/eco-banner.png',
  'public/images/blog/best-home-gifts-on-amazon-2024/eco-og.png',
  'public/images/blog/best-home-gifts-on-amazon-2024/eco-social.png',
  'public/images/blog/best-home-gifts-on-amazon-2024/plant-lovers-under-75.png',
  'public/images/blog/blog-gifts-under-25-for-coworkers-banner.jpg',
  'public/images/blog/gifts-for-remote-workers-under-50/wfh-under-50-OG.png',
  'public/images/blog/gifts-for-remote-workers-under-50/wfh-under-50-banner.png',
  'public/images/blog/gifts-for-remote-workers-under-50/wfh-under-50-social.png',
  'public/images/blog/plant-lovers-under-75/plant-lovers-under-75.png',
  'public/images/blog/unique-graduation-gifts-creative-minds/unique-graduation-gifts-for-the-creative-minds-banner.webp',
  'public/images/blog/unique-graduation-gifts-creative-minds/unique-graduation-gifts-for-the-creative-minds-og.webp',
  'public/images/blog/unique-graduation-gifts-creative-minds/unique-graduation-gifts-for-the-creative-minds-social.webp'
];

function checkImageMagick() {
  try {
    execSync('convert --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkWebP() {
  try {
    execSync('cwebp -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function optimizeImages() {
  console.log('🖼️  OPTIMIZING LARGE IMAGES\n');
  
  if (!checkImageMagick()) {
    console.log('❌ ImageMagick not found. Please install ImageMagick first:');
    console.log('   macOS: brew install imagemagick');
    console.log('   Ubuntu: sudo apt-get install imagemagick');
    console.log('   Windows: Download from https://imagemagick.org/');
    return;
  }
  
  if (!checkWebP()) {
    console.log('❌ WebP tools not found. Please install WebP tools first:');
    console.log('   macOS: brew install webp');
    console.log('   Ubuntu: sudo apt-get install webp');
    console.log('   Windows: Download from https://developers.google.com/speed/webp/');
    return;
  }
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let processedCount = 0;
  let errorCount = 0;
  
  largeImages.forEach(imagePath => {
    try {
      if (!fs.existsSync(imagePath)) {
        console.log(`⏭️  ${imagePath}: File not found, skipping`);
        return;
      }
      
      const originalSize = getFileSize(imagePath);
      totalOriginalSize += originalSize;
      
      // Get file extension and base name
      const ext = path.extname(imagePath);
      const baseName = imagePath.replace(ext, '');
      const webpPath = baseName + '.webp';
      
      // Skip if already WebP
      if (ext.toLowerCase() === '.webp') {
        console.log(`⏭️  ${imagePath}: Already WebP format, skipping`);
        return;
      }
      
      // Convert to WebP with quality 80
      const command = `cwebp -q 80 "${imagePath}" -o "${webpPath}"`;
      execSync(command, { stdio: 'ignore' });
      
      const optimizedSize = getFileSize(webpPath);
      totalOptimizedSize += optimizedSize;
      
      const savings = originalSize - optimizedSize;
      const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
      
      console.log(`✅ ${imagePath}: ${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)} (${savingsPercent}% smaller)`);
      processedCount++;
      
    } catch (error) {
      console.log(`❌ ${imagePath}: Error - ${error.message}`);
      errorCount++;
    }
  });
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Processed: ${processedCount} images`);
  console.log(`   Errors: ${errorCount} images`);
  console.log(`   Original Size: ${formatFileSize(totalOriginalSize)}`);
  console.log(`   Optimized Size: ${formatFileSize(totalOptimizedSize)}`);
  console.log(`   Total Savings: ${formatFileSize(totalOriginalSize - totalOptimizedSize)}`);
  
  if (processedCount > 0) {
    console.log(`\n✅ Successfully optimized ${processedCount} images!`);
    console.log(`💡 Next steps:`);
    console.log(`   1. Update image references in blog posts to use .webp files`);
    console.log(`   2. Add WebP fallbacks for older browsers`);
    console.log(`   3. Test image quality and adjust compression if needed`);
  }
  
  if (errorCount > 0) {
    console.log(`\n❌ ${errorCount} images had errors and need manual review.`);
  }
}

// Run the script
optimizeImages(); 