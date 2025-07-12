# GPT Frontmatter Generation Prompt (FIXED)

Use this prompt template when asking GPT to generate blog post frontmatter:

```
Generate frontmatter for a blog post about [TOPIC]. Follow this exact format and rules:

## Required Frontmatter Structure:
```yaml
---
title: "Human Readable Title"
description: "SEO description under 160 characters"
keywords: "comma, separated, keywords"
---
```

## IMPORTANT RULES:
1. **Title**: Descriptive, SEO-friendly, under 60 characters
2. **Description**: Compelling, under 160 characters, includes target keywords
3. **Keywords**: 5-8 relevant keywords, comma-separated
4. **DO NOT generate**: slug, image paths, category, date, or status - n8n will handle these automatically

## What n8n Will Add Automatically:
- **slug**: Generated from title (kebab-case)
- **image**: `/images/blog/{slug}/{slug}-banner.webp`
- **ogImage**: `/images/blog/{slug}/{slug}-og.webp`
- **socialImage**: `/images/blog/{slug}/{slug}-social.webp`
- **category**: "gift-guides"
- **date**: Today's date (YYYY-MM-DD)
- **status**: "draft"

## Example:
For a post about "Best Coffee Gifts for Coffee Lovers":

**You provide:**
```yaml
---
title: "Best Coffee Gifts for Coffee Lovers"
description: "Discover thoughtful coffee gifts for the coffee lover in your life. From artisanal beans to premium brewing equipment."
keywords: "coffee gifts, gifts for coffee lovers, coffee accessories, coffee beans, coffee maker gifts"
---
```

**n8n will automatically add:**
- slug: "best-coffee-gifts-for-coffee-lovers"
- image: "/images/blog/best-coffee-gifts-for-coffee-lovers/best-coffee-gifts-for-coffee-lovers-banner.webp"
- etc.

Generate frontmatter for: [YOUR TOPIC HERE]
```

## Why This Prevents Broken Images:
- GPT doesn't generate slugs or image paths
- n8n generates consistent slugs from titles
- n8n creates correct directory structure
- n8n ensures image paths match actual file locations
- No conflicts between GPT and n8n naming 