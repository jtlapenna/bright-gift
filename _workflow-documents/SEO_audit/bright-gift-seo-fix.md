# Bright-Gift SEO & Architecture Fix Plan

Prepared for: Dev/SEO agent team  
Date: 2025-09-03

---

## Context

- Bright-Gift and satellite sites are deployed on **Cloudflare Pages SSR** with an API + Supabase backend.  
- A central hub (**tpb-hub.com**) coordinates content creation and syncs with n8n + GitHub for publishing.  
- Since enabling SSR, trailing slash redirects and canonical conflicts have caused **SEO regressions** (ranking drops, duplicate URLs, indexing issues).  
- API endpoints must remain functional.

---

## Recommended Defaults (All Sites + Hub)

1. **Canonical URL style:** Use **trailing slashes** everywhere (`/guides/` not `/guides`).  
   - Cloudflare Pages forces directory-style routes to `/`.  
   - Google doesn’t care which, just be consistent.

2. **Canonical host:** Use **apex** (e.g., `bright-gift.com`).  
   - Redirect `www`, `*.pages.dev`, and other hosts → apex.

3. **Redirect semantics:** Use permanent redirects (`301` or `308`).  
   - `308` preserves HTTP method for APIs.

4. **Query params:**  
   - Strip tracking params (`utm_*`, `gclid`, `fbclid`, etc.).  
   - Keep affiliate params (Amazon `tag`, `ascsubtag`).

5. **Sitemaps & robots:**  
   - One sitemap per site.  
   - Robots.txt points to sitemap.  
   - Optionally: hub `sitemap_index.xml` linking to all site maps.

6. **API isolation:** Never redirect or canonicalize `/api/*`.  

7. **Caching:**  
   - Don’t cache HTML (for now).  
   - Cache static assets long.

---

## Astro Config

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  site: 'https://bright-gift.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
})
```

---

## Canonical Helper

```ts
// src/lib/seo.ts
const TRACKING = new Set([
  'utm_source','utm_medium','utm_campaign','utm_term','utm_content',
  'gclid','fbclid','mc_cid','mc_eid'
])
const AFFILIATE_KEEP = new Map([
  ['amazon.com', new Set(['tag','ascsubtag'])]
])

export function canonicalUrl(input: URL) {
  const u = new URL(input.toString())
  const keep = AFFILIATE_KEEP.get(u.hostname) ?? new Set()
  for (const k of [...u.searchParams.keys()]) {
    if (!keep.has(k) && TRACKING.has(k)) u.searchParams.delete(k)
  }
  u.hostname = 'bright-gift.com'
  if (!u.pathname.endsWith('/')) u.pathname += '/'
  return u.toString()
}
```

Usage in layout:

```astro
---
import { canonicalUrl } from '../lib/seo'
const url = new URL(Astro.request.url)
---
<link rel="canonical" href={canonicalUrl(url)} />
```

---

## Cloudflare Redirect Rules

### Host normalization
Expression:
```
(http.host eq "www.bright-gift.com") and not starts_with(http.request.uri.path, "/api")
```
Action: Redirect → `https://bright-gift.com/$1` (preserve path + query).

### Bulk Redirects
- Map `*.pages.dev` → `bright-gift.com` (preserve path + query).

---

## Optional Edge Cleanup

Use a Cloudflare **Transform Rule / Snippet** to remove tracking params (`utm_*`, `gclid`, etc.), but always preserve affiliate params. Exclude `/api/*`.

---

## Sitemaps & Robots

- Sitemap URLs must use **trailing slash** + canonical host.  
- Robots.txt must reference sitemap.  
- Submit each site sitemap in **Search Console**.

---

## Rollout Checklist

1. Update Astro config + canonical helper.  
2. Add Cloudflare host → apex redirect rule (exclude `/api/*`).  
3. Add Bulk Redirects for `*.pages.dev`.  
4. Rebuild sitemaps + update robots.txt.  
5. Re-submit sitemaps in Search Console.  
6. (Optional) Strip tracking params at edge.  
7. Monitor GSC coverage + Ahrefs crawl.  

---

## Alternative (If no-slash URLs are required)

- Migrate those sites to **Cloudflare Workers**.  
- In `wrangler.toml`:

```toml
[assets]
directory = "./dist/client"
html_handling = "drop-trailing-slash"
```

This disables forced slash redirects.

---

## Why This Fixes SEO

- One canonical per page (host + slash).  
- Internal links, sitemaps, canonicals consistent.  
- No redirect chains or duplicates.  
- APIs preserved (`/api/*` exempt).  
- Aligns with Cloudflare’s behavior (avoids fighting the platform).

---
