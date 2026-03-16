#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const {
  SITE_ORIGIN,
  canonicalBlogUrl,
  getSitemapLastModified,
  shouldIncludeBlogPostInSitemap
} = require('./utilities/canonical-url-policy');

// Function to get all blog posts (excluding drafts)
function getBlogPosts() {
  const blogDir = path.join(__dirname, '../src/content/blog');
  const posts = [];
  
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(blogDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(content);
        
        // Skip draft posts (check both draft field and status field)
        const isDraft = data.draft === true || data.draft === 'true' || 
                       data.status === 'draft' || data.status === 'archived';
        
        if (isDraft) {
          continue; // Skip this post
        }
        
        const slug = file.replace('.md', '');

        if (!shouldIncludeBlogPostInSitemap(slug)) {
          continue;
        }
        
        posts.push({
          slug,
          pubDate: data.date || new Date(),
          lastModified: getSitemapLastModified(data),
          title: data.title || slug
        });
      }
    }
  }
  
  // Sort by publication date (newest first)
  return posts.sort((a, b) => {
    const dateA = new Date(a.pubDate);
    const dateB = new Date(b.pubDate);
    return dateB - dateA;
  });
}
// Function to generate sitemap XML
function generateSitemap() {
  const blogPosts = getBlogPosts();
  
  // Static pages (with trailing slashes)
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/blog/', priority: '0.8', changefreq: 'weekly' },
    { url: '/category/gift-guides/', priority: '0.8', changefreq: 'weekly' },
    { url: '/category/gift-tips/', priority: '0.8', changefreq: 'weekly' },
    { url: '/unique-gift-ideas/', priority: '0.7', changefreq: 'monthly' },
    { url: '/thoughtful-gift-ideas/', priority: '0.7', changefreq: 'monthly' },
    { url: '/last-minute-gift-ideas/', priority: '0.7', changefreq: 'monthly' },
    { url: '/gifts-under-50/', priority: '0.7', changefreq: 'monthly' },
    { url: '/gifts-for-people-who-have-everything/', priority: '0.7', changefreq: 'monthly' },
    { url: '/gift-ideas-for-hard-to-shop-for-people/', priority: '0.7', changefreq: 'monthly' },
    { url: '/privacy/', priority: '0.3', changefreq: 'monthly' },
    { url: '/terms/', priority: '0.3', changefreq: 'monthly' },
    { url: '/contact/', priority: '0.3', changefreq: 'monthly' },
    { url: '/data-deletion/', priority: '0.3', changefreq: 'monthly' }
  ];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  
  // Add static pages
  for (const page of staticPages) {
    sitemap += `
  <url>
    <loc>${SITE_ORIGIN}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }
  
  // Add blog posts (with trailing slashes)
  for (const post of blogPosts) {
    sitemap += `
  <url>
    <loc>${canonicalBlogUrl(post.slug)}</loc>`;
    if (post.lastModified) {
      sitemap += `
    <lastmod>${post.lastModified}</lastmod>`;
    }
    sitemap += `
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }
  
  sitemap += `
</urlset>`;
  
  return sitemap;
}

// Main execution
try {
  const sitemap = generateSitemap();
  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  
  // Ensure public directory exists
  const publicDir = path.dirname(outputPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write sitemap
  fs.writeFileSync(outputPath, sitemap);
  
  const blogPosts = getBlogPosts();
  const staticPageCount = 14; // Home, blog, 2 category pages, 6 landing pages, privacy, terms, contact, data-deletion
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📊 Total URLs: ${staticPageCount + blogPosts.length} (${staticPageCount} static + ${blogPosts.length} blog posts)`);
  console.log(`📁 Output: ${outputPath}`);
  
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
