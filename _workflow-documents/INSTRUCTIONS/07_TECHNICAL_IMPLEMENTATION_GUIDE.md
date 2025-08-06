# BrightGift Technical Implementation Guide

## 📋 **Overview**

This is the single source of truth for all technical implementation details, API specifications, and development guidelines for BrightGift. It consolidates all technical information into one comprehensive guide.

**Tech Stack:** Astro, TypeScript, Tailwind CSS, OpenAI API, Cloudflare Pages
**Architecture:** Static site generation with dynamic API routes
**Goal:** Maintainable, performant, and scalable gift recommendation platform

---

## 🏗️ **Architecture Overview**

### **Core Technologies**
- **Frontend:** Astro with TypeScript
- **Styling:** Tailwind CSS
- **Content:** Astro Content Collections (Markdown + YAML frontmatter)
- **API:** Astro API routes (`src/pages/api/`)
- **AI Integration:** OpenAI GPT-4 API
- **Hosting:** Cloudflare Pages
- **Images:** WebP format, optimized for performance

### **Project Structure**
```
src/
├── components/          # Reusable UI components
├── content/            # Content collections (blog posts)
├── layouts/            # Page layout templates
├── pages/              # Routes and API endpoints
│   ├── api/            # API routes
│   ├── blog/           # Blog pages
│   └── index.astro     # Homepage
├── styles/             # Global styles
└── utils/              # Utility functions

public/
├── images/             # Static images
│   └── blog/           # Blog post images
└── _redirects          # Cloudflare redirects
```

---

## 🔧 **Core API Implementation**

### **Gift Generation API (`/api/generate.ts`)**

#### **Endpoint:** `POST /api/generate`

#### **Request Format:**
```typescript
interface GenerateRequest {
  recipient: string;
  budget: string;
  occasion: string;
  interests: string;
  style: string;
  customPrompt?: string;
}
```

#### **Response Format:**
```typescript
interface GenerateResponse {
  ideas: GiftIdea[];
  requestId: string;
  timestamp: string;
}

interface GiftIdea {
  title: string;
  description: string;
  tag: string;
  link: string;
  icon: string;
  platform: 'amazon' | 'bookshop' | 'afrofiliate';
}
```

#### **Implementation Details:**
```typescript
// Environment Variables Required
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
const AMAZON_AFFILIATE_ID = 'bright-gift-20';
const BOOKSHOP_AFFILIATE_ID = 'brightgift';

// Affiliate Link Generation
function generateAmazonLink(keywords: string): string {
  const searchQuery = encodeURIComponent(keywords);
  return `https://www.amazon.com/s?k=${searchQuery}&tag=${AMAZON_AFFILIATE_ID}`;
}

function generateBookshopLink(keywords: string): string {
  const searchQuery = encodeURIComponent(keywords);
  return `https://bookshop.org/search?keywords=${searchQuery}&affiliate=${BOOKSHOP_AFFILIATE_ID}`;
}

function generateAfrofiliateLink(brandCode: string): string {
  return `https://www.arjdj2msd.com/7LKLK3/${brandCode}/`;
}
```

### **Afrofiliate Brand Integration**

#### **Brand Code Mapping:**
```typescript
const afrofiliateBrands = {
  'beautystat': 'QWRG9C',
  'kadalys': 'RC9DWS',
  'furi-sport': 'R2Z4H6',
  'be-yourself-314': '24BMB4P',
  'be-rooted': 'R74QP1',
  'endorf': '24D26TB',
  'caribe-coffee': '24R58Q6',
  'cashblack-uk': '2CTPL1',
  'cashblack-us': 'M823SF'
};
```

#### **Smart Routing Logic:**
```typescript
function determineAffiliateSource(giftTitle: string, interests: string): string {
  // Check for book-related items
  if (/book|reading|literature|novel|author/i.test(giftTitle)) {
    return 'bookshop';
  }
  
  // Check for Afrofiliate brand matches
  const brandMatch = checkAfrofiliateBrand(giftTitle, interests);
  if (brandMatch) {
    return 'afrofiliate';
  }
  
  // Default to Amazon
  return 'amazon';
}
```

---

## 📝 **Content Management System**

### **Astro Content Collections Configuration**

#### **Content Schema (`src/content/config.ts`):**
```typescript
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Required fields
    title: z.string(),
    description: z.string(),
    date: z.date(),
    status: z.enum(['draft', 'published', 'archived']),
    
    // SEO fields
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(160),
    keywords: z.array(z.string()),
    
    // Images
    image: z.string(),
    ogImage: z.string(),
    socialImage: z.string(),
    
    // Optional fields
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    readTime: z.number().optional(),
    featured: z.boolean().optional(),
    
    // Affiliate tracking
    affiliateLinks: z.array(z.object({
      text: z.string(),
      url: z.string(),
      platform: z.enum(['amazon', 'bookshop', 'afrofiliate']).optional(),
      brand: z.string().optional()
    })).optional()
  })
});

export const collections = {
  'blog': blogCollection
};
```

### **Dynamic Routing Implementation**

#### **Blog Index (`src/pages/blog/index.astro`):**
```astro
---
import { getCollection } from 'astro:content';

const allPosts = await getCollection('blog', ({ data }) => {
  return data.status === 'published';
});

const sortedPosts = allPosts.sort((a, b) => 
  new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
);
---
```

#### **Individual Post (`src/pages/blog/[...slug].astro`):**
```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post }
  }));
}

type Props = {
  post: CollectionEntry<'blog'>;
};

const { post } = Astro.props;
const { Content } = await post.render();
---
```

---

## 🎨 **Styling and UI Implementation**

### **Tailwind CSS Configuration**

#### **Custom Colors (`tailwind.config.mjs`):**
```javascript
// ⚠️ CONFLICT: Multiple color specifications exist - needs resolution
export default {
  theme: {
    extend: {
      colors: {
        // Image/Visual Colors (from image prompts)
        'bright-teal': '#00A99D',
        'bright-coral': '#FF6B35', 
        'bright-yellow': '#FFD700',
        
        // UI Colors (from style guide) - CONFLICTS with above
        'bright-coral-ui': '#FF6B6B',
        'bright-yellow-ui': '#FFDE59',
        
        // Shared Colors
        'bright-blue': '#1C2E4A',
        'bright-light-teal': '#A3E4DB',
        'bright-gray': '#333333'
      },
      fontFamily: {
        'pacifico': ['Pacifico', 'cursive'],
        'poppins': ['Poppins', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif']
      }
    }
  }
}
```

### **Component Architecture**

#### **Gift Card Component:**
```astro
---
interface Props {
  title: string;
  description: string;
  link: string;
  icon: string;
  platform: 'amazon' | 'bookshop' | 'afrofiliate';
}

const { title, description, link, icon, platform } = Astro.props;

const platformStyles = {
  amazon: 'amazon-link',
  bookshop: 'bookshop-link',
  afrofiliate: 'afrofiliate-link'
};

const platformText = {
  amazon: 'View on Amazon',
  bookshop: 'View on Bookshop.org',
  afrofiliate: 'Shop Brand'
};
---

<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <div class="flex items-start space-x-4">
    <div class="text-2xl">{icon}</div>
    <div class="flex-1">
      <h3 class="font-semibold text-bright-blue mb-2">{title}</h3>
      <p class="text-gray-600 mb-4">{description}</p>
      <a 
        href={link} 
        class={`${platformStyles[platform]} inline-block bg-bright-coral text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors`}
        target="_blank" 
        rel="noopener"
      >
        {platformText[platform]}
      </a>
    </div>
  </div>
</div>
```

---

## 🔍 **SEO Implementation**

### **Meta Tags Component**

#### **SEO Component (`src/components/SEO.astro`):**
```astro
---
interface Props {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalURL?: string;
}

const { title, description, keywords = [], ogImage, canonicalURL } = Astro.props;
const fullTitle = title.includes('BrightGift') ? title : `${title} | BrightGift`;
---

<head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
  
  <!-- Open Graph -->
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  {ogImage && <meta property="og:image" content={ogImage} />}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  {ogImage && <meta name="twitter:image" content={ogImage} />}
  
  <!-- Canonical URL -->
  {canonicalURL && <link rel="canonical" href={canonicalURL} />}
</head>
```

### **Sitemap Generation (`src/pages/sitemap.xml.ts`)**

```typescript
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  try {
    const posts = await getCollection('blog', ({ data }) => {
      return data.status === 'published';
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${site}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${site}blog</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
      ${posts.map(post => `
      <url>
        <loc>${site}blog/${post.slug}</loc>
        <lastmod>${new Date(post.data.date).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>`).join('')}
    </urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};
```

---

## 🚀 **Performance Optimization**

### **Image Optimization**

#### **Image Processing Guidelines:**
- **Format:** WebP for all images
- **Sizes:** Multiple sizes for responsive images
- **Compression:** Optimize for web without quality loss
- **Loading:** Lazy loading for non-critical images

#### **Responsive Image Component:**
```astro
---
interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: 'lazy' | 'eager';
}

const { src, alt, width, height, loading = 'lazy' } = Astro.props;
---

<img 
  src={src}
  alt={alt}
  width={width}
  height={height}
  loading={loading}
  class="w-full h-auto"
/>
```

### **Core Web Vitals Optimization**

#### **Performance Targets:**
- **Largest Contentful Paint (LCP):** < 2.5 seconds
- **First Input Delay (FID):** < 100 milliseconds
- **Cumulative Layout Shift (CLS):** < 0.1

#### **Optimization Strategies:**
- **Critical CSS:** Inline critical styles
- **JavaScript:** Minimize and defer non-critical scripts
- **Images:** Proper sizing and lazy loading
- **Fonts:** Preload critical fonts

---

## 🔒 **Security Implementation**

### **Environment Variables**

#### **Required Environment Variables:**
```bash
# OpenAI API
OPENAI_API_KEY=sk-...

# Affiliate IDs
AMAZON_AFFILIATE_ID=bright-gift-20
BOOKSHOP_AFFILIATE_ID=brightgift

# Analytics (if used)
GOOGLE_ANALYTICS_ID=G-...
```

### **API Security**

#### **Rate Limiting:**
```typescript
const rateLimiter = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;
  
  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const limit = rateLimiter.get(ip);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + windowMs;
    return true;
  }
  
  if (limit.count >= maxRequests) {
    return false;
  }
  
  limit.count++;
  return true;
}
```

#### **Input Validation:**
```typescript
function validateGenerateRequest(body: any): GenerateRequest | null {
  if (!body || typeof body !== 'object') return null;
  
  const { recipient, budget, occasion, interests, style } = body;
  
  if (!recipient || !budget || !occasion || !interests || !style) {
    return null;
  }
  
  // Sanitize inputs
  return {
    recipient: String(recipient).slice(0, 100),
    budget: String(budget).slice(0, 50),
    occasion: String(occasion).slice(0, 50),
    interests: String(interests).slice(0, 200),
    style: String(style).slice(0, 50),
    customPrompt: body.customPrompt ? String(body.customPrompt).slice(0, 500) : undefined
  };
}
```

---

## 📊 **Analytics and Monitoring**

### **Error Handling**

#### **API Error Response Format:**
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  requestId: string;
  timestamp: string;
}

function createErrorResponse(error: string, message: string): Response {
  const errorResponse: ErrorResponse = {
    error,
    message,
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(errorResponse), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### **Logging Implementation**

#### **Request Logging:**
```typescript
function logRequest(request: Request, response: Response, duration: number) {
  const logData = {
    method: request.method,
    url: request.url,
    status: response.status,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent')
  };
  
  console.log(JSON.stringify(logData));
}
```

---

## 🚀 **Deployment Configuration**

### **Cloudflare Pages Configuration**

#### **Build Settings:**
```bash
# Build command
npm run build

# Build output directory
dist

# Root directory
/

# Environment variables
OPENAI_API_KEY=<secret>
AMAZON_AFFILIATE_ID=bright-gift-20
BOOKSHOP_AFFILIATE_ID=brightgift
```

#### **Redirects (`public/_redirects`):**
```
# Redirect trailing slashes
/blog/*/ /blog/:splat 301

# API redirects if needed
/api/* /.netlify/functions/:splat 200
```

### **Build Optimization**

#### **Astro Configuration (`astro.config.mjs`):**
```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom']
          }
        }
      }
    }
  }
});
```

---

## 📋 **Development Workflow**

### **Local Development Setup**

#### **Prerequisites:**
```bash
# Node.js 18+
node --version

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Add your API keys to .env.local
```

#### **Development Commands:**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Linting
npm run lint
```

### **Content Creation Workflow**

#### **Adding New Blog Posts:**
1. Create markdown file in `src/content/blog/`
2. Add complete frontmatter with all required fields
3. Write content following style guide
4. Generate and add images to `public/images/blog/[slug]/`
5. Test locally with `npm run dev`
6. Commit and deploy

#### **Image Generation Workflow:**
1. Use image prompts from branding guide
2. Generate banner (1536×1024), OG (1200×630), and social (1200×1200) images
3. Optimize to WebP format
4. Place in correct directory structure
5. Update frontmatter with image paths

---

## 🔧 **Troubleshooting Guide**

### **Common Issues**

#### **OpenAI API Errors:**
```typescript
// Handle API rate limits
if (error.status === 429) {
  return createErrorResponse('rate_limit', 'Too many requests. Please try again later.');
}

// Handle API key issues
if (error.status === 401) {
  return createErrorResponse('auth_error', 'API authentication failed.');
}
```

#### **Build Errors:**
- **Missing images:** Verify all image paths in frontmatter exist
- **Invalid frontmatter:** Check schema validation in content config
- **TypeScript errors:** Run `npm run check` for detailed error information

#### **Performance Issues:**
- **Slow loading:** Optimize images and check bundle size
- **High CLS:** Ensure proper image dimensions are specified
- **JavaScript errors:** Check browser console for client-side issues

---

*This is the single source of truth for all BrightGift technical implementation and development guidelines.*