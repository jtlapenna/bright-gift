#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// All URLs from the original 404 CSV that we need to monitor
const urlsToMonitor = [
  // Blog posts with .md extensions (should redirect to clean URLs)
  'https://bright-gift.com/blog/best-books-for-different-reading-levels.md',
  'https://bright-gift.com/blog/25-books-to-gift-this-holiday-season.md',
  'https://bright-gift.com/blog/best-gifts-for-dads-who-love-outdoor-adventures.md',
  'https://bright-gift.com/blog/unique-christmas-gifts-for-gamers-who-have-everything-2024.md',
  'https://bright-gift.com/blog/unique-gifts-for-board-game-enthusiasts.md',
  'https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties.md',
  'https://bright-gift.com/blog/last-minute-birthday-gifts-for-busy-professionals.md',
  'https://bright-gift.com/blog/gifts-for-book-lovers-under-50.md',
  'https://bright-gift.com/blog/special-birthday-gifts-for-lgbtq-youth.md',
  'https://bright-gift.com/blog/affordable-gifts-for-pet-lovers-under-30.md',
  'https://bright-gift.com/blog/how-ai-is-revolutionizing-gift-shopping-complete-guide.md',
  'https://bright-gift.com/blog/gifts-for-gamers-under-50.md',
  'https://bright-gift.com/blog/20-ethical-gift-ideas-for-eco-conscious-loved-ones-under-75.md',
  'https://bright-gift.com/blog/25-thoughtful-housewarming-gifts-for-new-homeowners-under-75.md',
  'https://bright-gift.com/blog/chic-wedding-gifts-for-the-stylish-couple.md',
  'https://bright-gift.com/blog/gifts-for-new-homeowners-2025.md',
  'https://bright-gift.com/blog/30-unique-gift-ideas-for-new-parents-baby-shower-beyond.md',
  'https://bright-gift.com/blog/gifts-for-remote-workers-under-50.md',
  'https://bright-gift.com/blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience.md',
  'https://bright-gift.com/blog/best-home-gifts-on-amazon-2024.md',
  'https://bright-gift.com/blog/gifts-for-girlfriend-unique-romantic-ideas.md',
  'https://bright-gift.com/blog/gifts-under-25-for-coworkers.md',
  'https://bright-gift.com/blog/gifts-for-plant-lovers.md',
  'https://bright-gift.com/blog/eco-friendly-gift-ideas-for-every-budget.md',
  'https://bright-gift.com/blog/unique-graduation-gifts-creative-minds.md',
  'https://bright-gift.com/blog/25-unique-anniversary-gift-ideas-under-50.md',
  
  // Missing pages (should redirect to appropriate pages)
  'https://bright-gift.com/ai-gift-guide',
  'https://bright-gift.com/ai-gift-guide/',
  'https://bright-gift.com/top-gifts',
  'https://bright-gift.com/top-gifts/',
  'https://bright-gift.com/about',
  'https://bright-gift.com/about/',
  
  // Non-existent blog posts (should return 410 Gone)
  'https://bright-gift.com/blog/gifts-for-artists',
  'https://bright-gift.com/blog/unique-birthday-gifts-for-teens-break-the-mold',
  'https://bright-gift.com/blog/eco-friendly-gifts',
  'https://bright-gift.com/blog/sample-post',
  'https://bright-gift.com/blog/handmade-gifts',
  
  // Old category redirects
  'https://bright-gift.com/category/data-driven/',
  'https://bright-gift.com/category/educational/',
  'https://bright-gift.com/category/gift-guide',
  'https://bright-gift.com/category/gift-guide/',
  
  // Gift guides structure fixes
  'https://bright-gift.com/gift-guides/gifts-for-plant-lovers',
  'https://bright-gift.com/gift-guides/gifts-for-plant-lovers/',
  'https://bright-gift.com/gift-guides/gifts-for-gamers-under-50/',
  'https://bright-gift.com/gift-guides/gifts-under-25-for-coworkers/',
  
  // Critical pages that should work
  'https://bright-gift.com/contact',
  'https://bright-gift.com/contact/',
  'https://bright-gift.com/privacy',
  'https://bright-gift.com/privacy/',
  'https://bright-gift.com/terms',
  'https://bright-gift.com/terms/',
  
  // Blog posts without trailing slashes (should redirect to trailing slashes)
  'https://bright-gift.com/blog/gifts-for-girlfriend-unique-romantic-ideas',
  'https://bright-gift.com/blog/gifts-for-remote-workers-under-50',
  'https://bright-gift.com/blog/eco-friendly-gift-ideas-for-every-budget',
  'https://bright-gift.com/blog/gifts-for-plant-lovers',
  'https://bright-gift.com/blog/gifts-for-gamers-under-50',
  'https://bright-gift.com/blog/gifts-for-new-homeowners-2025',
  'https://bright-gift.com/blog/20-ethical-gift-ideas-for-eco-conscious-loved-ones-under-75',
  'https://bright-gift.com/blog/last-minute-birthday-gifts-for-busy-professionals',
  'https://bright-gift.com/blog/how-to-choose-the-perfect-gift-complete-guide',
  'https://bright-gift.com/blog/eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature',
  'https://bright-gift.com/blog/best-gifts-for-dads-who-love-outdoor-adventures',
  'https://bright-gift.com/blog/luxurious-self-care-gifts-for-moms-that-theyre-sure-to-adore',
  'https://bright-gift.com/blog/unique-christmas-gifts-for-gamers-who-have-everything-2024',
  'https://bright-gift.com/blog/special-birthday-gifts-for-lgbtq-youth',
  'https://bright-gift.com/blog/how-ai-is-revolutionizing-gift-shopping-complete-guide',
  'https://bright-gift.com/blog/gifts-under-25-for-coworkers',
  'https://bright-gift.com/blog/unique-graduation-gifts-creative-minds',
  'https://bright-gift.com/blog/the-science-of-human-connection-why-we-need-each-other',
  'https://bright-gift.com/blog/why-we-remember-gifts-we-give-more-than-receive',
  'https://bright-gift.com/blog/top-gifts-for-yoga-enthusiasts-beginners-to-advanced-practitioners'
];

// Expected behaviors for each URL type
const expectedBehaviors = {
  'md-extension': { status: 301, description: 'Redirect to clean URL' },
  'missing-page': { status: 301, description: 'Redirect to appropriate page' },
  'non-existent-blog': { status: 301, description: 'Redirect to 410 Gone page' },
  'old-category': { status: 301, description: 'Redirect to new category' },
  'gift-guides-structure': { status: 301, description: 'Redirect to category page' },
  'critical-page': { status: 301, description: 'Should redirect to trailing slash (correct behavior with trailingSlash: always)' },
  'blog-no-trailing-slash': { status: 301, description: 'Redirect to trailing slash' }
};

// Categorize URLs
function categorizeUrl(url) {
  if (url.includes('.md')) return 'md-extension';
  if (['/ai-gift-guide', '/top-gifts', '/about'].some(path => url.includes(path))) return 'missing-page';
  if (['/blog/gifts-for-artists', '/blog/unique-birthday-gifts-for-teens', '/blog/eco-friendly-gifts', '/blog/sample-post', '/blog/handmade-gifts'].some(path => url.includes(path))) return 'non-existent-blog';
  if (['/category/data-driven', '/category/educational', '/category/gift-guide'].some(path => url.includes(path))) return 'old-category';
  if (url.includes('/gift-guides/')) return 'gift-guides-structure';
  if (['/contact', '/privacy', '/terms'].some(path => url.includes(path))) return 'critical-page';
  if (url.includes('/blog/') && !url.endsWith('/') && !url.includes('.md')) return 'blog-no-trailing-slash';
  return 'unknown';
}

// Test a single URL
function testUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let finalUrl = url;
      let redirectChain = [];
      
      if (res.statusCode >= 300 && res.statusCode < 400) {
        finalUrl = res.headers.location;
        redirectChain.push(`${res.statusCode} → ${finalUrl}`);
      }
      
      resolve({
        url,
        status: res.statusCode,
        finalUrl,
        redirectChain,
        responseTime,
        headers: {
          'content-type': res.headers['content-type'],
          'location': res.headers.location,
          'cache-control': res.headers['cache-control']
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        error: err.message,
        responseTime: Date.now() - startTime
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout after 10 seconds',
        responseTime: 10000
      });
    });
    
    req.end();
  });
}

// Test all URLs and generate comprehensive report
async function runComprehensiveTest() {
  console.log('🔍 COMPREHENSIVE SEO MONITORING TEST');
  console.log('=====================================\n');
  
  const results = [];
  const categories = {};
  
  // Test all URLs
  for (let i = 0; i < urlsToMonitor.length; i++) {
    const url = urlsToMonitor[i];
    const category = categorizeUrl(url);
    
    if (!categories[category]) {
      categories[category] = [];
    }
    
    process.stdout.write(`Testing ${i + 1}/${urlsToMonitor.length}: ${url}... `);
    
    const result = await testUrl(url);
    result.category = category;
    result.expected = expectedBehaviors[category];
    
    // Determine if result is correct
    if (result.expected) {
      if (result.expected.status === 200) {
        result.correct = result.status === 200;
      } else if (result.expected.status === 301) {
        result.correct = result.status === 301;
      }
    } else {
      result.correct = false;
    }
    
    // Special case: critical pages with trailing slash should return 200
    if (result.category === 'critical-page' && result.url.endsWith('/')) {
      result.correct = result.status === 200;
    }
    
    // Special case: critical pages without trailing slash should return 301 or 308
    if (result.category === 'critical-page' && !result.url.endsWith('/')) {
      result.correct = result.status === 301 || result.status === 308;
    }
    
    categories[category].push(result);
    results.push(result);
    
    const status = result.correct ? '✅' : '❌';
    console.log(`${status} ${result.status}`);
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Generate detailed report
  console.log('\n📊 DETAILED RESULTS BY CATEGORY');
  console.log('================================\n');
  
  let totalCorrect = 0;
  let totalTests = 0;
  
  for (const [category, categoryResults] of Object.entries(categories)) {
    const correct = categoryResults.filter(r => r.correct).length;
    const total = categoryResults.length;
    const percentage = Math.round((correct / total) * 100);
    
    console.log(`\n${category.toUpperCase().replace(/-/g, ' ')} (${correct}/${total} - ${percentage}%)`);
    console.log('-'.repeat(50));
    
    categoryResults.forEach(result => {
      const status = result.correct ? '✅' : '❌';
      const expected = result.expected ? `Expected: ${result.expected.status} (${result.expected.description})` : 'No expected behavior defined';
      console.log(`${status} ${result.url}`);
      console.log(`   Status: ${result.status} | ${expected}`);
      if (result.redirectChain.length > 0) {
        console.log(`   Redirects: ${result.redirectChain.join(' → ')}`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });
    
    totalCorrect += correct;
    totalTests += total;
  }
  
  // Overall summary
  const overallPercentage = Math.round((totalCorrect / totalTests) * 100);
  console.log('\n🎯 OVERALL SUMMARY');
  console.log('==================');
  console.log(`Total URLs tested: ${totalTests}`);
  console.log(`Correct responses: ${totalCorrect}`);
  console.log(`Success rate: ${overallPercentage}%`);
  
  // Critical issues
  const criticalIssues = results.filter(r => !r.correct && r.category === 'critical-page');
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES (Pages that should work but don\'t)');
    console.log('==================================================');
    criticalIssues.forEach(issue => {
      console.log(`❌ ${issue.url} - Status: ${issue.status}`);
    });
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    totalTests,
    totalCorrect,
    successRate: overallPercentage,
    categories,
    criticalIssues: criticalIssues.map(i => ({ url: i.url, status: i.status, error: i.error }))
  };
  
  const reportPath = path.join(__dirname, '../_workflow-documents/SEO_audit/comprehensive-seo-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return report;
}

// Run the test
runComprehensiveTest().catch(console.error);
