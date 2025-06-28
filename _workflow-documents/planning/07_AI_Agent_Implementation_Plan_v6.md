# 🤖 AI Agent-Oriented Implementation Plan for AI Gift Idea Generator

> This plan is structured for an AI agent (e.g. in Cursor) to execute autonomously where possible. 
> Prompts are included to identify steps requiring human input, and detailed directives clarify all development actions.

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

### 9. Blog Page Setup [🔄 NEXT TASK]
- [ ] Create blog index page (`src/pages/blog/index.astro`).
- [ ] Build blog post template at `src/pages/blog/[...slug].astro`.
- [ ] Render post content from markdown files stored in `/src/content/blog/` directory.
- [ ] Add RSS feed support for blog post syndication.
- [ ] Allow sorting or filtering by style tag or gift category.
- [ ] Include estimated read time on post previews.
- [ ] Paginate results if over 10 posts.
- [ ] Implement lazy loading for post previews.
- [ ] Add breadcrumbs for navigation context.
- [ ] Include post date, category tag, and link to full post.

### 10. Initial Content Creation & SEO
- [ ] Define 10–20 long-tail gift-related keywords
- [ ] Generate and approve first 5–10 blog posts
- [ ] Add meta tags, Open Graph, sitemap, and internal linking

### 11. SEO Optimization [🤖 AI Agent Task]
- [ ] Add meta title and description for homepage and posts
- [ ] Optimize headers and alt text
- [ ] Generate and deploy `sitemap.xml`
- [ ] Include internal linking between tool and blog
- [ ] Validate presence of `twitter:card` and `og:type` for social embedding
- [ ] Set fallback values to avoid blank preview links
- [ ] Add canonical link tag to prevent duplicate content issues
- [ ] Ensure Open Graph (`og:title`, `og:image`) is set for link previews

---

## 🎯 IMMEDIATE NEXT PRIORITIES

### 1. **Blog Page Setup** [🤖 AI Agent Task - HIGH PRIORITY]
- [ ] Create blog index and post templates
- [ ] Set up content directory structure
- **Why**: Foundation for SEO content and affiliate monetization

### 2. **Initial Content Creation** [🔧 Human + 🤖 AI Agent - HIGH PRIORITY]
- [ ] Define long-tail keywords
- [ ] Generate first 5-10 blog posts
- **Why**: Drive organic traffic and establish site authority

### 3. **SEO Enhancements** [🤖 AI Agent Task]
- [ ] Add meta tags, Open Graph, sitemap, and internal linking
- **Why**: Improve discoverability and social sharing

---

# ✅ END OF AI-AUTOMATION PLAN

---
## 🐞 Open Issues (2024-07-27)
- [ ] Product images are broken in gift idea cards.
- [ ] Handmade/Etsy style does not return Etsy links or products.
- [ ] Card layout should be wider and less tall for better UX.
- [ ] Next: Fix image URLs, debug/fix Etsy integration, and improve card layout.