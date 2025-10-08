#!/usr/bin/env node

/**
 * Add FAQ Schema Script
 * Adds FAQ schema markup to gift guide blog posts
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

console.log('❓ Adding FAQ schema markup to gift guide posts...\n');

const blogDir = path.join(__dirname, '../src/content/blog');
const files = fs.readdirSync(blogDir);
let processed = 0;
let added = 0;

// Common FAQ questions for gift guides
const commonFAQs = [
  {
    question: "What makes a good gift?",
    answer: "A good gift is thoughtful, useful, and shows you understand the recipient's interests and needs. It should be something they'll actually use and appreciate, not just something that looks nice."
  },
  {
    question: "How much should I spend on a gift?",
    answer: "The amount you spend should be based on your relationship with the person and your budget. Focus on thoughtfulness over price - a meaningful gift at any price point is better than an expensive but impersonal one."
  },
  {
    question: "When should I give a gift?",
    answer: "Gifts are appropriate for birthdays, holidays, celebrations, and special occasions. You can also give gifts 'just because' to show someone you're thinking of them."
  },
  {
    question: "How do I choose a gift for someone I don't know well?",
    answer: "Consider their interests, lifestyle, and any hints they've dropped. Look at their social media, ask mutual friends, or choose something universally useful like a gift card or experience."
  },
  {
    question: "Should I include a gift receipt?",
    answer: "Yes, including a gift receipt is considerate and allows the recipient to exchange the item if it's not quite right for them. It shows you want them to be happy with their gift."
  }
];

for (const file of files) {
  if (file.endsWith('.md')) {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: body } = matter(content);
    
    // Only process gift guide posts
    if (data.category !== 'gift-guides') {
      continue;
    }
    
    // Skip if already has FAQ schema
    if (data.faqSchema) {
      console.log(`⏭️  Skipping ${file} - already has FAQ schema`);
      processed++;
      continue;
    }
    
    // Generate FAQ schema based on post content
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": commonFAQs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
    
    // Add FAQ schema to frontmatter
    data.faqSchema = faqSchema;
    
    // Reconstruct the file
    const newContent = matter.stringify(body, data);
    
    // Write back to file
    fs.writeFileSync(filePath, newContent);
    
    console.log(`✅ Added FAQ schema to ${file}`);
    added++;
    processed++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Total gift guide files processed: ${processed}`);
console.log(`   FAQ schemas added: ${added}`);
console.log(`   Files already had FAQ schema: ${processed - added}`);
console.log('\n🎉 FAQ schema addition complete!');
