#!/usr/bin/env node

/**
 * Meta Tag Audit Script for BrightGift Blog
 * 
 * This script audits all blog posts to ensure they have proper meta tags:
 * - All posts should have metaTitle and metaDescription
 * - Meta titles should be 50-60 characters
 * - Meta descriptions should be 140-160 characters
 * - No duplicate meta titles or descriptions
 * 
 * Usage: node scripts/meta-tag-audit.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BLOG_DIR = 'src/content/blog';
const TITLE_MIN_LENGTH = 50;
const TITLE_MAX_LENGTH = 60;
const DESC_MIN_LENGTH = 140;
const DESC_MAX_LENGTH = 160;

// Results tracking
const results = {
  total: 0,
  compliant: 0,
  missingTitle: [],
  missingDescription: [],
  titleTooShort: [],
  titleTooLong: [],
  descTooShort: [],
  descTooLong: [],
  duplicateTitles: [],
  duplicateDescriptions: [],
  errors: []
};

// Track duplicates
const titleMap = new Map();
const descMap = new Map();

/**
 * Extract frontmatter from markdown file
 */
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  
  const frontmatter = frontmatterMatch[1];
  const metadata = {};
  
  frontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      metadata[key] = value;
    }
  });
  
  return metadata;
}

/**
 * Audit a single blog post
 */
function auditBlogPost(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = extractFrontmatter(content);
    const filename = path.basename(filePath, '.md');
    
    if (!metadata) {
      results.errors.push({
        file: filePath,
        error: 'No frontmatter found'
      });
      return;
    }
    
    results.total++;
    
    // Check metaTitle
    const metaTitle = metadata.metaTitle || metadata.title;
    if (!metaTitle) {
      results.missingTitle.push({
        file: filePath,
        filename
      });
    } else {
      const titleLength = metaTitle.length;
      
      if (titleLength < TITLE_MIN_LENGTH) {
        results.titleTooShort.push({
          file: filePath,
          title: metaTitle,
          length: titleLength,
          filename
        });
      } else if (titleLength > TITLE_MAX_LENGTH) {
        results.titleTooLong.push({
          file: filePath,
          title: metaTitle,
          length: titleLength,
          filename
        });
      }
      
      // Check for duplicates
      if (titleMap.has(metaTitle)) {
        results.duplicateTitles.push({
          file: filePath,
          title: metaTitle,
          originalFile: titleMap.get(metaTitle),
          filename
        });
      } else {
        titleMap.set(metaTitle, filePath);
      }
    }
    
    // Check metaDescription
    const metaDescription = metadata.metaDescription || metadata.description;
    if (!metaDescription) {
      results.missingDescription.push({
        file: filePath,
        filename
      });
    } else {
      const descLength = metaDescription.length;
      
      if (descLength < DESC_MIN_LENGTH) {
        results.descTooShort.push({
          file: filePath,
          description: metaDescription,
          length: descLength,
          filename
        });
      } else if (descLength > DESC_MAX_LENGTH) {
        results.descTooLong.push({
          file: filePath,
          description: metaDescription,
          length: descLength,
          filename
        });
      }
      
      // Check for duplicates
      if (descMap.has(metaDescription)) {
        results.duplicateDescriptions.push({
          file: filePath,
          description: metaDescription,
          originalFile: descMap.get(metaDescription),
          filename
        });
      } else {
        descMap.set(metaDescription, filePath);
      }
    }
    
    // Check if compliant
    const hasTitle = metaTitle && metaTitle.length >= TITLE_MIN_LENGTH && metaTitle.length <= TITLE_MAX_LENGTH;
    const hasDesc = metaDescription && metaDescription.length >= DESC_MIN_LENGTH && metaDescription.length <= DESC_MAX_LENGTH;
    const noTitleDupe = !results.duplicateTitles.some(d => d.file === filePath);
    const noDescDupe = !results.duplicateDescriptions.some(d => d.file === filePath);
    
    if (hasTitle && hasDesc && noTitleDupe && noDescDupe) {
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
 * Scan blog directory for markdown files
 */
function scanBlogDirectory() {
  try {
    const items = fs.readdirSync(BLOG_DIR);
    
    for (const item of items) {
      if (item.endsWith('.md')) {
        const filePath = path.join(BLOG_DIR, item);
        auditBlogPost(filePath);
      }
    }
  } catch (error) {
    results.errors.push({
      file: BLOG_DIR,
      error: error.message
    });
  }
}

/**
 * Generate audit report
 */
function generateReport() {
  console.log('\n📝 BRIGHTGIFT BLOG META TAG AUDIT REPORT');
  console.log('========================================\n');
  
  console.log(`📊 SUMMARY:`);
  console.log(`   Total posts scanned: ${results.total}`);
  console.log(`   Compliant posts: ${results.compliant} (${Math.round(results.compliant/results.total*100)}%)`);
  console.log(`   Issues found: ${results.total - results.compliant}\n`);
  
  if (results.missingTitle.length > 0) {
    console.log(`❌ MISSING META TITLES:`);
    results.missingTitle.forEach(post => {
      console.log(`   ${post.filename}`);
    });
    console.log('');
  }
  
  if (results.missingDescription.length > 0) {
    console.log(`❌ MISSING META DESCRIPTIONS:`);
    results.missingDescription.forEach(post => {
      console.log(`   ${post.filename}`);
    });
    console.log('');
  }
  
  if (results.titleTooShort.length > 0) {
    console.log(`⚠️  TITLES TOO SHORT (<${TITLE_MIN_LENGTH} chars):`);
    results.titleTooShort.forEach(post => {
      console.log(`   ${post.filename}: "${post.title}" (${post.length} chars)`);
    });
    console.log('');
  }
  
  if (results.titleTooLong.length > 0) {
    console.log(`⚠️  TITLES TOO LONG (>${TITLE_MAX_LENGTH} chars):`);
    results.titleTooLong.forEach(post => {
      console.log(`   ${post.filename}: "${post.title}" (${post.length} chars)`);
    });
    console.log('');
  }
  
  if (results.descTooShort.length > 0) {
    console.log(`⚠️  DESCRIPTIONS TOO SHORT (<${DESC_MIN_LENGTH} chars):`);
    results.descTooShort.forEach(post => {
      console.log(`   ${post.filename}: "${post.description.substring(0, 50)}..." (${post.length} chars)`);
    });
    console.log('');
  }
  
  if (results.descTooLong.length > 0) {
    console.log(`⚠️  DESCRIPTIONS TOO LONG (>${DESC_MAX_LENGTH} chars):`);
    results.descTooLong.forEach(post => {
      console.log(`   ${post.filename}: "${post.description.substring(0, 50)}..." (${post.length} chars)`);
    });
    console.log('');
  }
  
  if (results.duplicateTitles.length > 0) {
    console.log(`🔄 DUPLICATE META TITLES:`);
    results.duplicateTitles.forEach(post => {
      console.log(`   ${post.filename} duplicates ${path.basename(post.originalFile, '.md')}: "${post.title}"`);
    });
    console.log('');
  }
  
  if (results.duplicateDescriptions.length > 0) {
    console.log(`🔄 DUPLICATE META DESCRIPTIONS:`);
    results.duplicateDescriptions.forEach(post => {
      console.log(`   ${post.filename} duplicates ${path.basename(post.originalFile, '.md')}: "${post.description.substring(0, 50)}..."`);
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
  if (results.total - results.compliant > 0) {
    console.log(`💡 RECOMMENDATIONS:`);
    
    if (results.missingTitle.length > 0) {
      console.log(`   • Add metaTitle to ${results.missingTitle.length} posts`);
    }
    
    if (results.missingDescription.length > 0) {
      console.log(`   • Add metaDescription to ${results.missingDescription.length} posts`);
    }
    
    if (results.titleTooShort.length > 0 || results.titleTooLong.length > 0) {
      console.log(`   • Adjust ${results.titleTooShort.length + results.titleTooLong.length} titles to ${TITLE_MIN_LENGTH}-${TITLE_MAX_LENGTH} characters`);
    }
    
    if (results.descTooShort.length > 0 || results.descTooLong.length > 0) {
      console.log(`   • Adjust ${results.descTooShort.length + results.descTooLong.length} descriptions to ${DESC_MIN_LENGTH}-${DESC_MAX_LENGTH} characters`);
    }
    
    if (results.duplicateTitles.length > 0 || results.duplicateDescriptions.length > 0) {
      console.log(`   • Fix ${results.duplicateTitles.length + results.duplicateDescriptions.length} duplicate meta tags`);
    }
    
    console.log(`   • Use descriptive, unique titles that include target keywords`);
    console.log(`   • Write compelling descriptions that encourage clicks`);
    console.log('');
  }
  
  // Return results for potential programmatic use
  return {
    total: results.total,
    compliant: results.compliant,
    issues: results.total - results.compliant,
    missingTitle: results.missingTitle.length,
    missingDescription: results.missingDescription.length,
    titleIssues: results.titleTooShort.length + results.titleTooLong.length,
    descIssues: results.descTooShort.length + results.descTooLong.length,
    duplicates: results.duplicateTitles.length + results.duplicateDescriptions.length,
    errors: results.errors.length
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Starting meta tag audit...\n');
  
  // Scan blog directory
  if (fs.existsSync(BLOG_DIR)) {
    console.log(`📁 Scanning: ${BLOG_DIR}`);
    scanBlogDirectory();
  } else {
    console.log(`❌ Blog directory not found: ${BLOG_DIR}`);
    process.exit(1);
  }
  
  // Generate and display report
  const report = generateReport();
  
  // Exit with appropriate code
  if (report.issues > 0) {
    console.log(`❌ Audit completed with ${report.issues} issues found.`);
    process.exit(1);
  } else {
    console.log(`✅ All meta tags are compliant!`);
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, auditBlogPost, generateReport }; 