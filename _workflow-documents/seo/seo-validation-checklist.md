# SEO Validation Checklist (Local + Post-Deploy)

This checklist is designed to prevent regressions for:
- Redirect chains / unexpected 308s
- Non-canonical internal links (missing trailing slashes)
- Sitemap drift (missing URLs, wrong canonical URLs)

## Local (before deploy)

### 1) Verify redirects file coverage

```bash
npm run verify:redirects
```

### 2) Generate sitemap

```bash
npm run generate:sitemap
```

### 3) Build the site

```bash
npm run build
```

### 4) Redirect test against local preview (optional but ideal)

In one terminal:

```bash
npm run preview -- --port 4321
```

In another terminal:

```bash
REDIRECT_TEST_BASE_URL=http://localhost:4321 npm run test:redirects
```

Notes:
- `scripts/test-all-redirects.js` defaults to production unless `REDIRECT_TEST_BASE_URL` is set.
- Local preview may not include Cloudflare-managed redirects (HTTP→HTTPS), which is expected.

## Post-deploy (production)

### 1) Spot-check high-signal URLs (status + Location)

```bash
curl -I https://bright-gift.com/blog
curl -I https://bright-gift.com/contact
curl -I https://bright-gift.com/privacy
curl -I https://bright-gift.com/terms
curl -I https://bright-gift.com/data-deletion
curl -I https://bright-gift.com/category/
curl -I https://bright-gift.com/category/data-driven
curl -I https://bright-gift.com/category/educational
```

Expected pattern:
- Non-slash URLs should be a **single 301** to the trailing-slash canonical URL (or directly to the canonical category).
- Avoid 308s for SEO-critical redirects.

### 2) Run full redirect diagnostic against production

```bash
npm run test:redirects
```

If you want to force the target explicitly:

```bash
REDIRECT_TEST_BASE_URL=https://bright-gift.com npm run test:redirects
```

### 3) Confirm sitemap and canonical alignment

```bash
curl -s https://bright-gift.com/sitemap.xml | head -n 20
curl -s https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/ | grep -i 'rel=\"canonical\"' | head -n 1
```

Expected:
- Sitemap URLs are canonical (https + trailing slash where applicable)
- Canonical tag matches the sitemap URL exactly

## Google Search Console (after deploy)

### 1) URL Inspection (sample)

- Inspect a few URLs from each bucket:
  - Redirect-related (e.g. `/blog`, `/contact`, `/category/gift-guides`)
  - Crawled-not-indexed (a few representative posts)
- Confirm “Google-selected canonical” matches the trailing-slash URL.

### 2) Re-run validations

In GSC (Page indexing):
- **Redirect error** → Start new validation
- **Page with redirect** → Start new validation
- **Crawled – currently not indexed** → Start new validation (expect slower movement; not always purely technical)

