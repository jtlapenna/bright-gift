import { getCollection } from 'astro:content';

export async function GET() {
  // Only include published (draft: false) content
  const blogPosts = await getCollection('blog', ({ data }) => !data.draft);

  const baseUrl = 'https://bright-gift.com';
  
  // Static pages
  const staticPages = [
    '',
    '/blog',
    '/privacy',
    '/terms',
    '/data-deletion'
  ];

  // Generate URLs for static pages
  const staticUrls = staticPages.map(page => {
    const priority = page === '' ? 1.0 : 0.8;
    
    return {
      url: `${baseUrl}${page}`,
      lastmod: new Date().toISOString(),
      changefreq: page === '' ? 'daily' : 'weekly',
      priority
    };
  });

  // Exclude specific slugs/IDs from sitemap (404s in GSC)
  const excludedBlogSlugs = ['sample-post', 'handmade-gifts'];

  // Only include real, published blog posts, excluding problematic slugs
  const blogUrls = blogPosts
    .filter(post => !excludedBlogSlugs.includes(post.id.replace('.md', '')))
    .map(post => ({
      url: `${baseUrl}/blog/${post.id.replace('.md', '')}`,
      lastmod: new Date(post.data.date).toISOString(),
      changefreq: 'monthly',
      priority: 0.7
    }));

  const allUrls = [...staticUrls, ...blogUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>\n    <loc>${url.url}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 