/**
 * The public URL map — the single source of truth for how a crawlable path relates to
 * the app's internal hash route.
 *
 * Background: the app navigates with `#hash` fragments. Search engines and AI crawlers
 * treat everything after `#` as the *same* URL, so every public page collapsed into one
 * indexable document and nothing but the home page could ever be discovered.
 *
 * Rather than rewriting the router (a large, risky change to every screen), the app now
 * also answers on clean paths:
 *
 *     /activity/<id>          ->  #activity-detail/<id>
 *     /destinations/<country> ->  #country-details/<country>
 *     /blog/<slug-or-id>      ->  #blog-detail/<id>
 *
 * `pathToHash` runs once on boot so a crawler (or a shared link) that lands on a clean
 * path is routed to the right screen, and `hashToPath` produces the canonical URL that
 * every page advertises and that the sitemap lists.
 *
 * This module is imported by the build-time sitemap generator as well as the app, so it
 * must stay free of browser globals at module scope.
 */

/** Public, indexable sections that always exist. */
export const STATIC_PUBLIC_ROUTES = [
  { path: '/', hash: 'home', changefreq: 'daily', priority: 1.0 },
  { path: '/explore', hash: 'explore', changefreq: 'daily', priority: 0.9 },
  { path: '/destinations', hash: 'country-details', changefreq: 'weekly', priority: 0.9 },
  { path: '/activities', hash: 'top-activities', changefreq: 'daily', priority: 0.9 },
  { path: '/blogs', hash: 'blogs', changefreq: 'daily', priority: 0.8 },
  { path: '/about', hash: 'about', changefreq: 'monthly', priority: 0.5 },
];

/**
 * Routes that must never be indexed: private panels, auth screens and anything
 * user-specific. These get `noindex` at runtime and are excluded from the sitemap.
 */
export const PRIVATE_ROUTES = [
  'admin', 'supplier', 'supplier-profile', 'supplier-dashboard',
  'user-profile', 'traveler-profile', 'user-dashboard', 'dashboard',
  'my-trip-requests', 'trip-requests', 'itinerary-view', 'notifications',
  'login', 'register', 'reset-password', 'forgot-password',
  'payment', 'payment-success', 'payment-failed', 'booking-confirmation',
  'travel-booking', 'checkout',
];

/** Dynamic sections: one URL per record, filled in by the sitemap generator. */
export const DYNAMIC_ROUTE_KINDS = {
  activity: { prefix: '/activity', hashPrefix: 'activity-detail', changefreq: 'weekly', priority: 0.8 },
  blog: { prefix: '/blog', hashPrefix: 'blog-detail', changefreq: 'monthly', priority: 0.7 },
  destination: { prefix: '/destinations', hashPrefix: 'country-details', changefreq: 'weekly', priority: 0.8 },
  category: { prefix: '/category', hashPrefix: 'category-page', changefreq: 'weekly', priority: 0.6 },
};

const trimSlashes = (v) => String(v || '').replace(/^\/+|\/+$/g, '');

export function isPrivateRoute(page) {
  const key = String(page || '').split('/')[0];
  return PRIVATE_ROUTES.includes(key);
}

/**
 * Translate a clean path into the internal hash route.
 * @returns {string|null} the hash route, or null when the path is not a public URL.
 */
export function pathToHash(pathname) {
  const path = `/${trimSlashes(pathname)}`;

  if (path === '/') return 'home';

  const staticMatch = STATIC_PUBLIC_ROUTES.find((r) => r.path === path);
  if (staticMatch) return staticMatch.hash;

  const segments = trimSlashes(path).split('/');
  const [head, ...rest] = segments;
  const tail = rest.join('/');

  switch (head) {
    case 'activity':
      return tail ? `activity-detail/${tail}` : null;
    case 'blog':
      return tail ? `blog-detail/${decodeURIComponent(tail)}` : null;
    case 'destinations':
      return tail ? `country-details/${decodeURIComponent(tail)}` : 'country-details';
    case 'category':
      return tail ? `category-page/${decodeURIComponent(tail)}` : null;
    // Not indexable, but the path form must still work: password reset links are
    // emailed as `/reset-password/<token>`.
    case 'reset-password':
      return tail ? `reset-password/${tail}` : null;
    default:
      return null;
  }
}

/**
 * Translate an internal hash route into its canonical public path.
 * @returns {string|null} null when the route has no public URL (private/unknown).
 */
export function hashToPath(hash) {
  const raw = trimSlashes(String(hash || '').replace(/^#/, '')) || 'home';
  const [head, ...rest] = raw.split('/');
  const tail = rest.join('/');

  if (head === 'home' || head === '') return '/';

  const staticMatch = STATIC_PUBLIC_ROUTES.find((r) => r.hash === raw);
  if (staticMatch) return staticMatch.path;

  switch (head) {
    case 'activity-detail':
      return tail ? `/activity/${tail}` : null;
    case 'blog-detail':
      return tail ? `/blog/${encodeURIComponent(tail)}` : null;
    case 'country-details':
      return tail ? `/destinations/${encodeURIComponent(tail)}` : '/destinations';
    case 'category-page':
      return tail ? `/category/${encodeURIComponent(tail)}` : null;
    case 'explore':
      return '/explore';
    case 'blogs':
      return '/blogs';
    case 'about':
      return '/about';
    default:
      return null;
  }
}

/** Absolute canonical URL for a hash route, or null when the route is not public. */
export function canonicalUrlFor(hash, origin) {
  if (isPrivateRoute(String(hash || '').split('/')[0])) return null;
  const path = hashToPath(hash);
  if (!path) return null;
  return `${String(origin || '').replace(/\/$/, '')}${path}`;
}
