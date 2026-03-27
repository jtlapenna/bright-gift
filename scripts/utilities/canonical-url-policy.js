#!/usr/bin/env node

const SITE_ORIGIN = 'https://bright-gift.com';
const seasonalSeoExclusions = require('../../src/data/seasonal-seo-exclusions.json');

// Off-season holiday pages stay live but should not be pushed as fresh crawl targets.
const SEASONAL_SITEMAP_EXCLUSIONS = new Set(seasonalSeoExclusions);

// Ignore the known bulk-refresh batch that created false freshness signals.
const UNTRUSTED_BULK_LAST_UPDATED = new Set(['2026-03-10']);

function canonicalBlogPath(slug) {
  return `/blog/${slug}/`;
}

function canonicalBlogUrl(slug) {
  return `${SITE_ORIGIN}${canonicalBlogPath(slug)}`;
}

function isCanonicalBlogPath(value) {
  return /^\/blog\/[a-z0-9-]+\/$/.test(value);
}

function isCanonicalBlogUrl(value) {
  return /^https:\/\/bright-gift\.com\/blog\/[a-z0-9-]+\/$/.test(value);
}

function shouldIncludeBlogPostInSitemap(slug) {
  return !SEASONAL_SITEMAP_EXCLUSIONS.has(slug);
}

function normalizeDateValue(value) {
  if (!value) {
    return undefined;
  }

  const normalized =
    value instanceof Date
      ? value.toISOString().split('T')[0]
      : String(value).split('T')[0];

  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : undefined;
}

function sanitizeLastUpdated(value) {
  const normalized = normalizeDateValue(value);

  if (!normalized || UNTRUSTED_BULK_LAST_UPDATED.has(normalized)) {
    return undefined;
  }

  return normalized;
}

function getSitemapLastModified(data) {
  return sanitizeLastUpdated(data?.lastUpdated) || normalizeDateValue(data?.date || data?.pubDate);
}

module.exports = {
  SITE_ORIGIN,
  SEASONAL_SITEMAP_EXCLUSIONS,
  UNTRUSTED_BULK_LAST_UPDATED,
  canonicalBlogPath,
  canonicalBlogUrl,
  isCanonicalBlogPath,
  isCanonicalBlogUrl,
  shouldIncludeBlogPostInSitemap,
  normalizeDateValue,
  sanitizeLastUpdated,
  getSitemapLastModified
};
