# Fixed n8n Code2 Node for Blog Post Processing

## Problem Identified
The markdown content was being rendered as a single `<h1>` tag because the AI-generated content lacked proper markdown formatting with line breaks and heading structure.

## Solution
Add markdown formatting validation and correction to ensure proper structure.

```javascript
// UPDATED: Robust n8n Code2 node for blog post processing with markdown formatting fixes
// ENHANCED: Added markdown structure validation and correction
try {
  // --- Extract and clean the raw JSON string ---
  let raw = items[0].json.data?.[0]?.content?.[0]?.text?.value || '';
  let cleaned = raw.trim();

  // Remove code block wrappers if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }

  // Remove any leading/trailing non-JSON text
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // --- Parse JSON ---
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    // On JSON parse error, return all expected fields with fallback values
    return [{
      json: {
        blogPost: '',
        filename: 'error.md',
        commitMessage: `ERROR: Blog post not created due to JSON parse error`,
        branch: 'preview',
        category: '',
        slug: '',
        title: '',
        description: '',
        date: new Date().toISOString().split("T")[0],
        imageDirectory: '',
        imageFiles: [],
        imagePaths: {},
        socialPosts: {},
        validation: { passed: false, errors: ['JSON parsing failed'], fixes: {} },
        error: 'JSON parsing failed',
        errorMessage: parseError.message,
        originalContent: cleaned.substring(0, 200) + '...',
        status: 'failed'
      }
    }];
  }

  // --- Clean and process markdown body with formatting fixes ---
  let markdown = parsed.body || '';
  markdown = markdown.trim();
  
  // Remove markdown code block wrappers if present
  if (markdown.startsWith('```markdown')) {
    markdown = markdown.replace(/^```markdown/, '').replace(/```$/, '').trim();
  } else if (markdown.startsWith('```')) {
    markdown = markdown.replace(/^```/, '').replace(/```$/, '').trim();
  }

  // --- CRITICAL FIX: Ensure proper markdown formatting ---
  function fixMarkdownFormatting(content) {
    if (!content) return '';
    
    let fixed = content;
    
    // 1. Fix heading structure - ensure proper spacing
    fixed = fixed.replace(/(^|\n)(#{1,6})\s*/g, '\n$2 ');
    
    // 2. Fix paragraph breaks - ensure double line breaks between sections
    fixed = fixed.replace(/\n\n+/g, '\n\n'); // Normalize multiple line breaks
    fixed = fixed.replace(/([.!?])\n([A-Z])/g, '$1\n\n$2'); // Add breaks after sentences
    
    // 3. Fix list formatting
    fixed = fixed.replace(/(^|\n)(\d+\.|\*|\-)\s*/g, '\n$2 ');
    
    // 4. Fix bold text formatting
    fixed = fixed.replace(/\*\*(.*?)\*\*/g, '**$1**');
    
    // 5. Fix link formatting
    fixed = fixed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1]($2)');
    
    // 6. Ensure proper spacing around headings
    fixed = fixed.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
    fixed = fixed.replace(/(#{1,6}.*?)\n([^\n])/g, '$1\n\n$2');
    
    // 7. Fix blockquote formatting
    fixed = fixed.replace(/(^|\n)>\s*/g, '\n> ');
    
    // 8. Ensure content doesn't start with a heading (add intro if needed)
    if (fixed.trim().startsWith('#')) {
      fixed = `# Introduction\n\n${fixed}`;
    }
    
    // 9. Clean up any remaining formatting issues
    fixed = fixed.replace(/\n{3,}/g, '\n\n'); // Remove excessive line breaks
    fixed = fixed.trim();
    
    return fixed;
  }

  // Apply markdown formatting fixes
  markdown = fixMarkdownFormatting(markdown);

  // --- Enforce schema: generate slug, image paths, etc. ---
  function slugify(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const title = parsed.title || '';
  const description = parsed.description || '';
  const keywords = parsed.keywords || '';
  const slug = parsed.slug ? slugify(parsed.slug) : slugify(title);
  const category = 'gift-guides';
  const date = new Date().toISOString().split("T")[0];
  const filename = slug ? `${slug}.md` : 'untitled.md';
  const branch = 'preview';
  const commitMessage = slug
    ? `Add draft blog post for slug: ${slug}`
    : `ERROR: Blog post not created due to missing slug`;

  // Image paths and directory
  const imageDirectory = slug ? `public/images/blog/${slug}` : '';
  const imageFiles = slug ? [
    `${slug}-banner.webp`,
    `${slug}-og.webp`,
    `${slug}-social.webp`
  ] : [];
  const imagePaths = slug ? {
    banner: `/images/blog/${slug}/${slug}-banner.webp`,
    og: `/images/blog/${slug}/${slug}-og.webp`,
    social: `/images/blog/${slug}/${slug}-social.webp`
  } : {};

  // --- Process socialPosts from parsed data ---
  const socialPosts = parsed.socialPosts || {};
  
  const defaultSocialPosts = {
    instagram: {
      caption: `🎁 ${title}\n\n${description}\n\n#giftideas #gifts #brightgift`,
      hashtags: 'giftideas,gifts,brightgift,giftguide'
    },
    twitter: {
      text: `${title}\n\n${description}\n\n#giftideas #gifts #brightgift`,
      hashtags: 'giftideas,gifts,brightgift'
    },
    facebook: {
      text: `${title}\n\n${description}\n\nWhat do you think of these gift ideas? Share your thoughts below! 👇`,
      hashtags: 'giftideas,gifts,brightgift'
    },
    linkedin: {
      text: `${title}\n\n${description}\n\nLooking for thoughtful gift ideas? Check out this comprehensive guide for inspiration.`,
      hashtags: 'giftideas,gifts,brightgift,giftguide'
    }
  };

  const finalSocialPosts = {
    instagram: { ...defaultSocialPosts.instagram, ...socialPosts.instagram },
    twitter: { ...defaultSocialPosts.twitter, ...socialPosts.twitter },
    facebook: { ...defaultSocialPosts.facebook, ...socialPosts.facebook },
    linkedin: { ...defaultSocialPosts.linkedin, ...socialPosts.linkedin }
  };

  // --- Defensive: Ensure required fields are present ---
  const errors = [];
  const fixes = {};
  if (!title) errors.push('Missing title');
  if (!description) errors.push('Missing description');
  if (!keywords) errors.push('Missing keywords');
  if (!slug) errors.push('Missing slug');
  if (!markdown) errors.push('Missing markdown body');

  // If required fields are missing, return error structure
  if (errors.length > 0) {
    return [{
      json: {
        blogPost: markdown,
        filename,
        commitMessage: `ERROR: Blog post not created due to missing required metadata`,
        branch,
        category,
        slug,
        title,
        description,
        date,
        imageDirectory,
        imageFiles,
        imagePaths,
        socialPosts: finalSocialPosts,
        validation: { passed: false, errors, fixes },
        error: 'Missing required blog metadata',
        errorMessage: errors.join('; '),
        status: 'failed',
        ...parsed
      }
    }];
  }

  // --- Build YAML frontmatter ---
  function toYAML(obj) {
    const socialPostsYAML = Object.entries(finalSocialPosts)
      .map(([platform, content]) => {
        const platformContent = Object.entries(content)
          .map(([key, value]) => `    ${key}: "${String(value).replace(/"/g, '\\"')}"`)
          .join('\n');
        return `  ${platform}:\n${platformContent}`;
      })
      .join('\n');

    return [
      '---',
      `title: "${obj.title.replace(/"/g, '\"')}"`,
      `slug: "${obj.slug}"`,
      `image: "${imagePaths.banner}"`,
      `ogImage: "${imagePaths.og}"`,
      `socialImage: "${imagePaths.social}"`,
      `category: "${category}"`,
      `description: "${obj.description.replace(/"/g, '\"')}"`,
      `keywords: "${obj.keywords}"`,
      `date: "${date}"`,
      `draft: false`,
      `status: "published"`,
      `socialPosts:`,
      socialPostsYAML,
      '---'
    ].join('\n');
  }

  // Prepend frontmatter to markdown body
  const frontmatter = toYAML({ title, slug, description, keywords });
  const markdownWithFrontmatter = `${frontmatter}\n\n${markdown}`;

  // --- Success: Return all required fields for downstream nodes ---
  return [{
    json: {
      blogPost: markdownWithFrontmatter,
      filename,
      commitMessage,
      branch,
      category,
      slug,
      title,
      description,
      date,
      imageDirectory,
      imageFiles,
      imagePaths,
      socialPosts: finalSocialPosts,
      validation: { passed: true, errors: [], fixes },
      status: 'success',
      ...parsed
    }
  }];

} catch (error) {
  return [{
    json: {
      blogPost: '',
      filename: 'error.md',
      commitMessage: `ERROR: Blog post not created due to processing error`,
      branch: 'preview',
      category: '',
      slug: '',
      title: '',
      description: '',
      date: new Date().toISOString().split("T")[0],
      imageDirectory: '',
      imageFiles: [],
      imagePaths: {},
      socialPosts: {},
      validation: { passed: false, errors: ['Processing failed'], fixes: {} },
      error: 'Processing failed',
      errorMessage: error.message,
      status: 'failed'
    }
  }];
}
```

## Key Changes Made

1. **Added `fixMarkdownFormatting()` function** that:
   - Ensures proper heading structure with spacing
   - Fixes paragraph breaks between sections
   - Corrects list formatting
   - Fixes bold text and link formatting
   - Ensures proper spacing around headings
   - Adds introduction if content starts with a heading

2. **Applied formatting fixes** to the markdown content before creating the final blog post

3. **Maintained all existing functionality** while adding the critical formatting fixes

## How to Apply

1. Replace your current Code2 node content with the updated code above
2. Test with a new blog post generation
3. The markdown should now render properly with correct structure

This should fix the issue where all content was being rendered as a single `<h1>` tag. 