#!/usr/bin/env node

const https = require('https');

// Key URLs to monitor daily (subset of the full test)
const keyUrls = [
  'https://bright-gift.com/blog/gifts-for-artists',
  'https://bright-gift.com/category/data-driven/',
  'https://bright-gift.com/contact',
  'https://bright-gift.com/privacy',
  'https://bright-gift.com/terms',
  'https://bright-gift.com/blog/gifts-for-girlfriend-unique-romantic-ideas',
  'https://bright-gift.com/ai-gift-guide'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        location: res.headers.location || 'N/A'
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        location: err.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        location: 'Request timeout'
      });
    });
    
    req.end();
  });
}

async function runDailyCheck() {
  console.log('🔍 DAILY SEO HEALTH CHECK');
  console.log('==========================\n');
  
  const results = [];
  
  for (const url of keyUrls) {
    process.stdout.write(`Testing ${url}... `);
    const result = await testUrl(url);
    results.push(result);
    
    const status = result.status === 200 || result.status === 301 || result.status === 308 ? '✅' : '❌';
    console.log(`${status} ${result.status}`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 SUMMARY:');
  const working = results.filter(r => r.status === 200 || r.status === 301 || r.status === 308).length;
  const total = results.length;
  const percentage = Math.round((working / total) * 100);
  
  console.log(`Working URLs: ${working}/${total} (${percentage}%)`);
  
  if (percentage === 100) {
    console.log('🎉 All critical URLs working perfectly!');
  } else {
    console.log('⚠️  Some URLs need attention');
    results.filter(r => r.status !== 200 && r.status !== 301 && r.status !== 308).forEach(r => {
      console.log(`   ❌ ${r.url} - ${r.status}`);
    });
  }
  
  console.log(`\n📅 Checked at: ${new Date().toISOString()}`);
  console.log('\n💡 Run this daily to track technical health while waiting for GSC updates');
}

runDailyCheck().catch(console.error);

