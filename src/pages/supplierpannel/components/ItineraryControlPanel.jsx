import { useEffect, useState, useRef } from "react";
import api from "../../../api";
import { toDateString, buildTripDates as buildTripDateRange, nightsBetween } from "../../../utils/calendarDate";
import { resolveLunchWindow } from "../../../utils/lunchWindow";
import { hotelIdOf } from "../../../utils/hotelStays";

/** Cost units understood by the backend (utils/tripCosts.js). Keep the two in step. */
const COST_UNITS = ["flat", "per_day", "per_person", "per_person_per_day"];
const COST_UNIT_LABELS = {
  flat: "Flat",
  per_day: "Per day",
  per_person: "Per person",
  per_person_per_day: "Per person/day",
};

// Food and transportation are quoted per head per day; a minimum charge is a flat fee.
// Saved itineraries keep whatever unit they were costed with — these are seeds only.
const DEFAULT_CUSTOM_COSTS = [
  { id: "min-charge", label: "Minimum charge", amount: 0, unit: "flat" },
  { id: "transportation", label: "Transportation", amount: 0, unit: "per_person_per_day" },
  { id: "food", label: "Food", amount: 0, unit: "per_person_per_day" },
];

/** Default budget uplift tolerance, in percent. Mirrors the Itinerary schema default. */
const DEFAULT_UPLIFT = 15;

const DEFAULT_CP = {
  activityStartTime: "09:00",
  activityEndTime: "19:00",
  // Lunch is configured as a duration; the window below is derived from it.
  lunchDurationMinutes: 60,
  lunchStart: "13:00",
  lunchEnd: "14:00",
  startOnArrival: false,
  endOnDeparture: true,
  arrivalTime: "",
  departureTime: "",
  guestsPerRoom: 2,
  hotelBaseArea: "",
  perDayOverrides: [],
  hotelId: "",
  hotelStays: [],
  numberOfRooms: 1,
  budgetUplift: DEFAULT_UPLIFT,
  budgetMode: "percent",
  budgetAmount: 0,
  customCosts: DEFAULT_CUSTOM_COSTS,
};

/**
 * Coerce the uplift field to a number in -100–100.
 *
 * `Number(value) || 15` was the bug behind "Uplift = 0 does not stick": 0 is falsy, so
 * every deliberate zero was silently replaced by the 15% default before it ever left the
 * component. Only genuinely absent/unparsable values may fall back to the default.
 *
 * Negative values are allowed: they ask for an itinerary that comes in under the
 * customer's budget rather than up to it.
 */
function normalizeUplift(value, fallback = DEFAULT_UPLIFT) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  // Legacy records stored the uplift as a fraction (0.15) rather than a percentage (15),
  // read symmetrically so -0.15 means -15%.
  const magnitude = Math.abs(num);
  const asPercent = magnitude > 0 && magnitude < 1 ? Math.round(num * 100) : num;
  return Math.min(Math.max(asPercent, -100), 100);
}

/** A fixed trip ceiling in currency. Zero means "not set" — fall back to the percentage. */
function normalizeBudgetAmount(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function seedCustomCosts(list) {
  if (Array.isArray(list) && list.length > 0) {
    return list.map((c, i) => ({
      id: c.id || `cost-${i}-${Date.now()}`,
      label: c.label || "",
      amount: Number(c.amount) || 0,
      unit: COST_UNITS.includes(c.unit) ? c.unit : "flat",
    }));
  }
  return DEFAULT_CUSTOM_COSTS.map((c) => ({ ...c }));
}

function seedHotelStays(cp) {
  if (Array.isArray(cp?.hotelStays) && cp.hotelStays.length) {
    return cp.hotelStays.map((s, i) => ({
      id: s.id || `stay-${i}`,
      hotelId: hotelIdOf(s.hotelId),
      area: s.area || "",
      nights: Math.max(0, Number(s.nights) || 0),
    }));
  }
  const legacy = hotelIdOf(cp?.hotelId);
  if (!legacy) return [];
  return [{ id: "stay-legacy", hotelId: legacy, area: cp?.hotelBaseArea || "", nights: 0 }];
}

function serializePanelStays(stays, hotels) {
  return (Array.isArray(stays) ? stays : []).map((s) => {
    const id = hotelIdOf(s.hotelId);
    const hotel = (hotels || []).find((h) => String(h._id) === String(id));
    return {
      id: s.id,
      hotelId: hotel || id || null,
      area: s.area || hotel?.city || "",
      nights: Math.max(0, Number(s.nights) || 0),
    };
  });
}

function primaryStayHotelId(stays) {
  const first = (stays || []).find((s) => hotelIdOf(s.hotelId));
  return first ? hotelIdOf(first.hotelId) : "";
}

function newCustomCost() {
  return {
    id: `cost-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    amount: 0,
    unit: "flat",
  };
}

export default function ItineraryControlPanel({ darkMode, itinerary, request, onSaved, onChange }) {
  const [cp, setCp] = useState(() => ({
    ...DEFAULT_CP,
    customCosts: seedCustomCosts([]),
  }));
  const [hotels, setHotels] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    let start = itinerary?.startDate;
    if (!start && request) start = request?.tripDetails?.arrivalDate || request?.tripDetails?.startDate || request?.arrivalDate;
    return toDateString(start) || "";
  });

  const [endDate, setEndDate] = useState(() => {
    let end = itinerary?.endDate;
    if (!end && request) end = request?.tripDetails?.departureDate || request?.tripDetails?.endDate || request?.departureDate;
    return toDateString(end) || "";
  });

  const [travelers, setTravelers] = useState(() =>
    Math.max(1, Number(itinerary?.numberOfTravelers || request?.tripDetails?.guests || request?.guests || request?.travelers || 1) || 1)
  );

  /**
   * Where to look for hotels.
   *
   * Most itineraries store only `destination` — `country` and `city` are usually empty.
   * The old derivation put `destination` into the CITY slot, so the panel asked for
   * `?city=Lebanon` and the hotel endpoint, which matches city exactly, returned nothing.
   * The dropdown looked broken when the hotels were simply filed under real city names
   * ("Beirut City", "Baalbek", …).
   *
   * `destination` is therefore treated as a country hint, and the city is only sent when
   * it is genuinely a city — i.e. it differs from the country/destination.
   */
  const country =
    itinerary?.country ||
    itinerary?.tripData?.country ||
    request?.tripDetails?.country ||
    itinerary?.destination ||
    "";

  const cityCandidate = itinerary?.city || itinerary?.tripData?.city || "";
  const city =
    cityCandidate && cityCandidate.trim().toLowerCase() !== String(country).trim().toLowerCase()
      ? cityCandidate
      : "";

  const seededForRef = useRef(null);
  // Set the moment the supplier changes anything. Their edits must never be overwritten
  // by a server payload that arrives later.
  const isDirtyRef = useRef(false);

  /**
   * Seed the panel from the itinerary's stored configuration.
   *
   * The itinerary is often still loading when this component mounts (`itinerary` is
   * null), and arrives a second or two later. Re-seeding unconditionally at that point
   * silently reverted whatever the supplier had already set — flipping "Start activities
   * on arrival day" to Yes and watching it snap back to No a moment later.
   *
   * So: seed once per itinerary record, and never over unsaved edits.
   */
  useEffect(() => {
    const recordId = itinerary?._id || itinerary?.id || null;
    if (!itinerary?.controlPanel) return;
    // Same record we already seeded from — nothing to do.
    if (seededForRef.current && seededForRef.current === recordId) return;
    // The supplier has started configuring; adopting the server copy now would discard
    // their work. Claim the record so a later re-render does not try again.
    if (isDirtyRef.current) {
      seededForRef.current = recordId;
      return;
    }

    seededForRef.current = recordId;
    setTravelers(Math.max(1, Number(itinerary.numberOfTravelers || request?.tripDetails?.guests || request?.guests || request?.travelers || 1) || 1));
    setCp({
      ...DEFAULT_CP,
      ...itinerary.controlPanel,
      budgetUplift: normalizeUplift(itinerary.controlPanel.budgetUplift),
      budgetMode: itinerary.controlPanel.budgetMode === "amount" ? "amount" : "percent",
      budgetAmount: normalizeBudgetAmount(itinerary.controlPanel.budgetAmount),
      hotelId: itinerary.controlPanel.hotelId?._id || itinerary.controlPanel.hotelId || "",
      guestsPerRoom: Number(itinerary.controlPanel.guestsPerRoom) || 2,
      arrivalTime: itinerary.controlPanel.arrivalTime || "",
      departureTime: itinerary.controlPanel.departureTime || "",
      hotelBaseArea: itinerary.controlPanel.hotelBaseArea || "",
      hotelStays: seedHotelStays(itinerary.controlPanel),
      customCosts: seedCustomCosts(itinerary.controlPanel.customCosts),
    });
  }, [itinerary?._id, itinerary?.id, itinerary?.controlPanel, itinerary?.numberOfTravelers, request]);

  // Fetch every active hotel for this country so stays can cover Cairo + Luxor + Aswan, etc.
  useEffect(() => {
    if (!country) return;
    const params = new URLSearchParams();
    params.set("country", country);
    api.get(`/hotels?${params.toString()}`)
      .then(r => setHotels(r.data || []))
      .catch(() => setHotels([]));
  }, [country]);

  const set = (key, value) => {
    isDirtyRef.current = true;
    setCp(prev => {
      const next = { ...prev, [key]: value };
      return next;
    });
  };

  const updateCustomCost = (id, field, value) => {
    isDirtyRef.current = true;
    setCp((prev) => {
      const customCosts = (prev.customCosts || []).map((c) =>
        c.id === id ? { ...c, [field]: field === "amount" ? Number(value) || 0 : value } : c
      );
      const next = { ...prev, customCosts };
      return next;
    });
  };

  const addCustomCost = () => {
    isDirtyRef.current = true;
    setCp((prev) => {
      const next = { ...prev, customCosts: [...(prev.customCosts || []), newCustomCost()] };
      return next;
    });
  };

  const removeCustomCost = (id) => {
    isDirtyRef.current = true;
    setCp((prev) => {
      const next = { ...prev, customCosts: (prev.customCosts || []).filter((c) => c.id !== id) };
      return next;
    });
  };

  // Same derivation the backend applies, so the panel previews exactly what generation
  // will produce rather than a value that has to be kept in sync by hand.
  const lunchWindow = resolveLunchWindow(cp);

  // Per-day overrides helpers
  const tripDates = buildTripDates(itinerary, startDate, endDate);

  function setOverride(date, field, value) {
    isDirtyRef.current = true;
    setCp(prev => {
      const overrides = Array.isArray(prev.perDayOverrides) ? [...prev.perDayOverrides] : [];
      const idx = overrides.findIndex(o => o.date === date);
      if (idx >= 0) {
        overrides[idx] = { ...overrides[idx], [field]: value };
      } else {
        overrides.push({ date, [field]: value });
      }
      const next = { ...prev, perDayOverrides: overrides };
      return next;
    });
  }

  function getOverride(date, field) {
    const o = (cp.perDayOverrides || []).find(o => o.date === date);
    return o?.[field] || "";
  }

  const cpRef = useRef(cp);
  const datesRef = useRef({ startDate, endDate });

  useEffect(() => {
    cpRef.current = cp;
    datesRef.current = { startDate, endDate };
  }, [cp, startDate, endDate]);

  // Single place that pushes state up.
  //
  // These updates used to also fire from inside the `setCp` updaters. Calling a parent's
  // setState from within a state updater is a side effect in what must be a pure
  // function — React StrictMode invokes updaters twice, so the parent could be updated
  // from a stale value, or mid-render. The symptom was a selection (the hotel dropdown
  // most visibly) appearing not to register until something else in the panel changed.
  useEffect(() => {
    const payload = {
      ...cp,
      budgetUplift: normalizeUplift(cp.budgetUplift),
      budgetMode: cp.budgetMode === "amount" ? "amount" : "percent",
      budgetAmount: normalizeBudgetAmount(cp.budgetAmount),
      lunchDurationMinutes: resolveLunchWindow(cp).durationMinutes,
      lunchStart: resolveLunchWindow(cp).lunchStart,
      lunchEnd: resolveLunchWindow(cp).lunchEnd,
      hotelStays: serializePanelStays(cp.hotelStays, hotels),
      hotelId: primaryStayHotelId(cp.hotelStays) || cp.hotelId || null,
      hotelBaseArea: (cp.hotelStays || []).find((s) => hotelIdOf(s.hotelId))?.area || cp.hotelBaseArea || "",
      startDate: startDate || null,
      endDate: endDate || null,
      customCosts: Array.isArray(cp.customCosts) ? cp.customCosts : [],
      numberOfTravelers: travelers,
    };
    const selectedHotel = hotels.find((h) => String(h._id) === String(primaryStayHotelId(cp.hotelStays) || cp.hotelId)) || null;
    onChange?.(payload, selectedHotel);
  }, [cp, startDate, endDate, hotels, travelers, onChange]);

  const handleStartDateChange = (val) => {
    isDirtyRef.current = true;
    setStartDate(val);
    const payload = {
      ...cp,
      budgetUplift: normalizeUplift(cp.budgetUplift),
      budgetMode: cp.budgetMode === "amount" ? "amount" : "percent",
      budgetAmount: normalizeBudgetAmount(cp.budgetAmount),
      lunchDurationMinutes: resolveLunchWindow(cp).durationMinutes,
      lunchStart: resolveLunchWindow(cp).lunchStart,
      lunchEnd: resolveLunchWindow(cp).lunchEnd,
      hotelStays: serializePanelStays(cp.hotelStays, hotels),
      hotelId: primaryStayHotelId(cp.hotelStays) || cp.hotelId || null,
      hotelBaseArea: (cp.hotelStays || []).find((s) => hotelIdOf(s.hotelId))?.area || cp.hotelBaseArea || "",
      startDate: val || null,
      endDate: endDate || null,
      customCosts: Array.isArray(cp.customCosts) ? cp.customCosts : [],
      numberOfTravelers: travelers,
    };
    const selectedHotel = hotels.find((h) => String(h._id) === String(primaryStayHotelId(cp.hotelStays) || cp.hotelId)) || null;
    onChange?.(payload, selectedHotel);
  };

  const handleEndDateChange = (val) => {
    isDirtyRef.current = true;
    setEndDate(val);
    const payload = {
      ...cp,
      budgetUplift: normalizeUplift(cp.budgetUplift),
      budgetMode: cp.budgetMode === "amount" ? "amount" : "percent",
      budgetAmount: normalizeBudgetAmount(cp.budgetAmount),
      lunchDurationMinutes: resolveLunchWindow(cp).durationMinutes,
      lunchStart: resolveLunchWindow(cp).lunchStart,
      lunchEnd: resolveLunchWindow(cp).lunchEnd,
      hotelStays: serializePanelStays(cp.hotelStays, hotels),
      hotelId: primaryStayHotelId(cp.hotelStays) || cp.hotelId || null,
      hotelBaseArea: (cp.hotelStays || []).find((s) => hotelIdOf(s.hotelId))?.area || cp.hotelBaseArea || "",
      startDate: startDate || null,
      endDate: val || null,
      customCosts: Array.isArray(cp.customCosts) ? cp.customCosts : [],
      numberOfTravelers: travelers,
    };
    const selectedHotel = hotels.find((h) => String(h._id) === String(primaryStayHotelId(cp.hotelStays) || cp.hotelId)) || null;
    onChange?.(payload, selectedHotel);
  };

  const namedCost = (id, label) =>
    (cp.customCosts || []).find((c) => c.id === id || String(c.label || "").toLowerCase() === label.toLowerCase());

  // `unit` is the default for a row that does not exist yet. An existing row keeps the
  // unit it already carries, so editing the amount never re-prices the line.
  const setNamedCost = (id, label, unit, amount) => {
    isDirtyRef.current = true;
    setCp((prev) => {
      const costs = [...(prev.customCosts || [])];
      const idx = costs.findIndex((c) => c.id === id || String(c.label || "").toLowerCase() === label.toLowerCase());
      const keptUnit = idx >= 0 && COST_UNITS.includes(costs[idx]?.unit) ? costs[idx].unit : unit;
      const next = { id, label, amount: Math.max(0, Number(amount) || 0), unit: keptUnit };
      if (idx >= 0) costs[idx] = { ...costs[idx], ...next };
      else costs.push(next);
      return { ...prev, customCosts: costs };
    });
  };

  const PRESET_COST_KEYS = new Set(["min-charge", "transportation", "food", "minimum charge"]);
  const extraCosts = (cp.customCosts || []).filter((c) => {
    const key = String(c.id || "").toLowerCase();
    const label = String(c.label || "").toLowerCase();
    return !PRESET_COST_KEYS.has(key) && !PRESET_COST_KEYS.has(label);
  });

  const isAmountBudget = cp.budgetMode === "amount";
  const upliftPct = normalizeUplift(cp.budgetUplift);
  const budgetAmount = normalizeBudgetAmount(cp.budgetAmount);
  // A fixed budget of 0 is "not set yet", so say so rather than implying a $0 trip.
  const budgetHint = isAmountBudget
    ? (budgetAmount > 0
        ? `Fixed budget: the itinerary is built to a total of $${budgetAmount.toLocaleString()}, ignoring the customer’s stated budget.`
        : "Enter a fixed trip total, or switch back to % to adjust the customer’s budget.")
    : upliftPct === 0
      ? "0% tolerance: itinerary total stays within the customer’s budget."
      : upliftPct > 0
        ? `+${upliftPct}% tolerance: itinerary total can go up to the customer’s budget plus this uplift.`
        : `${upliftPct}%: itinerary total is held ${Math.abs(upliftPct)}% below the customer’s budget.`;

  const hotelAreas = Array.from(new Set((hotels || []).map((h) => h.city).filter(Boolean)));
  const tripNights = nightsBetween(startDate, endDate);
  const stays = Array.isArray(cp.hotelStays) ? cp.hotelStays : [];
  const selectedHotel = hotels.find((h) => String(h._id) === String(primaryStayHotelId(stays) || cp.hotelId));
  const hotelLat = selectedHotel?.latitude ?? selectedHotel?.coordinates?.lat;
  const hotelLng = selectedHotel?.longitude ?? selectedHotel?.coordinates?.lng;

  const updateStays = (nextStays) => {
    isDirtyRef.current = true;
    const first = (nextStays || []).find((s) => s.hotelId);
    setCp((prev) => ({
      ...prev,
      hotelStays: nextStays,
      hotelId: first?.hotelId || "",
      hotelBaseArea: first?.area || prev.hotelBaseArea || "",
    }));
  };

  const addStay = () => {
    const used = stays.reduce((sum, x) => sum + (Number(x.nights) || 0), 0);
    updateStays([
      ...stays,
      { id: `stay-${Date.now()}`, area: hotelAreas[0] || city || "", hotelId: "", nights: Math.max(1, tripNights - used) },
    ]);
  };

  const patchStay = (id, patch) => {
    updateStays(stays.map((s) => {
      if (s.id !== id) return s;
      const next = { ...s, ...patch };
      if (patch.hotelId) {
        const hotel = hotels.find((h) => String(h._id) === String(patch.hotelId));
        if (hotel && !patch.area) next.area = hotel.city || s.area;
      }
      if (patch.area && !patch.hotelId) {
        const stillValid = hotels.some((h) =>
          String(h._id) === String(s.hotelId)
          && String(h.city || "").toLowerCase() === String(patch.area).toLowerCase()
        );
        if (!stillValid) next.hotelId = "";
      }
      return next;
    }));
  };

  const removeStay = (id) => updateStays(stays.filter((s) => s.id !== id));
  const budgetDisplay = itinerary?.budget ?? request?.tripDetails?.budget ?? request?.amount ?? "";

  const setTravelersAndRooms = (raw) => {
    const next = Math.max(1, Number(raw) || 1);
    isDirtyRef.current = true;
    setTravelers(next);
    const guests = Math.max(1, Number(cp.guestsPerRoom) || 2);
    setCp((prev) => ({ ...prev, numberOfRooms: Math.max(1, Math.ceil(next / guests)) }));
  };

  const base = darkMode
    ? "bg-slate-900 border-slate-800 text-slate-300"
    : "bg-white border-[#ddd2c5] text-gray-700";
  const inputCls = `w-full rounded-[10px] border px-2.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#b8860b]/30 focus:border-[#b8860b] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-[#faf8f5] border-[#ddd2c5] text-slate-800"}`;
  const labelCls = `text-[10px] font-semibold uppercase tracking-wide ${darkMode ? "text-slate-400" : "text-[#6b5b49]"}`;
  // Same chrome as inputCls but WITHOUT `w-full`, so a narrow unit picker can sit beside
  // an input. Appending a width to inputCls does not work — Tailwind emits `.w-full`
  // after the numeric widths, so `w-full` always wins the cascade.
  const unitSelectCls = `rounded-[10px] border px-1 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#b8860b]/30 focus:border-[#b8860b] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-[#faf8f5] border-[#ddd2c5] text-slate-800"}`;

  return (
    <div className={`rounded-2xl border text-xs px-4 py-4 ${base}`}>
      <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-[#4a3520]"}`}>
        Control Panel
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-3">
        <Field label="Travelers" className={labelCls}>
          <input type="number" min={1} value={travelers} onChange={(e) => setTravelersAndRooms(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Arrival Date" className={labelCls}>
          <input type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Departure Date" className={labelCls}>
          <input type="date" value={endDate} onChange={(e) => handleEndDateChange(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Activity Start" className={labelCls}>
          <input type="time" value={cp.activityStartTime} onChange={(e) => set("activityStartTime", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Activity End" className={labelCls}>
          <input type="time" value={cp.activityEndTime} onChange={(e) => set("activityEndTime", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Arrival Time (optional)" className={labelCls}>
          <input type="time" value={cp.arrivalTime || ""} onChange={(e) => set("arrivalTime", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Activities on Arrival Day?" className={labelCls}>
          <select value={cp.startOnArrival ? "yes" : "no"} onChange={(e) => set("startOnArrival", e.target.value === "yes")} className={inputCls}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </Field>
        <Field label="Departure Time (optional)" className={labelCls}>
          <input type="time" value={cp.departureTime || ""} onChange={(e) => set("departureTime", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Activities on Departure Day?" className={labelCls}>
          <select value={cp.endOnDeparture !== false ? "yes" : "no"} onChange={(e) => set("endOnDeparture", e.target.value === "yes")} className={inputCls}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>
        <div className="col-span-full space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className={labelCls}>Hotels{country ? ` — ${country}` : ""}</span>
            <button
              type="button"
              onClick={addStay}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-[#ddd2c5] text-[#6b5b49] hover:bg-[#faf8f5]"}`}
            >
              + Add hotel
            </button>
          </div>
          {stays.length === 0 && (
            <p className={`text-[10px] ${darkMode ? "text-slate-500" : "text-[#8a7a66]"}`}>
              Add one hotel per area for this country (for example Cairo, then Luxor). The first hotel is the trip base for travel times.
            </p>
          )}
          {stays.map((stay) => {
            const areaHotels = stay.area
              ? hotels.filter((h) => String(h.city || "").toLowerCase() === String(stay.area).toLowerCase())
              : hotels;
            const stayHotel = hotels.find((h) => String(h._id) === String(stay.hotelId));
            return (
              <div key={stay.id} className={`grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl border p-2 ${darkMode ? "border-slate-700 bg-slate-800/40" : "border-[#ddd2c5] bg-[#faf8f5]"}`}>
                <Field label="Area" className={labelCls}>
                  <select value={stay.area || ""} onChange={(e) => patchStay(stay.id, { area: e.target.value })} className={inputCls}>
                    <option value="">All areas</option>
                    {hotelAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Hotel" className={labelCls}>
                  <select value={stay.hotelId || ""} onChange={(e) => patchStay(stay.id, { hotelId: e.target.value })} className={inputCls}>
                    <option value="">Select hotel</option>
                    {areaHotels.map((h) => (
                      <option key={h._id} value={h._id}>{h.name} — ${h.pricePerNight}/night</option>
                    ))}
                  </select>
                </Field>
                <Field label="Nights" className={labelCls}>
                  <input type="number" min={0} value={stay.nights} onChange={(e) => patchStay(stay.id, { nights: Math.max(0, Number(e.target.value) || 0) })} className={inputCls} />
                </Field>
                <div className="flex items-end gap-2">
                  <Field label="$/room/night" className={labelCls}>
                    <input type="number" readOnly value={stayHotel?.pricePerNight ?? ""} className={inputCls} />
                  </Field>
                  <button
                    type="button"
                    onClick={() => removeStay(stay.id)}
                    className={`mb-0.5 shrink-0 text-[10px] px-2 py-2 rounded-lg ${darkMode ? "text-rose-400 hover:bg-slate-700" : "text-rose-500 hover:bg-rose-50"}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <Field label="Guests per Room" className={labelCls}>
          <input
            type="number"
            min={1}
            value={cp.guestsPerRoom || 2}
            onChange={(e) => {
              const guests = Math.max(1, Number(e.target.value) || 2);
              isDirtyRef.current = true;
              setCp((prev) => ({
                ...prev,
                guestsPerRoom: guests,
                numberOfRooms: Math.max(1, Math.ceil(travelers / guests)),
              }));
            }}
            className={inputCls}
          />
        </Field>
        <Field label="Number of Rooms" className={labelCls}>
          <input type="number" min={1} value={cp.numberOfRooms} onChange={(e) => set("numberOfRooms", Number(e.target.value))} className={inputCls} />
        </Field>
        <Field label="Hotel Latitude" className={labelCls}>
          <input type="number" readOnly value={hotelLat != null ? Number(hotelLat) : ""} step="0.0001" className={inputCls} />
        </Field>
        <Field label="Hotel Longitude" className={labelCls}>
          <input type="number" readOnly value={hotelLng != null ? Number(hotelLng) : ""} step="0.0001" className={inputCls} />
        </Field>
        <Field label="Lunch (hrs)" className={labelCls}>
          <input
            type="number"
            min={0}
            step={0.5}
            value={Number((lunchWindow.durationMinutes / 60).toFixed(1))}
            onChange={(e) => set("lunchDurationMinutes", Math.max(0, Math.round((Number(e.target.value) || 0) * 60)))}
            className={inputCls}
          />
        </Field>
        <Field label="Local Transport ($/person/day)" className={labelCls}>
          <input
            type="number"
            min={0}
            step={1}
            value={namedCost("transportation", "Transportation")?.amount ?? 0}
            onChange={(e) => setNamedCost("transportation", "Transportation", "per_person_per_day", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Food ($/person/day)" className={labelCls}>
          <input
            type="number"
            min={0}
            step={1}
            value={namedCost("food", "Food")?.amount ?? 0}
            onChange={(e) => setNamedCost("food", "Food", "per_person_per_day", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Budget ($)" className={labelCls}>
          <input type="text" readOnly value={budgetDisplay} className={inputCls} />
        </Field>
        <Field label="Min. Charge ($)" className={labelCls}>
          <input
            type="number"
            min={0}
            step={5}
            value={namedCost("min-charge", "Minimum charge")?.amount ?? 0}
            onChange={(e) => setNamedCost("min-charge", "Minimum charge", "flat", e.target.value)}
            className={inputCls}
          />
        </Field>
        {/* One control, two modes. In % it adjusts the customer's budget (negative
            builds under it); in $ it sets a fixed trip ceiling outright. The two values
            are stored separately so switching modes never discards the other. */}
        <Field label={isAmountBudget ? "Custom Budget $" : "Budget Tolerance %"} className={labelCls}>
          <div className="flex gap-1">
            {isAmountBudget ? (
              <input
                type="number"
                min={0}
                step={50}
                value={cp.budgetAmount ?? 0}
                onChange={(e) => {
                  const raw = e.target.value;
                  set("budgetAmount", raw === "" ? "" : normalizeBudgetAmount(raw));
                }}
                onBlur={(e) => set("budgetAmount", normalizeBudgetAmount(e.target.value))}
                placeholder="e.g. 3500"
                className={`${inputCls} flex-1 min-w-0`}
              />
            ) : (
              <input
                type="number"
                min={-100}
                max={100}
                step={5}
                value={cp.budgetUplift}
                onChange={(e) => {
                  const raw = e.target.value;
                  set("budgetUplift", raw === "" || raw === "-" ? raw : normalizeUplift(raw));
                }}
                onBlur={(e) => set("budgetUplift", normalizeUplift(e.target.value))}
                className={`${inputCls} flex-1 min-w-0`}
              />
            )}
            <select
              value={isAmountBudget ? "amount" : "percent"}
              onChange={(e) => set("budgetMode", e.target.value === "amount" ? "amount" : "percent")}
              aria-label="Budget adjustment mode"
              className={`${unitSelectCls} w-[3.25rem] shrink-0`}
            >
              <option value="percent">%</option>
              <option value="amount">$</option>
            </select>
          </div>
        </Field>
      </div>

      <p className={`text-[10px] mt-3 ${darkMode ? "text-slate-500" : "text-[#8a7a66]"}`}>
        {budgetHint}
        {lunchWindow.durationMinutes > 0 ? ` Lunch ${lunchWindow.lunchStart}–${lunchWindow.lunchEnd}.` : ""}
      </p>

      {tripDates.length > 0 && (
        <details className="mt-3">
          <summary className={`cursor-pointer text-[10px] ${darkMode ? "text-slate-500" : "text-[#8a7a66]"}`}>
            Override activity hours per day
          </summary>
          <div className="mt-2 space-y-1.5">
            {tripDates.map((date) => (
              <div key={date} className="grid grid-cols-[6.5rem_1fr_1fr] gap-2 items-center">
                <span className={darkMode ? "text-slate-400" : "text-gray-500"}>{date}</span>
                <input type="time" value={getOverride(date, "startTime")} onChange={(e) => setOverride(date, "startTime", e.target.value)} className={inputCls} />
                <input type="time" value={getOverride(date, "endTime")} onChange={(e) => setOverride(date, "endTime", e.target.value)} className={inputCls} />
              </div>
            ))}
          </div>
        </details>
      )}

      <div className={`mt-4 pt-3 border-t ${darkMode ? "border-slate-700" : "border-[#f0eae2]"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={labelCls}>Extra custom costs</span>
          <button
            type="button"
            onClick={addCustomCost}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-[#ddd2c5] text-[#6b5b49] hover:bg-[#faf8f5]"
            }`}
          >
            + Add Cost
          </button>
        </div>
        <div className="space-y-2">
          {extraCosts.map((cost) => (
            <div
              key={cost.id}
              className={`rounded-lg border p-2 space-y-2 ${darkMode ? "border-slate-700 bg-slate-900/40" : "border-[#ddd2c5] bg-[#faf8f5]"}`}
            >
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  type="text"
                  value={cost.label}
                  onChange={(e) => updateCustomCost(cost.id, "label", e.target.value)}
                  placeholder="Label"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeCustomCost(cost.id)}
                  className={`px-2 rounded-lg text-[10px] font-medium ${darkMode ? "text-rose-400 hover:bg-slate-800" : "text-rose-500 hover:bg-rose-50"}`}
                  aria-label={`Remove ${cost.label || "cost"}`}
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={cost.amount}
                  onChange={(e) => updateCustomCost(cost.id, "amount", e.target.value)}
                  placeholder="Amount"
                  className={inputCls}
                />
                <select
                  value={cost.unit}
                  onChange={(e) => updateCustomCost(cost.id, "unit", e.target.value)}
                  className={inputCls}
                >
                  {COST_UNITS.map((u) => (
                    <option key={u} value={u}>{COST_UNIT_LABELS[u]}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, className, children }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className={className}>{label}</label>
      {children}
    </div>
  );
}

function buildTripDates(itinerary, localStart, localEnd) {
  const start = localStart || itinerary?.startDate;
  const end = localEnd || itinerary?.endDate;
  return buildTripDateRange(start, end);
}
