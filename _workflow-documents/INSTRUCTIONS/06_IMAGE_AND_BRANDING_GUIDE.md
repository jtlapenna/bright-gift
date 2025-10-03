# BrightGift Image and Branding Guide

## 📋 **Overview**

This is the single source of truth for all visual branding, image creation, and design guidelines for BrightGift. It consolidates all branding and visual elements into one comprehensive guide.

**Purpose:** Ensure consistent, on-brand visual identity across all content and platforms
**Style:** Modern, playful, optimistic with 3D cartoon objects and 2D illustrated elements
**Goal:** Create recognizable, engaging visual content that reflects BrightGift's helpful nature

---

## 🎨 **Brand Identity**

### **Core Brand Elements**
- **Brand Name:** BrightGift
- **Tagline:** *"Find the Perfect Gift with AI!"*
- **Mission:** Help people find thoughtful, personalized gifts using AI technology
- **Personality:** Helpful, optimistic, modern, approachable, trustworthy

### **Brand Values**
- **Thoughtfulness:** Every recommendation is carefully considered
- **Accessibility:** Gift-giving made easy for everyone
- **Quality:** High-quality suggestions and content
- **Inclusivity:** Gifts for all people, occasions, and budgets
- **Innovation:** AI-powered personalization

---

## 🎨 **Visual Brand Style**

### **Overall Aesthetic**
- **Tone:** Editorial, playful, optimistic
- **Style:** Mix of 3D cartoonish objects and 2D illustrated embellishments
- **Composition:** Clean, tidy, balanced with strong negative space
- **Mood:** Cheerful, light, creative, giftable
- **Approach:** Never realistic or photorealistic

### **Visual Elements**
- **3D Objects:** Soft, rounded, cartoon-style products and gifts
- **2D Elements:** Sparkles, swirls, illustrated shadows, decorative accents
- **Shapes:** Rounded, friendly, giftable forms
- **Layouts:** Flat-lay scenes, tidy clusters, centered compositions
- **Backgrounds:** Clean, subtle textures or gradients, never cluttered

---

## 🌈 **Color Palette**

### **✅ VERIFIED AGAINST LIVE CODEBASE**

**Note:** These colors have been verified against the actual website implementation (`src/pages/*.astro`).

### **Official BrightGift Brand Colors:**

| Color Name        | HEX        | Usage                              |
|-------------------|------------|-------------------------------------|
| **Deep Blue**     | `#1C2E4A`  | Header background, footers, headings |
| **Coral Accent**  | `#FF6B6B`  | CTA buttons, highlights, accents    |
| **Lemon Yellow**  | `#FFDE59`  | Icons, chips, style filter hovers  |
| **Light Teal**    | `#A3E4DB`  | Backgrounds, cards, form borders    |
| **White**         | `#FFFFFF`  | Text background, clean space        |
| **Charcoal Gray** | `#333333`  | Body text, secondary text           |

### **Supporting Colors:**

| Color Name        | HEX        | Usage                              |
|-------------------|------------|-------------------------------------|
| **Cream Background** | `#FEF2D3`  | Hero section, header backgrounds   |
| **Coral Hover**   | `#ff4c4c`  | Button hover states               |
| **Yellow Gradient** | `#FFE066`  | Gradient variations               |
| **Teal Gradient** | `#B8E8E0`  | Light teal variations             |

### **Color Usage Guidelines**
- **Use generous white space** with bursts of color for hierarchy
- **Maintain WCAG AA contrast ratios** for accessibility
- **Primary colors** should dominate in images and key UI elements
- **Supporting colors** provide structure and readability

---

## 📝 **Typography**

### **Font Hierarchy**

| Use Case           | Font                     | Style & Notes                         |
|--------------------|--------------------------|---------------------------------------|
| **Logo – "Bright"** | Pacifico or Fredoka      | Handwritten, playful feel            |
| **Logo – "Gift"**   | Poppins or Nunito        | Rounded sans serif, clean             |
| **Headers**         | Poppins / Raleway        | Medium/Bold weight, sentence case     |
| **Body Text**       | Open Sans / Inter        | Light to Regular weight               |
| **Buttons & CTAs**  | Poppins Bold             | Uppercase or sentence case            |

### **Typography Guidelines**
- **Consistent line heights** and letter spacing for mobile responsiveness
- **Sentence case** preferred over ALL CAPS for headers
- **Generous spacing** between elements for readability
- **Clear hierarchy** with distinct size differences between levels

---

## 🖼️ **Image Creation Guidelines**

### **Image Types and Specifications**

#### **Blog Banner Images**
- **Size:** 1536×1024px (3:2 aspect ratio) ✅ **VERIFIED**
- **Format:** WebP for optimization (with JPG fallback)
- **Text:** NO text or logos allowed
- **Purpose:** Main blog post hero image (displays at 384px height)
- **Style:** Horizontal layout with gift-themed objects
- **Schema:** Used in structured data with 1024×1536 reference

#### **Open Graph (OG) Images**
- **Size:** 1536×1024px (3:2 landscape) ✅ **VERIFIED**
- **Format:** WebP for optimization (with JPG fallback)
- **Text:** NO text or logos allowed
- **Purpose:** Social media link previews, Twitter cards
- **Style:** Horizontal layout optimized for social sharing
- **Usage:** Falls back to banner image if not provided

#### **Social Media Images**
- **Size:** 1200×1200px (1:1 square ratio) ✅ **VERIFIED**
- **Format:** WebP for optimization
- **Text:** Text allowed and encouraged (include blog title)
- **Purpose:** Instagram, Pinterest, Facebook posts
- **Style:** Square layout with prominent title text
- **Usage:** Falls back to OG image if not provided

#### **Blog Index Thumbnails**
- **Size:** Uses banner image, displayed with `aspect-[3/2]`
- **Display:** Responsive grid layout with `object-cover`
- **Loading:** Lazy loading for performance

### **Image Style Requirements**

#### **BrightGift Style Signature**
Every image must include this exact style specification:

*"Modern flat illustration with soft 3D-style characters and objects, combined with subtle 2D decorative elements. Use warm, vibrant pastels (light teal #A3E4DB, coral #FF6B6B, lemon yellow #FFDE59). Layout must be clean and giftable, using rounded forms, balanced negative space, and minimal visual clutter. The tone should feel cheerful, light, editorial, and creative — never realistic or photorealistic."*

**✅ Note:** Colors verified against live website implementation.

#### **Visual Elements to Include**
- **3D Objects:** Soft, cartoon-style gifts, products, accessories
- **2D Accents:** Sparkles, swirls, illustrated shadows, decorative elements
- **Floating Elements:** Subtle motion lines, floating sparkles
- **Clean Composition:** Balanced, tidy, grid-aware layouts

#### **Visual Elements to Avoid**
- **Realism:** No photorealistic elements or materials
- **Complex Backgrounds:** Keep backgrounds clean and simple
- **Clutter:** Avoid busy or overwhelming compositions
- **Dark Themes:** Maintain bright, optimistic mood
- **Generic Stock Photos:** All images should feel custom and on-brand

---

## 🎨 **Image Prompt Templates**

**📋 Note:** For detailed image prompt instructions and templates, see the dedicated **[Image Agent Instructions](../IMAGE_AGENT_INSTRUCTIONS.md)** file.

This file contains:
- Complete prompt templates for banner and OG images
- BrightGift style signature requirements
- Creativity and variety guidelines
- JSON output format specifications
- Example prompts for different content types

**Key Requirements:**
- **Banner images:** 3:2 ratio (1536×1024), no text or logos
- **OG images:** 3:2 ratio (1536×1024), no text or logos  
- **Style:** Modern flat illustration with 3D cartoon objects and 2D decorative elements
- **Colors:** Warm pastels (teal #00A99D, coral-orange #FF6B35, sunshine yellow #FFD700)
- **Tone:** Cheerful, light, editorial, creative — never realistic or photorealistic

---

## 🎯 **Logo Usage Guidelines**

### **Logo Components**
- **Primary Logo:** "Bright" in script font + "Gift" in rounded sans serif with gift box and sparkles icon
- **Icon Alone:** Confetti-wrapped gift box in coral or yellow
- **Favicon:** Minimalistic spark or ribbon icon in solid color

### **Logo Usage Rules**
- **Background:** Use only on solid white or deep blue backgrounds
- **Avoid:** Complex backgrounds, low contrast situations
- **Sizing:** Maintain minimum size for readability
- **Spacing:** Provide adequate clear space around logo

---

## 🎨 **UI Elements Style Guide**

### **Button Design**
- **Style:** Rounded corners, coral fill (#FF6B35), white text
- **Hover:** Soft hover effect with slight color shift
- **Typography:** Poppins Bold, sentence case or uppercase
- **Sizing:** Large enough for mobile touch targets (44px minimum)

### **Style Filter Chips**
- **Style:** Pastel chips with emoji icons
- **Colors:** Light versions of brand colors
- **Examples:** 🌱 (eco-friendly), 🌈 (colorful), 🖐️ (handmade), 🎉 (fun)
- **Hover:** Yellow (#FFD700) background on hover

### **Cards**
- **Style:** Rounded corners, subtle drop shadow
- **Content:** Image + short description + CTA
- **Background:** White or light teal (#A3E4DB)
- **Spacing:** Generous padding and consistent margins

### **Form Fields**
- **Style:** Rounded inputs with light teal borders
- **Focus:** Coral accent color for active states
- **Typography:** Open Sans for input text
- **Validation:** Clear error states with appropriate colors

### **Navigation**
- **Style:** Fixed top navigation, deep blue background (#1C2E4A)
- **Links:** White text with hover underline
- **Typography:** Poppins Medium for navigation items
- **Mobile:** Responsive hamburger menu

### **Footer**
- **Style:** Deep blue background (#1C2E4A), white text
- **Content:** Inline iconography, social links
- **Typography:** Open Sans Regular
- **Layout:** Organized columns with clear sections

---

## 📱 **Responsive Design Guidelines**

### **Mobile-First Approach**
- **Touch Targets:** Minimum 44px for all interactive elements
- **Typography:** Scalable fonts that remain readable on small screens
- **Images:** Responsive images that adapt to screen size
- **Layout:** Stack elements vertically on mobile, expand horizontally on desktop

### **Breakpoint Guidelines**
- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+
- **Large Desktop:** 1440px+

---

## ♿ **Accessibility Guidelines**

### **Color Contrast**
- **Maintain WCAG AA contrast ratios** for all text elements
- **Test combinations** of text and background colors
- **Provide alternatives** for color-only information

### **Image Accessibility**
- **Alt Text:** Descriptive alt tags for all images
- **Decorative Images:** Empty alt attributes for purely decorative elements
- **Complex Images:** Detailed descriptions for informational graphics

### **Interactive Elements**
- **Focus States:** Clear focus indicators for keyboard navigation
- **Skip Links:** Navigation shortcuts for screen readers
- **ARIA Labels:** Appropriate labels for interactive elements

---

## 📊 **Brand Application Examples**

### **Blog Content**
- **Banner Images:** Gift-themed flat-lay compositions with brand colors
- **Social Posts:** Square images with blog titles and engaging visuals
- **Thumbnails:** Consistent style across all blog post previews

### **Website Elements**
- **Homepage Hero:** Large, engaging visual with AI tool prominence
- **Gift Cards:** Product showcases with consistent styling
- **Category Pages:** Organized layouts with brand-consistent imagery

### **Social Media**
- **Instagram Posts:** Square format with title text and brand colors
- **Pinterest Pins:** Vertical format optimized for Pinterest discovery
- **Facebook Posts:** Horizontal format for optimal engagement

---

## 📋 **Quality Checklist**

### **Before Publishing Images**
- [ ] Correct dimensions for intended use (banner, social, OG)
- [ ] Brand colors used appropriately (teal, coral-orange, sunshine yellow)
- [ ] 3D cartoon style with 2D decorative elements
- [ ] Clean, uncluttered composition with negative space
- [ ] No text on banner or OG images
- [ ] Title text included on social images (if applicable)
- [ ] Optimized file format (WebP preferred)
- [ ] Appropriate file naming convention
- [ ] Alt text prepared for accessibility

### **Brand Consistency Check**
- [ ] Visual style matches BrightGift aesthetic
- [ ] Colors align with brand palette
- [ ] Typography follows brand guidelines
- [ ] Overall mood is cheerful and optimistic
- [ ] Quality meets professional standards
- [ ] Image supports content theme effectively

---

*This is the single source of truth for all BrightGift visual branding and image creation.*