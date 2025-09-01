#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Function to recursively find all markdown files
function findMarkdownFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
      findMarkdownFiles(fullPath, files);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to check if an image file exists
function imageExists(imagePath) {
  const fullPath = path.join(__dirname, '..', 'public', imagePath);
  return fs.existsSync(fullPath);
}

// Function to audit and fix images in a blog post
function auditAndFixImages(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    let modified = false;
    const issues = [];

    // Check frontmatter image references
    const imageFields = ['image', 'ogImage', 'socialImage', 'imageJpg', 'ogImageJpg'];
    
    for (const field of imageFields) {
      if (data[field]) {
        const imagePath = data[field];
        if (!imageExists(imagePath)) {
          issues.push(`Missing ${field}: ${imagePath}`);
          
          // Try to find a .webp alternative
          if (imagePath.endsWith('.jpg')) {
            const webpPath = imagePath.replace('.jpg', '.webp');
            if (imageExists(webpPath)) {
              data[field] = webpPath;
              modified = true;
              issues.push(`  → Fixed: Replaced with ${webpPath}`);
            } else {
              // Remove the field if no alternative exists
              delete data[field];
              modified = true;
              issues.push(`  → Removed: No alternative found`);
            }
          }
        }
      }
    }

    // Check content for image references
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    let match;
    let newContent = content;

    while ((match = imgRegex.exec(content)) !== null) {
      const imagePath = match[1];
      if (!imageExists(imagePath)) {
        issues.push(`Missing content image: ${imagePath}`);
        
        // Try to find a .webp alternative
        if (imagePath.endsWith('.jpg')) {
          const webpPath = imagePath.replace('.jpg', '.webp');
          if (imageExists(webpPath)) {
            newContent = newContent.replace(imagePath, webpPath);
            modified = true;
            issues.push(`  → Fixed: Replaced with ${webpPath}`);
          } else {
            issues.push(`  → Warning: No alternative found for ${imagePath}`);
          }
        }
      }
    }

    // Check markdown image syntax
    const markdownImgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    while ((match = markdownImgRegex.exec(content)) !== null) {
      const imagePath = match[2];
      if (!imageExists(imagePath)) {
        issues.push(`Missing markdown image: ${imagePath}`);
        
        // Try to find a .webp alternative
        if (imagePath.endsWith('.jpg')) {
          const webpPath = imagePath.replace('.jpg', '.webp');
          if (imageExists(webpPath)) {
            newContent = newContent.replace(imagePath, webpPath);
            modified = true;
            issues.push(`  → Fixed: Replaced with ${webpPath}`);
          } else {
            issues.push(`  → Warning: No alternative found for ${imagePath}`);
          }
        }
      }
    }

    if (modified) {
      const newFileContent = matter.stringify(newContent, data);
      fs.writeFileSync(filePath, newFileContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      if (issues.length > 0) {
        issues.forEach(issue => console.log(`   ${issue}`));
      }
      return { fixed: true, issues };
    } else if (issues.length > 0) {
      console.log(`⚠️  Issues found: ${filePath}`);
      issues.forEach(issue => console.log(`   ${issue}`));
      return { fixed: false, issues };
    } else {
      console.log(`✅ Clean: ${filePath}`);
      return { fixed: false, issues: [] };
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { fixed: false, issues: [`Error: ${error.message}`] };
  }
}

// Function to generate a comprehensive report
function generateImageReport() {
  console.log('🔍 Generating comprehensive image report...\n');
  
  const blogDir = path.join(__dirname, '..', 'public', 'images', 'blog');
  const report = {
    totalImages: 0,
    webpImages: 0,
    jpgImages: 0,
    missingImages: [],
    recommendations: []
  };

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.match(/\.(jpg|jpeg|webp|png)$/i)) {
        report.totalImages++;
        if (item.endsWith('.webp')) {
          report.webpImages++;
        } else if (item.match(/\.(jpg|jpeg)$/i)) {
          report.jpgImages++;
        }
      }
    }
  }

  if (fs.existsSync(blogDir)) {
    scanDirectory(blogDir);
  }

  console.log('📊 Image Report:');
  console.log(`   Total images: ${report.totalImages}`);
  console.log(`   WebP images: ${report.webpImages}`);
  console.log(`   JPG images: ${report.jpgImages}`);
  console.log(`   WebP percentage: ${((report.webpImages / report.totalImages) * 100).toFixed(1)}%`);
  
  if (report.jpgImages > 0) {
    console.log('\n💡 Recommendations:');
    console.log('   1. Convert remaining JPG images to WebP for better performance');
    console.log('   2. Update blog posts to reference WebP versions');
    console.log('   3. Remove unused JPG files to clean up the repository');
  }

  return report;
}

// Main execution
function main() {
  console.log('🔧 Blog Image Audit and Fix Tool');
  console.log('================================\n');
  
  // Generate image report first
  const report = generateImageReport();
  console.log('\n');
  
  console.log('📁 Scanning for blog markdown files...');
  const markdownFiles = findMarkdownFiles(path.join(__dirname, '..', 'src', 'content', 'blog'));
  console.log(`📊 Found ${markdownFiles.length} blog files\n`);
  
  let fixedCount = 0;
  let issuesCount = 0;
  let totalIssues = 0;
  
  console.log('🔄 Processing files...\n');
  
  for (const filePath of markdownFiles) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`📝 Processing: ${relativePath}`);
    
    const result = auditAndFixImages(filePath);
    
    if (result.fixed) {
      fixedCount++;
    }
    
    if (result.issues.length > 0) {
      issuesCount++;
      totalIssues += result.issues.length;
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎯 Summary:');
  console.log(`📊 Total files processed: ${markdownFiles.length}`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`⚠️  Files with issues: ${issuesCount}`);
  console.log(`🔧 Total issues found: ${totalIssues}`);
  
  if (fixedCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Review the changes to ensure they look correct');
    console.log('2. Test the site to make sure images display properly');
    console.log('3. Re-run Ahrefs audit to check for improvement');
    console.log('4. Consider converting remaining JPG files to WebP');
  }
  
  if (issuesCount > 0) {
    console.log('\n⚠️  Remaining issues:');
    console.log('1. Some images may still be missing - check the output above');
    console.log('2. Consider creating missing images or removing references');
    console.log('3. Update image generation process to avoid future issues');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findMarkdownFiles, auditAndFixImages, generateImageReport };
