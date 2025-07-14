import { z, defineCollection } from 'astro:content';

// Enhanced schema for SEO and affiliate optimization
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    date: z.string(),
    // SEO and meta fields
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    // Content categorization (from SEO Canvas)
    tags: z.array(z.string()).optional(), // recipient, interest, budget, occasion, tone
    category: z.enum(['gift-guide', 'seasonal', 'faq', 'tool-landing']).optional(),
    // Author and attribution
    author: z.string().optional(),
    // Affiliate and tracking
    affiliateLinks: z.array(z.object({
      text: z.string(),
      url: z.string(),
      platform: z.enum(['amazon', 'etsy', 'other']).optional(),
    })).optional(),
    // Social and Open Graph
    ogImage: z.string().optional(),
    twitterCard: z.string().optional(),
    // Content metadata
    readTime: z.number().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
    // Defensive: enforce valid slug
    slug: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  })
});



// Schema for FAQs
const faqs = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    question: z.string(),
    answer: z.string(),
    date: z.string(),
    // SEO fields
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    // Social fields
    ogImage: z.string().optional(),
    twitterCard: z.string().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
    // Defensive: enforce valid slug
    slug: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  })
});

export const collections = { blog, faqs }; 