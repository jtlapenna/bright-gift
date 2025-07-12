// UPDATED: Robust n8n Code2 node for blog post processing, schema enforcement, and error handling
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
        validation: { passed: false, errors: ['JSON parsing failed'], fixes: {} },
        error: 'JSON parsing failed',
        errorMessage: parseError.message,
        originalContent: cleaned.substring(0, 200) + '...',
        status: 'failed'
      }
    }];
  }

  // --- Clean and process markdown body ---
  let markdown = parsed.body || '';
  markdown = markdown.trim();
  if (markdown.startsWith('```markdown')) {
    markdown = markdown.replace(/^```markdown/, '').replace(/```$/, '').trim();
  } else if (markdown.startsWith('```')) {
    markdown = markdown.replace(/^```/, '').replace(/```$/, '').trim();
  }

  // If there are multiple frontmatter blocks, keep only the first one
  const firstFrontmatter = markdown.indexOf('---');
  const secondFrontmatter = markdown.indexOf('---', firstFrontmatter + 3);
  if (firstFrontmatter !== -1 && secondFrontmatter !== -1) {
    const afterFrontmatter = markdown.slice(secondFrontmatter + 3).trim();
    const body = afterFrontmatter.replace(/^(title|slug|image|ogImage|socialImage|category|description|keywords|date|status):.*$/gm, '').trim();
    markdown = markdown.slice(0, secondFrontmatter + 3) + '\n\n' + body;
  }

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
  const slug = slugify(title);
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
        validation: { passed: false, errors, fixes },
        error: 'Missing required blog metadata',
        errorMessage: errors.join('; '),
        status: 'failed',
        ...parsed
      }
    }];
  }

  // --- Success: Return all required fields for downstream nodes ---
  return [{
    json: {
      blogPost: markdown,
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
      validation: { passed: true, errors: [], fixes },
      status: 'success',
      ...parsed // include all original parsed fields for flexibility
    }
  }];

} catch (error) {
  // Handle any other errors, return all expected fields with fallback values
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
      validation: { passed: false, errors: ['Processing failed'], fixes: {} },
      error: 'Processing failed',
      errorMessage: error.message,
      status: 'failed'
    }
  }];
} 