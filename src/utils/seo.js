/**
 * Runtime <head> management.
 *
 * The app ships a single static index.html, so without this every page reported the same
 * title, no description and no canonical URL — search engines and AI crawlers had nothing
 * to tell one page from another.
 *
 * `applySeo` updates the document head for the current screen: title, description,
 * canonical link, Open Graph/Twitter tags, robots directives and JSON-LD structured data.
 *
 * Structured data is only ever emitted from real page content. Nothing here invents
 * ratings, prices, review counts or availability.
 */

import { canonicalUrlFor, isPrivateRoute } from './seoRoutes';

export const SITE_NAME = 'Kufi Travel';
const DEFAULT_DESCRIPTION =
  'Discover destinations, activities and travel guides, and plan a tailor-made trip with Kufi Travel.';

/** Tags this module owns, so a re-render replaces rather than accumulates them. */
const MANAGED_ATTR = 'data-kufi-seo';

const getOrigin = () =>
  (typeof window !== 'undefined' && window.location?.origin) || '';

function upsertMeta(selectorAttr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${selectorAttr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(selectorAttr, key);
    el.setAttribute(MANAGED_ATTR, '1');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) {
    if (el?.hasAttribute(MANAGED_ATTR)) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute(MANAGED_ATTR, '1');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Replace all JSON-LD blocks this module previously wrote. */
function setStructuredData(blocks) {
  document.head
    .querySelectorAll(`script[type="application/ld+json"][${MANAGED_ATTR}]`)
    .forEach((el) => el.remove());

  (blocks || []).filter(Boolean).forEach((data) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(MANAGED_ATTR, '1');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  });
}

/** Site-wide identity, emitted on every public page. */
function baseStructuredData(origin) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: origin || undefined,
      logo: origin ? `${origin}/assets/kufi-travel-logo.png` : undefined,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: origin || undefined,
    },
  ];
}

/** BreadcrumbList from an ordered [{ name, path }] trail. */
export function buildBreadcrumbs(trail, origin) {
  const items = (trail || []).filter((t) => t?.name);
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.path ? `${origin}${item.path}` : undefined,
    })),
  };
}

/**
 * Apply SEO metadata for the current page.
 *
 * @param {object} options
 * @param {string} options.hash        internal route, e.g. `activity-detail/123`
 * @param {string} [options.title]     page title (site name is appended)
 * @param {string} [options.description]
 * @param {string} [options.image]     absolute or root-relative social image
 * @param {Array}  [options.structuredData] extra JSON-LD blocks
 * @param {Array}  [options.breadcrumbs]    [{ name, path }]
 * @param {boolean}[options.noindex]   force noindex regardless of route
 */
export function applySeo({
  hash,
  title,
  description,
  image,
  structuredData = [],
  breadcrumbs = null,
  noindex = false,
} = {}) {
  if (typeof document === 'undefined') return;

  const origin = getOrigin();
  const routeKey = String(hash || '').split('/')[0];
  const isPrivate = noindex || isPrivateRoute(routeKey);
  const canonical = isPrivate ? null : canonicalUrlFor(hash, origin);

  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Tailor-made trips, destinations and travel guides`;
  const desc = description || DEFAULT_DESCRIPTION;
  const absoluteImage = image
    ? (/^https?:\/\//i.test(image) ? image : `${origin}${image.startsWith('/') ? '' : '/'}${image}`)
    : `${origin}/assets/kufi-travel-logo.png`;

  document.title = fullTitle;
  document.documentElement.lang = 'en';

  upsertMeta('name', 'description', desc);
  // Private areas must never be indexed, but they are still crawlable links — the
  // directive is what keeps them out of the index, not a blanket block.
  upsertMeta('name', 'robots', isPrivate ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  upsertLink('canonical', canonical);

  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:type', routeKey === 'blog-detail' ? 'article' : 'website');
  upsertMeta('property', 'og:title', fullTitle);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:image', absoluteImage);
  if (canonical) upsertMeta('property', 'og:url', canonical);

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', fullTitle);
  upsertMeta('name', 'twitter:description', desc);
  upsertMeta('name', 'twitter:image', absoluteImage);

  if (isPrivate) {
    setStructuredData([]);
    return;
  }

  setStructuredData([
    ...baseStructuredData(origin),
    buildBreadcrumbs(breadcrumbs, origin),
    ...structuredData,
  ]);
}

/** Plain-text summary from HTML, for meta descriptions. */
export function toMetaDescription(html, length = 155) {
  const text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}
