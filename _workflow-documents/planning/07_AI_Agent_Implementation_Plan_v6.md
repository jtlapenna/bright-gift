# 🤖 AI Agent-Oriented Implementation Plan for AI Gift Idea Generator

> This plan is structured for an AI agent (e.g. in Cursor) to execute autonomously where possible. 
> Prompts are included to identify steps requiring human input, and detailed directives clarify all development actions.

---

## 🚀 PHASE 0 – PROJECT INITIALIZATION

### 1. Setup Project Structure [🤖 AI Agent Task]
- Create the project root directory.
- Use `npm create astro@latest` to bootstrap a new Astro project.
- Select the "Empty" project template.
- Add Tailwind CSS integration using `npx astro add tailwind`.
- Create the following directory structure:
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

### 2. Version Control Setup [🤖 AI Agent Task]
- Initialize a new Git repository: `git init`.
- Create `.gitignore` file with standard Node.js and Astro ignores (e.g., `node_modules`, `dist`, `.env`).
- Add the BitBucket repository as the remote origin: `git remote add origin https://bitbucket.org/amoeboar/gift-idea-generator.git`.
- Make an initial commit with the project structure.

### 3. Environment Setup [🔧 Human Required + 🤖 AI Agent Task]
- 🤖 Agent must:
  - Create a `.env` file.
  - Add `OPENAI_API_KEY=your_key_here` to the `.env` file.
  - Create a `.env.example` file with `OPENAI_API_KEY=""`.
- 👉 For this step, prompt the user to complete the following action(s):
  - "I have created a `.env` file for your project secrets. Please open it and replace `your_key_here` with the OpenAI API key you provided. This file is already in `.gitignore` and will not be committed."

---

## ✅ PHASE 1 – MVP LAUNCH

### 4. Setup Hosting [🔧 Human Required]
- 👉 For this step, prompt the user to complete the following action(s). Provide full, detailed instructions and walk them through the steps one by one until completed:
  - Register a domain.
  - Set up hosting via Cloudflare Pages or Vercel.
  - Connect your BitBucket repository.
  - Configure auto-deploy from the `main` branch.

### 5. Homepage Layout [🤖 AI Agent Task]
- Create homepage at `src/pages/index.astro`.
- Create a base layout at `src/layouts/Layout.astro`.
- Create homepage HTML or `/pages/index.tsx`
  - Integrate a simple loading spinner or skeleton UI for results area.
  - Apply lazy loading for non-critical assets like footer images or icons.
  - Include privacy/compliance links (TOS, Affiliate Disclosure) in footer.
  - Ensure contrast ratios meet WCAG accessibility standards.
  - Use semantic HTML5 tags for accessibility (`<main>`, `<form>`, `<section>`).
  - Include clear placeholder text for input fields to guide users.
  - Ensure logical tab order and screen reader labels.
  - Include visual hierarchy: large hero header, subtext, form with labels, submit button, and dynamic result section.
  - Use Tailwind CSS classes or minimal CSS to ensure responsive layout on both desktop and mobile.
  - Ensure form data is sanitized before submission.
- Include:
  - Hero section with heading and tagline
  - User input form with fields: recipient, interests, budget, style
  - Result area to render AI suggestions
  - Blog post grid (static or later dynamic)
  - Footer with disclaimer and links

### 6. Build Prompt System [🤖 AI Agent Task]
- Create `src/utils/promptBuilder.ts` to dynamically build OpenAI prompts
  - Build modular prompt segments for each input type to allow conditional insertion.
  - Add comment blocks above each logical unit for clarity.
  - Structure export so it can be reused by both blog automation and main tool.
  - Test edge cases: missing budget, missing interests, overly long user inputs.
  - Structure the prompt to begin with context-setting, followed by bullet formatting.
  - Log the generated prompt in development for debugging.
  - Include unit tests to ensure correct prompt output given varied inputs.
  - Use template strings to dynamically combine user inputs into structured prompts.
  - Add validation to exclude undefined or blank fields in final prompt.
  - Comment the logic for maintainability.
- Ensure prompt format includes all user inputs (recipient, interest, style, budget)

### 7. OpenAI Integration [🤖 AI Agent Task]
- Create a serverless API route at `src/pages/api/generate.ts`.
- This function will receive the form data, build the prompt using the `promptBuilder`, and securely call the OpenAI API using the key from `import.meta.env.OPENAI_API_KEY`.
- It will handle the API response and return the suggestions as JSON.

### 8. Display Results [🤖 AI Agent Task]
- Render markdown into cards showing:
  - Ensure card layout collapses into stacked view on mobile with padding.
  - Use role='list' and role='listitem' for accessibility.
  - Validate links inside cards and truncate overflowing titles.
  - Consider light/dark mode toggle for user comfort.
  - Handle edge cases like incomplete markdown or repeated bullet points.
  - Add basic animation using Tailwind's transition utilities or CSS keyframes.
  - Ensure cards gracefully degrade on slow connections.
  - Parse markdown using a library like `marked` or convert via regex.
  - Wrap each card in a div with styling to match site branding.
  - Include hover or animation effects for improved UX.
  - Gift title
  - Description
  - Product category tag
- Leave space for affiliate links (inserted later)

---

## 📝 PHASE 2 – CONTENT & SEO

### 9. Blog Page Setup [🤖 AI Agent Task]
- Create blog index page (`src/pages/blog/index.astro`).
- Build blog post template at `src/pages/blog/[...slug].astro`.
- Render post content from markdown files stored in a new `/src/content/blog/` directory.
- Add RSS feed support for blog post syndication.
- Allow sorting or filtering by style tag or gift category.
- Include estimated read time on post previews.
- Paginate results if over 10 posts.
- Implement lazy loading for post previews if the list exceeds 10.
- Filter blog posts by tags or categories (if present in metadata).
- Add breadcrumbs for navigation context.
- Load posts dynamically from a folder or CMS JSON export.
- Include post date, category tag, and link to full post.

### 10. Initial Content Creation [🔧 Human Input Required + 🤖 AI Agent Assist]
- 👉 For this step, prompt the user to complete the following action(s). Provide full, detailed instructions and walk them through the steps one by one until completed:
  - Define 10–20 long-tail gift-related keywords
  - Approve AI-generated posts before publishing
- 🤖 Agent must:
  - Generate blog drafts using prompt templates
  - Format content in markdown
  - Save into blog directory (e.g. `/src/content/blog/`)

### 11. SEO Optimization [🤖 AI Agent Task]
- Add meta title and description for homepage and posts
  - Use AI or rule-based generation of meta description when author not present.
  - Validate presence of `twitter:card` and `og:type` for social embedding.
  - Set fallback values to avoid blank preview links.
  - Lint HTML using an accessibility scanner (e.g., axe-core) pre-deploy.
  - Title should begin with primary keyword and be under 60 characters.
  - Meta description should summarize value of the page under 155 characters.
  - Add canonical link tag to prevent duplicate content issues.
  - Ensure Open Graph (`og:title`, `og:image`) is set for link previews.
  - Verify mobile-friendliness using Google Mobile Test tools.
- Optimize headers and alt text
- Generate and deploy `sitemap.xml`
- Include internal linking between tool and blog

---

## 💰 PHASE 3 – AFFILIATE EXPANSION

### 12. Affiliate Programs [🔧 Human Required]
- 👉 For this step, prompt the user to complete the following action(s). Provide full, detailed instructions and walk them through the steps one by one until completed:
  - Register for Amazon, Etsy, Uncommon Goods, etc.
  - Retrieve and store your unique affiliate tracking codes

### 13. Link Mapper & Style Routing [🤖 AI Agent Task]
- Add `src/utils/linkMapper.ts`:
  - Include link expiration fallback logic for time-sensitive promotions.
  - Generate analytics event when links are selected.
  - Log output routing decisions during development for debugging.
  - Allow optional UTM tracking injection on each link.
  - Include documentation inside the file describing retailer selection logic.
  - Allow easy overrides via external JSON config for future updates.
  - Create a test file to validate mappings given various inputs.
  - Use a switch-case or dictionary for category-to-retailer matching.
  - Include a fallback Amazon search if no style match is found.
  - Match product keywords to style
  - Route to correct retailer based on user style preference
  - Example: "funny mug" → Uncommon Goods
- Append links to output with `rel="nofollow"` and `target="_blank"`

### 14. Style Moderator Integration [🤖 AI Agent Task]
- Add style selector UI (dropdown or chips)
  - Include help tooltip or text to explain what each style means.
  - Visually preview style impact (e.g., badge color or emoji cue).
  - Validate form and style selection before submission.
  - Allow auto-reset to default on page reload or inactivity.
  - Preselect a default style and allow deselection.
  - Use ARIA attributes for accessibility.
  - Animate transitions between style selections for better engagement.
  - Ensure styles are mutually exclusive and visibly selected.
  - Optionally add icon badges for visual identity.
- Insert style into prompt
- Use it for affiliate mapping logic

---

## 🔁 PHASE 4 – AUTOMATION & SCALING

### 15. Content Automation Pipeline [🤖 AI Agent Task]
- Script: `generateBlog.ts`
  - Accepts list of keywords
  - Sends prompts to OpenAI
  - Formats markdown blog posts
  - Saves to file with valid frontmatter

### 16. Link Monitoring [🔧 Optional — Human or AI QA]
- ✅ You may:
  - Periodically run a crawler to detect broken affiliate links
- 🤖 Optional Agent Task:
  - Build a script to verify outbound links and flag 404s

### 17. Email Integration [🔧 Human Required + 🤖 Optional Agent Setup]
- 👉 For this step, prompt the user to complete the following action(s). Provide full, detailed instructions and walk them through the steps one by one until completed:
  - Sign up for Beehiiv or ConvertKit
  - Embed form on homepage/blog (copy/paste)
- 🤖 Agent may:
  - Insert form code and set styles

---

## 🔮 PHASE 5 – UX & ANALYTICS

### 18. Personalization Features [🤖 AI Agent Task]
- Add "Regenerate suggestions" button
- Store user session in `localStorage`
- Optionally: allow saving favorite gifts

### 19. Event Tracking [🤖 AI Agent Task]
- Add PostHog or Plausible:
  - Assign user sessions UUIDs for anonymous event correlation.
  - Add heatmap tracking for homepage click areas (if PostHog).
  - Auto-trigger scroll-based events for post engagement scoring.
  - Label events consistently using kebab-case naming.
  - Log conversion events like CTA clicks or outbound affiliate interactions.
  - Segment user behavior based on traffic source (social, organic, etc.).
  - Set up funnel tracking for tool usage: form submit → result view → click.
  - Set up goals for button clicks and outbound links.
  - Track tool usage frequency and most selected styles.
  - Track form submissions, clicks on links, scroll depth
  - Store event names and user IDs

### 20. Ongoing Optimization [🔧 Human Required + 🤖 Agent Assist]
- 👉 For this step, prompt the user to complete the following action(s). Provide full, detailed instructions and walk them through the steps one by one until completed:
  - Review analytics weekly
  - Identify top blog posts and regenerate underperformers
- 🤖 Agent can:
  - Suggest new keywords
  - Refresh blog post content on schedule

---

## 📦 FINALIZATION & Handoff

- Confirm:
  - All major affiliate programs are working
  - Blog content is fresh and discoverable
  - Prompt logic is clean and efficient
- 👉 For this step, prompt the user to complete the following action(s). Provide full, detailed instructions and walk them through the steps one by one until completed:
  - Document API usage costs
  - Audit affiliate revenue sources
  - Add call-to-action or onboarding flow for users

---

# ✅ END OF AI-AUTOMATION PLAN