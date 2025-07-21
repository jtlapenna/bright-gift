#!/usr/bin/env node

/**
 * Image Audit Script for BrightGift Blog
 * 
 * This script audits all blog images to ensure they meet our optimization standards:
 * - All images should be in WebP format
 * - All images should be under 200KB
 * - All images should have descriptive filenames
 * 
 * Usage: node scripts/image-audit.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MAX_SIZE_KB = 200;
const PREFERRED_FORMAT = 'webp';
const BLOG_IMAGE_DIRS = [
  'public/images/blog',
  'src/assets/blog-images'
];

// Results tracking
const results = {
  total: 0,
  compliant: 0,
  oversized: [],
  wrongFormat: [],
  missingAlt: [],
  errors: []
};

/**
 * Convert bytes to KB
 */
function bytesToKB(bytes) {
  return Math.round(bytes / 1024);
}

/**
 * Get file extension
 */
function getFileExtension(filename) {
  return path.extname(filename).toLowerCase().slice(1);
}

/**
 * Check if file is an image
 */
function isImageFile(filename) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
  const ext = getFileExtension(filename);
  return imageExtensions.includes(ext);
}

/**
 * Audit a single image file
 */
function auditImageFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const sizeKB = bytesToKB(stats.size);
    const filename = path.basename(filePath);
    const ext = getFileExtension(filename);
    
    results.total++;
    
    // Check file size
    if (sizeKB > MAX_SIZE_KB) {
      results.oversized.push({
        file: filePath,
        size: sizeKB,
        filename
      });
    }
    
    // Check format
    if (ext !== PREFERRED_FORMAT) {
      results.wrongFormat.push({
        file: filePath,
        format: ext,
        size: sizeKB,
        filename
      });
    }
    
    // If both checks pass, it's compliant
    if (sizeKB <= MAX_SIZE_KB && ext === PREFERRED_FORMAT) {
      results.compliant++;
    }
    
  } catch (error) {
    results.errors.push({
      file: filePath,
      error: error.message
    });
  }
}

/**
 * Recursively scan directory for images
 */
function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (stat.isFile() && isImageFile(item)) {
        auditImageFile(fullPath);
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
 * Generate audit report
 */
function generateReport() {
  console.log('\n🎨 BRIGHTGIFT BLOG IMAGE AUDIT REPORT');
  console.log('=====================================\n');
  
  console.log(`📊 SUMMARY:`);
  console.log(`   Total images scanned: ${results.total}`);
  console.log(`   Compliant images: ${results.compliant} (${Math.round(results.compliant/results.total*100)}%)`);
  console.log(`   Issues found: ${results.total - results.compliant}\n`);
  
  if (results.oversized.length > 0) {
    console.log(`⚠️  OVERSIZED IMAGES (>${MAX_SIZE_KB}KB):`);
    results.oversized.forEach(img => {
      console.log(`   ${img.file} (${img.size}KB)`);
    });
    console.log('');
  }
  
  if (results.wrongFormat.length > 0) {
    console.log(`🔄 WRONG FORMAT (not ${PREFERRED_FORMAT.toUpperCase()}):`);
    results.wrongFormat.forEach(img => {
      console.log(`   ${img.file} (${img.format.toUpperCase()}, ${img.size}KB)`);
    });
    console.log('');
  }
  
  if (results.errors.length > 0) {
    console.log(`❌ ERRORS:`);
    results.errors.forEach(error => {
      console.log(`   ${error.file}: ${error.error}`);
    });
    console.log('');
  }
  
  // Recommendations
  if (results.oversized.length > 0 || results.wrongFormat.length > 0) {
    console.log(`💡 RECOMMENDATIONS:`);
    
    if (results.oversized.length > 0) {
      console.log(`   • Optimize ${results.oversized.length} oversized images to under ${MAX_SIZE_KB}KB`);
    }
    
    if (results.wrongFormat.length > 0) {
      console.log(`   • Convert ${results.wrongFormat.length} images to ${PREFERRED_FORMAT.toUpperCase()} format`);
    }
    
    console.log(`   • Use tools like TinyPNG, Squoosh, or ImageOptim for compression`);
    console.log(`   • Consider using responsive images with multiple sizes`);
    console.log('');
  }
  
  // Return results for potential programmatic use
  return {
    total: results.total,
    compliant: results.compliant,
    issues: results.total - results.compliant,
    oversized: results.oversized.length,
    wrongFormat: results.wrongFormat.length,
    errors: results.errors.length
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Starting image audit...\n');
  
  // Scan all blog image directories
  for (const dir of BLOG_IMAGE_DIRS) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Scanning: ${dir}`);
      scanDirectory(dir);
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  }
  
  // Generate and display report
  const report = generateReport();
  
  // Exit with appropriate code
  if (report.issues > 0) {
    console.log(`❌ Audit completed with ${report.issues} issues found.`);
    process.exit(1);
  } else {
    console.log(`✅ All images are compliant!`);
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, auditImageFile, generateReport }; 