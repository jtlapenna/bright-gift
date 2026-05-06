#!/usr/bin/env node

/**
 * Repo-level SEO policy validation.
 * Purpose: keep active SEO tooling/docs aligned with canonical trailing-slash URLs
 * and block stale recovery scripts from reintroducing bad crawl signals.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');
const {
  SEASONAL_SITEMAP_EXCLUSIONS
} = require('../utilities/canonical-url-policy');

const REPORT_PATH = path.join(
  __dirname,
  '../../_workflow-documents/reports/repo-url-policy-report.json'
);

const ACTIVE_GLOBS = [
  'package.json',
  'src/**/*.{astro,ts,tsx,js,jsx,mjs,cjs,md}',
  'public/**/*.{txt,xml,html}',
  'scripts/**/*.js',
  '_workflow-documents/seo/**/*.{md,txt}'
];

const SKIP_FILES = new Set([
  'public/_redirects'
]);

const SKIP_PATH_PARTS = [
  '_workflow-documents/SEO_audit/',
  '_workflow-documents/archive/',
  '_workflow-documents/seo/legacy-seo/',
  'scripts/legacy-seo/'
];

const FAQ_SYNC_TARGETS = [
  'src/content/blog/gifts-under-25-for-coworkers.md',
  'src/content/blog/little-luxuries-under-25-mini-splurges-major-wow.md',
  'src/content/blog/clean-girl-2-0-minimalist-gifts-with-personality.md'
];

const FULL_NO_SLASH_URL_RE =
  /(https:\/\/bright-gift\.com\/blog\/[a-z0-9-]+(?:\.md)?)(?=(?:['")\]\s]|$))/g;
const RELATIVE_NO_SLASH_PATH_RE =
  /(?<![A-Za-z0-9_-])(\/blog\/[a-z0-9-]+)(?=(?:['")\]\s]|$))/g;
const MD_PUBLIC_URL_RE =
  /(https:\/\/bright-gift\.com\/blog\/[a-z0-9-]+\.md)(?=(?:['")\]\s]|$))/g;

const BLANKET_TIMESTAMP_RULES = [
  {
    pattern: /data\.lastUpdated\s*=\s*TODAY\b/,
    message: 'Hard-coded lastUpdated rewrite found in active SEO tooling'
  },
  {
    pattern: /replace\(\s*\/<lastmod>.*?<\/lastmod>\/g/s,
    message: 'Global sitemap lastmod rewrite found in active SEO tooling'
  },
  {
    pattern: /content\.replace\(dateRegex,\s*`date:/,
    message: 'Bulk publish-date rewrite found in active SEO tooling'
  },
  {
    pattern: /blogPaginationPages\s*=\s*\[/,
    message: 'Pagination URL injection logic found in active SEO tooling'
  }
];

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function shouldSkip(filePath) {
  const normalized = normalizePath(filePath);
  if (SKIP_FILES.has(normalized)) {
    return true;
  }

  return SKIP_PATH_PARTS.some((segment) => normalized.includes(segment));
}

function normalizeQuestion(value) {
  return value
    .toLowerCase()
    .replace(/['"“”‘’?!.,:()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadActiveFiles() {
  const files = new Set();

  for (const pattern of ACTIVE_GLOBS) {
    for (const file of glob.sync(pattern, { nodir: true })) {
      if (!shouldSkip(file)) {
        files.add(file);
      }
    }
  }

  return [...files].sort();
}

function auditCanonicalLiterals(filePath, content, errors) {
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const fullMatches = [...line.matchAll(FULL_NO_SLASH_URL_RE)];
    for (const match of fullMatches) {
      if (match[1].endsWith('.md')) {
        continue;
      }

      errors.push({
        file: filePath,
        line: index + 1,
        message: `Non-canonical public blog URL found: ${match[1]}`,
        fix: 'Use a trailing-slash canonical URL'
      });
    }

    const relativeMatches = [...line.matchAll(RELATIVE_NO_SLASH_PATH_RE)];
    for (const match of relativeMatches) {
      errors.push({
        file: filePath,
        line: index + 1,
        message: `Non-canonical public blog path found: ${match[1]}`,
        fix: 'Use a trailing-slash canonical path'
      });
    }

    const mdMatches = [...line.matchAll(MD_PUBLIC_URL_RE)];
    for (const match of mdMatches) {
      errors.push({
        file: filePath,
        line: index + 1,
        message: `Public .md blog URL found: ${match[1]}`,
        fix: 'Use the canonical trailing-slash blog URL without .md'
      });
    }

  });
}

function auditSitemap(filePath, content, errors) {
  if (normalizePath(filePath) !== 'public/sitemap.xml') {
    return;
  }

  if (/<loc>https:\/\/bright-gift\.com\/blog\/\?page=\d+<\/loc>/.test(content)) {
    errors.push({
      file: filePath,
      line: 1,
      message: 'Sitemap contains blog pagination URLs',
      fix: 'Only include canonical content URLs in sitemap.xml'
    });
  }
}

function auditTimestampRules(filePath, content, errors) {
  for (const rule of BLANKET_TIMESTAMP_RULES) {
    if (rule.pattern.test(content)) {
      errors.push({
        file: filePath,
        line: 1,
        message: rule.message,
        fix: 'Remove blanket freshness automation from active SEO tooling'
      });
    }
  }
}

function getVisibleFaqQuestions(body) {
  const sectionMatch = body.match(
    /^## Frequently Asked Questions\s*$([\s\S]*?)(?=^##\s|\Z)/m
  );

  if (!sectionMatch) {
    return [];
  }

  return [...sectionMatch[1].matchAll(/^###\s+(.+)$/gm)].map((match) =>
    match[1].trim()
  );
}

function auditFaqSync(filePath, errors) {
  if (!FAQ_SYNC_TARGETS.includes(normalizePath(filePath))) {
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const schemaQuestions = parsed.data?.faqSchema?.mainEntity?.map((entity) => entity?.name).filter(Boolean) || [];
  const visibleQuestions = getVisibleFaqQuestions(parsed.content);

  if (schemaQuestions.length === 0 || visibleQuestions.length === 0) {
    errors.push({
      file: filePath,
      line: 1,
      message: 'Visible FAQ section and faqSchema must both exist on the targeted refresh batch',
      fix: 'Keep page FAQ headings and faqSchema.mainEntity in sync'
    });
    return;
  }

  const normalizedSchema = schemaQuestions.map(normalizeQuestion);
  const normalizedVisible = visibleQuestions.map(normalizeQuestion);

  if (
    normalizedSchema.length !== normalizedVisible.length ||
    normalizedSchema.some((question, index) => question !== normalizedVisible[index])
  ) {
    errors.push({
      file: filePath,
      line: 1,
      message: 'faqSchema questions do not match the visible FAQ section',
      fix: 'Use the same question order and wording in frontmatter and body'
    });
  }
}

function auditReindexTargets(filePath, content, errors) {
  const normalized = normalizePath(filePath);
  if (
    normalized !== '_workflow-documents/seo/urls-for-reindexing.txt' &&
    normalized !== '_workflow-documents/seo/gsc-reindexing-commands.txt'
  ) {
    return;
  }

  for (const slug of SEASONAL_SITEMAP_EXCLUSIONS) {
    const canonicalUrl = `https://bright-gift.com/blog/${slug}/`;
    if (content.includes(canonicalUrl)) {
      errors.push({
        file: filePath,
        line: 1,
        message: `Off-season seasonal URL is still listed for active reindexing: ${canonicalUrl}`,
        fix: 'Keep seasonal archive pages live, but remove them from active reindexing queues'
      });
    }
  }
}

function getSuppressedBlogInventory() {
  const suppressedSlugs = new Set();
  const suppressedFiles = new Set();

  for (const filePath of glob.sync('src/content/blog/*.md', { nodir: true })) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(raw);
    const slug =
      parsed.data?.slug ||
      path.basename(filePath, path.extname(filePath));

    if (parsed.data?.sitemap === false || SEASONAL_SITEMAP_EXCLUSIONS.has(slug)) {
      suppressedSlugs.add(slug);
      suppressedFiles.add(normalizePath(filePath));
    }
  }

  return { suppressedSlugs, suppressedFiles };
}

function auditSuppressedLinks(filePath, content, suppressedSlugs, suppressedFiles, errors) {
  const normalized = normalizePath(filePath);

  if (suppressedFiles.has(normalized)) {
    return;
  }

  if (
    !normalized.startsWith('src/content/blog/') &&
    !normalized.startsWith('src/pages/')
  ) {
    return;
  }

  const lines = content.split('\n');

  lines.forEach((line, index) => {
    for (const slug of suppressedSlugs) {
      if (
        line.includes(`/blog/${slug}/`) ||
        line.includes(`https://bright-gift.com/blog/${slug}/`)
      ) {
        errors.push({
          file: filePath,
          line: index + 1,
          message: `Indexable page links to sitemap-suppressed URL: /blog/${slug}/`,
          fix: 'Replace the link with an evergreen canonical target or remove it from active promotion'
        });
      }
    }
  });
}

function main() {
  console.log('🔍 Validating repo-level SEO policy...\n');

  const files = loadActiveFiles();
  const errors = [];
  const { suppressedSlugs, suppressedFiles } = getSuppressedBlogInventory();

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    auditCanonicalLiterals(filePath, content, errors);
    auditSitemap(filePath, content, errors);
    auditTimestampRules(filePath, content, errors);
    auditFaqSync(filePath, errors);
    auditReindexTargets(filePath, content, errors);
    auditSuppressedLinks(filePath, content, suppressedSlugs, suppressedFiles, errors);
  }

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      totalErrors: errors.length
    },
    errors
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`Files scanned: ${files.length}`);
  console.log(`Errors found: ${errors.length}`);
  console.log(`Report written to: ${REPORT_PATH}\n`);

  if (errors.length > 0) {
    console.log('🚨 REPO POLICY ERRORS:');
    for (const error of errors) {
      console.log(`  ${error.file}:${error.line} - ${error.message}`);
      console.log(`    Fix: ${error.fix}`);
    }
    console.log('');
    process.exit(1);
  }

  console.log('✅ Repo-level SEO policy passed');
}

main();
