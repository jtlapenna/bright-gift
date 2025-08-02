#!/usr/bin/env node

// List of .md URLs that need to be removed from Google Search Console indexing
const MD_URLS_TO_REMOVE = [
  'https://bright-gift.com/blog/best-books-for-different-reading-levels.md',
  'https://bright-gift.com/blog/25-books-to-gift-this-holiday-season.md',
  'https://bright-gift.com/blog/best-gifts-for-dads-who-love-outdoor-adventures.md',
  'https://bright-gift.com/blog/unique-christmas-gifts-for-gamers-who-have-everything-2024.md',
  'https://bright-gift.com/blog/unique-gifts-for-board-game-enthusiasts.md',
  'https://bright-gift.com/blog/fun-gifts-for-kids-birthday-parties.md',
  'https://bright-gift.com/blog/last-minute-birthday-gifts-for-busy-professionals.md',
  'https://bright-gift.com/blog/gifts-for-book-lovers-under-50.md',
  'https://bright-gift.com/blog/special-birthday-gifts-for-lgbtq-youth.md',
  'https://bright-gift.com/blog/affordable-gifts-for-pet-lovers-under-30.md',
  'https://bright-gift.com/blog/how-ai-is-revolutionizing-gift-shopping-complete-guide.md',
  'https://bright-gift.com/blog/20-ethical-gift-ideas-for-eco-conscious-loved-ones-under-75.md',
  'https://bright-gift.com/blog/25-thoughtful-housewarming-gifts-for-new-homeowners-under-75.md',
  'https://bright-gift.com/blog/chic-wedding-gifts-for-the-stylish-couple.md',
  'https://bright-gift.com/blog/gifts-for-new-homeowners-2025.md',
  'https://bright-gift.com/blog/30-unique-gift-ideas-for-new-parents-baby-shower-beyond.md',
  'https://bright-gift.com/blog/gifts-for-remote-workers-under-50.md',
  'https://bright-gift.com/blog/gifts-for-dungeons-dragons-enthusiasts-level-up-their-experience.md',
  'https://bright-gift.com/blog/best-home-gifts-on-amazon-2024.md',
  'https://bright-gift.com/blog/gifts-for-girlfriend-unique-romantic-ideas.md',
  'https://bright-gift.com/blog/gifts-under-25-for-coworkers.md',
  'https://bright-gift.com/blog/gifts-for-plant-lovers.md',
  'https://bright-gift.com/blog/eco-friendly-gift-ideas-for-every-budget.md',
  'https://bright-gift.com/blog/unique-graduation-gifts-creative-minds.md',
  'https://bright-gift.com/blog/25-unique-anniversary-gift-ideas-under-50.md'
];

console.log('🗑️  .md URLs to remove from Google Search Console indexing:\n');

MD_URLS_TO_REMOVE.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

console.log('\n📋 Instructions:');
console.log('1. Go to Google Search Console');
console.log('2. Navigate to "URL Inspection"');
console.log('3. For each URL above:');
console.log('   - Enter the URL');
console.log('   - Click "Request Indexing"');
console.log('   - Select "Remove URL"');
console.log('   - Submit the removal request');
console.log('\n4. Monitor the "Removals" section to confirm URLs are removed');
console.log('\n5. After removal, these URLs will no longer appear in search results');

// Generate a CSV for easy copying
console.log('\n📄 CSV format for bulk processing:');
console.log('URL');
MD_URLS_TO_REMOVE.forEach(url => {
  console.log(url);
}); 