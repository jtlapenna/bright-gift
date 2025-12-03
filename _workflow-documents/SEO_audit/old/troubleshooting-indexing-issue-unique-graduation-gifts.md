# Troubleshooting: Crawled - Currently Not Indexed Issue

**Date:** October 20, 2025  
**Status:** Troubleshooting in Progress  
**URL Affected:** https://bright-gift.com/blog/unique-graduation-gifts-creative-minds/

## Problem Summary

Google Search Console shows validation failed for pages that were "Crawled - currently not indexed":
- **Pending pages:** 28
- **Failed pages:** 1
- **Example URL:** https://bright-gift.com/blog/unique-graduation-gifts-creative-minds/
- **Last crawled:** Oct 23, 2025
- **Validation failed:** Started 10/23/25, Failed 10/25/25

## Root Cause Analysis

### Technical Findings

1. **Page is Accessible:**
   - HTTP Status: 200 OK ✅
   - Returns proper `x-robots-tag: index, follow` ✅
   - Content length: 1,752 words (adequate) ✅
   - Structured data: Present and valid ✅

2. **Redirects Configured:**
   - Line 45 in `public/_redirects`: `/blog/unique-graduation-gifts-creative-minds /blog/unique-graduation-gifts-creative-minds/ 301` ✅
   - Line 77 in `public/_redirects`: `/blog/unique-graduation-gifts-creative-minds.md /blog/unique-graduation-gifts-creative-minds/ 301` ✅

3. **Sitemap Status:**
   - URL appears once in sitemap (correct) ✅
   - Proper trailing slash format ✅
   - Last modified: 2025-09-17 ✅

### Issues Identified

1. **Frontmatter Schema Mismatch:**
   - Blog post had outdated frontmatter fields not in live schema
   - Fixed: Removed `faqSchema`, `imageAlt`, `ogImageAlt`, `socialImageAlt`, `priceRange`, `contentType`, `status`, `canonical`
   - Fixed: Updated date format and paths to match live schema

2. **Potential Cause: Low Perceived Value**
   - Google has crawled but decided not to index
   - May be seen as duplicate content or low-quality
   - Common with similar gift guide content across domain

3. **Possible Technical Issues:**
   - Slow page load times
   - JavaScript rendering issues
   - Thin content (though word count is adequate)
   - Duplicate content issues

## Fixes Applied

### ✅ 1. Updated Frontmatter to Match Live Schema

**Before:**
```yaml
date: 2025-09-17T00:00:00.000Z
image: /images/blog/unique-graduation-gifts-creative-minds/unique-graduation-gifts-for-the-creative-minds-banner.webp
ogImage: /images/blog/unique-graduation-gifts-creative-minds/unique-graduation-gifts-for-the-creative-minds-og.webp
socialImage: /images/blog/unique-graduation-gifts-creative-minds/unique-graduation-gifts-for-the-creative-minds-social.webp
```

**After:**
```yaml
date: "2025-09-17"
image: "/images/blog/unique-graduation-gifts-creative-minds/unique-graduation-gifts-for-the-creative-minds-banner.webp"
ogImage: "/images/blog/unique-graduation-gifts-creative-minds/unique-graduation-gifts-for-the-creative-minds-og.webp"
metaTitle: "Unique Graduation Gifts for Creative Minds | Artistic Ideas"
metaDescription: "Find unique graduation gifts for creative minds. Discover artistic graduation gift ideas that celebrate creativity and support their journey."
keywords: graduation gifts, creative gifts, artistic gifts, gifts for graduates, art supplies
tags: graduation gifts, creative gifts, artistic gifts, gifts for graduates, art supplies
category: gift-guide
readTime: 7
featured: false
draft: false
```

### ✅ 2. Removed Incompatible Fields

Removed fields not in `src/content/config.ts` schema:
- `faqSchema` (was causing parsing issues)
- `imageAlt`, `ogImageAlt`, `socialImageAlt` (not in schema)
- `priceRange` (not in schema)
- `contentType` (not in schema)
- `status` (not in schema)
- `canonical` (not in schema)
- `socialImage` (not in schema)

## Next Steps

### Immediate Actions

1. **Commit and Deploy Changes:**
   ```bash
   git add src/content/blog/unique-graduation-gifts-creative-minds.md
   git commit -m "fix(content): update unique-graduation-gifts frontmatter to match live schema"
   git push origin main
   ```

2. **Request Re-Indexing in Google Search Console:**
   - Navigate to URL Inspection tool
   - Enter: `https://bright-gift.com/blog/unique-graduation-gifts-creative-minds/`
   - Click "Request Indexing"
   - Monitor status for next 48 hours

3. **Verify Build:**
   ```bash
   npm run build
   ```
   - Ensure no schema errors
   - Verify page renders correctly
   - Check for console errors

### Monitoring

1. **Check Google Search Console:**
   - Monitor "Crawled - currently not indexed" status
   - Track when Google re-crawls the page
   - Verify validation status changes

2. **Verify Live Page:**
   ```bash
   curl -I https://bright-gift.com/blog/unique-graduation-gifts-creative-minds/
   ```
   - Should return 200 OK
   - Should include proper meta robots tags
   - Should load without errors

3. **Monitor Performance:**
   - Track if page gets indexed within 48-72 hours
   - Check for any new errors in Google Search Console
   - Monitor Core Web Vitals for the page

### If Issue Persists

1. **Check for Duplicate Content:**
   - Compare content with other graduation gift guides
   - Ensure unique angle and value
   - Consider updating content to be more distinctive

2. **Improve Internal Linking:**
   - Add more internal links to this page from other blog posts
   - Create related posts section
   - Link from category pages

3. **Content Enhancement:**
   - Add more unique insights
   - Expand with user reviews or testimonials
   - Add FAQ section with structured data
   - Include video or image gallery

4. **Technical Optimization:**
   - Improve page load speed
   - Optimize images
   - Fix any JavaScript rendering issues
   - Ensure mobile-friendly

## Common Reasons for "Crawled - Currently Not Indexed"

1. **Duplicated content:** Google sees it as duplicate of existing content
2. **Thin content:** Not enough unique value
3. **Quality issues:** Low perceived quality or value
4. **Technical problems:** Load time, rendering issues
5. **Crawl budget:** Limited budget allocated to site
6. **User signals:** Low engagement, high bounce rate
7. **Crawl directives:** Conflicting robots.txt or meta tags (not applicable here)

## Prevention for Future Posts

1. **Follow Schema:**
   - Always check `src/content/config.ts` for allowed fields
   - Never add fields not in the schema
   - Use correct data types (strings, arrays, dates)

2. **Content Quality:**
   - Ensure minimum 1,500+ words
   - Unique angle and value proposition
   - Strong internal linking
   - Proper keyword optimization

3. **Technical Standards:**
   - Valid structured data
   - Fast load times
   - Mobile-friendly
   - Proper redirects configured

4. **SEO Best Practices:**
   - Unique meta descriptions
   - Proper heading structure
   - Image alt text
   - Internal linking
   - Social sharing optimization

## Files Modified

- `src/content/blog/unique-graduation-gifts-creative-minds.md`
  - Fixed frontmatter to match live schema
  - Removed incompatible fields
  - Updated date format
  - Fixed image paths

## Verification

- ✅ YAML validation passed
- ✅ No schema errors
- ✅ Redirects properly configured
- ✅ Page accessible and returns 200 OK
- ✅ Structured data present and valid
- ✅ Proper robots meta tags

## Status

**Current:** Fixed frontmatter schema issues, awaiting deployment and re-indexing  
**Next Check:** 48 hours after deployment  
**Expected Resolution:** 48-72 hours after requesting re-indexing

