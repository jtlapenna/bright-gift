# 🧱 Tech Stack & Architecture Canvas

## 🎯 Purpose:
Define the technical foundation for the AI Gift Idea Generator, ensuring it's fast to launch, cost-effective, scalable, and automatable over time.

---

## ⚙️ Core Tech Stack (MVP Launch)

| Layer             | Tool / Service         | Notes                                                                 |
|------------------|------------------------|-----------------------------------------------------------------------|
| Frontend         | Astro + Tailwind CSS   | Fast, content-focused Jamstack framework for optimal performance.     |
| Backend (optional)| Astro Serverless Functions | For secure, server-side API calls to OpenAI.                          |
| Hosting          | Cloudflare Pages / Vercel | Free/cheap static hosting with custom domain and function support.    |
| Domain           | Namecheap / Google Domains | Branded .com or .gift domain                                       |
| AI Model         | OpenAI API (GPT-4 Turbo) | Prompted on demand in browser or via lightweight function             |
| Blog CMS         | Notion → Static / Git Integration | Or use Eleventy/Markdown files + Git-based deploy           |
| Analytics        | Plausible / PostHog    | GDPR-safe, cookieless, ideal for SEO sites                           |
| Affiliate Links  | Amazon, Etsy (via Awin), Uncommon Goods | Manual or templated lookup                                         |

---

## 🚀 AI Integration Architecture

### MVP (Client-side Prompting):
- No backend needed
- User form sends prompt → OpenAI API → response rendered on screen
- JS fetch() or simple API middleware

### Optional Serverless Option:
- Use Cloudflare Workers or Vercel Functions to proxy OpenAI calls
- Obscure API key from frontend

---

## ✨ Automation Tools (Optional Phase 2+)
| Use Case                 | Tool                 | Function                                 |
|--------------------------|----------------------|------------------------------------------|
| Blog generation          | GPT-4 + Notion + Zapier | Auto-draft SEO posts from keyword list |
| Link validation/update   | AI crawler / Broken link checker | Ensure affiliate links stay live     |
| Email marketing          | Beehiiv / ConvertKit | Capture and send gift updates           |
| Image generation         | DALL·E or Midjourney | Custom hero images, Pinterest pins      |

---

## 🧪 Testing & QA Stack
- BrowserStack for cross-device testing
- Lighthouse for speed + SEO audits
- Manual AI QA review (weekly)

---

## 🔒 Security & Privacy
- No personal data collection (for MVP)
- GDPR-compliant analytics
- No login or cookie tracking required

---

## 🛠 Dev Tools (for AI Agent/Team)
- BitBucket for versioning
- Notion for docs + content planning
- Local dev: VS Code, Prettier, Astro CLI

---

## 🧩 Optional Enhancements
| Feature                   | Tool/Method                   | Notes                                       |
|---------------------------|-------------------------------|---------------------------------------------|
| Searchable gift database  | JSON + JS search              | For faster tool results, post-prompt caching |
| Saved gift lists          | LocalStorage or Supabase      | Only if logins added                        |
| Pinterest content         | Static HTML + schema markup   | For viral pin generation                    |
