# SEO and Affiliate Performance Recovery Analysis

Date: 2026-05-13

## What Changed

The January Amazon affiliate period was not primarily driven by Google organic search. GA4 source/medium exports show the largest January traffic source was ChatGPT:

- Jan 1-Feb 15: `chatgpt.com / (not set)` had 190 sessions and `chatgpt.com / referral` had 110 sessions.
- Mar 1-Mar 26: those same ChatGPT sources fell to 126 combined sessions.
- Apr 9-May 13: those same ChatGPT sources fell to 37 combined sessions.

This is the main traffic loss visible in GA4. Google organic search was small in January:

- Jan 1-Feb 15: `google / organic` had 10 sessions.
- Mar 1-Mar 26: Google organic was not a top source/medium row.
- Apr 9-May 13: Google organic was not a top source/medium row.

## Search Console Signal

The linked Search Console export shows Google is not yet a meaningful click source:

- Mar 1-Mar 26: 1,162 query impressions, 0 clicks, average position about 81.
- Apr 9-May 13: 202 query impressions, 0 clicks, average position about 81.

The query losses are mostly AI gift generator terms. The homepage was the primary page receiving those impressions, so the next SEO recovery target should be the AI gift generator/homepage intent rather than another generic blog refresh batch.

## Landing Page Losses

The biggest January landing-page traffic losses by Apr 9-May 13 were:

- `/blog/gifts-for-gamers-under-50`: 44 sessions to 1.
- `/blog/valentines-day-gifts-under-50-20-romantic-ideas-for-every-couple`: 40 sessions to 0.
- `/blog/25-thoughtful-housewarming-gifts-for-new-homeowners-under-75`: 40 sessions to 1.
- `/blog/gifts-under-25-for-coworkers`: 40 sessions to 3.
- `/`: 67 sessions to 39.
- `/blog/25-unique-anniversary-gift-ideas-under-50`: 23 sessions to 1.

Because the source/medium loss is mostly ChatGPT, these pages should be treated as AI/referral recovery candidates, not purely Google ranking candidates.

## Diagnosis

1. The affiliate revenue decline is mostly a loss of ChatGPT-referred traffic.
2. GA4 was not instrumented well enough to explain affiliate outcomes because affiliate clicks and generator events were not reliably tracked.
3. Google Search is underperforming, but it was not the main January affiliate driver.
4. The homepage ranks too low for AI gift generator terms to replace the lost ChatGPT traffic.
5. `/gift-idea-generator/` currently 301 redirects to a homepage hash, which is a missed opportunity for a crawlable AI gift generator landing page.

## Recovery Priorities

1. Ship reliable analytics events: `page_view`, `affiliate_click`, `gift_generator_start`, and `gift_generator_result_click`.
2. Build or replace `/gift-idea-generator/` with an indexable landing page for free AI gift generator intent instead of a 301 to `/#gift-generator`.
3. Strengthen homepage and landing page copy around `AI gift generator`, `AI gift finder`, `free gift idea generator`, and recipient/budget/occasion use cases.
4. Refresh and promote the January ChatGPT winner pages as answer-ready resources, especially gamer gifts, coworker gifts, housewarming gifts, anniversary gifts, and girlfriend gifts.
5. Add UTMs to every owned/social post so future ChatGPT, social, and campaign traffic is not misclassified as `(not set)`.

## Files

- `_workflow-documents/reports/ga4-traffic-source-medium-jan01-feb15.csv`
- `_workflow-documents/reports/ga4-traffic-source-medium-mar01-mar26.csv`
- `_workflow-documents/reports/ga4-traffic-source-medium-apr09-may13.csv`
- `_workflow-documents/reports/ga4-traffic-source-medium-combined.csv`
- `_workflow-documents/reports/ga4-traffic-acquisition-combined.csv`
- `_workflow-documents/reports/ga4-landing-page-combined.csv`
- `_workflow-documents/reports/ga4-gsc-queries-combined.csv`
- `_workflow-documents/reports/ga4-gsc-pages-combined.csv`
