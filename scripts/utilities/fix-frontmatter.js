#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to blog posts directory
const blogDir = path.join(__dirname, 'src', 'content', 'blog');

// Function to fix frontmatter in a single file
function fixFrontmatter(content, filename) {
  console.log(`\n🔧 Processing: ${filename}`);
  
  let changes = [];
  
  // Fix heroImage -> image
  if (content.includes('heroImage:')) {
    content = content.replace(/heroImage:/g, 'image:');
    changes.push('heroImage → image');
  }
  
  // Fix pubDate -> date (if it exists)
  if (content.includes('pubDate:')) {
    content = content.replace(/pubDate:/g, 'date:');
    changes.push('pubDate → date');
  }
  
  // Ensure proper frontmatter structure
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    
    // Check for required fields
    const requiredFields = ['title', 'description', 'image', 'date'];
    const missingFields = requiredFields.filter(field => !frontmatter.includes(`${field}:`));
    
    if (missingFields.length > 0) {
      console.log(`⚠️  Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Check for proper image path format
    const imageMatch = frontmatter.match(/image:\s*"([^"]+)"/);
    if (imageMatch) {
      const imagePath = imageMatch[1];
      if (!imagePath.startsWith('/images/blog/')) {
        console.log(`⚠️  Image path may be incorrect: ${imagePath}`);
      }
    }
  }
  
  if (changes.length > 0) {
    console.log(`✅ Applied changes: ${changes.join(', ')}`);
  } else {
    console.log(`✅ No changes needed`);
  }
  
  return content;
}

// Main function to process all blog posts
async function fixAllBlogPosts() {
  console.log('🚀 Starting frontmatter fix for all blog posts...\n');
  
  try {
    // Read all files in the blog directory
    const files = fs.readdirSync(blogDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    console.log(`📁 Found ${mdFiles.length} blog post files`);
    
    let totalChanges = 0;
    
    // Process each markdown file
    for (const file of mdFiles) {
      const filePath = path.join(blogDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const originalContent = content;
      const fixedContent = fixFrontmatter(content, file);
      
      // Write back if content changed
      if (originalContent !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        totalChanges++;
      }
    }
    
    console.log(`\n🎉 Frontmatter fix complete!`);
    console.log(`📊 Processed ${mdFiles.length} files`);
    console.log(`🔧 Modified ${totalChanges} files`);
    
    if (totalChanges === 0) {
      console.log(`✅ All files already have correct frontmatter!`);
    }
    
  } catch (error) {
    console.error('❌ Error processing blog posts:', error);
    process.exit(1);
  }
}

// Run the script
fixAllBlogPosts(); 