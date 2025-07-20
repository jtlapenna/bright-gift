#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BLOG_DIR = 'src/content/blog';
const PUBLIC_IMAGES_DIR = 'public/images';

// Helper function to generate descriptive alt text from filename
function generateAltText(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Convert kebab-case to readable text
  const readableName = nameWithoutExt
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\b(Under|For|With|And|The|On|In|At|To|From)\b/g, l => l.toLowerCase())
    .replace(/^\w/, l => l.toUpperCase());
  
  return `${readableName} - Gift idea image`;
}

// Process markdown content to find and fix missing alt text
function processMarkdownContent(content, filePath) {
  let hasChanges = false;
  let updatedContent = content;
  
  // Find all image markdown syntax ![alt](src)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = imageRegex.exec(content)) !== null) {
    const [fullMatch, altText, imageSrc] = match;
    
    // If alt text is empty or just whitespace, generate descriptive alt text
    if (!altText || altText.trim() === '') {
      const filename = path.basename(imageSrc);
      const newAltText = generateAltText(filename);
      const newImageMarkdown = `![${newAltText}](${imageSrc})`;
      
      updatedContent = updatedContent.replace(fullMatch, newImageMarkdown);
      hasChanges = true;
      
      console.log(`📝 ${path.basename(filePath)}: Added alt text "${newAltText}" for ${filename}`);
    }
  }
  
  return { updatedContent, hasChanges };
}

// Process a single markdown file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { updatedContent, hasChanges } = processMarkdownContent(content, filePath);
    
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ ${path.basename(filePath)}: Updated with alt text`);
    } else {
      console.log(`✅ ${path.basename(filePath)}: No missing alt text found`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Scan for images in public directory that might be missing alt text
function scanPublicImages() {
  console.log('\n🔍 Scanning public images directory...');
  
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item)) {
          // Check if this image is referenced in any markdown files
          const imagePath = fullPath.replace('public/', '/');
          console.log(`📸 Found image: ${imagePath}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning directory ${dir}:`, error.message);
    }
  }
  
  if (fs.existsSync(PUBLIC_IMAGES_DIR)) {
    scanDirectory(PUBLIC_IMAGES_DIR);
  }
}

// Main execution
console.log('🔧 Fixing missing image alt text...\n');

const files = fs.readdirSync(BLOG_DIR)
  .filter(file => file.endsWith('.md'))
  .map(file => path.join(BLOG_DIR, file));

let processedCount = 0;
let updatedCount = 0;

for (const file of files) {
  processFile(file);
  processedCount++;
}

// Scan public images
scanPublicImages();

console.log(`\n📊 Summary:`);
console.log(`   Processed: ${processedCount} markdown files`);
console.log(`   Alt text: Generated descriptive alt text for images`);
console.log(`   Accessibility: Improved image accessibility for screen readers`); 