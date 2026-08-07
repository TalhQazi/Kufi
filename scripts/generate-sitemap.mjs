/**
 * Build-time sitemap generation.
 *
 * A sitemap has to be served from the website's own origin, but the content lives in the
 * API's database. This script asks the API for the current public URL set at build time
 * and writes a static `dist/sitemap.xml`, so the deployed site serves a real, complete
 * sitemap without needing a server of its own.
 *
 * It also rewrites the `Sitemap:` line in `dist/robots.txt` to the configured site URL.
 *
 * Configuration (env):
 *   VITE_SITE_URL   public website origin, e.g. https://kufitravel.com
 *   VITE_API_URL    API base, e.g. https://kufi-backend-new1.vercel.app/api
 *
 * The build never fails because of this step: if the API is unreachable, a sitemap
 * containing the static routes is written instead, and a warning is printed.
 */
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { STATIC_PUBLIC_ROUTES } from '../src/utils/seoRoutes.js';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://kufitravel.com').replace(/\/$/, '');
const API_URL = (process.env.VITE_API_URL || 'https://kufi-backend-new1.vercel.app/api').replace(/\/$/, '');
const OUT_DIR = path.resolve(process.cwd(), 'dist');
const TIMEOUT_MS = 30000;

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toW3CDate = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString().split('T')[0] : null;
};

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Static routes only — the guaranteed-correct fallback. */
function staticUrls() {
  return STATIC_PUBLIC_ROUTES.map((r) => ({
    loc: `${SITE_URL}${r.path === '/' ? '/' : r.path}`,
    changefreq: r.changefreq,
    priority: String(r.priority),
  }));
}

/**
 * Ask the API for the full URL set. The backend already builds this from the database
 * (routes/seoRoutes.js), so the two can never drift apart.
 */
async function dynamicUrls() {
  const origin = API_URL.replace(/\/api$/, '');
  const data = await fetchJson(`${origin}/sitemap.json`);
  if (!Array.isArray(data?.urls)) throw new Error('unexpected sitemap.json payload');

  // The API is configured with its own SITE_URL; re-point everything at the origin this
  // build is for, so a staging build never emits production URLs.
  return data.urls.map((u) => ({
    ...u,
    loc: `${SITE_URL}${new URL(u.loc, SITE_URL).pathname}`,
  }));
}

function buildXml(urls) {
  const seen = new Set();
  const unique = urls.filter((u) => {
    if (!u?.loc || seen.has(u.loc)) return false;
    seen.add(u.loc);
    return true;
  });

  const body = unique
    .map((u) =>
      [
        '  <url>',
        `    <loc>${escapeXml(u.loc)}</loc>`,
        u.lastmod ? `    <lastmod>${toW3CDate(u.lastmod) || u.lastmod}</lastmod>` : null,
        u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>` : null,
        u.priority ? `    <priority>${u.priority}</priority>` : null,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n');

  return {
    xml: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    count: unique.length,
  };
}

/** Point robots.txt at this build's sitemap. */
async function updateRobots() {
  const robotsPath = path.join(OUT_DIR, 'robots.txt');
  if (!existsSync(robotsPath)) return;
  const current = await readFile(robotsPath, 'utf8');
  const next = current.replace(/^Sitemap:.*$/m, `Sitemap: ${SITE_URL}/sitemap.xml`);
  await writeFile(robotsPath, next, 'utf8');
  console.log(`[sitemap] robots.txt -> Sitemap: ${SITE_URL}/sitemap.xml`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let urls;
  try {
    urls = await dynamicUrls();
    console.log(`[sitemap] fetched ${urls.length} URLs from ${API_URL.replace(/\/api$/, '')}/sitemap.json`);
  } catch (err) {
    console.warn(`[sitemap] WARNING: could not reach the API (${err.message}). Writing static routes only.`);
    urls = staticUrls();
  }

  const { xml, count } = buildXml(urls);
  await writeFile(path.join(OUT_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`[sitemap] wrote dist/sitemap.xml with ${count} URLs for ${SITE_URL}`);

  await updateRobots();
}

main().catch((err) => {
  // Never break a deploy over the sitemap.
  console.warn('[sitemap] skipped:', err.message);
});
