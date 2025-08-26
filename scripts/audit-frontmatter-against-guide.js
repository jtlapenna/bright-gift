#!/usr/bin/env node

// Audit blog frontmatter against key requirements from
// _workflow-documents/INSTRUCTIONS/05_FRONTMATTER_AND_PUBLISHING_GUIDE.md

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Core required fields per guide (practical minimum enforced sitewide)
const REQUIRED_FIELDS = [
  'title', 'description', 'date', 'status', 'metaTitle', 'metaDescription',
  'keywords', 'image', 'ogImage'
];

// Strongly recommended fields
const RECOMMENDED_FIELDS = [
  'imageJpg', 'ogImageJpg', 'siteId', 'wordCount', 'readTime'
];

function isValidDateString(val) {
  const d = new Date(val);
  return d instanceof Date && !isNaN(d);
}

function fileExistsPublic(p) {
  if (!p || typeof p !== 'string') return false;
  const full = path.join(PUBLIC_DIR, p.startsWith('/') ? p.slice(1) : p);
  return fs.existsSync(full);
}

function audit() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const results = [];
  for (const file of files) {
    const full = path.join(BLOG_DIR, file);
    const { data } = matter(fs.readFileSync(full, 'utf8'));
    const issues = [];

    // Required presence
    for (const f of REQUIRED_FIELDS) {
      if (data[f] === undefined || data[f] === null || data[f] === '') {
        issues.push(`missing required field: ${f}`);
      }
    }

    // Types & formats
    if (data.date && !isValidDateString(data.date)) {
      issues.push('invalid date format (expected YYYY-MM-DD)');
    }
    if (data.status && !['draft', 'published', 'archived'].includes(String(data.status))) {
      issues.push(`unexpected status: ${data.status}`);
    }
    if (data.keywords && !(Array.isArray(data.keywords) || typeof data.keywords === 'string')) {
      issues.push('keywords should be array or comma-separated string');
    }

    // Image existence
    if (data.image && !fileExistsPublic(data.image)) {
      issues.push(`image not found under /public: ${data.image}`);
    }
    if (data.ogImage && !fileExistsPublic(data.ogImage)) {
      issues.push(`ogImage not found under /public: ${data.ogImage}`);
    }

    // Recommended presence
    for (const f of RECOMMENDED_FIELDS) {
      if (data[f] === undefined || data[f] === null || data[f] === '') {
        issues.push(`recommended field missing: ${f}`);
      }
    }
    // JPG fallbacks presence check if provided
    if (data.imageJpg && !fileExistsPublic(data.imageJpg)) {
      issues.push(`imageJpg not found under /public: ${data.imageJpg}`);
    }
    if (data.ogImageJpg && !fileExistsPublic(data.ogImageJpg)) {
      issues.push(`ogImageJpg not found under /public: ${data.ogImageJpg}`);
    }

    results.push({ file, issues });
  }

  const withIssues = results.filter(r => r.issues.length > 0);
  if (withIssues.length === 0) {
    console.log('✅ All blog frontmatter meets minimum requirements.');
    return;
  }
  console.log(`❌ ${withIssues.length} file(s) with issues:`);
  for (const r of withIssues) {
    console.log(`\n— ${r.file}`);
    r.issues.forEach(i => console.log(`  • ${i}`));
  }
  process.exitCode = 1;
}

audit();



