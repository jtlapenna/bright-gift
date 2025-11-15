#!/usr/bin/env node

/**
 * Crawl Budget Recovery Strategy
 * 
 * This script implements multiple strategies to recover from crawl budget depletion
 * and force Google to prioritize crawling the BrightGift site.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Crawl Budget Recovery Strategy');
console.log('=================================\n');

// 1. Create high-priority content signals
function createContentSignals() {
  console.log('📝 Creating content freshness signals...');
  
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Update all blog post frontmatter with current date
  const blogDir = path.join(__dirname, '../src/content/blog');
  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  
  let updatedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update date to current date if it's older than 30 days
    const dateMatch = content.match(/date:\s*'(\d{4}-\d{2}-\d{2})'/);
    if (dateMatch) {
      const fileDate = new Date(dateMatch[1]);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (fileDate < thirtyDaysAgo) {
        content = content.replace(/date:\s*'\d{4}-\d{2}-\d{2}'/, `date: '${currentDate}'`);
        fs.writeFileSync(filePath, content);
        updatedCount++;
      }
    }
  });
  
  console.log(`✅ Updated ${updatedCount} blog posts with current date`);
}

// 2. Generate internal linking boost
function generateInternalLinkingBoost() {
  console.log('🔗 Generating internal linking strategy...');
  
  const strategy = [
    'Internal Linking Boost Strategy:',
    '===============================',
    '',
    '1. Add "Related Posts" sections to each blog post',
    '2. Create topic clusters around popular keywords',
    '3. Add more cross-linking between similar topics',
    '4. Create hub pages for major categories',
    '5. Add breadcrumb navigation',
    '',
    'Implementation Priority:',
    '- Start with highest-traffic pages',
    '- Focus on pages with good keyword rankings',
    '- Link to newer content from older posts',
    '- Create topic clusters (3-5 related posts)',
    '',
    'Expected Impact:',
    '- Increased crawl frequency',
    '- Better page discovery',
    '- Improved crawl budget allocation',
    '- Higher priority in Google\'s queue'
  ];
  
  const strategyPath = path.join(__dirname, '../_workflow-documents/seo/internal-linking-boost-strategy.txt');
  fs.writeFileSync(strategyPath, strategy.join('\n'));
  
  console.log('✅ Internal linking strategy generated');
  console.log(`📁 Strategy saved to: ${strategyPath}`);
}

// 3. Create crawl budget recovery plan
function createCrawlBudgetRecoveryPlan() {
  console.log('📋 Creating crawl budget recovery plan...');
  
  const plan = [
    'Crawl Budget Recovery Plan',
    '==========================',
    '',
    'IMMEDIATE ACTIONS (Today):',
    '1. Cancel all pending validations in Google Search Console',
    '2. Submit updated sitemap with current timestamps',
    '3. Request indexing for top 10 most important pages',
    '4. Check for any manual actions or penalties',
    '',
    'WEEK 1 ACTIONS:',
    '1. Update 5-10 blog posts with fresh content',
    '2. Add internal links to newer posts from older ones',
    '3. Create topic clusters around popular keywords',
    '4. Monitor crawl stats daily in GSC',
    '',
    'WEEK 2 ACTIONS:',
    '1. Publish 2-3 new blog posts',
    '2. Add "Related Posts" sections to all blog posts',
    '3. Create category hub pages with links to all posts',
    '4. Submit new content for immediate indexing',
    '',
    'WEEK 3-4 ACTIONS:',
    '1. Continue publishing fresh content',
    '2. Build more internal links',
    '3. Monitor and improve crawl efficiency',
    '4. Track progress in GSC',
    '',
    'TECHNICAL OPTIMIZATIONS:',
    '1. Ensure all pages load fast (< 3 seconds)',
    '2. Fix any crawl errors immediately',
    '3. Remove duplicate content',
    '4. Optimize images and resources',
    '',
    'CONTENT STRATEGY:',
    '1. Focus on high-value, long-tail keywords',
    '2. Create comprehensive, in-depth content',
    '3. Update existing content regularly',
    '4. Add fresh insights and current information',
    '',
    'MONITORING:',
    '1. Check GSC crawl stats daily',
    '2. Monitor indexed pages count',
    '3. Track organic traffic improvements',
    '4. Watch for crawl error increases',
    '',
    'EXPECTED TIMELINE:',
    '- Week 1: 10-20 pages indexed',
    '- Week 2: 25-35 pages indexed',
    '- Week 3: 35-45 pages indexed',
    '- Week 4: 40+ pages indexed, normal crawl frequency'
  ];
  
  const planPath = path.join(__dirname, '../_workflow-documents/seo/crawl-budget-recovery-plan.txt');
  fs.writeFileSync(planPath, plan.join('\n'));
  
  console.log('✅ Crawl budget recovery plan generated');
  console.log(`📁 Plan saved to: ${planPath}`);
}

// 4. Generate Google Search Console actions
function generateGSCActions() {
  console.log('🔍 Generating Google Search Console actions...');
  
  const actions = [
    'Google Search Console Actions for Crawl Budget Recovery',
    '======================================================',
    '',
    'IMMEDIATE ACTIONS (Do These Today):',
    '',
    '1. CANCEL PENDING VALIDATIONS:',
    '   - Go to: https://search.google.com/search-console',
    '   - Select your property: bright-gift.com',
    '   - Go to "Page indexing" > "Not found (404)"',
    '   - Click "Cancel validation" for all pending requests',
    '   - This clears the stuck validation queue',
    '',
    '2. RESUBMIT SITEMAP:',
    '   - Go to "Sitemaps" section',
    '   - Remove existing sitemap submission',
    '   - Submit new sitemap: https://bright-gift.com/sitemap.xml',
    '   - This forces Google to re-crawl your sitemap',
    '',
    '3. REQUEST IMMEDIATE INDEXING:',
    '   - Use URL Inspection tool for these critical pages:',
    '   - https://bright-gift.com/',
    '   - https://bright-gift.com/blog',
    '   - https://bright-gift.com/blog/ai-powered-gift-ideas-for-every-budget',
    '   - https://bright-gift.com/blog/unique-graduation-gifts-creative-minds',
    '   - https://bright-gift.com/blog/top-gifts-for-yoga-enthusiasts-beginners-to-advanced-practitioners',
    '   - Click "Request Indexing" for each',
    '',
    '4. CHECK FOR MANUAL ACTIONS:',
    '   - Go to "Security & Manual Actions"',
    '   - Check for any manual actions or penalties',
    '   - Look for security issues',
    '',
    '5. MONITOR CRAWL STATS:',
    '   - Go to "Settings" > "Crawl stats"',
    '   - Check when Google last crawled your site',
    '   - Look for crawl error trends',
    '',
    'WEEKLY MONITORING:',
    '1. Check "Coverage" report for indexed pages',
    '2. Monitor "Performance" for traffic improvements',
    '3. Watch "Page Experience" for Core Web Vitals',
    '4. Track "Sitemaps" for submission status',
    '',
    'EXPECTED RESULTS:',
    '- Week 1: 0 pending validations, 10+ pages indexed',
    '- Week 2: 25+ pages indexed, increased crawl frequency',
    '- Week 3: 35+ pages indexed, normal crawl patterns',
    '- Week 4: 40+ pages indexed, regular organic traffic'
  ];
  
  const actionsPath = path.join(__dirname, '../_workflow-documents/seo/gsc-crawl-recovery-actions.txt');
  fs.writeFileSync(actionsPath, actions.join('\n'));
  
  console.log('✅ GSC actions generated');
  console.log(`📁 Actions saved to: ${actionsPath}`);
}

// Main execution
try {
  createContentSignals();
  generateInternalLinkingBoost();
  createCrawlBudgetRecoveryPlan();
  generateGSCActions();
  
  console.log('\n🎉 Crawl budget recovery strategy complete!');
  console.log('\nNext steps:');
  console.log('1. Deploy the content updates');
  console.log('2. Follow the GSC actions in _workflow-documents/seo/gsc-crawl-recovery-actions.txt');
  console.log('3. Implement the internal linking strategy');
  console.log('4. Monitor progress daily');
  
} catch (error) {
  console.error('❌ Error implementing crawl budget recovery:', error);
  process.exit(1);
}
