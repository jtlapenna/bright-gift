# SEO Report — Canonicalization + Redirect Cleanup

**Date:** 2026-01-18  
**Site:** `https://bright-gift.com`  
**Primary symptom:** Google Search Console buckets persisting for:\n- “Redirect error”\n- “Page with redirect”\n- “Crawled — currently not indexed”

This report captures what was diagnosed, what was changed in the codebase, and how to validate the fix going forward.

---

## Diagnosis (what was actually wrong)

### 1) Google was still discovering redirecting URL variants

Even though many routes *ultimately* served the correct canonical (trailing-slash) URL, the codebase still **generated internal links without trailing slashes**, causing crawlers to repeatedly discover and crawl redirecting variants like:\n- `/blog` (redirects to `/blog/`)\n- `/contact` (redirects to `/contact/`)\n- `/privacy`, `/terms`, `/data-deletion`\n- `/category/*` variants\n- blog post links like `/blog/some-post` (redirects to `/blog/some-post/`)

That discovery pattern can keep “page with redirect” / “redirect error” validations noisy for a long time.

### 2) Redirect targets sometimes introduced extra hops

`public/_redirects` had some redirects that pointed to non-canonical targets (missing trailing slash), which can cause an extra redirect hop under `trailingSlash: 'always'` and can surface as 308/extra hops.

### 3) “Crawled — currently not indexed” is not purely technical here

A live audit of the Dec 3 GSC sample URLs showed they are currently:\n- HTTP 200\n- `meta robots: index, follow`\n- `x-robots-tag: index, follow`\n- canonical tags present and matching the trailing-slash canonical\n- canonical URL present in `public/sitemap.xml`

This strongly suggests that **technical blockers were not the primary reason** those URLs remain “crawled, not indexed”. That bucket can persist for quality/duplication/trust/internal-linking reasons even when the technical signals are correct.

---

## What was changed (the fixes)

### 1) Canonicalize internal links in templates/pages

Hardcoded internal links were updated to use canonical trailing-slash URLs so crawlers (and users) stop hitting redirecting variants.\n\n**Files updated:**\n- `src/layouts/Layout.astro`\n- `src/pages/index.astro`\n- `src/pages/blog/index.astro`\n- `src/pages/blog/[...slug].astro`\n- `src/pages/category/[category].astro`\n- `src/pages/privacy.astro`\n- `src/pages/terms.astro`\n- `src/pages/data-deletion.astro`

### 2) Canonicalize markdown internal links (without editing all posts)

Added a small remark plugin to automatically normalize internal markdown links to trailing-slash canonicals for key routes.\n\n**New file:**\n- `src/utils/remarkCanonicalInternalLinks.mjs`\n\n**Enabled in:**\n- `astro.config.mjs` (via `markdown.remarkPlugins`)

Behavior:\n- Only rewrites internal links that start with `/` and are known SEO routes (`/blog/*`, `/category/*`, and a few static pages).\n- Does **not** touch URLs with `?` or `#`.\n
### 3) Reduce redirect hop chains in `public/_redirects`

Redirect targets were adjusted to point directly to canonical trailing-slash targets (so the rule itself doesn’t create an extra hop).\n\n**File updated:**\n- `public/_redirects`

### 4) Make redirect diagnostics actually usable pre-deploy

`scripts/test-all-redirects.js` previously counted the final 200 response as part of “redirect chain length”, which made nearly every rule appear “multi-hop”. It was corrected to count only 3xx redirect hops, and it now supports testing against a custom base URL.\n\n**File updated:**\n- `scripts/test-all-redirects.js`\n\n**New env var support:**\n- `REDIRECT_TEST_BASE_URL=http://localhost:4321` (or your deployed preview URL)

---

## Evidence captured (reference artifacts)

### Live audit of GSC sample URLs (Dec 3 set)

Generated a machine-readable audit report of the Dec 3 sample URLs (status, canonical, robots, sitemap presence):\n- `_workflow-documents/SEO_audit/gsc-sample-live-audit-2026-01-18.json`

### Redirect diagnostic report

Diagnostic output from `npm run test:redirects`:\n- `_workflow-documents/SEO_audit/redirect-diagnostic-report.json`

---

## Validation checklist (how to confirm it stays fixed)

See:\n- `_workflow-documents/seo/seo-validation-checklist.md`

Quick version:\n
```bash
npm run verify:redirects
npm run generate:sitemap
npm run build
```

Optional (best) local redirect test:\n
```bash
npm run preview -- --port 4321
REDIRECT_TEST_BASE_URL=http://localhost:4321 npm run test:redirects
```

---

## Known caveats

- Any remaining 308s or extra hops observed on production at the time of this report are expected to clear **after deploy**, because the fixes are currently in-repo.\n- “Crawled — currently not indexed” may persist even after technical cleanup; at that point, the work is content/value/internal-linking strategy rather than redirects/canonicals.

