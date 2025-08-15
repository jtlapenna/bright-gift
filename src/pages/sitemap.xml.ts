import { getCollection } from 'astro:content';

export async function GET() {
  try {
    // Include only published content; ignore archived/draft
    const blogPosts = await getCollection('blog', ({ data }) => {
      const status = (data as any).status || 'published';
      const isDraft = Boolean((data as any).draft);
      return status === 'published' && !isDraft;
    });

    const baseUrl = 'https://bright-gift.com';
  
  // Static pages (canonical with trailing slashes)
  const staticPages = [
    '/',
    '/blog/',
    '/privacy/',
    '/terms/',
    '/data-deletion/'
  ];

  // Generate URLs for static pages
  const staticUrls = staticPages.map(page => {
    const priority = page === '/' ? 1.0 : 0.8;
    
    return {
      url: `${baseUrl}${page}`,
      lastmod: new Date().toISOString(),
      changefreq: page === '' ? 'daily' : 'weekly',
      priority
    };
  });

  // Category pages
  const categories = [...new Set(blogPosts.map(post => post.data.category))].filter(Boolean);
  const categoryUrls = categories.map(category => ({
    url: `${baseUrl}/category/${category}/`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.8
  }));

  // Ensure uniqueness and canonical trailing slashes
  const seen = new Set<string>();

  // Only include real, published blog posts, ensuring canonical slashes and modern lastmod fallback
  const blogUrls = blogPosts
    .map(post => {
      try {
        const cleanSlug = post.slug; // Astro provides a clean slug
        const url = `${baseUrl}/blog/${cleanSlug}/`;
        if (seen.has(url)) return null;
        seen.add(url);
        const dateValue = (post.data as any).date || (post.data as any).pubDate || new Date().toISOString();
        return {
          url,
          lastmod: new Date(dateValue).toISOString(),
          changefreq: 'monthly',
          priority: 0.7
        };
      } catch (error) {
        console.error('Error processing blog post:', post.slug, error);
        return null;
      }
    })
    .filter(Boolean as any);

    const allUrls = [...staticUrls, ...categoryUrls, ...blogUrls];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>\n    <loc>${url.url}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Return a basic sitemap with just static pages if there's an error
    const basicUrls = [
      { url: 'https://bright-gift.com/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
      { url: 'https://bright-gift.com/blog/', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 },
      { url: 'https://bright-gift.com/privacy/', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.3 },
      { url: 'https://bright-gift.com/terms/', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.3 },
      { url: 'https://bright-gift.com/data-deletion/', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.3 }
    ];

    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${basicUrls.map(url => `  <url>\n    <loc>${url.url}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`).join('\n')}
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
} 