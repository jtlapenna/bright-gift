import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = (context, next) => {
  const url = new URL(context.request.url);
  
  // Only handle GET requests
  if (context.request.method !== 'GET') {
    return next();
  }
  
  // Skip redirects for:
  // - Root path (/)
  // - Files with extensions (.html, .css, .js, .png, etc.)
  // - API routes (CRITICAL: Don't redirect API endpoints)
  // - Static assets
  // - Static directories (like care-calculator)
  if (
    url.pathname === '/' ||
    url.pathname.includes('.') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/placeholders/') ||
    url.pathname.startsWith('/care-calculator') ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/sitemap.xml' ||
    url.pathname === '/favicon.svg'
  ) {
    return next();
  }
  
  // For all other paths, redirect no trailing slash to trailing slash
  if (!url.pathname.endsWith('/') && url.pathname !== '/') {
    const newUrl = new URL(context.request.url);
    newUrl.pathname = url.pathname + '/';
    return context.redirect(newUrl.toString(), 301);
  }
  
  return next();
};
