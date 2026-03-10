#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const routesPath = path.join(projectRoot, 'dist', '_routes.json');
const workerBlogRoutePath = path.join(projectRoot, 'dist', '_worker.js', 'pages', 'blog.astro.mjs');
const staticBlogIndexPath = path.join(projectRoot, 'dist', 'blog', 'index.html');

if (!fs.existsSync(routesPath)) {
  console.log('Routes fix skipped: dist/_routes.json not found.');
  process.exit(0);
}

if (!fs.existsSync(workerBlogRoutePath)) {
  console.log('Routes fix skipped: blog worker route was not generated.');
  process.exit(0);
}

const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
const originalExcludeCount = Array.isArray(routes.exclude) ? routes.exclude.length : 0;

if (!Array.isArray(routes.exclude)) {
  console.log('Routes fix skipped: _routes.json does not contain an exclude array.');
  process.exit(0);
}

// Cloudflare Pages was excluding /blog even when there is no static blog/index.html.
// That makes /blog/ 404 live instead of hitting the generated worker route.
if (!fs.existsSync(staticBlogIndexPath)) {
  routes.exclude = routes.exclude.filter((entry) => entry !== '/blog');
}

if (routes.exclude.length !== originalExcludeCount) {
  fs.writeFileSync(routesPath, `${JSON.stringify(routes, null, 2)}\n`);
  console.log('Updated dist/_routes.json: removed /blog from exclude list so the worker handles blog archive routes.');
} else {
  console.log('Routes fix not needed: /blog was already routed to the worker.');
}
