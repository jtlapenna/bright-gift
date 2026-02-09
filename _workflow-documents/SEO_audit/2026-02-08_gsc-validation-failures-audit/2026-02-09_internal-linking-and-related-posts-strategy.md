# Internal linking + related-posts strategy (2026-02-09)

**Purpose:** Move “Crawled — currently not indexed” URLs toward indexing by strengthening *internal discovery + topical clustering* signals, since basic technical blockers (robots/canonical/200 OK) are already clean.

---

## 1) What we verified (live signals)

- **`robots.txt` includes sitemap**: `Sitemap: https://bright-gift.com/sitemap.xml`
- This supports the earlier conclusion: GSC “No referring sitemaps detected” is likely **attribution/processing lag** (URL Inspection “Discovery” section) rather than a missing sitemap directive.

---

## 2) Working theory (high confidence)

For the sample “crawled, not indexed” URLs, the bottleneck is likely a combination of:

- **Internal linking depth / clustering**: some pages (notably “Remote Work 2.0”) have relatively weak *inbound internal links* in the built site evidence.
- **Topical clarity**: if related-content modules aren’t consistently connecting similar posts, Google has fewer strong signals that these URLs are “important” within the site.
- **GSC discovery reporting**: URL Inspection often under-reports “referring sitemaps,” even when a sitemap exists; it’s not a reliable single source of truth.

---

## 3) Strategy (smallest changes with the biggest sitewide effect)

### A) Add stable, high-visibility internal links (“hub links”)

Add curated links to key guides from:

- `/blog/` (blog index)
- `/category/gift-guides/` (category hub)
- `/` (homepage)

**Why:** These are high-importance pages that Google crawls frequently. Adding links here increases:
- crawl frequency toward targets
- perceived importance (internal PageRank)
- topical cluster clarity

### B) Improve “Related posts” matching (less brittle)

Current related-post matching used **exact tag string overlap**, which is brittle when tags are phrases (e.g., `"remote work gifts"` vs `"work from home"`).

**Fix:** tokenize tags into normalized “keywords” and compute overlap on tokens (excluding stopwords like “gifts”, “ideas”, etc.). This keeps relevance but increases match rate, improving cross-linking automatically.

---

## 4) Implemented changes (branch: `fix/gsc-indexing-signals`)

### 4.1 `/blog/` — “Start here” cluster block

- Added a small “popular clusters” section that links directly to several example URLs from the GSC list, including:
  - `/blog/remote-work-2-0-gifts-hybrid-offices-50-100/`
  - `/blog/20-ethical-gift-ideas-for-eco-conscious-loved-ones-under-75/`
  - `/blog/eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature/`
  - `/blog/christmas-gift-ideas-2025/`
  - `/blog/best-holiday-gifts-for-moms-2025/`
  - `/blog/80th-birthday-gift-ideas-seniors/`

### 4.2 `/category/gift-guides/` — “Start here” hub block

- Added a “core gift guides” section linking to the most important/weak-support targets.

### 4.3 `/` — homepage topic links

- Added a compact “Explore popular gift-guide topics” section with stable links to priority guides.

### 4.4 `/blog/[...slug]/` — better “Related posts”

- Replaced exact tag matching with **token overlap** to increase relevant related-post links without requiring retagging the entire library.

---

## 5) Next actions (recommended)

### A) Deploy and let Google recrawl

- After deploy, wait for crawl recency to update (days to weeks).

### B) Re-run URL Inspection (sample set)

For 3–5 lowest-support URLs (start with Remote Work 2.0):
- verify Google-selected canonical remains correct
- request indexing
- track changes in “Crawled — currently not indexed” counts over ~2–4 weeks

### C) Optional follow-up (only if needed)

- Add a lightweight “Related guides” block to the *bottom of the target posts themselves* (manual, curated links), if hub linking + improved related posts isn’t enough.

---

## Memory updates (for future work)

### Entities (added/updated)
- **`src/pages/blog/index.astro`**: blog hub now includes a curated cluster link block.
- **`src/pages/category/[category].astro`**: gift-guides category now includes a curated “Start here” hub block.
- **`src/pages/index.astro`**: homepage now includes a stable “Explore popular gift-guide topics” link block.
- **`src/pages/blog/[...slug].astro`**: related-post scoring now uses tag-token overlap (more robust).
- **`scripts/seo-validation/*`**: validator aligned with trailing-slash canonicals + fixed false-positive redirect detection.

### Relationships
- Hub pages (`/`, `/blog/`, `/category/gift-guides/`) now link directly to priority guides (including weak-support “crawled, not indexed” examples), improving internal discovery and clustering signals.

### Observations
- URL Inspection “Discovery → referring sitemap” is not reliable on its own; treat as **attribution/processing** signal, not definitive sitemap inclusion/exclusion.

