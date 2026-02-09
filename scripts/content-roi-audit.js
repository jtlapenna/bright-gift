#!/usr/bin/env node
/**
 * Purpose: Produce a portfolio-level SEO ROI audit for all blog posts.
 * Outputs: `_workflow-documents/SEO_audit/<date>_content-roi-audit/*`
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { globSync } = require('glob');

const SITE = 'https://bright-gift.com';
const ROOT = process.cwd();
const TODAY = new Date();
const BLOG_GLOB = 'src/content/blog/*.md';
const DIST_GLOB = 'dist/**/*.html';
const OUT_DIR = path.join(
  ROOT,
  '_workflow-documents',
  'SEO_audit',
  `${TODAY.toISOString().slice(0, 10)}_content-roi-audit`
);

// Purpose: normalize blog URL-ish strings to a slug
function toSlug(s) {
  if (!s) return '';
  const raw = String(s).trim();
  const fromUrl = raw.split('/blog/')[1] || raw;
  return fromUrl.replace(/^\/+|\/+$/g, '').split(/[?#]/)[0];
}

// Purpose: safe word count
function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

// Purpose: classify seasonality intent from slug/title
function seasonBucket(text) {
  const t = String(text || '').toLowerCase();
  if (/\bvalentine/.test(t)) return 'valentines';
  if (/\bchristmas\b|\bholiday\b/.test(t)) return 'holiday';
  if (/\bmother\b|\bmoms\b/.test(t)) return 'mothers-day';
  if (/\bgraduation\b/.test(t)) return 'graduation';
  if (/\bwedding\b|\banniversary\b/.test(t)) return 'wedding/anniversary';
  if (/\bbirthday\b/.test(t)) return 'birthday';
  return 'evergreen';
}

function yearIntent(text) {
  const m = String(text || '').match(/\b(20\d{2})\b/);
  return m ? Number(m[1]) : null;
}

// Purpose: compute a simple ROI score from on-site signals only.
function roiScore(p) {
  let score = 0;

  // Freshness intent: year in title/slug that is not current year
  if (p.yearIntent && p.yearIntent !== TODAY.getFullYear()) score += 3;

  // Seasonal pages are higher ROI when refreshed in advance
  if (p.season !== 'evergreen') score += 2;

  // Thin-ish content
  if (p.words && p.words < 1500) score += 2;

  // Low internal linking signals
  if (p.outboundInternalLinks < 3) score += 1;
  if (p.inboundUniquePages !== null && p.inboundUniquePages < 6) score += 2;
  else if (p.inboundUniquePages !== null && p.inboundUniquePages < 12) score += 1;

  // Affiliate density (very rough proxy for potential “thin affiliate” risk)
  if (p.affiliateCount && p.words) {
    const per100 = (p.affiliateCount / p.words) * 100;
    if (per100 > 1.5) score += 1;
  }

  return score;
}

// Purpose: scan dist HTML for inbound links to /blog/<slug>/
function buildInboundFromDist(slugs) {
  const distPath = path.join(ROOT, 'dist');
  if (!fs.existsSync(distPath)) return null;

  const slugSet = new Set(slugs);
  const inbound = Object.fromEntries(slugs.map(s => [s, { total: 0, pages: new Set() }]));

  const htmlFiles = globSync(DIST_GLOB, { nodir: true, absolute: true });
  const hrefRe = /href="(\/blog\/[^"]+)"/g;

  for (const file of htmlFiles) {
    let html = '';
    try {
      html = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    let m;
    while ((m = hrefRe.exec(html)) !== null) {
      const href = m[1];
      const slug = toSlug(href);
      if (!slugSet.has(slug)) continue;
      inbound[slug].total += 1;
      inbound[slug].pages.add(path.relative(ROOT, file));
    }
  }

  // Convert Sets to counts + top referrers
  const out = {};
  for (const slug of slugs) {
    const pages = [...inbound[slug].pages];
    out[slug] = { total: inbound[slug].total, uniquePages: pages.length, pages };
  }
  return out;
}

function extractOutboundInternalLinks(markdown) {
  const s = String(markdown || '');
  const patterns = [
    /\]\(\/blog\/[^)]+\)/g, // markdown links
    /href="\/blog\/[^"]+"/g // html links
  ];
  return patterns.reduce((acc, re) => acc + (s.match(re) || []).length, 0);
}

function extractAffiliateCount(frontmatter, markdown) {
  const s = String(markdown || '');
  const amazon = (s.match(/amazon\.com\/s\?k=/g) || []).length;
  const bookshop = (s.match(/bookshop\.org/g) || []).length;
  const other = (s.match(/arjdj2msd\.com/g) || []).length;
  return amazon + bookshop + other;
}

function main() {
  const blogFiles = globSync(BLOG_GLOB, { nodir: true, absolute: true });
  if (!blogFiles.length) {
    console.error(`No blog posts found at ${BLOG_GLOB}`);
    process.exit(1);
  }

  // Purpose: load + normalize all posts
  const posts = blogFiles.map(fp => {
    const raw = fs.readFileSync(fp, 'utf8');
    const { data, content } = matter(raw);
    const fileSlug = path.basename(fp, '.md');
    const slug = toSlug(data.slug || data.canonical || fileSlug) || fileSlug;
    const title = data.title || slug;
    const date = data.date || data.pubDate || null;
    const dateObj = date ? new Date(date) : null;
    // Purpose: compute consistently from the actual markdown body (frontmatter wordCount can drift).
    const words = wordCount(content);
    const outboundInternalLinks = extractOutboundInternalLinks(content);
    const affiliateCount = extractAffiliateCount(data, content);
    const season = seasonBucket(`${slug} ${title}`);
    const y = yearIntent(`${slug} ${title} ${data.metaTitle || ''}`);

    return {
      file: path.relative(ROOT, fp),
      slug,
      url: `${SITE}/blog/${slug}/`,
      title: String(title),
      category: data.category || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status || null,
      draft: Boolean(data.draft),
      canonical: data.canonical || null,
      date: dateObj && !Number.isNaN(dateObj.valueOf()) ? dateObj.toISOString().slice(0, 10) : null,
      words,
      outboundInternalLinks,
      affiliateCount,
      season,
      yearIntent: y
    };
  });

  const slugs = posts.map(p => p.slug);
  const inbound = buildInboundFromDist(slugs);

  const enriched = posts.map(p => {
    const inb = inbound ? inbound[p.slug] : null;
    const inboundUniquePages = inb ? inb.uniquePages : null;
    const inboundTotal = inb ? inb.total : null;
    const score = roiScore({ ...p, inboundUniquePages, inboundTotal });
    return { ...p, inboundUniquePages, inboundTotal, roiScore: score };
  });

  // Purpose: compute portfolio summary
  const by = (arr, keyFn) => arr.reduce((m, x) => {
    const k = keyFn(x) ?? 'unknown';
    m[k] = (m[k] || 0) + 1;
    return m;
  }, {});

  const summary = {
    generatedAt: new Date().toISOString(),
    totals: {
      posts: enriched.length,
      wordsMedian: enriched.map(p => p.words).sort((a, b) => a - b)[Math.floor(enriched.length / 2)],
      withDistInbound: inbound ? true : false
    },
    byCategory: by(enriched, p => p.category),
    bySeason: by(enriched, p => p.season),
    byYearIntent: by(enriched, p => p.yearIntent ? String(p.yearIntent) : 'none'),
    roiTop10: enriched.slice().sort((a, b) => b.roiScore - a.roiScore).slice(0, 10).map(p => ({
      slug: p.slug,
      url: p.url,
      roiScore: p.roiScore,
      season: p.season,
      yearIntent: p.yearIntent,
      words: p.words,
      inboundUniquePages: p.inboundUniquePages,
      outboundInternalLinks: p.outboundInternalLinks
    }))
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'content-roi-audit.json'), JSON.stringify({ summary, posts: enriched }, null, 2));

  // Purpose: write a readable markdown summary for humans.
  const byScore = enriched.slice().sort((a, b) => b.roiScore - a.roiScore);
  const top = byScore.slice(0, 15);
  const lowestInbound = enriched
    .filter(p => p.inboundUniquePages !== null)
    .slice()
    .sort((a, b) => (a.inboundUniquePages - b.inboundUniquePages) || (b.roiScore - a.roiScore))
    .slice(0, 15);
  const zeroOutbound = enriched
    .filter(p => p.outboundInternalLinks === 0)
    .slice()
    .sort((a, b) => b.roiScore - a.roiScore)
    .slice(0, 15);
  const yearPages = enriched
    .filter(p => p.yearIntent)
    .slice()
    .sort((a, b) => (a.yearIntent - b.yearIntent) || (b.roiScore - a.roiScore));

  const md = [
    `# Content SEO ROI Audit (${TODAY.toISOString().slice(0, 10)})`,
    ``,
    `This is a portfolio-level audit of **${enriched.length}** blog posts using on-site signals:`,
    `- content basics (words, internal links out, affiliate density)`,
    `- intent flags (seasonality + year-in-title)`,
    inbound ? `- internal discovery (inbound links from built \`dist/\`)` : `- internal discovery (note: \`dist/\` missing; inbound links not measured)`,
    ``,
    `## High-ROI refresh candidates (top 15)`,
    ``,
    `| Post | ROI | Season | Year | Words | Inbound pages | Outbound links |`,
    `|---|---:|---|---:|---:|---:|---:|`,
    ...top.map(p => `| [${p.slug}](${p.url}) | ${p.roiScore} | ${p.season} | ${p.yearIntent ?? ''} | ${p.words} | ${p.inboundUniquePages ?? ''} | ${p.outboundInternalLinks} |`),
    ``,
    `## Weak internal discovery (lowest inbound pages)`,
    ``,
    `| Post | Inbound pages | Total links | ROI | Words |`,
    `|---|---:|---:|---:|---:|`,
    ...lowestInbound.map(p => `| [${p.slug}](${p.url}) | ${p.inboundUniquePages ?? ''} | ${p.inboundTotal ?? ''} | ${p.roiScore} | ${p.words} |`),
    ``,
    `## Missing crosslinks (0 outbound internal links)`,
    ``,
    `| Post | ROI | Season | Year | Inbound pages | Words |`,
    `|---|---:|---|---:|---:|---:|`,
    ...zeroOutbound.map(p => `| [${p.slug}](${p.url}) | ${p.roiScore} | ${p.season} | ${p.yearIntent ?? ''} | ${p.inboundUniquePages ?? ''} | ${p.words} |`),
    ``,
    `## Year-in-title/slug pages (refresh or evergreenize)`,
    ``,
    `| Post | Year | Season | ROI |`,
    `|---|---:|---|---:|`,
    ...yearPages.map(p => `| [${p.slug}](${p.url}) | ${p.yearIntent} | ${p.season} | ${p.roiScore} |`),
    ``,
    `## Portfolio summary`,
    ``,
    `- **By category**: ${Object.entries(summary.byCategory).map(([k, v]) => `\`${k}\`: ${v}`).join(', ')}`,
    `- **By season intent**: ${Object.entries(summary.bySeason).map(([k, v]) => `\`${k}\`: ${v}`).join(', ')}`,
    `- **Year-in-title/slug**: ${Object.entries(summary.byYearIntent).map(([k, v]) => `\`${k}\`: ${v}`).join(', ')}`,
    ``,
    `## Recommended ROI strategy (default)`,
    ``,
    `### 1) Refresh “freshness intent” posts first (highest leverage)`,
    `- For posts with a year (e.g. 2024/2025), either:`,
    `  - **Update to 2026** (and update list items + intro + metadata), or`,
    `  - **Remove the year** and make the post evergreen if the query is evergreen.`,
    ``,
    `### 2) Strengthen topical clusters with 3–5 hub paths`,
    `- Ensure each cluster has:`,
    `  - 1 “hub” page (category/hub block + an evergreen guide)`,
    `  - 3–6 supporting posts interlinked via contextual links + “related guides”.`,
    ``,
    `### 3) Consolidate overlapping posts (avoid cannibalization)`,
    `- When two posts target the same query family, merge into the stronger URL and 301 the weaker one.`,
    ``,
    `### 4) Raise quality signals on affiliate-heavy pages`,
    `- Add “how we picked”, “best for / not for”, and comparison tables to reduce “thin affiliate” risk.`,
    ``,
    `## Suggested 30/60/90 day plan`,
    ``,
    `### Next 30 days (fast wins)`,
    `- Refresh the top 5 ROI posts (update year/seasonality, add missing crosslinks, improve intros + FAQs).`,
    `- For posts with **0 outbound internal links**, add 3–6 contextual links to close the cluster loops.`,
    ``,
    `### Next 60 days (cluster strength)`,
    `- Pick 3 clusters (e.g. remote work, eco/ethical, gaming) and ensure each has:`,
    `  - a hub path (homepage/blog/category links already exist) + an evergreen “anchor” guide,`,
    `  - 3–6 supporting guides with consistent crosslinking and “related guides” blocks.`,
    ``,
    `### Next 90 days (content consolidation + scaling)`,
    `- Merge overlapping posts that target the same query family and 301 the weaker URL to the stronger one.`,
    `- Expand only the clusters that show improving indexation/traffic first.`,
    ``,
    `---`,
    `**Files:**`,
    `- \`content-roi-audit.json\` (full dataset)`,
    `- \`content-roi-audit.md\` (this summary)`,
    ``
  ].join('\n');

  fs.writeFileSync(path.join(OUT_DIR, 'content-roi-audit.md'), md);

  console.log(`✅ Wrote audit to: ${path.relative(ROOT, OUT_DIR)}`);
}

main();

