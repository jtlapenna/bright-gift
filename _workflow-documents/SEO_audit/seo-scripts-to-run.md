# SEO Scripts to Run - Quick Reference

## 📋 Overview

Based on recent SEO troubleshooting work, these scripts should be run regularly to maintain SEO health:

## 🔄 Regular Maintenance Scripts

### 1. Redirect Monitoring Script ⚠️ **IMPORTANT**

**Purpose:** Checks that all redirects use 301 status codes instead of 308 (important for SEO value transfer)

**Command:**
```bash
node scripts/monitor-redirects.js
```

**Frequency:** 
- Weekly (as per redirect strategy document)
- Before major deployments
- After adding new redirects

**What it checks:**
- Blog URLs without trailing slashes
- Category URLs
- Static pages
- Missing pages (should return 410 Gone)

**Expected output:**
- ✅ 301 redirects (good)
- ⚠️ 308 redirects (bad - need fixing)
- ❌ Errors (need investigation)

**Documentation:** `_workflow-documents/SEO_audit/redirect-strategy-301-vs-308.md`

---

### 2. SEO Validation Script

**Purpose:** Validates all blog posts and templates for SEO compliance

**Command:**
```bash
npm run seo:validate
```

**Frequency:**
- Before each build (automatically runs in `prebuild`)
- After adding/updating blog posts
- Weekly manual check

**What it validates:**
- Meta titles (50-60 characters)
- Meta descriptions (140-160 characters)
- Keywords presence
- Image paths and formats
- Frontmatter schema compliance
- Structured data

**Script location:** `scripts/seo-validation/validate-all.js`

---

### 3. Sitemap Generation

**Purpose:** Generates sitemap.xml with all blog posts

**Command:**
```bash
node scripts/generate-sitemap.js
```

**Frequency:**
- Before each build (automatically runs in `prebuild`)
- After adding new blog posts
- After updating blog post dates

**Output:** `public/sitemap.xml`

**What it includes:**
- All static pages (homepage, blog index, categories, etc.)
- All blog posts from `src/content/blog/`
- Correct URL format with trailing slashes
- Last modified dates from frontmatter

---

## 🔧 Validation Scripts (Pre-Build)

### 4. Image Validation

**Command:**
```bash
node scripts/validate-images.js
```

**Purpose:** Ensures no JPG files in blog image directories (WebP only)

**Runs automatically in:** `prebuild` script

---

### 5. YAML Validation

**Command:**
```bash
npm run validate:yaml
```

**Purpose:** Validates all frontmatter YAML for syntax errors

**Runs automatically in:** `prebuild` script

---

### 6. Link Validation

**Command:**
```bash
npm run validate:links
```

**Purpose:** Validates internal and external links

**Frequency:** As needed for link checking

---

### 7. Category Validation

**Command:**
```bash
npm run validate:categories
```

**Purpose:** Validates category assignments

**Frequency:** As needed

---

### 8. Schema Validation

**Command:**
```bash
npm run validate:schema
```

**Purpose:** Validates frontmatter against content schema

**Frequency:** As needed for troubleshooting

---

## 📊 Build Process Integration

### Current Pre-Build Script (package.json):
```json
"prebuild": "npm run seo:validate && node scripts/validate-images.js && npm run validate:yaml && npm run generate:sitemap"
```

**This means all SEO checks run automatically before every build!**

---

## 🚨 Troubleshooting Scripts

### 9. Frontmatter Schema Check (for indexing issues)

**If you get "Crawled - currently not indexed" errors:**

1. **Check frontmatter against live schema:**
   - Compare blog post frontmatter with `src/content/config.ts`
   - Remove any fields not in the schema

2. **Common issues:**
   - `faqSchema` (removed from schema)
   - `imageAlt`, `ogImageAlt`, `socialImageAlt` (not in schema)
   - `socialImage` (not in schema)
   - Date format should be `"YYYY-MM-DD"` not ISO string

**Documentation:** `_workflow-documents/SEO_audit/troubleshooting-indexing-issue-unique-graduation-gifts.md`

---

## 📅 Recommended Run Schedule

### Daily:
- ✅ **Automated:** Pre-build scripts run automatically on deployment

### Weekly:
- 🔍 **Manual:** `node scripts/monitor-redirects.js`
- 🔍 **Manual:** Quick SEO validation check

### Monthly:
- 🔍 **Full audit:** Run all validation scripts
- 📊 **Review:** Check Search Console for indexing issues
- 🔄 **Sitemap:** Verify all posts included

---

## 🎯 Quick Commands Reference

```bash
# Redirect monitoring (weekly)
node scripts/monitor-redirects.js

# Complete SEO validation
npm run seo:validate

# Sitemap generation
node scripts/generate-sitemap.js

# Full pre-build validation (runs automatically)
npm run build

# Individual validations
npm run validate:yaml
npm run validate:links
npm run validate:categories
npm run validate:schema

# Image validation
node scripts/validate-images.js
```

---

## 📚 Related Documentation

- **Redirect Strategy:** `_workflow-documents/SEO_audit/redirect-strategy-301-vs-308.md`
- **Troubleshooting Guide:** `_workflow-documents/SEO_audit/troubleshooting-indexing-issue-unique-graduation-gifts.md`
- **Complete SEO Summary:** `_workflow-documents/SEO_audit/complete-seo-issues-and-troubleshooting-summary.md`

---

**Last Updated:** October 30, 2025  
**Status:** ✅ All scripts documented and verified

