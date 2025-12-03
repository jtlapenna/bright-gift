# Agent Requested Files for Redirect Loop Fix

**Date:** January 15, 2025  
**Purpose:** Complete file collection for external agent to fix infinite redirect loops  
**Status:** Ready for agent analysis and solution implementation

---

## 🎯 **PROBLEM SUMMARY**

The `/privacy` and `/terms` pages are experiencing infinite redirect loops:
- **308 redirect:** `/privacy` → `/privacy/` (from Cloudflare Pages)
- **301 redirect:** `/privacy/` → `/privacy` (from unknown source)
- **Result:** Infinite loop preventing page access

**Root Cause Theory:** Trailing-slash ping-pong between Cloudflare's automatic 308 redirects and Astro's `trailingSlash: 'never'` configuration.

---

## 📁 **REQUESTED FILES**

### **1. astro.config.mjs (Complete File)**

```javascript
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://bright-gift.com',
  trailingSlash: 'never',
  output: 'server',
  // Use cookie-based sessions to avoid requiring a Cloudflare KV binding
  session: {
    driver: 'cookie'
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: false
    },
    // Ensure no implicit KV binding attempts
    sessionKVBindingName: 'DISABLED',
    // Exclude robots.txt and sitemap.xml from Workers processing
    // This allows them to be served as static files
    routes: {
      exclude: ['/robots.txt', '/sitemap.xml', '/api/*', '/blog', '/blog/*', '/category/*', '/privacy', '/terms', '/data-deletion', '/oauth/callback']
    }
  }),
  integrations: [tailwind()],
  markdown: {
    // Allow HTML in markdown content
    html: true,
    // Disable syntax highlighting to prevent HTML from being treated as code
    syntaxHighlight: false
  },
  vite: {
    ssr: {
      noExternal: ['marked']
    }
  },
  publicDir: 'public', // Add this line to ensure public/ folder is copied to build output
});
```

### **2. src/pages/privacy.astro (Complete File)**

```astro
---
import Layout from '../layouts/Layout.astro';
export const prerender = true;
title: "Privacy Policy - BrightGift"
description: "Learn how BrightGift collects, uses, and protects your personal information."
---

<Layout title="Privacy Policy - BrightGift">
	<main class="min-h-screen bg-[#FFF9F3]">
		<div class="max-w-4xl mx-auto px-4 py-16">
			<h1 class="text-4xl font-bold text-[#1C2E4A] mb-8 text-center">Privacy Policy</h1>
			
			<div class="bg-white rounded-lg shadow-lg p-8 space-y-6">
				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Introduction</h2>
					<p class="text-gray-700 leading-relaxed">
						BrightGift ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered gift recommendation service.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Information We Collect</h2>
					<div class="space-y-4">
						<div>
							<h3 class="text-lg font-medium text-[#1C2E4A] mb-2">Information You Provide</h3>
							<ul class="list-disc list-inside text-gray-700 space-y-1 ml-4">
								<li>Recipient information (name, interests, preferences)</li>
								<li>Budget information</li>
								<li>Gift occasion details</li>
								<li>Style preferences and categories</li>
							</ul>
						</div>
						<div>
							<h3 class="text-lg font-medium text-[#1C2E4A] mb-2">Automatically Collected Information</h3>
							<ul class="list-disc list-inside text-gray-700 space-y-1 ml-4">
								<li>IP address and device information</li>
								<li>Browser type and version</li>
								<li>Pages visited and time spent</li>
								<li>Referring website information</li>
							</ul>
						</div>
					</div>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">How We Use Your Information</h2>
					<p class="text-gray-700 leading-relaxed mb-4">
						We use the information we collect to:
					</p>
					<ul class="list-disc list-inside text-gray-700 space-y-1 ml-4">
						<li>Generate personalized gift recommendations</li>
						<li>Improve our AI algorithms and service quality</li>
						<li>Provide customer support and respond to inquiries</li>
						<li>Analyze website usage and optimize user experience</li>
						<li>Send relevant content and updates (with your consent)</li>
					</ul>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Information Sharing</h2>
					<p class="text-gray-700 leading-relaxed">
						We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with:
					</p>
					<ul class="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-4">
						<li>Service providers who assist in our operations</li>
						<li>Legal authorities when required by law</li>
						<li>Business partners with your explicit consent</li>
					</ul>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Data Security</h2>
					<p class="text-gray-700 leading-relaxed">
						We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Cookies and Tracking</h2>
					<p class="text-gray-700 leading-relaxed">
						We use cookies and similar technologies to enhance your experience, analyze site usage, and provide personalized content. You can control cookie settings through your browser preferences.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Third-Party Links</h2>
					<p class="text-gray-700 leading-relaxed">
						Our website may contain links to third-party websites, including affiliate links to Amazon. We are not responsible for the privacy practices of these external sites.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Your Rights</h2>
					<p class="text-gray-700 leading-relaxed mb-4">
						You have the right to:
					</p>
					<ul class="list-disc list-inside text-gray-700 space-y-1 ml-4">
						<li>Access your personal information</li>
						<li>Correct inaccurate information</li>
						<li>Request deletion of your data</li>
						<li>Opt-out of marketing communications</li>
						<li>Withdraw consent at any time</li>
					</ul>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Children's Privacy</h2>
					<p class="text-gray-700 leading-relaxed">
						Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Changes to This Policy</h2>
					<p class="text-gray-700 leading-relaxed">
						We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Contact Us</h2>
					<p class="text-gray-700 leading-relaxed">
						If you have questions about this Privacy Policy or our data practices, please reach out via our <a href="/contact" class="text-blue-600 underline">contact form</a>.
					</p>
					<div class="mt-4 p-4 bg-gray-50 rounded-lg">
						<p class="text-gray-700">
							<strong>Website:</strong> https://bright-gift.com/
						</p>
					</div>
				</div>

				<div class="border-t pt-6">
					<p class="text-sm text-gray-500 text-center">
						Last Updated: {new Date().toLocaleDateString()}
					</p>
				</div>
			</div>
		</div>
	</main>
</Layout>
```

### **3. src/pages/terms.astro (Complete File)**

```astro
---
import Layout from '../layouts/Layout.astro';
export const prerender = true;
title: "Terms of Service - BrightGift"
description: "Read our terms of service for using BrightGift's AI-powered gift recommendation service."
---

<Layout title="Terms of Service - BrightGift">
	<main class="min-h-screen bg-[#FFF9F3]">
		<div class="max-w-4xl mx-auto px-4 py-16">
			<h1 class="text-4xl font-bold text-[#1C2E4A] mb-8 text-center">Terms of Service</h1>
			
			<div class="bg-white rounded-lg shadow-lg p-8 space-y-6">
				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Agreement to Terms</h2>
					<p class="text-gray-700 leading-relaxed">
						By accessing and using BrightGift ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Description of Service</h2>
					<p class="text-gray-700 leading-relaxed">
						BrightGift is an AI-powered gift recommendation service that provides personalized gift suggestions based on user-provided information about recipients, including their interests, preferences, and budget constraints.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">User Responsibilities</h2>
					<p class="text-gray-700 leading-relaxed mb-4">
						As a user of our service, you agree to:
					</p>
					<ul class="list-disc list-inside text-gray-700 space-y-1 ml-4">
						<li>Provide accurate and truthful information</li>
						<li>Use the service for lawful purposes only</li>
						<li>Not attempt to reverse engineer or hack our systems</li>
						<li>Respect intellectual property rights</li>
						<li>Not use the service to spam or harass others</li>
					</ul>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Intellectual Property</h2>
					<p class="text-gray-700 leading-relaxed">
						The content, features, and functionality of BrightGift are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Affiliate Disclosure</h2>
					<p class="text-gray-700 leading-relaxed">
						BrightGift participates in various affiliate marketing programs, including the Amazon Associates Program. This means we may earn commissions from qualifying purchases made through links on our website. This does not affect the price you pay for products.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Disclaimers</h2>
					<div class="space-y-4">
						<div>
							<h3 class="text-lg font-medium text-[#1C2E4A] mb-2">Service Availability</h3>
							<p class="text-gray-700 leading-relaxed">
								We strive to maintain service availability but cannot guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the service at any time.
							</p>
						</div>
						<div>
							<h3 class="text-lg font-medium text-[#1C2E4A] mb-2">Recommendation Accuracy</h3>
							<p class="text-gray-700 leading-relaxed">
								While we use AI to provide personalized recommendations, we cannot guarantee the suitability or availability of suggested gifts. Users should exercise their own judgment when making purchasing decisions.
							</p>
						</div>
						<div>
							<h3 class="text-lg font-medium text-[#1C2E4A] mb-2">Third-Party Products</h3>
							<p class="text-gray-700 leading-relaxed">
								We are not responsible for the quality, safety, or availability of products sold by third-party retailers. All purchases are subject to the terms and conditions of the respective retailers.
							</p>
						</div>
					</div>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Limitation of Liability</h2>
					<p class="text-gray-700 leading-relaxed">
						In no event shall BrightGift be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Indemnification</h2>
					<p class="text-gray-700 leading-relaxed">
						You agree to defend, indemnify, and hold harmless BrightGift from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the service or violation of these terms.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Governing Law</h2>
					<p class="text-gray-700 leading-relaxed">
						These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which BrightGift operates, without regard to its conflict of law provisions.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Changes to Terms</h2>
					<p class="text-gray-700 leading-relaxed">
						We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
					</p>
				</div>

				<div>
					<h2 class="text-2xl font-semibold text-[#1C2E4A] mb-4">Contact Information</h2>
					<p class="text-gray-700 leading-relaxed">
						If you have any questions about these Terms of Service, please reach out via our <a href="/contact" class="text-blue-600 underline">contact form</a>.
					</p>
					<div class="mt-4 p-4 bg-gray-50 rounded-lg">
						<p class="text-gray-700">
							<strong>Website:</strong> https://bright-gift.com/
						</p>
					</div>
				</div>

				<div class="border-t pt-6">
					<p class="text-sm text-gray-500 text-center">
						Last Updated: {new Date().toLocaleDateString()}
					</p>
				</div>
			</div>
		</div>
	</main>
</Layout>
```

### **4. public/_redirects (Complete File)**

```
# Cloudflare Pages redirects file
# Redirect trailing slash URLs to non-trailing slash URLs for consistency

# Static pages - let Cloudflare handle trailing slashes naturally

# Blog index - handled by Astro trailingSlash: 'never' configuration

# Category pages - handled by Astro trailingSlash: 'never' configuration

# General category redirect (no general category page exists)
/category/ /category/gift-guides 301

# Category redirects (old categories to new ones)
/category/data-driven /category/gift-tips 301
/category/educational /category/gift-tips 301

# OAuth callback - redirect from trailing slash to non-trailing slash
/oauth/callback/ /oauth/callback 301

# Care-calculator - handled by Astro page

# Blog posts - handled by Astro trailingSlash: 'never' configuration
```

### **5. public/_headers (Complete File)**

```
/*
  # Security headers for SEO and security
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  
  # SEO-friendly headers
  X-Robots-Tag: index, follow
  
  # Performance headers
  X-DNS-Prefetch-Control: on
```

### **6. src/middleware.ts (Complete File)**

```typescript
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = (context, next) => {
  const url = new URL(context.request.url);
  
  // Only handle GET requests
  if (context.request.method !== 'GET') {
    return next();
  }
  
  // Skip redirects for:
  // - Root path (/)
  // - Files with extensions (.html, .css, .js, .png, etc.)
  // - API routes (CRITICAL: Don't redirect API endpoints)
  // - Static assets
  // - Static directories (like care-calculator)
  // - Blog posts and category pages (to prevent GSC validation failures)
  if (
    url.pathname === '/' ||
    url.pathname.includes('.') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/placeholders/') ||
    url.pathname.startsWith('/care-calculator') ||
    url.pathname.startsWith('/blog/') ||
    url.pathname.startsWith('/category/') ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/sitemap.xml' ||
    url.pathname === '/favicon.svg'
  ) {
    return next();
  }
  
  // With trailingSlash: 'never', no redirects needed
  // All URLs should work without trailing slashes
  
  return next();
};
```

### **7. public/robots.txt (Complete File)**

```
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://bright-gift.com/sitemap.xml

# Crawl delay (reduced for faster indexing)
Crawl-delay: 0

# Allow all search engines to crawl the site
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 0

User-agent: Slurp
Allow: /
Crawl-delay: 0

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 0

User-agent: Baiduspider
Allow: /
Crawl-delay: 0

User-agent: YandexBot
Allow: /
Crawl-delay: 0

# Block access to admin areas (if any exist in future)
Disallow: /admin/
Disallow: /private/
Disallow: /temp/

# Block access to placeholder images (social media only, not for SEO)
Disallow: /placeholders/
Disallow: /social-assets/

# Block Cloudflare email protection (not for SEO)
Disallow: /cdn-cgi/

# Force reindexing hints
# Last updated: 2025-09-12T16:38:54.081Z

# Blog pagination pages - encourage indexing
User-agent: Googlebot
Allow: /blog/?page=*
Crawl-delay: 0

User-agent: *
Allow: /blog/?page=*
```

### **8. public/sitemap.xml (Complete File - First 50 URLs)**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bright-gift.com/</loc>
    <lastmod>2025-10-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://bright-gift.com/blog</loc>
    <lastmod>2025-10-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://bright-gift.com/category/gift-guides</loc>
    <lastmod>2025-10-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://bright-gift.com/category/gift-tips</loc>
    <lastmod>2025-10-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://bright-gift.com/privacy</loc>
    <lastmod>2025-10-16</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://bright-gift.com/terms</loc>
    <lastmod>2025-10-16</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://bright-gift.com/data-deletion</loc>
    <lastmod>2025-10-16</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <!-- Additional blog post URLs continue... -->
</urlset>
```

**Note:** The sitemap contains 44 blog post URLs. The full sitemap is available in the repository.

---

## 🔌 **API SERVER FILES**

### **9. API URL Generation Code (github-webhook.js)**

```javascript
// Line 36 in /Users/jeff/Projects/multi-site-hub/brightgift-api-server/src/routes/github-webhook.js
final_url: fm.url || `https://bright-gift.com/blog/${slug}`,
```

### **10. API URL Generation Code (scan-repo-frontmatter.js)**

```javascript
// Line 38 in /Users/jeff/Projects/multi-site-hub/brightgift-api-server/scripts/backfill/scan-repo-frontmatter.js
final_url: fm.url || `https://bright-gift.com/blog/${slug}`,
```

**⚠️ CONFLICT IDENTIFIED:** Both API files generate URLs **without trailing slashes**, which conflicts with the proposed solution.

---

## 🌐 **CLOUDFLARE SETTINGS NEEDED**

The agent requested the following Cloudflare settings (not available in repository):

1. **Rules → Redirects (Bulk Redirects)** - Screenshot or export
2. **Rules → Transform Rules → URL Normalization** - Current mode setting
3. **Pages → Project → Functions routing** - Any custom routing rules
4. **Latest deployment ID** - For cache purging reference

---

## 🎯 **EXPECTED SOLUTION**

Based on the agent's analysis, the fix should involve:

1. **Change `astro.config.mjs`:**
   - Set `trailingSlash: 'always'` or `'ignore'`
   - Remove `/privacy` and `/terms` from `routes.exclude`

2. **Update `public/_redirects`:**
   - Add explicit redirects: `/privacy /privacy/ 301` and `/terms /terms/ 301`

3. **Fix API URL generation:**
   - Update both API files to generate URLs with trailing slashes

4. **Purge Cloudflare cache and redeploy**

---

## 📋 **NEXT STEPS**

1. **Agent will provide updated files** with the fixes implemented
2. **Deploy changes** to production
3. **Test redirect behavior** with `curl -I https://bright-gift.com/privacy`
4. **Verify no infinite loops** - should see max 1 redirect to `/privacy/` with 200 response
5. **Update Search Console** - request reindexing of fixed pages

---

**This document contains all the files and information requested by the external agent to implement the redirect loop fix.**

