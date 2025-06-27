# 🧩 Homepage & Tool Layout Canvas

## 🚦 Task Priority & Implementation Checklist

1. **Hero Section**
   - [ ] Headline, subheadline, CTA button
   - [ ] Optionally show trending/recent ideas
   - [ ] Responsive, accessible, visually engaging
2. **Tool Section (Gift Finder Form & Results)**
   - [ ] Form fields: recipient, interests, budget, style
   - [ ] Style selector UI (chips/buttons)
   - [ ] Generate button with loading state
   - [ ] Display 3–5 AI-generated gifts as cards
   - [ ] Each card: title, description, tag, affiliate link
   - [x] Regenerate suggestions button (complete)
   - [x] Affiliate link placeholder (Amazon, tracking ID bright-gift-20)
   - [ ] Save favorites (localStorage)
   - [x] Accessibility: labels, tab order, ARIA (in progress/complete)
   - [x] Error handling and empty state (complete)
   - [x] Results section moved above blog grid (complete)
3. **Featured Gift Guides Grid**
   - [ ] Dynamically populate from blog posts
   - [ ] Show 3–6 posts with image, title, link
   - [ ] "Browse all gift guides" link
   - [ ] Responsive grid
4. **About the Tool / SEO Content Block**
   - [ ] Short, schema-friendly paragraph
   - [ ] CTA to try tool or read guides
   - [ ] Place after tool/results for SEO
5. **Email Signup (Optional)**
   - [ ] Offer, input fields, integration (ConvertKit/Beehiiv)
   - [ ] Clear privacy/disclaimer
   - [ ] Responsive and accessible
6. **Footer**
   - [ ] Links: About, Terms, Privacy, Affiliate Disclosure
   - [ ] Social/Pinterest sharing (optional)
   - [ ] Responsive, visually distinct

---

## 🏠 Homepage Layout (Sections)

### 1. **Hero Section**
- **Headline:** "Find the Perfect Gift in Seconds"
- **Subheadline:** "Personalized gift ideas powered by AI – just tell us who you're shopping for."
- **Call to Action Button:** "Try the Free Gift Finder"
- *Implementation notes:*
  - Use large, bold text for headline; clear hierarchy
  - CTA should scroll to tool section or focus form
  - Optionally show trending ideas below CTA (can be static for MVP)
  - Add subtle background or illustration for visual interest
  - Ensure mobile responsiveness and color contrast

---

### 2. **Tool Section (Inline on Homepage)**
- Embedded form with fields:
  - Who are you shopping for? (age, relationship, optional gender)
  - What do they like? (freeform, auto-suggested interests)
  - What's your budget? (dropdown: <$25, <$50, <$100, etc.)
  - [Optional] Gift style? (funny, handmade, eco-friendly, quirky, techy, luxury, LGBTQ+ owned, BIPOC owned)
- **CTA:** "Generate Gift Ideas"
- **Output:** List of 3–5 AI-generated gifts with:
  - Gift title
  - 1–2 sentence description
  - Optional tag (e.g. "Tech", "Handmade")
  - Affiliate link (dynamic based on gift)
- *Implementation notes:*
  - Use semantic HTML5 (`<form>`, `<label>`, `<input>`, `<select>`, `<button>`)
  - Style selector: visually distinct, keyboard accessible
  - Show loading spinner or skeleton while fetching
  - Results as cards: responsive grid, hover/focus effect
  - Regenerate button: triggers new AI call, animates results
  - Save favorites: store in localStorage, show "My Favorites" section if any
  - Error/empty state: clear message, retry option
  - Accessibility: all fields labeled, logical tab order, ARIA roles
  - Affiliate links: open in new tab, rel="nofollow", track clicks

---

### 3. **Featured Gift Guides Grid**
- Dynamically populated from blog posts
- 3–6 posts shown on homepage with image, title, and link
- "Browse all gift guides" link to /blog or /gift-guides/
- *Implementation notes:*
  - Use Astro content collections or file glob to load posts
  - Responsive grid (1 col mobile, 2–3 col desktop)
  - Card: image (cover or fallback), title, short excerpt, link
  - Blog links open in same tab
  - Show most recent or featured posts

---

### 4. **About the Tool / SEO Content Block**
- Short paragraph about how the tool works
- Schema-friendly copy for SEO
- CTA to try the tool or read gift guides
- *Implementation notes:*
  - Place after tool/results for SEO value
  - Use `<section>` with proper heading
  - Add FAQ or "How it works" for extra SEO

---

### 5. **Email Signup (Optional)**
- Offer: "Get a free printable gift planner + weekly gift tips"
- Connected to ConvertKit/Beehiiv
- Input: First name, email
- *Implementation notes:*
  - Use Astro component or embed form code
  - Show privacy/disclaimer text
  - Responsive, accessible, keyboard friendly

---

### 6. **Footer**
- Links: About, Terms, Privacy, Affiliate Disclosure
- Social or Pinterest sharing links (optional)
- *Implementation notes:*
  - Use `<footer>` with clear separation from main content
  - Responsive layout (stacked on mobile)
  - Add copyright and year
  - Social links: SVG icons, open in new tab

---

## 📲 Mobile UX Considerations
- Sticky CTA or bottom bar: "🎁 Try Gift Finder"
- Tap-to-reveal gift descriptions to reduce scroll
- Vertical stacking of form inputs
- Large, touch-friendly buttons for style filters
- Results/cards stack vertically on mobile

---

## 🔄 Dynamic Content Behavior
- Blog cards on homepage auto-populate from latest posts
- Tool output refreshes without page reload
- Blog links open in same tab; affiliate links open in new tab
- Regenerate button triggers new AI call and animates results
- Favorites persist in localStorage

---

## ⭐️ Next Action: Tool Section Completion
**Priority:**
- Complete the Tool Section (form, style selector, results, regenerate, favorites, error handling, accessibility, affiliate link placeholder)
- Once Tool Section is solid, move to Featured Gift Guides Grid and About/SEO block

**Would you like a step-by-step pseudocode and implementation plan for the Tool Section next?**

## 🟢 Progress Notes
- Regenerate Suggestions button and Amazon affiliate link added to result cards.
- Accessibility improved: ARIA roles/labels, radio group for style selector, results as live region.
- Error/empty state polish: clear, accessible messages for empty, error, and incomplete form states. Client-side validation added.
- Results section moved above blog grid for improved UX and alignment with layout plan.
- Next: move to Featured Gift Guides Grid section of homepage.

