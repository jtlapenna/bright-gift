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
      platform: z.enum(['amazon', 'bookshop', 'other']).optional(),
    })).optional(),
    // Social and Open Graph
    ogImage: z.string().optional(),
    twitterCard: z.string().optional(),
    // Content metadata
    readTime: z.number().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  })
});

// Schema for gift guides (specific content type)
const giftGuides = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    date: z.string(),
    // Gift-specific fields
    recipient: z.string().optional(), // "tech-lovers", "plant-moms", etc.
    budget: z.string().optional(), // "under-25", "50-100", etc.
    occasion: z.string().optional(), // "christmas", "birthday", etc.
    style: z.string().optional(), // "handmade", "eco-friendly", etc.
    // SEO fields
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    // Affiliate fields
    affiliateLinks: z.array(z.object({
      text: z.string(),
      url: z.string(),
      platform: z.enum(['amazon', 'bookshop', 'other']).optional(),
    })).optional(),
    // Social fields
    ogImage: z.string().optional(),
    twitterCard: z.string().optional(),
    // Content metadata
    readTime: z.number().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
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
  })
});

export const collections = { blog, 'gift-guides': giftGuides, faqs }; 