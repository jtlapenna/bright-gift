#!/usr/bin/env node

/**
 * Optimize Alt Text Script
 * Analyzes and optimizes image alt text across all content
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

console.log('🖼️  Optimizing image alt text across all content...\n');

const blogDir = path.join(__dirname, '../src/content/blog');
const files = fs.readdirSync(blogDir);
let processed = 0;
let optimized = 0;
let issues = [];

// Function to generate SEO-optimized alt text
function generateAltText(title, imagePath, postCategory) {
  const baseTitle = title.toLowerCase();
  const imageName = path.basename(imagePath, path.extname(imagePath));
  
  // Extract key terms from title
  const keyTerms = baseTitle
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 3);
  
  // Generate context-aware alt text
  if (imageName.includes('banner') || imageName.includes('hero')) {
    return `${keyTerms.join(' ')} - ${title}`;
  } else if (imageName.includes('og') || imageName.includes('social')) {
    return `${title} - Gift Ideas and Recommendations`;
  } else if (imageName.includes('product') || imageName.includes('gift')) {
    return `Gift recommendation: ${keyTerms.join(' ')}`;
  } else {
    return `${keyTerms.join(' ')} gift ideas and recommendations`;
  }
}

// Function to check if alt text needs optimization
function needsOptimization(altText, title, imagePath) {
  if (!altText) return true;
  if (altText.length < 10) return true;
  if (altText.length > 125) return true;
  if (altText.toLowerCase().includes('image') || altText.toLowerCase().includes('photo')) return true;
  if (!altText.toLowerCase().includes(title.toLowerCase().split(' ')[0])) return true;
  return false;
}

for (const file of files) {
  if (file.endsWith('.md')) {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: body } = matter(content);
    
    let hasChanges = false;
    const title = data.title || file.replace('.md', '');
    
    // Check main image alt text
    if (data.image && !data.imageAlt) {
      const optimizedAlt = generateAltText(title, data.image, data.category);
      data.imageAlt = optimizedAlt;
      hasChanges = true;
      console.log(`✅ Added alt text for main image in ${file}: "${optimizedAlt}"`);
    } else if (data.image && data.imageAlt && needsOptimization(data.imageAlt, title, data.image)) {
      const optimizedAlt = generateAltText(title, data.image, data.category);
      data.imageAlt = optimizedAlt;
      hasChanges = true;
      console.log(`🔄 Optimized alt text for main image in ${file}: "${optimizedAlt}"`);
    }
    
    // Check OG image alt text
    if (data.ogImage && !data.ogImageAlt) {
      const optimizedAlt = generateAltText(title, data.ogImage, data.category);
      data.ogImageAlt = optimizedAlt;
      hasChanges = true;
      console.log(`✅ Added alt text for OG image in ${file}: "${optimizedAlt}"`);
    } else if (data.ogImage && data.ogImageAlt && needsOptimization(data.ogImageAlt, title, data.ogImage)) {
      const optimizedAlt = generateAltText(title, data.ogImage, data.category);
      data.ogImageAlt = optimizedAlt;
      hasChanges = true;
      console.log(`🔄 Optimized alt text for OG image in ${file}: "${optimizedAlt}"`);
    }
    
    // Check social image alt text
    if (data.socialImage && !data.socialImageAlt) {
      const optimizedAlt = generateAltText(title, data.socialImage, data.category);
      data.socialImageAlt = optimizedAlt;
      hasChanges = true;
      console.log(`✅ Added alt text for social image in ${file}: "${optimizedAlt}"`);
    } else if (data.socialImage && data.socialImageAlt && needsOptimization(data.socialImageAlt, title, data.socialImage)) {
      const optimizedAlt = generateAltText(title, data.socialImage, data.category);
      data.socialImageAlt = optimizedAlt;
      hasChanges = true;
      console.log(`🔄 Optimized alt text for social image in ${file}: "${optimizedAlt}"`);
    }
    
    // Check for images in content that need alt text
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    let contentUpdated = body;
    
    while ((match = imageRegex.exec(body)) !== null) {
      const [fullMatch, altText, imagePath] = match;
      
      if (!altText || needsOptimization(altText, title, imagePath)) {
        const optimizedAlt = generateAltText(title, imagePath, data.category);
        contentUpdated = contentUpdated.replace(fullMatch, `![${optimizedAlt}](${imagePath})`);
        hasChanges = true;
        console.log(`🔄 Optimized inline image alt text in ${file}: "${optimizedAlt}"`);
      }
    }
    
    if (hasChanges) {
      // Reconstruct the file
      const newContent = matter.stringify(contentUpdated, data);
      fs.writeFileSync(filePath, newContent);
      optimized++;
    }
    
    processed++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Total files processed: ${processed}`);
console.log(`   Files optimized: ${optimized}`);
console.log(`   Files already optimized: ${processed - optimized}`);
console.log('\n🎉 Alt text optimization complete!');
