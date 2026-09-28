/**
 * Shared category matching for Explore / Country filters.
 *
 * Activity.category is a free-text string; admin Category names and legacy catalogue
 * tags (whenvisiting, memorabletour, …) do not always line up. Matching is therefore
 * tolerant: exact normalize, substring, token overlap, then legacy aliases.
 */

export function normalizeCategoryKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

/** Legacy catalogue tags → modern Explore / admin category names. */
const LEGACY_TO_MODERN = {
  foodtour: ['foodanddrink', 'food', 'dining'],
  daytour: ['families', 'family', 'daytours', 'learning'],
  summervisit: ['seasonal', 'intheair', 'summer'],
  memorabletour: ['sightseeing', 'adventure', 'wellness', 'luxury'],
  shipcurise: ['onthewater', 'cruise', 'shipcruise', 'learning', 'luxury'],
  whenvisiting: ['culture', 'entertainment', 'dates', 'heritage'],
};

/** Modern UI names → legacy tags still present on older activity rows. */
const MODERN_TO_LEGACY = {
  culture: ['whenvisiting', 'heritage', 'museum', 'historic', 'history'],
  sightseeing: ['memorabletour', 'landmark', 'landmarks', 'attraction'],
  families: ['daytour', 'family', 'kids'],
  foodanddrink: ['foodtour', 'food', 'dining', 'culinary'],
  adventure: ['memorabletour', 'outdoor', 'trek', 'hiking'],
  intheair: ['summervisit'],
  onthewater: ['shipcurise', 'cruise', 'boat'],
  entertainment: ['whenvisiting', 'show', 'nightlife'],
  seasonal: ['summervisit'],
  wellness: ['memorabletour', 'spa'],
  learning: ['daytour', 'shipcurise', 'workshop'],
  luxury: ['memorabletour', 'shipcurise'],
  dates: ['whenvisiting', 'daytour', 'romantic'],
};

function tokensOf(normalized) {
  // Recover words from a compacted key where possible by also accepting the raw string tokens.
  return String(normalized || '')
    .split(/(?=[a-z][A-Z])|[&+/]|and/)
    .map(normalizeCategoryKey)
    .filter(Boolean);
}

function expandKeysForFilter(filterName) {
  const target = normalizeCategoryKey(filterName);
  if (!target) return [];

  const keys = new Set([target]);

  const modernAliases = MODERN_TO_LEGACY[target];
  if (Array.isArray(modernAliases)) modernAliases.forEach((k) => keys.add(normalizeCategoryKey(k)));

  // If the filter itself is a legacy tag, pull modern names too.
  const modernFromLegacy = LEGACY_TO_MODERN[target];
  if (Array.isArray(modernFromLegacy)) modernFromLegacy.forEach((k) => keys.add(normalizeCategoryKey(k)));

  // Also expand any modern name that lists this filter as an alias.
  Object.entries(MODERN_TO_LEGACY).forEach(([modern, legacy]) => {
    if (legacy.some((k) => normalizeCategoryKey(k) === target)) keys.add(modern);
  });

  return [...keys];
}

/**
 * @returns {boolean}
 */
export function activityMatchesCategory(activity, filterName) {
  if (!filterName) return true;

  const target = normalizeCategoryKey(filterName);
  if (!target) return true;

  const raw = String(activity?.category || '').trim();
  const act = normalizeCategoryKey(raw);
  if (!act) return false;

  if (act === target) return true;
  if (act.includes(target) || target.includes(act)) return true;

  // Token overlap for "Food & Drink" vs "food", "Culture & Heritage" vs "culture"
  const rawTokens = String(raw)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map(normalizeCategoryKey)
    .filter((t) => t.length >= 3);
  if (rawTokens.some((t) => t === target || target.includes(t) || t.includes(target))) return true;

  const keys = expandKeysForFilter(filterName);
  if (keys.some((k) => act === k || act.includes(k) || k.includes(act))) return true;
  if (keys.some((k) => rawTokens.includes(k))) return true;

  // Legacy activity tag → modern filter
  const modernForAct = LEGACY_TO_MODERN[act];
  if (Array.isArray(modernForAct) && modernForAct.some((m) => normalizeCategoryKey(m) === target)) {
    return true;
  }

  return false;
}
