#!/usr/bin/env node

/**
 * Verify Noindex Fix Script
 * 
 * This script verifies that the noindex fix is working correctly
 * by checking the meta robots tags on blog pagination pages.
 */

const https = require('https');

console.log('🔍 Verifying Noindex Fix');
console.log('========================\n');

const testUrls = [
  'https://bright-gift.com/blog/',
  'https://bright-gift.com/blog/?page=2',
  'https://bright-gift.com/blog/?page=4'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const robotsMatch = data.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        const robotsContent = robotsMatch ? robotsMatch[1] : 'Not found';
        
        console.log(`📄 ${url}`);
        console.log(`   Robots: ${robotsContent}`);
        
        if (robotsContent.includes('noindex')) {
          console.log(`   ❌ ISSUE: Contains noindex`);
        } else if (robotsContent.includes('index, follow')) {
          console.log(`   ✅ GOOD: Contains index, follow`);
        } else {
          console.log(`   ⚠️  WARNING: Unexpected robots content`);
        }
        console.log('');
        
        resolve({
          url,
          robots: robotsContent,
          hasNoindex: robotsContent.includes('noindex'),
          hasIndexFollow: robotsContent.includes('index, follow')
        });
      });
    }).on('error', (err) => {
      console.log(`❌ Error checking ${url}: ${err.message}`);
      resolve({ url, error: err.message });
    });
  });
}

async function main() {
  console.log('Testing blog pagination pages for noindex issues...\n');
  
  const results = await Promise.all(testUrls.map(checkUrl));
  
  const issues = results.filter(r => r.hasNoindex);
  const working = results.filter(r => r.hasIndexFollow);
  
  console.log('📊 SUMMARY:');
  console.log(`✅ Working pages: ${working.length}`);
  console.log(`❌ Pages with issues: ${issues.length}`);
  
  if (issues.length === 0) {
    console.log('\n🎉 All pages are working correctly!');
    console.log('The noindex fix is successful. Google should re-crawl these pages soon.');
  } else {
    console.log('\n⚠️  Some pages still have issues:');
    issues.forEach(issue => {
      console.log(`   - ${issue.url}: ${issue.robots}`);
    });
  }
}

main().catch(console.error);
