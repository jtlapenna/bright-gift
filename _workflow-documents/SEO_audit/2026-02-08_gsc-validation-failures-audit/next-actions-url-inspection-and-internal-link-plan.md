# Next actions: GSC URL Inspection + internal link plan

**Date:** 2026-02-09  
**Context:** The 10 sample URLs in the “Crawled — currently not indexed” bucket are technically healthy (200, indexable, canonical matches). Next we need the missing piece: **what Google thinks** (URL Inspection) and then apply the smallest internal-link/value changes that typically move the needle.

## Quick confirmation

Yes — the screenshots you shared are exactly the data we need per URL:
- Discovery (Sitemaps / Referring page)
- Crawl (last crawl, crawler type, allowed?, fetch)
- Indexing (indexing allowed, **user-declared canonical**, **Google-selected canonical**)

### Important interpretation for the screenshots you shared

Both examples show:
- **Google-selected canonical = Inspected URL** (good; not a canonical confusion issue)
- **Crawl allowed = Yes** and **Page fetch = Successful** (good; not blocked)
- **Discovery shows “No referring sitemaps detected / None detected”**

That last point does **not** necessarily mean the URL is absent from `https://bright-gift.com/sitemap.xml` — it can mean Google hasn’t *attributed* discovery to a sitemap or a known referrer yet (even if the URL is in the sitemap today).

---

## 1) What I need from you (copy/paste from GSC URL Inspection)

For each of these URLs, open **GSC → URL Inspection**, then copy/paste the fields below into a single message (or a doc).

### URLs (same set as the evidence sheet)
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

### Copy/paste template (per URL)

```text
URL:
Is it on Google?:
Indexing allowed?:
Crawl: (last crawl time + status):
User-declared canonical:
Google-selected canonical:
Coverage / indexing status details:
Page fetch: (successful / failed):
Robots: (allowed / blocked):
Enhancements / rich results (if shown):

Notes (any warnings):
```

**Why this matters:** if **Google-selected canonical** differs, we fix canonical/discovery signals; if it matches, we shift to **content value + internal link architecture**.

---

## 2) Internal link plan (based on real built HTML)

Source: `dist/` HTML scan recorded in `crawled-not-indexed-inbound-links-dist.*`.

### Priority targets (lowest inbound link support)

1) **Remote Work 2.0** — `remote-work-2-0-gifts-hybrid-offices-50-100/`
- Inbound unique pages: **3**
- Total occurrences: **4**
- Current top referrers:
  - `/category/gift-guides/` (2)
  - `/blog/last-minute-birthday-gifts-for-busy-professionals/` (1)

**Observation:** This page is not consistently being selected by the related-posts system.

2) **Ethical gifts** — `20-ethical-gift-ideas-for-eco-conscious-loved-ones-under-75/`
- Inbound unique pages: **9**
- Total occurrences: **10**

---

## 3) Where to implement internal link improvements (exact code locations)

### A) Related posts (individual post pages)
File: `src/pages/blog/[...slug].astro`
- Related posts are computed using **tags overlap**, then **category match**, then **title word overlap**, and then limited to **2** posts.
- Because many posts have thin/uneven `tags`, some pages (like Remote Work 2.0) get weak exposure.

**Recommended fix (smallest impact first):**
- Ensure key posts have meaningful `tags` (e.g., remote work / wfh / productivity / ergonomic) so the current algorithm selects them more often.
- Optionally increase related-posts limit from **2 → 4** for stronger internal linking density (test UI for layout).

### B) Blog index (/blog/)
File: `src/pages/blog/index.astro`
- It already surfaces a grid of content. We can add a “Topic cluster” module for Remote Work / WFH and Eco/Ethical.

**Recommended fix:**
- Add 1 small “Featured topic cluster” section linking to 3–5 posts in that theme.

### C) Homepage featured guides
File: `src/pages/index.astro`
- Homepage shows `allContent.slice(1,4)` (3 cards) after the latest post.

**Recommended fix:**
- Add 1 additional row or a “More from Gift Guides” block that includes at least 1 link to the weakest target (Remote Work 2.0) so it gets a high-authority internal link.

### D) Category hub (/category/gift-guides/)
File: `src/pages/category/[category].astro`
- Category hubs already link to many posts; we can bias ordering or insert a “Start here” cluster.

---

## 4) Proposed link placements (concrete)

### Remote Work 2.0 (highest priority)
Add internal links to `.../remote-work-2-0-gifts-hybrid-offices-50-100/` from:
- `/blog/` (blog index): add to a “Remote work gifts” mini section
- `/blog/gifts-for-remote-workers-and-wfh-professionals/` (highly related)
- `/blog/gifts-for-remote-workers-under-50/` (budget variant)
- `/blog/last-minute-birthday-gifts-for-busy-professionals/` (already links once; add contextual link in-body)
- Homepage featured section (adds a strong site-wide authority link)

### Ethical gifts
Strengthen links from:
- `/blog/eco-friendly-gift-ideas-for-every-budget/`
- `/blog/eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature/`
- `/category/gift-guides/` “eco/ethical” mini cluster

---

## 5) Stop condition
Once you paste the URL Inspection fields, we’ll know which branch to take:
- **If Google-selected canonical differs** → fix canonical/discovery signals.
- **If it matches** → implement the internal link + content-value refresh plan (starting with Remote Work 2.0).
