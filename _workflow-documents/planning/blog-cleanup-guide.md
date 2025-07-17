# Blog Post Cleanup Guide

## Overview
This guide outlines the systematic cleanup process for all blog posts to ensure consistency, proper formatting, and removal of duplicate content.

## Progress Tracking

### ✅ Completed Tasks
- **Template Fix:** Affiliate disclosure alignment fixed in `src/pages/blog/[...slug].astro`
- **Old Affiliate Disclosures:** Removed from all 25 blog posts
- **Fully Fixed Posts (11/25):**
  - ✅ `affordable-gifts-for-pet-lovers-under-30.md`
  - ✅ `unique-graduation-gifts-creative-minds.md`
  - ✅ `chic-wedding-gifts-for-the-stylish-couple.md`
  - ✅ `best-gifts-for-dads-who-love-outdoor-adventures.md`
  - ✅ `best-home-gifts-on-amazon-2024.md`
  - ✅ `gifts-for-new-homeowners-2025.md`
  - ✅ `last-minute-birthday-gifts-for-busy-professionals.md`
  - ✅ `gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience.md`
  - ✅ `unique-christmas-gifts-for-gamers-who-have-everything-2024.md`
  - ✅ `special-birthday-gifts-for-lgbtq-youth.md`
  - ✅ `unique-gifts-for-board-game-enthusiasts.md`

### 🔄 Remaining Posts to Fix (14/25)
Posts that still need full cleanup (duplicate titles, frontmatter format, price/link layout):

1. `gifts-for-remote-workers-under-50.md` - Needs frontmatter fix
2. `20-ethical-gift-ideas-for-eco-conscious-loved-ones-under-75.md` - Needs frontmatter fix
3. `25-thoughtful-housewarming-gifts-for-new-homeowners-under-75.md` - Needs frontmatter fix
4. `25-unique-anniversary-gift-ideas-under-50.md` - Needs frontmatter fix
5. `30-unique-gift-ideas-for-new-parents-baby-shower-beyond.md` - Needs frontmatter fix
6. `eco-friendly-gift-ideas-for-every-budget.md` - Needs frontmatter fix
7. `gifts-for-gamers-under-50.md` - Needs frontmatter fix
8. `gifts-for-girlfriend-unique-romantic-ideas.md` - Needs frontmatter fix
9. `gifts-under-25-for-coworkers.md` - Needs frontmatter fix
10. `how-ai-is-revolutionizing-gift-shopping-complete-guide.md` - Needs frontmatter fix
11. `gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience.md` - Needs frontmatter fix
12. `unique-christmas-gifts-for-gamers-who-have-everything-2024.md` - Needs frontmatter fix
13. `unique-gifts-for-board-game-enthusiasts.md` - Needs frontmatter fix
14. `gifts-for-new-homeowners-2025.md` - Needs frontmatter fix

### 📋 Current Task Checklist
For each remaining post, verify and fix:
- [ ] Remove duplicate title (if exists)
- [ ] Fix frontmatter format (date → pubDate, image → heroImage, etc.)
- [ ] Add missing tags (if needed)
- [ ] Fix price range and Amazon link layout (same line)
- [ ] Quality check content structure

## Issues to Address

### 1. Affiliate Disclosure Alignment
**Problem:** The new affiliate disclosure text is not properly left-aligned with the title text.
**Solution:** 
- Ensure the affiliate disclosure container uses proper left alignment
- Remove any centering or padding that causes misalignment
- The disclosure should start at the same left edge as the title

### 2. Remove Old Affiliate Disclosures
**Problem:** Most posts still contain the old affiliate disclosure text within the post content.
**Solution:**
- Search for and remove: `*As an Amazon Associate, we earn from qualifying purchases. This post contains affiliate links, which means we may earn a commission if you click through and make a purchase, at no additional cost to you.*`
- This text should only appear in the template-generated disclosure at the top

### 3. Fix Duplicate Title/Intro Sections
**Problem:** Many posts have duplicate titles or introductory sections that conflict with the frontmatter.
**Solution:**
- Remove any duplicate titles that match the frontmatter title
- Remove redundant introductory paragraphs that duplicate the frontmatter description
- Keep only the main content that follows the proper structure
- Ensure the post starts directly with the main content or a proper introduction

### 4. Add Missing Tags/Keywords
**Problem:** Recent posts and some older posts are missing the tags/keywords section.
**Solution:**
- Ensure all posts have a `tags` array in their frontmatter
- Tags should be relevant to the post content and SEO
- Verify that tags display properly in the UI below the intro paragraph
- Add appropriate tags for any posts missing them

### 5. Price Range and Affiliate Link Layout
**Problem:** Price range and affiliate link need to be on the same line.
**Solution:**
- Ensure price range and Amazon link are on the same line
- Position them either directly above or below the description text
- Use proper CSS classes for consistent styling

### 6. Quality Check/Audit
**Problem:** Posts need general quality review and consistency improvements.
**Solution:**
- Review content quality and readability
- Check for proper heading structure (H2, H3, etc.)
- Ensure consistent formatting throughout
- Verify all links are working and properly formatted
- Check that price ranges and Amazon links are properly styled
- Ensure proper spacing and typography
- Review for any remaining formatting inconsistencies

## Cleanup Process

### Step 1: Audit All Posts
1. List all blog posts in `src/content/blog/`
2. Check each post for the 6 issues above
3. Create a checklist for each post

### Step 2: Fix Template Issues
1. Update the blog template to fix affiliate disclosure alignment
2. Ensure proper tag display
3. Verify consistent styling

### Step 3: Fix Individual Posts
1. Remove old affiliate disclosures
2. Remove duplicate titles/intros
3. Add missing tags to frontmatter
4. Quality check and format content

### Step 4: Verify and Test
1. Check that all posts render correctly
2. Verify affiliate disclosure alignment
3. Confirm tags display properly
4. Test on live site

## Post Structure Template

```markdown
---
title: "Post Title"
description: "Post description for SEO and display"
pubDate: "YYYY-MM-DD"
heroImage: "/images/blog/post-name/banner.webp"
ogImage: "/images/blog/post-name/og.webp"
socialImage: "/images/blog/post-name/social.webp"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
priceRange: "$X-$Y"
amazonLink: "https://www.amazon.com/s?k=search+terms&tag=brightgift-20"
---

[Main content starts here - no duplicate title or intro]
```

## Quality Standards

- **Consistency:** All posts should follow the same structure and formatting
- **SEO:** Proper meta tags, descriptions, and keywords
- **Readability:** Clear headings, proper spacing, good typography
- **Functionality:** Working links, proper affiliate disclosure
- **Completeness:** All required frontmatter fields present 