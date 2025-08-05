import { getCollection } from 'astro:content';

export async function GET() {
  try {
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

  // Category pages
  const categories = [...new Set(blogPosts.map(post => post.data.category))].filter(Boolean);
  const categoryUrls = categories.map(category => ({
    url: `${baseUrl}/category/${category}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.8
  }));

  // Exclude specific slugs/IDs from sitemap (404s in GSC)
  const excludedBlogSlugs = [
    'sample-post', 
    'handmade-gifts',
    'placeholder',
    'test',
    'draft'
  ];

  // Only include real, published blog posts, excluding problematic slugs
  const blogUrls = blogPosts
    .filter(post => {
      try {
        const slug = post.id.replace('.md', '');
        return !excludedBlogSlugs.some(excluded => slug.includes(excluded));
      } catch (error) {
        console.error('Error filtering blog post:', post.id, error);
        return false;
      }
    })
    .map(post => {
      try {
        return {
          url: `${baseUrl}/blog/${post.id.replace('.md', '')}`,
          lastmod: new Date(post.data.date || new Date()).toISOString(),
          changefreq: 'monthly',
          priority: 0.7
        };
      } catch (error) {
        console.error('Error processing blog post:', post.id, error);
        return null;
      }
    })
    .filter(Boolean); // Remove any null entries

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
      { url: 'https://bright-gift.com', lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
      { url: 'https://bright-gift.com/blog', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 },
      { url: 'https://bright-gift.com/privacy', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.3 },
      { url: 'https://bright-gift.com/terms', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.3 },
      { url: 'https://bright-gift.com/data-deletion', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.3 }
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