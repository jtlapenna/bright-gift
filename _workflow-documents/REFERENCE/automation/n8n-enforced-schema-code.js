// n8n Code Node: Enforced Schema & File Placement
// This code ENFORCES the schema and prevents broken images
// Add this BEFORE your GitHub commit node

// Utility functions
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
    date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  };
  
  for (const [field, defaultValue] of Object.entries(requiredFields)) {
    if (!frontmatter[field]) {
      fixes[field] = defaultValue;
    }
  }
  
  return { errors, fixes, correctSlug, imagePaths };
}

// Main execution
const input = item.json;
const frontmatter = input.frontmatter || {};
const title = input.title || frontmatter.title || 'Untitled Post';

console.log('🔍 Validating and fixing frontmatter...');
console.log('Title:', title);

const { errors, fixes, correctSlug, imagePaths } = validateAndFixFrontmatter(frontmatter, title);

// Log any issues found
if (errors.length > 0) {
  console.log('⚠️ Issues found:');
  errors.forEach(error => console.log(`   - ${error}`));
}

if (Object.keys(fixes).length > 0) {
  console.log('🔧 Applying fixes:');
  Object.entries(fixes).forEach(([field, value]) => console.log(`   - ${field}: "${value}"`));
}

// Create corrected frontmatter
const correctedFrontmatter = {
  ...frontmatter,
  ...fixes
};

// Ensure all required fields exist
const finalFrontmatter = {
  title: title,
  slug: correctSlug,
  image: imagePaths.banner,
  ogImage: imagePaths.og,
  socialImage: imagePaths.social,
  category: 'gift-guides',
  description: frontmatter.description || 'A thoughtful gift guide for your loved ones.',
  keywords: frontmatter.keywords || 'gifts, gift ideas, thoughtful presents',
  date: new Date().toISOString().split('T')[0],
  status: 'draft',
  ...correctedFrontmatter
};

// Generate correct filename
const filename = `${correctSlug}.md`;

// Create directory structure info for images
const imageDirectory = `public/images/blog/${correctSlug}`;
const imageFiles = [
  `${correctSlug}-banner.webp`,
  `${correctSlug}-og.webp`,
  `${correctSlug}-social.webp`
];

console.log('✅ Schema enforcement complete');
console.log('Filename:', filename);
console.log('Image directory:', imageDirectory);
console.log('Required image files:', imageFiles);

// Return corrected data for downstream nodes
return {
  json: {
    ...input,
    frontmatter: finalFrontmatter,
    filename: filename,
    slug: correctSlug,
    imageDirectory: imageDirectory,
    imageFiles: imageFiles,
    imagePaths: imagePaths,
    validation: {
      passed: true,
      errors: errors,
      fixes: fixes
    }
  }
}; 