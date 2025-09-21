# SEO Issues Tracker
*Generated: December 19, 2024*

## Critical Issues

### Issue #001 - Multiple Pages Non-Indexable
- **Issue ID**: 001
- **Severity**: Critical
- **Category**: Indexability
- **Status**: **RESOLVED**
- **Description**: 18 pages suddenly became non-indexable around July 25, 2025
- **Details**:
  - 6 pages marked as "Nofollow page" (NEW)
  - 6 pages marked as "Noindex page" (NEW)
  - 6 pages marked as "Noindex and nofollow page" (NEW)
- **Files Affected**:
  - `src/pages/robots.txt.astro` - **RESOLVED: Fixed Cloudflare Workers routing**
  - `src/pages/sitemap.xml.ts` - **RESOLVED: Replaced with static generation**
  - `astro.config.mjs` - **RESOLVED: Added routes.exclude for static files**
  - Cloudflare Workers - **RESOLVED: No longer processing robots.txt/sitemap.xml**
- **Root Cause**: **RESOLVED** - Cloudflare Workers was wrapping robots.txt in HTML due to missing routes.exclude configuration
- **Fix Applied**: Added `routes: { exclude: ['/robots.txt', '/sitemap.xml'] }` to Cloudflare adapter config
- **SEO Impact**: Direct cause of plummeting organic visibility - **RESOLVED**

### Issue #002 - Sitemap Missing Blog Posts
- **Issue ID**: 002
- **Severity**: High
- **Category**: Indexability
- **Status**: **RESOLVED**
- **Description**: Google Search Console only showing 24 pages instead of expected 40+ blog posts
- **Details**:
  - Static sitemap.xml was outdated and not being updated
  - Dynamic sitemap generation was failing in Cloudflare Workers environment
- **Files Affected**:
  - `src/pages/sitemap.xml.ts` - **RESOLVED: Replaced with static generation**
  - `scripts/generate-sitemap.js` - **RESOLVED: Created automated sitemap generation**
  - `package.json` - **RESOLVED: Integrated sitemap generation into build process**
- **Root Cause**: **RESOLVED** - Dynamic sitemap generation incompatible with Cloudflare Workers
- **Fix Applied**: Implemented Node.js script to generate static sitemap.xml during build
- **SEO Impact**: Missing blog posts not being indexed - **RESOLVED**

### Issue #003 - Amazon Affiliate Links Using Incorrect rel Attribute
- **Issue ID**: 003
- **Severity**: High
- **Category**: Link Quality
- **Status**: **RESOLVED**
- **Description**: Amazon affiliate links using `rel="nofollow"` instead of `rel="sponsored"`
- **Details**:
  - Google recommends `rel="sponsored"` for affiliate links
  - `rel="nofollow"` doesn't prevent HTTP status checking by crawlers
  - Ahrefs still attempts to access links and reports 503 errors from Amazon
- **Files Affected**:
  - 34 blog post files - **RESOLVED: Updated to use rel="sponsored"**
  - `scripts/fix-amazon-links-sponsored.js` - **RESOLVED: Created automated fix script**
- **Root Cause**: **RESOLVED** - Using incorrect rel attribute for affiliate links
- **Fix Applied**: Updated all Amazon affiliate links to use `rel="sponsored"` as recommended by Google
- **SEO Impact**: Proper semantic markup for affiliate links - **RESOLVED**

## High Priority Issues (Priority 2)

### Issue #004 - Broken Images
- **Issue ID**: 004
- **Severity**: High
- **Category**: Images
- **Status**: Found
- **Description**: 33 broken images across the site
- **Details**: Rising trend of broken images
- **Files Affected**: TBD - Image files and pages containing them
- **Root Cause**: TBD - To be determined during audit
- **Fix Required**: TBD - To be determined after root cause identification
- **SEO Impact**: Poor user experience, potential crawl issues

### Issue #005 - External 5XX Errors
- **Issue ID**: 005
- **Severity**: High
- **Category**: External
- **Status**: Found
- **Description**: 452 external 5XX errors (increasing by 8)
- **Details**: Server-side errors on external resources
- **Files Affected**: TBD - External resource references
- **Root Cause**: TBD - To be determined during audit
- **Fix Required**: TBD - To be determined after root cause identification
- **SEO Impact**: May affect site functionality and user experience

## Medium Priority Issues (Priority 3)

### Issue #006 - Structured Data Validation Errors
- **Issue ID**: 006
- **Severity**: Medium
- **Category**: Content
- **Status**: Found
- **Description**: 6 pages with schema.org validation errors
- **Details**: All 6 errors are NEW (recently appeared)
- **Files Affected**: TBD - Pages with structured data
- **Root Cause**: TBD - To be determined during audit
- **Fix Required**: TBD - To be determined after root cause identification
- **SEO Impact**: Prevents rich snippets, reduces click-through rates

### Issue #007 - Meta Description Issues
- **Issue ID**: 007
- **Severity**: Medium
- **Category**: Content
- **Status**: Found
- **Description**: Multiple pages with meta description problems
- **Details**:
  - 19 pages with meta descriptions too long
  - 2 pages with meta descriptions too short
- **Files Affected**: TBD - Pages with meta description issues
- **Root Cause**: TBD - To be determined during audit
- **Fix Required**: TBD - To be determined after root cause identification
- **SEO Impact**: May affect click-through rates in search results

## Low Priority Issues (Priority 4)

### Issue #008 - Redirect Chains
- **Issue ID**: 008
- **Severity**: Low
- **Category**: Links
- **Status**: Found
- **Description**: 35 pages with 3XX redirects
- **Details**: 10 redirects improved recently
- **Files Affected**: TBD - Redirect configuration files
- **Root Cause**: TBD - To be determined during audit
- **Fix Required**: TBD - To be determined after root cause identification
- **SEO Impact**: Minor crawl efficiency impact

## Issue Summary
- **Total Issues Found**: 8
- **Critical**: 2
- **High**: 3
- **Medium**: 2
- **Low**: 1
- **Status**: **ROOT CAUSE CONFIRMED** - Cloudflare Workers server configuration not serving robots.txt and sitemap.xml

## Next Steps
1. **✅ Phase 1 Complete** - Root cause identified
2. **Investigate Cloudflare Workers configuration** for serving robots.txt and sitemap.xml
3. **Research Astro static vs server output** for SEO optimization
4. **Create comprehensive fix plan** for Cloudflare Workers routing
5. **Test solutions** before implementing in production

---
*This tracker will be updated as new issues are discovered and existing issues are investigated.*
