# Blog Post Cleanup Guide

## Automated Sitemap Resubmission & Indexing

- **Google Sitemap Ping:**
  - After each deployment, POST your sitemap URL to:
    - `https://www.google.com/ping?sitemap=https://yourdomain.com/sitemap.xml`
  - This can be automated with a simple script or GitHub Action.
- **Google Search Console API:**
  - Use for programmatic sitemap submission and monitoring indexing status.
  - Direct "Request Indexing" for arbitrary URLs is not available for most sites, but you can monitor for new 404s/coverage issues and alert for manual action.
- **Indexing API:**
  - Officially for job/livestream pages, but can be explored for advanced use cases.

## SEO Audit Script

- **Purpose:**
  - Crawl the deployed site or local build output.
  - Check for:
    - 404s and broken internal links
    - Redirect chains
    - Orphaned pages (no internal links)
    - Meta tag issues (missing/duplicate/too long/short)
    - Multiple H1s
    - Large images
    - Sitemap and robots.txt validity
    - Structured data/schema errors
  - Output a report (markdown, HTML, or CSV).
- **Implementation:**
  - Node.js script using `axios`, `cheerio`, or `puppeteer` for crawling/parsing.
  - CLI tools like `broken-link-checker` or Screaming Frog for local use.
  - Schedule to run after each deployment or nightly.

## High-Impact SEO Fixes (Prioritized)

1. **Meta & Content**
   - Ensure all meta descriptions are present, unique, and 140–160 chars.
   - Meta titles: unique, 50–60 chars, match page content.
   - Only one H1 per page, matches main topic.
   - Fix any SERP title/content mismatches.
2. **Internal Linking**
   - Every blog post should be linked from at least one other page (no orphans).
   - Add contextual links between related posts.
3. **Image Optimization**
   - Compress large images (target <200KB for banners).
   - Use WebP where possible.
   - Add descriptive, keyword-rich alt text.
4. **Sitemap & Robots.txt**
   - Ensure sitemap is always up to date and only includes indexable URLs.
   - Validate robots.txt for correct rules and accessibility.
5. **Structured Data**
   - Add/validate schema.org markup for articles, breadcrumbs, etc.
   - Fix any schema validation errors.
6. **Performance**
   - Minimize render-blocking resources.
   - Defer non-critical JS.
   - Optimize Core Web Vitals (LCP, CLS, FID).

## Next Steps

- **Step 1:** Complete high-impact SEO fixes above, with extra care for accuracy, precision, and effectiveness.
- **Step 2:** Implement and test the SEO audit script.
- **Step 3:** Automate sitemap resubmission and indexing requests.
- **Step 4:** Monitor results in Google Search Console and Ahrefs, and iterate as needed.

---

**All changes and scripts should be thoroughly tested with optimized content before deployment.** 