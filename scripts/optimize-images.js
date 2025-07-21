#!/usr/bin/env node

/**
 * Image Optimization Script for BrightGift Blog
 * 
 * This script automatically optimizes blog images by:
 * - Converting PNG/JPG to WebP format
 * - Compressing images to under 200KB
 * - Maintaining quality while reducing file size
 * 
 * Usage: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MAX_SIZE_KB = 200;
const QUALITY = 85;
const MAX_WIDTH = 1200;
const BLOG_IMAGE_DIRS = [
  'public/images/blog',
  'src/assets/blog-images'
];

// Results tracking
const results = {
  total: 0,
  optimized: 0,
  skipped: 0,
  errors: []
};

/**
 * Check if ImageMagick is available
 */
function checkImageMagick() {
  try {
    execSync('magick --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    try {
      execSync('convert --version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  const stats = fs.statSync(filePath);
  return Math.round(stats.size / 1024);
}

/**
 * Get file extension
 */
function getFileExtension(filename) {
  return path.extname(filename).toLowerCase().slice(1);
}

/**
 * Check if file is an image that needs optimization
 */
function needsOptimization(filePath) {
  const ext = getFileExtension(filePath);
  const sizeKB = getFileSizeKB(filePath);
  
  // Skip if already WebP and under size limit
  if (ext === 'webp' && sizeKB <= MAX_SIZE_KB) {
    return false;
  }
  
  // Skip if not an image file
  if (!['jpg', 'jpeg', 'png'].includes(ext)) {
    return false;
  }
  
  return true;
}

/**
 * Optimize a single image
 */
function optimizeImage(filePath) {
  try {
    const ext = getFileExtension(filePath);
    const sizeKB = getFileSizeKB(filePath);
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath, path.extname(filePath));
    const outputPath = path.join(dir, `${basename}.webp`);
    
    console.log(`  Optimizing: ${path.basename(filePath)} (${sizeKB}KB)`);
    
    // Build ImageMagick command
    const command = `magick "${filePath}" -quality ${QUALITY} -resize ${MAX_WIDTH}x "${outputPath}"`;
    
    // Execute optimization
    execSync(command, { stdio: 'ignore' });
    
    // Check if optimization was successful
    if (fs.existsSync(outputPath)) {
      const newSizeKB = getFileSizeKB(outputPath);
      const reduction = Math.round(((sizeKB - newSizeKB) / sizeKB) * 100);
      
      console.log(`    ✅ Optimized: ${newSizeKB}KB (${reduction}% reduction)`);
      
      // Remove original file if optimization was successful
      if (newSizeKB < sizeKB) {
        fs.unlinkSync(filePath);
        console.log(`    🗑️  Removed original: ${path.basename(filePath)}`);
      }
      
      results.optimized++;
      return true;
    } else {
      throw new Error('Output file not created');
    }
    
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    results.errors.push({
      file: filePath,
      error: error.message
    });
    return false;
  }
}

/**
 * Process a single directory
 */
function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (stat.isFile()) {
        results.total++;
        
        if (needsOptimization(fullPath)) {
          optimizeImage(fullPath);
        } else {
          results.skipped++;
        }
      }
    }
  } catch (error) {
    results.errors.push({
      file: dirPath,
      error: error.message
    });
  }
}

/**
 * Generate optimization report
 */
function generateReport() {
  console.log('\n🎨 IMAGE OPTIMIZATION REPORT');
  console.log('============================\n');
  
  console.log(`📊 SUMMARY:`);
  console.log(`   Total images processed: ${results.total}`);
  console.log(`   Images optimized: ${results.optimized}`);
  console.log(`   Images skipped: ${results.skipped}`);
  console.log(`   Errors: ${results.errors.length}\n`);
  
  if (results.errors.length > 0) {
    console.log(`❌ ERRORS:`);
    results.errors.forEach(error => {
      console.log(`   ${error.file}: ${error.error}`);
    });
    console.log('');
  }
  
  if (results.optimized > 0) {
    console.log(`✅ SUCCESS:`);
    console.log(`   • ${results.optimized} images converted to WebP format`);
    console.log(`   • Images compressed to under ${MAX_SIZE_KB}KB`);
    console.log(`   • Original files removed after successful optimization`);
    console.log('');
  }
  
  return {
    total: results.total,
    optimized: results.optimized,
    skipped: results.skipped,
    errors: results.errors.length
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Starting image optimization...\n');
  
  // Check if ImageMagick is available
  if (!checkImageMagick()) {
    console.log('❌ ImageMagick not found. Please install ImageMagick to use this script.');
    console.log('   macOS: brew install imagemagick');
    console.log('   Ubuntu: sudo apt-get install imagemagick');
    process.exit(1);
  }
  
  // Process all blog image directories
  for (const dir of BLOG_IMAGE_DIRS) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Processing: ${dir}`);
      processDirectory(dir);
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  }
  
  // Generate and display report
  const report = generateReport();
  
  // Exit with appropriate code
  if (report.errors > 0) {
    console.log(`⚠️  Optimization completed with ${report.errors} errors.`);
    process.exit(1);
  } else if (report.optimized > 0) {
    console.log(`✅ Optimization completed successfully! ${report.optimized} images optimized.`);
    process.exit(0);
  } else {
    console.log(`ℹ️  No images needed optimization.`);
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, optimizeImage, generateReport }; 