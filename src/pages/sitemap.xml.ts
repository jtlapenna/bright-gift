import { getCollection } from 'astro:content';

export async function GET() {
  // Only include published (draft: false) content
  const blogPosts = await getCollection('blog', ({ data }) => !data.draft);
  const giftGuides = await getCollection('gift-guides', ({ data }) => !data.draft);
  const faqs = await getCollection('faqs', ({ data }) => !data.draft);

  const baseUrl = 'https://bright-gift.com';
  
  // Static pages
  const staticPages = [
    '',
    '/blog',
    '/about',
    '/privacy',
    '/terms',
    '/top-gifts'
  ];

  // Generate URLs for static pages
  const staticUrls = staticPages.map(page => {
    // Set a lower priority for the top-gifts page until it's ready to be linked in navigation
    // This page is currently hidden from navigation until we have the necessary content
    const priority = page === '' ? 1.0 : 
                    page === '/top-gifts' ? 0.5 : 0.8;
    
    return {
      url: `${baseUrl}${page}`,
      lastmod: new Date().toISOString(),
      changefreq: page === '' ? 'daily' : 'weekly',
      priority
    };
  });

  // Only include real, published blog posts
  const blogUrls = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastmod: new Date(post.data.date).toISOString(),
    changefreq: 'monthly',
    priority: 0.7
  }));

  // Only include real, published gift guides under /gift-guides/
  const guideUrls = giftGuides.map(guide => ({
    url: `${baseUrl}/gift-guides/${guide.slug}/`,
    lastmod: new Date(guide.data.date).toISOString(),
    changefreq: 'monthly',
    priority: 0.8
  }));

  // Only include real, published FAQs
  const faqUrls = faqs.map(faq => ({
    url: `${baseUrl}/blog/${faq.slug}`,
    lastmod: new Date(faq.data.date).toISOString(),
    changefreq: 'monthly',
    priority: 0.6
  }));

  const allUrls = [...staticUrls, ...blogUrls, ...guideUrls, ...faqUrls];

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