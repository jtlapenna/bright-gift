# 🌟 BrightGift Automated Content Generation System

This document outlines the architecture and workflow for an automated system to generate, review, approve, and publish high-quality SEO-optimized content for the BrightGift website. The goal is to minimize manual effort while preserving editorial oversight and brand alignment.

---

## ✅ Platforms & Tools
- **Code & AI Dev**: Cursor, GitHub
- **Web**: Cloudflare (Pages / DNS)
- **Automation**: n8n (planned)
- **Content Gen**: ChatGPT API (custom prompts)
- **Deployment Preview**: GitHub + Vercel/Cloudflare Preview
- **Analytics/Socials/Email**: To be added

---

## 🧠 Workflow Overview

### Phase 1: Idea Generation
- 🧩 **Trigger**: Weekly or on-demand (via CLI or n8n)
- ✍️ **Prompt**: GPT agent generates 3 blog ideas using Jeff’s style guide and predefined content categories:
  - Mainstream (e.g. trending topics)
  - Alternative/subculture (e.g. niche/identity-driven gifting)
  - Cutting-edge (e.g. AI-generated gifts, NFTs, etc.)
- 📤 **Output**: Markdown file (or JSON) with:
  - Title
  - Description
  - Target keywords
  - Suggested product category
- 🔁 **Delivery**: Sent to Jeff via email or saved to GitHub Issues/Inbox for review

### Phase 2: Approval & Notes
- Jeff selects one idea and optionally adds notes (via email reply, GitHub comment, or n8n UI form)

### Phase 3: Draft Generation
- GPT agent writes:
  - SEO-optimized blog post (~1,000–1,500 words)
  - Includes affiliate-linked products (using your tag)
  - Includes 2 high-quality external links (non-competitor sources)
  - Includes 2 relevant images (web-sourced or AI-generated if needed)
- Output is a full Markdown file with:
  - Meta title/description
  - H1–H3 sections
  - Affiliate product cards (using preformatted components or shortcodes)

### Phase 4: Visual Preview
- Draft saved to GitHub in `/drafts` branch
- Auto-deployed preview via Cloudflare Pages (or Vercel) with custom preview domain
- Jeff receives a link to review

### Phase 5: Approval & Publishing
- Upon approval (via checkbox toggle or comment command):
  - Merge to `main` or `live` branch
  - Trigger Cloudflare build to publish live post
  - Trigger SEO task (e.g., sitemap update, internal link scan)

### Phase 6: Post-Publish Marketing
- GPT drafts:
  - Short social media posts (X, Instagram, Threads)
  - Email summary for newsletter (Mailchimp, Buttondown, or ConvertKit)
- Posts or email saved as Markdown, HTML, or scheduled via n8n

---

## 🛠️ Implementation Layers

### AI Prompting Agents
- Idea Generator Agent (Style/Brand aware)
- Blog Writer Agent (SEO-trained)
- Product Inserter Agent (based on keyword/Amazon link matching)
- Summarizer Agent (social/email copy)

### GitHub Integration
- GitHub repo hosts:
  - `content/ideas/`
  - `content/drafts/`
  - `content/live/`
- GitHub Actions auto-deploy previews

### n8n Flows (for later automation)
- Weekly idea generation & notification
- Draft review trigger
- Publish & SEO flow
- Social/email post-publish trigger

---

## 🔗 Linking Requirement

Each blog post must include a clear and prominent link back to the BrightGift AI Gift Generator tool:

**URL:** https://bright-gift.com

This supports internal SEO and encourages users to engage with the main tool.

---

## 🧩 Future Considerations
- Add GA4/Clarity/Hotjar for analytics
- Add OpenGraph image generation for blog cards
- Add Zapier or IFTTT for backup social triggers
- Support voice or mobile prompts for idea approval (via email or Telegram bot)
