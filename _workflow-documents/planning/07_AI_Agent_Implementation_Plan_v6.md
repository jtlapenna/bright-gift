# 🤖 AI Agent-Oriented Implementation Plan for AI Gift Idea Generator

> This plan is structured for an AI agent (e.g. in Cursor) to execute autonomously where possible. 
> Prompts are included to identify steps requiring human input, and detailed directives clarify all development actions.
> Cross-references: [04_SEO_Strategy_Canvas.md](./04_SEO_Strategy_Canvas.md) | [04.1_blog-system.md](./04.1_blog-system.md)

---

## 🚀 PHASE 0 – PROJECT INITIALIZATION ✅ COMPLETE

### 1. Setup Project Structure [✅ COMPLETE]
- [x] Create the project root directory.
- [x] Use `npm create astro@latest` to bootstrap a new Astro project.
- [x] Select the "Empty" project template.
- [x] Add Tailwind CSS integration using `npx astro add tailwind`.
- [x] Create the following directory structure:
```
/project-root
├── /public              # Static assets (images, icons)
├── /src
  │   ├── /components      # Reusable Astro/UI components (.astro)
  │   ├── /layouts         # Base page layouts (Layout.astro)
  │   ├── /pages           # Site pages and API routes (.astro, .ts)
  │   │   └── /api         # Serverless functions for OpenAI
  │   ├── /styles          # Global CSS, fonts
  │   └── /utils           # Helper scripts (promptBuilder.ts)
  ├── .env                 # Local environment variables (OPENAI_API_KEY)
  ├── .env.example         # Example environment file
  ├── .gitignore           # To ignore node_modules, .env, etc.
  ├── astro.config.mjs     # Astro configuration
  ├── package.json         # Project dependencies
  └── tsconfig.json        # TypeScript configuration
  ```

### 2. Version Control Setup [✅ COMPLETE]
- [x] Initialize a new Git repository: `git init`.
- [x] Create `.gitignore` file with standard Node.js and Astro ignores (e.g., `node_modules`, `dist`, `.env`).
- [x] Add the BitBucket repository as the remote origin: `git remote add origin https://bitbucket.org/amoeboar/gift-idea-generator.git`.
- [x] Make an initial commit with the project structure.
- [x] Set up SSH authentication for Bitbucket
- [x] Push all changes to remote repository
- [x] Mirror repo to GitHub for Cloudflare Pages auto-deploy

### 3. Environment Setup [✅ COMPLETE]
- [x] Create a `.env` file.
- [x] Add `OPENAI_API_KEY=your_key_here` to the `.env` file.
- [x] Create a `.env.example` file with `OPENAI_API_KEY=""`.

---

## ✅ PHASE 1 – MVP LAUNCH ✅ COMPLETE

### 4. Setup Hosting [✅ COMPLETE]
- [x] Register a domain (`bright-gift.com`).
- [x] Set up hosting via Cloudflare Pages.
- [x] Connect GitHub repository for auto-deploy.
- [x] Configure custom domain and SSL.
- [x] Confirm site is live at both `.pages.dev` and custom domain.

### 5. Homepage Layout [✅ COMPLETE]
- [x] Create homepage at `src/pages/index.astro`.
- [x] Create a base layout at `src/layouts/Layout.astro`.
- [x] Create homepage HTML with:
  - [x] Hero section with heading and tagline
  - [x] User input form with fields: recipient, interests, budget, style
  - [x] Result area to render AI suggestions
  - [x] Dark theme implementation
  - [x] Responsive design with Tailwind CSS
  - [x] Form validation and error handling
  - [x] Loading states and animations
  - [x] Accessibility features (semantic HTML, ARIA labels)
  - [x] Results section now appears above blog grid as per updated layout plan
  - [x] About/SEO content block added after blog grid, with schema.org markup and CTA for tool engagement
  - [x] Featured Gift Guides grid is dynamic, responsive, and visually polished with placeholder images for each post

### 6. Build Prompt System [✅ COMPLETE]
- [x] Create `src/utils/promptBuilder.ts` to dynamically build OpenAI prompts
  - [x] Build modular prompt segments for each input type
  - [x] Structure export for reuse by both blog automation and main tool
  - [x] Handle edge cases: missing budget, missing interests, overly long user inputs
  - [x] Structure the prompt with context-setting and bullet formatting
  - [x] Include validation to exclude undefined or blank fields
  - [x] Add comprehensive comments for maintainability

### 7. OpenAI Integration [✅ COMPLETE]
- [x] Create a serverless API route at `src/pages/api/generate.ts`.
- [x] Function receives form data, builds prompt using `promptBuilder`
- [x] Securely calls OpenAI API using key from `locals.runtime.env.OPENAI_API_KEY` (Cloudflare SSR pattern)
- [x] Handles API response and returns suggestions as JSON
- [x] Debugged and resolved Cloudflare Pages SSR environment variable injection: must use `locals.runtime.env` for secrets, not process.env or import.meta.env.

### 8. Display Results [✅ COMPLETE]
- [x] Render markdown into cards showing:
  - [x] Gift title
  - [x] Description
  - [x] Product category tag
- [x] Parse markdown using `marked` library
- [x] Responsive card layout with mobile optimization
- [x] Animation effects for improved UX
- [x] Error handling for incomplete markdown
- [x] Space reserved for affiliate links (to be inserted later)

---

## 📝 PHASE 2 – CONTENT & SEO [🔄 IN PROGRESS - NEXT FOCUS]

> **Cross-reference:** This phase implements the blog system outlined in [04.1_blog-system.md](./04.1_blog-system.md) and supports SEO goals from [04_SEO_Strategy_Canvas.md](./04_SEO_Strategy_Canvas.md).

### 9. Blog Page Setup [✅ COMPLETE]
> **Implementation:** Follows [Blog System Plan Section 8](./04.1_blog-system.md#8-implementation-steps-supports-ai-agent-plan-phase-2)

- [x] Create blog index page (`src/pages/blog/index.astro`).
- [x] Build blog post template at `src/pages/blog/[...slug].astro`.
- [x] Set up Astro Content Collections for blog posts, guides, and FAQs (supports [SEO Canvas site architecture](./04_SEO_Strategy_Canvas.md#-site-architecture)).
- [x] Create content directory structure (`/src/content/blog/`, `/src/content/gift-guides/`, `/src/content/faqs/`).
- [x] Define Markdown frontmatter schema (title, desc, tags, meta, images, links).
- [x] Render post content from markdown files stored in `/src/content/blog/` directory.
- [x] Add RSS feed support for blog post syndication.
- [x] Allow sorting or filtering by style tag or gift category (supports [SEO Canvas categories](./04_SEO_Strategy_Canvas.md#-site-architecture)).
- [x] Include estimated read time on post previews.
- [x] Paginate results if over 10 posts.
- [x] Implement lazy loading for post previews.
- [x] Add breadcrumbs for navigation context.
- [x] Include post date, category tag, and link to full post.
- [x] Implement internal linking: Blog ↔ Tool, Blog ↔ Blog, Blog ↔ Guides (supports [SEO Canvas internal linking strategy](./04_SEO_Strategy_Canvas.md#-site-architecture)).

**✅ COMPLETED (2024-07-27):**
- Enhanced content schema with SEO fields, affiliate links, and categorization
- Created responsive blog index page with filtering, pagination, and modern UI
- Built dynamic blog post template with structured data, social sharing, and affiliate sections
- Added sample content for all three content types (blog, gift guides, FAQs)
- Implemented SEO optimization with meta tags, structured data, and Open Graph
- Successfully tested build process

### 10. Initial Content Creation & SEO
> **Implementation:** Follows [Blog System Plan Section 6](./04.1_blog-system.md#6-content-pillars-implementation-from-seo-canvas) and [SEO Canvas keyword strategy](./04_SEO_Strategy_Canvas.md#-keyword-strategy)

- [ ] Define 10–20 long-tail gift-related keywords (using [SEO Canvas keyword types](./04_SEO_Strategy_Canvas.md#-core-keyword-types)).
- [ ] Generate and approve first 5–10 blog posts (targeting [SEO Canvas content pillars](./04_SEO_Strategy_Canvas.md#-content-pillars)).
- [ ] Add meta tags, Open Graph, sitemap, and internal linking (following [SEO Canvas on-page optimization](./04_SEO_Strategy_Canvas.md#-on-page-optimization)).
- [ ] Implement AI-assisted content generation (leverages existing OpenAI integration from Phase 1).

### 11. SEO Optimization [🤖 AI Agent Task]
> **Implementation:** Follows [Blog System Plan Section 4](./04.1_blog-system.md#4-on-page-seo-automation-matches-seo-canvas)

- [ ] Add meta title and description for homepage and posts (clear + clickworthy, problem + solution CTA).
- [ ] Optimize headers and alt text (exact match keywords, AI-generated alt text).
- [ ] Generate and deploy `sitemap.xml`.
- [ ] Include internal linking between tool and blog (supports [SEO Canvas internal linking](./04_SEO_Strategy_Canvas.md#-site-architecture)).
- [ ] Validate presence of `twitter:card` and `og:type` for social embedding.
- [ ] Set fallback values to avoid blank preview links.
- [ ] Add canonical link tag to prevent duplicate content issues.
- [ ] Ensure Open Graph (`og:title`, `og:image`) is set for link previews.
- [ ] Implement structured data markup for gift lists and FAQs (supports [SEO Canvas future enhancements](./04_SEO_Strategy_Canvas.md#-future-seo-enhancements)).

---

## 🎯 IMMEDIATE NEXT PRIORITIES

### 1. **Initial Content Creation** [🔧 Human + 🤖 AI Agent - HIGH PRIORITY]
> **Cross-reference:** [Blog System Plan Section 7](./04.1_blog-system.md#7-keyword-strategy-integration-from-seo-canvas)

- [ ] Define long-tail keywords (using [SEO Canvas keyword types](./04_SEO_Strategy_Canvas.md#-core-keyword-types))
- [ ] Generate first 5-10 blog posts (targeting [SEO Canvas content pillars](./04_SEO_Strategy_Canvas.md#-content-pillars))
- **Why**: Drive organic traffic and establish site authority (supports [SEO Canvas traffic goals](./04_SEO_Strategy_Canvas.md#-seo-goals))

### 2. **SEO Enhancements** [🤖 AI Agent Task - HIGH PRIORITY]
> **Cross-reference:** [Blog System Plan Section 4](./04.1_blog-system.md#4-on-page-seo-automation-matches-seo-canvas)

- [ ] Add meta tags, Open Graph, sitemap, and internal linking
- [ ] Implement structured data markup for gift lists and FAQs
- [ ] Set up Google Search Console and analytics tracking
- **Why**: Improve discoverability and social sharing (supports [SEO Canvas on-page optimization](./04_SEO_Strategy_Canvas.md#-on-page-optimization))

### 3. **Hero/Tool Container Responsiveness** [🤖 AI Agent Task - MEDIUM PRIORITY]
- [ ] Make the hero/tool container responsive so the tool is always above the fold
- **Why**: Improve user experience and conversion rates

### 4. **Etsy Integration** [🤖 AI Agent Task - MEDIUM PRIORITY]
- [ ] Fix Etsy API integration for handmade style gifts
- [ ] Add Etsy product links and images to gift suggestions
- **Why**: Expand affiliate revenue and provide more diverse gift options

---

## 🟡 CURRENT STATUS & NOTES (2024-07-27)
- ✅ All core MVP features are live: homepage, hero, tool, OpenAI integration, SSR, product card UI, affiliate link structure, and robust error handling.
- ✅ Product card UI is visually robust, responsive, and on-brand (recent tweaks: icon color, product name, tag, loading spinner, etc.).
- ✅ Cloudflare Pages SSR and environment variable handling are stable.
- 🟡 **TO DO:** Make the hero/tool container responsive so the tool is always above the fold.
- 🟡 **TO DO:** Integrate Etsy and other affiliate sites for product links/images (currently only Amazon is robust).
- 🟡 **TO DO:** Update the "BIPOC Owned" tag to "Black Owned" for clarity and inclusivity. Consider adding other useful tags such as:
  - AAPI Owned
  - Latinx Owned
  - Women Owned
  - LGBTQ+ Owned
  - Veteran Owned
  - Disability Owned
  - Sustainable
  - Handmade
  - Small Business
  - Plants
- 🟡 **TO DO:** Blog/SEO content system (see [04.1_blog-system.md](./04.1_blog-system.md) for detailed implementation plan).
- ❓ If any other features are not marked as complete, please confirm with the user.

---

## 🐞 Open Issues (2024-07-27)
- [ ] Product images are broken in gift idea cards. (Is this still an issue? Please confirm.)
- [ ] Handmade/Etsy style does not return Etsy links or products. (Etsy integration still needed.)
- [ ] Card layout should be wider and less tall for better UX. (Recent UI changes improved this, but further tweaks may be desired.)
- [ ] **Hero/tool container needs to be made responsive so the tool is always above the fold.**
- [ ] **Integrate Etsy and other affiliate sites for product links/images.**
- [ ] Next: Fix image URLs, debug/fix Etsy integration, and improve card layout.

---

## ✅ COMPLETED (2024-07-27)
- Astro project setup, Tailwind, and directory structure
- GitHub/Cloudflare Pages integration
- Environment variable handling for SSR
- Homepage, hero, and tool UI
- OpenAI prompt system and backend integration
- Product card UI (responsive, accessible, on-brand)
- Amazon affiliate link structure
- Robust error handling and loading states
- Accessibility and responsive design
- Iterative UI/UX improvements (per user feedback)

---

## Remaining Tasks
- [ ] Blog page setup and content system (see [04.1_blog-system.md](./04.1_blog-system.md))
- [ ] Initial content creation and SEO (supports [04_SEO_Strategy_Canvas.md](./04_SEO_Strategy_Canvas.md) goals)
- [ ] SEO enhancements (meta tags, Open Graph, sitemap, internal linking)
- [ ] Make hero/tool container responsive so tool is always above the fold
- [ ] Integrate Etsy and other affiliate sites for product links/images
- [ ] (Confirm with user) Fix any remaining product image or card layout issues

<!-- If any items above are uncertain, please confirm with the user. -->

# ✅ END OF AI-AUTOMATION PLAN

---