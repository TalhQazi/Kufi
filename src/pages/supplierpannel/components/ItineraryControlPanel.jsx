import { useEffect, useState, useRef } from "react";
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

export default function ItineraryControlPanel({ darkMode, itinerary, request, onSaved, onChange }) {
  const [cp, setCp] = useState(DEFAULT_CP);
  const [hotels, setHotels] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    let start = itinerary?.startDate;
    if (!start && request) start = request?.tripDetails?.arrivalDate || request?.tripDetails?.startDate || request?.arrivalDate;
    return start ? new Date(start).toISOString().slice(0, 10) : "";
  });
  
  const [endDate, setEndDate] = useState(() => {
    let end = itinerary?.endDate;
    if (!end && request) end = request?.tripDetails?.departureDate || request?.tripDetails?.endDate || request?.departureDate;
    return end ? new Date(end).toISOString().slice(0, 10) : "";
  });

  const country = itinerary?.country || itinerary?.tripData?.country || "";
  const city = itinerary?.city || itinerary?.tripData?.city || itinerary?.destination || "";

  // Populate from existing itinerary controlPanel
  useEffect(() => {
    if (itinerary?.controlPanel) {
      setCp({
        ...DEFAULT_CP,
        ...itinerary.controlPanel,
        budgetUplift: itinerary.controlPanel.budgetUplift != null
          ? (itinerary.controlPanel.budgetUplift < 1 && itinerary.controlPanel.budgetUplift > 0
              ? Math.round(itinerary.controlPanel.budgetUplift * 100)
              : Number(itinerary.controlPanel.budgetUplift))
          : 15,
        hotelId: itinerary.controlPanel.hotelId?._id || itinerary.controlPanel.hotelId || "",
      });
    }
  }, [itinerary]);

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
    setCp(prev => {
      const next = { ...prev, [key]: value };
      const selectedHotel = hotels.find(h => h._id === next.hotelId) || null;
      onChange?.(next, selectedHotel);
      return next;
    });
  };

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
  const pendingSaveRef = useRef(null);

  useEffect(() => {
    cpRef.current = cp;
    datesRef.current = { startDate, endDate };
  }, [cp, startDate, endDate]);

  // Pass changes to parent component without saving to backend yet
  useEffect(() => {
    const payload = {
      ...cp,
      budgetUplift: Math.min(Math.max(Number(cp.budgetUplift) || 15, 0), 100),
      hotelId: cp.hotelId || null,
      startDate: startDate || null,
      endDate: endDate || null,
    };
    const selectedHotel = hotels.find(h => h._id === cp.hotelId) || null;
    onChange?.(payload, selectedHotel);
  }, [cp, startDate, endDate, hotels, onChange]);

  const formatTripDate = (value) => {
    if (!value) return "—";
    const v = String(value).trim();
    if (!v) return "—";
    const isoMatch = v.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch?.[1]) return isoMatch[1];
    const t = Date.parse(v);
    if (Number.isFinite(t)) return new Date(t).toISOString().slice(0, 10);
    return v;
  };

  const requestedArrival = formatTripDate(request?.tripDetails?.arrivalDate || request?.tripDetails?.startDate || request?.arrivalDate);
  const requestedDeparture = formatTripDate(request?.tripDetails?.departureDate || request?.tripDetails?.endDate || request?.departureDate);

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
              onChange={e => setStartDate(e.target.value)}
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
              onChange={e => setEndDate(e.target.value)}
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
