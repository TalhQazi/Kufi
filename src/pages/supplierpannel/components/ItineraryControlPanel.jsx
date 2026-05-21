import { useEffect, useState } from "react";
import api from "../../../api";

const DEFAULT_CP = {
  activityStartTime: "09:00",
  activityEndTime: "19:00",
  lunchStart: "13:00",
  lunchEnd: "14:00",
  startOnArrival: false,
  endOnDeparture: false,
  perDayOverrides: [],
  hotelId: "",
  numberOfRooms: 1,
  budgetUplift: 15,
};

export default function ItineraryControlPanel({ darkMode, itinerary, onSaved }) {
  const [cp, setCp] = useState(DEFAULT_CP);
  const [hotels, setHotels] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const country = itinerary?.country || itinerary?.tripData?.country || "";
  const city = itinerary?.city || itinerary?.tripData?.city || itinerary?.destination || "";

  // Populate from existing itinerary controlPanel
  useEffect(() => {
    if (itinerary?.controlPanel) {
      setCp({
        ...DEFAULT_CP,
        ...itinerary.controlPanel,
        budgetUplift: itinerary.controlPanel.budgetUplift != null
          ? Math.round(itinerary.controlPanel.budgetUplift * 100)
          : 15,
        hotelId: itinerary.controlPanel.hotelId?._id || itinerary.controlPanel.hotelId || "",
      });
    }
  }, [itinerary?._id]);

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

  const set = (key, value) => setCp(prev => ({ ...prev, [key]: value }));

  // Per-day overrides helpers
  const tripDates = buildTripDates(itinerary);

  function setOverride(date, field, value) {
    setCp(prev => {
      const overrides = Array.isArray(prev.perDayOverrides) ? [...prev.perDayOverrides] : [];
      const idx = overrides.findIndex(o => o.date === date);
      if (idx >= 0) {
        overrides[idx] = { ...overrides[idx], [field]: value };
      } else {
        overrides.push({ date, [field]: value });
      }
      return { ...prev, perDayOverrides: overrides };
    });
  }

  function getOverride(date, field) {
    const o = (cp.perDayOverrides || []).find(o => o.date === date);
    return o?.[field] || "";
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...cp,
        budgetUplift: (Number(cp.budgetUplift) || 15) / 100,
        hotelId: cp.hotelId || null,
      };
      const res = await api.put(`/itineraries/${itinerary._id}/control-panel`, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved?.(res.data);
    } catch (err) {
      console.error("Failed to save control panel", err);
    } finally {
      setSaving(false);
    }
  }

  const base = darkMode
    ? "bg-slate-900 border-slate-800 text-slate-300"
    : "bg-white border-gray-200 text-gray-700";
  const inputCls = `w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`;
  const labelCls = `text-[11px] font-medium mb-0.5 block ${darkMode ? "text-slate-400" : "text-gray-500"}`;
  const sectionCls = `rounded-xl border px-4 py-3 space-y-3 ${darkMode ? "bg-slate-800/60 border-slate-700" : "bg-gray-50 border-gray-100"}`;

  return (
    <div className={`rounded-2xl border text-xs space-y-4 px-4 py-4 ${base}`}>
      <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
        Control Panel
      </h3>

      {/* Dates (read-only) */}
      <div className={sectionCls}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className={labelCls}>Arrival Date</span>
            <div className={`${inputCls} opacity-60 cursor-not-allowed`}>
              {itinerary?.startDate ? new Date(itinerary.startDate).toLocaleDateString() : "—"}
            </div>
          </div>
          <div>
            <span className={labelCls}>Departure Date</span>
            <div className={`${inputCls} opacity-60 cursor-not-allowed`}>
              {itinerary?.endDate ? new Date(itinerary.endDate).toLocaleDateString() : "—"}
            </div>
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

      {/* Lunch time */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <span className={labelCls}>Lunch Time</span>
          <span className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>All Days default</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="time" value={cp.lunchStart} onChange={e => set("lunchStart", e.target.value)} className={inputCls} />
          <input type="time" value={cp.lunchEnd} onChange={e => set("lunchEnd", e.target.value)} className={inputCls} />
        </div>
        {tripDates.length > 0 && (
          <details>
            <summary className={`cursor-pointer text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              Override per day
            </summary>
            <div className="mt-2 space-y-1.5">
              {tripDates.map(date => (
                <div key={date} className="flex items-center gap-2">
                  <span className={`w-24 shrink-0 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{date}</span>
                  <input type="time" placeholder="start" value={getOverride(date, "lunchStart")} onChange={e => setOverride(date, "lunchStart", e.target.value)} className={inputCls} />
                  <input type="time" placeholder="end" value={getOverride(date, "lunchEnd")} onChange={e => setOverride(date, "lunchEnd", e.target.value)} className={inputCls} />
                </div>
              ))}
            </div>
          </details>
        )}
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

      {/* Budget Uplift */}
      <div className={sectionCls}>
        <span className={labelCls}>Budget Uplift %</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={100}
            value={cp.budgetUplift}
            onChange={e => set("budgetUplift", Number(e.target.value))}
            className={`${inputCls} w-24`}
          />
          <span className={darkMode ? "text-slate-400" : "text-gray-500"}>%</span>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={`w-full rounded-full py-2.5 text-xs font-semibold transition-colors ${saving ? "opacity-60 cursor-not-allowed" : ""} ${saved ? "bg-emerald-600 text-white" : "bg-[#a26e35] hover:bg-[#8b5e2d] text-white"}`}
      >
        {saving ? "Saving…" : saved ? "Saved!" : "Save"}
      </button>
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

function buildTripDates(itinerary) {
  if (!itinerary?.startDate || !itinerary?.endDate) return [];
  const dates = [];
  const cur = new Date(itinerary.startDate);
  const end = new Date(itinerary.endDate);
  while (cur <= end) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}
