Legacy SEO scripts
==================

These scripts are archived on purpose.

Why they were moved:
- Several scripts rewrote publish dates or `lastUpdated` values in bulk.
- Several generated or monitored redirecting, `.md`, or paginated archive URLs.
- Several encoded one-off Google Search Console recovery steps that no longer match the live canonical URL policy.

Current policy:
- Canonical public blog URLs always use the trailing-slash form.
- Sitemap entries come from canonical URLs only.
- `lastUpdated` is used only for intentional content refreshes, not blanket rewrites.
- Google Search Console actions use canonical URLs only and never redirect variants, `.md` URLs, or blog pagination URLs.

If a script here is ever needed again, copy the logic into an active script only after it is updated to the current policy and validated with `npm run seo:validate`.
