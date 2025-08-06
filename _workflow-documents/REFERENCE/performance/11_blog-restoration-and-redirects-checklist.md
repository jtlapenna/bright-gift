# Blog Restoration & Redirects Checklist (Main Project)

## 1. Restore Missing Blog Posts

Restore the following markdown files to `/src/content/blog/`:
- `gifts-for-plant-lovers.md`
- `gifts-for-gamers-under-50.md`
- `gifts-under-25-for-coworkers.md`

**Frontmatter Example:**
```markdown
---
title: "Gifts for Plant Lovers Under $75: 15 Perfect Presents for Green Thumbs"
description: "Discover thoughtful gifts for plant enthusiasts under $75, from rare houseplants to stylish plant accessories that will make any green thumb happy."
image: "/images/blog/plant-lovers-under-75.png"
date: "2024-07-27"
metaTitle: "15 Best Gifts for Plant Lovers Under $75 in 2024 - From Rare Plants to Stylish Accessories"
metaDescription: "Find the perfect gift for plant enthusiasts under $75! Discover rare houseplants, stylish planters, care tools, and accessories that every green thumb will love."
tags: ["plant-lovers", "houseplants", "gardening", "under-75", "budget-friendly", "any-occasion"]
readTime: 8
featured: true
draft: false
---
```

---

## 2. Update Internal Links
- Change all `/gift-guides/...` links to `/blog/...` equivalents in all content.

---

## 3. Add 301 Redirects for Legacy URLs
Add to your `_redirects` file (e.g., `public/_redirects`):
```
/gift-guides/gifts-for-gamers-under-50/   /blog/gifts-for-gamers-under-50/   301
/gift-guides/gifts-under-25-for-coworkers/   /blog/gifts-under-25-for-coworkers/   301
/gift-guides/gifts-for-plant-lovers/   /blog/gifts-for-plant-lovers/   301
```

---

## 4. Check ImageKit Origin (if using ImageKit)
- Set origin to: `https://raw.githubusercontent.com/<your-username>/<your-repo>/<branch>/`
- Purge cache for moved/renamed images.

---

## 5. Rebuild and Redeploy
- Rebuild and redeploy the site.
- Confirm:
  - Restored blog posts are live
  - Old `/gift-guides/` URLs redirect to `/blog/`
  - Internal links are correct
  - Images load as expected

---

## 6. Monitor Google Search Console
- Watch for reduction in 404s
- Validate fixed redirects
- Request reindexing if needed

---

## 7. (Optional) Remove Old Sitemap Entries
- Ensure sitemap only includes live URLs (no `/gift-guides/`)

---

## 8. (Optional) Protect Main Branch
- Prevent automations from force-pushing to `main` unless intended

---

## ✅ Summary Checklist
- [x] Restore missing blog posts to `/src/content/blog/`
- [x] Update all internal links to `/blog/`
- [x] Add 301 redirects for old `/gift-guides/` URLs
- [ ] Update ImageKit origin if needed
- [ ] Rebuild and redeploy
- [ ] Monitor and validate in Google Search Console
- [x] Clean up sitemap and branch protections as needed 