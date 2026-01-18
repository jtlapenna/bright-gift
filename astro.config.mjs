import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import remarkCanonicalInternalLinks from './src/utils/remarkCanonicalInternalLinks.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://bright-gift.com',
  trailingSlash: 'always',
  output: 'server',
  // Use cookie-based sessions to avoid requiring a Cloudflare KV binding
  session: {
    driver: 'cookie'
  },
  adapter: cloudflare({
    // Ensure no implicit KV binding attempts
    sessionKVBindingName: 'DISABLED',
    // Exclude robots.txt and sitemap.xml from Workers processing
    // This allows them to be served as static files
    routes: {
      exclude: ['/robots.txt', '/sitemap.xml', '/api/*', '/data-deletion', '/oauth/callback']
    }
  }),
  integrations: [tailwind()],
  markdown: {
    // Allow HTML in markdown content
    html: true,
    // Disable syntax highlighting to prevent HTML from being treated as code
    syntaxHighlight: false,
    // Normalize internal markdown links to canonical trailing-slash URLs
    remarkPlugins: [remarkCanonicalInternalLinks]
  },
  vite: {
    ssr: {
      noExternal: ['marked']
    }
  },
  publicDir: 'public', // Add this line to ensure public/ folder is copied to build output
});