#!/usr/bin/env node

/**
 * Fix Sitemap Timestamps Script
 * 
 * This script updates all sitemap timestamps to current date
 * to signal fresh content to Google and improve crawlability.
 */

const fs = require('fs');
const path = require('path');

console.log('🕒 Fixing Sitemap Timestamps for Better Crawlability');
console.log('====================================================\n');

function fixSitemapTimestamps() {
  console.log('📅 Updating all sitemap timestamps to current date...');
  
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Update ALL lastmod timestamps to today
  const updatedSitemap = sitemap.replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
    `<lastmod>${currentDate}</lastmod>`
  );
  
  fs.writeFileSync(sitemapPath, updatedSitemap);
  
  // Count how many timestamps were updated
  const timestampCount = (sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length;
  
  console.log(`✅ Updated ${timestampCount} timestamps to ${currentDate}`);
  console.log(`📁 Sitemap updated: ${sitemapPath}`);
  
  return currentDate;
}

function verifySitemap() {
  console.log('\n🔍 Verifying sitemap structure...');
  
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  
  // Check for common issues
  const issues = [];
  
  // Check for URLs without trailing slashes
  const urlsWithoutSlashes = sitemap.match(/<loc>https:\/\/bright-gift\.com\/[^\/]+<\/loc>/g);
  if (urlsWithoutSlashes) {
    issues.push(`❌ Found ${urlsWithoutSlashes.length} URLs without trailing slashes`);
  }
  
  // Check for .md URLs
  const mdUrls = sitemap.match(/<loc>.*\.md<\/loc>/g);
  if (mdUrls) {
    issues.push(`❌ Found ${mdUrls.length} URLs with .md extensions`);
  }
  
  // Check for mixed timestamps
  const timestamps = sitemap.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g);
  const uniqueTimestamps = [...new Set(timestamps)];
  if (uniqueTimestamps.length > 1) {
    issues.push(`⚠️  Found ${uniqueTimestamps.length} different timestamps (should be 1)`);
  }
  
  // Check total URL count
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  console.log(`📊 Total URLs in sitemap: ${urlCount}`);
  
  if (issues.length === 0) {
    console.log('✅ Sitemap structure looks good!');
  } else {
    console.log('⚠️  Sitemap issues found:');
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
  return issues.length === 0;
}

// Main execution
try {
  const currentDate = fixSitemapTimestamps();
  const isValid = verifySitemap();
  
  if (isValid) {
    console.log('\n🎉 Sitemap timestamp fix complete!');
    console.log('\nNext steps:');
    console.log('1. Deploy this updated sitemap');
    console.log('2. Submit to Google Search Console');
    console.log('3. Monitor for improved crawlability');
  } else {
    console.log('\n⚠️  Sitemap has issues that need attention');
  }
  
} catch (error) {
  console.error('❌ Error fixing sitemap timestamps:', error);
  process.exit(1);
}
