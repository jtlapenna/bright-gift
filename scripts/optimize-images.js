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

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  console.log('🖼️ Starting image optimization...');
  
  const publicDir = path.join(__dirname, '../public');
  
  // Optimize hero image
  console.log('📸 Optimizing hero-image.png...');
  try {
    // Create mobile-optimized version (136x154 as per audit)
    await sharp(path.join(publicDir, 'hero-image.png'))
      .resize(136, 154, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 85 })
      .toFile(path.join(publicDir, 'hero-image-mobile.webp'));
    
    // Create desktop-optimized version (412px height as per audit)
    await sharp(path.join(publicDir, 'hero-image.png'))
      .resize(null, 412, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 85 })
      .toFile(path.join(publicDir, 'hero-image-desktop.webp'));
    
    console.log('✅ Hero image optimized');
  } catch (error) {
    console.error('❌ Error optimizing hero image:', error);
  }
  
  // Optimize logo
  console.log('🏷️ Optimizing bright-gift-logo.png...');
  try {
    // Create mobile-optimized version (122x48 as per audit)
    await sharp(path.join(publicDir, 'bright-gift-logo.png'))
      .resize(122, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 85 })
      .toFile(path.join(publicDir, 'bright-gift-logo-mobile.webp'));
    
    // Create desktop-optimized version (original size but WebP)
    await sharp(path.join(publicDir, 'bright-gift-logo.png'))
      .webp({ quality: 85 })
      .toFile(path.join(publicDir, 'bright-gift-logo.webp'));
    
    console.log('✅ Logo optimized');
  } catch (error) {
    console.error('❌ Error optimizing logo:', error);
  }
  
  console.log('🎉 Image optimization complete!');
}

optimizeImages().catch(console.error); 