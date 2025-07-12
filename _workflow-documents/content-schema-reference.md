# Content Schema Reference

## Blog Post Frontmatter Schema

All blog posts must follow this exact frontmatter structure:

```yaml
---
title: "Human Readable Title"
slug: "kebab-case-slug-matching-filename"
image: "/images/blog/{slug}/{slug}-banner.webp"
ogImage: "/images/blog/{slug}/{slug}-og.webp"
socialImage: "/images/blog/{slug}/{slug}-social.webp"
category: "gift-guides"
description: "SEO description under 160 characters"
keywords: "comma, separated, keywords"
date: "YYYY-MM-DD"
status: "draft"
---
```

## File Naming Conventions

### Markdown Files
- **Location:** `src/content/blog/{slug}.md`
- **Naming:** Use kebab-case, descriptive, SEO-friendly
- **Example:** `special-birthday-gifts-for-lgbtq-youth.md`

### Image Files
- **Location:** `public/images/blog/{slug}/`
- **Required Images:**
  - `{slug}-banner.webp` (main banner image)
  - `{slug}-og.webp` (Open Graph image)
  - `{slug}-social.webp` (social media image)

## Validation Rules

1. **Slug Consistency:** The `slug` in frontmatter must match the filename (without .md)
2. **Image Paths:** All image paths must match actual file locations
3. **Required Fields:** All fields above are required
4. **Date Format:** Must be YYYY-MM-DD
5. **Status:** Must be "draft" or "published"

## GPT Assistant Instructions

When generating frontmatter, the GPT assistant should:
- Generate a descriptive title
- Create a kebab-case slug from the title
- Write a compelling description under 160 characters
- Include relevant keywords
- Set status to "draft"
- Use placeholder image paths that n8n will fill in

## n8n Workflow Responsibilities

The n8n workflow should:
- Validate the slug matches the filename
- Ensure all required frontmatter fields exist
- Generate and place images in the correct directory structure
- Update image paths in frontmatter to match actual file locations
- Commit files with descriptive commit messages 