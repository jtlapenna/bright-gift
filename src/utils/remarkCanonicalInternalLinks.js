/**
 * Remark plugin to normalize internal links to canonical trailing-slash URLs.
 * Purpose: prevent Google (and users) from discovering redirecting URL variants.
 */
export default function remarkCanonicalInternalLinks() {
  // Only normalize known SEO-critical internal routes.
  const isCanonicalPath = (url) =>
    url === '/blog' ||
    url === '/privacy' ||
    url === '/terms' ||
    url === '/contact' ||
    url === '/data-deletion' ||
    url.startsWith('/blog/') ||
    url.startsWith('/category/');

  // Minimal AST walk (avoids extra deps).
  const walk = (node) => {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (typeof node !== 'object') return;

    // Normalize markdown link nodes.
    if (node.type === 'link' && typeof node.url === 'string') {
      const url = node.url;
      if (!url.startsWith('/') || url.startsWith('//')) return;
      if (url === '/' || url.endsWith('/') || url.includes('?') || url.includes('#')) return;
      if (!isCanonicalPath(url)) return;
      node.url = `${url}/`;
      return;
    }

    // Recurse through common child containers.
    if (node.children) walk(node.children);
  };

  return (tree) => walk(tree);
}

