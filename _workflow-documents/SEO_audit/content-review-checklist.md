# Content Review Checklist
**Purpose:** Ensure all blog content meets SEO standards before publication  
**Status:** MANDATORY - All content must pass this checklist  
**Updated:** January 27, 2025

---

## 📋 **PRE-PUBLICATION CHECKLIST**

### **✅ CRITICAL REQUIREMENTS (Must Pass)**

#### **1. Image Standards**
- [ ] **NO imageJpg references** - Only use .webp images
- [ ] **All images are .webp format** - No .jpg, .png, or other formats
- [ ] **Images have descriptive alt attributes** - For accessibility and SEO
- [ ] **Images are optimized** - Compressed and properly sized

#### **2. Structured Data**
- [ ] **NO fake ratings** - No hardcoded "4.8" ratings or "150" review counts
- [ ] **Only real data** - If no real reviews, remove rating structured data entirely
- [ ] **Valid JSON-LD** - All structured data validates correctly

#### **3. Affiliate Links**
- [ ] **Correct rel attributes** - Use `rel="sponsored noopener"` for all affiliate links
- [ ] **NO nofollow** - Never use `rel="nofollow"` for affiliate links
- [ ] **Consistent formatting** - All affiliate links follow same pattern

#### **4. Canonical URLs**
- [ ] **Full domain** - Must start with `https://bright-gift.com/blog/`
- [ ] **Trailing slash** - Must end with `/`
- [ ] **Correct format** - `https://bright-gift.com/blog/post-slug/`

#### **5. Favicon Files**
- [ ] **All favicon files exist** - No 404 errors for missing favicons
- [ ] **Proper favicon references** - Only reference existing files
- [ ] **Multiple sizes available** - Apple touch icon, 32x32, 16x16

#### **6. Security Headers**
- [ ] **Security headers enabled** - Not commented out
- [ ] **Proper configuration** - X-Frame-Options, CSP, etc.
- [ ] **SEO-friendly headers** - No blocking headers

---

### **✅ HIGH PRIORITY (Should Pass)**

#### **5. Meta Tags**
- [ ] **Title length** - 10-60 characters (optimal: 30-50)
- [ ] **Description length** - 120-160 characters (optimal: 140-150)
- [ ] **Unique content** - No duplicate titles or descriptions
- [ ] **Keywords included** - Relevant keywords in title and description

#### **6. Content Quality**
- [ ] **Word count** - Minimum 800 words for blog posts
- [ ] **Readability** - Clear, engaging, and well-structured
- [ ] **Internal links** - Links to other relevant blog posts
- [ ] **External links** - Links to authoritative sources

#### **7. Technical SEO**
- [ ] **Heading structure** - Proper H1, H2, H3 hierarchy
- [ ] **URL slug** - Descriptive, keyword-rich, and readable
- [ ] **No broken links** - All links work and point to valid pages
- [ ] **Mobile-friendly** - Content displays well on mobile devices

---

### **✅ MEDIUM PRIORITY (Nice to Have)**

#### **8. Social Media**
- [ ] **Open Graph tags** - og:title, og:description, og:image
- [ ] **Twitter cards** - twitter:title, twitter:description, twitter:image
- [ ] **Social images** - Optimized images for social sharing

#### **9. Performance**
- [ ] **Fast loading** - Images optimized for web
- [ ] **No large files** - No unnecessary large assets
- [ ] **Clean code** - No unnecessary HTML or CSS

#### **10. Accessibility**
- [ ] **Alt text** - All images have descriptive alt attributes
- [ ] **Color contrast** - Text is readable against background
- [ ] **Keyboard navigation** - Content is accessible via keyboard

---

## 🚫 **WHAT TO NEVER DO**

### **Content Creation:**
- ❌ **Never use imageJpg fields** - Causes 404 errors
- ❌ **Never add fake structured data** - Risk of Google penalties
- ❌ **Never use rel="nofollow" for affiliate links** - Use "sponsored" instead
- ❌ **Never create malformed canonical URLs** - Must include full domain and trailing slash

### **Technical Issues:**
- ❌ **Never use JavaScript redirects** - Use Astro.redirect() instead
- ❌ **Never skip image optimization** - Always use .webp format
- ❌ **Never ignore mobile optimization** - Ensure responsive design
- ❌ **Never skip alt attributes** - Required for accessibility and SEO

---

## 🔧 **VALIDATION COMMANDS**

### **Before Publishing:**
```bash
# Run complete SEO validation
npm run seo:validate

# Run content-specific validation
npm run seo:validate:content

# Run template validation
npm run seo:validate:templates

# Check for critical issues
grep -r "imageJpg" src/
grep -r "ratingValue.*4.8" src/
grep -r "rel=\"nofollow noopener\"" src/content/blog/
```

### **After Publishing:**
```bash
# Verify sitemap includes new content
grep "your-post-slug" public/sitemap.xml

# Check for broken links
npm run check-links

# Validate structured data
# Use Google Rich Results Test tool
```

---

## 📊 **SUCCESS METRICS**

### **Technical Metrics:**
- [ ] 0 imageJpg references in codebase
- [ ] 0 fake structured data ratings
- [ ] 100% affiliate links use rel="sponsored"
- [ ] All canonical URLs properly formatted

### **Content Metrics:**
- [ ] All titles 10-60 characters
- [ ] All descriptions 120-160 characters
- [ ] All images are .webp format
- [ ] All images have alt attributes

### **SEO Metrics:**
- [ ] No broken image errors in GSC
- [ ] Structured data validates in Rich Results Test
- [ ] No canonical URL errors
- [ ] Improved crawl efficiency

---

## 📝 **REVIEW PROCESS**

### **Step 1: Content Creation**
1. Write blog post following content guidelines
2. Add all required frontmatter fields
3. Optimize images to .webp format
4. Add proper alt attributes to images

### **Step 2: Pre-Validation**
1. Run `npm run seo:validate:content`
2. Fix any errors found
3. Re-run validation until all errors are resolved

### **Step 3: Template Check**
1. Run `npm run seo:validate:templates`
2. Fix any template issues
3. Ensure no imageJpg references

### **Step 4: Final Validation**
1. Run `npm run seo:validate` (complete check)
2. Verify all checklist items are met
3. Test on mobile devices

### **Step 5: Publication**
1. Deploy changes
2. Verify sitemap includes new content
3. Check GSC for any new errors
4. Monitor performance metrics

---

## ⚠️ **EMERGENCY PROCEDURES**

### **If SEO Validation Fails:**
1. **Stop deployment immediately**
2. **Review error messages carefully**
3. **Fix all critical issues first**
4. **Re-run validation until it passes**
5. **Only then proceed with deployment**

### **If Issues Found After Publication:**
1. **Identify the specific problem**
2. **Fix the issue immediately**
3. **Re-deploy with fix**
4. **Monitor GSC for resolution**
5. **Update prevention measures**

---

**This checklist ensures consistent SEO quality and prevents the recurring issues that have plagued the site.**
