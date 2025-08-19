#!/usr/bin/env node

// Quick audit: list any blog posts that are not published or have invalid/missing dates

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function isValidDateString(d) {
  if (!d) return false;
  const date = new Date(d);
  return date instanceof Date && !isNaN(date);
}

function main() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const problems = [];
  let publishedCount = 0;

  for (const file of files) {
    const full = path.join(BLOG_DIR, file);
    const { data } = matter(fs.readFileSync(full, 'utf8'));
    const status = (data.status || '').toString().toLowerCase();
    const isDraft = Boolean(data.draft);
    const hasValidDate = isValidDateString(data.date || data.pubDate);

    if (status === 'published' && !isDraft) publishedCount++;

    if (status !== 'published') {
      problems.push({ file, issue: `status != "published" (status: ${data.status})` });
    }
    if (isDraft) {
      problems.push({ file, issue: 'draft: true' });
    }
    if (!hasValidDate) {
      problems.push({ file, issue: 'missing/invalid date' });
    }
  }

  console.log(`Total markdown files: ${files.length}`);
  console.log(`Published (non-draft): ${publishedCount}`);
  if (problems.length === 0) {
    console.log('✅ All posts are published with valid dates.');
    return;
  }
  console.log('\nIssues found:');
  for (const p of problems) {
    console.log(` - ${p.file}: ${p.issue}`);
  }
  process.exitCode = 1;
}

main();


