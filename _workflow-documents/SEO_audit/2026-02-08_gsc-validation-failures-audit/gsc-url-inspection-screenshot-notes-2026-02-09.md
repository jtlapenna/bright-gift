# GSC URL Inspection evidence (screenshots) — 2026-02-09

These screenshots match the exact fields needed for each URL.

## Common pattern across screenshots

All inspected URLs show:
- **Page is not indexed**: *Crawled – currently not indexed*
- **Crawl allowed**: Yes
- **Page fetch**: Successful
- **Indexing allowed**: Yes
- **User-declared canonical**: the inspected trailing-slash URL
- **Google-selected canonical**: **Inspected URL**

Interpretation:
- This strongly suggests **no technical blocking issue** (robots/canonical/fetch).
- The remaining work is primarily **indexing prioritization** signals (internal linking/hubs, content uniqueness/value, trust).

## Notable variation: Discovery signals

Across screenshots, Discovery shows one of:
- **Sitemaps: No referring sitemaps detected**
- **Sitemaps: Temporary processing error**

Referring page varies:
- **None detected**
- `https://bright-gift.com/sitemap.xml`
- A social referrer (example shown: an Instagram post URL)

Interpretation:
- “No referring sitemaps detected” does **not** necessarily mean the URL is missing from the sitemap; it can mean Google hasn’t attributed discovery to sitemap/referrer.
- “Temporary processing error” points to GSC attribution instability; it’s worth checking **GSC → Sitemaps** for any fetch/parse errors.

## URLs shown in the 2026-02-09 screenshots (examples)

- `https://bright-gift.com/blog/gifts-for-remote-workers-and-wfh-professionals/`
- `https://bright-gift.com/blog/80th-birthday-gift-ideas-seniors/`
- `https://bright-gift.com/blog/gifts-for-girlfriend-unique-romantic-ideas/`
- `https://bright-gift.com/blog/valentines-day-gifts-under-50-20-romantic-ideas-for-every-couple/`
- `https://bright-gift.com/blog/best-holiday-gifts-for-moms-2025/`
- `https://bright-gift.com/blog/20-ethical-gift-ideas-for-eco-conscious-loved-ones-under-75/`
- `https://bright-gift.com/blog/christmas-gift-ideas-2025/`
- `https://bright-gift.com/blog/gifts-for-gamers-under-50/`
- `https://bright-gift.com/blog/remote-work-2-0-gifts-hybrid-offices-50-100/`
- `https://bright-gift.com/blog/eco-friendly-gifts-for-outdoor-lovers-sustainably-celebrating-nature/`
