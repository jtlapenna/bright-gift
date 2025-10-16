#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Function to get all blog posts
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
        const slug = file.replace('.md', '');
        
        posts.push({
          slug,
          pubDate: data.date || new Date(),
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
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Static pages (with trailing slashes)
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/blog/', priority: '0.8', changefreq: 'weekly' },
    { url: '/category/gift-guides/', priority: '0.8', changefreq: 'weekly' },
    { url: '/category/gift-tips/', priority: '0.8', changefreq: 'weekly' },
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
    <loc>https://bright-gift.com${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }
  
  // Add blog posts (with trailing slashes)
  for (const post of blogPosts) {
    const pubDate = post.pubDate ? new Date(post.pubDate).toISOString().split('T')[0] : currentDate;
    sitemap += `
  <url>
    <loc>https://bright-gift.com/blog/${post.slug}/</loc>
    <lastmod>${pubDate}</lastmod>
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
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📊 Total URLs: ${7 + blogPosts.length} (${7} static + ${blogPosts.length} blog posts)`);
  console.log(`📁 Output: ${outputPath}`);
  
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
