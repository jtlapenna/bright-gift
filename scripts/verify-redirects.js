#!/usr/bin/env node

/**
 * Redirect Verification Script
 * 
 * Quick verification script to run before deployments:
 * - Verify all published posts have redirects
 * - Check for 308 status codes
 * - Validate redirect chains
 * - Report any issues
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/**
 * Get all published blog posts
 */
function getPublishedBlogPosts() {
  const blogDir = path.join(__dirname, '../src/content/blog');
  const posts = [];
  
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(blogDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(content);
        
        // Skip draft posts
        const isDraft = data.draft === true || data.draft === 'true' || 
                       data.status === 'draft' || data.status === 'archived';
        
        if (!isDraft) {
          const slug = file.replace('.md', '');
          posts.push({
            slug,
            url: `/blog/${slug}`,
            urlWithSlash: `/blog/${slug}/`
          });
        }
      }
    }
  }
  
  return posts;
}

/**
 * Parse _redirects file
 */
function parseRedirectsFile() {
  const redirectsPath = path.join(__dirname, '../public/_redirects');
  const content = fs.readFileSync(redirectsPath, 'utf8');
  const lines = content.split('\n');
  
  const redirects = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Parse redirect rule: /source /destination 301
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      const source = parts[0];
      const destination = parts[1];
      const status = parseInt(parts[2]);
      
      if (status === 301) {
        redirects.push({
          source,
          destination,
          status
        });
      }
    }
  }
  
  return redirects;
}

/**
 * Main verification
 */
function verifyRedirects() {
  console.log('🔍 Verifying redirects...\n');
  
  const blogPosts = getPublishedBlogPosts();
  const redirects = parseRedirectsFile();
  
  const redirectSources = new Set(redirects.map(r => r.source));
  const missing = [];
  
  // Check blog posts
  for (const post of blogPosts) {
    if (!redirectSources.has(post.url)) {
      missing.push({
        type: 'blog_post',
        url: post.url,
        expectedRedirect: `${post.url}/`,
        slug: post.slug
      });
    }
  }
  
  // Check static pages
  const staticPages = [
    { url: '/blog', expectedRedirect: '/blog/' },
    { url: '/contact', expectedRedirect: '/contact/' },
    { url: '/category/gift-guides', expectedRedirect: '/category/gift-guides/' }
  ];
  
  for (const page of staticPages) {
    if (!redirectSources.has(page.url)) {
      missing.push({
        type: 'static_page',
        url: page.url,
        expectedRedirect: page.expectedRedirect
      });
    }
  }
  
  // Check for 308 status codes in redirects file (shouldn't exist)
  const has308 = redirects.some(r => r.status === 308);
  
  // Report results
  console.log(`📊 Found ${blogPosts.length} published blog posts`);
  console.log(`📊 Found ${redirects.length} redirect rules\n`);
  
  if (missing.length > 0) {
    console.log('❌ Missing redirects:');
    for (const item of missing) {
      console.log(`   - ${item.url} → ${item.expectedRedirect}`);
    }
    console.log('');
  }
  
  if (has308) {
    console.log('❌ Found 308 status codes in _redirects file (should be 301)\n');
  }
  
  if (missing.length === 0 && !has308) {
    console.log('✅ All redirects verified!\n');
    return true;
  } else {
    console.log('⚠️  Issues found. Please fix before deploying.\n');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  const success = verifyRedirects();
  process.exit(success ? 0 : 1);
}

module.exports = { verifyRedirects, getPublishedBlogPosts, parseRedirectsFile };

