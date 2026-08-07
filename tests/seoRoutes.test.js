/**
 * Tests for the public URL map.
 *
 *   node --test tests/
 *
 * `src/utils/seoRoutes.js` is deliberately free of browser globals so it can be imported
 * here and by the build-time sitemap generator.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  pathToHash,
  hashToPath,
  canonicalUrlFor,
  isPrivateRoute,
  STATIC_PUBLIC_ROUTES,
  PRIVATE_ROUTES,
} from '../src/utils/seoRoutes.js';

const ORIGIN = 'https://kufitravel.com';

test('static public routes map both ways', () => {
  for (const route of STATIC_PUBLIC_ROUTES) {
    assert.equal(pathToHash(route.path), route.hash, `path ${route.path} -> hash`);
    assert.equal(hashToPath(route.hash), route.path, `hash ${route.hash} -> path`);
  }
});

test('detail paths resolve to the right internal route', () => {
  assert.equal(pathToHash('/activity/abc123'), 'activity-detail/abc123');
  assert.equal(pathToHash('/blog/xyz789'), 'blog-detail/xyz789');
  assert.equal(pathToHash('/destinations/Egypt'), 'country-details/Egypt');
  assert.equal(pathToHash('/category/Adventure'), 'category-page/Adventure');
});

test('detail routes produce canonical paths', () => {
  assert.equal(hashToPath('activity-detail/abc123'), '/activity/abc123');
  assert.equal(hashToPath('blog-detail/xyz789'), '/blog/xyz789');
  assert.equal(hashToPath('country-details/Egypt'), '/destinations/Egypt');
  assert.equal(hashToPath('category-page/Adventure'), '/category/Adventure');
});

test('round-tripping a path leaves it unchanged', () => {
  const paths = [
    '/', '/explore', '/destinations', '/blogs', '/about',
    '/activity/698b406e95c25431747632b8',
    '/blog/69afcf8ebf67096f122ca54f',
    '/destinations/Egypt',
    '/category/Adventure',
  ];
  for (const p of paths) {
    assert.equal(hashToPath(pathToHash(p)), p, `round-trip ${p}`);
  }
});

test('names with spaces and punctuation survive the round trip', () => {
  // Category and country names are used directly in URLs, so encoding must hold.
  const encoded = hashToPath('country-details/Saudi Arabia');
  assert.equal(encoded, '/destinations/Saudi%20Arabia');
  assert.equal(pathToHash(encoded), 'country-details/Saudi Arabia');

  const cat = hashToPath('category-page/Food and Drink');
  assert.equal(pathToHash(cat), 'category-page/Food and Drink');
});

test('trailing and duplicated slashes are tolerated', () => {
  assert.equal(pathToHash('/explore/'), 'explore');
  assert.equal(pathToHash('explore'), 'explore');
  assert.equal(pathToHash('//explore//'), 'explore');
});

test('unknown paths are not claimed', () => {
  assert.equal(pathToHash('/nope'), null);
  assert.equal(pathToHash('/activity'), null, 'a detail route needs an id');
  assert.equal(pathToHash('/wp-admin'), null);
});

test('password reset links work as clean paths but are never indexable', () => {
  // The reset email now sends /reset-password/<token>, so the path must resolve...
  assert.equal(pathToHash('/reset-password/tok123'), 'reset-password/tok123');
  // ...while remaining out of the index.
  assert.equal(isPrivateRoute('reset-password'), true);
  assert.equal(canonicalUrlFor('reset-password/tok123', ORIGIN), null);
});

test('private routes have no canonical URL and are flagged', () => {
  for (const route of PRIVATE_ROUTES) {
    assert.equal(isPrivateRoute(route), true, `${route} must be private`);
    assert.equal(canonicalUrlFor(route, ORIGIN), null, `${route} must not be canonicalised`);
  }
});

test('supplier and admin panels are never indexable', () => {
  for (const r of ['admin', 'supplier', 'supplier-dashboard', 'user-dashboard', 'traveler-profile', 'itinerary-view']) {
    assert.equal(canonicalUrlFor(r, ORIGIN), null);
  }
});

test('canonical URLs are absolute and on the site origin', () => {
  assert.equal(canonicalUrlFor('home', ORIGIN), 'https://kufitravel.com/');
  assert.equal(canonicalUrlFor('activity-detail/abc', ORIGIN), 'https://kufitravel.com/activity/abc');
  assert.equal(canonicalUrlFor('blogs', ORIGIN), 'https://kufitravel.com/blogs');
  // A trailing slash on the origin must not double up.
  assert.equal(canonicalUrlFor('blogs', 'https://kufitravel.com/'), 'https://kufitravel.com/blogs');
});

test('home is canonicalised to a single URL', () => {
  assert.equal(hashToPath(''), '/');
  assert.equal(hashToPath('home'), '/');
  assert.equal(hashToPath('#home'), '/');
  assert.equal(pathToHash('/'), 'home');
});
