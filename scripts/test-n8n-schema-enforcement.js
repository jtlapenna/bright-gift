#!/usr/bin/env node

/**
 * Test script for n8n schema enforcement
 * Simulates the n8n code node to verify it works correctly
 */

// Copy the n8n code here for testing
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateImagePaths(slug) {
  return {
    banner: `/images/blog/${slug}/${slug}-banner.webp`,
    og: `/images/blog/${slug}/${slug}-og.webp`,
    social: `/images/blog/${slug}/${slug}-social.webp`
  };
}

function validateAndFixFrontmatter(frontmatter, title) {
  const errors = [];
  const fixes = {};
  
  // Generate correct slug from title
  const correctSlug = slugify(title);
  if (frontmatter.slug && frontmatter.slug !== correctSlug) {
    errors.push(`Slug mismatch: GPT generated "${frontmatter.slug}" but should be "${correctSlug}"`);
    fixes.slug = correctSlug;
  } else if (!frontmatter.slug) {
    fixes.slug = correctSlug;
  }
  
  // Generate correct image paths
  const imagePaths = generateImagePaths(correctSlug);
  if (frontmatter.image !== imagePaths.banner) {
    errors.push(`Image path mismatch: "${frontmatter.image}" should be "${imagePaths.banner}"`);
    fixes.image = imagePaths.banner;
  }
  if (frontmatter.ogImage !== imagePaths.og) {
    errors.push(`OG image path mismatch: "${frontmatter.ogImage}" should be "${imagePaths.og}"`);
    fixes.ogImage = imagePaths.og;
  }
  if (frontmatter.socialImage !== imagePaths.social) {
    errors.push(`Social image path mismatch: "${frontmatter.socialImage}" should be "${imagePaths.social}"`);
    fixes.socialImage = imagePaths.social;
  }
  
  // Ensure required fields
  const requiredFields = {
    category: 'gift-guides',
    status: 'draft',
    date: new Date().toISOString().split('T')[0]
  };
  
  for (const [field, defaultValue] of Object.entries(requiredFields)) {
    if (!frontmatter[field]) {
      fixes[field] = defaultValue;
    }
  }
  
  return { errors, fixes, correctSlug, imagePaths };
}

// Test cases
const testCases = [
  {
    name: "Perfect frontmatter (no fixes needed)",
    input: {
      title: "Best Coffee Gifts for Coffee Lovers",
      frontmatter: {
        title: "Best Coffee Gifts for Coffee Lovers",
        description: "Discover thoughtful coffee gifts for the coffee lover in your life.",
        keywords: "coffee gifts, gifts for coffee lovers, coffee accessories"
      }
    }
  },
  {
    name: "Wrong slug (should be fixed)",
    input: {
      title: "Best Coffee Gifts for Coffee Lovers",
      frontmatter: {
        title: "Best Coffee Gifts for Coffee Lovers",
        slug: "wrong-slug-here",
        image: "/wrong/path/image.jpg",
        description: "Discover thoughtful coffee gifts for the coffee lover in your life.",
        keywords: "coffee gifts, gifts for coffee lovers, coffee accessories"
      }
    }
  },
  {
    name: "Missing required fields (should be added)",
    input: {
      title: "Amazing Tech Gifts Under $50",
      frontmatter: {
        title: "Amazing Tech Gifts Under $50",
        description: "Find the best tech gifts under $50 for any occasion.",
        keywords: "tech gifts, affordable gifts, electronics"
      }
    }
  }
];

// Run tests
console.log('🧪 Testing n8n Schema Enforcement\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('─'.repeat(50));
  
  const { errors, fixes, correctSlug, imagePaths } = validateAndFixFrontmatter(
    testCase.input.frontmatter, 
    testCase.input.title
  );
  
  console.log('Title:', testCase.input.title);
  console.log('Correct slug:', correctSlug);
  console.log('Image paths:', imagePaths);
  
  if (errors.length > 0) {
    console.log('❌ Errors found:');
    errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (Object.keys(fixes).length > 0) {
    console.log('🔧 Fixes applied:');
    Object.entries(fixes).forEach(([field, value]) => console.log(`   - ${field}: "${value}"`));
  }
  
  if (errors.length === 0 && Object.keys(fixes).length === 0) {
    console.log('✅ No issues found');
  }
  
  console.log('');
});

console.log('✅ All tests completed!');
console.log('\n📋 Summary:');
console.log('- The n8n code will automatically fix slug mismatches');
console.log('- The n8n code will generate correct image paths');
console.log('- The n8n code will add missing required fields');
console.log('- This prevents broken images and ensures consistency'); 