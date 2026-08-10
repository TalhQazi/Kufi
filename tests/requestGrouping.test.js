/**
 * Request grouping in the Supplier Panel.
 *
 * Grouping used to key on the traveller alone, so two separate trips from the same
 * person collapsed into one parent/child node — the second trip was invisible and every
 * action button targeted the first.
 *
 * This pins the keying rule. It mirrors the `groupedRequests` memo in
 * `src/pages/supplierpannel/supplier-requests.jsx`; keep the two in step.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

/** Same normalization the component uses (`formatTripDate`). */
function formatTripDate(value) {
  if (value === null || value === undefined) return '—';
  const v = String(value || '').trim();
  if (!v) return '—';
  const isoMatch = v.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch?.[1]) return isoMatch[1];
  const t = Date.parse(v);
  if (Number.isFinite(t)) return new Date(t).toISOString().slice(0, 10);
  return v;
}

/** The grouping rule under test. */
function groupRequests(list) {
  const groups = {};
  list.forEach((req) => {
    const traveller = String(req.email || req.name || 'unknown').trim().toLowerCase();
    const destination = String(
      req.tripDetails?.country ?? req.location ?? req.destination ?? ''
    ).trim().toLowerCase();
    const arrival = formatTripDate(req.tripDetails?.arrivalDate);
    const departure = formatTripDate(req.tripDetails?.departureDate);
    const groupKey = [traveller, destination, arrival, departure].join('|');

    if (!groups[groupKey]) {
      groups[groupKey] = { key: groupKey, user: { name: req.name, email: req.email }, requests: [] };
    }
    groups[groupKey].requests.push(req);
  });
  return Object.values(groups);
}

const req = (over = {}) => ({
  id: over.id || Math.random().toString(36).slice(2),
  name: 'Sara Khan',
  email: 'sara@example.com',
  tripDetails: { country: 'Lebanon', arrivalDate: '2026-08-01', departureDate: '2026-08-07' },
  ...over,
});

test('two different trips from the same traveller stay separate', () => {
  const groups = groupRequests([
    req({ id: 'a', tripDetails: { country: 'Lebanon', arrivalDate: '2026-08-01', departureDate: '2026-08-07' } }),
    req({ id: 'b', tripDetails: { country: 'Lebanon', arrivalDate: '2026-10-05', departureDate: '2026-10-12' } }),
  ]);
  assert.equal(groups.length, 2, 'same country, different dates must not merge');
  assert.deepEqual(groups.map((g) => g.requests.length), [1, 1]);
});

test('same country and different dates is the reported case', () => {
  // The exact scenario reported: one traveller, two itineraries, same country.
  const groups = groupRequests([
    req({ id: 'a', tripDetails: { country: 'Egypt', arrivalDate: '2026-09-01', departureDate: '2026-09-05' } }),
    req({ id: 'b', tripDetails: { country: 'Egypt', arrivalDate: '2026-11-01', departureDate: '2026-11-04' } }),
  ]);
  assert.equal(groups.length, 2);
  assert.notEqual(groups[0].key, groups[1].key, 'group keys must be unique');
});

test('different destinations stay separate', () => {
  const groups = groupRequests([
    req({ id: 'a', tripDetails: { country: 'Lebanon', arrivalDate: '2026-08-01', departureDate: '2026-08-07' } }),
    req({ id: 'b', tripDetails: { country: 'Egypt', arrivalDate: '2026-08-01', departureDate: '2026-08-07' } }),
  ]);
  assert.equal(groups.length, 2);
});

test('a genuine duplicate still collapses into parent + child', () => {
  // Same person, same trip, submitted twice — this is what grouping is for.
  const groups = groupRequests([req({ id: 'a' }), req({ id: 'b' })]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].requests.length, 2);
});

test('a stored time component does not split an identical trip', () => {
  const groups = groupRequests([
    req({ id: 'a', tripDetails: { country: 'Lebanon', arrivalDate: '2026-08-01T00:00:00.000Z', departureDate: '2026-08-07T00:00:00.000Z' } }),
    req({ id: 'b', tripDetails: { country: 'Lebanon', arrivalDate: '2026-08-01', departureDate: '2026-08-07' } }),
  ]);
  assert.equal(groups.length, 1, 'ISO timestamps and plain dates are the same trip');
});

test('different travellers never share a group', () => {
  const groups = groupRequests([
    req({ id: 'a', email: 'sara@example.com' }),
    req({ id: 'b', email: 'omar@example.com' }),
  ]);
  assert.equal(groups.length, 2);
});

test('traveller matching is case-insensitive', () => {
  const groups = groupRequests([
    req({ id: 'a', email: 'Sara@Example.com' }),
    req({ id: 'b', email: 'sara@example.com' }),
  ]);
  assert.equal(groups.length, 1, 'email casing must not split a traveller');
});

test('missing trip details fall back without collapsing unrelated trips', () => {
  const groups = groupRequests([
    req({ id: 'a', tripDetails: undefined, location: 'Jordan' }),
    req({ id: 'b', tripDetails: undefined, location: 'Turkey' }),
  ]);
  assert.equal(groups.length, 2, 'the location fallback still distinguishes trips');
});

test('every group key is unique', () => {
  const groups = groupRequests([
    req({ id: 'a', tripDetails: { country: 'Lebanon', arrivalDate: '2026-08-01', departureDate: '2026-08-07' } }),
    req({ id: 'b', tripDetails: { country: 'Lebanon', arrivalDate: '2026-09-01', departureDate: '2026-09-07' } }),
    req({ id: 'c', tripDetails: { country: 'Egypt', arrivalDate: '2026-08-01', departureDate: '2026-08-07' } }),
    req({ id: 'd', email: 'omar@example.com' }),
  ]);
  const keys = groups.map((g) => g.key);
  assert.equal(new Set(keys).size, keys.length, 'duplicate keys would break React reconciliation');
  assert.equal(groups.length, 4);
});
