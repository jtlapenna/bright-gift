#!/usr/bin/env node

/**
 * Redirect Monitoring Script
 * Checks that all redirects use 301 status codes instead of 308
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// URLs to test for redirect consistency
const testUrls = [
  // Blog URLs without trailing slashes
  'https://bright-gift.com/blog/gifts-for-girlfriend-unique-romantic-ideas',
  'https://bright-gift.com/blog/gifts-for-remote-workers-under-50',
  'https://bright-gift.com/blog/eco-friendly-gift-ideas-for-every-budget',
  'https://bright-gift.com/blog/gifts-for-plant-lovers',
  'https://bright-gift.com/blog/gifts-for-gamers-under-50',
  
  // Category URLs
  'https://bright-gift.com/category/gift-guide',
  'https://bright-gift.com/category/data-driven',
  
  // Static pages
  'https://bright-gift.com/terms',
  'https://bright-gift.com/privacy',
  
  // Missing pages
  'https://bright-gift.com/ai-gift-guide',
  'https://bright-gift.com/top-gifts',
];

function checkRedirect(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        location: res.headers.location,
        server: res.headers.server,
        isRedirect: res.statusCode >= 300 && res.statusCode < 400,
        is301: res.statusCode === 301,
        is308: res.statusCode === 308
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        error: err.message,
        status: 'ERROR'
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        error: 'Timeout',
        status: 'TIMEOUT'
      });
    });
    
    req.end();
  });
}

async function monitorRedirects() {
  console.log('🔍 Monitoring redirect consistency...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    const result = await checkRedirect(url);
    results.push(result);
    
    // Display result
    if (result.error) {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${result.error}\n`);
    } else if (result.isRedirect) {
      const status = result.is301 ? '✅ 301' : result.is308 ? '⚠️  308' : `ℹ️  ${result.status}`;
      console.log(`${status} ${url}`);
      console.log(`   → ${result.location}\n`);
    } else {
      console.log(`ℹ️  ${result.status} ${url} (no redirect)\n`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  const redirects = results.filter(r => r.isRedirect);
  const status301 = redirects.filter(r => r.is301);
  const status308 = redirects.filter(r => r.is308);
  const errors = results.filter(r => r.error);
  
  console.log('📊 SUMMARY:');
  console.log(`   Total URLs tested: ${testUrls.length}`);
  console.log(`   Redirects found: ${redirects.length}`);
  console.log(`   ✅ 301 redirects: ${status301.length}`);
  console.log(`   ⚠️  308 redirects: ${status308.length}`);
  console.log(`   ❌ Errors: ${errors.length}`);
  
  if (status308.length > 0) {
    console.log('\n⚠️  WARNING: 308 redirects detected!');
    console.log('   These should be 301 redirects for proper SEO value transfer.');
    status308.forEach(r => {
      console.log(`   - ${r.url} → ${r.location}`);
    });
  }
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS detected:');
    errors.forEach(r => {
      console.log(`   - ${r.url}: ${r.error}`);
    });
  }
  
  if (status308.length === 0 && errors.length === 0) {
    console.log('\n🎉 All redirects are using proper 301 status codes!');
  }
}

// Run the monitoring
monitorRedirects().catch(console.error);
