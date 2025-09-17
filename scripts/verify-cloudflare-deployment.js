#!/usr/bin/env node

/**
 * Verify Cloudflare Deployment Script
 * 
 * This script helps verify that the Cloudflare Pages deployment
 * is working correctly after the nixpacks.toml fix.
 */

const https = require('https');

console.log('🚀 VERIFYING CLOUDFLARE DEPLOYMENT');
console.log('==================================\n');

// Test URLs to verify deployment
const testUrls = [
  'https://bright-gift.com/',
  'https://bright-gift.com/blog/',
  'https://bright-gift.com/sitemap.xml',
  'https://bright-gift.com/robots.txt'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`📄 ${url}`);
        console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
        
        if (res.statusCode === 200) {
          console.log(`   ✅ SUCCESS: Page loads correctly`);
        } else if (res.statusCode === 404) {
          console.log(`   ❌ ERROR: Page not found`);
        } else if (res.statusCode >= 300 && res.statusCode < 400) {
          console.log(`   🔄 REDIRECT: ${res.headers.location || 'Unknown location'}`);
        } else {
          console.log(`   ⚠️  WARNING: Unexpected status code`);
        }
        console.log('');
        
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode === 200
        });
      });
    }).on('error', (err) => {
      console.log(`❌ Error checking ${url}: ${err.message}`);
      resolve({ url, error: err.message, success: false });
    });
  });
}

async function main() {
  console.log('Testing key pages after Cloudflare deployment...\n');
  
  const results = await Promise.all(testUrls.map(checkUrl));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('📊 DEPLOYMENT SUMMARY:');
  console.log(`✅ Successful pages: ${successful.length}`);
  console.log(`❌ Failed pages: ${failed.length}`);
  
  if (failed.length === 0) {
    console.log('\n🎉 All pages are working correctly!');
    console.log('The nixpacks.toml fix appears to have resolved the deployment issue.');
    console.log('\nNext steps:');
    console.log('1. Check Cloudflare Pages build logs for successful prebuild script execution');
    console.log('2. Verify that new blog posts from n8n workflows are now deploying correctly');
    console.log('3. Monitor future deployments to ensure they continue working');
  } else {
    console.log('\n⚠️  Some pages are still having issues:');
    failed.forEach(failure => {
      console.log(`   - ${failure.url}: ${failure.error || `Status ${failure.status}`}`);
    });
    console.log('\nThe deployment may still be in progress. Wait a few minutes and try again.');
  }
  
  console.log('\n📋 CLOUDFLARE BUILD LOGS TO CHECK:');
  console.log('1. Go to Cloudflare Pages dashboard');
  console.log('2. Click on your project');
  console.log('3. Go to "Deployments" tab');
  console.log('4. Click on the latest deployment');
  console.log('5. Look for these success messages in the build logs:');
  console.log('   - "✅ Image validation passed"');
  console.log('   - "✅ All YAML frontmatter is valid!"');
  console.log('   - "✅ Sitemap generated successfully!"');
  console.log('   - "✓ Completed in X.XXs" (build completion)');
}

main().catch(console.error);
