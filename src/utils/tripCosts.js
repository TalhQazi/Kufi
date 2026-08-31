/**
 * Trip cost model — the browser half of the backend's `utils/tripCosts.js`.
 *
 * The supplier sees a running total while they edit, before anything is sent for
 * generation, so the same arithmetic has to exist on both sides. Keep the two files in
 * step: a mismatch shows up as a quote that changes the moment you press Generate.
 */

export const COST_UNITS = ["flat", "per_day", "per_person", "per_person_per_day"];

export const COST_UNIT_LABELS = {
  flat: "Flat",
  per_day: "Per day",
  per_person: "Per person",
  per_person_per_day: "Per person / day",
};

const EXPAND = {
  flat: (amount) => amount,
  per_day: (amount, days) => amount * days,
  per_person: (amount, days, travellers) => amount * travellers,
  per_person_per_day: (amount, days, travellers) => amount * days * travellers,
};

const SUFFIX = {
  flat: () => "",
  per_day: (amount, days) => ` ($${amount}/day × ${days})`,
  per_person: (amount, days, travellers) => ` ($${amount}/person × ${travellers})`,
  per_person_per_day: (amount, days, travellers) =>
    ` ($${amount}/person/day × ${days} × ${travellers})`,
};

export function normalizeCostUnit(value) {
  const unit = String(value || "").trim();
  return COST_UNITS.includes(unit) ? unit : "flat";
}

function positiveInt(value, fallback = 1) {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Display lines with the arithmetic spelled out, e.g. "Food ($20/person/day × 7 × 4)". */
export function customCostLines(list, { tripDays = 1, travellers = 1 } = {}) {
  const days = positiveInt(tripDays);
  const people = positiveInt(travellers);
  return (Array.isArray(list) ? list : [])
    .map((c) => {
      const amount = Number(c?.amount) || 0;
      if (!amount) return null;
      const unit = normalizeCostUnit(c?.unit);
      return {
        id: c?.id || c?.label || unit,
        label: `${c?.label || "Custom cost"}${SUFFIX[unit](amount, days, people)}`,
        unit,
        amount,
        total: EXPAND[unit](amount, days, people),
      };
    })
    .filter(Boolean);
}

export function customCostsTotal(list, options = {}) {
  return customCostLines(list, options).reduce((sum, c) => sum + c.total, 0);
}

/** Catalogue prices are per head; this is what the party pays. */
export function partyActivityCost(perPersonSpend, travellers = 1) {
  return (Number(perPersonSpend) || 0) * positiveInt(travellers);
}

/** One traveller's share of a party-wide activity ceiling. */
export function perTravellerCeiling(partyCeiling, travellers = 1) {
  const ceiling = Number(partyCeiling) || 0;
  if (ceiling <= 0) return 0;
  return Math.floor(ceiling / positiveInt(travellers));
}
