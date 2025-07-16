# 📚 Bookshop.org Integration Guide for BrightGift

## Overview
This guide outlines how to incorporate Bookshop.org affiliate links into both the AI gift generator tool and blog posts, providing ethical book-buying alternatives to Amazon.

---

## 🛠 Gift Generator Tool Integration

### Current Implementation Status
✅ **Completed:**
- Added `book-lover` style option to homepage
- Updated API routing logic for book-related items
- Added Bookshop.org affiliate link generation
- Updated UI to display "Find on Bookshop.org" for book items
- Removed Etsy integration (pending approval)

### Technical Implementation

#### 1. API Route Updates (`src/pages/api/generate.ts`)
```typescript
// Helper to generate Bookshop.org affiliate link
function generateBookshopLink(keywords: string, affiliateId: string) {
  const searchQuery = encodeURIComponent(keywords);
  return `https://bookshop.org/search?keywords=${searchQuery}&affiliate=${affiliateId}`;
}

// Helper to generate direct Bookshop.org book link (when ISBN is available)
function generateBookshopDirectLink(isbn: string, affiliateId: string) {
  return `https://bookshop.org/a/${affiliateId}/${isbn}`;
}

// Book detection logic in gift parsing
} else if (/book|reading|literature|novel|author|fiction|nonfiction|poetry|magazine|journal/i.test(tag) || /book|reading|literature|novel|author|fiction|nonfiction|poetry|magazine|journal/i.test(title)) {
  // Bookshop.org for book-related items
  link = generateBookshopLink(title, bookshopAffiliateId);
  const icon = 'Book';
  ideas.push({ title, description, tag, link, icon });
}
```

#### 2. Environment Variables
Add to Cloudflare Pages environment:
```
BOOKSHOP_AFFILIATE_ID=brightgift
```

#### 3. Style Definitions (`src/utils/promptBuilder.js`)
```javascript
'book-lover': 'books, reading accessories, literary-themed items, bookmarks, reading lights, or book-related gifts'
```

---

## 📝 Blog Post Integration

### Affiliate Link Format
**Direct Book Links (Preferred):**
```html
<a href="https://bookshop.org/a/brightgift/9780525559474" class="amazon-link" target="_blank" rel="noopener">View on Bookshop.org</a>
```

**Search Links (Fallback):**
```html
<a href="https://bookshop.org/search?keywords=book+title+keywords&affiliate=brightgift" class="amazon-link" target="_blank" rel="noopener">View on Bookshop.org</a>
```

### Blog Post Template Updates

#### 1. Frontmatter Schema (`src/content/config.ts`)
```typescript
affiliateLinks: z.array(z.object({
  text: z.string(),
  url: z.string(),
      platform: z.enum(['amazon', 'bookshop', 'other']).optional(),
})).optional(),
```

#### 2. Blog Post Example
```markdown
---
title: "25 Thoughtful Gifts for Book Lovers Under $50"
description: "Discover perfect gifts for the bibliophiles in your life, from cozy reading accessories to must-read books."
affiliateLinks:
  - text: "The Midnight Library by Matt Haig"
    url: "https://bookshop.org/a/brightgift/9780525559474"
    platform: "bookshop"
  - text: "Cozy Reading Blanket"
    url: "https://www.amazon.com/s?k=reading+blanket&tag=bright-gift-20"
    platform: "amazon"
---
```

### Content Guidelines

#### 1. Book Categories to Target
- **Fiction:** Novels, short stories, poetry collections
- **Non-fiction:** Self-help, biographies, cookbooks, travel guides
- **Reading Accessories:** Bookmarks, reading lights, book stands
- **Literary Gifts:** Book-themed jewelry, book club subscriptions
- **Children's Books:** Picture books, chapter books, educational books

#### 2. Blog Post Ideas
- "Best Books for [Interest] Lovers"
- "Gifts for Book Club Enthusiasts"
- "Reading Accessories Every Bookworm Needs"
- "Children's Books for [Age Group]"
- "Coffee Table Books for [Interest]"

#### 3. SEO Keywords
- "books for [interest] lovers"
- "reading gifts"
- "book lover gifts"
- "literary gifts"
- "book club gifts"
- "reading accessories"

---

## 🔗 Affiliate Program Setup

### 1. Bookshop.org Affiliate Program
- **Commission:** 10% on all sales
- **Cookie Duration:** 30 days
- **Payment:** Monthly via check or PayPal
- **Minimum Payout:** $10

### 2. Application Process
1. Visit [bookshop.org/affiliate](https://bookshop.org/affiliate)
2. Fill out application form
3. Provide website URL and traffic information
4. Wait for approval (typically 1-2 business days)
5. Receive affiliate ID and tracking links

### 3. Tracking and Analytics
- Bookshop.org provides affiliate dashboard
- Track clicks, conversions, and earnings
- Monitor performance by book category
- Compare with Amazon book sales

---

## 📊 Performance Optimization

### 1. Content Strategy
- **Seasonal Content:** Back-to-school, holiday reading lists
- **Niche Targeting:** Specific genres, age groups, interests
- **Gift Guides:** Combine books with related accessories
- **Author Spotlights:** Feature specific authors or series

### 2. Link Placement
- **Primary:** Direct book recommendations
- **Secondary:** Reading accessories and related items
- **Tertiary:** Gift combinations (book + bookmark + tea)

### 3. A/B Testing
- Test "View on Bookshop.org" vs "Find on Bookshop.org"
- Compare book-only posts vs mixed affiliate posts
- Monitor conversion rates by book category

---

## 🎯 Implementation Checklist

### Phase 1: Basic Integration ✅
- [x] Add Bookshop.org routing logic to API
- [x] Update gift generator UI
- [x] Add book-lover style option
- [x] Update affiliate link display logic

### Phase 2: Blog Integration
- [ ] Update content schema for Bookshop.org
- [ ] Create book-focused blog post templates
- [ ] Add Bookshop.org to affiliate disclosure
- [ ] Create book gift guide examples

### Phase 3: Content Creation
- [ ] Write 3-5 book-focused blog posts
- [ ] Create seasonal reading lists
- [ ] Develop author/genre-specific guides
- [ ] Test and optimize conversion rates

### Phase 4: Advanced Features
- [ ] Add book category filtering
- [ ] Implement book price comparison
- [ ] Create reading level recommendations
- [ ] Add book club integration

---

## 💡 Best Practices

### 1. Content Quality
- Recommend books you've actually read or researched
- Include diverse authors and genres
- Provide context for why each book is recommended
- Update recommendations regularly

### 2. Ethical Considerations
- Emphasize Bookshop.org's support for independent bookstores
- Highlight the environmental benefits of local bookstores
- Be transparent about affiliate relationships
- Balance Bookshop.org with other affiliate sources

### 3. User Experience
- Make it clear when links go to Bookshop.org vs Amazon
- Provide multiple options when possible
- Include price ranges and availability
- Offer gift combination suggestions

---

## 📈 Revenue Projections

### Conservative Estimates
- **Book-focused posts:** $50-100/month per post
- **Mixed affiliate posts:** $20-40/month book revenue
- **Seasonal content:** 2-3x normal revenue during holidays

### Optimization Opportunities
- Target high-value book categories (cookbooks, business books)
- Create gift bundles (book + accessory)
- Develop author-specific content
- Leverage book club and reading challenge trends

---

## 🔄 Maintenance and Updates

### Monthly Tasks
- Review affiliate performance data
- Update book recommendations for new releases
- Check for broken affiliate links
- Analyze conversion rates by book category

### Quarterly Tasks
- Audit all book-related content
- Update seasonal reading lists
- Review and optimize underperforming posts
- Plan new book-focused content

### Annual Tasks
- Review affiliate program terms and rates
- Update disclosure statements
- Analyze year-over-year performance
- Plan major content strategy updates 