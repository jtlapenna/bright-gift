import type { MiddlewareHandler } from 'astro';

const generatorPrefillParams = new Set([
  'recipient',
  'interests',
  'budget',
  'styles',
  'source_cta',
  'source_variant',
  'source_experiment'
]);

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  
  // Only handle GET requests
  if (context.request.method !== 'GET') {
    return next();
  }

  const isGeneratorLanding = url.pathname === '/' || url.pathname === '/gift-idea-generator' || url.pathname === '/gift-idea-generator/';
  const hasGeneratorPrefillParams = [...url.searchParams.keys()].some((param) => generatorPrefillParams.has(param));

  if (isGeneratorLanding && hasGeneratorPrefillParams) {
    const response = await next();
    const canonicalPath = url.pathname === '/' ? '/' : '/gift-idea-generator/';

    response.headers.set('X-Robots-Tag', 'noindex, follow');
    response.headers.append('Link', `<https://bright-gift.com${canonicalPath}>; rel="canonical"`);

    return response;
  }
  
  // Skip redirects for:
  // - Root path (/)
  // - Files with extensions (.html, .css, .js, .png, etc.)
  // - API routes (CRITICAL: Don't redirect API endpoints)
  // - Static assets
  // - Static directories (like care-calculator)
  // - Blog posts and category pages (to prevent GSC validation failures)
  if (
    url.pathname === '/' ||
    url.pathname.includes('.') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/placeholders/') ||
    url.pathname.startsWith('/care-calculator') ||
    url.pathname.startsWith('/blog/') ||
    url.pathname.startsWith('/category/') ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/sitemap.xml' ||
    url.pathname === '/favicon.svg'
  ) {
    return next();
  }
  
  // With trailingSlash: 'never', no redirects needed
  // All URLs should work without trailing slashes
  
  return next();
};
