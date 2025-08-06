# BrightGift Affiliate Linking Guide

## 📋 **Overview**

Comprehensive guide for creating effective affiliate links across all platforms. Ensures proper formatting, tracking, and user experience while maintaining BrightGift's standards.

**Platforms:** Amazon, Bookshop.org, Afrofiliate
**Goal:** Maximize conversions while providing value to readers
**Standard:** Professional, consistent link formatting

---

## 🔗 **Amazon Affiliate Links**

### **Link Structure:**
```
https://www.amazon.com/s?k=KEYWORD&tag=bright-gift-20
```

### **Formatting Requirements:**
- **Affiliate ID:** Always use `bright-gift-20`
- **Class:** Use `amazon-link` for consistent styling
- **Target:** `target="_blank" rel="noopener"`
- **Anchor Text:** "View on Amazon"

### **Example:**
```html
<a href="https://www.amazon.com/s?k=plant+stand&tag=bright-gift-20" class="amazon-link" target="_blank" rel="noopener">View on Amazon</a>
```

### **How to Construct Search Links:**
1. Use: `https://www.amazon.com/s?k=[search-keywords]&tag=bright-gift-20`
2. Replace `[search-keywords]` with plus-separated product keywords
3. Example: `plant+stand` for "plant stand"

### **Best Practices:**
- Use specific, relevant keywords for better search results
- Ensure products are high-quality and appropriate
- Only link to products that genuinely fit the gift guide theme

---

## 📚 **Bookshop.org Affiliate Links**

### **Direct Book Linking (Preferred Method):**

#### **Why Use Direct Links:**
- **Higher conversion rates** - Users land directly on the book page
- **Better user experience** - No search results to navigate
- **More accurate tracking** - Direct attribution to specific books
- **Professional appearance** - Clean, direct links

#### **Link Format:**
```
https://bookshop.org/a/brightgift/ISBN
```

#### **Example:**
```html
<a href="https://bookshop.org/a/brightgift/9780525559474" class="bookshop-link" target="_blank" rel="noopener">View on Bookshop.org</a>
```

### **Search Links (Fallback Method):**
```
https://bookshop.org/search?keywords=BOOK+KEYWORDS&affiliate=brightgift
```

#### **Example:**
```html
<a href="https://bookshop.org/search?keywords=midnight+library+matt+haig&affiliate=brightgift" class="bookshop-link" target="_blank" rel="noopener">View on Bookshop.org</a>
```

### **How to Find ISBNs:**
1. **Bookshop.org Search:** Search for the book and find ISBN in product details
2. **Google Books:** Search "book title author ISBN" on Google
3. **Amazon Product Page:** Check "Product Details" for ISBN-13 or ISBN-10
4. **Library of Congress:** Visit loc.gov and search for the book

### **Popular Book ISBNs:**
- **The Midnight Library** by Matt Haig: `9780525559474`
- **Atomic Habits** by James Clear: `9780735211292`
- **The Psychology of Money** by Morgan Housel: `9780857197689`
- **The Very Hungry Caterpillar** by Eric Carle: `9780399226908`

---

## 🌟 **Afrofiliate Links (Black-Owned Businesses)**

### **Link Structure:**
```
https://www.arjdj2msd.com/7LKLK3/[BRAND_CODE]/
```

### **Formatting Requirements:**
- **Class:** Use `afrofiliate-link` for styling
- **Target:** `target="_blank" rel="noopener"`
- **Anchor Text:** "Shop [Brand Name]"

### **Complete Brand Code Reference:**

#### **Skincare & Beauty:**
- **BeautyStat** (science-backed skincare): `QWRG9C`
- **Kadalys** (organic, banana-powered skincare): `RC9DWS`

#### **Athletic Wear & Equipment:**
- **Furi Sport** (high-performance sportswear): `R2Z4H6`
- **Be Yourself 314** (dance fitness apparel): `24BMB4P`

#### **Stationery & Gifts:**
- **Be Rooted** (inclusive stationery): `R74QP1`

#### **Health & Wellness:**
- **Endorf** (mushroom-based wellness): `24D26TB`

#### **Coffee:**
- **Caribe Coffee** (sustainable coffee): `24R58Q6`

#### **Cashback Programs:**
- **Cashblack UK** (new members earn £5): `2CTPL1`
- **Cashblack US** (new members earn $5): `M823SF`

### **Example:**
```html
<a href="https://www.arjdj2msd.com/7LKLK3/QWRG9C/" class="afrofiliate-link" target="_blank" rel="noopener">Shop BeautyStat</a>
```

---

## 📝 **Blog Post Implementation**

### **Frontmatter Example:**
```yaml
---
title: "25 Amazing Gifts from Black-Owned Businesses"
affiliateLinks:
  - text: "BeautyStat Universal C Serum"
    url: "https://www.arjdj2msd.com/7LKLK3/QWRG9C/"
    platform: "afrofiliate"
    brand: "beautystat"
  - text: "The Midnight Library by Matt Haig"
    url: "https://bookshop.org/a/brightgift/9780525559474"
    platform: "bookshop"
  - text: "Plant Stand"
    url: "https://www.amazon.com/s?k=plant+stand&tag=bright-gift-20"
    platform: "amazon"
---
```

### **In-Content Link Examples:**

#### **Amazon:**
```html
<a href="https://www.amazon.com/s?k=plant+stand&tag=bright-gift-20" class="amazon-link" target="_blank" rel="noopener">View on Amazon</a>
```

#### **Bookshop.org:**
```html
<a href="https://bookshop.org/a/brightgift/9780525559474" class="bookshop-link" target="_blank" rel="noopener">View on Bookshop.org</a>
```

#### **Afrofiliate:**
```html
<a href="https://www.arjdj2msd.com/7LKLK3/QWRG9C/" class="afrofiliate-link" target="_blank" rel="noopener">Shop BeautyStat</a>
```

---

## 🎯 **Product Recommendation Strategies**

### **Natural Gift Selection:**
- **Prioritize quality and relevance** over artificial platform diversity
- Only include affiliate links that are genuinely relevant and valuable
- Ensure all linked products are high-quality and appropriate for the audience
- Don't force variety across affiliate platforms if it doesn't make sense for the specific gift guide

### **Platform Selection Guidelines:**

#### **Amazon:**
- Use for general products, electronics, home goods, etc.
- Best for specific product searches
- Good for price comparison and reviews

#### **Bookshop.org:**
- Use for all book recommendations
- Preferred for supporting independent bookstores
- Direct ISBN links for best conversion

#### **Afrofiliate:**
- Use for Black-owned business products
- Relevant for skincare, athletic wear, stationery, wellness, coffee
- Supports diverse entrepreneurship

---

## 🚨 **Important Requirements**

### **Affiliate Disclosure:**
- **Do NOT include affiliate disclosure** in the content
- **Disclosure is handled by the template** (appears automatically)
- This ensures consistent, compliant disclosure across all posts

### **Link Quality Standards:**
- **Relevance:** Only link to products that genuinely fit the gift guide
- **Quality:** Ensure all products are high-quality and appropriate
- **Value:** Links should provide genuine value to readers
- **Accuracy:** Verify all links work and point to correct products

### **Formatting Consistency:**
- Always use appropriate CSS classes (`amazon-link`, `bookshop-link`, `afrofiliate-link`)
- Include `target="_blank" rel="noopener"` for all external links
- Use consistent anchor text for each platform
- Ensure proper HTML escaping in markdown

---

## 📋 **Quality Checklist**

### **Before Publishing:**
- [ ] All affiliate links properly formatted
- [ ] Correct affiliate IDs used for each platform
- [ ] Appropriate CSS classes applied
- [ ] Links open in new tab with proper attributes
- [ ] Anchor text is consistent and professional
- [ ] No affiliate disclosure in content (handled by template)
- [ ] All links are relevant and valuable
- [ ] Products are high-quality and appropriate

### **Platform-Specific Checks:**
- [ ] **Amazon:** `tag=bright-gift-20` included
- [ ] **Bookshop.org:** Direct ISBN links preferred, fallback to search
- [ ] **Afrofiliate:** Correct brand codes used
- [ ] All links tested and functional

---

*This is the single source of truth for all BrightGift affiliate linking guidelines.* 