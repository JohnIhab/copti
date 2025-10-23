#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Usage:
//   SITEMAP_BASE_URL=https://example.com node ./scripts/generate-sitemap.js
// or
//   node ./scripts/generate-sitemap.js https://example.com

const cwd = process.cwd();
const pagesDir = path.join(cwd, 'src', 'pages');
const publicDir = path.join(cwd, 'public');

const baseFromEnv = process.env.SITEMAP_BASE_URL || process.env.SITE_URL;
const baseFromArg = process.argv[2];
// Default to the user's domain if none provided
const baseUrl = (baseFromEnv || baseFromArg || 'https://www.copti.me').replace(/\/+$/, '');

function filenameToRoute(name) {
  if (name === 'index') return '/';
  // convert PascalCase or camelCase to kebab-case: ReadBible -> read-bible
  return (
    '/' +
    name
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .replace(/_/g, '-')
      .toLowerCase()
  );
}

if (!fs.existsSync(pagesDir)) {
  console.error('Could not find pages directory:', pagesDir);
  process.exit(1);
}

const files = fs.readdirSync(pagesDir);
const routes = [];

for (const f of files) {
  const full = path.join(pagesDir, f);
  const stat = fs.statSync(full);
  if (stat.isDirectory()) continue;
  if (!f.endsWith('.tsx')) continue;
  const name = path.basename(f, '.tsx');
  if (/notfound/i.test(name)) continue; // skip NotFound
  // skip files that are not pages (helpers), allow typical pages
  const route = filenameToRoute(name);
  routes.push({ route, file: full, lastmod: stat.mtime.toISOString() });
}

// Ensure root exists
if (!routes.some(r => r.route === '/')) {
  routes.unshift({ route: '/', file: null, lastmod: new Date().toISOString() });
}

// Build XML
const urlset = routes
  .map(r => {
    return `  <url>\n    <loc>${baseUrl}${r.route}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log('Wrote sitemap to', outPath);
console.log('Base URL used:', baseUrl);

// Done
process.exit(0);
