# GSC URL-Level Diagnostics – 2025-12-03

This document takes the example URLs from the December 3, 2025 GSC screenshots and maps each one to:

- The **GSC issue bucket** it appears in
- The **canonical / sitemap URL** (from `public/sitemap.xml`)
- The **redirect behavior we expect** based on `public/_redirects`
- **Checks still needed** against the live site (HTTP status, redirect chain, canonical tags)

It is meant as a working diagnostics sheet to drive concrete fixes.

---

## 1. Crawled – Currently Not Indexed (Validation failed)

### 1.1 `https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/`

- **GSC bucket:** Crawled – currently not indexed (Failed)
- **Sitemap entry:**
  - Present as `https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/`
- **Redirect rules (`public/_redirects`):**
  - `/blog/fun-gifts-for-kids-birthday-parties /blog/fun-gifts-for-kids-birthday-parties/ 301`
  - `/blog/fun-gifts-for-kids-birthday-parties.md /blog/fun-gifts-for-kids-birthday-parties/ 301`
- **Intended canonical:** Trailing-slash URL, as in sitemap.
- **Live checks needed:**
  - Confirm `GET /blog/fun-gifts-for-kids-birthday-parties` → 301 → `/blog/fun-gifts-for-kids-birthday-parties/` (no extra hops).
  - Confirm final URL returns 200 and `<link rel="canonical">` matches the trailing-slash URL.
  - Confirm no conflicting meta robots or `noindex` on the page.

### 1.2 `https://bright-gift.com/blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience`
### 1.3 `https://bright-gift.com/blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience/`

- **GSC bucket:** Both non‑slash and slash variants appear under Crawled – currently not indexed.
- **Sitemap entry:**
  - Present as `https://bright-gift.com/blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience/`
- **Redirect rules:**
  - `/blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience /blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience/ 301`
  - `/blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience.md /blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience/ 301`
- **Intended canonical:** Trailing-slash URL, aligned with sitemap.
- **Live checks needed:**
  - Trace redirect chain from non‑slash and `.md` variants – ensure both are single‑hop 301s to the trailing-slash URL.
  - Confirm final page status 200 + canonical points to trailing-slash URL.
  - Verify internal links (from other posts, nav, category pages) always use the canonical trailing-slash version.

### 1.4 `https://bright-gift.com/category/gift-guides/`

- **GSC bucket:** Crawled – currently not indexed.
- **Sitemap entry:**
  - Present as `https://bright-gift.com/category/gift-guides/` (static page entry at top of sitemap).
- **Redirect rules:**
  - `/category/gift-guide /category/gift-guides/ 301`
  - `/category/gift-guide/ /category/gift-guides/ 301`
  - `/category/ /category/gift-guides 301` (note: no trailing slash in target here)
- **Potential risk:**
  - `/category/` → `/category/gift-guides` (no slash) might introduce an extra redirect hop before landing on `/category/gift-guides/`, depending on Astro/trailingSlash behavior.
- **Live checks needed:**
  - `GET /category/gift-guides` and `/category/gift-guides/` – confirm one canonical 200 URL and consistent redirects.
  - Confirm sitemap URL (`/category/gift-guides/`) is 200 and does **not** redirect again.
  - Check canonical tag and internal navigation links for consistency.

### 1.5 `https://bright-gift.com/blog/unique-gifts-for-board-game-enthusiasts/`

- **GSC bucket:** Crawled – currently not indexed.
- **Sitemap entry:**
  - Present as `https://bright-gift.com/blog/unique-gifts-for-board-game-enthusiasts/`
- **Redirect rules:**
  - `/blog/unique-gifts-for-board-game-enthusiasts /blog/unique-gifts-for-board-game-enthusiasts/ 301`
  - `/blog/unique-gifts-for-board-game-enthusiasts.md /blog/unique-gifts-for-board-game-enthusiasts/ 301`
- **Live checks needed:**
  - Same redirect-chain, status, and canonical checks as sections 1.1–1.3.

### 1.6 `https://bright-gift.com/blog/gifts-for-gamers-under-50/`

- **GSC bucket:** Crawled – currently not indexed.
- **Sitemap entry:**
  - Present as `https://bright-gift.com/blog/gifts-for-gamers-under-50/`
- **Redirect rules:**
  - `/blog/gifts-for-gamers-under-50 /blog/gifts-for-gamers-under-50/ 301`
  - `/blog/gifts-for-gamers-under-50.md /blog/gifts-for-gamers-under-50/ 301`
- **Live checks needed:**
  - Confirm non‑slash and `.md` variants are single‑hop 301s to sitemap URL.
  - Confirm canonical tag and internal links match trailing-slash URL.

### 1.7 `https://bright-gift.com/blog/ai-powered-gift-ideas-for-every-budget/`

- **GSC bucket:** Crawled – currently not indexed.
- **Sitemap entry:** Present with trailing slash.
- **Redirect rules:**
  - `/blog/ai-powered-gift-ideas-for-every-budget /blog/ai-powered-gift-ideas-for-every-budget/ 301`
- **Live checks needed:**
  - Same redirect and canonical checks as above.

### 1.8 `https://bright-gift.com/blog/25-thoughtful-housewarming-gifts-for-new-homeowners-under-75/`

- **GSC bucket:** Crawled – currently not indexed.
- **Sitemap entry:** Present with trailing slash.
- **Redirect rules:**
  - `/blog/25-thoughtful-housewarming-gifts-for-new-homeowners-under-75 /blog/25-thoughtful-housewarming-gifts-for-new-homeowners-under-75/ 301`
  - `/blog/25-thoughtful-housewarming-gifts-for-new-homeowners-under-75.md /blog/25-thoughtful-housewarming-gifts-for-new-homeowners-under-75/ 301`
- **Live checks needed:**
  - Same pattern: verify single‑hop redirects, 200 status, and canonical alignment.

---

## 2. Redirect Error (Validation failed)

### 2.1 `https://bright-gift.com/blog`

- **GSC bucket:** Redirect error (Failed example).
- **Sitemap entry:**
  - Sitemap uses `https://bright-gift.com/blog/` (with trailing slash).
- **Redirect rules:**
  - `/blog /blog/ 301`
- **Intended behavior:** Non‑slash `/blog` should 301 once to `/blog/` and serve as the canonical index.
- **Live checks needed:**
  - Confirm `GET /blog` → single 301 → `/blog/` → 200.
  - Confirm `GET /blog/` is 200 and does **not** redirect again.
  - Verify canonical on `/blog/` equals `https://bright-gift.com/blog/`.

### 2.2 `https://bright-gift.com/privacy`

- **GSC bucket:** Redirect error (Pending in screenshot).
- **Sitemap entry:** `https://bright-gift.com/privacy/`.
- **Redirect rules:**
  - `/privacy /privacy/ 301`
- **Live checks needed:**
  - Same as `/blog`: confirm one 301 from non‑slash to trailing slash; no further redirects.
  - Verify canonical URL on the page and ensure internal links use `/privacy/`.

### 2.3 `https://bright-gift.com/blog/ai-tiktok-made-me-buy-it-gifts-2025`

- **GSC bucket:** Redirect error (Pending).
- **Sitemap entry:** Trailing-slash version only.
- **Redirect rules:**
  - `/blog/ai-tiktok-made-me-buy-it-gifts-2025 /blog/ai-tiktok-made-me-buy-it-gifts-2025/ 301`
- **Live checks needed:**
  - Confirm single‑hop 301 to trailing-slash URL and that final page is indexable.

### 2.4 `https://bright-gift.com/blog/valentines-day-gifts-under-50-20-romantic-ideas-for-every-couple`

- **GSC bucket:** Redirect error (Pending).
- **Sitemap entry:** Trailing-slash version.
- **Redirect rules:**
  - `/blog/valentines-day-gifts-under-50-20-romantic-ideas-for-every-couple /blog/valentines-day-gifts-under-50-20-romantic-ideas-for-every-couple/ 301`
- **Live checks needed:**
  - Same single‑hop redirect + canonical checks as other posts.

---

## 3. Page with Redirect (Validation failed)

### 3.1 `https://bright-gift.com/data-deletion`

- **GSC bucket:** Page with redirect (Failed example).
- **Sitemap entry:** `https://bright-gift.com/data-deletion/`.
- **Redirect rules:**
  - `/data-deletion /data-deletion/ 301`
- **Live checks needed:**
  - Confirm `/data-deletion` → 301 → `/data-deletion/` → 200.
  - Verify no second redirect and canonical points to the trailing-slash URL.

### 3.2 `https://bright-gift.com/blog/unique-graduation-gifts-creative-minds`

- **GSC bucket:** Page with redirect.
- **Sitemap entry:** Trailing-slash version.
- **Redirect rules:**
  - `/blog/unique-graduation-gifts-creative-minds /blog/unique-graduation-gifts-creative-minds/ 301`
  - `/blog/unique-graduation-gifts-creative-minds.md /blog/unique-graduation-gifts-creative-minds/ 301`
- **Live checks needed:**
  - As above: verify redirect hops and canonical.

### 3.3 `https://bright-gift.com/blog/remote-work-2-0-gifts-hybrid-offices-50-100`

- **GSC bucket:** Page with redirect.
- **Sitemap entry:** Trailing-slash URL present.
- **Redirect rules:**
  - `/blog/remote-work-2-0-gifts-hybrid-offices-50-100 /blog/remote-work-2-0-gifts-hybrid-offices-50-100/ 301`
- **Live checks needed:**
  - Same verification pattern.

### 3.4 `https://bright-gift.com/blog/25-amazing-gifts-from-black-owned-businesses-under-75`

- **GSC bucket:** Page with redirect.
- **Sitemap entry:** Trailing-slash URL present.
- **Redirect rules:**
  - `/blog/25-amazing-gifts-from-black-owned-businesses-under-75 /blog/25-amazing-gifts-from-black-owned-businesses-under-75/ 301`
  - `/blog/25-amazing-gifts-from-black-owned-businesses-under-75.md /blog/25-amazing-gifts-from-black-owned-businesses-under-75/ 301`

### 3.5 `https://bright-gift.com/blog/25-books-to-gift-this-holiday-season`

- **GSC bucket:** Page with redirect.
- **Sitemap entry:** Trailing-slash URL present.
- **Redirect rules:**
  - `/blog/25-books-to-gift-this-holiday-season /blog/25-books-to-gift-this-holiday-season/ 301`
  - `/blog/25-books-to-gift-this-holiday-season.md /blog/25-books-to-gift-this-holiday-season/ 301`

### 3.6 `https://bright-gift.com/contact`

- **GSC bucket:** Page with redirect.
- **Sitemap entry:** `https://bright-gift.com/contact/`.
- **Redirect rules:**
  - `/contact /contact/ 301`
- **Live checks needed:**
  - Confirm single‑hop 301 from non‑slash to `/contact/` and 200 on final URL.

### 3.7 `https://bright-gift.com/blog/best-2025-holiday-gifts-ai-tech-remote-work`

- **GSC bucket:** Page with redirect.
- **Sitemap entry:** Trailing-slash present.
- **Redirect rules:**
  - `/blog/best-2025-holiday-gifts-ai-tech-remote-work /blog/best-2025-holiday-gifts-ai-tech-remote-work/ 301`
  - `/blog/best-2025-holiday-gifts-ai-tech-remote-work.md /blog/best-2025-holiday-gifts-ai-tech-remote-work/ 301`

---

## 4. Patterns and What This Sheet Enables

Across all example URLs:

- Sitemap **always** uses **trailing slashes**.
- `_redirects` explicitly 301s **non‑slash** and sometimes `.md` variants to the trailing-slash URL.
- GSC is still reporting both **crawled-not-indexed** and **redirect-related** issues for these URLs.

This sheet is now ready to be used as a checklist for **live HTTP testing** and canonical inspection for each example URL. The next concrete step would be to:

1. Run a scripted check (or manual curl) for each URL here.
2. Record: status code, redirect chain, final URL, canonical tag, robots directives.
3. Compare findings to sitemap + `_redirects` expectations and propose **per‑URL and systemic fixes**.

---

## 5. Live Test Results (2025-12-03)

**Test Method:** Manual curl checks for HTTP status codes, redirect chains, and canonical tags.

### 5.1 Crawled – Currently Not Indexed URLs

#### ✅ 1.1 `https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/`
- **Non-slash variant:** `GET /blog/fun-gifts-for-kids-birthday-parties` → **301** → `/blog/fun-gifts-for-kids-birthday-parties/` → **200** ✅
- **Trailing-slash variant:** `GET /blog/fun-gifts-for-kids-birthday-parties/` → **200** ✅
- **Canonical tag:** Present and correct: `<link rel="canonical" href="https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/">` ✅
- **Robots:** `x-robots-tag: index, follow` ✅
- **Status:** **WORKING CORRECTLY** — Redirect chain is clean, canonical is correct, page is indexable.

#### ✅ 1.2 & 1.3 `https://bright-gift.com/blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience`
- **Non-slash variant:** `GET /blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY** — Single-hop 301 redirect as expected.

#### ⚠️ 1.4 `https://bright-gift.com/category/gift-guides/`
- **Non-slash variant:** `GET /category/gift-guides` → **308** → `/category/gift-guides/` → **200** ⚠️
- **Trailing-slash variant:** `GET /category/gift-guides/` → **200** ✅
- **Issue:** **308 (Permanent Redirect) instead of 301** — GSC validation may fail because 308s are treated differently than 301s for permanent redirects. The `_redirects` file specifies 301, but Astro/Cloudflare is serving 308.
- **Status:** **NEEDS FIX** — Should be 301, not 308.

#### ✅ 1.5 `https://bright-gift.com/blog/unique-gifts-for-board-game-enthusiasts/`
- **Non-slash variant:** `GET /blog/unique-gifts-for-board-game-enthusiasts` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

#### ✅ 1.6 `https://bright-gift.com/blog/gifts-for-gamers-under-50/`
- **Non-slash variant:** `GET /blog/gifts-for-gamers-under-50` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

#### ✅ 1.7 `https://bright-gift.com/blog/ai-powered-gift-ideas-for-every-budget/`
- **Non-slash variant:** `GET /blog/ai-powered-gift-ideas-for-every-budget` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

#### ✅ 1.8 `https://bright-gift.com/blog/25-thoughtful-housewarming-gifts-for-new-homeowners-under-75/`
- **Non-slash variant:** `GET /blog/25-thoughtful-housewarming-gifts-for-new-homeowners-under-75` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

### 5.2 Redirect Error URLs

#### ✅ 2.1 `https://bright-gift.com/blog`
- **Non-slash variant:** `GET /blog` → **301** → `/blog/` → **200** ✅
- **Trailing-slash variant:** `GET /blog/` → **200** ✅
- **Canonical tag:** Present and correct: `<link rel="canonical" href="https://bright-gift.com/blog/">` ✅
- **Status:** **WORKING CORRECTLY**

#### ✅ 2.2 `https://bright-gift.com/privacy`
- **Non-slash variant:** `GET /privacy` → **301** → `/privacy/` → **200** ✅
- **Status:** **WORKING CORRECTLY**

#### ✅ 2.3 `https://bright-gift.com/blog/ai-tiktok-made-me-buy-it-gifts-2025`
- **Non-slash variant:** `GET /blog/ai-tiktok-made-me-buy-it-gifts-2025` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

#### ✅ 2.4 `https://bright-gift.com/blog/valentines-day-gifts-under-50-20-romantic-ideas-for-every-couple`
- **Non-slash variant:** `GET /blog/valentines-day-gifts-under-50-20-romantic-ideas-for-every-couple` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

### 5.3 Page with Redirect URLs

#### ✅ 3.1 `https://bright-gift.com/data-deletion`
- **Non-slash variant:** `GET /data-deletion` → **301** → `/data-deletion/` → **200** ✅
- **Trailing-slash variant:** `GET /data-deletion/` → **200** ✅
- **Status:** **WORKING CORRECTLY**

#### ✅ 3.2 `https://bright-gift.com/blog/unique-graduation-gifts-creative-minds`
- **Non-slash variant:** `GET /blog/unique-graduation-gifts-creative-minds` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

#### ✅ 3.3 `https://bright-gift.com/blog/remote-work-2-0-gifts-hybrid-offices-50-100`
- **Non-slash variant:** `GET /blog/remote-work-2-0-gifts-hybrid-offices-50-100` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

#### ✅ 3.4 `https://bright-gift.com/blog/25-amazing-gifts-from-black-owned-businesses-under-75`
- **Non-slash variant:** `GET /blog/25-amazing-gifts-from-black-owned-businesses-under-75` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

#### ✅ 3.5 `https://bright-gift.com/blog/25-books-to-gift-this-holiday-season`
- **Non-slash variant:** `GET /blog/25-books-to-gift-this-holiday-season` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

#### ⚠️ 3.6 `https://bright-gift.com/contact`
- **Non-slash variant:** `GET /contact` → **308** → `/contact/` → **200** ⚠️
- **Trailing-slash variant:** `GET /contact/` → **200** ✅
- **Issue:** **308 (Permanent Redirect) instead of 301** — Same issue as `/category/gift-guides`. The `_redirects` file specifies 301, but the live site is serving 308.
- **Status:** **NEEDS FIX** — Should be 301, not 308.

#### ✅ 3.7 `https://bright-gift.com/blog/best-2025-holiday-gifts-ai-tech-remote-work`
- **Non-slash variant:** `GET /blog/best-2025-holiday-gifts-ai-tech-remote-work` → **301** → trailing-slash → **200** ✅
- **Status:** **WORKING CORRECTLY**

---

## 6. Summary of Findings

### ✅ What's Working
- **All blog post redirects** are correctly using **301** status codes.
- **Canonical tags** are present and correct on tested pages.
- **Redirect chains** are clean (single-hop redirects, no loops).
- **Final URLs** return **200** status codes and are indexable (`x-robots-tag: index, follow`).

### ⚠️ Critical Issues Found

1. **308 Redirects Instead of 301:**
   - `/category/gift-guides` → **308** (should be 301)
   - `/contact` → **308** (should be 301)
   
   **Root Cause:** These redirects are likely being handled by **Astro's `trailingSlash: 'always'` configuration** rather than the explicit 301 rules in `public/_redirects`. Cloudflare Pages may be applying Astro's trailing-slash behavior (which uses 308) before the `_redirects` file rules are evaluated.

   **Impact:** Google Search Console validation may fail because:
   - 308 is a "Permanent Redirect" but is method-preserving (POST stays POST), while 301 is "Moved Permanently" and changes method to GET.
   - GSC's validation logic may treat 308s differently than 301s, causing validation failures even though the redirects work functionally.

### 🔍 Why GSC Still Shows Issues

Despite most redirects working correctly:

1. **308 vs 301 mismatch** on category and contact pages may confuse GSC's validation.
2. **Historical crawl data** — GSC may still be processing old crawl data from before fixes were applied.
3. **Validation timing** — The validation failures shown in screenshots are from October–November 2025. New validations may need to be triggered after fixing the 308 issues.
4. **Indexing delays** — Even with correct redirects, Google may take time to re-crawl and re-index pages that were previously flagged.

### 📋 Recommended Fixes

1. **Fix 308 → 301 for category and contact pages:**
   - **Root Cause Identified:** Astro config has `trailingSlash: 'always'` (line 8 in `astro.config.mjs`), which causes Astro to automatically redirect non-trailing-slash URLs using **308** status codes.
   - **Problem:** For `/category/gift-guides` and `/contact`, Astro's trailing-slash redirects are being applied **before** or **instead of** the explicit 301 rules in `public/_redirects`.
   - **Solution Options:**
     - **Option A:** Ensure `_redirects` rules are processed first by Cloudflare Pages (may require Cloudflare configuration changes).
     - **Option B:** Add explicit 301 redirects in Astro's routing logic for these specific pages (override Astro's default 308 behavior).
     - **Option C:** Change Astro config to `trailingSlash: 'never'` and handle all trailing-slash redirects explicitly in `_redirects` (more control, but requires updating all redirect rules).
   - **Recommended:** Investigate Cloudflare Pages redirect processing order and ensure `_redirects` takes precedence over Astro's automatic trailing-slash redirects.

2. **Request new GSC validations** after fixes are deployed:
   - Manually trigger new validations in GSC for all three issue buckets.
   - Monitor validation results over the next 1–2 weeks.

3. **Monitor indexing status:**
   - Use GSC's URL Inspection tool to check individual URLs after fixes.
   - Submit updated sitemap to GSC if needed.

4. **Verify redirect processing order:**
   - Test whether Cloudflare Pages processes `public/_redirects` before or after Astro's SSR redirects.
   - Consider adding explicit redirect rules in Astro's page components if `_redirects` cannot override Astro's behavior.

---

## 7. Manual QA & Verification Procedures (Bookmarked)

**Last Updated:** 2025-12-03  
**Status:** Post-deployment verification checklist

### Post-Deployment Verification Checklist

After deploying SEO-related changes (especially redirect fixes), perform these verification steps:

#### 1. HTTP Status Code Verification

**Test redirects with curl:**
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

# Test blog post redirect (example)
curl -I "https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties"
# Expected: HTTP/2 301
# Location: /blog/fun-gifts-for-kids-birthday-parties/
```

**Verify final URLs return 200:**
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

#### 2. Redirect Chain Validation

**Verify single-hop redirects (no loops):**
```bash
# Follow redirects and count hops
curl -I -L --max-redirs 3 "https://bright-gift.com/contact" 2>&1 | grep -E "HTTP|location:" | head -5
# Should show: 301 → 200 (only 2 HTTP responses)

curl -I -L --max-redirs 3 "https://bright-gift.com/category/gift-guides" 2>&1 | grep -E "HTTP|location:" | head -5
# Should show: 301 → 200 (only 2 HTTP responses)
```

**Check for redirect loops:**
- If you see more than 2 HTTP responses (301 → 301 → 200), there's a redirect loop
- If you see 308 status codes, the `_redirects` file rules may not be taking precedence

#### 3. Canonical Tag Verification

**Extract canonical tags from pages:**
```bash
# Check canonical tag on blog post
curl -s "https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/" | grep -i "canonical\|rel=\"canonical\"" | head -3
# Expected: <link rel="canonical" href="https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties/">

# Check canonical tag on blog index
curl -s "https://bright-gift.com/blog/" | grep -i "canonical\|rel=\"canonical\"" | head -3
# Expected: <link rel="canonical" href="https://bright-gift.com/blog/">
```

**Verify canonical URL format:**
- Must start with `https://bright-gift.com`
- Must have trailing slash (except root `/`)
- Must match the sitemap URL exactly

#### 4. Sitemap Completeness Check

**Verify sitemap includes all published posts:**
```bash
# Count blog posts in sitemap
curl -s "https://bright-gift.com/sitemap.xml" | grep -c "/blog/"
# Should match number of published blog posts (check against src/content/blog/*.md files with draft: false)

# Verify specific post is in sitemap
curl -s "https://bright-gift.com/sitemap.xml" | grep "little-luxuries-under-25-mini-splurges-major-wow"
# Should return the sitemap entry for the new post
```

**Check sitemap format:**
- All URLs should have trailing slashes
- All URLs should use `https://bright-gift.com` domain
- `lastmod` dates should be accurate
- No duplicate URLs

#### 5. GSC Verification Steps

**After deployment, in Google Search Console:**

1. **URL Inspection Tool:**
   - Go to: URL Inspection tool
   - Enter: `https://bright-gift.com/contact`
   - Check: "Page is on Google" status
   - Verify: Canonical URL shown
   - Request indexing if needed

2. **Start New Validations:**
   - Navigate to: Page indexing → Redirect error → Validation details
   - Click: "START NEW VALIDATION"
   - Monitor: Validation status over 24-48 hours
   - Repeat for: "Page with redirect" and "Crawled - currently not indexed" buckets

3. **Sitemap Submission:**
   - Go to: Sitemaps
   - Verify: `https://bright-gift.com/sitemap.xml` is submitted
   - Check: Last read date is recent
   - Resubmit if needed

#### 6. Monitoring Timeline

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

### Common Issues to Watch For

**If 308 redirects still appear:**
- Check `public/_redirects` file syntax
- Verify Cloudflare Pages deployment succeeded
- Clear Cloudflare cache if needed
- Check Astro config `trailingSlash` setting

**If canonical tags are wrong:**
- Check `src/layouts/Layout.astro` canonical URL generation
- Verify frontmatter `canonical` field in blog posts
- Check for trailing slash consistency

**If sitemap is incomplete:**
- Run `npm run generate:sitemap` locally
- Check for YAML parsing errors in blog posts
- Verify draft filtering logic matches routing
