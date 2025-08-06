import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://bright-gift.com',
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: false
    }
  }),
  integrations: [tailwind()],
  vite: {
    ssr: {
      noExternal: ['marked']
    }
  }
});