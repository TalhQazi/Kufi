/**
 * What counts as an "activity" on an itinerary day.
 *
 * Itinerary days hold two kinds of entry in the same `activities` array:
 *   - real activities — something the traveler does, usually backed by a catalogue
 *                       Activity and carrying a price.
 *   - schedule breaks — lunch/rest placeholders the generator inserts so the timeline
 *                       reads correctly. They are not things the traveler booked.
 *
 * Only real activities may appear in totals, statistics or "top activities".
 *
 * Classification is by system identifier, not display text:
 *   0. a link to a catalogue Activity (`activityId`) disqualifies an entry outright —
 *      something bookable is never a break, whatever it is called.
 *   1. `isBreak: true`  — the canonical marker stamped by the generator.
 *   2. `category` in BREAK_CATEGORIES.
 *   3. legacy fallback  — narrow title patterns, for rows written before the marker
 *                         existed.
 *
 * This is the browser mirror of `utils/activityClassification.js` in the backend —
 * keep the two rule sets in sync.
 */

export const BREAK_CATEGORY = 'break';

const BREAK_CATEGORIES = new Set([
  'break',
  'lunch',
  'lunch break',
  'lunchbreak',
  'meal break',
  'rest',
  'free time',
  'freetime',
]);

const LEGACY_BREAK_TITLES = [
  /^(lunch|dinner|breakfast|meal|coffee|tea)?\s*break$/i,
  /^break\s*(for\s*)?(lunch|dinner|breakfast|meal)?$/i,
  /^free\s*time$/i,
  /^rest(\s*(time|period))?$/i,
  /^at\s*leisure$/i,
  /^leisure\s*time$/i,
  /^lunch$/i,
];

const normalize = (value) => String(value ?? '').trim().toLowerCase();

/**
 * A real catalogue link, or null.
 *
 * Language models routinely emit the *string* `"null"`, and `""`/`"undefined"` occur too.
 * All of them mean "no link"; treating them as truthy let priced "Lunch Break" rows
 * escape classification and inflate activity totals.
 */
export function resolveActivityId(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw || ['null', 'undefined', 'none', 'nil', 'n/a'].includes(raw.toLowerCase())) return null;
  return raw;
}

/** True when this day entry is a schedule break rather than a real activity. */
export function isBreakEntry(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (resolveActivityId(entry.activityId)) return false;
  if (entry.isBreak === true) return true;
  if (BREAK_CATEGORIES.has(normalize(entry.category))) return true;

  const title = normalize(entry.title);
  if (!title) return false;
  return LEGACY_BREAK_TITLES.some((rx) => rx.test(title));
}

/** True when this day entry should be counted as an activity. */
export const isCountableActivity = (entry) => !isBreakEntry(entry);

/** Real activities on a single day, breaks removed. */
export function countableActivities(day) {
  const list = Array.isArray(day?.activities) ? day.activities : [];
  return list.filter(isCountableActivity);
}

/** Total number of real activities across every day of an itinerary. */
export function countActivities(days) {
  if (!Array.isArray(days)) return 0;
  return days.reduce((sum, day) => sum + countableActivities(day).length, 0);
}

/** Sum of prices for real activities only — breaks are always free. */
export function sumActivityPrices(days) {
  if (!Array.isArray(days)) return 0;
  return days.reduce(
    (sum, day) => sum + countableActivities(day).reduce((s, a) => s + (Number(a.price) || 0), 0),
    0
  );
}
