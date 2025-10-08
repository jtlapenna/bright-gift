#!/usr/bin/env node

/**
 * SEO Fixes Verification Script
 * Verifies that all critical SEO issues have been resolved
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying SEO Fixes...\n');

// 1. Check that only one content config exists
function verifyContentConfig() {
  console.log('1. Checking content configuration...');
  
  const configJs = fs.existsSync('src/content/config.js');
  const configTs = fs.existsSync('src/content/config.ts');
  
  if (configJs) {
    console.log('❌ Duplicate config.js still exists');
    return false;
  }
  
  if (!configTs) {
    console.log('❌ config.ts missing');
    return false;
  }
  
  console.log('✅ Single content config (TypeScript) exists');
  return true;
}

// 2. Check sitemap contains all blog posts
function verifySitemap() {
  console.log('\n2. Checking sitemap completeness...');
  
  const sitemapPath = 'public/sitemap.xml';
  if (!fs.existsSync(sitemapPath)) {
    console.log('❌ Sitemap not found');
    return false;
  }
  
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const blogPostUrls = (sitemap.match(/<loc>https:\/\/bright-gift\.com\/blog\/[^\/]+<\/loc>/g) || []).length;
  
  console.log(`📊 Blog posts in sitemap: ${blogPostUrls}`);
  
  if (blogPostUrls < 40) {
    console.log('❌ Sitemap missing blog posts (expected 40+)');
    return false;
  }
  
  console.log('✅ Sitemap contains all blog posts');
  return true;
}

// 3. Check no JavaScript redirects remain
function verifyNoJsRedirects() {
  console.log('\n3. Checking for JavaScript redirects...');
  
  const giftGeneratorPath = 'src/pages/gift-idea-generator/index.astro';
  if (!fs.existsSync(giftGeneratorPath)) {
    console.log('❌ Gift generator page not found');
    return false;
  }
  
  const content = fs.readFileSync(giftGeneratorPath, 'utf8');
  
  if (content.includes('window.location.replace')) {
    console.log('❌ JavaScript redirect still present');
    return false;
  }
  
  if (!content.includes('Astro.redirect')) {
    console.log('❌ Server redirect not implemented');
    return false;
  }
  
  console.log('✅ JavaScript redirects replaced with server redirects');
  return true;
}

// 4. Check robots.txt consolidation
function verifyRobotsTxt() {
  console.log('\n4. Checking robots.txt consolidation...');
  
  const staticRobots = fs.existsSync('public/robots.txt');
  const dynamicRobots = fs.existsSync('src/pages/robots.txt.ts');
  
  if (!staticRobots) {
    console.log('❌ Static robots.txt missing');
    return false;
  }
  
  if (dynamicRobots) {
    console.log('❌ Dynamic robots.txt still exists (conflict)');
    return false;
  }
  
  console.log('✅ Single robots.txt method (static)');
  return true;
}

// 5. Check for common SEO issues
function verifyCommonIssues() {
  console.log('\n5. Checking for common SEO issues...');
  
  const issues = [];
  
  // Check for noindex tags in main pages
  const blogIndexPath = 'src/pages/blog/index.astro';
  if (fs.existsSync(blogIndexPath)) {
    const content = fs.readFileSync(blogIndexPath, 'utf8');
    if (content.includes('noindex: true')) {
      issues.push('Blog index has noindex tag');
    }
  }
  
  // Check for malformed URLs
  const apiPath = 'src/pages/api/blog-posts.ts';
  if (fs.existsSync(apiPath)) {
    const content = fs.readFileSync(apiPath, 'utf8');
    if (content.includes('$/{')) {
      issues.push('Malformed URLs in API endpoints');
    }
  }
  
  if (issues.length > 0) {
    console.log('❌ SEO issues found:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    return false;
  }
  
  console.log('✅ No common SEO issues detected');
  return true;
}

// Main verification
function main() {
  const checks = [
    verifyContentConfig(),
    verifySitemap(),
    verifyNoJsRedirects(),
    verifyRobotsTxt(),
    verifyCommonIssues()
  ];
  
  const passed = checks.filter(Boolean).length;
  const total = checks.length;
  
  console.log(`\n📊 Verification Results: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('🎉 All SEO fixes verified successfully!');
    console.log('\n✅ Ready for deployment');
    console.log('✅ Sitemap contains all blog posts');
    console.log('✅ No JavaScript redirects');
    console.log('✅ Single robots.txt method');
    console.log('✅ No common SEO issues');
  } else {
    console.log('⚠️  Some issues remain - review failed checks above');
  }
  
  return passed === total;
}

// Run verification
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main };
