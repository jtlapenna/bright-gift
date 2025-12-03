# Bright‑Gift SEO Patch — Apply & Verify Guide

## 0) What this patch does (quick recap)
- Standardizes on **trailing‑slash** URLs site‑wide.
- Stops the `/privacy` and `/terms` redirect loop.
- Aligns API‑emitted blog URLs and the sitemap with the same canonical style.

---

## 1) Get ready
```bash
# From your repo root
git status                    # ensure clean working tree
git checkout -b fix/seo-trailing-slash
```

Download the patch to your machine (or keep using the one we created earlier):  
**bright-gift-seo-fix.patch**

Optional dry run (recommended):
```bash
git apply --check /path/to/bright-gift-seo-fix.patch
```

---

## 2) Apply the patch
```bash
# Try a normal apply first
git apply --whitespace=fix /path/to/bright-gift-seo-fix.patch || # If that fails, try 3-way merge (uses index to help align hunks)
git apply --3way --whitespace=fix /path/to/bright-gift-seo-fix.patch || # As a last resort, accept rejects so you can finish by hand
git apply --reject /path/to/bright-gift-seo-fix.patch
```

Commit:
```bash
git add -A
git commit -m "[SEO] Canonicalize trailing slashes; fix /privacy and /terms loop; align API URLs"
```

Push & open PR:
```bash
git push -u origin fix/seo-trailing-slash
```

---

## 3) If you see rejects or conflicts (manual finish)
You’ll get `.rej` files where hunks didn’t apply. Open the `.rej` and the corresponding source file; apply the tiny changes by hand.

**Common manual edits (search/replace as needed):**
- In `astro.config.mjs`  
  - `trailingSlash: 'never'` → `trailingSlash: 'always'`  
  - Remove `/privacy` and `/terms` from the `routes.exclude` array for the Cloudflare adapter.
- In `public/_redirects`  
  - Add:
    ```txt
    /terms   /terms/   301
    /privacy /privacy/ 301
    ```
- In the API code (both files):  
  - `final_url: fm.url || \`https://bright-gift.com/blog/${slug}\`,`  
    → `final_url: fm.url || \`https://bright-gift.com/blog/${slug}/\`,`  
  *(One trailing slash added.)*
- In `public/sitemap.xml`  
  - `<loc>https://bright-gift.com/privacy</loc>` → `<loc>https://bright-gift.com/privacy/</loc>`  
  - `<loc>https://bright-gift.com/terms</loc>`   → `<loc>https://bright-gift.com/terms/</loc>`

**Helpful finders:**
```bash
# Find any final_url lines without a trailing slash
grep -R "final_url:.*bright-gift.com/blog/" -n

# Find references to privacy/terms without trailing slash
grep -R "bright-gift.com/terms\"" -n public || true
grep -R "bright-gift.com/privacy\"" -n public || true
```

> 📌 **Note:** *If your repo layout differs from the paths in the patch, a couple hunks may need to be applied manually—but the intent stays the same: one canonical (slash) URL everywhere.*

---

## 4) Local build & sanity checks
```bash
# Build
npm run build    # or: pnpm build / bun run build

# Quick config check (Astro)
grep -n "trailingSlash" astro.config.mjs
```

Sanity test URLs (after deploy you’ll repeat these against production):
```bash
curl -I http://localhost:8788/privacy      # or your local dev URL
curl -I http://localhost:8788/privacy/
```

---

## 5) Deploy & purge
- Deploy via your normal CI (PR → merge → Pages deploy).
- In Cloudflare Pages: **Purge cache** for the site after the deployment completes.

---

## 6) Production verification
Run these (expect a single hop to the slash, then 200):
```bash
curl -I https://bright-gift.com/privacy     # 301 → /privacy/
curl -I https://bright-gift.com/privacy/    # 200
curl -I https://bright-gift.com/terms       # 301 → /terms/
curl -I https://bright-gift.com/terms/      # 200
```

Spot‑check:
- A few blog links coming from your API now end with `/`.
- `https://bright-gift.com/sitemap.xml` shows `/privacy/` and `/terms/`.

---

## 7) Search Console follow‑up
- **URL Inspection** → test & **Request Indexing** for `/privacy/` and `/terms/`.
- Resubmit `sitemap.xml`.
- Review **Page indexing** and **Crawl stats** over the next couple days.

---

## 8) Rollback (if needed)
If something goes sideways and you haven’t merged:
```bash
git reset --hard HEAD~1
git checkout main
```
If already merged, use a standard:
```bash
git revert <commit-sha>
```

---

## 9) Quick checklist
- [ ] `astro.config.mjs` → `trailingSlash: 'always'`, no `/privacy` or `/terms` in excludes  
- [ ] `_redirects` adds `/privacy → /privacy/` and `/terms → /terms/`  
- [ ] API `final_url` uses `/blog/${slug}/` (slash)  
- [ ] `sitemap.xml` shows `/privacy/` and `/terms/`  
- [ ] Curl tests pass (one redirect max, then 200)  
- [ ] Cloudflare cache purged; Search Console reindex requested
