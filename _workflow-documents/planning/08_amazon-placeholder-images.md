# 🖼️ Amazon Placeholder Images Strategy

## Purpose
Enhance the visual appeal and clarity of gift idea cards by using a set of category-based Amazon placeholder images, rather than a single generic image.

---

## Why Use Category-Based Placeholders?
- Prevents all Amazon cards from looking the same
- Gives users a visual cue about the type of product (tech, books, home, etc.)
- Improves perceived quality and engagement

---

## Recommended Categories & Filenames
- Tech/Electronics: `amazon_tech.jpg`
- Books: `amazon_books.jpg`
- Fashion/Apparel: `amazon_fashion.jpg`
- Home/Decor: `amazon_home.jpg`
- Outdoor/Gear: `amazon_outdoor.jpg`
- Food/Kitchen: `amazon_kitchen.jpg`
- Toys/Games: `amazon_toys.jpg`
- Beauty/Personal Care: `amazon_beauty.jpg`
- Generic/Other: `amazon_generic.jpg`

---

## Sourcing Placeholder Images

### Option 1: Free Icon Libraries
- [FontAwesome](https://fontawesome.com/)
- [Heroicons](https://heroicons.com/)
- [Feather Icons](https://feathericons.com/)
- [Iconify](https://icon-sets.iconify.design/)
- Download SVGs or PNGs, convert to JPG if needed

### Option 2: AI Image Generation
- Use DALL·E, Midjourney, or similar to generate simple, non-branded illustrations for each category

### Option 3: Stock Photo Sites
- [Unsplash](https://unsplash.com/)
- [Pexels](https://www.pexels.com/)
- [Pixabay](https://pixabay.com/)
- Search for generic, non-branded product images

---

## Implementation Steps
1. Download or generate one image per category, save in `public/placeholders/` with the recommended filenames.
2. In the backend (`/api/generate.ts`), map the AI's tag/category to the appropriate placeholder:

```js
function getAmazonPlaceholder(tag) {
  if (/tech|electronics/i.test(tag)) return '/placeholders/amazon_tech.jpg';
  if (/book/i.test(tag)) return '/placeholders/amazon_books.jpg';
  if (/fashion|apparel|clothing/i.test(tag)) return '/placeholders/amazon_fashion.jpg';
  if (/home|decor/i.test(tag)) return '/placeholders/amazon_home.jpg';
  if (/outdoor|gear/i.test(tag)) return '/placeholders/amazon_outdoor.jpg';
  if (/kitchen|food/i.test(tag)) return '/placeholders/amazon_kitchen.jpg';
  if (/toy|game/i.test(tag)) return '/placeholders/amazon_toys.jpg';
  if (/beauty|personal/i.test(tag)) return '/placeholders/amazon_beauty.jpg';
  return '/placeholders/amazon_generic.jpg'; // fallback
}
```
3. Use this function when setting the `image` for Amazon fallback cards.

---

## Notes
- Do **not** scrape or hotlink images from Amazon search results (against TOS, unstable URLs).
- When you gain access to the Amazon Product Advertising API, update the logic to use real product images.
- For Etsy, continue to use the API for real images; fallback to a local placeholder if needed.

---

## Next Steps
- [ ] Source or generate images for each category and add to `public/placeholders/`.
- [ ] Implement backend mapping logic.
- [ ] Test card rendering for a variety of tags. 