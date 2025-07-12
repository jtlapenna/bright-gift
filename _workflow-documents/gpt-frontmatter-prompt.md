# GPT Frontmatter Generation Prompt

Use this prompt template when asking GPT to generate blog post frontmatter:

```
Generate frontmatter for a blog post about [TOPIC]. Follow this exact format and rules:

## Required Frontmatter Structure:
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

## Rules:
1. **Title**: Descriptive, SEO-friendly, under 60 characters
2. **Slug**: Convert title to kebab-case (lowercase, hyphens instead of spaces, no special chars)
3. **Image paths**: Use the exact format shown above with {slug} placeholder
4. **Description**: Compelling, under 160 characters, includes target keywords
5. **Keywords**: 5-8 relevant keywords, comma-separated
6. **Date**: Use today's date in YYYY-MM-DD format
7. **Status**: Always "draft" for new content
8. **Category**: Use "gift-guides" for gift-related content

## Example:
For a post about "Best Coffee Gifts for Coffee Lovers":
- Title: "Best Coffee Gifts for Coffee Lovers"
- Slug: "best-coffee-gifts-for-coffee-lovers"
- Image: "/images/blog/best-coffee-gifts-for-coffee-lovers/best-coffee-gifts-for-coffee-lovers-banner.webp"

Generate frontmatter for: [YOUR TOPIC HERE]
```

## Usage Notes:
- Copy this prompt and replace [TOPIC] and [YOUR TOPIC HERE] with the actual topic
- The n8n workflow will handle image generation and file placement
- Always validate the output matches the schema before using 