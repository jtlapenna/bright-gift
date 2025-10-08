#!/usr/bin/env node

/**
 * Emergency SEO Recovery Script
 * 
 * This script implements immediate actions to force Google
 * to re-index and trust the site after technical fixes.
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY SEO RECOVERY SCRIPT');
console.log('================================\n');

// 1. Update all blog post dates to current date for freshness signals
function updateBlogPostDates() {
  console.log('📅 Updating blog post dates for freshness signals...');
  
  const blogDir = path.join(__dirname, '../src/content/blog');
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
  
  const currentDate = new Date().toISOString().split('T')[0];
  let updatedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update date field in frontmatter
    const dateRegex = /^date:\s*.*$/m;
    if (dateRegex.test(content)) {
      content = content.replace(dateRegex, `date: ${currentDate}`);
      fs.writeFileSync(filePath, content);
      updatedCount++;
    }
  });
  
  console.log(`✅ Updated ${updatedCount} blog post dates to ${currentDate}`);
}

// 2. Generate comprehensive sitemap with fresh timestamps
function generateFreshSitemap() {
  console.log('🗺️  Generating fresh sitemap with current timestamps...');
  
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  const currentDate = new Date().toISOString();
  
  // Read existing sitemap and update all lastmod dates
  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  
  // Update all lastmod dates to current timestamp
  sitemapContent = sitemapContent.replace(
    /<lastmod>.*?<\/lastmod>/g,
    `<lastmod>${currentDate}</lastmod>`
  );
  
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log('✅ Sitemap updated with fresh timestamps');
}

// 3. Create internal linking boost strategy
function createInternalLinkingStrategy() {
  console.log('🔗 Creating internal linking boost strategy...');
  
  const strategy = `
# Internal Linking Boost Strategy
## Immediate Actions to Improve Crawlability

### 1. Homepage Internal Links
Add these links to your homepage:
- Link to top 10 blog posts
- Link to all category pages
- Link to sitemap
- Add "Latest Posts" section

### 2. Blog Post Internal Links
For each blog post, add 3-5 internal links to:
- Related blog posts
- Category pages
- Other relevant content
- Homepage

### 3. Category Page Links
Link from each category page to:
- All posts in that category
- Related categories
- Homepage
- Popular posts

### 4. Footer Links
Add to site footer:
- All category pages
- Popular blog posts
- Sitemap link
- About page

### 5. Sidebar Links (if applicable)
- Recent posts
- Popular posts
- Category links
- Search functionality

## Implementation Priority:
1. Homepage links (highest priority)
2. Blog post internal links
3. Category page links
4. Footer links
5. Sidebar links

## Expected Impact:
- Improved crawlability
- Better page authority distribution
- Faster indexing of new content
- Higher search rankings
`;

  const strategyPath = path.join(__dirname, '../internal-linking-boost-strategy.md');
  fs.writeFileSync(strategyPath, strategy);
  console.log('✅ Internal linking strategy created');
}

// 4. Generate GSC action plan
function createGSCActionPlan() {
  console.log('📋 Creating Google Search Console action plan...');
  
  const actionPlan = `
# Google Search Console Action Plan
## Force Re-Indexing and Recovery

### IMMEDIATE ACTIONS (Do Today):

1. **Submit Updated Sitemap:**
   - Go to GSC → Sitemaps
   - Submit: https://bright-gift.com/sitemap.xml
   - Click "Submit"

2. **URL Inspection Requests:**
   Submit these URLs individually:
   - https://bright-gift.com/
   - https://bright-gift.com/blog
   - https://bright-gift.com/blog/ai-powered-gift-ideas-for-every-budget
   - https://bright-gift.com/blog/best-gifts-for-dads-who-love-outdoor-adventures
   - https://bright-gift.com/blog/eco-friendly-gift-ideas-for-every-budget

3. **Request Indexing for Each URL:**
   - Use URL Inspection tool
   - Test each URL
   - Click "Request Indexing"
   - Wait for "Success" status

4. **Monitor Coverage Report:**
   - Check for any new errors
   - Fix any issues immediately
   - Submit for re-indexing

### DAILY ACTIONS (Next 2 Weeks):

1. **Submit 5 URLs Daily:**
   - Focus on blog posts
   - Include category pages
   - Add new content as created

2. **Monitor Performance:**
   - Check search impressions
   - Look for indexing improvements
   - Track click-through rates

3. **Fix Any Issues:**
   - Address crawl errors immediately
   - Fix mobile usability issues
   - Optimize Core Web Vitals

### WEEKLY ACTIONS:

1. **Submit Sitemap Again:**
   - Re-submit sitemap weekly
   - Ensure all new content is included

2. **Review Coverage:**
   - Check for new indexing issues
   - Fix any problems found

3. **Performance Analysis:**
   - Review search performance
   - Identify top-performing content
   - Optimize underperforming pages

## Expected Timeline:
- Day 1-3: First re-indexing requests
- Week 1-2: Increased search impressions
- Week 3-4: Significant traffic growth
- Month 2+: Full recovery

## Success Metrics:
- Indexed pages increasing
- Search impressions growing
- Click-through rates improving
- Organic traffic returning
`;

  const actionPlanPath = path.join(__dirname, '../gsc-emergency-action-plan.md');
  fs.writeFileSync(actionPlanPath, actionPlan);
  console.log('✅ GSC action plan created');
}

// 5. Create content freshness strategy
function createContentFreshnessStrategy() {
  console.log('🔄 Creating content freshness strategy...');
  
  const strategy = `
# Content Freshness Strategy
## Signal to Google That Your Site is Active and Updated

### Immediate Actions (This Week):

1. **Update Existing Blog Posts:**
   - Add "Last Updated: [Current Date]" to 10 posts
   - Update product recommendations with current prices
   - Add new sections or tips
   - Update internal links

2. **Create New Content:**
   - Publish 3 new blog posts this week
   - Focus on trending topics
   - Use current dates in frontmatter
   - Target long-tail keywords

3. **Update Homepage:**
   - Add "Latest Posts" section
   - Update featured content
   - Add current date somewhere visible
   - Refresh testimonials or reviews

### Content Ideas for This Week:

**New Blog Posts:**
1. "2025 Holiday Gift Trends: What's Hot This Season"
2. "Last-Minute Gift Ideas That Actually Impress"
3. "Eco-Friendly Gifts for the Conscious Consumer"

**Update Existing Posts:**
1. Add current year to titles
2. Update Amazon product links
3. Add new product recommendations
4. Include recent statistics or data

### Long-term Strategy:

1. **Publishing Schedule:**
   - 3 blog posts per week minimum
   - 1 major guide per month
   - Seasonal content 2 months early

2. **Content Updates:**
   - Update popular posts monthly
   - Refresh product recommendations
   - Add new internal links
   - Update meta descriptions

3. **Freshness Signals:**
   - Regular publishing schedule
   - Updated timestamps
   - New content categories
   - Seasonal relevance

## Expected Impact:
- Google sees site as active
- Increased crawl frequency
- Better indexing priority
- Higher search rankings
`;

  const strategyPath = path.join(__dirname, '../content-freshness-strategy.md');
  fs.writeFileSync(strategyPath, strategy);
  console.log('✅ Content freshness strategy created');
}

// Main execution
try {
  updateBlogPostDates();
  generateFreshSitemap();
  createInternalLinkingStrategy();
  createGSCActionPlan();
  createContentFreshnessStrategy();
  
  console.log('\n🎉 EMERGENCY SEO RECOVERY COMPLETE!');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Follow the GSC action plan (gsc-emergency-action-plan.md)');
  console.log('2. Implement internal linking strategy');
  console.log('3. Create fresh content this week');
  console.log('4. Monitor Google Search Console daily');
  console.log('5. Submit URLs for indexing daily');
  
  console.log('\n📁 FILES CREATED:');
  console.log('- internal-linking-boost-strategy.md');
  console.log('- gsc-emergency-action-plan.md');
  console.log('- content-freshness-strategy.md');
  
  console.log('\n⏰ EXPECTED TIMELINE:');
  console.log('- 24-48 hours: First re-indexing requests');
  console.log('- 1-2 weeks: Increased search impressions');
  console.log('- 3-4 weeks: Significant traffic growth');
  
} catch (error) {
  console.error('❌ Error during SEO recovery:', error);
  process.exit(1);
}
