/**
 * A tiny module-scoped cache for list pages.
 *
 * The app is a single-page app with its own history stack, so navigating
 * "listing → detail → back" unmounts the listing and remounts it. Every mount refired
 * the same request, which is why returning to the blog listing felt slow: the browser
 * re-downloaded and re-decoded the whole payload before anything rendered.
 *
 * This keeps the last successful response (plus scroll position) in memory for a short
 * TTL, so going back paints immediately from cache and then quietly revalidates.
 *
 * Deliberately not a full data layer — the project has no React Query/SWR dependency and
 * adding one is out of proportion to the problem.
 */

const store = new Map();

/** How long a cached list stays fresh enough to render without a blocking fetch. */
export const DEFAULT_TTL_MS = 5 * 60 * 1000;

export function readCache(key, ttlMs = DEFAULT_TTL_MS) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.storedAt > ttlMs) {
    store.delete(key);
    return null;
  }
  return entry;
}

export function writeCache(key, data, extra = {}) {
  store.set(key, { data, storedAt: Date.now(), scrollY: 0, ...extra });
  return store.get(key);
}

/** Remember where the user was, so Back restores the same view rather than the top. */
export function rememberScroll(key, scrollY) {
  const entry = store.get(key);
  if (entry) entry.scrollY = scrollY;
}

/** Drop a cached list after a mutation that would make it stale. */
export function invalidateCache(keyPrefix) {
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) store.delete(key);
  }
}

export function clearAllCaches() {
  store.clear();
}
