#!/usr/bin/env node

/**
 * Fix .md URL Issues Script
 * Identifies and reports any .md file extensions that might be causing 404 errors
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

console.log('🔍 Scanning for .md URL issues...\n');

// Check content files for any .md references
function scanContentFiles() {
  const contentDir = path.join(projectRoot, 'src/content/blog');
  const files = fs.readdirSync(contentDir);
  
  console.log('📁 Checking blog content files...');
  
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(path.join(contentDir, file), 'utf8');
      
      // Check for any .md references in the content
      const mdMatches = content.match(/\.md/g);
      if (mdMatches) {
        console.log(`⚠️  Found .md references in ${file}: ${mdMatches.length} occurrences`);
      }
    }
  });
}

// Check for any hardcoded .md URLs in templates
function scanTemplates() {
  console.log('\n📁 Checking template files...');
  
  const templateDirs = [
    path.join(projectRoot, 'src/pages'),
    path.join(projectRoot, 'src/layouts')
  ];
  
  templateDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.endsWith('.astro') || file.endsWith('.ts') || file.endsWith('.js')) {
          const content = fs.readFileSync(path.join(dir, file), 'utf8');
          const mdMatches = content.match(/\.md/g);
          if (mdMatches) {
            console.log(`⚠️  Found .md references in ${file}: ${mdMatches.length} occurrences`);
          }
        }
      });
    }
  });
}

// Check redirects file
function checkRedirects() {
  console.log('\n📁 Checking redirects configuration...');
  
  const redirectsFile = path.join(projectRoot, 'public/_redirects');
  if (fs.existsSync(redirectsFile)) {
    const content = fs.readFileSync(redirectsFile, 'utf8');
    const mdRedirects = content.match(/\.md/g);
    if (mdRedirects) {
      console.log(`✅ Found ${mdRedirects.length} .md redirect rules in _redirects`);
    }
  } else {
    console.log('❌ _redirects file not found');
  }
}

// Check for any .md files in public directory
function checkPublicFiles() {
  console.log('\n📁 Checking public directory...');
  
  const publicDir = path.join(projectRoot, 'public');
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir, { recursive: true });
    const mdFiles = files.filter(file => typeof file === 'string' && file.endsWith('.md'));
    
    if (mdFiles.length > 0) {
      console.log(`⚠️  Found ${mdFiles.length} .md files in public directory:`);
      mdFiles.forEach(file => console.log(`   - ${file}`));
    } else {
      console.log('✅ No .md files found in public directory');
    }
  }
}

// Main execution
try {
  scanContentFiles();
  scanTemplates();
  checkRedirects();
  checkPublicFiles();
  
  console.log('\n✨ Scan complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Ensure all .md redirects are working in Cloudflare Pages');
  console.log('2. Check if any external sites are linking to .md URLs');
  console.log('3. Verify that the _headers file is preventing direct .md access');
  console.log('4. Submit a new validation in Google Search Console');
  
} catch (error) {
  console.error('❌ Error during scan:', error);
  process.exit(1);
} 