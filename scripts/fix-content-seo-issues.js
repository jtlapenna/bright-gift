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

// Function to fix content SEO issues
function fixContentSeoIssues(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    let modified = false;
    const fixes = [];

    // Fix meta description length (should be 150-160 characters)
    if (data.metaDescription) {
      const desc = data.metaDescription;
      if (desc.length > 160) {
        data.metaDescription = desc.substring(0, 157) + '...';
        modified = true;
        fixes.push(`Fixed meta description length: ${desc.length} → ${data.metaDescription.length} chars`);
      } else if (desc.length < 120) {
        // Add more descriptive text if too short
        const enhanced = desc + ' Discover the best gift ideas, tips, and recommendations for every occasion.';
        if (enhanced.length <= 160) {
          data.metaDescription = enhanced;
          modified = true;
          fixes.push(`Enhanced meta description: ${desc.length} → ${enhanced.length} chars`);
        }
      }
    }

    // Fix title length (should be 50-60 characters)
    if (data.metaTitle) {
      const title = data.metaTitle;
      if (title.length > 60) {
        data.metaTitle = title.substring(0, 57) + '...';
        modified = true;
        fixes.push(`Fixed meta title length: ${title.length} → ${data.metaTitle.length} chars`);
      }
    }

    // Fix multiple H1 tags in content
    const h1Matches = content.match(/^#\s+/gm);
    if (h1Matches && h1Matches.length > 1) {
      // Convert all H1s except the first one to H2s
      let newContent = content;
      let h1Count = 0;
      newContent = newContent.replace(/^#\s+/gm, (match) => {
        h1Count++;
        if (h1Count === 1) {
          return match; // Keep first H1
        } else {
          return '## '; // Convert others to H2
        }
      });
      
      if (newContent !== content) {
        content = newContent;
        modified = true;
        fixes.push(`Fixed multiple H1 tags: ${h1Matches.length} → 1 (converted others to H2)`);
      }
    }

    // Ensure proper noindex handling
    if (data.draft === true || data.status === 'draft') {
      // If it's a draft, make sure it's not in sitemap
      if (!data.noindex) {
        data.noindex = true;
        modified = true;
        fixes.push('Added noindex to draft post');
      }
    }

    if (modified) {
      const newFileContent = matter.stringify(content, data);
      fs.writeFileSync(filePath, newFileContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      fixes.forEach(fix => console.log(`   ${fix}`));
      return { fixed: true, fixes };
    } else {
      console.log(`✅ Clean: ${filePath}`);
      return { fixed: false, fixes: [] };
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { fixed: false, fixes: [`Error: ${error.message}`] };
  }
}

// Function to generate SEO report
function generateSeoReport() {
  console.log('🔍 Generating SEO Content Report...\n');
  
  const blogDir = path.join(__dirname, '..', 'src', 'content', 'blog');
  const report = {
    totalPosts: 0,
    metaDescriptionIssues: 0,
    metaTitleIssues: 0,
    multipleH1Issues: 0,
    draftPosts: 0
  };

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile() && item.endsWith('.md')) {
        try {
          const fileContent = fs.readFileSync(fullPath, 'utf8');
          const { data, content } = matter(fileContent);
          
          report.totalPosts++;
          
          // Check meta description
          if (data.metaDescription) {
            if (data.metaDescription.length > 160 || data.metaDescription.length < 120) {
              report.metaDescriptionIssues++;
            }
          }
          
          // Check meta title
          if (data.metaTitle && data.metaTitle.length > 60) {
            report.metaTitleIssues++;
          }
          
          // Check multiple H1s
          const h1Matches = content.match(/^#\s+/gm);
          if (h1Matches && h1Matches.length > 1) {
            report.multipleH1Issues++;
          }
          
          // Check drafts
          if (data.draft === true || data.status === 'draft') {
            report.draftPosts++;
          }
          
        } catch (error) {
          console.warn(`Warning: Could not process ${fullPath}: ${error.message}`);
        }
      }
    }
  }

  if (fs.existsSync(blogDir)) {
    scanDirectory(blogDir);
  }

  console.log('📊 SEO Content Report:');
  console.log(`   Total blog posts: ${report.totalPosts}`);
  console.log(`   Meta description issues: ${report.metaDescriptionIssues}`);
  console.log(`   Meta title issues: ${report.metaTitleIssues}`);
  console.log(`   Multiple H1 issues: ${report.multipleH1Issues}`);
  console.log(`   Draft posts: ${report.draftPosts}`);
  
  return report;
}

// Main execution
function main() {
  console.log('🔧 Fix Content SEO Issues Tool');
  console.log('===============================\n');
  
  // Generate SEO report first
  const report = generateSeoReport();
  console.log('\n');
  
  console.log('📁 Scanning for blog markdown files...');
  const markdownFiles = findMarkdownFiles(path.join(__dirname, '..', 'src', 'content', 'blog'));
  console.log(`📊 Found ${markdownFiles.length} blog files\n`);
  
  let fixedCount = 0;
  let totalFixes = 0;
  
  console.log('🔄 Processing files...\n');
  
  for (const filePath of markdownFiles) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`📝 Processing: ${relativePath}`);
    
    const result = fixContentSeoIssues(filePath);
    
    if (result.fixed) {
      fixedCount++;
      totalFixes += result.fixes.length;
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎯 Summary:');
  console.log(`📊 Total files processed: ${markdownFiles.length}`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`🔧 Total fixes applied: ${totalFixes}`);
  
  if (fixedCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Review the changes to ensure they look correct');
    console.log('2. Test the site to make sure content displays properly');
    console.log('3. Re-run Ahrefs audit to check for improvement');
    console.log('4. Monitor meta descriptions and titles for future posts');
  }
}

if (require.main === module) {
  main();
}

module.exports = { findMarkdownFiles, fixContentSeoIssues, generateSeoReport };
