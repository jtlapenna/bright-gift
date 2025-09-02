import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const robotsContent = `User-agent: *
Allow: /

# Sitemap location
Sitemap: https://bright-gift.com/sitemap.xml

# Crawl delay (optional - helps with server load)
Crawl-delay: 1

# Allow all search engines to crawl the site
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

# Block access to admin areas (if any exist in future)
Disallow: /admin/
Disallow: /private/
Disallow: /temp/

# Block all markdown files completely
Disallow: /*.md
Disallow: /blog/*.md

# Block blog index page (search results) to prevent crawling of JavaScript templates
Disallow: /blog/`;

  return new Response(robotsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': 'inline',
    },
  });
};
