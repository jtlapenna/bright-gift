# SEO Recovery Strategy

## Current policy

- Canonical blog URLs use the trailing-slash format only.
- Active tooling must not emit `.md` blog URLs, non-slash blog URLs, or blog pagination URLs as crawl targets.
- Freshness signals must come from real content updates, not blanket date rewrites.
- Off-season year-stamped pages can stay live, but they should be removed from sitemap and reindex promotion until intentionally refreshed for season.

## Recovery approach

### 1) Remove bad sources before revalidation

When Google reports a redirect or indexing problem, first trace the exact URL variant back to its source:
- code
- content
- scripts
- sitemap generation
- operator docs

Do not start a new validation until that source has been removed.

### 2) Keep sitemap conservative

- Include canonical URLs only.
- Use `lastUpdated` only when the update is real and intentional.
- Otherwise use the publish date.
- Do not stamp static routes with build time when there is no reliable source-of-truth date.

### 3) Refresh content selectively

Only pages with real editorial improvements should receive a fresh `lastUpdated` signal.

The current editorial refresh batch is:
- `gifts-under-25-for-coworkers`
- `little-luxuries-under-25-mini-splurges-major-wow`
- `clean-girl-2-0-minimalist-gifts-with-personality`

The seasonal gamer Christmas page remains live but is intentionally de-prioritized off-season.

### 4) Use GSC deliberately

- Submit the sitemap.
- Request indexing for the refreshed canonical pages only.
- Avoid bulk requests and avoid redirect variants.
- Treat `Page with redirect` as a source-tracing exercise, not a page to force-index.
