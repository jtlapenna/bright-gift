import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://bright-gift.com',
  trailingSlash: 'never',
  output: 'hybrid',
  // Use cookie-based sessions to avoid requiring a Cloudflare KV binding
  session: {
    driver: 'cookie'
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: false
    },
    // Ensure no implicit KV binding attempts
    sessionKVBindingName: 'DISABLED',
    // Exclude robots.txt and sitemap.xml from Workers processing
    // This allows them to be served as static files
    routes: {
      exclude: ['/robots.txt', '/sitemap.xml', '/api/*', '/blog', '/blog/*', '/category/*']
    }
  }),
  integrations: [tailwind()],
  markdown: {
    // Allow HTML in markdown content
    html: true,
    // Disable syntax highlighting to prevent HTML from being treated as code
    syntaxHighlight: false
  },
  vite: {
    ssr: {
      noExternal: ['marked']
    }
  },
  publicDir: 'public', // Add this line to ensure public/ folder is copied to build output
});