import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = (context, next) => {
  // TEMPORARILY DISABLED - Let Cloudflare handle trailing slash redirects
  return next();
};
