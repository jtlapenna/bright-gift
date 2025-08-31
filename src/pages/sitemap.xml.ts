import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  try {
    // Get all blog posts
    const blogPosts = await getCollection('blog');
    
    // Sort by publication date (newest first)
    const sortedPosts = blogPosts.sort((a, b) => {
      const dateA = a.data.pubDate || new Date(0);
      const dateB = b.data.pubDate || new Date(0);
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/blog/', priority: '0.8', changefreq: 'weekly' },
      { url: '/category/gift-guides/', priority: '0.8', changefreq: 'weekly' },
      { url: '/category/gift-tips/', priority: '0.8', changefreq: 'weekly' },
      { url: '/privacy/', priority: '0.3', changefreq: 'monthly' },
      { url: '/terms/', priority: '0.3', changefreq: 'monthly' },
      { url: '/data-deletion/', priority: '0.3', changefreq: 'monthly' }
    ];

    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    for (const page of staticPages) {
      sitemap += `
  <url>
    <loc>https://bright-gift.com${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    // Add blog posts
    for (const post of sortedPosts) {
      const pubDate = post.data.pubDate ? new Date(post.data.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
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

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};
