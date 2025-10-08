export async function GET() {
  const { getCollection } = await import('astro:content');
  
  // Get all blog posts
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  
  // Generate AMP sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bright-gift.com/blog/amp/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${posts.map(post => {
    const lastmod = post.data.date || post.data.pubDate || new Date().toISOString();
    return `  <url>
    <loc>https://bright-gift.com/blog/amp/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
