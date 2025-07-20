#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BLOG_DIR = 'src/content/blog';
const PUBLIC_DIR = 'public/images';

console.log('🔍 CHECKING FOR REMAINING ISSUES\n');
console.log('=' .repeat(50));

// Check for large image files
function checkLargeImages() {
  console.log('\n📸 CHECKING FOR LARGE IMAGE FILES...');
  
  const largeImages = [];
  
  function scanDirectory(dir, maxSize = 500 * 1024) { // 500KB
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath, maxSize);
        } else if (stat.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(item)) {
          if (stat.size > maxSize) {
            largeImages.push({
              path: fullPath,
              size: stat.size,
              sizeKB: Math.round(stat.size / 1024)
            });
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }
  
  scanDirectory(PUBLIC_DIR);
  
  if (largeImages.length > 0) {
    console.log(`❌ Found ${largeImages.length} large images:`);
    largeImages.forEach(img => {
      console.log(`   - ${img.path}: ${img.sizeKB}KB`);
    });
  } else {
    console.log('✅ No large images found');
  }
  
  return largeImages;
}

// Check for orphan pages (pages with no internal links)
function checkOrphanPages() {
  console.log('\n🔗 CHECKING FOR ORPHAN PAGES...');
  
  const allPages = [];
  const linkedPages = new Set();
  
  // Get all blog posts
  const blogFiles = fs.readdirSync(BLOG_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace('.md', ''));
  
  allPages.push(...blogFiles);
  
  // Find all internal links
  for (const file of fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))) {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    
    // Find markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const linkUrl = match[2];
      
      // Extract page slug from internal links
      if (linkUrl.includes('/blog/')) {
        const slug = linkUrl.split('/blog/')[1]?.split('/')[0];
        if (slug) {
          linkedPages.add(slug);
        }
      }
    }
  }
  
  const orphanPages = allPages.filter(page => !linkedPages.has(page));
  
  if (orphanPages.length > 0) {
    console.log(`❌ Found ${orphanPages.length} orphan pages:`);
    orphanPages.forEach(page => {
      console.log(`   - ${page}`);
    });
  } else {
    console.log('✅ No orphan pages found');
  }
  
  return orphanPages;
}

// Check for missing meta descriptions or titles
function checkMetaContent() {
  console.log('\n📝 CHECKING META CONTENT...');
  
  const issues = [];
  
  const files = fs.readdirSync(BLOG_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(BLOG_DIR, file));
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      
      // Check for missing metaDescription
      if (!frontmatter.includes('metaDescription:')) {
        issues.push(`${path.basename(file)}: Missing metaDescription`);
      }
      
      // Check for missing metaTitle
      if (!frontmatter.includes('metaTitle:')) {
        issues.push(`${path.basename(file)}: Missing metaTitle`);
      }
      
      // Check for missing description
      if (!frontmatter.includes('description:')) {
        issues.push(`${path.basename(file)}: Missing description`);
      }
    }
  }
  
  if (issues.length > 0) {
    console.log(`❌ Found ${issues.length} meta content issues:`);
    issues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  } else {
    console.log('✅ All meta content present');
  }
  
  return issues;
}

// Check for structured data issues
function checkStructuredData() {
  console.log('\n🏷️ CHECKING STRUCTURED DATA...');
  
  const astroFiles = [];
  
  function scanAstroFiles(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanAstroFiles(fullPath);
        } else if (stat.isFile() && item.endsWith('.astro')) {
          astroFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }
  
  scanAstroFiles('src/pages');
  
  const structuredDataIssues = [];
  
  for (const file of astroFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for JSON-LD structured data
    if (content.includes('application/ld+json')) {
      const jsonLdMatch = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      
      if (jsonLdMatch) {
        try {
          JSON.parse(jsonLdMatch[1]);
        } catch (error) {
          structuredDataIssues.push(`${path.basename(file)}: Invalid JSON-LD`);
        }
      }
    }
  }
  
  if (structuredDataIssues.length > 0) {
    console.log(`❌ Found ${structuredDataIssues.length} structured data issues:`);
    structuredDataIssues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  } else {
    console.log('✅ No structured data issues found');
  }
  
  return structuredDataIssues;
}

// Main execution
async function main() {
  const largeImages = checkLargeImages();
  const orphanPages = checkOrphanPages();
  const metaIssues = checkMetaContent();
  const structuredDataIssues = checkStructuredData();
  
  console.log('\n📊 SUMMARY OF REMAINING ISSUES');
  console.log('=' .repeat(50));
  
  const totalIssues = largeImages.length + orphanPages.length + metaIssues.length + structuredDataIssues.length;
  
  if (totalIssues === 0) {
    console.log('🎉 EXCELLENT! No remaining issues found!');
    console.log('The site is in excellent technical condition.');
  } else {
    console.log(`Found ${totalIssues} total issues to address:`);
    console.log(`   - Large images: ${largeImages.length}`);
    console.log(`   - Orphan pages: ${orphanPages.length}`);
    console.log(`   - Meta content issues: ${metaIssues.length}`);
    console.log(`   - Structured data issues: ${structuredDataIssues.length}`);
  }
  
  console.log('\n💡 RECOMMENDATIONS:');
  if (largeImages.length > 0) {
    console.log('   - Compress large images to improve page load times');
  }
  if (orphanPages.length > 0) {
    console.log('   - Add internal links to orphan pages for better SEO');
  }
  if (metaIssues.length > 0) {
    console.log('   - Add missing meta descriptions and titles');
  }
  if (structuredDataIssues.length > 0) {
    console.log('   - Fix JSON-LD structured data validation errors');
  }
}

main(); 