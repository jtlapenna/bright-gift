# GSC Validation Failures Audit (2026-02-08)

**Date:** 2026-02-08  
**Scope:** Google Search Console validations failing for:
- **Page with redirect**
- **Crawled — currently not indexed**

**Inputs:**
- Screenshots provided by user:
  - `assets/Screenshot_2026-02-08_at_1.30.05_PM-...png` (Page with redirect)
  - `assets/Screenshot_2026-02-08_at_1.30.19_PM-...png` (Crawled — currently not indexed)
- Recent internal docs reviewed:
  - `_workflow-documents/SEO_audit/2026-01-18_seo-canonicalization-and-redirect-cleanup/README.md`
  - `_workflow-documents/SEO_audit/next-steps-gsc-validation.md`
  - `_workflow-documents/seo/*` (recent strategy/checklists)

---

## 1) What GSC is showing (from screenshots)

### A) Page indexing → Page with redirect → Validation details
Validation failed.

**Failed examples shown (4):**
- `http://bright-gift.com/`
- `https://bright-gift.com/blog/gifts-for-new-grandparents` (no trailing slash)
- `https://bright-gift.com/data-deletion` (no trailing slash)
- `https://bright-gift.com/blog/80th-birthday-gift-ideas-seniors` (no trailing slash)

Interpretation:
- These are **non-canonical URL variants** that redirect to the site’s canonical trailing-slash URLs.

### B) Page indexing → Crawled - currently not indexed → Validation details
Validation failed.

**Failed examples shown (10):** (all already canonical trailing-slash URLs)
- `https://bright-gift.com/blog/80th-birthday-gift-ideas-seniors/`
- `https://bright-gift.com/blog/gifts-for-remote-workers-and-wfh-professionals/`
- `https://bright-gift.com/blog/christmas-gift-ideas-2025/`
- `https://bright-gift.com/blog/gifts-for-girlfriend-unique-romantic-ideas/`
- `https://bright-gift.com/blog/remote-work-2-0-gifts-hybrid-offices-50-100/`
- `https://bright-gift.com/blog/gifts-for-gamers-under-50/`
- `https://bright-gift.com/blog/eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature/`
- `https://bright-gift.com/blog/valentines-day-gifts-under-50-20-romantic-ideas-for-every-couple/`
- `https://bright-gift.com/blog/20-ethical-gift-ideas-for-eco-conscious-loved-ones-under-75/`
- `https://bright-gift.com/blog/best-holiday-gifts-for-moms-2025/`

---

## 2) Live technical audit (URL-level)

Audit method:
- Used `curl` for fetch/redirect tracing and HTML parsing.
- Note: Python HTTPS verification failed locally due to certificate store issues; this is a **local tooling limitation** (not a site issue). `curl` results are the authoritative evidence captured here.

### Results summary

**For all URLs tested:**
- Final status: **200**
- Canonical tag present and matches trailing-slash canonical (where applicable)
- `meta robots`: **`index, follow`**

**Redirecting variants tested (Page with redirect bucket):**
- The non-trailing-slash variants redirect to the trailing-slash canonical.

**Evidence:** see `gsc-url-audit-results.json` in this folder.

---

## 3) Findings (high confidence)

### Finding A — “Page with redirect” is expected to remain a redirect bucket
Those example URLs are *supposed* to redirect (http→https, and no-slash→slash canonicalization). That means:
- GSC can continue to classify them as “Page with redirect.”
- Validation can “fail” simply because the URLs still redirect (which is not inherently a bug).

**What actually matters:**
- Ensure Google discovers and indexes the canonical URLs (trailing slash, https).
- Minimize discovery of redirecting variants (internal links, sitemap, canonicals) so the bucket shrinks over time.

### Finding B — “Crawled — currently not indexed” is not explained by basic technical blockers
The sampled pages show:
- 200 OK
- indexable robots directives
- canonical tags present

This aligns with the Jan 18 report: at this point, the “crawled, not indexed” bucket can persist due to:
- content quality / duplication / intent mismatch
- weak internal linking depth / poor cluster structure
- site-level trust signals
- SERP competition and Google’s indexing priorities

---

## 4) Next steps (investigation-only recommendations)

### A) Determine if GSC is still discovering non-canonical variants internally
- Scan the codebase for remaining internal links to non-trailing-slash routes.
- Scan markdown content for `https://bright-gift.com/blog/<slug>` (no slash) references.

### B) For “crawled, not indexed” pages: collect richer evidence
For each example URL, capture:
- rendered HTML title/H1
- word count + uniqueness vs other pages
- structured data presence (Article schema, FAQ schema)
- internal link count in/out

### C) GSC process hygiene
- For “Page with redirect”, consider whether validation is meaningful: redirect pages are excluded by design.
- For “Crawled — currently not indexed”, URL Inspection per-example pages can provide *Google-selected canonical* and indexing reason.

---

## 5) Strategy implemented (2026-02-09)

Because the sample “Crawled — currently not indexed” URLs were already technically healthy (200, indexable, canonical matches), the next-best lever is **stronger internal discovery + topical clustering**.

**What changed (in branch `fix/gsc-indexing-signals`):**
- Added curated “start here” hub links on:
  - `/blog/` (blog index)
  - `/category/gift-guides/` (category hub)
  - `/` (homepage)
- Improved `/blog/[...slug]/` “Related posts” logic to match on **tag tokens**, not exact tag strings (phrase-style tags were limiting overlap).

**Why this is the smallest high-impact fix:**
- Hub pages are crawled frequently and pass the strongest internal linking signals.
- Better related-post matching increases relevant cross-links automatically without retagging the entire library.

Full strategy details: `2026-02-09_internal-linking-and-related-posts-strategy.md`

---

## Appendix

### Files created by this audit
- `gsc-url-audit-results.json`
