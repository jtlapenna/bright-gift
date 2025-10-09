const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');

const BLOG_POSTS_PATH = 'src/content/blog';

console.log('🔧 Fixing malformed frontmatter fields...\n');

let filesProcessed = 0;
let filesFixed = 0;

// Clean keywords by removing HTML attributes and technical data
const cleanKeywords = (keywords) => {
  if (!keywords) return keywords;
  
  // If it's a string, split by comma and clean each keyword
  if (typeof keywords === 'string') {
    return keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => {
        // Remove technical HTML attributes and common noise words
        const noiseWords = [
          'amazon', 'target', 'noopener', 'https', 'bright', 'href', 'class', 'link',
          'price', 'range', 'gift', 'their', 'this', 'that', 'with', 'your', 'gifts'
        ];
        return k.length > 2 && !noiseWords.includes(k.toLowerCase());
      })
      .slice(0, 10) // Limit to 10 keywords
      .join(', ');
  }
  
  return keywords;
};

// Clean status field - should only be basic status values
const cleanStatus = (status) => {
  if (!status) return status;
  
  // Extract just the status part before any additional data
  if (typeof status === 'string') {
    const cleanStatus = status.split(',')[0].trim();
    const validStatuses = ['published', 'draft', 'needs_review', 'content-ready', 'archived'];
    
    if (validStatuses.includes(cleanStatus)) {
      return cleanStatus;
    }
    
    // If it starts with 'published', return 'published'
    if (cleanStatus.startsWith('published')) {
      return 'published';
    }
    
    return 'published'; // Default fallback
  }
  
  return status;
};

// Clean featured field - should be boolean
const cleanFeatured = (featured) => {
  if (typeof featured === 'string') {
    const cleanFeatured = featured.split(',')[0].trim().toLowerCase();
    return cleanFeatured === 'true';
  }
  return Boolean(featured);
};

glob.sync(`${BLOG_POSTS_PATH}/**/*.md`).forEach(filePath => {
  filesProcessed++;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract frontmatter and body
  const parts = content.split('---');
  if (parts.length < 3) {
    console.warn(`⚠️  Skipping ${path.basename(filePath)} - invalid frontmatter format.`);
    return;
  }
  
  let frontmatter = yaml.load(parts[1]);
  const body = parts.slice(2).join('---');
  let changed = false;
  
  // Clean status field
  if (frontmatter.status) {
    const cleanedStatus = cleanStatus(frontmatter.status);
    if (cleanedStatus !== frontmatter.status) {
      console.log(`✅ Fixed status in ${path.basename(filePath)}: "${frontmatter.status}" → "${cleanedStatus}"`);
      frontmatter.status = cleanedStatus;
      changed = true;
    }
  }
  
  // Clean featured field
  if (frontmatter.featured !== undefined) {
    const cleanedFeatured = cleanFeatured(frontmatter.featured);
    if (cleanedFeatured !== frontmatter.featured) {
      console.log(`✅ Fixed featured in ${path.basename(filePath)}: "${frontmatter.featured}" → ${cleanedFeatured}`);
      frontmatter.featured = cleanedFeatured;
      changed = true;
    }
  }
  
  // Clean keywords field
  if (frontmatter.keywords) {
    const cleanedKeywords = cleanKeywords(frontmatter.keywords);
    if (cleanedKeywords !== frontmatter.keywords) {
      console.log(`✅ Fixed keywords in ${path.basename(filePath)}: "${frontmatter.keywords}" → "${cleanedKeywords}"`);
      frontmatter.keywords = cleanedKeywords;
      changed = true;
    }
  }
  
  if (changed) {
    filesFixed++;
    const newFrontmatter = yaml.dump(frontmatter, { 
      lineWidth: -1,
      noRefs: true,
      quotingType: '"'
    });
    const newContent = `---\n${newFrontmatter}---\n${body}`;
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Total files processed: ${filesProcessed}`);
console.log(`   Files fixed: ${filesFixed}`);
console.log(`\n🎉 Frontmatter cleanup complete!`);
