#!/usr/bin/env node

/**
 * Content Schema Validator
 * Validates all blog posts against the defined schema
 * Run with: node scripts/validate-content-schema.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Schema definition
const REQUIRED_FIELDS = [
  'title', 'slug', 'image', 'ogImage', 'socialImage', 
  'category', 'description', 'keywords', 'date', 'status'
];

const VALID_CATEGORIES = ['gift-guides', 'blog', 'reviews'];
const VALID_STATUSES = ['draft', 'published'];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validateDate(dateStr) {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
}

function validateImagePath(imagePath, slug) {
  const expectedPath = `/images/blog/${slug}/${slug}-banner.webp`;
  return imagePath === expectedPath;
}

function validateOgImagePath(ogPath, slug) {
  const expectedPath = `/images/blog/${slug}/${slug}-og.webp`;
  return ogPath === expectedPath;
}

function validateSocialImagePath(socialPath, slug) {
  const expectedPath = `/images/blog/${slug}/${slug}-social.webp`;
  return socialPath === expectedPath;
}

function checkImageExists(imagePath) {
  const fullPath = path.join(process.cwd(), 'public', imagePath);
  return fs.existsSync(fullPath);
}

function validateBlogPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter } = matter(content);
  const filename = path.basename(filePath, '.md');
  const errors = [];
  const warnings = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check slug consistency
  if (frontmatter.slug && frontmatter.slug !== filename) {
    errors.push(`Slug mismatch: frontmatter has "${frontmatter.slug}" but filename is "${filename}"`);
  }

  // Check category validity
  if (frontmatter.category && !VALID_CATEGORIES.includes(frontmatter.category)) {
    warnings.push(`Invalid category: "${frontmatter.category}". Valid options: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Check status validity
  if (frontmatter.status && !VALID_STATUSES.includes(frontmatter.status)) {
    errors.push(`Invalid status: "${frontmatter.status}". Valid options: ${VALID_STATUSES.join(', ')}`);
  }

  // Check date format
  if (frontmatter.date && !validateDate(frontmatter.date)) {
    errors.push(`Invalid date format: "${frontmatter.date}". Expected YYYY-MM-DD`);
  }

  // Check image paths
  if (frontmatter.slug) {
    if (frontmatter.image && !validateImagePath(frontmatter.image, frontmatter.slug)) {
      errors.push(`Invalid image path: "${frontmatter.image}". Expected: "/images/blog/${frontmatter.slug}/${frontmatter.slug}-banner.webp"`);
    }
    
    if (frontmatter.ogImage && !validateOgImagePath(frontmatter.ogImage, frontmatter.slug)) {
      errors.push(`Invalid ogImage path: "${frontmatter.ogImage}". Expected: "/images/blog/${frontmatter.slug}/${frontmatter.slug}-og.webp"`);
    }
    
    if (frontmatter.socialImage && !validateSocialImagePath(frontmatter.socialImage, frontmatter.slug)) {
      errors.push(`Invalid socialImage path: "${frontmatter.socialImage}". Expected: "/images/blog/${frontmatter.slug}/${frontmatter.slug}-social.webp"`);
    }
  }

  // Check if images actually exist
  if (frontmatter.image && !checkImageExists(frontmatter.image)) {
    warnings.push(`Image file not found: ${frontmatter.image}`);
  }
  if (frontmatter.ogImage && !checkImageExists(frontmatter.ogImage)) {
    warnings.push(`OG image file not found: ${frontmatter.ogImage}`);
  }
  if (frontmatter.socialImage && !checkImageExists(frontmatter.socialImage)) {
    warnings.push(`Social image file not found: ${frontmatter.socialImage}`);
  }

  return { errors, warnings, frontmatter };
}

function main() {
  const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  
  console.log(`🔍 Validating ${files.length} blog posts...\n`);
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const { errors, warnings, frontmatter } = validateBlogPost(filePath);
    
    console.log(`📄 ${file}`);
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log(`   ✅ Valid`);
    } else {
      if (errors.length > 0) {
        console.log(`   ❌ Errors:`);
        errors.forEach(error => console.log(`      - ${error}`));
        totalErrors += errors.length;
      }
      if (warnings.length > 0) {
        console.log(`   ⚠️  Warnings:`);
        warnings.forEach(warning => console.log(`      - ${warning}`));
        totalWarnings += warnings.length;
      }
    }
    console.log('');
  }
  
  console.log(`📊 Summary:`);
  console.log(`   Files checked: ${files.length}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   Total warnings: ${totalWarnings}`);
  
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`\n🎉 All content is valid!`);
  } else if (totalErrors === 0) {
    console.log(`\n⚠️  Content has warnings but no errors.`);
  } else {
    console.log(`\n❌ Content has errors that need to be fixed.`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 