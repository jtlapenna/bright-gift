# Hero Section Layout Specifications

## Overview
This document outlines the exact CSS classes and styling specifications for the BrightGift hero section across desktop and mobile layouts.

## File Location
`src/pages/index.astro` - Hero section implementation

## Desktop Layout Specifications

### Container
```html
<section class="relative w-full bg-[#FEF2D3] shadow-lg border-t-8 border-[#FF6B6B] mt-0 mx-auto px-0 py-0 md:py-6 flex flex-col items-center justify-center h-[345px] md:min-h-[350px]">
```

**Key Properties:**
- **Height**: `md:min-h-[350px]` (minimum 350px height)
- **Background**: `bg-[#FEF2D3]` (light yellow/cream)
- **Border**: `border-t-8 border-[#FF6B6B]` (8px top border in coral red)
- **Padding**: `md:py-6` (24px vertical padding on desktop)
- **Layout**: `flex flex-col items-center justify-center`

### Navigation Menu
```html
<div class="absolute top-0 right-0 mt-4 md:mt-6 mr-4 md:mr-10 flex gap-6 md:gap-8 font-semibold text-[#1C2E4A] text-base md:text-lg z-10">
```

**Key Properties:**
- **Position**: `absolute top-0 right-0`
- **Margins**: `md:mt-6 md:mr-10` (24px top, 40px right on desktop)
- **Spacing**: `md:gap-8` (32px gap between nav items)
- **Text**: `md:text-lg` (18px font size on desktop)
- **Color**: `text-[#1C2E4A]` (dark blue)

### Content Container
```html
<div class="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl gap-4 md:gap-8 px-2 md:px-6">
```

**Key Properties:**
- **Layout**: `md:flex-row` (horizontal layout on desktop)
- **Max Width**: `max-w-4xl` (896px maximum width)
- **Gap**: `md:gap-8` (32px gap between content sections)
- **Padding**: `md:px-6` (24px horizontal padding on desktop)

### Logo and Text Section
```html
<div class="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left mt-36 md:mt-0">
```

**Key Properties:**
- **Alignment**: `md:items-start md:text-left` (left-aligned on desktop)
- **Margin**: `md:mt-0` (no top margin on desktop)

### Logo Image
```html
<img src="/bright-gift-logo.png" alt="BrightGift logo - AI gift idea generator" class="h-12 md:h-24 mb-1 md:mb-4" />
```

**Key Properties:**
- **Height**: `md:h-24` (96px height on desktop)
- **Margin**: `md:mb-4` (16px bottom margin on desktop)

### Hero Image
```html
<div class="flex-1 flex items-center justify-center relative mt-30 md:mt-0">
    <img src="/hero-image.png" alt="AI-powered gift suggestions interface" class="max-h-[154px] md:max-h-[412px] w-auto md:absolute md:left-1/2 md:-translate-x-1/2 z-10" style="bottom:-240px;" />
</div>
```

**Key Properties:**
- **Position**: `md:absolute md:left-1/2 md:-translate-x-1/2` (centered absolutely)
- **Max Height**: `md:max-h-[412px]` (412px maximum height)
- **Bottom Offset**: `bottom:-240px` (extends 240px below container)
- **Z-Index**: `z-10` (layers above background)

## Mobile Layout Specifications

### Container
```html
<section class="relative w-full bg-[#FEF2D3] shadow-lg border-t-8 border-[#FF6B6B] mt-0 mx-auto px-0 py-0 md:py-6 flex flex-col items-center justify-center h-[345px] md:min-h-[350px]">
```

**Key Properties:**
- **Height**: `h-[345px]` (fixed 345px height)
- **Padding**: `py-0` (no vertical padding on mobile)
- **Layout**: `flex flex-col items-center justify-center`

### Navigation Menu
```html
<div class="absolute top-0 right-0 mt-4 md:mt-6 mr-4 md:mr-10 flex gap-6 md:gap-8 font-semibold text-[#1C2E4A] text-base md:text-lg z-10">
```

**Key Properties:**
- **Margins**: `mt-4 mr-4` (16px top and right margins)
- **Spacing**: `gap-6` (24px gap between nav items)
- **Text**: `text-base` (16px font size)

### Content Container
```html
<div class="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl gap-4 md:gap-8 px-2 md:px-6">
```

**Key Properties:**
- **Layout**: `flex-col` (vertical layout on mobile)
- **Gap**: `gap-4` (16px gap between content sections)
- **Padding**: `px-2` (8px horizontal padding on mobile)

### Logo and Text Section
```html
<div class="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left mt-36 md:mt-0">
```

**Key Properties:**
- **Alignment**: `items-center text-center` (center-aligned on mobile)
- **Margin**: `mt-36` (144px top margin - pushes content down)

### Logo Image
```html
<img src="/bright-gift-logo.png" alt="BrightGift logo - AI gift idea generator" class="h-12 md:h-24 mb-1 md:mb-4" />
```

**Key Properties:**
- **Height**: `h-12` (48px height on mobile)
- **Margin**: `mb-1` (4px bottom margin on mobile)

### Hero Image
```html
<div class="flex-1 flex items-center justify-center relative mt-30 md:mt-0">
    <img src="/hero-image.png" alt="AI-powered gift suggestions interface" class="max-h-[154px] md:max-h-[412px] w-auto md:absolute md:left-1/2 md:-translate-x-1/2 z-10" style="bottom:-240px;" />
</div>
```

**Key Properties:**
- **Position**: `relative` (normal document flow on mobile)
- **Max Height**: `max-h-[154px]` (154px maximum height)
- **Margin**: `mt-30` (120px top margin - pushes image down)
- **Z-Index**: `z-10` (layers above background)

## Tool Section Positioning

### Desktop
```html
<section id="tool" class="pt-[4.8rem] py-20 px-4">
```

**Key Properties:**
- **Top Padding**: `pt-[4.8rem]` (76.8px top padding)

### Mobile
```html
<section id="tool" class="pt-[4.8rem] py-20 px-4">
```

**Key Properties:**
- **Top Padding**: `pt-[4.8rem]` (76.8px top padding - same as desktop)

## Color Palette

- **Background**: `#FEF2D3` (light yellow/cream)
- **Border**: `#FF6B6B` (coral red)
- **Text**: `#1C2E4A` (dark blue)
- **Secondary Text**: `#333` (dark gray)

## Responsive Breakpoints

- **Mobile**: Default (up to 768px)
- **Desktop**: `md:` prefix (768px and above)

## Key Features

1. **Overlapping Hero Image**: On desktop, the hero image extends 240px below the container
2. **Z-Index Layering**: Hero image uses `z-10` to layer above background
3. **Responsive Typography**: Text sizes scale appropriately between mobile and desktop
4. **Flexible Layout**: Uses Flexbox for responsive alignment and spacing
5. **Fixed Mobile Height**: Mobile container has a fixed height of 345px for consistent layout

## Notes

- All mobile-specific changes use standard Tailwind classes (no `md:` prefix)
- Desktop-specific changes use the `md:` prefix
- The hero image positioning creates an overlapping effect on desktop while maintaining normal flow on mobile
- The navigation menu is positioned absolutely in the top-right corner
- The tool section is positioned to account for the overlapping hero image on desktop 