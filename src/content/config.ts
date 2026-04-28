import { z, defineCollection } from 'astro:content';

// Enhanced schema for SEO and affiliate optimization
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    date: z.union([z.string(), z.date()]).transform((val) => {
      if (val instanceof Date) {
        return val.toISOString().split('T')[0]; // Convert to YYYY-MM-DD string
      }
      return val;
    }),
    lastUpdated: z.union([z.string(), z.date()]).optional().transform((val) => {
      if (!val) return undefined;
      if (val instanceof Date) {
        return val.toISOString().split('T')[0]; // Convert to YYYY-MM-DD string
      }
      return val;
    }),
    // SEO and meta fields
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    faqSchema: z.any().optional(),
    keywords: z.union([z.array(z.string()), z.string(), z.null()]).optional().transform((val) => {
      if (val === null) return undefined;
      if (typeof val === 'string') {
        // Convert comma-separated string to array
        return val.split(',').map(k => k.trim()).filter(k => k.length > 0);
      }
      return val;
    }),
    // Content categorization (from SEO Canvas)
    tags: z.array(z.string()).optional(), // recipient, interest, budget, occasion, tone
    category: z.union([
      z.enum(['gift-guide', 'seasonal', 'faq', 'tool-landing']),
      z.string()
    ]).optional().transform((val) => {
      // Normalize category values
      if (val === 'gift-guides') return 'gift-guide';
      if (val === 'gift-guide') return 'gift-guide';
      return val;
    }),
    // Author and attribution
    author: z.string().optional(),
    // Affiliate and tracking
    affiliateLinks: z.array(z.object({
      text: z.string(),
      url: z.string(),
      platform: z.union([
        z.enum(['amazon', 'bookshop', 'other']),
        z.string()
      ]).optional().transform((val) => {
        // Normalize platform values
        if (val === 'afrofiliate') return 'other';
        if (val === 'amazon') return 'amazon';
        if (val === 'bookshop') return 'bookshop';
        return 'other'; // Default to 'other' for unknown platforms
      }),
    })).optional(),
    // Social and Open Graph
    ogImage: z.string().optional(),
    imageWidth: z.number().optional(),
    imageHeight: z.number().optional(),
    ogImageWidth: z.number().optional(),
    ogImageHeight: z.number().optional(),
    twitterCard: z.string().optional(),
    // Content metadata
    readTime: z.number().optional(),
    featured: z.union([z.boolean(), z.string()]).optional().transform((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    }),
    draft: z.union([z.boolean(), z.string()]).optional().transform((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    }),
    sitemap: z.union([z.boolean(), z.string()]).optional().transform((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    }),
  })
});

// Schema for gift guides (specific content type)
const giftGuides = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    date: z.union([z.string(), z.date()]).transform((val) => {
      if (val instanceof Date) {
        return val.toISOString().split('T')[0]; // Convert to YYYY-MM-DD string
      }
      return val;
    }),
    // Gift-specific fields
    recipient: z.string().optional(), // "tech-lovers", "plant-moms", etc.
    budget: z.string().optional(), // "under-25", "50-100", etc.
    occasion: z.string().optional(), // "christmas", "birthday", etc.
    style: z.string().optional(), // "handmade", "eco-friendly", etc.
    // SEO fields
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.union([z.array(z.string()), z.string(), z.null()]).optional().transform((val) => {
      if (val === null) return undefined;
      if (typeof val === 'string') {
        // Convert comma-separated string to array
        return val.split(',').map(k => k.trim()).filter(k => k.length > 0);
      }
      return val;
    }),
    tags: z.array(z.string()).optional(),
    // Affiliate fields
    affiliateLinks: z.array(z.object({
      text: z.string(),
      url: z.string(),
      platform: z.union([
        z.enum(['amazon', 'bookshop', 'other']),
        z.string()
      ]).optional().transform((val) => {
        // Normalize platform values
        if (val === 'afrofiliate') return 'other';
        if (val === 'amazon') return 'amazon';
        if (val === 'bookshop') return 'bookshop';
        return 'other'; // Default to 'other' for unknown platforms
      }),
    })).optional(),
    // Social fields
    ogImage: z.string().optional(),
    twitterCard: z.string().optional(),
    // Content metadata
    readTime: z.number().optional(),
    featured: z.union([z.boolean(), z.string()]).optional().transform((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    }),
    draft: z.union([z.boolean(), z.string()]).optional().transform((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    }),
  })
});

// Schema for FAQs
const faqs = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    question: z.string(),
    answer: z.string(),
    date: z.union([z.string(), z.date()]).transform((val) => {
      if (val instanceof Date) {
        return val.toISOString().split('T')[0]; // Convert to YYYY-MM-DD string
      }
      return val;
    }),
    // SEO fields
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.union([z.array(z.string()), z.string(), z.null()]).optional().transform((val) => {
      if (val === null) return undefined;
      if (typeof val === 'string') {
        // Convert comma-separated string to array
        return val.split(',').map(k => k.trim()).filter(k => k.length > 0);
      }
      return val;
    }),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    // Social fields
    ogImage: z.string().optional(),
    twitterCard: z.string().optional(),
    featured: z.union([z.boolean(), z.string()]).optional().transform((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    }),
    draft: z.union([z.boolean(), z.string()]).optional().transform((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true';
      }
      return val;
    }),
  })
});

export const collections = { blog, 'gift-guides': giftGuides, faqs }; 
