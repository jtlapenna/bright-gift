// n8n Code Node: Frontmatter Validation
// Add this to your n8n workflow before the GitHub commit node

// Validate frontmatter matches schema
function validateFrontmatter(frontmatter, filename) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  const requiredFields = ['title', 'slug', 'image', 'ogImage', 'socialImage', 'category', 'description', 'keywords', 'date', 'status'];
  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Check slug consistency
  const expectedSlug = filename.replace('.md', '');
  if (frontmatter.slug && frontmatter.slug !== expectedSlug) {
    errors.push(`Slug mismatch: frontmatter has "${frontmatter.slug}" but filename is "${expectedSlug}"`);
  }
  
  // Check image paths
  if (frontmatter.slug) {
    const expectedImage = `/images/blog/${frontmatter.slug}/${frontmatter.slug}-banner.webp`;
    const expectedOg = `/images/blog/${frontmatter.slug}/${frontmatter.slug}-og.webp`;
    const expectedSocial = `/images/blog/${frontmatter.slug}/${frontmatter.slug}-social.webp`;
    
    if (frontmatter.image !== expectedImage) {
      errors.push(`Invalid image path: "${frontmatter.image}". Expected: "${expectedImage}"`);
    }
    if (frontmatter.ogImage !== expectedOg) {
      errors.push(`Invalid ogImage path: "${frontmatter.ogImage}". Expected: "${expectedOg}"`);
    }
    if (frontmatter.socialImage !== expectedSocial) {
      errors.push(`Invalid socialImage path: "${frontmatter.socialImage}". Expected: "${expectedSocial}"`);
    }
  }
  
  // Check status
  if (frontmatter.status && !['draft', 'published'].includes(frontmatter.status)) {
    errors.push(`Invalid status: "${frontmatter.status}". Must be "draft" or "published"`);
  }
  
  // Check date format
  if (frontmatter.date && !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date)) {
    errors.push(`Invalid date format: "${frontmatter.date}". Expected YYYY-MM-DD`);
  }
  
  return { errors, warnings };
}

// Main validation logic
const frontmatter = item.json.frontmatter || {};
const filename = item.json.filename || 'unknown.md';

const { errors, warnings } = validateFrontmatter(frontmatter, filename);

if (errors.length > 0) {
  console.error('❌ Frontmatter validation failed:');
  errors.forEach(error => console.error(`   - ${error}`));
  
  // Return error to stop workflow
  return {
    json: {
      error: true,
      message: 'Frontmatter validation failed',
      errors: errors,
      filename: filename
    }
  };
}

if (warnings.length > 0) {
  console.warn('⚠️ Frontmatter warnings:');
  warnings.forEach(warning => console.warn(`   - ${warning}`));
}

console.log('✅ Frontmatter validation passed');

// Return success with validated data
return {
  json: {
    ...item.json,
    validation: {
      passed: true,
      warnings: warnings
    }
  }
}; 