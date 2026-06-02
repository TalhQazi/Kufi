import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, DollarSign, GripVertical, MapPin, Sparkles, Users } from "lucide-react";
import api from "../../api";
import { PROCEED_WITH_AI_LABEL } from "../../constants/itineraryLabels";
import ItineraryActivityPool from "./components/ItineraryActivityPool";
import ItineraryControlPanel from "./components/ItineraryControlPanel";

function resolveTravelerUserId(request) {
  const user = request?.user;
  if (typeof user === "string") return user;
  return user?._id || user?.id || request?.userId || null;
}

function parseBudgetValue(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value).trim();
  if (!raw || raw === "—" || raw === "-" || /^n\/?a$/i.test(raw)) return undefined;
  const match = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : undefined;
}

function buildItineraryPayload(request) {
  const trip = request?.tripDetails || {};
  const country = trip.country || request.country || "";
  const city = trip.city || request.city || "";
  const destination =
    trip.destination ||
    trip.location ||
    city ||
    country ||
    request.location ||
    request.experience ||
    "Trip";

  const payload = {
    userId: resolveTravelerUserId(request),
    title: destination,
    destination,
    country,
    city: city || country,
    startDate: trip.arrivalDate || trip.startDate,
    endDate: trip.departureDate || trip.endDate,
    numberOfTravelers: trip.guests || trip.travelers || request.guests || request.travelers || 2,
    bookingId: request.id || request._id,
    tripData: trip,
  };

  const budget = parseBudgetValue(trip.budget ?? request.amount);
  if (budget !== undefined) {
    payload.budget = budget;
  }

  return payload;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m || "00"} ${ampm}`;
}

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function getDayName(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "" : DAY_NAMES[d.getDay()];
}

function nightsBetween(start, end) {
  if (!start || !end) return 0;
  const a = new Date(start), b = new Date(end);
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

const resolveImageUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("data:")) return raw;
  if (raw.startsWith("/")) {
    const base = String(api?.defaults?.baseURL || "")
      .replace(/\/$/, "")
      .replace(/\/api$/, "");
    if (!base) return raw;
    return `${base}${raw}`;
  }
  return raw;
};

// ─── Sortable activity card inside a day ─────────────────────────────────────

function SortableActivityCard({ activity, dayIndex, darkMode, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.id, data: { source: "day", dayIndex, activity } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const actUrl = activity.activityId ? `/activities/${activity.activityId}` : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border overflow-hidden flex gap-0 ${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={`flex items-center px-1.5 cursor-grab active:cursor-grabbing ${darkMode ? "text-slate-600 hover:text-slate-400" : "text-gray-300 hover:text-gray-500"}`}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Image — hyperlink */}
      {actUrl ? (
        <a href={actUrl} target="_blank" rel="noopener noreferrer" className="block shrink-0 w-16 h-16">
          <img
            src={resolveImageUrl(activity.image) || "/assets/dest-1.jpeg"}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        </a>
      ) : (
        <div className="shrink-0 w-16 h-16">
          <img
            src={resolveImageUrl(activity.image) || "/assets/dest-1.jpeg"}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 px-2 py-1.5 min-w-0">
        {actUrl ? (
          <a
            href={actUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[11px] font-semibold leading-tight hover:underline block truncate ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            {activity.title}
          </a>
        ) : (
          <p className={`text-[11px] font-semibold leading-tight truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
            {activity.title}
          </p>
        )}

        {/* Supplier-only: times + price */}
        <div className={`flex items-center gap-2 mt-0.5 text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
          {activity.startTime && activity.endTime && (
            <span>{fmtTime(activity.startTime)} – {fmtTime(activity.endTime)}</span>
          )}
          {activity.price > 0 && (
            <span className={`font-medium ${darkMode ? "text-amber-400" : "text-amber-600"}`}>
              ${activity.price}
            </span>
          )}
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(activity.id)}
        className={`px-2 text-[10px] transition-colors ${darkMode ? "text-red-500 hover:text-red-400" : "text-red-400 hover:text-red-600"}`}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Droppable day column ─────────────────────────────────────────────────────

function DayColumn({ day, darkMode, isActive: isActiveProp, onRemoveActivity }) {
  const activities = Array.isArray(day.activities) ? day.activities : [];
  const isArrival = day.isArrivalDay || day.day === 1;
  const isDeparture = day.isDepartureDay;

  const dayTotal = activities.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  const { setNodeRef } = useDroppable({
    id: `day-${day.day - 1}`,
    data: { source: "day", dayIndex: day.day - 1 },
  });

  return (
    <div className="h-full flex flex-col">
      {/* Arrival / departure banner */}
      {isArrival && !day.isArrivalDay === false && (
        <div className={`rounded-lg px-3 py-2 mb-3 text-[11px] font-medium ${darkMode ? "bg-blue-900/30 text-blue-300 border border-blue-900/40" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
          Arrival Day — Free Day. Airport to Hotel transfer provided.
        </div>
      )}
      {day.isArrivalDay && (
        <div className={`rounded-lg px-3 py-2 mb-3 text-[11px] font-medium ${darkMode ? "bg-blue-900/30 text-blue-300 border border-blue-900/40" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
          Arrival Day — Free Day. Airport to Hotel transfer provided.
        </div>
      )}
      {day.isDepartureDay && (
        <div className={`rounded-lg px-3 py-2 mb-3 text-[11px] font-medium ${darkMode ? "bg-orange-900/30 text-orange-300 border border-orange-900/40" : "bg-orange-50 text-orange-700 border border-orange-100"}`}>
          Departure Day — Free Day. Hotel to Airport transfer provided.
        </div>
      )}

      {/* Drop zone */}
      <SortableContext items={activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 min-h-[160px] rounded-xl border-2 border-dashed transition-colors p-2 space-y-2 ${
            isActiveProp
              ? darkMode ? "border-amber-500 bg-amber-900/10" : "border-amber-400 bg-amber-50"
              : activities.length === 0
                ? darkMode ? "border-slate-700 bg-slate-800/30" : "border-gray-200 bg-gray-50/50"
                : darkMode ? "border-slate-700 bg-transparent" : "border-gray-100 bg-transparent"
          }`}
        >
          {activities.length === 0 ? (
            <div className={`flex items-center justify-center h-full text-[11px] pointer-events-none ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
              Drop activities here
            </div>
          ) : (
            activities.map(act => (
              <SortableActivityCard
                key={act.id}
                activity={act}
                dayIndex={day.day - 1}
                darkMode={darkMode}
                onRemove={onRemoveActivity}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Per-day total (supplier only) */}
      {dayTotal > 0 && (
        <div className={`mt-2 flex items-center justify-end gap-1 text-[11px] font-medium ${darkMode ? "text-amber-400" : "text-amber-600"}`}>
          <DollarSign className="h-3 w-3" />
          <span>Day total: ${dayTotal.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SupplierGenerateItinerary({ darkMode, request, onGoToBookings, onBack }) {
  const [itinerary, setItinerary] = useState(null);
  const [daysData, setDaysData] = useState([]);
  const [activeDay, setActiveDay] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [activeDragId, setActiveDragId] = useState(null);
  const [activeDragData, setActiveDragData] = useState(null);
  const [overDayIndex, setOverDayIndex] = useState(null);
  const [localCP, setLocalCP] = useState(null);
  const [localHotel, setLocalHotel] = useState(null);
  const generateCalledRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const requestKey = request?.id || request?._id;

  async function resolveItineraryRecord() {
    if (request?.itineraryId) {
      try {
        const res = await api.get(`/itineraries/${request.itineraryId}`);
        return res.data;
      } catch {
        // fall through
      }
    }

    const bookingId = request?.id || request?._id;
    if (bookingId) {
      try {
        const res = await api.get(`/itineraries/booking/${bookingId}`);
        return res.data;
      } catch {
        // not found yet — create below
      }
    }

    const payload = buildItineraryPayload(request);
    if (!payload.userId) {
      throw new Error("Traveler account is missing on this booking. Cannot create itinerary.");
    }

    const res = await api.post("/itineraries", payload);
    return res.data;
  }

  async function triggerGenerate(itin, { force = false } = {}) {
    if (!itin?._id) return;
    setGenerating(true);
    setGenerateError("");
    try {
      const res = await api.post(`/itineraries/${itin._id}/generate`);
      const updated = res.data.itinerary || res.data;
      setItinerary(updated);
      setDaysData(Array.isArray(updated.days) ? updated.days : []);
      if (res.data?.warning) {
        setGenerateError(res.data.warning);
      } else if (!updated?.days?.length) {
        setGenerateError("AI generation finished but no days were returned. Try again.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        "AI itinerary generation failed.";
      console.error("Generate failed", err);
      setGenerateError(msg);
      if (force) generateCalledRef.current = false;
    } finally {
      setGenerating(false);
    }
  }

  // ── Load itinerary from request ─────────────────────────────────────────────
  useEffect(() => {
    generateCalledRef.current = false;
    setLoadError("");
    setGenerateError("");
    setItinerary(null);
    setDaysData([]);
    setLocalCP(null);
    setLocalHotel(null);

    async function loadOrCreate() {
      if (!request) return;

      try {
        const itin = await resolveItineraryRecord();
        setItinerary(itin);
        setLoadError("");

        if (Array.isArray(itin.days) && itin.days.length > 0 && itin.aiGenerated) {
          setDaysData(itin.days);
        } else if (!generateCalledRef.current) {
          generateCalledRef.current = true;
          await triggerGenerate(itin);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.msg ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to create itinerary for this request.";
        console.error("Failed to load/create itinerary", err);
        setLoadError(msg);
      }
    }

    loadOrCreate();
  }, [requestKey]);

  // ── All activityIds already placed in days ──────────────────────────────────
  const assignedActivityIds = useMemo(() => {
    const ids = [];
    daysData.forEach(d => {
      (d.activities || []).forEach(a => { if (a.activityId) ids.push(a.activityId); });
    });
    return ids;
  }, [daysData]);

  // ── DnD handlers ─────────────────────────────────────────────────────────────

  function handleDragStart({ active }) {
    setActiveDragId(active.id);
    setActiveDragData(active.data.current);
  }

  function handleDragOver({ active, over }) {
    if (!over) { setOverDayIndex(null); return; }
    // Determine which day we're hovering over
    const overData = over.data?.current;
    if (overData?.source === "day") {
      setOverDayIndex(overData.dayIndex);
    } else {
      // over.id might be the day droppable id like "day-0"
      const match = String(over.id).match(/^day-(\d+)$/);
      setOverDayIndex(match ? parseInt(match[1], 10) : null);
    }
  }

  function handleDragEnd({ active, over }) {
    setActiveDragId(null);
    setActiveDragData(null);
    setOverDayIndex(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data?.current;

    // ── Pool card dropped onto a day ──────────────────────────────────────────
    if (activeData?.source === "pool") {
      const activity = activeData.activity;
      let targetDayIdx = null;

      if (overData?.source === "day") {
        targetDayIdx = overData.dayIndex;
      } else {
        const match = String(over.id).match(/^day-(\d+)$/);
        if (match) targetDayIdx = parseInt(match[1], 10);
      }

      if (targetDayIdx == null) return;

      const newAct = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        activityId: String(activity._id || activity.id),
        title: activity.title || "",
        description: activity.description || "",
        image: activity.image || "",
        price: activity.price || 0,
        category: activity.category || "",
        startTime: "",
        endTime: "",
        isSupplierOnly: true,
      };

      setDaysData(prev => prev.map((d, i) => {
        if (i !== targetDayIdx) return d;
        return { ...d, activities: [...(d.activities || []), newAct] };
      }));
      return;
    }

    // ── Sorting within / moving between days ──────────────────────────────────
    if (activeData?.source === "day") {
      const fromDayIdx = activeData.dayIndex;
      const overDayIdx = overData?.source === "day" ? overData.dayIndex : fromDayIdx;

      if (fromDayIdx === overDayIdx) {
        // Reorder within same day
        setDaysData(prev => prev.map((d, i) => {
          if (i !== fromDayIdx) return d;
          const acts = [...(d.activities || [])];
          const oldIdx = acts.findIndex(a => a.id === active.id);
          const newIdx = acts.findIndex(a => a.id === over.id);
          if (oldIdx < 0 || newIdx < 0) return d;
          return { ...d, activities: arrayMove(acts, oldIdx, newIdx) };
        }));
      } else {
        // Move to different day
        const movedAct = daysData[fromDayIdx]?.activities?.find(a => a.id === active.id);
        if (!movedAct) return;
        setDaysData(prev => prev.map((d, i) => {
          if (i === fromDayIdx) return { ...d, activities: (d.activities || []).filter(a => a.id !== active.id) };
          if (i === overDayIdx) return { ...d, activities: [...(d.activities || []), { ...movedAct }] };
          return d;
        }));
      }
    }
  }

  function removeActivityFromDay(actId) {
    setDaysData(prev => prev.map(d => ({
      ...d,
      activities: (d.activities || []).filter(a => a.id !== actId),
    })));
  }

  // ── Save button ──────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!itinerary?._id) return;
    setSaving(true);
    try {
      await api.put(`/itineraries/${itinerary._id}/days`, { days: daysData });
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2500);
    } catch (err) {
      console.error("Save failed", err);
      setSaveMsg("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const handleControlPanelChange = useCallback((newCp, selectedHotel) => {
    setLocalCP(newCp);
    setLocalHotel(selectedHotel);
  }, []);

  // ── Summary calculations ─────────────────────────────────────────────────────

  const hotelData = localCP ? localHotel : itinerary?.controlPanel?.hotelId;
  const nights = nightsBetween(itinerary?.startDate, itinerary?.endDate);
  const rooms = localCP ? localCP.numberOfRooms : (itinerary?.controlPanel?.numberOfRooms || 1);
  const hotelCost = hotelData?.pricePerNight ? hotelData.pricePerNight * nights * rooms : 0;
  const upliftPct = localCP ? (localCP.budgetUplift / 100) : (itinerary?.controlPanel?.budgetUplift ?? 0.15);

  const activitiesTotal = useMemo(() =>
    daysData.reduce((sum, d) =>
      sum + (d.activities || []).reduce((s, a) => s + (Number(a.price) || 0), 0), 0),
    [daysData]);

  const totalActivitiesCount = useMemo(() =>
    daysData.reduce((sum, d) => sum + (d.activities || []).length, 0),
    [daysData]);

  const grandTotal = Math.round((activitiesTotal + hotelCost) * (1 + upliftPct));

  const currentDay = daysData[activeDay] || null;

  // ─────────────────────────────────────────────────────────────────────────────

  const base = darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900";
  const cardCls = `rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`min-h-screen px-4 py-6 ${base}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${darkMode ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              ← Back
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className={`text-base font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
              {itinerary?.title || "Build Itinerary"}
            </h1>
            <p className={`text-[11px] mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              {itinerary?.destination || ""}
              {itinerary?.aiGenerated && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${darkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
                  AI Generated
                </span>
              )}
            </p>
          </div>
          {itinerary?._id && !generating && (
            <button
              type="button"
              onClick={() => triggerGenerate(itinerary, { force: true })}
              className="inline-flex items-center gap-2 rounded-full bg-[#a26e35] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#8b5e2d] transition-colors shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{PROCEED_WITH_AI_LABEL}</span>
            </button>
          )}
        </div>

        {loadError && (
          <div className={`rounded-2xl border px-4 py-3 mb-4 text-sm ${darkMode ? "bg-rose-950/40 border-rose-900 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
            {loadError}
          </div>
        )}

        {generateError && (
          <div className={`rounded-2xl border px-4 py-3 mb-4 text-sm ${darkMode ? "bg-amber-950/40 border-amber-900 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
            {generateError}
            {itinerary?._id && (
              <button
                type="button"
                onClick={() => triggerGenerate(itinerary, { force: true })}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold underline"
              >
                Retry AI generation
              </button>
            )}
          </div>
        )}

        {/* Generating overlay */}
        {generating && (
          <div className={`rounded-2xl border p-8 text-center mb-6 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a26e35] mx-auto mb-3" />
            <p className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
              Building your itinerary with AI…
            </p>
            <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              This may take a few seconds
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left: day view ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Day tabs */}
            {daysData.length > 0 && (
              <div className={`${cardCls} px-4 py-3`}>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {daysData.map((d, idx) => {
                    const isActive = idx === activeDay;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveDay(idx)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border ${
                          isActive
                            ? "bg-[#a26e35] border-[#a26e35] text-white"
                            : darkMode
                              ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        Day {d.day}
                        {d.isArrivalDay && " ✈"}
                        {d.isDepartureDay && " 🛫"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current day panel */}
            {currentDay && (
              <div
                id={`day-${activeDay}`}
                data-droppable="true"
                className={`${cardCls} px-4 py-4`}
              >
                {/* Day header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                      Day {currentDay.day}
                      {currentDay.dayName && ` — ${currentDay.dayName}`}
                    </h2>
                    {currentDay.date && (
                      <p className={`text-[11px] mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                        {fmtDate(currentDay.date)}
                      </p>
                    )}
                  </div>
                </div>

                <DayColumn
                  day={currentDay}
                  darkMode={darkMode}
                  isActive={overDayIndex === activeDay}
                  onRemoveActivity={removeActivityFromDay}
                />
              </div>
            )}

            {/* Summary card */}
            <div className={`${cardCls} px-4 py-4`}>
              <h3 className={`text-sm font-semibold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
                Summary
              </h3>
              <div className={`space-y-2 text-xs ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                <Row label="Arrival Date" value={itinerary?.startDate ? fmtDate(itinerary.startDate) : "—"} dark={darkMode} />
                <Row label="Departure Date" value={itinerary?.endDate ? fmtDate(itinerary.endDate) : "—"} dark={darkMode} />
                <Row label="Travelers" value={itinerary?.numberOfTravelers || "—"} dark={darkMode} />
                <Row label="Total Activities" value={totalActivitiesCount} dark={darkMode} />
                <Row label="Hotel" value={hotelData?.name || "Not selected"} dark={darkMode} />
                <Row label="Transportation" value="Included in itinerary" dark={darkMode} />
                {hotelCost > 0 && <Row label={`Hotel (${nights} nights × ${rooms} rooms)`} value={`$${hotelCost.toLocaleString()}`} dark={darkMode} />}
                <Row label="Activities Cost" value={`$${activitiesTotal.toLocaleString()}`} dark={darkMode} />
                {upliftPct > 0 && <Row label={`Uplift (${Math.round(upliftPct * 100)}%)`} value={`$${Math.round((activitiesTotal + hotelCost) * upliftPct).toLocaleString()}`} dark={darkMode} />}
                <div className={`border-t pt-2 mt-1 flex justify-between font-bold text-sm ${darkMode ? "border-slate-700 text-white" : "border-gray-100 text-slate-900"}`}>
                  <span>Total</span>
                  <span>${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !itinerary}
              className={`w-full rounded-full py-3 text-sm font-semibold transition-colors ${
                saving ? "opacity-60 cursor-not-allowed" : ""
              } ${saveMsg === "Saved!" ? "bg-emerald-600 text-white" : "bg-[#a26e35] hover:bg-[#8b5e2d] text-white"}`}
            >
              {saving ? "Saving…" : saveMsg || "Save"}
            </button>
          </div>

          {/* ── Right: activity pool + control panel ──────────────────────── */}
          <div className="space-y-4">
            <ItineraryActivityPool
              darkMode={darkMode}
              itinerary={itinerary}
              assignedActivityIds={assignedActivityIds}
            />
            <ItineraryControlPanel
              darkMode={darkMode}
              itinerary={itinerary}
              onSaved={updated => {
                setItinerary(updated);
                setLocalCP(null);
                setLocalHotel(null);
              }}
              onChange={handleControlPanelChange}
            />
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDragData?.activity && (
          <div className={`rounded-xl border shadow-xl overflow-hidden w-36 opacity-90 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
            <img
              src={resolveImageUrl(activeDragData.activity.image) || "/assets/dest-1.jpeg"}
              alt=""
              className="w-full h-20 object-cover"
            />
            <p className={`px-2 py-1.5 text-[11px] font-medium truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
              {activeDragData.activity.title}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ─── tiny helper ─────────────────────────────────────────────────────────────

function Row({ label, value, dark }) {
  return (
    <div className="flex justify-between items-center">
      <span className={dark ? "text-slate-500" : "text-gray-500"}>{label}</span>
      <span className={`font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}
