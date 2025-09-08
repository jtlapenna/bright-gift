#!/usr/bin/env node

const { glob } = require('glob');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');

async function validateImages() {
  console.log('🔍 Validating images before build...');
  
  // Check for .jpg files in public/images/blog/
  const jpgFiles = await glob('public/images/blog/**/*.jpg', { cwd: projectRoot });
  
  if (jpgFiles.length > 0) {
    console.error('\n🚨 ERROR: Found .jpg files in public/images/blog/ directory!');
    console.error('These files are not used in templates and cause broken image reports from SEO tools.');
    console.error('Please move the following files to social-assets/images/ or remove them:');
    jpgFiles.forEach(file => console.error(`- ${file}`));
    console.error('\n💡 Solution: Use .webp files for website images, .jpg files only for social media.');
    process.exit(1);
  }
  
  // Check for .webp files in social-assets/ (optional warning)
  const socialWebpFiles = await glob('social-assets/images/**/*.webp', { cwd: projectRoot });
  if (socialWebpFiles.length > 0) {
    console.warn('\n⚠️  WARNING: Found .webp files in social-assets/images/');
    console.warn('Consider using .jpg files for social media to reduce file size.');
  }
  
  console.log('✅ Image validation passed - no .jpg files found in public/images/blog/');
}

validateImages().catch(error => {
  console.error('❌ Image validation failed:', error);
  process.exit(1);
});
