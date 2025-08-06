# Cloudflare Pages Preview Troubleshooting Steps

This document provides a prioritized, step-by-step checklist for diagnosing why your Cloudflare Pages preview site is not loading content, especially when using Astro and n8n workflows.

---

## 1. Check Cloudflare Pages Build Output Directory
**Why:** If the output directory is wrong, nothing will be served.

**How:**
- Go to Cloudflare Pages → Project → Settings → Build & Deploy → Build output directory.
- **Should be:** `dist`
- **What to look for:**
  - The build output directory field must be set to `dist` (all lowercase, no slashes).
  - If it is not, change it to `dist` and redeploy your preview.
  - If it is already `dist`, proceed to the next step.

---

## 2. Confirm Markdown Files Are in the Preview Branch
**Why:** Your n8n workflow pushes new markdown files to the `preview` branch (not `main`).

**How:**
- On GitHub, switch to the `preview` branch.
- Check that your new markdown files exist in `src/content/blog/`.
- **What to look for:**
  - The markdown file for your new post should be present in the correct folder.
  - If missing, check your n8n workflow or GitHub action for errors.

---

## 3. Check Cloudflare Pages Is Deploying the Correct Branch
**Why:** If Cloudflare is not building from the `preview` branch, your new content won’t appear.

**How:**
- In Cloudflare Pages → Deployments, confirm the latest preview deployment is from the `preview` branch (not `main`).
- **What to look for:**
  - The deployment should clearly indicate it is from the `preview` branch.
  - If not, update your Pages project to use the correct branch for previews.

---

## 4. Verify Environment Variable for Preview
**Why:** Drafts are only included if `IS_PREVIEW=true`.

**How:**
- In Cloudflare Pages → Project → Settings → Environment Variables.
- Under “Preview” (not Production), ensure `IS_PREVIEW` is set to `true`.
- **What to look for:**
  - The variable name should be `IS_PREVIEW` (all caps, no spaces).
  - The value should be `true` (all lowercase).

---

## 5. Check Astro Dynamic Routing
**Why:** Astro must generate routes for your markdown files.

**How:**
- Ensure you have `src/pages/blog/[...slug].astro` (which you do).
- In `getStaticPaths`, confirm it’s using the correct filtering logic (which you’ve updated for `IS_PREVIEW`).
- Add a `console.log` in `getStaticPaths` to log which slugs are being picked up during the build (check Cloudflare build logs for output).
- **What to look for:**
  - The log should show all expected slugs, including drafts if in preview.

---

## 6. Test Direct URLs
**Why:** To see if the route is being generated.

**How:**
- Try accessing a known slug directly, e.g.:
  `https://preview-bright-gift.pages.dev/blog/your-slug-here/`
- **What to look for:**
  - The page should load if the route is generated.
  - If it 404s, the route is not being generated or the file is missing.

---

## 7. Check Cloudflare Build Logs
**Why:** Build logs will show if content is being picked up and routes are being generated.

**How:**
- In Cloudflare Pages → Deployments → Click the latest preview deployment → View build logs.
- **What to look for:**
  - Errors or warnings about missing content
  - Output from your `console.log` in `getStaticPaths`
  - Confirmation that routes are being generated

---

## 8. Check n8n Workflow for Errors
**Why:** If the workflow fails, files may not be pushed to GitHub.

**How:**
- In n8n, check the execution history for the workflow.
- Ensure the GitHub node is pushing to the correct branch and path.
- Confirm the Cloudflare deploy hook is being triggered after the push.
- **What to look for:**
  - Successful workflow runs
  - No errors in the GitHub or deploy steps

---

## 9. Check for File/Slug Mismatches
**Why:** If the slug in the URL doesn’t match the markdown filename, the route won’t resolve.

**How:**
- Ensure the slug in the URL matches the markdown file’s name and frontmatter.
- **What to look for:**
  - The filename and frontmatter `slug` should match the URL you are testing.

---

## 10. Redeploy Manually if Needed
**Why:** Sometimes deploy hooks or auto-deploys can fail.

**How:**
- In Cloudflare Pages, trigger a manual redeploy of the preview branch.
- **What to look for:**
  - The deployment should complete successfully and include your new content.

---

## Summary Table

| Step | What to Check | Why |
|------|---------------|-----|
| 1 | Build output directory = `dist` | Required for Astro |
| 2 | Markdown files in `preview` branch | Content must exist |
| 3 | Cloudflare deploys `preview` branch | Must match content |
| 4 | `IS_PREVIEW=true` in preview env | Drafts only show in preview |
| 5 | Astro dynamic routing & logs | Ensure routes are generated |
| 6 | Test direct URLs | Confirm route generation |
| 7 | Cloudflare build logs | Debug build/content issues |
| 8 | n8n workflow success | Ensure files are pushed |
| 9 | File/slug match | Route must match filename/slug |
| 10 | Manual redeploy | Fixes missed deploys |

---

**Start with steps 1–4, as these are the most common causes.**
If you get stuck, share the build log output and a sample slug, and I’ll help you debug further! 