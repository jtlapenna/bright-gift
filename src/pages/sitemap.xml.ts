import { getCollection } from 'astro:content';

export async function GET() {
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
    '/terms'
  ];

  // Generate URLs for static pages
  const staticUrls = staticPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastmod: new Date().toISOString(),
    changefreq: page === '' ? 'daily' : 'weekly',
    priority: page === '' ? 1.0 : 0.8
  }));

  // Generate URLs for blog posts
  const blogUrls = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastmod: new Date(post.data.date).toISOString(),
    changefreq: 'monthly',
    priority: 0.7
  }));

  // Generate URLs for gift guides
  const guideUrls = giftGuides.map(guide => ({
    url: `${baseUrl}/blog/${guide.slug}`,
    lastmod: new Date(guide.data.date).toISOString(),
    changefreq: 'monthly',
    priority: 0.8
  }));

  // Generate URLs for FAQs
  const faqUrls = faqs.map(faq => ({
    url: `${baseUrl}/blog/${faq.slug}`,
    lastmod: new Date(faq.data.date).toISOString(),
    changefreq: 'monthly',
    priority: 0.6
  }));

  const allUrls = [...staticUrls, ...blogUrls, ...guideUrls, ...faqUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 