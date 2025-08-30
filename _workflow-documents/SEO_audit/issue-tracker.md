# SEO Issue Tracker
*Generated: December 19, 2024*

## Issue Tracking System
This document tracks all SEO issues discovered during the audit, with status updates and fix requirements.

## Issue Status Definitions
- **Found**: Issue identified and documented
- **Investigating**: Root cause analysis in progress
- **Fixed**: Issue resolved
- **Verified**: Fix confirmed to work

## Critical Issues (Priority 1)

### Issue #001 - Multiple Pages Non-Indexable
- **Issue ID**: 001
- **Severity**: Critical
- **Category**: Indexability
- **Status**: **ROOT CAUSE REFINED**
- **Description**: 18 pages suddenly became non-indexable around July 25, 2025
- **Details**: 
  - 6 pages marked as "Nofollow page" (NEW)
  - 6 pages marked as "Noindex page" (NEW)
  - 6 pages marked as "Noindex and nofollow page" (NEW)
- **Files Affected**: 
  - `src/pages/robots.txt.astro` - **CRITICAL: Returning HTML instead of plain text**
  - `src/pages/sitemap.xml.ts` - **WORKING: Correctly served with XML content type**
  - `astro.config.mjs` - **CRITICAL: Configured with `output: 'server'`**
  - Cloudflare Workers - **CRITICAL: Not respecting content-type headers**
- **Root Cause**: **ROOT CAUSE REFINED** - robots.txt is accessible but returns HTML instead of plain text, preventing search engines from parsing it correctly
- **Fix Required**: Fix Cloudflare Workers content-type handling for robots.txt, or implement alternative solution
- **SEO Impact**: Direct cause of plummeting organic visibility

### Issue #002 - Sitemap Configuration Error
- **Issue ID**: 002
- **Severity**: Critical
- **Category**: Sitemap
- **Status**: **ROOT CAUSE IDENTIFIED**
- **Description**: Noindex page found in sitemap (conflicting signals)
- **Details**: 1 page marked as noindex is included in sitemap
- **Files Affected**: 
  - `src/pages/sitemap.xml.ts` - **CRITICAL: Not being served by Cloudflare Workers**
  - `astro.config.mjs` - **CRITICAL: Configured with `output: 'server'`**
  - `dist/_routes.json` - **CRITICAL: No route for sitemap.xml**
- **Root Cause**: **ROOT CAUSE CONFIRMED** - sitemap.xml not being served due to Cloudflare Workers server configuration
- **Fix Required**: Configure Cloudflare Workers to serve sitemap.xml, or change to static output
- **SEO Impact**: Confuses search engines about page indexability

### Issue #003 - Broken Pages in Sitemap
- **Issue ID**: 003
- **Severity**: High
- **Category**: Sitemap
- **Status**: **ROOT CAUSE IDENTIFIED**
- **Description**: 2 pages with 4XX errors included in sitemap
- **Details**: Sitemap points to broken pages
- **Files Affected**: 
  - `src/pages/sitemap.xml.ts` - **CRITICAL: Not being served by Cloudflare Workers**
  - `astro.config.mjs` - **CRITICAL: Configured with `output: 'server'`**
  - `dist/_routes.json` - **CRITICAL: No route for sitemap.xml**
- **Root Cause**: **ROOT CAUSE CONFIRMED** - sitemap.xml not being served due to Cloudflare Workers server configuration
- **Fix Required**: Configure Cloudflare Workers to serve sitemap.xml, or change to static output
- **SEO Impact**: Wastes crawl budget on broken pages

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
