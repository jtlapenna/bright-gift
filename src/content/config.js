"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collections = void 0;
const astro_content_1 = require("astro:content");
// Enhanced schema for SEO and affiliate optimization
const blog = (0, astro_content_1.defineCollection)({
    schema: astro_content_1.z.object({
        title: astro_content_1.z.string(),
        description: astro_content_1.z.string(),
        image: astro_content_1.z.string(),
        date: astro_content_1.z.string(),
        // SEO and meta fields
        metaTitle: astro_content_1.z.string().optional(),
        metaDescription: astro_content_1.z.string().optional(),
        keywords: astro_content_1.z.array(astro_content_1.z.string()).optional(),
        // Content categorization (from SEO Canvas)
        tags: astro_content_1.z.array(astro_content_1.z.string()).optional(), // recipient, interest, budget, occasion, tone
        category: astro_content_1.z.enum(['gift-guide', 'seasonal', 'faq', 'tool-landing']).optional(),
        // Author and attribution
        author: astro_content_1.z.string().optional(),
        // Affiliate and tracking
        affiliateLinks: astro_content_1.z.array(astro_content_1.z.object({
            text: astro_content_1.z.string(),
            url: astro_content_1.z.string(),
            platform: astro_content_1.z.enum(['amazon', 'etsy', 'other']).optional(),
        })).optional(),
        // Social and Open Graph
        ogImage: astro_content_1.z.string().optional(),
        twitterCard: astro_content_1.z.string().optional(),
        // Content metadata
        readTime: astro_content_1.z.number().optional(),
        featured: astro_content_1.z.boolean().optional(),
        draft: astro_content_1.z.boolean().optional(),
    })
});
// Schema for gift guides (specific content type)
const giftGuides = (0, astro_content_1.defineCollection)({
    schema: astro_content_1.z.object({
        title: astro_content_1.z.string(),
        description: astro_content_1.z.string(),
        image: astro_content_1.z.string(),
        date: astro_content_1.z.string(),
        // Gift-specific fields
        recipient: astro_content_1.z.string().optional(), // "tech-lovers", "plant-moms", etc.
        budget: astro_content_1.z.string().optional(), // "under-25", "50-100", etc.
        occasion: astro_content_1.z.string().optional(), // "christmas", "birthday", etc.
        style: astro_content_1.z.string().optional(), // "handmade", "eco-friendly", etc.
        // SEO fields
        metaTitle: astro_content_1.z.string().optional(),
        metaDescription: astro_content_1.z.string().optional(),
        keywords: astro_content_1.z.array(astro_content_1.z.string()).optional(),
        tags: astro_content_1.z.array(astro_content_1.z.string()).optional(),
        // Affiliate fields
        affiliateLinks: astro_content_1.z.array(astro_content_1.z.object({
            text: astro_content_1.z.string(),
            url: astro_content_1.z.string(),
            platform: astro_content_1.z.enum(['amazon', 'etsy', 'other']).optional(),
        })).optional(),
        // Social fields
        ogImage: astro_content_1.z.string().optional(),
        twitterCard: astro_content_1.z.string().optional(),
        // Content metadata
        readTime: astro_content_1.z.number().optional(),
        featured: astro_content_1.z.boolean().optional(),
        draft: astro_content_1.z.boolean().optional(),
    })
});
// Schema for FAQs
const faqs = (0, astro_content_1.defineCollection)({
    schema: astro_content_1.z.object({
        title: astro_content_1.z.string(),
        description: astro_content_1.z.string(),
        question: astro_content_1.z.string(),
        answer: astro_content_1.z.string(),
        date: astro_content_1.z.string(),
        // SEO fields
        metaTitle: astro_content_1.z.string().optional(),
        metaDescription: astro_content_1.z.string().optional(),
        keywords: astro_content_1.z.array(astro_content_1.z.string()).optional(),
        tags: astro_content_1.z.array(astro_content_1.z.string()).optional(),
        category: astro_content_1.z.string().optional(),
        // Social fields
        ogImage: astro_content_1.z.string().optional(),
        twitterCard: astro_content_1.z.string().optional(),
        featured: astro_content_1.z.boolean().optional(),
        draft: astro_content_1.z.boolean().optional(),
    })
});
exports.collections = { blog, 'gift-guides': giftGuides, faqs };
