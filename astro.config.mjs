import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://bright-gift.com',
  output: 'server',
  // Use cookie-based sessions to avoid requiring a Cloudflare KV binding
  session: {
    driver: 'cookie'
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: false
    },
    // Ensure no implicit KV binding attempts
    sessionKVBindingName: 'DISABLED'
  }),
  integrations: [tailwind()],
  vite: {
    ssr: {
      noExternal: ['marked']
    }
  },
  publicDir: 'public', // Add this line to ensure public/ folder is copied to build output
});