import { useEffect, useState, useRef } from "react";
import api from "../../../api";
import { toDateString, buildTripDates as buildTripDateRange } from "../../../utils/calendarDate";
import { resolveLunchWindow } from "../../../utils/lunchWindow";

const DEFAULT_CUSTOM_COSTS = [
  { id: "min-charge", label: "Minimum charge", amount: 0, unit: "flat" },
  { id: "transportation", label: "Transportation", amount: 0, unit: "per_day" },
  { id: "food", label: "Food", amount: 0, unit: "per_day" },
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
  perDayOverrides: [],
  hotelId: "",
  numberOfRooms: 1,
  budgetUplift: DEFAULT_UPLIFT,
  customCosts: DEFAULT_CUSTOM_COSTS,
};

/**
 * Coerce the uplift field to a number in 0–100.
 *
 * `Number(value) || 15` was the bug behind "Uplift = 0 does not stick": 0 is falsy, so
 * every deliberate zero was silently replaced by the 15% default before it ever left the
 * component. Only genuinely absent/unparsable values may fall back to the default.
 */
function normalizeUplift(value, fallback = DEFAULT_UPLIFT) {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  // Legacy records stored the uplift as a fraction (0.15) rather than a percentage (15).
  const asPercent = num > 0 && num < 1 ? Math.round(num * 100) : num;
  return Math.min(Math.max(asPercent, 0), 100);
}

function seedCustomCosts(list) {
  if (Array.isArray(list) && list.length > 0) {
    return list.map((c, i) => ({
      id: c.id || `cost-${i}-${Date.now()}`,
      label: c.label || "",
      amount: Number(c.amount) || 0,
      unit: c.unit === "per_day" ? "per_day" : "flat",
    }));
  }
  return DEFAULT_CUSTOM_COSTS.map((c) => ({ ...c }));
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
    setCp({
      ...DEFAULT_CP,
      ...itinerary.controlPanel,
      budgetUplift: normalizeUplift(itinerary.controlPanel.budgetUplift),
      hotelId: itinerary.controlPanel.hotelId?._id || itinerary.controlPanel.hotelId || "",
      customCosts: seedCustomCosts(itinerary.controlPanel.customCosts),
    });
  }, [itinerary?._id, itinerary?.id, itinerary?.controlPanel]);

  // Fetch hotels for country/city
  useEffect(() => {
    if (!country && !city) return;
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    api.get(`/hotels?${params.toString()}`)
      .then(r => setHotels(r.data || []))
      .catch(() => setHotels([]));
  }, [country, city]);

  const set = (key, value) => {
    isDirtyRef.current = true;
    setCp(prev => {
      const next = { ...prev, [key]: value };
      const selectedHotel = hotels.find(h => h._id === next.hotelId) || null;
      onChange?.(next, selectedHotel);
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
      const selectedHotel = hotels.find((h) => h._id === next.hotelId) || null;
      onChange?.(next, selectedHotel);
      return next;
    });
  };

  const addCustomCost = () => {
    isDirtyRef.current = true;
    setCp((prev) => {
      const next = { ...prev, customCosts: [...(prev.customCosts || []), newCustomCost()] };
      const selectedHotel = hotels.find((h) => h._id === next.hotelId) || null;
      onChange?.(next, selectedHotel);
      return next;
    });
  };

  const removeCustomCost = (id) => {
    isDirtyRef.current = true;
    setCp((prev) => {
      const next = { ...prev, customCosts: (prev.customCosts || []).filter((c) => c.id !== id) };
      const selectedHotel = hotels.find((h) => h._id === next.hotelId) || null;
      onChange?.(next, selectedHotel);
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
      const selectedHotel = hotels.find(h => h._id === next.hotelId) || null;
      onChange?.(next, selectedHotel);
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

  // Pass changes to parent component without saving to backend yet
  useEffect(() => {
    const payload = {
      ...cp,
      budgetUplift: normalizeUplift(cp.budgetUplift),
      lunchDurationMinutes: resolveLunchWindow(cp).durationMinutes,
      lunchStart: resolveLunchWindow(cp).lunchStart,
      lunchEnd: resolveLunchWindow(cp).lunchEnd,
      hotelId: cp.hotelId || null,
      startDate: startDate || null,
      endDate: endDate || null,
      customCosts: Array.isArray(cp.customCosts) ? cp.customCosts : [],
    };
    const selectedHotel = hotels.find(h => h._id === cp.hotelId) || null;
    onChange?.(payload, selectedHotel);
  }, [cp, startDate, endDate, hotels, onChange]);

  const handleStartDateChange = (val) => {
    isDirtyRef.current = true;
    setStartDate(val);
    const payload = {
      ...cp,
      budgetUplift: normalizeUplift(cp.budgetUplift),
      lunchDurationMinutes: resolveLunchWindow(cp).durationMinutes,
      lunchStart: resolveLunchWindow(cp).lunchStart,
      lunchEnd: resolveLunchWindow(cp).lunchEnd,
      hotelId: cp.hotelId || null,
      startDate: val || null,
      endDate: endDate || null,
      customCosts: Array.isArray(cp.customCosts) ? cp.customCosts : [],
    };
    const selectedHotel = hotels.find(h => h._id === cp.hotelId) || null;
    onChange?.(payload, selectedHotel);
  };

  const handleEndDateChange = (val) => {
    isDirtyRef.current = true;
    setEndDate(val);
    const payload = {
      ...cp,
      budgetUplift: normalizeUplift(cp.budgetUplift),
      lunchDurationMinutes: resolveLunchWindow(cp).durationMinutes,
      lunchStart: resolveLunchWindow(cp).lunchStart,
      lunchEnd: resolveLunchWindow(cp).lunchEnd,
      hotelId: cp.hotelId || null,
      startDate: startDate || null,
      endDate: val || null,
      customCosts: Array.isArray(cp.customCosts) ? cp.customCosts : [],
    };
    const selectedHotel = hotels.find(h => h._id === cp.hotelId) || null;
    onChange?.(payload, selectedHotel);
  };

  const addPresetCost = (label, unit, defaultAmount = 0) => {
    isDirtyRef.current = true;
    setCp((prev) => {
      const existing = (prev.customCosts || []).find(c => c.label.toLowerCase() === label.toLowerCase());
      if (existing) return prev;
      const newCost = {
        id: `cost-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label,
        amount: defaultAmount,
        unit: unit === "per_day" ? "per_day" : "flat",
      };
      const next = { ...prev, customCosts: [...(prev.customCosts || []), newCost] };
      const selectedHotel = hotels.find((h) => h._id === next.hotelId) || null;
      onChange?.(next, selectedHotel);
      return next;
    });
  };

  const base = darkMode
    ? "bg-slate-900 border-slate-800 text-slate-300"
    : "bg-white border-gray-200 text-gray-700";
  const inputCls = `w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`;
  const labelCls = `text-[11px] font-medium mb-0.5 block ${darkMode ? "text-slate-400" : "text-gray-500"}`;
  const sectionCls = `rounded-xl border px-4 py-3 space-y-3 ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-gray-50 border-gray-100"}`;

  return (
    <div className={`rounded-2xl border text-xs space-y-4 px-4 py-4 ${base}`}>
      <h3 className={`text-sm font-semibold flex items-center justify-between ${darkMode ? "text-white" : "text-slate-900"}`}>
        <span>Control Panel</span>
      </h3>

      {/* Dates (Editable) */}
      <div className={sectionCls}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-[11px] font-medium ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Arrival Date</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={e => handleStartDateChange(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-[11px] font-medium ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Departure Date</span>
            </div>
            <input
              type="date"
              value={endDate}
              onChange={e => handleEndDateChange(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Arrival / Departure toggles */}
      <div className={sectionCls}>
        <Toggle
          label="Start activities on arrival day"
          value={cp.startOnArrival}
          onChange={v => set("startOnArrival", v)}
          darkMode={darkMode}
        />
        <Toggle
          label="End activities on departure day"
          value={cp.endOnDeparture}
          onChange={v => set("endOnDeparture", v)}
          darkMode={darkMode}
        />
      </div>

      {/* Activity start time */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <span className={labelCls}>Activity Start Time</span>
          <span className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>All Days default</span>
        </div>
        <input type="time" value={cp.activityStartTime} onChange={e => set("activityStartTime", e.target.value)} className={inputCls} />
        {tripDates.length > 0 && (
          <details>
            <summary className={`cursor-pointer text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              Override per day
            </summary>
            <div className="mt-2 space-y-1.5">
              {tripDates.map(date => (
                <div key={date} className="flex items-center gap-2">
                  <span className={`w-24 shrink-0 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{date}</span>
                  <input type="time" value={getOverride(date, "startTime")} onChange={e => setOverride(date, "startTime", e.target.value)} className={inputCls} />
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Activity end time */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <span className={labelCls}>Activity End Time</span>
          <span className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>All Days default</span>
        </div>
        <input type="time" value={cp.activityEndTime} onChange={e => set("activityEndTime", e.target.value)} className={inputCls} />
        {tripDates.length > 0 && (
          <details>
            <summary className={`cursor-pointer text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              Override per day
            </summary>
            <div className="mt-2 space-y-1.5">
              {tripDates.map(date => (
                <div key={date} className="flex items-center gap-2">
                  <span className={`w-24 shrink-0 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{date}</span>
                  <input type="time" value={getOverride(date, "endTime")} onChange={e => setOverride(date, "endTime", e.target.value)} className={inputCls} />
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Lunch break — duration only, applied to every day */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-1">
          <span className={labelCls}>Lunch Break</span>
          <span className={`text-[10px] font-medium ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
            {lunchWindow.lunchStart} – {lunchWindow.lunchEnd}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-600"} w-20 shrink-0`}>Duration</span>
          <div className="flex items-center gap-1 flex-1">
            <button
              type="button"
              onClick={() => set("lunchDurationMinutes", Math.max(0, lunchWindow.durationMinutes - 15))}
              className={`w-8 h-8 rounded border flex items-center justify-center font-bold text-base transition-colors ${
                darkMode ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-amber-600 hover:text-white" : "bg-gray-100 border-gray-300 text-slate-800 hover:bg-amber-500 hover:text-white"
              }`}
              title="Decrease lunch duration by 15 mins"
            >
              -
            </button>

            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                step="15"
                value={lunchWindow.durationMinutes}
                onChange={e => set("lunchDurationMinutes", Math.max(0, Number(e.target.value) || 0))}
                className={`${inputCls} text-center font-semibold pr-7`}
              />
              <span className="absolute right-2 top-1.5 text-[10px] text-gray-400 pointer-events-none">min</span>
            </div>

            <button
              type="button"
              onClick={() => set("lunchDurationMinutes", lunchWindow.durationMinutes + 15)}
              className={`w-8 h-8 rounded border flex items-center justify-center font-bold text-base transition-colors ${
                darkMode ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-amber-600 hover:text-white" : "bg-gray-100 border-gray-300 text-slate-800 hover:bg-amber-500 hover:text-white"
              }`}
              title="Increase lunch duration by 15 mins"
            >
              +
            </button>
          </div>
        </div>

        <p className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
          {lunchWindow.durationMinutes === 0
            ? "No lunch break — activities run straight through the day."
            : `Applied to every day. The break is centred in the activity window (${cp.activityStartTime || "09:00"}–${cp.activityEndTime || "19:00"}), so it moves with your start and end times.`}
        </p>
      </div>

      {/* Hotel */}
      <div className={sectionCls}>
        <span className={labelCls}>Hotel</span>
        <select value={cp.hotelId} onChange={e => set("hotelId", e.target.value)} className={inputCls}>
          <option value="">No Hotel</option>
          {hotels.map(h => (
            <option key={h._id} value={h._id}>
              {h.name} — ${h.pricePerNight}/night
            </option>
          ))}
        </select>
        {cp.hotelId && (
          <div className="mt-2">
            <span className={labelCls}>Number of Rooms</span>
            <input
              type="number"
              min={1}
              value={cp.numberOfRooms}
              onChange={e => set("numberOfRooms", Number(e.target.value))}
              className={inputCls}
            />
          </div>
        )}
      </div>

      {/* Budget Uplift Tolerance */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <span className={labelCls}>Budget Uplift Tolerance %</span>
          <span className={`text-[10px] ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            Tolerance allowance above base budget
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={100}
            value={cp.budgetUplift}
            onChange={e => {
              // Keep an empty field editable rather than snapping it back to a number,
              // but never let `NaN` reach the payload.
              const raw = e.target.value;
              set("budgetUplift", raw === "" ? "" : normalizeUplift(raw));
            }}
            onBlur={e => set("budgetUplift", normalizeUplift(e.target.value))}
            className={`${inputCls} w-24`}
          />
          <span className={darkMode ? "text-slate-400" : "text-gray-500"}>%</span>
        </div>
        <p className={`text-[10px] mt-1 ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
          {normalizeUplift(cp.budgetUplift) === 0
            ? "No tolerance: activity selections must stay within the customer's base budget."
            : `Allows system activity selections to go up to +${normalizeUplift(cp.budgetUplift)}% over customer budget as flexibility tolerance (e.g. $1,000 budget allows up to $${(1000 * (1 + normalizeUplift(cp.budgetUplift) / 100)).toLocaleString()} total).`}
        </p>
      </div>

      {/* Custom Costs */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <span className={labelCls}>Custom Costs</span>
          <button
            type="button"
            onClick={addCustomCost}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              darkMode
                ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                : "border-gray-200 text-gray-600 hover:bg-white"
            }`}
          >
            + Add Cost
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => addPresetCost("Minimum charge", "flat")}
            className={`text-[9px] px-2 py-0.5 rounded-md border transition-colors ${darkMode ? "border-amber-700/50 text-amber-400 bg-amber-950/30 hover:bg-amber-900/50" : "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"}`}
          >
            + Min Charge (Profit)
          </button>
          <button
            type="button"
            onClick={() => addPresetCost("Transportation", "per_day")}
            className={`text-[9px] px-2 py-0.5 rounded-md border transition-colors ${darkMode ? "border-blue-700/50 text-blue-400 bg-blue-950/30 hover:bg-blue-900/50" : "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"}`}
          >
            + Transport/day
          </button>
          <button
            type="button"
            onClick={() => addPresetCost("Food", "per_day")}
            className={`text-[9px] px-2 py-0.5 rounded-md border transition-colors ${darkMode ? "border-emerald-700/50 text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/50" : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"}`}
          >
            + Food/day
          </button>
        </div>
        <div className="space-y-2">
          {(cp.customCosts || []).map((cost) => (
            <div
              key={cost.id}
              className={`rounded-lg border p-2 space-y-2 ${darkMode ? "border-slate-700 bg-slate-900/40" : "border-gray-200 bg-white"}`}
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
                  className={`px-2 rounded-lg text-[10px] font-medium ${
                    darkMode ? "text-rose-400 hover:bg-slate-800" : "text-rose-500 hover:bg-rose-50"
                  }`}
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
                  <option value="flat">Flat</option>
                  <option value="per_day">Per day</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────────

function Toggle({ label, value, onChange, darkMode }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[11px] ${darkMode ? "text-slate-300" : "text-gray-700"}`}>{label}</span>
      <div className="flex gap-2">
        {["Yes", "No"].map(opt => {
          const isActive = opt === "Yes" ? value : !value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt === "Yes")}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors border ${
                isActive
                  ? "bg-[#a26e35] border-[#a26e35] text-white"
                  : darkMode
                    ? "bg-slate-700 border-slate-600 text-slate-400"
                    : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildTripDates(itinerary, localStart, localEnd) {
  const start = localStart || itinerary?.startDate;
  const end = localEnd || itinerary?.endDate;
  return buildTripDateRange(start, end);
}
