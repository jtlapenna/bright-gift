#!/usr/bin/env node

/**
 * Force Google Reindexing Script
 * 
 * This script implements multiple strategies to force Google to reindex
 * the BrightGift site after fixing critical SEO issues.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 BrightGift Reindexing Strategy Implementation');
console.log('================================================\n');

// 1. Update sitemap with current timestamp
function updateSitemapTimestamp() {
  console.log('📅 Updating sitemap timestamp...');
  
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Update all lastmod timestamps to today
  const updatedSitemap = sitemap.replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
    `<lastmod>${currentDate}</lastmod>`
  );
  
  fs.writeFileSync(sitemapPath, updatedSitemap);
  console.log('✅ Sitemap timestamps updated to', currentDate);
}

// 2. Generate robots.txt with aggressive crawling hints
function updateRobotsTxt() {
  console.log('🤖 Updating robots.txt for aggressive crawling...');
  
  const robotsContent = `User-agent: *
Allow: /

# Sitemap location
Sitemap: https://bright-gift.com/sitemap.xml

# Crawl delay (reduced for faster indexing)
Crawl-delay: 0

# Allow all search engines to crawl the site
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 0

User-agent: Slurp
Allow: /
Crawl-delay: 0

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 0

User-agent: Baiduspider
Allow: /
Crawl-delay: 0

User-agent: YandexBot
Allow: /
Crawl-delay: 0

# Block access to admin areas (if any exist in future)
Disallow: /admin/
Disallow: /private/
Disallow: /temp/

# Block access to placeholder images (social media only, not for SEO)
Disallow: /placeholders/
Disallow: /social-assets/

# Force reindexing hints
# Last updated: ${new Date().toISOString()}
`;

  const robotsPath = path.join(__dirname, '../public/robots.txt');
  fs.writeFileSync(robotsPath, robotsContent);
  console.log('✅ Robots.txt updated with aggressive crawling settings');
}

// 3. Generate URL list for manual submission
function generateUrlList() {
  console.log('📋 Generating URL list for manual submission...');
  
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  
  // Extract URLs from sitemap
  const urlMatches = sitemap.match(/<loc>(https:\/\/bright-gift\.com[^<]+)<\/loc>/g);
  const urls = urlMatches ? urlMatches.map(match => match.replace('<loc>', '').replace('</loc>', '')) : [];
  
  // Generate text file for manual submission
  const urlListPath = path.join(__dirname, '../urls-for-reindexing.txt');
  const urlListContent = urls.join('\n');
  fs.writeFileSync(urlListPath, urlListContent);
  
  console.log(`✅ Generated ${urls.length} URLs for manual submission`);
  console.log(`📁 URL list saved to: ${urlListPath}`);
  
  return urls;
}

// 4. Generate Google Search Console submission commands
function generateGSCCommands(urls) {
  console.log('🔍 Generating Google Search Console commands...');
  
  const commands = [
    'Google Search Console Actions:',
    '================================',
    '',
    '1. Submit updated sitemap:',
    '   - Go to: https://search.google.com/search-console',
    '   - Select your property: bright-gift.com',
    '   - Go to Sitemaps section',
    '   - Submit: https://bright-gift.com/sitemap.xml',
    '',
    '2. Request indexing for key pages:',
    '   - Go to URL Inspection tool',
    '   - Test these critical URLs:',
    ''
  ];
  
  // Add top 10 most important URLs
  const criticalUrls = urls.slice(0, 10);
  criticalUrls.forEach((url, index) => {
    commands.push(`   ${index + 1}. ${url}`);
  });
  
  commands.push('');
  commands.push('3. Use "Request Indexing" for each URL above');
  commands.push('');
  commands.push('4. Monitor Coverage report for improvements');
  commands.push('');
  commands.push('5. Check Performance report for traffic increases');
  
  const commandsPath = path.join(__dirname, '../gsc-reindexing-commands.txt');
  fs.writeFileSync(commandsPath, commands.join('\n'));
  
  console.log('✅ GSC commands generated');
  console.log(`📁 Commands saved to: ${commandsPath}`);
}

// 5. Generate internal linking boost
function generateInternalLinkingBoost() {
  console.log('🔗 Generating internal linking boost strategy...');
  
  const strategy = [
    'Internal Linking Boost Strategy:',
    '===============================',
    '',
    '1. Add more internal links between blog posts',
    '2. Create topic clusters around popular keywords',
    '3. Add "Related Posts" sections to each blog post',
    '4. Create category landing pages with links to all posts',
    '5. Add breadcrumb navigation',
    '',
    'Implementation:',
    '- Update blog post templates to include related posts',
    '- Add more cross-linking between similar topics',
    '- Create hub pages for major categories',
    '- Ensure every page has at least 3-5 internal links'
  ];
  
  const strategyPath = path.join(__dirname, '../internal-linking-strategy.txt');
  fs.writeFileSync(strategyPath, strategy.join('\n'));
  
  console.log('✅ Internal linking strategy generated');
  console.log(`📁 Strategy saved to: ${strategyPath}`);
}

// Main execution
try {
  updateSitemapTimestamp();
  updateRobotsTxt();
  const urls = generateUrlList();
  generateGSCCommands(urls);
  generateInternalLinkingBoost();
  
  console.log('\n🎉 Reindexing strategy implementation complete!');
  console.log('\nNext steps:');
  console.log('1. Deploy these changes to production');
  console.log('2. Follow the GSC commands in gsc-reindexing-commands.txt');
  console.log('3. Monitor Google Search Console for improvements');
  console.log('4. Check site performance in 24-48 hours');
  
} catch (error) {
  console.error('❌ Error implementing reindexing strategy:', error);
  process.exit(1);
}
