# 🔗 Affiliate Strategy & Link Placement Canvas

## 🎯 Purpose:
Monetize AI-generated gift ideas and blog content by embedding well-placed affiliate links across high-intent touchpoints. Maximize click-throughs and conversion while maintaining a clean, helpful user experience.

---

## 💰 Core Affiliate Programs

| Platform           | Description                          | Join Through            |
|--------------------|--------------------------------------|-------------------------|
| Amazon Associates  | Default, high-trust, broad selection | Amazon                  |
| Etsy               | Handmade and indie products          | Awin or ShareASale      |
| Uncommon Goods     | Quirky, unique, eco-friendly gifts   | Impact or direct        |
| Bookshop.org       | Ethical book buying                  | Affiliate Program (direct) |
| EarthHero          | Sustainable products                 | ShareASale              |

---

## 🛠 Link Insertion Logic

### AI Tool Output:
- Each suggestion includes:
  - Title
  - Description
  - Affiliate link (with rel="nofollow" + target="_blank")
  - Optional "View on [Retailer]" label
- Link is generated based on keyword + style match (e.g. "handmade tea cup" → Etsy)

### Blog Posts:
- Inline product links in gift list items
- Bonus CTA blocks (e.g. "Still not sure? Try the AI Gift Generator")
- Links open in new tabs
- Optional button format for better CTR

---

## 🧠 Style-Based Routing

| Style Tag         | Primary Affiliate Source             |
|-------------------|---------------------------------------|
| Handmade          | Etsy                                  |
| Unique / Quirky   | Uncommon Goods                        |
| Eco-Friendly      | EarthHero / filtered Amazon           |
| Funny             | Uncommon Goods / Amazon (novelty)     |
| Sleek / Techy     | Amazon (gadgets)                      |
| Premium / Luxury  | Amazon Luxury / Brand Stores          |
| LGBTQ+ Owned      | Etsy / Official Pride Merch Stores    |
| BIPOC Owned       | Etsy / miiriya.com (if available)     |

- Logic stored as simple switch/case or if/else mapping
- Fallback: Amazon link with relevant search tag

---

## 📊 Weekly Link Performance Dashboard

| Metric                        | Source                  | Notes                                     |
|-------------------------------|--------------------------|-------------------------------------------|
| Top 5 clicked links           | Plausible outbound clicks | Focus on high-conversion pages           |
| Link CTR (blog vs tool)       | Manual / Event Tracking   | Highlight strong performers               |
| Dead or broken links          | AI crawler / manual QA    | Check quarterly                          |
| Revenue by source             | Amazon/Etsy dashboards    | Rebalance affiliate effort accordingly    |

---

## 🔁 Testing Strategy

- A/B test button vs text links
- Rotate product positions in blog lists
- Track affiliate CTR from each section (tool, blog, CTA blocks)
- Periodically regenerate tool results for freshness

---

## 📄 Disclosures & Compliance

-"As an Amazon Associate, we earn from qualifying purchases."
- Place above the fold or in footer (per program rules)
- Avoid incentivizing clicks or fake urgency

---

## 📌 Bonus Link Tactics

- Create "Top Picks" internal links from tool → blog posts
- Use Pinterest pins with affiliate redirects (as allowed)
- Seasonal blog roundups with 100% affiliate products
- Highlight free shipping or gift wrap on product links
