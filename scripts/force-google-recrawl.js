#!/usr/bin/env node

/**
 * Force Google Recrawl Script
 * 
 * This script implements multiple strategies to force Google to re-crawl
 * the blog pagination pages that are currently showing "Excluded by 'noindex' tag"
 * in Google Search Console.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 FORCING GOOGLE TO RE-CRAWL BLOG PAGINATION PAGES');
console.log('====================================================\n');

// 1. Update sitemap with fresh timestamps for blog pagination pages
function updateSitemapForRecrawl() {
  console.log('📝 Updating sitemap with fresh timestamps...');
  
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  
  // Add blog pagination pages to sitemap with current timestamp
  const currentDate = new Date().toISOString();
  const blogPaginationPages = [
    'https://bright-gift.com/blog/?page=2',
    'https://bright-gift.com/blog/?page=3', 
    'https://bright-gift.com/blog/?page=4',
    'https://bright-gift.com/blog/?page=5'
  ];
  
  // Find the closing </urlset> tag and insert blog pagination pages before it
  const urlsetCloseIndex = sitemapContent.lastIndexOf('</urlset>');
  if (urlsetCloseIndex !== -1) {
    const paginationUrls = blogPaginationPages.map(url => 
      `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    ).join('\n');
    
    sitemapContent = sitemapContent.slice(0, urlsetCloseIndex) + 
      '\n' + paginationUrls + '\n' + 
      sitemapContent.slice(urlsetCloseIndex);
    
    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log('✅ Added blog pagination pages to sitemap');
  }
}

// 2. Create robots.txt update to encourage faster crawling
function updateRobotsTxt() {
  console.log('🤖 Updating robots.txt for faster crawling...');
  
  const robotsPath = path.join(__dirname, '../public/robots.txt');
  let robotsContent = fs.readFileSync(robotsPath, 'utf8');
  
  // Add specific directives for blog pagination pages
  const blogPaginationDirectives = [
    '',
    '# Blog pagination pages - encourage indexing',
    'User-agent: Googlebot',
    'Allow: /blog/?page=*',
    'Crawl-delay: 0',
    '',
    'User-agent: *',
    'Allow: /blog/?page=*'
  ];
  
  robotsContent += blogPaginationDirectives.join('\n');
  fs.writeFileSync(robotsPath, robotsContent);
  console.log('✅ Updated robots.txt with blog pagination directives');
}

// 3. Create internal linking strategy
function createInternalLinkingStrategy() {
  console.log('🔗 Creating internal linking strategy...');
  
  const strategy = [
    'Internal Linking Strategy for Blog Pagination Pages',
    '==================================================',
    '',
    'GOAL: Create internal links to blog pagination pages to help Google discover them',
    '',
    'IMMEDIATE ACTIONS:',
    '',
    '1. Add pagination links to homepage:',
    '   - Add "Browse All Posts" link pointing to /blog/',
    '   - Add "Page 2", "Page 3" links in footer or sidebar',
    '',
    '2. Add pagination links to individual blog posts:',
    '   - Add "More Posts" section at bottom of each blog post',
    '   - Include links to /blog/?page=2, /blog/?page=3, etc.',
    '',
    '3. Add pagination links to category pages:',
    '   - Link to blog pagination from category pages',
    '   - Cross-link between different pagination pages',
    '',
    '4. Create a "Blog Archive" page:',
    '   - List all blog pagination pages',
    '   - Add this page to main navigation',
    '',
    'TECHNICAL IMPLEMENTATION:',
    '',
    'Add these links to your homepage template:',
    '<div class="blog-pagination-links">',
    '  <h3>Browse All Posts</h3>',
    '  <a href="/blog/">All Posts</a> |',
    '  <a href="/blog/?page=2">Page 2</a> |',
    '  <a href="/blog/?page=3">Page 3</a> |',
    '  <a href="/blog/?page=4">Page 4</a>',
    '</div>',
    '',
    'Add these links to each blog post template:',
    '<div class="more-posts-navigation">',
    '  <h4>More Gift Ideas</h4>',
    '  <a href="/blog/">Latest Posts</a> |',
    '  <a href="/blog/?page=2">Older Posts</a> |',
    '  <a href="/blog/?page=3">Archive</a>',
    '</div>'
  ];
  
  const strategyPath = path.join(__dirname, '../internal-linking-strategy.txt');
  fs.writeFileSync(strategyPath, strategy.join('\n'));
  console.log('✅ Internal linking strategy created');
}

// 4. Create GSC action plan
function createGSCActionPlan() {
  console.log('📋 Creating GSC action plan...');
  
  const actionPlan = [
    'Google Search Console Action Plan',
    '===============================',
    '',
    'CRITICAL: The "Excluded by \'noindex\' tag" issue is a GSC validation problem,',
    'not a technical problem. Our code is correct, but Google needs to re-crawl.',
    '',
    'IMMEDIATE ACTIONS (Do these NOW):',
    '',
    '1. CANCEL OLD VALIDATION:',
    '   - Go to: https://search.google.com/search-console',
    '   - Navigate to: Page indexing > Excluded by \'noindex\' tag',
    '   - Click "Cancel validation" for the failed validation (Started: 9/3/25)',
    '',
    '2. START NEW VALIDATION:',
    '   - Click "START NEW VALIDATION"',
    '   - Test these specific URLs:',
    '     • https://bright-gift.com/blog/?page=2',
    '     • https://bright-gift.com/blog/?page=3', 
    '     • https://bright-gift.com/blog/?page=4',
    '   - For each URL, click "Request Indexing"',
    '',
    '3. SUBMIT UPDATED SITEMAP:',
    '   - Go to: Sitemaps > Add a new sitemap',
    '   - Submit: https://bright-gift.com/sitemap.xml',
    '   - Click "Submit"',
    '',
    '4. USE URL INSPECTION TOOL:',
    '   - Go to: URL Inspection tool',
    '   - Test each pagination URL individually',
    '   - Click "Request Indexing" for each one',
    '',
    '5. MONITOR PROGRESS:',
    '   - Check validation status daily',
    '   - Look for "Success" status within 3-7 days',
    '   - If still failing after 7 days, contact Google Support',
    '',
    'EXPECTED TIMELINE:',
    '- Immediate: Validation requests submitted',
    '- 24-48 hours: Google re-crawls pages',
    '- 3-7 days: Pages move from "Excluded" to "Indexed"',
    '',
    'TECHNICAL VERIFICATION:',
    'Run this command to verify the fix is working:',
    'curl -s "https://bright-gift.com/blog/?page=4" | grep -i "robots"',
    '',
    'Should return: <meta name="robots" content="index, follow">',
    'If you see "noindex", the fix hasn\'t been deployed yet.',
    'If you see "index, follow", the fix is working and Google needs to re-crawl.',
    '',
    'WHY THIS HAPPENED:',
    'Google crawled these pages on September 6-11, 2025, BEFORE our fixes',
    'were deployed on September 12, 2025. The pages now have correct meta tags,',
    'but Google\'s validation system is showing outdated results.',
    '',
    'SOLUTION: Force Google to re-crawl by canceling old validations and',
    'starting new ones. This will make Google see the current, correct meta tags.'
  ];
  
  const actionPlanPath = path.join(__dirname, '../gsc-action-plan.txt');
  fs.writeFileSync(actionPlanPath, actionPlan.join('\n'));
  console.log('✅ GSC action plan created');
}

// 5. Create verification script
function createVerificationScript() {
  console.log('🔍 Creating verification script...');
  
  const script = `#!/usr/bin/env node

/**
 * Verify Blog Pagination Fix Script
 * 
 * This script verifies that the noindex fix is working correctly
 * by checking the meta robots tags on blog pagination pages.
 */

const https = require('https');

console.log('🔍 Verifying Blog Pagination Fix');
console.log('================================\\n');

const testUrls = [
  'https://bright-gift.com/blog/',
  'https://bright-gift.com/blog/?page=2',
  'https://bright-gift.com/blog/?page=3',
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
        
        console.log(\`📄 \${url}\`);
        console.log(\`   Robots: \${robotsContent}\`);
        
        if (robotsContent.includes('noindex')) {
          console.log(\`   ❌ ISSUE: Contains noindex\`);
        } else if (robotsContent.includes('index, follow')) {
          console.log(\`   ✅ GOOD: Contains index, follow\`);
        } else {
          console.log(\`   ⚠️  WARNING: Unexpected robots content\`);
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
      console.log(\`❌ Error checking \${url}: \${err.message}\`);
      resolve({ url, error: err.message });
    });
  });
}

async function main() {
  console.log('Testing blog pagination pages for noindex issues...\\n');
  
  const results = await Promise.all(testUrls.map(checkUrl));
  
  const issues = results.filter(r => r.hasNoindex);
  const working = results.filter(r => r.hasIndexFollow);
  
  console.log('📊 SUMMARY:');
  console.log(\`✅ Working pages: \${working.length}\`);
  console.log(\`❌ Pages with issues: \${issues.length}\`);
  
  if (issues.length === 0) {
    console.log('\\n🎉 All pages are working correctly!');
    console.log('The noindex fix is successful. Google should re-crawl these pages soon.');
    console.log('\\nNext steps:');
    console.log('1. Follow the GSC action plan to force re-validation');
    console.log('2. Monitor GSC for validation success');
    console.log('3. Check Ahrefs in 24-48 hours for updated results');
  } else {
    console.log('\\n⚠️  Some pages still have issues:');
    issues.forEach(issue => {
      console.log(\`   - \${issue.url}: \${issue.robots}\`);
    });
    console.log('\\nThe fix may not be deployed yet. Wait 5-10 minutes and try again.');
  }
}

main().catch(console.error);
`;

  const scriptPath = path.join(__dirname, '../scripts/verify-blog-pagination-fix.js');
  fs.writeFileSync(scriptPath, script);
  fs.chmodSync(scriptPath, '755');
  
  console.log('✅ Verification script created');
}

// Main execution
try {
  updateSitemapForRecrawl();
  updateRobotsTxt();
  createInternalLinkingStrategy();
  createGSCActionPlan();
  createVerificationScript();
  
  console.log('\n🎉 FORCE RECRAWL PREPARATION COMPLETE!');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Deploy these changes');
  console.log('2. Follow the GSC action plan (gsc-action-plan.txt)');
  console.log('3. Run verification script to confirm fixes');
  console.log('4. Monitor GSC for validation success');
  console.log('5. Check Ahrefs in 24-48 hours');
  
  console.log('\n📁 FILES CREATED:');
  console.log('- gsc-action-plan.txt (GSC instructions)');
  console.log('- internal-linking-strategy.txt (SEO strategy)');
  console.log('- scripts/verify-blog-pagination-fix.js (test script)');
  
} catch (error) {
  console.error('❌ Error preparing force recrawl:', error);
  process.exit(1);
}
