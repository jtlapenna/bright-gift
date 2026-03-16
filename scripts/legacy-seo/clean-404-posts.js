#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of problematic slugs that should be removed
const PROBLEMATIC_SLUGS = [
  'sample-post',
  'handmade-gifts', 
  'placeholder',
  'test',
  'draft'
];

// List of 404 URLs from Google Search Console
const FOUR_OH_FOUR_URLS = [
  'https://bright-gift.com/blog/gifts-for-artists',
  'https://bright-gift.com/blog/unique-birthday-gifts-for-teens-break-the-mold',
  'https://bright-gift.com/blog/best-books-for-different-reading-levels.md',
  'https://bright-gift.com/blog/eco-friendly-gifts',
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
  'https://bright-gift.com/gift-guides/gifts-for-plant-lovers',
  'https://bright-gift.com/gift-guides/gifts-for-gamers-under-50/',
  'https://bright-gift.com/gift-guides/gifts-under-25-for-coworkers/',
  'https://bright-gift.com/about'
];

function analyze404Urls() {
  console.log('🔍 Analyzing 404 URLs from Google Search Console...\n');
  
  const blogUrls = FOUR_OH_FOUR_URLS.filter(url => url.includes('/blog/'));
  const giftGuideUrls = FOUR_OH_FOUR_URLS.filter(url => url.includes('/gift-guides/'));
  const otherUrls = FOUR_OH_FOUR_URLS.filter(url => !url.includes('/blog/') && !url.includes('/gift-guides/'));
  
  console.log(`📊 Breakdown:`);
  console.log(`   Blog URLs: ${blogUrls.length}`);
  console.log(`   Gift Guide URLs: ${giftGuideUrls.length}`);
  console.log(`   Other URLs: ${otherUrls.length}`);
  console.log('');
  
  // Analyze .md extension issues
  const mdExtensionUrls = blogUrls.filter(url => url.endsWith('.md'));
  console.log(`📝 URLs with .md extension: ${mdExtensionUrls.length}`);
  mdExtensionUrls.forEach(url => {
    console.log(`   - ${url}`);
  });
  console.log('');
  
  // Extract slugs from blog URLs
  const blogSlugs = blogUrls.map(url => {
    const slug = url.replace('https://bright-gift.com/blog/', '').replace('.md', '');
    return slug;
  });
  
  console.log(`📋 Blog slugs from 404s:`);
  blogSlugs.forEach(slug => {
    console.log(`   - ${slug}`);
  });
  console.log('');
  
  return { blogSlugs, giftGuideUrls, otherUrls };
}

function checkExistingPosts() {
  console.log('📁 Checking existing blog posts...\n');
  
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  
  console.log(`📊 Found ${files.length} blog posts`);
  
  const slugs = files.map(file => file.replace('.md', ''));
  
  // Check for problematic posts
  const problematicPosts = files.filter(file => {
    const slug = file.replace('.md', '');
    return PROBLEMATIC_SLUGS.some(problematic => slug.includes(problematic));
  });
  
  if (problematicPosts.length > 0) {
    console.log(`⚠️  Found ${problematicPosts.length} problematic posts:`);
    problematicPosts.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log('');
  } else {
    console.log('✅ No problematic posts found');
    console.log('');
  }
  
  return { files, slugs, problematicPosts };
}

function generateRecommendations(blogSlugs, existingSlugs, problematicPosts) {
  console.log('💡 Recommendations:\n');
  
  // Check if 404 slugs exist as files
  const missingSlugs = blogSlugs.filter(slug => !existingSlugs.includes(slug));
  const existing404Slugs = blogSlugs.filter(slug => existingSlugs.includes(slug));
  
  if (missingSlugs.length > 0) {
    console.log(`❌ Missing blog posts (404s but no files):`);
    missingSlugs.forEach(slug => {
      console.log(`   - ${slug}`);
    });
    console.log('');
  }
  
  if (existing404Slugs.length > 0) {
    console.log(`⚠️  Existing posts that are 404ing (check routing):`);
    existing404Slugs.forEach(slug => {
      console.log(`   - ${slug}`);
    });
    console.log('');
  }
  
  if (problematicPosts.length > 0) {
    console.log(`🗑️  Posts to remove:`);
    problematicPosts.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log('');
  }
  
  console.log('🔧 Actions needed:');
  console.log('   1. Remove problematic posts (if any)');
  console.log('   2. Fix routing for existing posts that 404');
  console.log('   3. Remove .md extensions from URLs in sitemap');
  console.log('   4. Create missing pages or redirect them');
  console.log('   5. Update Google Search Console to remove 404s');
}

// Run analysis
const { blogSlugs, giftGuideUrls, otherUrls } = analyze404Urls();
const { files, slugs, problematicPosts } = checkExistingPosts();
generateRecommendations(blogSlugs, slugs, problematicPosts); 