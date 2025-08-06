# Blog Post Cleanup Guide (Current Status)

This guide reflects the **current, verified status** of all major SEO and site health items for BrightGift. All items have been checked as of the latest audit. Ongoing maintenance steps are included below.

---

## Summary Table

| Audit Item                        | Status      | Notes/Next Steps                                 |
|------------------------------------|-------------|--------------------------------------------------|
| Meta tags (title/desc)             | 🟡          | 7% compliant - 26 long titles, 11 desc issues   |
| H1 per page                        | ✅          | Only one H1, matches topic                       |
| SERP mismatch monitoring           | 🟡          | Needs ongoing GSC review                         |
| Orphaned pages                     | ✅          | All resolved - 5 posts linked, 8 broken links fixed |
| Contextual internal links          | ✅          | Sidebar related posts                            |
| Image optimization/WebP/alt text   | 🟡          | 66% compliant - 29 oversized, 17 wrong format   |
| Sitemap/robots.txt                 | ✅          | Dynamic, valid, up to date                       |
| Structured data/schema             | ✅/🟡        | All major types present, validate periodically   |
| Render-blocking/deferred JS        | ✅          | Preload, defer, async implemented                |
| Core Web Vitals                    | 🟡          | Code optimized, monitor Lighthouse               |
| Canonical URLs                     | ✅          | Always set, HTTPS                                |
| OG/Twitter tags                    | ✅          | All present                                      |
| Affiliate link/disclosure          | ✅          | All present, formatted                           |

---

## Ongoing Maintenance Checklist

- **Meta & Content**
  - [x] ✅ Created automated meta tag audit script (`scripts/meta-tag-audit.js`)
  - [ ] Fix 26 meta titles (shorten to 50-60 characters)
  - [ ] Fix 11 meta descriptions (adjust to 140-160 characters)
  - [ ] Review new posts for unique metaTitle/metaDescription (50–60/140–160 chars)
  - [ ] Monitor Google Search Console for SERP mismatches
- **Internal Linking**
  - [x] ✅ All orphaned pages resolved (5 posts linked, 8 broken links fixed)
  - [ ] Check for new orphaned pages after adding new content
  - [ ] Ensure related posts logic continues to link all posts
- **Image Optimization**
  - [x] ✅ Created automated image audit script (`scripts/image-audit.js`)
  - [ ] Optimize 29 oversized images to <200KB
  - [ ] Convert 17 images to WebP format
  - [ ] Confirm new images are WebP and <200KB
  - [ ] Ensure descriptive alt text for all new images
- **Sitemap & Robots.txt**
  - [ ] Validate sitemap and robots.txt after each deployment
- **Structured Data**
  - [ ] Periodically validate schema.org markup with Google Rich Results Test
- **Performance**
  - [ ] Monitor Core Web Vitals (LCP, CLS, FID) with Lighthouse
  - [ ] Continue to defer non-critical JS and optimize render-blocking resources
- **Affiliate Links**
  - [ ] Ensure disclosure and formatting for all new affiliate links

---

## Automation Scripts

### Available Scripts
- **`scripts/image-audit.js`** - Audits image sizes and formats
- **`scripts/meta-tag-audit.js`** - Validates meta titles and descriptions  
- **`scripts/add-internal-links-to-orphan-pages.js`** - Detects orphaned posts

### Usage
```bash
# Run all audits
node scripts/image-audit.js
node scripts/meta-tag-audit.js
node scripts/add-internal-links-to-orphan-pages.js
```

## Notes
- Internal linking issues have been resolved as of this audit.
- Image optimization and meta tag issues need attention.
- This guide should be updated after each major audit or when new issues are found.
- For details on implementation, see the codebase and recent audit reports.

---

_Last updated: 2025-01-27_  <!-- Updated after orphaned posts audit and fixes --> 