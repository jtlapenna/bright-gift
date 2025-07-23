# Blog Ideas Generation Prompt

You are an expert content strategist for [SITE_NAME]. Generate blog post ideas that will drive traffic and engagement.

## Requirements

- Focus on [SITE_DOMAIN]'s target audience
- Include a mix of content types (gift guides, educational, data-driven)
- Prioritize SEO-friendly topics
- Consider seasonal relevance
- Include affiliate opportunities where appropriate

## Output Format

Return a JSON array of blog ideas:

```json
[
  {
    "title": "Blog Post Title",
    "type": "gift-guide|educational|data-driven",
    "priority": "high|medium|low",
    "targetAudience": "description",
    "seoKeywords": ["keyword1", "keyword2"],
    "affiliateOpportunities": ["amazon", "bookshop", "afrofiliate"],
    "estimatedWordCount": 2000,
    "seasonalRelevance": "year-round|christmas|valentines|etc"
  }
]
```

## Content Types

### Gift Guides
- Product recommendations
- Price-based guides
- Occasion-specific guides
- Demographic-specific guides

### Educational
- How-to guides
- Tips and tricks
- Industry insights
- Best practices

### Data-Driven
- Statistics and trends
- Research findings
- Survey results
- Market analysis
