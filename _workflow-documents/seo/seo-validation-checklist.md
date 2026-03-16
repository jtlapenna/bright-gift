# SEO Validation Checklist

This checklist is the current source of truth for local validation and post-deploy spot checks.

## Local

### 1) Run the guarded SEO validation

```bash
npm run seo:validate
```

This now includes:
- content validation
- template validation
- repo URL-policy validation

### 2) Generate the sitemap

```bash
npm run generate:sitemap
```

### 3) Build the site

```bash
npm run build
```

## Post-deploy

### 1) Spot-check canonical behavior

```bash
curl -I https://bright-gift.com/blog
curl -I https://bright-gift.com/blog/
curl -s https://bright-gift.com/blog/gifts-under-25-for-coworkers/ | grep -i 'rel="canonical"' | head -n 1
curl -s https://bright-gift.com/sitemap.xml | head -n 30
```

Expected:
- `/blog` redirects directly to `/blog/`
- the canonical tag matches the trailing-slash URL exactly
- sitemap entries are canonical URLs only
- sitemap does not include blog pagination URLs

### 2) Inspect only canonical URLs in GSC

Use URL Inspection on:
- `https://bright-gift.com/blog/gifts-under-25-for-coworkers/`
- `https://bright-gift.com/blog/little-luxuries-under-25-mini-splurges-major-wow/`
- `https://bright-gift.com/blog/clean-girl-2-0-minimalist-gifts-with-personality/`

Do not inspect:
- non-slash blog URLs
- `.md` URLs
- paginated archive URLs
- off-season seasonal archive pages

### 3) If GSC reports a redirect issue

- Find the exact redirecting URL Google is reporting.
- Search the repo and operator docs for that exact variant.
- Remove the source before asking GSC to validate again.
