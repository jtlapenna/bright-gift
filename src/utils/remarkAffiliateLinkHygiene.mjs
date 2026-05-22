const AFFILIATE_HOSTS = [
  'amazon.com',
  'amzn.to',
  'bookshop.org',
  'arjdj2msd.com',
  'littleherolabs.com',
  'impact.com',
  'flexoffers.com',
];

function normalizeHost(hostname) {
  return String(hostname || '').replace(/^www\./, '').toLowerCase();
}

function hostMatches(host, affiliateHost) {
  return host === affiliateHost || host.endsWith(`.${affiliateHost}`);
}

function isAffiliateHref(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }

  try {
    const url = new URL(href, 'https://bright-gift.com');
    const host = normalizeHost(url.hostname);
    const isKnownHost = AFFILIATE_HOSTS.some((affiliateHost) => hostMatches(host, affiliateHost));
    const hasAffiliateParam = url.searchParams.has('tag') || url.searchParams.has('affiliate');
    return host !== 'bright-gift.com' && (isKnownHost || hasAffiliateParam);
  } catch {
    return false;
  }
}

function mergeRel(existingRel, additions) {
  const tokens = new Set(
    String(existingRel || '')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean),
  );

  for (const addition of additions) tokens.add(addition);

  const preferredOrder = ['noopener', 'noreferrer', 'sponsored', 'nofollow'];
  const ordered = preferredOrder.filter((token) => tokens.has(token));
  const extra = [...tokens].filter((token) => !preferredOrder.includes(token));
  return [...ordered, ...extra].join(' ');
}

function getAttr(rawAttrs, name) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>` + '`' + `]+))`, 'i');
  const match = rawAttrs.match(pattern);
  return match ? match[1] ?? match[2] ?? match[3] ?? '' : '';
}

function setAttr(rawAttrs, name, value) {
  const escaped = String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const pattern = new RegExp(`(\\s${name}\\s*=\\s*)(?:"[^"]*"|'[^']*'|[^\\s"'=<>` + '`' + `]+)`, 'i');

  if (pattern.test(rawAttrs)) {
    return rawAttrs.replace(pattern, `$1"${escaped}"`);
  }

  return `${rawAttrs} ${name}="${escaped}"`;
}

function transformAnchorTag(match, rawAttrs) {
  const href = getAttr(rawAttrs, 'href');
  if (!isAffiliateHref(href)) return match;

  const target = getAttr(rawAttrs, 'target');
  const relAdditions = ['sponsored', 'nofollow'];
  if (target.toLowerCase() === '_blank') relAdditions.unshift('noopener', 'noreferrer');

  const rel = mergeRel(getAttr(rawAttrs, 'rel'), relAdditions);
  return `<a${setAttr(rawAttrs, 'rel', rel)}>`;
}

function transformHtml(value) {
  return String(value || '').replace(/<a\b([^>]*)>/gi, transformAnchorTag);
}

function walk(node) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach(walk);
    return;
  }
  if (typeof node !== 'object') return;

  if (node.type === 'link' && typeof node.url === 'string' && isAffiliateHref(node.url)) {
    node.data = node.data || {};
    const hProperties = node.data.hProperties || {};
    const relAdditions = ['sponsored', 'nofollow'];
    if (String(hProperties.target || '').toLowerCase() === '_blank') {
      relAdditions.unshift('noopener', 'noreferrer');
    }
    node.data.hProperties = {
      ...hProperties,
      rel: mergeRel(hProperties.rel, relAdditions),
    };
  }

  if (node.type === 'html' && typeof node.value === 'string') {
    node.value = transformHtml(node.value);
  }

  if (node.children) walk(node.children);
}

export default function remarkAffiliateLinkHygiene() {
  return (tree) => walk(tree);
}
