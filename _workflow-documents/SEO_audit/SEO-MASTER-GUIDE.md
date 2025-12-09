# BrightGift SEO Master Guide

**Last Updated:** December 3, 2025  
**Purpose:** Definitive reference document for all SEO systems, files, structures, build processes, workflows, and troubleshooting procedures  
**Audience:** Developers, AI agents, and anyone maintaining the BrightGift SEO system

---

## Table of Contents

1. [Executive Summary & Quick Reference](#1-executive-summary--quick-reference)
2. [Redirect System Architecture](#2-redirect-system-architecture)
3. [Sitemap Generation System](#3-sitemap-generation-system)
4. [Canonical URL System](#4-canonical-url-system)
5. [Content Structure & Frontmatter](#5-content-structure--frontmatter)
6. [Build Process & Validation](#6-build-process--validation)
7. [Google Search Console Integration](#7-google-search-console-integration)
8. [Manual QA & Verification Procedures](#8-manual-qa--verification-procedures)
9. [Maintenance & Monitoring](#9-maintenance--monitoring)
10. [Troubleshooting Guide](#10-troubleshooting-guide)
11. [Historical Context & Lessons Learned](#11-historical-context--lessons-learned)
12. [File Reference](#12-file-reference)
13. [Quick Reference Tables](#13-quick-reference-tables)

---

## 1. Executive Summary & Quick Reference

### Purpose of This Guide

This document serves as the single source of truth for all SEO-related systems, processes, and procedures at BrightGift. It consolidates knowledge from multiple sources, historical decisions, and current implementations into one comprehensive reference.

**Key Objectives:**
- Provide complete documentation of all SEO systems
- Explain the "why" behind technical decisions
- Offer step-by-step procedures for common tasks
- Serve as a troubleshooting reference
- Enable new team members (human or AI) to understand and maintain the system

### Quick Reference Table

| Task | Location | Command/File |
|------|----------|--------------|
| Add a new redirect | Section 2.3 | Edit `public/_redirects` |
| Regenerate sitemap | Section 3.1 | `npm run generate:sitemap` |
| Check canonical URLs | Section 4.4 | Inspect `<link rel="canonical">` tags |
| Validate SEO content | Section 6.4 | `npm run seo:validate` |
| Test redirects | Section 2.6 | `curl -I "https://bright-gift.com/url"` |
| Check GSC issues | Section 7.2 | Google Search Console → Page indexing |
| Verify deployment | Section 8.1 | Post-deployment checklist |
| Troubleshoot 308 redirects | Section 10.1 | Check `public/_redirects` and `astro.config.mjs` |

### SEO System Overview

BrightGift's SEO system is built on four core pillars:

1. **Redirect Management** - Explicit 301 redirects via `public/_redirects` file, with Astro's `trailingSlash: 'always'` configuration
2. **Sitemap Generation** - Automated sitemap generation during pre-build, filtering drafts and including all published content
3. **Canonical URLs** - Consistent trailing-slash canonical URLs across all pages, generated in layouts and blog templates
4. **Content Structure** - Standardized frontmatter schema with SEO fields, draft status, and canonical URL fields

### Key Principles and Philosophy

**1. Always Use 301 Redirects (Never 308)**
- 301 redirects transfer SEO value properly
- 308 redirects cause GSC validation failures
- Explicit redirects in `public/_redirects` override Astro's default 308 behavior

**2. Trailing Slashes Always**
- All URLs (except root) must have trailing slashes
- Canonical URLs always use trailing slashes
- Sitemap URLs always use trailing slashes
- This ensures consistency across the entire system

**3. Explicit Over Implicit**
- Explicit redirect rules in `_redirects` file take precedence
- Explicit canonical URLs in frontmatter override generated ones
- Explicit draft filtering matches routing logic

**4. Validate Before Deploy**
- Run SEO validation scripts before deployment
- Test redirects with curl commands
- Verify canonical tags in rendered HTML
- Check sitemap completeness

**5. Monitor and Iterate**
- Weekly GSC monitoring for new issues
- Monthly comprehensive SEO audits
- Quarterly strategy reviews
- Document all decisions and changes

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    SEO System Layers                     │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Redirect Management                           │
│  ├─ public/_redirects (301 redirects, highest priority) │
│  ├─ astro.config.mjs (trailingSlash: 'always')         │
│  └─ src/middleware.ts (skip logic for certain paths)    │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Content Discovery                            │
│  ├─ src/content/blog/*.md (blog posts)                 │
│  ├─ src/content/config.ts (content schema)             │
│  └─ Draft filtering (matches routing logic)            │
├─────────────────────────────────────────────────────────┤
│  Layer 3: URL Generation                                │
│  ├─ src/layouts/Layout.astro (canonical URL logic)      │
│  ├─ src/pages/blog/[...slug].astro (blog canonicals)    │
│  └─ Frontmatter canonical field (explicit overrides)    │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Sitemap Generation                            │
│  ├─ scripts/generate-sitemap.js (pre-build script)      │
│  ├─ package.json prebuild hook                          │
│  └─ public/sitemap.xml (output file)                    │
├─────────────────────────────────────────────────────────┤
│  Layer 5: Validation & Monitoring                       │
│  ├─ scripts/seo-validation/* (validation scripts)       │
│  ├─ Google Search Console (GSC monitoring)              │
│  └─ Manual QA procedures (post-deployment)              │
└─────────────────────────────────────────────────────────┘
```

### Common Workflows

**Adding a New Blog Post:**
1. Create markdown file in `src/content/blog/`
2. Add frontmatter with all required SEO fields
3. Set `draft: false` when ready to publish
4. Run `npm run generate:sitemap` to update sitemap
5. Deploy and verify in GSC

**Adding a New Redirect:**
1. Add rule to `public/_redirects` with 301 status
2. Test redirect with `curl -I "https://bright-gift.com/old-url"`
3. Verify redirect chain is single-hop (301 → 200)
4. Deploy and monitor in GSC

**Troubleshooting GSC Issues:**
1. Check GSC issue type (Crawled - not indexed, Redirect error, Page with redirect)
2. Test URL with curl to verify HTTP status
3. Check canonical tag matches sitemap URL
4. Verify redirect rules in `public/_redirects`
5. Request new validation in GSC after fixes

---

## 2. Redirect System Architecture

### 2.1 Complete Redirect Strategy (301 vs 308)

**Core Principle:** Always use 301 (Permanent Redirect) status codes, never 308 (Permanent Redirect - Method Preserved).

**Why 301 Over 308:**
- **SEO Value Transfer:** 301 redirects properly transfer link equity and search rankings
- **GSC Validation:** Google Search Console validates 301 redirects correctly; 308 redirects cause validation failures
- **Search Engine Compatibility:** All major search engines handle 301 redirects consistently
- **Historical Context:** BrightGift previously experienced GSC validation failures due to 308 redirects from Cloudflare Pages

**When 301 Redirects Are Used:**
- All trailing-slash redirects (non-slash → slash)
- Category page redirects (old categories → new categories)
- Blog post redirects (non-slash → slash)
- Missing page redirects (404 → appropriate destination)
- Deleted content redirects (old URLs → 410 Gone page)

**When Redirects Are NOT Used:**
- API endpoints (handled by Astro routing)
- Static assets (images, CSS, JS files)
- OAuth callbacks (special handling required)
- Files excluded from Astro processing (robots.txt, sitemap.xml)

### 2.2 Redirect Priority Order (Established Hierarchy)

The redirect system follows a strict priority order to ensure predictable behavior:

```
Priority 1 (HIGHEST): public/_redirects file
  └─ Explicit 301 redirect rules
  └─ Processed by Cloudflare Pages before Astro
  └─ Takes precedence over all other redirect mechanisms

Priority 2: Astro Middleware (src/middleware.ts)
  └─ Custom skip logic for specific paths
  └─ Prevents unnecessary redirect processing
  └─ Only handles GET requests

Priority 3: Astro trailingSlash Configuration (astro.config.mjs)
  └─ trailingSlash: 'always' setting
  └─ Automatically redirects non-slash URLs to slash URLs
  └─ Uses 308 status codes by default (overridden by _redirects)

Priority 4 (LOWEST): Cloudflare Pages Default Behavior
  └─ Fallback redirect handling
  └─ Uses 308 status codes
  └─ Only applies when no other rules match
```

**Critical Understanding:**
- The `public/_redirects` file rules are processed **before** Astro's trailing-slash redirects
- This allows explicit 301 rules to override Astro's default 308 behavior
- The middleware skip logic prevents redirects for paths that should be handled directly

### 2.3 File: `public/_redirects` - Complete Documentation

**Location:** `public/_redirects`  
**Purpose:** Cloudflare Pages redirect configuration file that defines explicit 301 redirect rules  
**Processing:** Cloudflare Pages processes this file before Astro's routing logic

#### Syntax and Format Rules

**Basic Format:**
```
/source-url /destination-url 301
```

**Rules:**
- One redirect rule per line
- Source URL (left side) - the URL pattern to match
- Destination URL (right side) - where to redirect
- Status code (301) - always use 301 for permanent redirects
- Comments start with `#` and must be on their own line
- Empty lines are ignored
- Order matters - first matching rule wins

**Examples:**
```
# Static page redirect
/contact /contact/ 301

# Blog post redirect
/blog/post-slug /blog/post-slug/ 301

# Category redirect
/category/old-name /category/new-name/ 301

# Missing page redirect (410 Gone)
/blog/deleted-post /410.html 301
```

#### Current Rules Inventory

The `public/_redirects` file contains the following categories of redirects:

**1. Critical Static Pages (Lines 9-12)**
- `/terms` → `/terms/` (301)
- `/privacy` → `/privacy/` (301)
- `/data-deletion` → `/data-deletion/` (301)
- `/contact` → `/contact/` (301)

**Purpose:** Force 301 redirects for critical pages to avoid 308 redirects from Astro's `trailingSlash: 'always'` setting.

**2. Blog Index (Line 15)**
- `/blog` → `/blog/` (301)

**Purpose:** Ensure blog index page uses trailing slash consistently.

**3. Category Pages (Lines 18-29)**
- `/category/gift-guides` → `/category/gift-guides/` (301)
- `/category/` → `/category/gift-guides` (301)
- Category redirects: `/category/data-driven` → `/category/gift-tips/` (301)
- Category redirects: `/category/educational` → `/category/gift-tips/` (301)
- Category redirects: `/category/gift-guide` → `/category/gift-guides/` (301)

**Purpose:** Ensure category pages use trailing slashes and redirect old category names to new ones.

**4. OAuth Callback (Line 32)**
- `/oauth/callback/` → `/oauth/callback` (301)

**Purpose:** OAuth callbacks must NOT have trailing slashes (special requirement).

**5. Blog Post Redirects (Lines 39-87)**
- All blog posts have explicit redirects from non-slash to slash URLs
- Format: `/blog/post-slug` → `/blog/post-slug/` (301)
- Total: 50 blog post redirects (matches number of published blog posts)

**Purpose:** Ensure all blog posts use trailing slashes consistently and avoid 308 redirects.

**6. .md Extension Redirects (Lines 92-117)**
- Redirects from `.md` extension URLs to clean URLs
- Format: `/blog/post-slug.md` → `/blog/post-slug/` (301)
- Total: ~26 .md extension redirects

**Purpose:** Clean up old URLs that included `.md` extensions (from previous system).

**7. Missing Pages Redirects (Lines 120-125)**
- `/ai-gift-guide` → `/blog/` (301)
- `/top-gifts` → `/blog/` (301)
- `/about` → `/#about-tool` (301)

**Purpose:** Redirect old or non-existent pages to appropriate destinations.

**8. Deleted Content Redirects (Lines 128-132)**
- `/blog/gifts-for-artists` → `/410.html` (301)
- `/blog/unique-birthday-gifts-for-teens-break-the-mold` → `/410.html` (301)
- `/blog/sample-post` → `/410.html` (301)
- `/blog/handmade-gifts` → `/410.html` (301)

**Purpose:** Return 410 Gone status for content that was deleted and will never exist again.

**9. Gift Guides Structure Fixes (Lines 135-138)**
- `/gift-guides/*` → `/category/gift-guides/` (301)

**Purpose:** Redirect old gift guides structure to new category structure.

#### How to Add New Redirects

**Step-by-Step Process:**

1. **Identify the redirect need:**
   - New blog post published? Add trailing-slash redirect
   - Category renamed? Add category redirect
   - Page moved? Add source → destination redirect

2. **Determine the redirect type:**
   - Trailing-slash redirect: `/url` → `/url/` (301)
   - Category redirect: `/category/old` → `/category/new/` (301)
   - Missing page: `/old-url` → `/new-url/` or `/410.html` (301)

3. **Add to `public/_redirects` file:**
   - Add the rule in the appropriate section (maintain organization)
   - Use 301 status code
   - Ensure destination URL has trailing slash (if applicable)
   - Add a comment if the redirect needs explanation

4. **Test the redirect:**
   ```bash
   curl -I "https://bright-gift.com/source-url"
   # Expected: HTTP/2 301
   # Location: /destination-url/
   ```

5. **Verify redirect chain:**
   ```bash
   curl -I -L --max-redirs 3 "https://bright-gift.com/source-url" 2>&1 | grep -E "HTTP|location:"
   # Should show: 301 → 200 (only 2 HTTP responses)
   ```

6. **Deploy and monitor:**
   - Deploy changes to Cloudflare Pages
   - Monitor in GSC for any validation issues
   - Request new validation if needed

**Example: Adding a New Blog Post Redirect**

```bash
# 1. New blog post published: "new-gift-guide-2025"
# 2. Add redirect rule to public/_redirects:

# Blog posts - explicit 301 redirects for trailing slashes
/blog/new-gift-guide-2025 /blog/new-gift-guide-2025/ 301

# 3. Test:
curl -I "https://bright-gift.com/blog/new-gift-guide-2025"
# Expected: HTTP/2 301 → /blog/new-gift-guide-2025/

# 4. Deploy and verify
```

#### Testing Procedures

**Basic Redirect Test:**
```bash
# Test a single redirect
curl -I "https://bright-gift.com/blog/post-slug"
# Expected output:
# HTTP/2 301
# location: /blog/post-slug/
```

**Redirect Chain Validation:**
```bash
# Follow redirects and verify single-hop
curl -I -L --max-redirs 3 "https://bright-gift.com/blog/post-slug" 2>&1 | grep -E "HTTP|location:" | head -5
# Expected: Only 2 HTTP responses (301 → 200)
```

**Batch Testing:**
```bash
# Test multiple redirects
for url in "/contact" "/blog" "/category/gift-guides"; do
  echo "Testing: $url"
  curl -I "https://bright-gift.com$url" | grep -E "HTTP|location:"
  echo "---"
done
```

**Verify No 308 Redirects:**
```bash
# Check for 308 status codes (should find none)
curl -I "https://bright-gift.com/contact" | grep "308"
# Expected: No output (no 308 redirects)
```

### 2.4 Astro Configuration (`astro.config.mjs`)

**Location:** `astro.config.mjs`  
**Purpose:** Astro framework configuration including redirect behavior

#### Key Settings

**`trailingSlash: 'always'` (Line 8)**
- **Purpose:** Ensures all URLs (except root) have trailing slashes
- **Behavior:** Astro automatically redirects non-slash URLs to slash URLs
- **Default Status Code:** 308 (Permanent Redirect - Method Preserved)
- **Override:** Explicit 301 rules in `public/_redirects` override this behavior

**Why This Setting:**
- Ensures URL consistency across the entire site
- Matches sitemap URL format (all URLs have trailing slashes)
- Matches canonical URL format (all URLs have trailing slashes)
- Prevents duplicate content issues

**`site: 'https://bright-gift.com'` (Line 7)**
- **Purpose:** Defines the canonical domain for the site
- **Used By:** Canonical URL generation, sitemap generation, structured data

**`output: 'server'` (Line 9)**
- **Purpose:** Enables server-side rendering (SSR) mode
- **Impact:** Allows dynamic routing and middleware processing

#### Cloudflare Adapter Configuration

**`routes.exclude` (Lines 19-20)**
```javascript
routes: {
  exclude: ['/robots.txt', '/sitemap.xml', '/api/*', '/data-deletion', '/oauth/callback']
}
```

**Purpose:** Excludes specific paths from Cloudflare Workers processing, allowing them to be served as static files or handled by Astro directly.

**Excluded Paths:**
- `/robots.txt` - Served as static file
- `/sitemap.xml` - Served as static file
- `/api/*` - Handled by Astro API routes
- `/data-deletion` - Handled by Astro page
- `/oauth/callback` - Handled by Astro page (special OAuth handling)

**Important Note:** Blog posts (`/blog/*`) and category pages (`/category/*`) are **NOT** excluded, allowing Astro to handle their routing and redirects.

#### How Astro and Cloudflare Interact

**Request Flow:**
1. Request arrives at Cloudflare Pages
2. Cloudflare checks `public/_redirects` file first
3. If match found, Cloudflare applies 301 redirect (before Astro)
4. If no match, request passes to Astro
5. Astro checks middleware (`src/middleware.ts`)
6. If middleware skips, Astro processes route directly
7. If middleware doesn't skip, Astro applies `trailingSlash: 'always'` logic
8. Astro's trailing-slash redirect uses 308 by default (but overridden by `_redirects`)

**Critical Interaction:**
- `public/_redirects` rules are processed **before** Astro's trailing-slash redirects
- This allows explicit 301 rules to override Astro's default 308 behavior
- The middleware skip logic prevents unnecessary redirect processing for blog and category pages

### 2.5 Middleware (`src/middleware.ts`)

**Location:** `src/middleware.ts`  
**Purpose:** Custom middleware logic to skip redirect processing for specific paths

#### Current Skip Logic

The middleware skips redirect processing for the following paths:

**Root Path:**
- `/` - Homepage (no redirect needed)

**Files with Extensions:**
- Any path containing `.` (e.g., `.html`, `.css`, `.js`, `.png`, `.webp`)
- Static assets are served directly

**API Routes:**
- `/api/*` - API endpoints (CRITICAL: Don't redirect API endpoints)

**Static Asset Directories:**
- `/_astro/*` - Astro build assets
- `/images/*` - Image files
- `/icons/*` - Icon files
- `/placeholders/*` - Placeholder images

**Special Directories:**
- `/care-calculator` - Static calculator directory
- `/blog/*` - Blog posts (handled by explicit redirects in `_redirects`)
- `/category/*` - Category pages (handled by explicit redirects in `_redirects`)

**Special Files:**
- `/robots.txt` - Robots file
- `/sitemap.xml` - Sitemap file
- `/favicon.svg` - Favicon

#### Why Certain Paths Are Excluded

**Blog Posts and Category Pages:**
- These paths are skipped in middleware to prevent double redirects
- Explicit redirects in `public/_redirects` handle these paths
- Skipping in middleware allows `_redirects` rules to take precedence

**API Routes:**
- API endpoints must not be redirected (would break API functionality)
- API routes are handled by Astro's API routing system

**Static Assets:**
- Images, CSS, JS files should be served directly
- No redirect processing needed for static assets

**Special Files:**
- `robots.txt` and `sitemap.xml` are excluded from Astro processing
- They are served as static files by Cloudflare Pages

### 2.6 Live Verification Procedures

#### Manual curl Testing Commands

**Test Single Redirect:**
```bash
curl -I "https://bright-gift.com/contact"
# Expected:
# HTTP/2 301
# location: /contact/
```

**Test Blog Post Redirect:**
```bash
curl -I "https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties"
# Expected:
# HTTP/2 301
# location: /blog/fun-gifts-for-kids-birthday-parties/
```

**Test Category Redirect:**
```bash
curl -I "https://bright-gift.com/category/gift-guides"
# Expected:
# HTTP/2 301
# location: /category/gift-guides/
```

**Follow Redirect Chain:**
```bash
curl -I -L --max-redirs 3 "https://bright-gift.com/contact" 2>&1 | grep -E "HTTP|location:" | head -5
# Expected output:
# HTTP/2 301
# location: /contact/
# HTTP/2 200
# (Only 2 HTTP responses - single-hop redirect)
```

#### Expected HTTP Status Codes

**Successful Redirects:**
- `301` - Permanent redirect (correct)
- `200` - Final destination (correct)

**Problem Status Codes:**
- `308` - Permanent redirect with method preservation (WRONG - causes GSC issues)
- `302` - Temporary redirect (WRONG - should use 301 for permanent redirects)
- `404` - Not found (WRONG - should have redirect rule)
- `500` - Server error (WRONG - indicates configuration problem)

#### Redirect Chain Validation

**Single-Hop Redirect (Correct):**
```
Request: /contact
  ↓
301 Redirect: /contact/
  ↓
200 OK: /contact/
```

**Multi-Hop Redirect (Problem):**
```
Request: /contact
  ↓
301 Redirect: /contact/
  ↓
301 Redirect: /contact/ (loop or extra hop)
  ↓
200 OK: /contact/
```

**How to Detect Problems:**
```bash
# Count redirect hops
curl -I -L --max-redirs 5 "https://bright-gift.com/contact" 2>&1 | grep -c "HTTP"
# Expected: 2 (one redirect, one final response)
# If > 2: Problem detected (redirect loop or extra hops)
```

**Check for 308 Redirects:**
```bash
# Test for 308 status codes
curl -I "https://bright-gift.com/contact" | grep "308"
# Expected: No output (no 308 redirects)
# If output found: Problem - 308 redirects present
```

---

## 3. Sitemap Generation System

### 3.1 File: `scripts/generate-sitemap.js` - Complete Documentation

**Location:** `scripts/generate-sitemap.js`  
**Purpose:** Node.js script that generates the XML sitemap for all published blog posts and static pages  
**Execution:** Runs automatically during pre-build phase via `package.json` prebuild script

#### Purpose and Execution

The sitemap generation script:
1. Discovers all blog posts in `src/content/blog/`
2. Filters out draft posts (matches routing logic)
3. Generates XML sitemap with proper formatting
4. Includes static pages (homepage, blog index, category pages, etc.)
5. Writes output to `public/sitemap.xml`

**How It Works:**
- Reads markdown files from `src/content/blog/` directory
- Parses frontmatter using `gray-matter` library
- Checks `draft` and `status` fields to filter drafts
- Sorts posts by publication date (newest first)
- Generates XML with proper sitemap.org schema
- Writes to `public/sitemap.xml` (served as static file)

#### How It Discovers Blog Posts

**Discovery Process:**
1. Script reads `src/content/blog/` directory
2. Filters for `.md` files only
3. For each markdown file:
   - Reads file content
   - Parses frontmatter using `gray-matter`
   - Extracts `draft` and `status` fields
   - Extracts `date` field for publication date
   - Extracts `title` field (for logging/debugging)
4. Generates slug from filename (removes `.md` extension)

**File Structure Expected:**
```
src/content/blog/
  ├── post-slug-1.md
  ├── post-slug-2.md
  ├── draft-post.md (filtered out if draft: true)
  └── ...
```

#### Draft Filtering Logic (Matches Routing)

**Draft Detection:**
The script filters out posts that meet ANY of these conditions:
- `draft === true` (boolean)
- `draft === 'true'` (string)
- `status === 'draft'`
- `status === 'archived'`

**Why This Matches Routing:**
- Astro's `getStaticPaths()` function uses the same logic:
  ```javascript
  const blogPosts = await getCollection('blog', ({ data }) => isPreview || !data.draft);
  ```
- This ensures sitemap only includes posts that are actually accessible via routing
- Prevents sitemap from including URLs that return 404

**Example:**
```javascript
// Post with draft: true - EXCLUDED from sitemap
---
title: "Draft Post"
draft: true
---

// Post with draft: false - INCLUDED in sitemap
---
title: "Published Post"
draft: false
---
```

#### Static Pages Included

The sitemap includes the following static pages:

1. **Homepage** (`/`)
   - Priority: 1.0
   - Change frequency: daily

2. **Blog Index** (`/blog/`)
   - Priority: 0.8
   - Change frequency: weekly

3. **Category Pages:**
   - `/category/gift-guides/` (Priority: 0.8, Change frequency: weekly)
   - `/category/gift-tips/` (Priority: 0.8, Change frequency: weekly)

4. **Legal/Info Pages:**
   - `/privacy/` (Priority: 0.3, Change frequency: monthly)
   - `/terms/` (Priority: 0.3, Change frequency: monthly)
   - `/contact/` (Priority: 0.3, Change frequency: monthly)
   - `/data-deletion/` (Priority: 0.3, Change frequency: monthly)

**Total Static Pages:** 8 pages

#### URL Format (Trailing Slashes)

**All URLs in sitemap use trailing slashes:**
- Blog posts: `https://bright-gift.com/blog/post-slug/`
- Static pages: `https://bright-gift.com/page/`
- Homepage: `https://bright-gift.com/` (no trailing slash - root exception)

**Why Trailing Slashes:**
- Matches Astro's `trailingSlash: 'always'` configuration
- Matches canonical URL format
- Ensures consistency across entire system
- Prevents duplicate content issues

**Example Sitemap Entry:**
```xml
<url>
  <loc>https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/</loc>
  <lastmod>2025-12-02</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

#### Date Handling (`lastmod` Logic)

**Publication Date Extraction:**
- Uses `date` field from frontmatter
- Falls back to current date if `date` is missing
- Converts to ISO format (YYYY-MM-DD)

**Date Format:**
- Input: `date: 2025-12-02` (string) or `date: 2025-12-02T00:00:00.000Z` (ISO)
- Output: `2025-12-02` (YYYY-MM-DD format in sitemap)

**Last Modified Date:**
- Uses publication date as `lastmod` value
- For static pages, uses current date (regenerated on each build)
- Format: ISO date string (YYYY-MM-DD)

**Example:**
```javascript
const pubDate = post.pubDate ? new Date(post.pubDate).toISOString().split('T')[0] : currentDate;
// Result: "2025-12-02"
```

#### Output Location (`public/sitemap.xml`)

**File Path:** `public/sitemap.xml`  
**Accessibility:** Served as static file at `https://bright-gift.com/sitemap.xml`  
**Processing:** Excluded from Astro Workers processing (served directly by Cloudflare Pages)

**Why in `public/` Directory:**
- `public/` directory contents are copied to build output as-is
- No processing or transformation needed
- Served as static file for fast access
- Excluded from Astro routing (via `routes.exclude` in `astro.config.mjs`)

### 3.2 Build Integration (`package.json` prebuild script)

**Script Location:** `package.json` → `scripts.prebuild`  
**Command:** `npm run generate:sitemap || true`  
**Execution:** Runs automatically before every build

#### When Sitemap Is Generated

**Automatic Generation:**
- Before every `npm run build` command
- Before every Cloudflare Pages deployment
- During pre-build phase (before Astro build)

**Manual Generation:**
```bash
npm run generate:sitemap
```

**When to Regenerate:**
- After publishing a new blog post
- After changing a post's draft status
- After modifying static pages
- Before deployment (automatic via prebuild)

#### Error Handling (`|| true` Pattern)

**Why `|| true`:**
```json
"prebuild": "npm run generate:sitemap || true"
```

**Purpose:**
- Prevents build failures if sitemap generation fails
- Allows build to continue even if sitemap script has errors
- Ensures deployment doesn't fail due to sitemap issues

**Trade-offs:**
- Build succeeds even if sitemap is outdated
- Requires manual verification of sitemap generation
- Should monitor for sitemap generation errors in logs

**Best Practice:**
- Check build logs for sitemap generation errors
- Manually run `npm run generate:sitemap` if errors detected
- Fix any issues before deployment

### 3.3 Sitemap Structure

#### XML Format Requirements

**Sitemap Schema:**
- Must conform to sitemaps.org XML schema
- Must include XML declaration
- Must include `urlset` element with namespace

**Required Elements:**
- `<urlset>` - Root element with namespace
- `<url>` - Container for each URL entry
- `<loc>` - URL location (required)
- `<lastmod>` - Last modification date (optional but recommended)
- `<changefreq>` - Change frequency hint (optional)
- `<priority>` - Priority relative to other URLs (optional)

**Example Structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bright-gift.com/</loc>
    <lastmod>2025-12-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- More URLs... -->
</urlset>
```

#### Priority and Changefreq Values

**Priority Values:**
- `1.0` - Homepage (highest priority)
- `0.8` - Blog index, category pages (high priority)
- `0.7` - Blog posts (medium-high priority)
- `0.3` - Legal/info pages (low priority)

**Change Frequency Values:**
- `daily` - Homepage (updates frequently)
- `weekly` - Blog index, category pages (updates weekly)
- `monthly` - Blog posts, legal pages (updates monthly)

**Note:** Priority and changefreq are hints for search engines, not strict requirements. Search engines may ignore these values.

#### URL Canonicalization Rules

**All URLs Must:**
- Use HTTPS protocol
- Use full domain (`bright-gift.com`)
- Use trailing slashes (except root)
- Match canonical URLs exactly
- Match redirect destination URLs

**URL Format:**
```
https://bright-gift.com/blog/post-slug/
https://bright-gift.com/category/gift-guides/
https://bright-gift.com/contact/
```

**No Variations:**
- No HTTP URLs (only HTTPS)
- No non-slash URLs (except root)
- No query parameters or fragments
- No duplicate URLs

### 3.4 Maintenance Procedures

#### When to Regenerate

**Automatic Regeneration:**
- Before every build (via prebuild script)
- Before every deployment

**Manual Regeneration:**
```bash
npm run generate:sitemap
```

**When Manual Regeneration Is Needed:**
- After publishing new blog post (if build didn't run)
- After changing draft status of existing post
- After modifying static pages
- If sitemap appears outdated in GSC

#### How to Verify Completeness

**Check Sitemap File:**
```bash
# View sitemap contents
cat public/sitemap.xml

# Count blog post URLs
grep -c "/blog/" public/sitemap.xml

# Count total URLs
grep -c "<url>" public/sitemap.xml
```

**Compare with Blog Posts:**
```bash
# Count published blog posts (non-draft)
find src/content/blog -name "*.md" -exec grep -L "draft: true" {} \; | wc -l

# Should match number of blog post URLs in sitemap
```

**Verify Static Pages:**
- Check that all 8 static pages are included
- Verify URLs have trailing slashes
- Verify URLs use HTTPS

**Check for Missing Posts:**
- Compare sitemap URLs with published blog posts
- Verify no draft posts are included
- Verify all published posts are included

#### GSC Submission Process

**Initial Submission:**
1. Go to Google Search Console
2. Navigate to Sitemaps section
3. Enter: `https://bright-gift.com/sitemap.xml`
4. Click "Submit"

**After Updates:**
- GSC automatically re-crawls sitemap periodically
- No need to resubmit after every change
- Resubmit if sitemap structure changes significantly

**Verification:**
- Check "Last read" date in GSC
- Verify all URLs are discovered
- Monitor for errors or warnings

**Best Practices:**
- Submit sitemap once (GSC will re-crawl automatically)
- Monitor GSC for sitemap errors
- Fix any errors promptly
- Resubmit if sitemap structure changes

---

## 4. Canonical URL System

### 4.1 Canonical URL Strategy (Trailing Slashes Always)

**Core Principle:** All canonical URLs must use trailing slashes (except root) and match the sitemap URL format exactly.

**Why Trailing Slashes:**
- Ensures consistency across entire system
- Matches Astro's `trailingSlash: 'always'` configuration
- Matches sitemap URL format
- Prevents duplicate content issues
- Aligns with redirect destination URLs

**Canonical URL Format:**
- Always HTTPS protocol
- Always full domain (`bright-gift.com`)
- Always trailing slash (except root `/`)
- No query parameters or fragments
- Matches sitemap URL exactly

**Examples:**
```
✅ Correct: https://bright-gift.com/blog/post-slug/
✅ Correct: https://bright-gift.com/category/gift-guides/
✅ Correct: https://bright-gift.com/contact/
✅ Correct: https://bright-gift.com/ (root - no trailing slash)

❌ Wrong: https://bright-gift.com/blog/post-slug (no trailing slash)
❌ Wrong: http://bright-gift.com/blog/post-slug/ (HTTP, not HTTPS)
❌ Wrong: bright-gift.com/blog/post-slug/ (no protocol)
```

### 4.2 Implementation Locations

#### `src/layouts/Layout.astro` - Canonical URL Generation Logic

**Location:** `src/layouts/Layout.astro` (Lines 45-55)  
**Purpose:** Base layout that generates canonical URLs for all pages

**Key Code:**
```astro
const isHome = Astro.url.pathname === "/";
// Ensure canonical URL uses HTTPS and proper format with trailing slash
// CRITICAL: Always use trailing slash for consistency (matches trailingSlash: 'always' config)
let canonicalUrl = canonical || Astro.url.href.replace('http://', 'https://');
// Ensure trailing slash for all non-root paths (unless already has query params or hash)
if (!canonical && !isHome && !canonicalUrl.includes('?') && !canonicalUrl.includes('#')) {
  const urlObj = new URL(canonicalUrl);
  if (!urlObj.pathname.endsWith('/') && urlObj.pathname !== '/') {
    urlObj.pathname += '/';
    canonicalUrl = urlObj.toString();
  }
}
```

**Logic Flow:**
1. Check if page is homepage (`/`)
2. Use explicit `canonical` prop if provided (from frontmatter)
3. Otherwise, use current URL and ensure HTTPS
4. Add trailing slash if missing (except root and URLs with query/hash)
5. Generate final canonical URL

**Canonical Tag Output:**
```html
<link rel="canonical" href="https://bright-gift.com/blog/post-slug/" />
```

#### `src/pages/blog/[...slug].astro` - Blog Post Canonical URLs

**Location:** `src/pages/blog/[...slug].astro` (Lines 56-59)  
**Purpose:** Blog post template that generates canonical URLs for blog posts

**Key Code:**
```astro
// CRITICAL: Generate canonical URL with HTTPS and trailing slash
// This ensures consistent canonical URLs regardless of how the page was accessed
const postSlug = post.slug;
const canonicalUrl = `https://bright-gift.com/blog/${postSlug}/`;
```

**Why Explicit Generation:**
- Ensures consistent canonical URLs regardless of how page was accessed
- Matches sitemap URL format exactly
- Prevents canonical URL variations
- Uses hardcoded domain (not from request URL)

**Canonical Tag Output:**
```html
<link rel="canonical" href="https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/" />
```

#### Frontmatter `canonical` Field in Blog Posts

**Location:** Blog post frontmatter  
**Purpose:** Explicit canonical URL override (optional)

**Format:**
```yaml
---
title: "Post Title"
canonical: https://bright-gift.com/blog/post-slug/
---
```

**When to Use:**
- When canonical URL needs to differ from generated URL
- When consolidating duplicate content
- When redirecting old URLs to new canonical URLs

**Priority:**
- Frontmatter `canonical` field takes precedence over generated URLs
- If `canonical` is provided, it's used directly (no modification)
- If `canonical` is not provided, URL is generated automatically

**Best Practice:**
- Only use explicit `canonical` field when necessary
- Let system generate canonical URLs automatically for consistency
- Ensure explicit canonical URLs match sitemap URLs

### 4.3 Canonical URL Format Rules

#### Always HTTPS

**Rule:** All canonical URLs must use HTTPS protocol, never HTTP.

**Why:**
- Security best practice
- Search engines prefer HTTPS
- Consistent with site configuration
- Prevents mixed content issues

**Implementation:**
```javascript
canonicalUrl = canonicalUrl.replace('http://', 'https://');
```

#### Always Trailing Slash (Except Root)

**Rule:** All canonical URLs must have trailing slashes, except the root URL (`/`).

**Why:**
- Matches Astro's `trailingSlash: 'always'` configuration
- Matches sitemap URL format
- Matches redirect destination URLs
- Prevents duplicate content issues

**Implementation:**
```javascript
if (!isHome && !canonicalUrl.includes('?') && !canonicalUrl.includes('#')) {
  const urlObj = new URL(canonicalUrl);
  if (!urlObj.pathname.endsWith('/') && urlObj.pathname !== '/') {
    urlObj.pathname += '/';
    canonicalUrl = urlObj.toString();
  }
}
```

**Exceptions:**
- Root URL (`/`) - no trailing slash
- URLs with query parameters (`?param=value`) - trailing slash before `?`
- URLs with hash fragments (`#section`) - trailing slash before `#`

#### Full Domain Required

**Rule:** All canonical URLs must include the full domain (`bright-gift.com`).

**Why:**
- Absolute URLs are required for canonical tags
- Prevents relative URL issues
- Ensures search engines understand the canonical URL
- Matches sitemap URL format

**Implementation:**
```javascript
const canonicalUrl = `https://bright-gift.com/blog/${postSlug}/`;
```

**Never Use:**
- Relative URLs (`/blog/post-slug/`)
- Protocol-relative URLs (`//bright-gift.com/blog/post-slug/`)
- Incomplete domains (`blog/post-slug/`)

### 4.4 Verification Procedures

#### How to Check Canonical Tags

**Method 1: Browser Developer Tools**
1. Open page in browser
2. Right-click → Inspect
3. Go to Elements tab
4. Search for `canonical` or `rel="canonical"`
5. Verify `<link rel="canonical" href="...">` tag

**Method 2: View Page Source**
1. Open page in browser
2. Right-click → View Page Source
3. Search for `canonical`
4. Verify canonical tag format

**Method 3: curl Command**
```bash
# Extract canonical tag from HTML
curl -s "https://bright-gift.com/blog/post-slug/" | grep -i "canonical\|rel=\"canonical\"" | head -3
# Expected output:
# <link rel="canonical" href="https://bright-gift.com/blog/post-slug/" />
```

**Method 4: Google Search Console URL Inspection**
1. Go to Google Search Console
2. Use URL Inspection tool
3. Enter page URL
4. Check "Page is on Google" section
5. Verify canonical URL shown

#### Common Issues and Fixes

**Issue 1: Missing Trailing Slash**
- **Symptom:** Canonical URL is `https://bright-gift.com/blog/post-slug` (no trailing slash)
- **Cause:** Canonical URL generation logic not adding trailing slash
- **Fix:** Check `Layout.astro` canonical URL generation logic
- **Verify:** Canonical URL should be `https://bright-gift.com/blog/post-slug/`

**Issue 2: HTTP Instead of HTTPS**
- **Symptom:** Canonical URL is `http://bright-gift.com/blog/post-slug/`
- **Cause:** URL not being converted to HTTPS
- **Fix:** Ensure `replace('http://', 'https://')` is applied
- **Verify:** Canonical URL should be `https://bright-gift.com/blog/post-slug/`

**Issue 3: Canonical URL Doesn't Match Sitemap**
- **Symptom:** Canonical URL differs from sitemap URL
- **Cause:** Inconsistent URL generation between sitemap and canonical tags
- **Fix:** Ensure both use same URL format (trailing slashes, HTTPS, full domain)
- **Verify:** Canonical URL should exactly match sitemap URL

**Issue 4: Multiple Canonical Tags**
- **Symptom:** Page has multiple `<link rel="canonical">` tags
- **Cause:** Multiple templates or components adding canonical tags
- **Fix:** Ensure only one canonical tag is generated (check all templates)
- **Verify:** Page should have exactly one canonical tag

**Issue 5: Canonical URL Points to Wrong Page**
- **Symptom:** Canonical URL doesn't match current page
- **Cause:** Incorrect canonical URL generation or explicit canonical field
- **Fix:** Check frontmatter `canonical` field and URL generation logic
- **Verify:** Canonical URL should match current page URL

**Issue 6: Relative Canonical URL**
- **Symptom:** Canonical URL is relative (`/blog/post-slug/`)
- **Cause:** Canonical URL not including full domain
- **Fix:** Ensure canonical URL includes `https://bright-gift.com`
- **Verify:** Canonical URL should be absolute (full URL)

---

## 5. Content Structure & Frontmatter

### 5.1 Blog Post Schema (`src/content/config.ts`)

**Location:** `src/content/config.ts`  
**Purpose:** Defines the Zod schema for blog post frontmatter validation

#### All Required Fields

**`title` (string, required)**
- **Purpose:** Main title of the blog post
- **Used By:** Page `<title>` tag, H1 heading, structured data
- **Constraints:** Must be a non-empty string
- **Example:** `"25 Thoughtful Gifts for Plant Lovers"`

**`description` (string, required)**
- **Purpose:** Brief description of the blog post content
- **Used By:** Meta description (if `metaDescription` not provided), Open Graph description
- **Constraints:** Must be a non-empty string
- **Example:** `"Discover 25 thoughtful gift ideas for plant lovers, from tools to decorative items."`

**`image` (string, required)**
- **Purpose:** Primary image for the blog post
- **Used By:** Page image, structured data, social sharing
- **Constraints:** Must be a valid image path (relative or absolute)
- **Format:** Relative path from public directory or full URL
- **Example:** `"/images/blog/post-slug/banner.webp"`

**`date` (string or date, required)**
- **Purpose:** Publication date of the blog post
- **Used By:** Sitemap generation, structured data, blog post sorting
- **Constraints:** Must be valid date (string in YYYY-MM-DD format or Date object)
- **Transformation:** Converted to YYYY-MM-DD string format
- **Example:** `"2025-12-02"` or `2025-12-02T00:00:00.000Z`

#### All Optional Fields

**SEO Fields:**

**`metaTitle` (string, optional)**
- **Purpose:** SEO-optimized title (typically ≤60 characters)
- **Used By:** Page `<title>` tag (overrides `title` if provided)
- **Constraints:** Should be 50-60 characters for optimal SEO
- **Example:** `"25 Plant Lover Gifts: Thoughtful Ideas Under $75"`

**`metaDescription` (string, optional)**
- **Purpose:** SEO-optimized description (typically 140-160 characters)
- **Used By:** Meta description tag (overrides `description` if provided)
- **Constraints:** Should be 140-160 characters for optimal SEO
- **Example:** `"Find 25 thoughtful gifts for plant lovers. From tools to decor, discover perfect presents under $75."`

**`keywords` (array of strings, string, or null, optional)**
- **Purpose:** SEO keywords for the blog post
- **Used By:** Meta keywords tag, structured data
- **Constraints:** Can be array, comma-separated string, or null
- **Transformation:** Converted to array of strings (comma-separated strings are split)
- **Example:** `["gifts for plant lovers", "plant gifts", "gardening gifts"]` or `"gifts for plant lovers, plant gifts, gardening gifts"`

**Content Categorization:**

**`tags` (array of strings, optional)**
- **Purpose:** Content tags for categorization and filtering
- **Used By:** Content organization, filtering, related posts
- **Constraints:** Array of strings
- **Example:** `["gift-guides", "plants", "under-75"]`

**`category` (enum or string, optional)**
- **Purpose:** Content category classification
- **Used By:** Content organization, routing, structured data
- **Constraints:** Should be one of: `'gift-guide'`, `'seasonal'`, `'faq'`, `'tool-landing'`, or custom string
- **Transformation:** Normalized (e.g., `'gift-guides'` → `'gift-guide'`)
- **Example:** `"gift-guide"` or `"seasonal"`

**Author and Attribution:**

**`author` (string, optional)**
- **Purpose:** Author name or attribution
- **Used By:** Author display, structured data
- **Constraints:** String
- **Example:** `"BrightGift Team"`

**Affiliate and Tracking:**

**`affiliateLinks` (array of objects, optional)**
- **Purpose:** List of affiliate links in the post
- **Used By:** Affiliate tracking, structured data (ItemList schema)
- **Constraints:** Array of objects with `text` and `url` properties
- **Structure:**
  ```typescript
  {
    text: string;        // Link text/description
    url: string;         // Affiliate URL
    platform?: string;   // 'amazon', 'bookshop', or 'other'
  }
  ```
- **Transformation:** Platform values normalized (`'afrofiliate'` → `'other'`)
- **Example:**
  ```yaml
  affiliateLinks:
    - text: "Plant Watering Globe"
      url: "https://amazon.com/..."
      platform: "amazon"
  ```

**Social and Open Graph:**

**`ogImage` (string, optional)**
- **Purpose:** Open Graph image for social sharing
- **Used By:** Social media sharing (Facebook, Twitter, etc.)
- **Constraints:** Must be valid image path
- **Default:** Falls back to `image` field if not provided
- **Example:** `"/images/blog/post-slug/og-image.webp"`

**`twitterCard` (string, optional)**
- **Purpose:** Twitter card type
- **Used By:** Twitter sharing
- **Constraints:** Should be valid Twitter card type
- **Example:** `"summary_large_image"`

**Content Metadata:**

**`readTime` (number, optional)**
- **Purpose:** Estimated reading time in minutes
- **Used By:** Display on blog post, structured data
- **Constraints:** Number (minutes)
- **Default:** Calculated from word count if not provided
- **Example:** `10`

**`featured` (boolean or string, optional)**
- **Purpose:** Whether post is featured
- **Used By:** Featured post display, homepage
- **Constraints:** Boolean or string (`'true'`/`'false'`)
- **Transformation:** String values converted to boolean
- **Example:** `true` or `"true"`

**`draft` (boolean or string, optional)**
- **Purpose:** Whether post is a draft (not published)
- **Used By:** Draft filtering in routing and sitemap generation
- **Constraints:** Boolean or string (`'true'`/`'false'`)
- **Transformation:** String values converted to boolean
- **Default:** `false` (published)
- **Example:** `false` or `"false"`

**`status` (string, optional)**
- **Purpose:** Post status (alternative to `draft` field)
- **Used By:** Draft filtering, content organization
- **Constraints:** String
- **Values:** `'draft'`, `'published'`, `'archived'`
- **Example:** `"published"`

**Canonical URL:**

**`canonical` (string, optional)**
- **Purpose:** Explicit canonical URL override
- **Used By:** Canonical tag generation (overrides generated URL)
- **Constraints:** Must be full URL with HTTPS
- **Format:** `https://bright-gift.com/blog/post-slug/`
- **Example:** `"https://bright-gift.com/blog/post-slug/"`

**Image Alt Text:**

**`imageAlt` (string, optional)**
- **Purpose:** Alt text for primary image
- **Used By:** Image accessibility, SEO
- **Constraints:** Descriptive text for screen readers
- **Example:** `"25 thoughtful gifts for plant lovers displayed on a table"`

**`ogImageAlt` (string, optional)**
- **Purpose:** Alt text for Open Graph image
- **Used By:** Social media image accessibility
- **Constraints:** Descriptive text for screen readers
- **Example:** `"25 Plant Lover Gifts: Thoughtful Ideas Under $75"`

#### Field Purposes and Constraints

**Required Fields Summary:**
- `title` - Main title (required)
- `description` - Brief description (required)
- `image` - Primary image path (required)
- `date` - Publication date (required)

**SEO Fields:**
- `metaTitle` - SEO title (optional, overrides `title` in `<title>` tag)
- `metaDescription` - SEO description (optional, overrides `description` in meta tag)
- `keywords` - SEO keywords (optional, array or string)

**Content Organization:**
- `tags` - Content tags (optional, array)
- `category` - Content category (optional, enum or string)
- `author` - Author name (optional)

**Status and Visibility:**
- `draft` - Draft status (optional, boolean or string)
- `status` - Post status (optional, string)
- `featured` - Featured flag (optional, boolean or string)

**Images:**
- `image` - Primary image (required)
- `ogImage` - Open Graph image (optional, falls back to `image`)
- `imageAlt` - Primary image alt text (optional)
- `ogImageAlt` - Open Graph image alt text (optional)

**URLs:**
- `canonical` - Canonical URL (optional, overrides generated URL)

**Affiliate:**
- `affiliateLinks` - Affiliate links array (optional)

**Metadata:**
- `readTime` - Reading time (optional, calculated if not provided)

### 5.2 Frontmatter Requirements

#### SEO Fields

**Title Fields:**
- `title` (required) - Main title, used in H1 and as fallback for `<title>` tag
- `metaTitle` (optional) - SEO-optimized title, used in `<title>` tag if provided

**Description Fields:**
- `description` (required) - Brief description, used as fallback for meta description
- `metaDescription` (optional) - SEO-optimized description, used in meta description tag if provided

**Keywords:**
- `keywords` (optional) - SEO keywords, can be array or comma-separated string

**Best Practices:**
- `metaTitle` should be 50-60 characters
- `metaDescription` should be 140-160 characters
- Include primary keyword in `metaTitle`
- Include call-to-action in `metaDescription`

#### Image Fields

**Primary Image:**
- `image` (required) - Path to primary image
- `imageAlt` (optional) - Alt text for primary image

**Open Graph Image:**
- `ogImage` (optional) - Path to Open Graph image (falls back to `image`)
- `ogImageAlt` (optional) - Alt text for Open Graph image

**Best Practices:**
- Use WebP format for images (`.webp`)
- Store images in `/images/blog/post-slug/` directory
- Provide descriptive alt text for accessibility
- Ensure images are optimized (compressed, appropriate size)

#### Status Fields

**Draft Status:**
- `draft` (optional) - Boolean or string, `true`/`'true'` means draft
- `status` (optional) - String, `'draft'` or `'archived'` means draft

**Draft Filtering Logic:**
Posts are considered drafts if ANY of these conditions are true:
- `draft === true` (boolean)
- `draft === 'true'` (string)
- `status === 'draft'`
- `status === 'archived'`

**Best Practices:**
- Set `draft: false` when publishing
- Use `draft: true` for work-in-progress posts
- Use `status: 'archived'` for old posts that should be hidden

#### Canonical URL Field

**`canonical` (optional)**
- **Purpose:** Explicit canonical URL override
- **Format:** Full URL with HTTPS and trailing slash
- **Example:** `"https://bright-gift.com/blog/post-slug/"`

**When to Use:**
- When consolidating duplicate content
- When redirecting old URLs to new canonical URLs
- When canonical URL needs to differ from generated URL

**Best Practice:**
- Only use when necessary
- Let system generate canonical URLs automatically for consistency
- Ensure canonical URL matches sitemap URL

#### All Other Fields

**Content Organization:**
- `tags` - Array of content tags
- `category` - Content category
- `author` - Author name

**Affiliate:**
- `affiliateLinks` - Array of affiliate link objects

**Metadata:**
- `readTime` - Estimated reading time (calculated if not provided)
- `featured` - Featured post flag

**Social:**
- `twitterCard` - Twitter card type

### 5.3 Content Collection System

#### How Astro Discovers Posts

**Discovery Process:**
1. Astro reads `src/content/blog/` directory
2. Processes all `.md` files in the directory
3. Parses frontmatter using Zod schema (`src/content/config.ts`)
4. Validates frontmatter against schema
5. Makes posts available via `getCollection('blog')` function

**File Structure:**
```
src/content/blog/
  ├── post-slug-1.md
  ├── post-slug-2.md
  ├── draft-post.md
  └── ...
```

**Collection Definition:**
```typescript
export const collections = { blog, 'gift-guides': giftGuides, faqs };
```

#### Draft Filtering Logic

**In Routing (`src/pages/blog/[...slug].astro`):**
```javascript
const blogPosts = await getCollection('blog', ({ data }) => isPreview || !data.draft);
```

**In Sitemap Generation (`scripts/generate-sitemap.js`):**
```javascript
const isDraft = data.draft === true || data.draft === 'true' || 
               data.status === 'draft' || data.status === 'archived';
if (isDraft) {
  continue; // Skip this post
}
```

**Consistency:**
- Both routing and sitemap generation use the same draft filtering logic
- Ensures sitemap only includes posts that are actually accessible
- Prevents sitemap from including URLs that return 404

#### Date Handling

**Date Format:**
- Input: String (`"2025-12-02"`) or Date object (`2025-12-02T00:00:00.000Z`)
- Output: String in YYYY-MM-DD format

**Transformation:**
```typescript
date: z.union([z.string(), z.date()]).transform((val) => {
  if (val instanceof Date) {
    return val.toISOString().split('T')[0]; // Convert to YYYY-MM-DD string
  }
  return val;
})
```

**Usage:**
- Sitemap generation uses date for `lastmod` field
- Blog post sorting uses date (newest first)
- Structured data uses date for `datePublished` and `dateModified`

**Best Practices:**
- Use YYYY-MM-DD format in frontmatter
- Use consistent date format across all posts
- Update `dateModified` if post is significantly updated

---

## 6. Build Process & Validation

### 6.1 Pre-build Scripts (`package.json`)

**Location:** `package.json` → `scripts.prebuild`  
**Purpose:** Scripts that run automatically before the build process

#### Sitemap Generation

**Script:** `npm run generate:sitemap`  
**Command:** `"prebuild": "npm run generate:sitemap || true"`  
**Purpose:** Generates sitemap before build

**Execution:**
- Runs automatically before every `npm run build`
- Runs before Cloudflare Pages deployment
- Uses `|| true` to prevent build failures if sitemap generation fails

**Output:** `public/sitemap.xml`

#### YAML Validation

**Script:** `npm run validate:yaml`  
**Command:** `"validate:yaml": "node scripts/validate-yaml.js"`  
**Purpose:** Validates YAML frontmatter in blog posts

**What It Checks:**
- YAML syntax errors
- Frontmatter format
- Required fields presence
- Field type validation

#### Image Validation

**Script:** `npm run validate:images` (via `prebuild:enhanced`)  
**Command:** `node scripts/validate-images.js`  
**Purpose:** Validates image references in blog posts

**What It Checks:**
- Image file existence
- Image path validity
- Image format (prefers WebP)
- Image alt text presence

#### Link Validation

**Script:** `npm run validate:links`  
**Command:** `"validate:links": "node scripts/validate-links.js"`  
**Purpose:** Validates internal and external links

**What It Checks:**
- Internal link validity
- External link accessibility
- Broken link detection
- Redirect chain validation

#### Category Validation

**Script:** `npm run validate:categories`  
**Command:** `"validate:categories": "node scripts/validate-categories.js"`  
**Purpose:** Validates category assignments

**What It Checks:**
- Category field values
- Category consistency
- Valid category names

#### Schema Validation

**Script:** `npm run validate:schema`  
**Command:** `"validate:schema": "node scripts/validate-schema.js"`  
**Purpose:** Validates frontmatter against Zod schema

**What It Checks:**
- Required fields presence
- Field type validation
- Field value constraints
- Schema compliance

#### Enhanced Pre-build

**Script:** `npm run prebuild:enhanced`  
**Command:** Includes all validation scripts plus sitemap generation

**Execution Order:**
1. SEO validation
2. Image validation
3. Link validation
4. Category validation
5. Schema validation
6. YAML validation
7. Sitemap generation

### 6.2 Build Process (Astro Build)

**Command:** `npm run build`  
**Purpose:** Builds the site for production deployment

#### Output Directory

**Location:** `dist/`  
**Contents:**
- Rendered HTML pages
- Static assets (images, CSS, JS)
- Sitemap and robots.txt
- Cloudflare Workers files

#### Static vs SSR Handling

**Static Pages:**
- Pages with `export const prerender = true`
- Pre-rendered at build time
- Served as static files

**SSR Pages:**
- Pages without `prerender = true`
- Rendered on-demand by Cloudflare Workers
- Dynamic content handling

**Blog Posts:**
- All blog posts use `prerender = true`
- Pre-rendered at build time
- Static HTML files generated

#### Redirect Processing

**During Build:**
1. Astro processes `public/_redirects` file
2. Redirect rules are included in build output
3. Cloudflare Pages processes redirects at request time

**Redirect Priority:**
1. `public/_redirects` rules (processed first)
2. Astro middleware redirects
3. Astro trailing-slash redirects
4. Cloudflare Pages default behavior

### 6.3 Post-build Scripts

**Location:** `package.json` → `scripts.postbuild`  
**Command:** `"postbuild": "npm run fix:preview && npm run enhance:preview"`

#### Preview Fixes

**Script:** `npm run fix:preview`  
**Command:** `"fix:preview": "node scripts/preview-fixer.js"`  
**Purpose:** Fixes issues in preview builds

**What It Does:**
- Fixes preview-specific issues
- Adjusts paths for preview environment
- Handles preview URL generation

#### Enhancement Scripts

**Script:** `npm run enhance:preview`  
**Command:** `"enhance:preview": "node scripts/preview-enhancer.js"`  
**Purpose:** Enhances preview builds

**What It Does:**
- Adds preview-specific enhancements
- Optimizes preview performance
- Improves preview functionality

### 6.4 SEO Validation Scripts (`scripts/seo-validation/`)

**Location:** `scripts/seo-validation/`  
**Purpose:** Comprehensive SEO validation before deployment

#### Content Validation

**Script:** `npm run seo:validate:content`  
**File:** `scripts/seo-validation/validate-content.js`  
**Purpose:** Validates all blog content against SEO standards

**What It Checks:**
- Required SEO fields (title, metaTitle, metaDescription, keywords)
- Image fields (image, ogImage, imageAlt, ogImageAlt)
- Canonical URL presence and format
- Draft status consistency
- Frontmatter completeness
- Content quality metrics

**Output:**
- Error list with file locations
- Warning list for non-critical issues
- Summary statistics

#### Template Validation

**Script:** `npm run seo:validate:templates`  
**File:** `scripts/seo-validation/validate-templates.js`  
**Purpose:** Validates Astro templates for SEO issues

**What It Checks:**
- Canonical tag presence
- Meta tag completeness
- Structured data validity
- Image references
- Link attributes
- Template SEO best practices

**Output:**
- Error list with file and line numbers
- Warning list for potential issues
- Summary statistics

#### Complete SEO Validation

**Script:** `npm run seo:validate`  
**File:** `scripts/seo-validation/validate-all.js`  
**Purpose:** Runs all SEO validation checks

**Execution:**
1. Content validation
2. Template validation
3. Critical issue checks (imageJpg references, fake structured data, JavaScript redirects)

**Output:**
- Overall validation report
- Pass/fail status
- Detailed error and warning lists
- JSON report saved to `_workflow-documents/reports/seo-validation-overall-report.json`

#### How to Run Validation

**Before Deployment:**
```bash
npm run seo:validate
```

**Individual Checks:**
```bash
npm run seo:validate:content
npm run seo:validate:templates
```

**With Build:**
```bash
npm run seo:check  # Runs validation + build
```

**Pre-deployment:**
```bash
npm run predeploy  # Runs seo:check
```

#### What Gets Checked

**Content Checks:**
- All required SEO fields present
- Meta title and description length
- Keywords format and content
- Image paths and alt text
- Canonical URL format
- Draft status consistency

**Template Checks:**
- Canonical tag generation
- Meta tag completeness
- Structured data validity
- Image tag attributes
- Link attributes (target, rel)
- No deprecated SEO practices

**Critical Issue Checks:**
- No `imageJpg` references (causes 404 errors)
- No fake structured data ratings
- No JavaScript redirects (except OAuth)

---

## 7. Google Search Console Integration

### 7.1 GSC Monitoring Procedures

#### Weekly Checks

**What to Monitor:**
1. **Page Indexing Status**
   - Check "Page indexing" → "Why pages aren't indexed"
   - Review new issues (Crawled - currently not indexed, Redirect error, Page with redirect)
   - Count of affected URLs

2. **Coverage Issues**
   - Check for new 404 errors
   - Check for new redirect errors
   - Check for new "Page with redirect" issues

3. **Sitemap Status**
   - Verify sitemap was read recently
   - Check for sitemap errors
   - Verify all URLs were discovered

4. **Performance Metrics**
   - Monitor impressions and clicks
   - Check average position changes
   - Review CTR trends

**Weekly Checklist:**
- [ ] Review "Page indexing" issues
- [ ] Check sitemap read date
- [ ] Review performance metrics
- [ ] Check for new coverage errors
- [ ] Monitor redirect validation status

#### Monthly Audits

**Comprehensive Review:**
1. **Full Coverage Audit**
   - Review all indexing issues
   - Analyze trends over the month
   - Identify recurring problems

2. **Sitemap Verification**
   - Verify sitemap includes all published posts
   - Check for missing URLs
   - Verify URL format consistency

3. **Redirect Audit**
   - Test critical redirects
   - Verify no 308 redirects
   - Check redirect chain integrity

4. **Performance Analysis**
   - Review top-performing pages
   - Identify underperforming pages
   - Analyze keyword rankings

**Monthly Checklist:**
- [ ] Full coverage audit
- [ ] Sitemap completeness check
- [ ] Redirect chain validation
- [ ] Performance analysis
- [ ] Keyword ranking review

#### What to Monitor

**Critical Metrics:**
- **Indexing Status:** Number of indexed vs. non-indexed pages
- **Coverage Errors:** 404s, redirect errors, server errors
- **Sitemap Health:** Last read date, discovered URLs, errors
- **Performance:** Impressions, clicks, CTR, average position

**Warning Signs:**
- Sudden increase in non-indexed pages
- New redirect errors appearing
- Sitemap not being read
- Drop in impressions or clicks

### 7.2 Common GSC Issues

#### "Crawled - Currently Not Indexed"

**What It Means:**
- Google crawled the page but chose not to index it
- Page is accessible but not appearing in search results

**Common Causes:**
1. **Canonical URL Issues**
   - Canonical tag points to different URL
   - Canonical URL doesn't match sitemap URL
   - Multiple canonical tags

2. **Redirect Issues**
   - 308 redirects (should be 301)
   - Redirect loops
   - Multiple redirect hops

3. **Content Issues**
   - Duplicate content
   - Thin content
   - Low-quality content

4. **Technical Issues**
   - Server errors during crawl
   - Slow page load times
   - Blocked by robots.txt

**Troubleshooting Steps:**
1. Check canonical tag matches sitemap URL
2. Test redirect with curl (verify 301, not 308)
3. Verify redirect chain is single-hop
4. Check page content quality
5. Use URL Inspection tool to see Google's view

**Fix Procedures:**
1. Fix canonical URL if incorrect
2. Fix redirect issues (ensure 301, single-hop)
3. Improve content quality if needed
4. Request new validation in GSC
5. Monitor validation results

#### "Redirect Error"

**What It Means:**
- Google encountered an error following redirects
- Redirect chain is broken or problematic

**Common Causes:**
1. **Redirect Loops**
   - URL redirects to itself
   - Circular redirect chain

2. **Multiple Redirect Hops**
   - Too many redirects in chain
   - Redirect chain exceeds limit

3. **Invalid Redirect Status**
   - 308 redirects (should be 301)
   - Temporary redirects (302) for permanent moves

4. **Broken Redirects**
   - Redirect destination doesn't exist
   - Redirect destination returns error

**Troubleshooting Steps:**
1. Test redirect chain with curl
2. Verify single-hop redirects (301 → 200)
3. Check for redirect loops
4. Verify no 308 redirects
5. Check redirect destination exists

**Fix Procedures:**
1. Fix redirect rules in `public/_redirects`
2. Ensure all redirects use 301 status
3. Fix redirect loops
4. Verify redirect destinations exist
5. Request new validation in GSC

#### "Page with Redirect"

**What It Means:**
- Page redirects to another URL
- Google sees this as a redirect, not a final page

**Common Causes:**
1. **308 Redirects**
   - Astro's trailing-slash redirects using 308
   - Not overridden by explicit 301 rules

2. **Multiple Redirect Hops**
   - Redirect chain has multiple steps
   - Not a direct redirect

3. **Redirect Validation Issues**
   - GSC validation failed
   - Redirect not properly configured

**Troubleshooting Steps:**
1. Test redirect with curl (check for 308)
2. Verify explicit 301 rules in `public/_redirects`
3. Check redirect chain (should be single-hop)
4. Verify Astro config `trailingSlash: 'always'` behavior

**Fix Procedures:**
1. Add explicit 301 redirects in `public/_redirects`
2. Ensure redirects override Astro's 308 behavior
3. Test redirects after fixes
4. Request new validation in GSC
5. Monitor validation results

### 7.3 Validation Procedures

#### How to Start New Validations

**In Google Search Console:**
1. Navigate to "Page indexing" → Select issue type
2. Click on specific issue bucket (e.g., "Redirect error")
3. Click "START NEW VALIDATION" button
4. Wait for validation to complete (24-48 hours)

**What Gets Validated:**
- All URLs in the issue bucket
- Redirect chains
- Canonical URLs
- Indexing eligibility

**Validation Timeline:**
- Initial check: Within hours
- Full validation: 24-48 hours
- Results available in GSC

#### When to Request Indexing

**Request Indexing For:**
- New blog posts (after publishing)
- Updated pages (after significant changes)
- Fixed pages (after resolving issues)
- Pages not appearing in search results

**How to Request:**
1. Use URL Inspection tool
2. Enter page URL
3. Click "Request indexing"
4. Wait for indexing (usually within hours)

**When NOT to Request:**
- Pages that are drafts
- Pages with `noindex` tags
- Pages that redirect
- Pages with errors

#### Sitemap Submission

**Initial Submission:**
1. Go to Google Search Console
2. Navigate to "Sitemaps" section
3. Enter: `https://bright-gift.com/sitemap.xml`
4. Click "Submit"

**After Updates:**
- GSC automatically re-crawls sitemap periodically
- No need to resubmit after every change
- Resubmit if sitemap structure changes significantly

**Verification:**
- Check "Last read" date in GSC
- Verify all URLs were discovered
- Monitor for sitemap errors

### 7.4 URL Inspection Tool Usage

#### How to Use It

**Access:**
1. Go to Google Search Console
2. Use search bar at top: Enter URL and press Enter
3. Or navigate to "URL Inspection" tool directly

**What It Shows:**
- Current indexing status
- Last crawl date
- Canonical URL
- Mobile usability
- Rich results eligibility

#### What to Check

**Indexing Status:**
- "Page is on Google" or "Page is not on Google"
- If not indexed, reason why

**Canonical URL:**
- Verify canonical URL matches expected URL
- Check for canonical URL issues

**Last Crawl:**
- When Google last crawled the page
- If crawl is old, request new indexing

**Coverage:**
- Any coverage issues
- Redirect status
- Server response

#### When to Use It

**Use URL Inspection For:**
- Checking new blog posts after publishing
- Troubleshooting indexing issues
- Verifying canonical URLs
- Requesting indexing for specific pages
- Checking Google's view of a page

**Don't Use For:**
- Bulk URL checking (use coverage reports instead)
- Checking draft pages
- Pages that shouldn't be indexed

---

## 8. Manual QA & Verification Procedures

### 8.1 Post-Deployment Verification Checklist

After deploying SEO-related changes (especially redirect fixes), perform these verification steps:

#### HTTP Status Code Checks

**Test Critical Redirects:**
```bash
# Test contact page redirect
curl -I "https://bright-gift.com/contact"
# Expected: HTTP/2 301
# Location: /contact/

# Test category page redirect
curl -I "https://bright-gift.com/category/gift-guides"
# Expected: HTTP/2 301
# Location: /category/gift-guides/

# Test blog index redirect
curl -I "https://bright-gift.com/blog"
# Expected: HTTP/2 301
# Location: /blog/

# Test blog post redirect
curl -I "https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties"
# Expected: HTTP/2 301
# Location: /blog/fun-gifts-for-kids-birthday-parties/
```

**Verify Final URLs Return 200:**
```bash
# Test trailing-slash URLs (should be 200, no redirect)
curl -I "https://bright-gift.com/contact/"
# Expected: HTTP/2 200

curl -I "https://bright-gift.com/category/gift-guides/"
# Expected: HTTP/2 200

curl -I "https://bright-gift.com/blog/"
# Expected: HTTP/2 200

curl -I "https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/"
# Expected: HTTP/2 200
```

#### Redirect Chain Validation

**Verify Single-Hop Redirects:**
```bash
# Follow redirects and count hops
curl -I -L --max-redirs 3 "https://bright-gift.com/contact" 2>&1 | grep -E "HTTP|location:" | head -5
# Should show: 301 → 200 (only 2 HTTP responses)

curl -I -L --max-redirs 3 "https://bright-gift.com/category/gift-guides" 2>&1 | grep -E "HTTP|location:" | head -5
# Should show: 301 → 200 (only 2 HTTP responses)
```

**Check for Redirect Loops:**
- If you see more than 2 HTTP responses (301 → 301 → 200), there's a redirect loop
- If you see 308 status codes, the `_redirects` file rules may not be taking precedence

#### Canonical Tag Verification

**Extract Canonical Tags:**
```bash
# Check canonical tag on blog post
curl -s "https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/" | grep -i "canonical\|rel=\"canonical\"" | head -3
# Expected: <link rel="canonical" href="https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/">

# Check canonical tag on blog index
curl -s "https://bright-gift.com/blog/" | grep -i "canonical\|rel=\"canonical\"" | head -3
# Expected: <link rel="canonical" href="https://bright-gift.com/blog/">
```

**Verify Canonical URL Format:**
- Must start with `https://bright-gift.com`
- Must have trailing slash (except root `/`)
- Must match the sitemap URL exactly

#### Sitemap Completeness Check

**Verify Sitemap Includes All Published Posts:**
```bash
# Count blog posts in sitemap
curl -s "https://bright-gift.com/sitemap.xml" | grep -c "/blog/"
# Should match number of published blog posts

# Verify specific post is in sitemap
curl -s "https://bright-gift.com/sitemap.xml" | grep "post-slug"
# Should return the sitemap entry
```

**Check Sitemap Format:**
- All URLs should have trailing slashes
- All URLs should use `https://bright-gift.com` domain
- `lastmod` dates should be accurate
- No duplicate URLs

### 8.2 Specific Test Commands

#### curl Commands for Redirect Testing

**Basic Redirect Test:**
```bash
curl -I "https://bright-gift.com/url"
```

**Follow Redirect Chain:**
```bash
curl -I -L --max-redirs 3 "https://bright-gift.com/url" 2>&1 | grep -E "HTTP|location:"
```

**Check for 308 Redirects:**
```bash
curl -I "https://bright-gift.com/url" | grep "308"
# Expected: No output (no 308 redirects)
```

#### Canonical Tag Extraction

**Extract Canonical Tag:**
```bash
curl -s "https://bright-gift.com/url/" | grep -i "canonical\|rel=\"canonical\""
```

**Verify Canonical Format:**
```bash
curl -s "https://bright-gift.com/url/" | grep -oP 'href="\K[^"]*' | grep canonical
```

#### Sitemap Validation

**Count URLs in Sitemap:**
```bash
curl -s "https://bright-gift.com/sitemap.xml" | grep -c "<url>"
```

**Check Specific URL in Sitemap:**
```bash
curl -s "https://bright-gift.com/sitemap.xml" | grep "url-slug"
```

**Validate Sitemap Format:**
```bash
curl -s "https://bright-gift.com/sitemap.xml" | xmllint --format -
```

### 8.3 GSC Verification Steps

#### URL Inspection Tool Usage

**Steps:**
1. Go to Google Search Console
2. Use URL Inspection tool
3. Enter page URL
4. Check "Page is on Google" status
5. Verify canonical URL shown
6. Request indexing if needed

#### Validation Request Procedures

**For Redirect Issues:**
1. Navigate to "Page indexing" → "Redirect error"
2. Click "START NEW VALIDATION"
3. Monitor validation status over 24-48 hours

**For Indexing Issues:**
1. Navigate to "Page indexing" → "Crawled - currently not indexed"
2. Click "START NEW VALIDATION"
3. Monitor validation results

#### Monitoring Timelines

**Immediate (0-24 hours):**
- Verify HTTP status codes with curl
- Check canonical tags
- Verify sitemap completeness
- Request GSC URL inspection

**Short-term (24-48 hours):**
- Monitor GSC validation results
- Check for new indexing issues
- Verify redirect chains are clean

**Medium-term (1-2 weeks):**
- Monitor GSC for validation pass/fail
- Check indexing status of previously problematic URLs
- Review crawl efficiency metrics

---

## 9. Maintenance & Monitoring

### 9.1 Daily Tasks

**Currently:** No daily tasks required

**Future Considerations:**
- Monitor critical redirects if issues arise
- Check for urgent GSC alerts
- Review deployment notifications

### 9.2 Weekly Tasks

#### GSC Monitoring

**Tasks:**
1. Review "Page indexing" issues
2. Check sitemap read date
3. Review performance metrics
4. Check for new coverage errors
5. Monitor redirect validation status

**Time Estimate:** 15-30 minutes

#### Redirect Consistency Checks

**Tasks:**
1. Test critical redirects with curl
2. Verify no 308 redirects appearing
3. Check redirect chain integrity
4. Review redirect rules in `public/_redirects`

**Time Estimate:** 10-15 minutes

### 9.3 Monthly Tasks

#### Full SEO Audit

**Tasks:**
1. Comprehensive GSC coverage review
2. Sitemap completeness verification
3. Redirect audit (all redirects)
4. Canonical URL verification
5. Performance analysis
6. Keyword ranking review

**Time Estimate:** 1-2 hours

#### Sitemap Verification

**Tasks:**
1. Verify sitemap includes all published posts
2. Check for missing URLs
3. Verify URL format consistency
4. Check sitemap in GSC

**Time Estimate:** 15-30 minutes

#### Redirect Audit

**Tasks:**
1. Review all redirect rules in `public/_redirects`
2. Test redirect chains
3. Verify no 308 redirects
4. Check for redirect loops
5. Verify redirect destinations exist

**Time Estimate:** 30-45 minutes

### 9.4 Quarterly Tasks

#### Comprehensive Review

**Tasks:**
1. Review all SEO systems
2. Analyze performance trends
3. Review historical issues
4. Update documentation
5. Strategy adjustments

**Time Estimate:** 2-4 hours

#### Strategy Updates

**Tasks:**
1. Review SEO strategy effectiveness
2. Identify improvement opportunities
3. Update processes based on learnings
4. Plan future optimizations

**Time Estimate:** 1-2 hours

---

## 10. Troubleshooting Guide

### 10.1 Common Issues and Solutions

#### 308 Redirects Appearing

**Symptoms:**
- curl shows `HTTP/2 308` status code
- GSC shows "Page with redirect" issues
- Redirect validation fails

**Causes:**
1. Astro's `trailingSlash: 'always'` using 308 by default
2. Explicit 301 rules in `public/_redirects` not taking precedence
3. Cloudflare Pages processing order issue

**Solutions:**
1. Add explicit 301 redirects in `public/_redirects`
2. Verify `public/_redirects` rules are processed before Astro
3. Test redirects after fixes
4. Clear Cloudflare cache if needed

**Verification:**
```bash
curl -I "https://bright-gift.com/url" | grep "308"
# Expected: No output (no 308 redirects)
```

**Status (Dec 2025):** ✅ Resolved - All redirects now return 301 status codes. See `redirect-diagnostic-summary-2025-12-09.md` for details.

#### Missing Redirect Rules

**Symptoms:**
- Published blog post not redirecting
- GSC shows "Crawled - currently not indexed" for new posts
- Verification script reports missing redirects

**Causes:**
1. New blog post published without adding redirect rule
2. Redirect rule typo or incorrect format
3. Redirect rule added to wrong section of `_redirects` file

**Solutions:**
1. Run `npm run verify:redirects` before deployment
2. Add redirect rule: `/blog/post-slug /blog/post-slug/ 301`
3. Verify rule is in correct section (blog posts section)
4. Test redirect after adding: `curl -I "https://bright-gift.com/blog/post-slug"`

**Prevention:**
- Always run `npm run verify:redirects` before deploying
- Add redirect rule immediately after publishing new post
- Use verification script in CI/CD pipeline

**Status (Dec 2025):** ✅ Resolved - All 51 published posts now have redirect rules. See `redirect-diagnostic-summary-2025-12-09.md` for details.

#### Sitemap Missing Posts

**Symptoms:**
- Sitemap doesn't include all published posts
- GSC shows fewer URLs than expected
- Some posts not discoverable

**Causes:**
1. Draft filtering logic excluding published posts
2. Sitemap generation script errors
3. YAML parsing errors in blog posts

**Solutions:**
1. Check draft status in blog post frontmatter
2. Run `npm run generate:sitemap` manually
3. Check for YAML parsing errors
4. Verify draft filtering logic matches routing

**Verification:**
```bash
# Count published posts
find src/content/blog -name "*.md" -exec grep -L "draft: true" {} \; | wc -l

# Count sitemap URLs
curl -s "https://bright-gift.com/sitemap.xml" | grep -c "/blog/"
```

#### Canonical URL Issues

**Symptoms:**
- Canonical URL doesn't match sitemap URL
- Canonical URL missing trailing slash
- Canonical URL uses HTTP instead of HTTPS

**Causes:**
1. Canonical URL generation logic issues
2. Explicit canonical field in frontmatter incorrect
3. Template canonical URL generation bug

**Solutions:**
1. Check `src/layouts/Layout.astro` canonical URL generation
2. Verify frontmatter `canonical` field format
3. Ensure canonical URLs have trailing slashes
4. Verify canonical URLs use HTTPS

**Verification:**
```bash
curl -s "https://bright-gift.com/url/" | grep -i "canonical"
# Check format: https://bright-gift.com/url/
```

#### GSC Validation Failures

**Symptoms:**
- GSC shows validation failed
- Redirect errors persist
- Indexing issues not resolved

**Causes:**
1. Fixes not deployed
2. GSC validation timing
3. Redirect issues not fully resolved
4. Canonical URL issues

**Solutions:**
1. Verify fixes are deployed
2. Request new validation in GSC
3. Wait 24-48 hours for validation
4. Re-check redirects and canonical URLs

**Verification:**
1. Test redirects with curl
2. Check canonical tags
3. Use GSC URL Inspection tool
4. Request new validation

### 10.2 Diagnostic Procedures

#### Step-by-Step Troubleshooting

**For Redirect Issues:**
1. Test redirect with curl: `curl -I "https://bright-gift.com/url"`
2. Check HTTP status code (should be 301, not 308)
3. Verify redirect destination exists
4. Check `public/_redirects` file for rule
5. Verify Astro config `trailingSlash` setting
6. Test redirect chain: `curl -I -L --max-redirs 3 "https://bright-gift.com/url"`
7. Fix issues and redeploy
8. Request new GSC validation

**For Indexing Issues:**
1. Use GSC URL Inspection tool
2. Check "Page is on Google" status
3. Verify canonical URL
4. Test redirects
5. Check page content quality
6. Verify no `noindex` tags
7. Request indexing if needed

**For Sitemap Issues:**
1. Check sitemap file: `curl -s "https://bright-gift.com/sitemap.xml"`
2. Count URLs in sitemap
3. Compare with published blog posts
4. Check for YAML parsing errors
5. Run sitemap generation manually: `npm run generate:sitemap`
6. Verify sitemap in GSC

#### Tools and Commands

**Essential Tools:**
- `curl` - HTTP testing
- Google Search Console - GSC monitoring
- Browser Developer Tools - HTML inspection
- Terminal - Command execution

**Essential Commands:**
```bash
# Test redirect
curl -I "https://bright-gift.com/url"

# Follow redirect chain
curl -I -L --max-redirs 3 "https://bright-gift.com/url"

# Extract canonical tag
curl -s "https://bright-gift.com/url/" | grep -i "canonical"

# Count sitemap URLs
curl -s "https://bright-gift.com/sitemap.xml" | grep -c "<url>"

# Generate sitemap
npm run generate:sitemap
```

#### When to Check What

**After Deployment:**
- Check redirects immediately
- Verify canonical tags
- Check sitemap completeness
- Request GSC URL inspection

**Weekly:**
- Review GSC issues
- Check sitemap read date
- Monitor performance metrics

**Monthly:**
- Full SEO audit
- Comprehensive redirect check
- Performance analysis

**When Issues Arise:**
- Test immediately with curl
- Check GSC for details
- Use URL Inspection tool
- Review recent changes

### 10.3 Escalation Procedures

#### When to Investigate Deeper

**Escalate If:**
- Multiple redirect issues persist after fixes
- GSC validation continues to fail
- Sitemap generation errors
- Canonical URL issues across multiple pages
- Performance degradation

**Investigation Steps:**
1. Review recent code changes
2. Check deployment logs
3. Review GSC historical data
4. Test with multiple tools
5. Consult this guide's troubleshooting section

#### What Documentation to Reference

**For Redirect Issues:**
- Section 2: Redirect System Architecture
- Section 10.1: Common Issues - 308 Redirects
- `public/_redirects` file
- `astro.config.mjs` file

**For Sitemap Issues:**
- Section 3: Sitemap Generation System
- Section 10.1: Common Issues - Sitemap Missing Posts
- `scripts/generate-sitemap.js` file

**For Canonical URL Issues:**
- Section 4: Canonical URL System
- Section 10.1: Common Issues - Canonical URL Issues
- `src/layouts/Layout.astro` file
- `src/pages/blog/[...slug].astro` file

**For GSC Issues:**
- Section 7: Google Search Console Integration
- Section 8: Manual QA & Verification Procedures
- Section 10.1: Common Issues - GSC Validation Failures

---

## 11. Historical Context & Lessons Learned

### 11.1 Key Decisions Made

#### Why Trailing Slashes Always

**Decision:** All URLs (except root) must have trailing slashes.

**Reasoning:**
1. **Consistency:** Ensures consistent URL format across entire system
2. **SEO:** Prevents duplicate content issues
3. **Canonical URLs:** Matches canonical URL format
4. **Sitemap:** Matches sitemap URL format
5. **Redirects:** Matches redirect destination URLs

**Implementation:**
- Astro config: `trailingSlash: 'always'`
- Sitemap generation: All URLs have trailing slashes
- Canonical URL generation: All URLs have trailing slashes
- Redirect rules: All destinations have trailing slashes

**Result:** Consistent URL format prevents duplicate content and SEO issues.

#### Why 301 Over 308

**Decision:** Always use 301 (Permanent Redirect) status codes, never 308.

**Reasoning:**
1. **SEO Value Transfer:** 301 redirects properly transfer link equity
2. **GSC Validation:** Google Search Console validates 301 redirects correctly
3. **Search Engine Compatibility:** All major search engines handle 301 consistently
4. **Historical Issues:** BrightGift previously experienced GSC validation failures with 308 redirects

**Implementation:**
- Explicit 301 rules in `public/_redirects` file
- Override Astro's default 308 behavior
- Test all redirects to verify 301 status

**Result:** GSC validation passes and SEO value transfers properly.

#### Why Explicit Redirects in `_redirects`

**Decision:** Use explicit redirect rules in `public/_redirects` file for all redirects.

**Reasoning:**
1. **Control:** Explicit control over redirect behavior
2. **Priority:** `_redirects` rules processed before Astro's redirects
3. **Override:** Can override Astro's default 308 behavior
4. **Documentation:** Clear documentation of all redirects
5. **Testing:** Easy to test and verify redirects

**Implementation:**
- All blog posts have explicit redirects in `_redirects`
- All category pages have explicit redirects
- All static pages have explicit redirects

**Result:** Predictable redirect behavior and GSC validation success.

### 11.2 Past Issues Resolved

#### Redirect Loop Problems

**Issue:** Redirect loops causing infinite redirects.

**Root Cause:** Conflicting redirect rules or circular redirect chains.

**Solution:**
- Review all redirect rules for conflicts
- Ensure single-hop redirects (301 → 200)
- Test redirect chains with curl
- Fix circular redirects

**Prevention:**
- Test all redirects before deployment
- Use curl to verify redirect chains
- Document all redirect rules

#### 308 vs 301 Confusion

**Issue:** 308 redirects causing GSC validation failures.

**Root Cause:** Astro's `trailingSlash: 'always'` using 308 by default.

**Solution:**
- Add explicit 301 redirects in `public/_redirects`
- Ensure `_redirects` rules processed before Astro
- Test redirects to verify 301 status

**Prevention:**
- Always use explicit 301 redirects
- Test redirects after changes
- Monitor GSC for validation issues

#### Sitemap Generation Issues

**Issue:** Sitemap missing published posts or including drafts.

**Root Cause:** Draft filtering logic not matching routing logic.

**Solution:**
- Align draft filtering in sitemap generation with routing
- Check both `draft` and `status` fields
- Verify draft filtering logic consistency

**Prevention:**
- Keep draft filtering logic consistent
- Test sitemap generation after changes
- Verify sitemap includes all published posts

### 11.3 Evolution of the System

#### Configuration Changes Over Time

**Initial Setup:**
- Basic Astro configuration
- No explicit redirect rules
- Default trailing-slash behavior

**First Optimization:**
- Added explicit redirect rules for blog posts
- Implemented sitemap generation
- Added canonical URL generation

**308 Redirect Fix:**
- Added explicit 301 redirects in `_redirects`
- Removed blog/category from Astro routes exclude
- Ensured `_redirects` processed before Astro

**Current State:**
- Comprehensive redirect system
- Automated sitemap generation
- Consistent canonical URLs
- GSC validation passing

#### What Worked, What Didn't

**What Worked:**
- Explicit 301 redirects in `_redirects` file
- Consistent trailing-slash URLs
- Automated sitemap generation
- Comprehensive SEO validation scripts

**What Didn't Work:**
- Relying on Astro's default 308 redirects
- Inconsistent URL formats
- Manual sitemap updates
- No SEO validation

**Lessons Learned:**
- Explicit over implicit for redirects
- Consistency is critical for SEO
- Automation reduces errors
- Validation prevents issues

---

## 12. File Reference

### 12.1 Complete File Inventory

#### All SEO-Related Files

**Configuration Files:**
- `astro.config.mjs` - Astro configuration (trailing slashes, Cloudflare adapter)
- `package.json` - Build scripts and validation scripts
- `public/_redirects` - Redirect rules (301 redirects)
- `src/middleware.ts` - Middleware skip logic

**Content Files:**
- `src/content/config.ts` - Content schema (Zod validation)
- `src/content/blog/*.md` - Blog post markdown files

**Template Files:**
- `src/layouts/Layout.astro` - Base layout (canonical URL generation)
- `src/pages/blog/[...slug].astro` - Blog post template (canonical URLs)

**Script Files:**
- `scripts/generate-sitemap.js` - Sitemap generation
- `scripts/seo-validation/validate-all.js` - Complete SEO validation
- `scripts/seo-validation/validate-content.js` - Content validation
- `scripts/seo-validation/validate-templates.js` - Template validation

**Output Files:**
- `public/sitemap.xml` - Generated sitemap
- `dist/` - Build output directory

### 12.2 Purpose of Each File

#### Configuration Files

**`astro.config.mjs`:**
- Defines Astro configuration
- Sets `trailingSlash: 'always'`
- Configures Cloudflare adapter
- Excludes static files from Workers processing

**`package.json`:**
- Defines build scripts
- Pre-build scripts (sitemap generation)
- Validation scripts
- Post-build scripts

**`public/_redirects`:**
- Cloudflare Pages redirect configuration
- Explicit 301 redirect rules
- Processed before Astro routing

**`src/middleware.ts`:**
- Custom middleware logic
- Skips redirect processing for specific paths
- Prevents unnecessary redirects

#### Script Files

**`scripts/generate-sitemap.js`:**
- Generates XML sitemap
- Filters draft posts
- Includes static pages
- Writes to `public/sitemap.xml`

**`scripts/seo-validation/validate-all.js`:**
- Runs all SEO validation checks
- Content and template validation
- Critical issue checks
- Generates validation report

**`scripts/seo-validation/validate-content.js`:**
- Validates blog content
- Checks SEO fields
- Verifies frontmatter
- Reports errors and warnings

**`scripts/seo-validation/validate-templates.js`:**
- Validates Astro templates
- Checks canonical tags
- Verifies structured data
- Reports template issues

#### Template Files

**`src/layouts/Layout.astro`:**
- Base layout for all pages
- Generates canonical URLs
- Includes meta tags
- Handles Open Graph tags

**`src/pages/blog/[...slug].astro`:**
- Blog post template
- Generates blog post canonical URLs
- Includes structured data
- Processes blog post content

### 12.3 Location and Relationships

**File Structure:**
```
/
├── astro.config.mjs (Astro configuration)
├── package.json (Build scripts)
├── public/
│   ├── _redirects (Redirect rules)
│   └── sitemap.xml (Generated sitemap)
├── src/
│   ├── content/
│   │   ├── config.ts (Content schema)
│   │   └── blog/ (Blog posts)
│   ├── layouts/
│   │   └── Layout.astro (Base layout)
│   ├── middleware.ts (Middleware logic)
│   └── pages/
│       └── blog/
│           └── [...slug].astro (Blog template)
└── scripts/
    ├── generate-sitemap.js (Sitemap generation)
    └── seo-validation/ (Validation scripts)
```

**Relationships:**
- `astro.config.mjs` → Configures Astro behavior
- `public/_redirects` → Processed by Cloudflare Pages
- `src/middleware.ts` → Processes requests before Astro
- `src/content/config.ts` → Validates blog post frontmatter
- `scripts/generate-sitemap.js` → Reads blog posts, writes sitemap
- `src/layouts/Layout.astro` → Used by all pages
- `src/pages/blog/[...slug].astro` → Uses Layout.astro, processes blog posts

---

## 13. Quick Reference Tables

### 13.1 Redirect Rules by Category

| Category | Source Pattern | Destination Pattern | Status | Count |
|----------|---------------|---------------------|--------|-------|
| Static Pages | `/contact` | `/contact/` | 301 | 4 |
| Blog Index | `/blog` | `/blog/` | 301 | 1 |
| Category Pages | `/category/gift-guides` | `/category/gift-guides/` | 301 | 1 |
| Blog Posts | `/blog/post-slug` | `/blog/post-slug/` | 301 | 50 |
| .md Extensions | `/blog/post-slug.md` | `/blog/post-slug/` | 301 | ~26 |
| Missing Pages | `/old-url` | `/new-url/` or `/410.html` | 301 | ~8 |
| Category Redirects | `/category/old` | `/category/new/` | 301 | ~4 |

### 13.2 Sitemap Structure

| Page Type | URL Format | Priority | Change Frequency | Count |
|-----------|-----------|----------|------------------|-------|
| Homepage | `https://bright-gift.com/` | 1.0 | daily | 1 |
| Blog Index | `https://bright-gift.com/blog/` | 0.8 | weekly | 1 |
| Category Pages | `https://bright-gift.com/category/*/` | 0.8 | weekly | 2 |
| Blog Posts | `https://bright-gift.com/blog/*/` | 0.7 | monthly | 50 |
| Legal Pages | `https://bright-gift.com/*/` | 0.3 | monthly | 4 |

### 13.3 Frontmatter Field Reference

| Field | Type | Required | Purpose | Example |
|-------|------|----------|---------|---------|
| `title` | string | Yes | Main title | `"25 Gifts for Plant Lovers"` |
| `description` | string | Yes | Brief description | `"Discover 25 thoughtful gifts..."` |
| `image` | string | Yes | Primary image path | `"/images/blog/post/banner.webp"` |
| `date` | string/date | Yes | Publication date | `"2025-12-02"` |
| `metaTitle` | string | No | SEO title | `"25 Plant Lover Gifts: Ideas Under $75"` |
| `metaDescription` | string | No | SEO description | `"Find 25 thoughtful gifts..."` |
| `keywords` | array/string | No | SEO keywords | `["gifts", "plant lovers"]` |
| `tags` | array | No | Content tags | `["gift-guides", "plants"]` |
| `category` | string | No | Content category | `"gift-guide"` |
| `draft` | boolean/string | No | Draft status | `false` |
| `status` | string | No | Post status | `"published"` |
| `canonical` | string | No | Canonical URL | `"https://bright-gift.com/blog/post/"` |
| `ogImage` | string | No | Open Graph image | `"/images/blog/post/og.webp"` |
| `imageAlt` | string | No | Image alt text | `"25 gifts displayed on table"` |
| `ogImageAlt` | string | No | OG image alt text | `"25 Plant Lover Gifts"` |

### 13.4 Common Commands

| Task | Command |
|------|---------|
| Generate sitemap | `npm run generate:sitemap` |
| Validate SEO | `npm run seo:validate` |
| Validate content | `npm run seo:validate:content` |
| Validate templates | `npm run seo:validate:templates` |
| Build site | `npm run build` |
| Test redirect | `curl -I "https://bright-gift.com/url"` |
| Follow redirect chain | `curl -I -L --max-redirs 3 "https://bright-gift.com/url"` |
| Extract canonical | `curl -s "https://bright-gift.com/url/" \| grep -i "canonical"` |
| Count sitemap URLs | `curl -s "https://bright-gift.com/sitemap.xml" \| grep -c "<url>"` |

### 13.5 File Locations

| File | Location |
|------|----------|
| Redirect rules | `public/_redirects` |
| Astro config | `astro.config.mjs` |
| Middleware | `src/middleware.ts` |
| Content schema | `src/content/config.ts` |
| Blog posts | `src/content/blog/*.md` |
| Base layout | `src/layouts/Layout.astro` |
| Blog template | `src/pages/blog/[...slug].astro` |
| Sitemap generator | `scripts/generate-sitemap.js` |
| Sitemap output | `public/sitemap.xml` |
| SEO validation | `scripts/seo-validation/*.js` |
| Build scripts | `package.json` |

---

**End of SEO Master Guide**

This document serves as the definitive reference for all SEO systems, processes, and procedures at BrightGift. For questions or updates, refer to the relevant sections above or consult the source files directly.

**Last Updated:** December 9, 2025  
**Maintained By:** Development Team  
**Review Schedule:** Quarterly

---

## 14. SEO Work Log & Historical Reference

This section provides a chronological log of all SEO work, fixes, and improvements with cross-references to detailed documentation. Use this log to understand what was done previously and avoid repeating work.

### Log Format

Each entry includes:
- **Date:** When the work was completed
- **Type:** Category of work (fix, improvement, audit, etc.)
- **Summary:** Brief description of what was done
- **Reference:** Link to detailed documentation
- **Impact:** What issues were resolved or improvements made

### 2025 SEO Work Log

#### December 9, 2025 - Comprehensive Redirect Diagnostic & Fix

**Type:** Fix & Tooling  
**Summary:** Comprehensive diagnostic and fix of all SEO redirect issues, with primary focus on the persistent `/blog` page problem. Created diagnostic tools and fixed missing redirects.

**Reference:** `redirect-diagnostic-summary-2025-12-09.md`

**What Was Done:**
- Created `scripts/test-all-redirects.js` - comprehensive redirect testing suite
- Created `scripts/verify-redirects.js` - quick pre-deployment verification script
- Added missing redirect rules for 2 blog posts (`gifts-for-new-grandparents`, `little-luxuries-under-25-mini-splurges-major-wow`)
- Verified all 51 published blog posts have redirect rules
- Confirmed all redirects return 301 status codes (no 308s found)
- Updated SEO Master Guide with new troubleshooting sections

**Impact:**
- All published posts now have redirect rules
- Tools created for ongoing maintenance and prevention
- Documentation updated with latest findings
- Ready for GSC validation after deployment

**Next Steps Document:** `next-steps-gsc-validation.md`

---

#### December 3, 2025 - SEO Master Guide Creation

**Type:** Documentation  
**Summary:** Created comprehensive SEO Master Guide documenting all SEO systems, processes, and procedures.

**Reference:** This document (`SEO-MASTER-GUIDE.md`)

**What Was Done:**
- Documented redirect system architecture
- Documented sitemap generation system
- Documented canonical URL system
- Documented content structure and frontmatter
- Documented build process and validation
- Documented GSC integration procedures
- Created troubleshooting guide
- Created quick reference tables

**Impact:**
- Single source of truth for all SEO systems
- Complete documentation for future reference
- Troubleshooting procedures documented
- Historical context preserved

---

#### December 3, 2025 - GSC URL-Level Diagnostics

**Type:** Audit  
**Summary:** Comprehensive URL-level diagnostics of GSC issues, testing live redirects and identifying problems.

**Reference:** `december-03-2025/gsc-url-level-diagnostics-2025-12-03.md`

**What Was Done:**
- Tested all URLs from GSC issue buckets
- Verified redirect status codes (301 vs 308)
- Checked canonical tags
- Identified 308 redirect issues on `/category/gift-guides` and `/contact`
- Documented redirect chain analysis

**Impact:**
- Identified specific URLs with 308 redirects
- Confirmed most redirects working correctly
- Provided actionable fix recommendations

---

### How to Use This Log

1. **Before Starting New SEO Work:**
   - Review recent log entries to understand what was done
   - Check referenced documents for detailed information
   - Avoid duplicating previous work

2. **When Adding New Entries:**
   - Use the format above (Date, Type, Summary, Reference, What Was Done, Impact)
   - Link to detailed documentation files
   - Include next steps if applicable

3. **When Troubleshooting:**
   - Search log for similar issues
   - Review referenced documents for solutions
   - Check if issue was previously resolved

### Related Documentation

- **Redirect Diagnostics:** `redirect-diagnostic-summary-2025-12-09.md`
- **GSC Diagnostics:** `december-03-2025/gsc-url-level-diagnostics-2025-12-03.md`
- **Next Steps:** `next-steps-gsc-validation.md`
- **Historical Analysis:** `old/blog-redirect-failure-analysis.md`
- **Historical Diagnostics:** `old/blog-redirect-diagnostic-findings.md`

---

## Recent Updates (December 9, 2025)

### Redirect System Improvements

1. **Comprehensive Diagnostic Tools Created:**
   - `scripts/test-all-redirects.js` - Full redirect testing suite
   - `scripts/verify-redirects.js` - Quick pre-deployment verification
   - Both scripts added to `package.json` for easy access

2. **Missing Redirects Fixed:**
   - Added redirects for `gifts-for-new-grandparents` and `little-luxuries-under-25-mini-splurges-major-wow`
   - All 51 published blog posts now have redirect rules

3. **308 Redirect Issue Resolved:**
   - Live testing confirms all redirects return 301 status codes
   - `/category/gift-guides` and `/contact` now correctly return 301 (not 308)

4. **Verification Process:**
   - Run `npm run verify:redirects` before deployments
   - Run `npm run test:redirects` for comprehensive testing
   - See `redirect-diagnostic-summary-2025-12-09.md` for full details

---

