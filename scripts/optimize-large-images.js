#!/usr/bin/env node

/**
 * Large Image Optimization Script for BrightGift Blog
 * 
 * This script specifically optimizes large WebP images in src/assets/blog-images/
 * that are over 200KB to bring them under the 200KB limit.
 * 
 * Usage: node scripts/optimize-large-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MAX_SIZE_KB = 200;
const QUALITY = 80;
const MAX_WIDTH = 1200;
const TARGET_DIR = 'src/assets/blog-images';

// Results tracking
const results = {
  total: 0,
  optimized: 0,
  skipped: 0,
  errors: []
};

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  const stats = fs.statSync(filePath);
  return Math.round(stats.size / 1024);
}

/**
 * Optimize a single large image
 */
function optimizeLargeImage(filePath) {
  try {
    const sizeKB = getFileSizeKB(filePath);
    const filename = path.basename(filePath);
    
    if (sizeKB <= MAX_SIZE_KB) {
      results.skipped++;
      return;
    }
    
    console.log(`  Optimizing: ${filename} (${sizeKB}KB)`);
    
    // Create temporary optimized file
    const tempPath = filePath.replace('.webp', '-temp.webp');
    
    // Build ImageMagick command
    const command = `magick "${filePath}" -quality ${QUALITY} -resize ${MAX_WIDTH}x "${tempPath}"`;
    
    // Execute optimization
    execSync(command, { stdio: 'ignore' });
    
    // Check if optimization was successful
    if (fs.existsSync(tempPath)) {
      const newSizeKB = getFileSizeKB(tempPath);
      const reduction = Math.round(((sizeKB - newSizeKB) / sizeKB) * 100);
      
      if (newSizeKB <= MAX_SIZE_KB) {
        // Replace original with optimized version
        fs.unlinkSync(filePath);
        fs.renameSync(tempPath, filePath);
        
        console.log(`    ✅ Optimized: ${newSizeKB}KB (${reduction}% reduction)`);
        results.optimized++;
      } else {
        // If still too large, try with lower quality
        fs.unlinkSync(tempPath);
        const command2 = `magick "${filePath}" -quality 60 -resize 1000x "${tempPath}"`;
        execSync(command2, { stdio: 'ignore' });
        
        if (fs.existsSync(tempPath)) {
          const finalSizeKB = getFileSizeKB(tempPath);
          const finalReduction = Math.round(((sizeKB - finalSizeKB) / sizeKB) * 100);
          
          if (finalSizeKB <= MAX_SIZE_KB) {
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);
            console.log(`    ✅ Optimized (aggressive): ${finalSizeKB}KB (${finalReduction}% reduction)`);
            results.optimized++;
          } else {
            fs.unlinkSync(tempPath);
            console.log(`    ⚠️  Still too large: ${finalSizeKB}KB`);
            results.errors.push({
              file: filePath,
              error: `Still ${finalSizeKB}KB after optimization`
            });
          }
        }
      }
    } else {
      throw new Error('Output file not created');
    }
    
  } catch (error) {
    console.log(`    ❌ Error: ${error.message}`);
    results.errors.push({
      file: filePath,
      error: error.message
    });
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
      } else if (stat.isFile() && item.endsWith('.webp')) {
        results.total++;
        optimizeLargeImage(fullPath);
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
  console.log('\n🎨 LARGE IMAGE OPTIMIZATION REPORT');
  console.log('==================================\n');
  
  console.log(`📊 SUMMARY:`);
  console.log(`   Total WebP images scanned: ${results.total}`);
  console.log(`   Images optimized: ${results.optimized}`);
  console.log(`   Images skipped (already under ${MAX_SIZE_KB}KB): ${results.skipped}`);
  console.log(`   Errors: ${results.errors.length}\n`);
  
  if (results.errors.length > 0) {
    console.log(`❌ ERRORS:`);
    results.errors.forEach(error => {
      console.log(`   ${path.basename(error.file)}: ${error.error}`);
    });
    console.log('');
  }
  
  if (results.optimized > 0) {
    console.log(`✅ SUCCESS:`);
    console.log(`   • ${results.optimized} large images compressed to under ${MAX_SIZE_KB}KB`);
    console.log(`   • Significant file size reductions achieved`);
    console.log(`   • Original files replaced with optimized versions`);
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
  console.log('🔧 Starting large image optimization...\n');
  
  // Check if ImageMagick is available
  try {
    execSync('magick --version', { stdio: 'ignore' });
  } catch (error) {
    console.log('❌ ImageMagick not found. Please install ImageMagick to use this script.');
    process.exit(1);
  }
  
  // Process target directory
  if (fs.existsSync(TARGET_DIR)) {
    console.log(`📁 Processing: ${TARGET_DIR}`);
    processDirectory(TARGET_DIR);
  } else {
    console.log(`❌ Directory not found: ${TARGET_DIR}`);
    process.exit(1);
  }
  
  // Generate and display report
  const report = generateReport();
  
  // Exit with appropriate code
  if (report.errors > 0) {
    console.log(`⚠️  Optimization completed with ${report.errors} errors.`);
    process.exit(1);
  } else if (report.optimized > 0) {
    console.log(`✅ Large image optimization completed successfully! ${report.optimized} images optimized.`);
    process.exit(0);
  } else {
    console.log(`ℹ️  No large images needed optimization.`);
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, optimizeLargeImage, generateReport }; 