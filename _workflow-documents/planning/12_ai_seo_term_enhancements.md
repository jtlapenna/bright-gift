# 12. AI SEO Term Enhancements

This document outlines a step-by-step plan to boost BrightGift's SEO presence for AI-related gift search terms, and tracks progress on each action item.

---

## 1. Homepage Enhancements

### 1.1 Add AI-focused FAQ section
- **Questions to include:**
  - How does the AI Gift Idea Generator work?
  - What makes AI gift suggestions better?
- **Action:**
  - Draft FAQ content and add to homepage below the main tool section.
  - Implement FAQPage schema for this section.

### 1.2 Sprinkle more AI-related phrases
- **Action:**
  - Add phrases like “AI-powered gift suggestions”, “AI gift search”, “AI gift matching”, and “AI gift tool” to homepage headings, intro, and visible text.

### 1.3 Update image alt text
- **Action:**
  - Ensure homepage and tool images use alt text such as “AI gift idea generator interface” and “AI-powered gift suggestions”.

---

## 2. Blog Post Updates

### 2.1 Add AI context to intros/conclusions
- **Action:**
  - In top-performing and new posts, add a paragraph in the intro or conclusion about using the AI Gift Idea Generator for personalized ideas.

### 2.2 Insert internal links
- **Action:**
  - Add internal links to the homepage/tool using anchor text like “AI gift idea generator” or “AI-powered gift finder” in every post.

### 2.3 Add AI keywords to meta titles/descriptions
- **Action:**
  - Update metaTitle and metaDescription in relevant posts to include “AI” and related terms.

---

## 3. New Content Creation

### 3.1 Write a dedicated AI-focused blog post
- **Action:**
  - Example topics: “Best AI Gift Idea Generators Compared”, “How AI is Changing Gift Shopping”.
  - Draft and publish at least one new post targeting “AI gift idea generator”.

### 3.2 Create an “AI Gift Guide” landing page
- **Action:**
  - Aggregate all AI-related content and tools on a single landing page.
  - Optimize for “AI Gift Guide”, “AI Gift Finder”, and similar terms.

---

## 4. Technical SEO

### 4.1 Add FAQPage schema
- **Action:**
  - Implement FAQPage schema on homepage and new AI-focused blog posts.

### 4.2 Review and update structured data
- **Action:**
  - Ensure all schema mentions “AI Gift Idea Generator” where appropriate.

---

## 5. Quick Wins

### 5.1 Update 2–3 top-performing blog posts
- **Action:**
  - Add AI mentions and internal links to these posts.

### 5.2 Add at least 3 new internal links
- **Action:**
  - Use “AI gift” anchor text in relevant posts.

### 5.3 Ensure homepage and tool images have AI-focused alt text
- **Action:**
  - Review and update image alt attributes as needed.

---

## Progress Tracker

- [x] 1.1 Add AI-focused FAQ section
- [x] 1.2 Sprinkle more AI-related phrases
- [x] 1.3 Update image alt text
- [x] 2.1 Add AI context to intros/conclusions
- [x] 2.2 Insert internal links
- [x] 2.3 Add AI keywords to meta titles/descriptions
- [x] 3.1 Write a dedicated AI-focused blog post
- [x] 3.2 Create an "AI Gift Guide" landing page
- [x] 4.1 Add FAQPage schema
- [x] 4.2 Review and update structured data
- [x] 5.1 Update 2–3 top-performing blog posts
- [x] 5.2 Add at least 3 new internal links
- [x] 5.3 Ensure homepage and tool images have AI-focused alt text

---

# Begin Execution

## 1.1 Add AI-focused FAQ section

**Draft FAQ Content:**

**Q: How does the AI Gift Idea Generator work?**
A: Our AI Gift Idea Generator uses advanced artificial intelligence to analyze your recipient's interests, style, and budget. It then suggests unique, thoughtful gifts by matching your input to a curated database of products and ideas, ensuring every recommendation is relevant and personalized.

**Q: What makes AI gift suggestions better?**
A: AI gift suggestions are tailored to your needs in real time. Unlike generic lists, our AI considers your recipient's personality, preferences, and occasion, delivering creative and unexpected ideas you might not find elsewhere. This saves you time and helps you discover truly memorable gifts.

**Next:**
- Add this FAQ block to the homepage below the main tool section.
- Implement FAQPage schema for these questions.

---

## 3.1 Write a dedicated AI-focused blog post

**Topic: "How AI is Revolutionizing Gift Shopping: A Complete Guide"**

**Target Keywords:**
- "AI gift idea generator"
- "AI gift shopping"
- "AI gift recommendations"
- "AI gift finder"
- "artificial intelligence gifts"

**Outline:**
1. Introduction: The rise of AI in gift shopping
2. How AI gift generators work
3. Benefits of AI-powered gift suggestions
4. Top AI gift tools compared
5. Tips for using AI gift generators effectively
6. The future of AI in gift shopping
7. Conclusion with CTA to try our AI tool

**Next:**
- Draft the complete blog post
- Optimize for target keywords
- Include internal links to existing gift guides
- Add FAQPage schema

---

## 3.2 Create an "AI Gift Guide" landing page

**Status: ✅ COMPLETED**

**Created:** `src/pages/ai-gift-guide.astro`
- Comprehensive AI gift guide landing page
- Optimized for AI-related keywords
- Includes FAQPage schema
- Features AI-related blog posts
- Multiple CTAs to main tool

**Next:**
- Add FAQPage schema to homepage
- Review and update structured data across site

---

## 4.1 Add FAQPage schema

**Next Steps:**
- Add FAQPage schema to homepage FAQ section
- Ensure schema is properly structured with @type, mainEntity, etc.
- Test schema with Google's Rich Results Test

**Schema Structure:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does the AI Gift Idea Generator work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our AI Gift Idea Generator uses advanced artificial intelligence..."
      }
    }
  ]
}
```

---

## 4.2 Review and update structured data

**Areas to Update:**
- Homepage structured data (WebSite, Organization, Breadcrumb)
- Blog post structured data (Article, Breadcrumb)
- AI Gift Guide page structured data (WebPage, FAQPage)
- Ensure all schema mentions "AI Gift Idea Generator" where appropriate 