#!/usr/bin/env node

/**
 * Safe script to fix malformed affiliate links with duplicate attributes
 * 
 * Fixes patterns like:
 *   target="_blank" rel="noopener" target="_blank" rel="noopener" target="_blank" rel="sponsored noopener"
 * 
 * To:
 *   target="_blank" rel="noopener sponsored"
 * 
 * This script is safe and only fixes malformed links, preserving all other content.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../src/content/blog');

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

// Function to fix malformed affiliate links in a file
function fixMalformedLinks(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;
    
    // Pattern 1: Fix duplicate target and rel attributes
    // Matches: target="_blank" rel="noopener" target="_blank" rel="noopener" target="_blank" rel="sponsored noopener"
    // Or: target="_blank" rel="noopener" target="_blank" rel="noopener" target="_blank" rel="noopener"
    const duplicatePattern = /target="_blank"\s+rel="noopener"\s+target="_blank"\s+rel="noopener"\s+target="_blank"\s+rel="([^"]+)"/g;
    
    content = content.replace(duplicatePattern, (match, lastRel) => {
      modified = true;
      // Determine final rel value: prefer "sponsored" if present, otherwise "noopener"
      if (lastRel.includes('sponsored')) {
        return 'target="_blank" rel="noopener sponsored"';
      }
      return 'target="_blank" rel="noopener"';
    });
    
    // Pattern 2: Fix cases with just duplicate target="_blank" rel="noopener"
    const duplicateNoopenerPattern = /target="_blank"\s+rel="noopener"\s+target="_blank"\s+rel="noopener"/g;
    
    content = content.replace(duplicateNoopenerPattern, () => {
      modified = true;
      return 'target="_blank" rel="noopener sponsored"';
    });
    
    // Pattern 3: Fix cases where rel="sponsored noopener" should be "noopener sponsored"
    // This is more semantic (noopener first, then sponsored)
    const relOrderPattern = /rel="sponsored\s+noopener"/g;
    
    content = content.replace(relOrderPattern, () => {
      modified = true;
      return 'rel="noopener sponsored"';
    });
    
    // Pattern 4: Fix links that have rel="noopener" but missing "sponsored"
    const missingSponsoredPattern = /<a\s+([^>]*href="(https?:\/\/(www\.)?(amazon\.com|bookshop\.org|arjdj2msd\.com)[^"]*)"[^>]*rel="noopener"[^>]*)>/g;
    
    content = content.replace(missingSponsoredPattern, (match, attributes) => {
      modified = true;
      // Replace rel="noopener" with rel="noopener sponsored"
      return match.replace('rel="noopener"', 'rel="noopener sponsored"');
    });
    
    // Pattern 5: Ensure all affiliate links have proper format
    // Fix Amazon, Bookshop, and Afrofiliate links to use consistent format
    const affiliateLinkPattern = /<a\s+([^>]*href="(https?:\/\/(www\.)?(amazon\.com|bookshop\.org|arjdj2msd\.com)[^"]*)"[^>]*)>/g;
    
    content = content.replace(affiliateLinkPattern, (match, attributes) => {
      // Check if this link already has correct format
      if (attributes.includes('target="_blank"') && attributes.includes('rel=')) {
        // Check if it's malformed
        const targetCount = (attributes.match(/target="_blank"/g) || []).length;
        const relCount = (attributes.match(/rel="/g) || []).length;
        
        if (targetCount > 1 || relCount > 1) {
          modified = true;
          // Extract href and class
          const hrefMatch = attributes.match(/href="([^"]+)"/);
          const classMatch = attributes.match(/class="([^"]+)"/);
          
          if (hrefMatch && classMatch) {
            const href = hrefMatch[1];
            const className = classMatch[1];
            return `<a href="${href}" class="${className}" target="_blank" rel="noopener sponsored">`;
          }
        }
        return match; // Already correct or handled by other patterns
      }
      
      // Link missing target or rel - add them
      if (!attributes.includes('target="_blank"') || !attributes.includes('rel=')) {
        modified = true;
        // Extract href and class
        const hrefMatch = attributes.match(/href="([^"]+)"/);
        const classMatch = attributes.match(/class="([^"]+)"/);
        
        if (hrefMatch) {
          const href = hrefMatch[1];
          const className = classMatch ? classMatch[1] : 'amazon-link';
          // Remove any existing target or rel from attributes
          let cleanAttributes = attributes
            .replace(/target="[^"]*"/g, '')
            .replace(/rel="[^"]*"/g, '')
            .trim();
          
          return `<a href="${href}" class="${className}" target="_blank" rel="noopener sponsored">`;
        }
      }
      
      return match;
    });
    
    if (modified) {
      // Verify the fix didn't break anything
      const linkCount = (content.match(/<a[^>]*>/g) || []).length;
      const originalLinkCount = (originalContent.match(/<a[^>]*>/g) || []).length;
      
      if (linkCount !== originalLinkCount) {
        console.error(`⚠️  WARNING: Link count changed in ${filePath}`);
        console.error(`   Original: ${originalLinkCount}, New: ${linkCount}`);
        return false; // Don't save if link count changed
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔧 Fixing Malformed Affiliate Links');
  console.log('📁 Scanning for markdown files...\n');
  
  const markdownFiles = findMarkdownFiles(BLOG_DIR);
  console.log(`📊 Found ${markdownFiles.length} markdown files\n`);
  
  let fixedCount = 0;
  let errorCount = 0;
  
  console.log('🔄 Processing files...\n');
  
  for (const filePath of markdownFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    process.stdout.write(`📝 ${relativePath}... `);
    
    try {
      if (fixMalformedLinks(filePath)) {
        console.log('✅ Fixed');
        fixedCount++;
      } else {
        console.log('⏭️  No changes needed');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Summary:');
  console.log(`📊 Total files processed: ${markdownFiles.length}`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`⏭️  Files unchanged: ${markdownFiles.length - fixedCount - errorCount}`);
  if (errorCount > 0) {
    console.log(`❌ Files with errors: ${errorCount}`);
  }
  console.log('='.repeat(60));
  
  if (fixedCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Review the changes: git diff');
    console.log('2. Test the build: npm run build');
    console.log('3. Verify links work correctly');
    console.log('4. Commit the changes');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findMarkdownFiles, fixMalformedLinks };

