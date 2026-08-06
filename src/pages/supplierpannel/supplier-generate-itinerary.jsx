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
import { CalendarDays, GripVertical, Plus, Trash2, ArrowLeft } from "lucide-react";
import api, { getApiBaseUrl, getAuthToken } from "../../api";
import { notifyItineraryWorkflowChanged } from "../../constants/itineraryLabels";
import ItineraryActivityPool from "./components/ItineraryActivityPool";
import ItineraryControlPanel from "./components/ItineraryControlPanel";
import {
  daysBetween as calendarDaysBetween,
  formatDisplayDate,
  getDayName as calendarDayName,
  nightsBetween as calendarNightsBetween,
  toDateString,
  addDays,
} from "../../utils/calendarDate";


export function resolveTravelerUserId(request) {
  const user = request?.user;
  if (typeof user === "string") return user;
  return user?._id || user?.id || request?.userId || null;
}

export function parseBudgetValue(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value).trim();
  if (!raw || raw === "—" || raw === "-" || /^n\/?a$/i.test(raw)) return undefined;
  const matches = raw.replace(/,/g, "").match(/\d+(?:\.\d+)?/g);
  if (!matches || matches.length === 0) return undefined;
  const numbers = matches.map(Number).filter(Number.isFinite);
  if (numbers.length === 0) return undefined;
  return Math.max(...numbers);
}

export function buildItineraryPayload(request, overviewItinerary = null) {
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
    startDate: overviewItinerary?.startDate || trip.arrivalDate || trip.startDate,
    endDate: overviewItinerary?.endDate || trip.departureDate || trip.endDate,
    numberOfTravelers: trip.guests || trip.travelers || request.guests || request.travelers || 2,
    bookingId: request.id || request._id,
    tripData: trip,
    controlPanel: overviewItinerary?.controlPanel || undefined,
  };

  const budget = parseBudgetValue(trip.budget ?? request.amount);
  if (budget !== undefined) {
    payload.budget = budget;
  }

  return payload;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m || "00"} ${ampm}`;
}

function fmtDate(dateStr) {
  return formatDisplayDate(dateStr) || dateStr || "";
}

function getDayName(dateStr) {
  return calendarDayName(dateStr);
}

function nightsBetween(start, end) {
  return calendarNightsBetween(start, end);
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

function newExtraField() {
  return {
    id: `ef-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    value: "",
  };
}

// ─── draft persistence helpers ───────────────────────────────────────────────

/** Statuses that mean the itinerary has already left the supplier's draft space. */
const SENT_TO_TRAVELER_STATUSES = [
  "Supplier Replied Back",
  "Ready",
  "Accepted",
  "Payment Completed",
  "Completed",
];

function isSentToTraveler(status) {
  return SENT_TO_TRAVELER_STATUSES.includes(String(status || "").trim());
}

/** Normalize the control panel for transport (hotel may be populated as an object). */
function serializeControlPanel(itinerary) {
  const cp = itinerary?.controlPanel;
  if (!cp || typeof cp !== "object") return undefined;
  const hotelId = cp.hotelId?._id || cp.hotelId || null;
  return { ...cp, hotelId: hotelId || null };
}

/**
 * Stable fingerprint of everything the builder owns. Used to decide whether there is
 * unsaved work worth auto-saving when the supplier leaves.
 */
function serializeBuilderState(days, extraFields, itinerary) {
  try {
    return JSON.stringify({
      days: days || [],
      extraFields: extraFields || [],
      startDate: toDateString(itinerary?.startDate) || null,
      endDate: toDateString(itinerary?.endDate) || null,
      controlPanel: serializeControlPanel(itinerary) || null,
    });
  } catch {
    return "";
  }
}

/**
 * In-flight exit auto-saves, keyed by itinerary id. The save is fired from an unmount
 * cleanup, so a quick Back → forward could otherwise re-read the itinerary before the
 * write lands and show (then re-save) stale data. Reloads wait on this first.
 */
const pendingDraftSaves = new Map();

function awaitPendingDraftSave(itineraryId) {
  const pending = itineraryId ? pendingDraftSaves.get(String(itineraryId)) : null;
  return pending ? pending.catch(() => {}) : Promise.resolve();
}

/** Request body shared by "Save to Draft", "Send to Traveler" and the exit auto-save. */
function buildPersistBody(days, extraFields, itinerary) {
  return {
    days: days || [],
    extraFields: extraFields || [],
    startDate: toDateString(itinerary?.startDate) || null,
    endDate: toDateString(itinerary?.endDate) || null,
    controlPanel: serializeControlPanel(itinerary),
    aiGenerated: Boolean(itinerary?.aiGenerated),
    generationSource: itinerary?.generationSource,
  };
}

// ─── Sortable activity card inside a day ─────────────────────────────────────

function SortableActivityCard({ activity, dayIndex, darkMode, onRemove, onChange, onMoveUp, onMoveDown }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.id, data: { source: "day", dayIndex, activity } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const inputCls = `w-full rounded border px-1.5 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${
    darkMode ? "bg-slate-900 border-slate-600 text-white" : "bg-white border-gray-200 text-slate-900"
  }`;

  const setField = (field, value) => onChange?.(activity.id, dayIndex, field, value);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border overflow-hidden flex gap-0 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100 shadow-sm"}`}
    >
      <div className="flex flex-col justify-center items-center px-1 border-r border-slate-100 dark:border-slate-700/60 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMoveUp?.(activity.id, dayIndex); }}
          className={`p-0.5 hover:text-amber-600 transition-colors text-[10px] ${darkMode ? "text-slate-400" : "text-gray-400"}`}
          title="Move activity up in rank"
        >
          ▲
        </button>
        <div
          className={`flex items-center cursor-grab active:cursor-grabbing ${darkMode ? "text-slate-600" : "text-gray-300"}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMoveDown?.(activity.id, dayIndex); }}
          className={`p-0.5 hover:text-amber-600 transition-colors text-[10px] ${darkMode ? "text-slate-400" : "text-gray-400"}`}
          title="Move activity down in rank"
        >
          ▼
        </button>
      </div>

      <div className="shrink-0 w-16 h-16">
        <img
          src={resolveImageUrl(activity.image) || "/assets/dest-1.jpeg"}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 px-2 py-1.5 min-w-0 space-y-1" onPointerDown={(e) => e.stopPropagation()}>
        <input
          className={inputCls}
          value={activity.title || ""}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Activity title"
        />
        <div className="flex items-center gap-1">
          <input
            type="time"
            className={`${inputCls} w-[5.5rem]`}
            value={activity.startTime || ""}
            onChange={(e) => setField("startTime", e.target.value)}
          />
          <span className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>–</span>
          <input
            type="time"
            className={`${inputCls} w-[5.5rem]`}
            value={activity.endTime || ""}
            onChange={(e) => setField("endTime", e.target.value)}
          />
          <input
            type="number"
            min="0"
            step="1"
            className={`${inputCls} w-16`}
            value={activity.price ?? ""}
            onChange={(e) => setField("price", Number(e.target.value) || 0)}
            placeholder="$"
          />
        </div>
        <input
          className={inputCls}
          value={activity.location || ""}
          onChange={(e) => setField("location", e.target.value)}
          placeholder="Location (e.g. Dubai Marina)"
        />
        <input
          className={inputCls}
          value={activity.description || ""}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Description (optional)"
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(activity.id, dayIndex);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className={`px-2 text-[10px] transition-colors ${darkMode ? "text-red-500 hover:text-red-400" : "text-red-400 hover:text-red-600"}`}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Droppable day column ─────────────────────────────────────────────────────

function DayColumn({ day, darkMode, isActive: isActiveProp, onRemoveActivity, onChangeActivity, onUpdateDayNote, onMoveActivityUp, onMoveActivityDown }) {
  const activities = Array.isArray(day.activities) ? day.activities : [];
  const dayTotal = activities.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  const { setNodeRef } = useDroppable({
    id: `day-${day.day - 1}`,
    data: { source: "day", dayIndex: day.day - 1 },
  });

  return (
    <div className="h-full flex flex-col">
      {day.isArrivalDay && (
        <div className={`rounded-lg p-2.5 mb-3 text-[11px] font-medium space-y-1 ${darkMode ? "bg-blue-900/30 text-blue-300 border border-blue-900/40" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase text-[10px]">Arrival Day Note</span>
          </div>
          <input
            type="text"
            value={day.arrivalNote || ""}
            onChange={(e) => onUpdateDayNote?.(day.day - 1, "arrivalNote", e.target.value)}
            placeholder="Arrival Day — Airport to Hotel transfer provided."
            className={`w-full rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-blue-200 text-slate-900"}`}
          />
        </div>
      )}
      {day.isDepartureDay && (
        <div className={`rounded-lg p-2.5 mb-3 text-[11px] font-medium space-y-1 ${darkMode ? "bg-orange-900/30 text-orange-300 border border-orange-900/40" : "bg-orange-50 text-orange-700 border border-orange-100"}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase text-[10px]">Departure Day Note</span>
          </div>
          <input
            type="text"
            value={day.departureNote || ""}
            onChange={(e) => onUpdateDayNote?.(day.day - 1, "departureNote", e.target.value)}
            placeholder="Departure Day — Hotel to Airport transfer provided."
            className={`w-full rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-orange-200 text-slate-900"}`}
          />
        </div>
      )}

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl border border-dashed p-2 space-y-2 min-h-[80px] transition-colors ${
          isActiveProp
            ? (darkMode ? "border-amber-500 bg-amber-950/20" : "border-[#a26e35] bg-amber-50/50")
            : (darkMode ? "border-slate-700" : "border-gray-200")
        }`}
      >
        <SortableContext items={activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {activities.map((act) => (
            <SortableActivityCard
              key={act.id}
              activity={act}
              dayIndex={day.day - 1}
              darkMode={darkMode}
              onRemove={onRemoveActivity}
              onChange={onChangeActivity}
              onMoveUp={onMoveActivityUp}
              onMoveDown={onMoveActivityDown}
            />
          ))}
        </SortableContext>
        {activities.length === 0 && (
          <p className={`text-[11px] text-center py-4 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
            Drag activities here
          </p>
        )}
      </div>

      {dayTotal > 0 && (
        <p className={`text-[10px] text-right mt-2 font-medium ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
          Day total: ${dayTotal.toLocaleString()}
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SupplierGenerateItinerary({ darkMode, request, overviewItinerary, draft, mode = "ai", onGoToBookings, onBack, forceGenerateOnMount, onClearForceGenerate }) {
  const [itinerary, setItinerary] = useState(null);
  const [daysData, setDaysData] = useState([]);
  const [activeDay, setActiveDay] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [extraFields, setExtraFields] = useState([]);
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [showActivitiesPool, setShowActivitiesPool] = useState(true);
  const [activeDragId, setActiveDragId] = useState(null);
  const [activeDragData, setActiveDragData] = useState(null);
  const [overDayIndex, setOverDayIndex] = useState(null);
  const generateCalledRef = useRef(false);

  // ── Draft persistence bookkeeping ──────────────────────────────────────────
  // `savedSnapshotRef` holds a serialized copy of what the server currently has.
  // Anything different from it is unsaved work that must survive the supplier
  // leaving the builder. `finalizedRef` is set once the itinerary has been sent to
  // the traveler — from that point it must never be written back as a draft.
  const savedSnapshotRef = useRef("");
  const finalizedRef = useRef(false);
  const autoSaveInFlightRef = useRef(false);
  const builderStateRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const updateDaysData = useCallback((days) => {
    if (!Array.isArray(days)) return [];
    return days.map((day) => {
      const activities = Array.isArray(day.activities) ? day.activities : [];
      const updatedActivities = activities.map((act, actIdx) => {
        if (!act.id) {
          const uniqueId = `act-${day.day}-${actIdx}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          return { ...act, id: uniqueId };
        }
        return act;
      });
      return { ...day, activities: updatedActivities };
    });
  }, []);

  const requestKey = request?.id || request?._id;

  async function resolveItineraryRecord() {
    // IMPORTANT: `request.itinerary` comes from /supplier/bookings, which only projects a
    // handful of fields (`days.day` and nothing else). Using it directly used to hand the
    // builder a shell record with day stubs and no activities/extraFields/controlPanel —
    // which is why resuming a draft looked like "nothing was restored". Always resolve the
    // full document by id instead.
    const itinId =
      request?.itineraryId ||
      (typeof request?.itinerary === "string" ? request.itinerary : null) ||
      (request?.itinerary && typeof request.itinerary === "object" ? request.itinerary._id : null);

    if (itinId) {
      // Never read behind an exit auto-save that has not landed yet.
      await awaitPendingDraftSave(itinId);
      try {
        const res = await api.get(`/itineraries/${itinId}`);
        if (res.data?._id) return res.data;
      } catch {
        // fall through to the booking lookup
      }
    }

    const bookingId = request?.id || request?._id;
    if (bookingId) {
      try {
        const res = await api.get(`/itineraries/booking/${bookingId}`);
        if (res.data?._id) return res.data;
      } catch {
        // not found yet
      }
    }

    // Otherwise, create a new one
    const payload = buildItineraryPayload(request, overviewItinerary);
    const res = await api.post("/itineraries", payload);
    return res.data;
  }

  async function triggerGenerate(itin, { genMode = mode } = {}) {
    if (!itin?._id) return;
    setGenerating(true);
    setGenerateError("");
    try {
      // `persist` is intentionally omitted: the server returns the generated plan without
      // writing it. The itinerary only becomes a draft when the supplier saves it, sends
      // it, or leaves the builder with unsaved work.
      const res = await api.post(`/itineraries/${itin._id}/generate`, { mode: genMode });
      const updated = res.data.itinerary || res.data;
      const generatedDays = Array.isArray(updated.days) ? updated.days : [];
      setItinerary(updated);
      setDaysData(updateDaysData(generatedDays));
      setExtraFields(Array.isArray(updated.extraFields) ? updated.extraFields : []);
      if (res.data?.warning) {
        setGenerateError(res.data.warning);
      } else if (generatedDays.length === 0) {
        setGenerateError("AI generation finished but no days were returned. Try again.");
        // Nothing was produced, so allow another attempt.
        generateCalledRef.current = false;
      }
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        "AI itinerary generation failed.";
      console.error("Generate failed", err);
      setGenerateError(msg);
      generateCalledRef.current = false;
    } finally {
      setGenerating(false);
    }
  }


  useEffect(() => {
    setLoadError("");
    setGenerateError("");

    let cancelled = false;

    async function loadOrCreate() {
      if (!requestKey) return;

      try {
        const itin = await resolveItineraryRecord();
        if (cancelled) return;

        const savedDays = updateDaysData(Array.isArray(itin?.days) ? itin.days : []);
        const savedExtraFields = Array.isArray(itin?.extraFields) ? itin.extraFields : [];

        setItinerary(itin);
        setExtraFields(savedExtraFields);
        setDaysData(savedDays);
        setLoadError("");
        // Everything currently on screen came straight from the server, so there is
        // nothing to auto-save yet.
        savedSnapshotRef.current = serializeBuilderState(savedDays, savedExtraFields, itin);
        finalizedRef.current = isSentToTraveler(itin?.status);

        // Only run AI when the supplier explicitly asked for it AND there is nothing to
        // lose. Re-entering a request that already has days must never regenerate.
        const alreadyBuilt = savedDays.length > 0;
        if (alreadyBuilt) {
          generateCalledRef.current = true;
          if (forceGenerateOnMount) onClearForceGenerate?.();
        } else if (forceGenerateOnMount && !generateCalledRef.current) {
          generateCalledRef.current = true;
          onClearForceGenerate?.();
          await triggerGenerate(itin, { genMode: mode });
        }
      } catch (err) {
        if (cancelled) return;
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
    return () => { cancelled = true; };
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
        location: activity.location || activity.country || "",
        image: activity.image || "",
        price: activity.price || 0,
        category: activity.category || "",
        startTime: activity.startTime || "",
        endTime: activity.endTime || "",
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

  function handleMoveActivityUp(actId, dayIdx) {
    setDaysData((prev) => {
      const updated = [...prev];
      const dayObj = updated[dayIdx];
      if (!dayObj) return prev;
      const acts = [...(dayObj.activities || [])];
      const idx = acts.findIndex((a) => a.id === actId);
      if (idx <= 0) return prev;
      const temp = acts[idx];
      acts[idx] = acts[idx - 1];
      acts[idx - 1] = temp;
      updated[dayIdx] = { ...dayObj, activities: acts };
      return updated;
    });
  }

  function handleMoveActivityDown(actId, dayIdx) {
    setDaysData((prev) => {
      const updated = [...prev];
      const dayObj = updated[dayIdx];
      if (!dayObj) return prev;
      const acts = [...(dayObj.activities || [])];
      const idx = acts.findIndex((a) => a.id === actId);
      if (idx < 0 || idx >= acts.length - 1) return prev;
      const temp = acts[idx];
      acts[idx] = acts[idx + 1];
      acts[idx + 1] = temp;
      updated[dayIdx] = { ...dayObj, activities: acts };
      return updated;
    });
  }

  function moveDayUp(dayIdx) {
    if (dayIdx <= 0) return;
    setDaysData((prev) => {
      const updated = [...prev];
      const temp = updated[dayIdx];
      updated[dayIdx] = updated[dayIdx - 1];
      updated[dayIdx - 1] = temp;
      return updated.map((d, i) => ({ ...d, day: i + 1 }));
    });
  }

  function moveDayDown(dayIdx) {
    setDaysData((prev) => {
      if (dayIdx >= prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[dayIdx];
      updated[dayIdx] = updated[dayIdx + 1];
      updated[dayIdx + 1] = temp;
      return updated.map((d, i) => ({ ...d, day: i + 1 }));
    });
  }

  function removeActivityFromDay(actId, dayIndex) {
    setDaysData(prev => prev.map((d, i) => {
      if (i === dayIndex) {
        return {
          ...d,
          activities: (d.activities || []).filter(a => a.id !== actId),
        };
      }
      return d;
    }));
  }

  function updateDayNote(dayIndex, field, value) {
    setDaysData((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        return { ...d, [field]: value };
      })
    );
  }

  const handleControlPanelChange = useCallback((updatedCp, selectedHotel) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        startDate: updatedCp.startDate || prev.startDate,
        endDate: updatedCp.endDate || prev.endDate,
        controlPanel: {
          ...(prev.controlPanel || {}),
          ...updatedCp,
          hotelId: selectedHotel || updatedCp.hotelId,
        },
      };
    });

    if (updatedCp.startDate) {
      const start = toDateString(updatedCp.startDate);
      if (start) {
        setDaysData((prev) =>
          prev.map((d, idx) => {
            const nextDate = addDays(start, idx);
            return {
              ...d,
              date: nextDate,
              dayName: getDayName(nextDate),
            };
          })
        );
      }
    }
  }, []);

  function changeActivityField(actId, dayIndex, field, value) {
    setDaysData((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        return {
          ...d,
          activities: (d.activities || []).map((a) =>
            a.id === actId ? { ...a, [field]: value } : a
          ),
        };
      })
    );
  }

  function addDay() {
    setDaysData((prev) => {
      const last = prev[prev.length - 1];
      const nextDate = last?.date ? addDays(last.date, 1) : "";
      const next = {
        day: prev.length + 1,
        date: nextDate,
        dayName: getDayName(nextDate),
        isArrivalDay: false,
        isDepartureDay: true,
        departureNote: "Departure Day — Hotel to Airport transfer provided.",
        activities: [],
      };
      return [
        ...prev.map((d, i) => ({
          ...d,
          isDepartureDay: false,
          departureNote: undefined,
          day: i + 1,
        })),
        next,
      ];
    });
  }

  function removeDay(dayIndex) {
    setDaysData((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== dayIndex).map((d, i) => ({
        ...d,
        day: i + 1,
        isArrivalDay: i === 0,
        isDepartureDay: i === prev.length - 2,
      }));
      return next;
    });
  }

  // ── Save / Submit ────────────────────────────────────────────────────────────

  async function handleSaveDraft() {
    if (!itinerary?._id) return;
    setSaving(true);
    setSubmitError("");
    const cleanedExtraFields = extraFields.filter(
      (f) => String(f.label || "").trim() || String(f.value || "").trim()
    );
    setExtraFields(cleanedExtraFields);
    try {
      const res = await api.put(
        `/itineraries/${itinerary._id}/days`,
        buildPersistBody(daysData, cleanedExtraFields, itinerary)
      );
      setItinerary(res.data);
      // Saved explicitly — the exit auto-save has nothing left to do.
      savedSnapshotRef.current = serializeBuilderState(daysData, cleanedExtraFields, res.data);
      // The request now belongs to Drafts, not New Requests — let the other panels resync.
      notifyItineraryWorkflowChanged();
      setSaveMsg("Draft saved");
      setTimeout(() => setSaveMsg(""), 2500);
    } catch (err) {
      console.error("Save failed", err);
      setSaveMsg("Save failed");
      setTimeout(() => setSaveMsg(""), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitToTraveler() {
    if (!itinerary?._id) return;
    setSubmitting(true);
    setSubmitError("");
    const cleanedExtraFields = extraFields.filter(
      (f) => String(f.label || "").trim() && String(f.value || "").trim()
    );
    setExtraFields(cleanedExtraFields);
    try {
      const res = await api.post(
        `/itineraries/${itinerary._id}/submit`,
        buildPersistBody(daysData, cleanedExtraFields, itinerary)
      );
      setItinerary(res.data);
      // Sent to the traveler: it is no longer a draft, and leaving the builder must
      // not write it back into the draft list.
      finalizedRef.current = true;
      savedSnapshotRef.current = serializeBuilderState(daysData, cleanedExtraFields, res.data);
      // Moves out of Drafts and into In Progress — resync the other panels.
      notifyItineraryWorkflowChanged();
      setSaveMsg("Submitted to traveller");
      setTimeout(() => {
        setSaveMsg("");
        if (onGoToBookings) onGoToBookings();
      }, 1200);
    } catch (err) {
      const errors = err?.response?.data?.errors;
      const msg =
        (Array.isArray(errors) && errors.join(". ")) ||
        err?.response?.data?.msg ||
        err?.message ||
        "Submit failed";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Auto-save the draft when the supplier leaves without choosing an action ──
  // The generated itinerary is deliberately not persisted on generation, so this is
  // the safety net that guarantees no work is lost on refresh / tab close / navigation.

  // Mirror the live state into a ref: the exit handlers below are registered once and
  // would otherwise capture a stale closure.
  useEffect(() => {
    builderStateRef.current = { itinerary, daysData, extraFields };
  }, [itinerary, daysData, extraFields]);

  const hasUnsavedWork = useCallback(() => {
    const state = builderStateRef.current;
    if (!state?.itinerary?._id) return false;
    // Already sent to the traveler — it must not be written back as a draft.
    if (finalizedRef.current) return false;
    const days = Array.isArray(state.daysData) ? state.daysData : [];
    if (days.length === 0) return false;
    return (
      serializeBuilderState(days, state.extraFields, state.itinerary) !== savedSnapshotRef.current
    );
  }, []);

  const autoSaveDraft = useCallback(
    (useKeepalive = false) => {
      if (!hasUnsavedWork()) return;
      if (autoSaveInFlightRef.current) return;

      const state = builderStateRef.current;
      const cleanedExtraFields = (state.extraFields || []).filter(
        (f) => String(f.label || "").trim() || String(f.value || "").trim()
      );
      const body = buildPersistBody(state.daysData, cleanedExtraFields, state.itinerary);
      const snapshot = serializeBuilderState(state.daysData, cleanedExtraFields, state.itinerary);
      const path = `/itineraries/${state.itinerary._id}/days`;

      if (useKeepalive) {
        // The page is going away: axios/XHR would be cancelled, a keepalive fetch is not.
        const previousSnapshot = savedSnapshotRef.current;
        try {
          const token = getAuthToken();
          savedSnapshotRef.current = snapshot;
          fetch(`${getApiBaseUrl()}${path}`, {
            method: "PUT",
            keepalive: true,
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}`, "x-auth-token": token } : {}),
            },
            body: JSON.stringify(body),
          })
            .then((res) => {
              // If the page survived (tab backgrounded rather than closed) and the write
              // failed, restore the dirty marker so the next exit retries.
              if (!res.ok && savedSnapshotRef.current === snapshot) {
                savedSnapshotRef.current = previousSnapshot;
              }
            })
            .catch(() => {
              if (savedSnapshotRef.current === snapshot) {
                savedSnapshotRef.current = previousSnapshot;
              }
            });
        } catch {
          savedSnapshotRef.current = previousSnapshot;
        }
        return;
      }

      const itineraryId = String(state.itinerary._id);
      autoSaveInFlightRef.current = true;
      const request = api
        .put(path, body)
        .then((res) => {
          savedSnapshotRef.current = snapshot;
          // The exit auto-save just turned this into a draft. Announce it so New
          // Requests drops it and Drafts picks it up without a manual refresh.
          notifyItineraryWorkflowChanged();
          return res;
        })
        .catch((err) => {
          console.error("Auto-saving itinerary draft failed", err);
        })
        .finally(() => {
          autoSaveInFlightRef.current = false;
          if (pendingDraftSaves.get(itineraryId) === request) {
            pendingDraftSaves.delete(itineraryId);
          }
        });
      // Published so a remount of the builder waits for this write before re-reading.
      pendingDraftSaves.set(itineraryId, request);
    },
    [hasUnsavedWork]
  );

  useEffect(() => {
    // Page-level exits: refresh, tab/browser close, backgrounding on mobile.
    const saveOnExit = () => autoSaveDraft(true);
    const saveOnHide = () => {
      if (document.visibilityState === "hidden") autoSaveDraft(true);
    };
    window.addEventListener("pagehide", saveOnExit);
    window.addEventListener("beforeunload", saveOnExit);
    document.addEventListener("visibilitychange", saveOnHide);

    return () => {
      window.removeEventListener("pagehide", saveOnExit);
      window.removeEventListener("beforeunload", saveOnExit);
      document.removeEventListener("visibilitychange", saveOnHide);
      // In-app exit: Back button, switching sections, session end.
      autoSaveDraft(false);
    };
  }, [autoSaveDraft]);

  // ── Summary calculations ─────────────────────────────────────────────────────

  const hotelData = itinerary?.controlPanel?.hotelId;
  const nights = nightsBetween(itinerary?.startDate, itinerary?.endDate);
  const tripDays = calendarDaysBetween(itinerary?.startDate, itinerary?.endDate);
  const rooms = itinerary?.controlPanel?.numberOfRooms || 1;
  const hotelCost = hotelData?.pricePerNight ? hotelData.pricePerNight * nights * rooms : 0;
  const upliftRaw = itinerary?.controlPanel?.budgetUplift ?? 15;
  const upliftPct = Math.min(Math.max(
    (upliftRaw > 0 && upliftRaw < 1) ? upliftRaw : (Number(upliftRaw) / 100),
    0
  ), 1);

  const customCosts = Array.isArray(itinerary?.controlPanel?.customCosts)
    ? itinerary.controlPanel.customCosts
    : [];
  const customCostLines = customCosts
    .map((c) => {
      const amount = Number(c?.amount) || 0;
      if (!amount) return null;
      const days = Math.max(1, tripDays || 1);
      const total = c?.unit === "per_day" ? amount * days : amount;
      const unitLabel = c?.unit === "per_day" ? ` ($${amount}/day × ${days})` : "";
      return {
        id: c?.id || c?.label,
        label: `${c?.label || "Custom cost"}${unitLabel}`,
        total,
      };
    })
    .filter(Boolean);
  const customCostsTotal = customCostLines.reduce((sum, c) => sum + c.total, 0);

  const activitiesTotal = useMemo(() =>
    daysData.reduce((sum, d) =>
      sum + (d.activities || []).reduce((s, a) => s + (Number(a.price) || 0), 0), 0),
    [daysData]);

  const totalActivitiesCount = useMemo(() =>
    daysData.reduce((sum, d) => sum + (d.activities || []).length, 0),
    [daysData]);

  const baseBudget = itinerary?.budget || parseBudgetValue(request?.tripDetails?.budget || request?.amount) || 0;
  const maxAllowedTotalBudget = baseBudget > 0 ? Math.floor(baseBudget * (1 + upliftPct)) : 0;
  const grandTotal = activitiesTotal + hotelCost + customCostsTotal;
  const isWithinBaseBudget = baseBudget > 0 ? grandTotal <= baseBudget : true;
  const isWithinTolerance = baseBudget > 0 ? grandTotal <= maxAllowedTotalBudget : true;

  const currentDay = daysData[activeDay] || null;

  // Generated itineraries are held in the editor until the supplier picks an action,
  // so surface whether there is still unsaved work.
  const hasUnsavedEdits = useMemo(() => {
    if (daysData.length === 0 || finalizedRef.current) return false;
    return serializeBuilderState(daysData, extraFields, itinerary) !== savedSnapshotRef.current;
  }, [daysData, extraFields, itinerary]);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  darkMode ? "border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                title="Back to Requests"
              >
                <ArrowLeft className="w-4 h-4" />
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
                {hasUnsavedEdits && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${darkMode ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700"}`}>
                    Unsaved
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowControlPanel(prev => !prev)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showControlPanel
                  ? (darkMode ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-amber-50 border-[#a26e35] text-[#a26e35]")
                  : (darkMode ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-gray-300 text-slate-600 hover:bg-gray-100")
              }`}
            >
              {showControlPanel ? "Hide Control Panel" : "Show Control Panel"}
            </button>
            <button
              type="button"
              onClick={() => setShowActivitiesPool(prev => !prev)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showActivitiesPool
                  ? (darkMode ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-amber-50 border-[#a26e35] text-[#a26e35]")
                  : (darkMode ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-gray-300 text-slate-600 hover:bg-gray-100")
              }`}
            >
              {showActivitiesPool ? "Hide Activities Pool" : "Show Activities Pool"}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving || submitting || !itinerary}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors border ${
                saving ? "opacity-60 cursor-not-allowed" : ""
              } ${darkMode ? "border-slate-600 text-white hover:bg-slate-800" : "border-gray-300 text-slate-800 hover:bg-gray-50"}`}
            >
              {saving ? "Saving…" : saveMsg === "Draft saved" ? "Draft saved" : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={handleSubmitToTraveler}
              disabled={saving || submitting || !itinerary}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors ${
                submitting ? "opacity-60 cursor-not-allowed" : ""
              } ${saveMsg === "Submitted to traveller" ? "bg-emerald-600 text-white" : "bg-[#a26e35] hover:bg-[#8b5e2d] text-white"}`}
            >
              {submitting ? "Submitting…" : saveMsg === "Submitted to traveller" ? "Submitted!" : "Submit to Traveller"}
            </button>
          </div>
        </div>

        {loadError && (
          <div className={`rounded-2xl border px-4 py-3 mb-4 text-sm ${darkMode ? "bg-rose-950/40 border-rose-900 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
            {loadError}
          </div>
        )}

        {generateError && (
          <div className={`rounded-2xl border px-4 py-3 mb-4 text-sm ${darkMode ? "bg-rose-950/40 border-rose-900 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
            {generateError}
            {/* Only offer a retry while there is nothing on screen to lose. Once days
                exist, regenerating would discard the itinerary under review. */}
            {itinerary?._id && daysData.length === 0 && !generating && (
              <button
                type="button"
                onClick={() => triggerGenerate(itinerary, { genMode: "ai" })}
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
          <div className={`${(showControlPanel || showActivitiesPool) ? "lg:col-span-2" : "lg:col-span-3"} space-y-4`}>

            {/* Vertical Days List View */}
            {daysData.map((day, idx) => (
              <div
                key={idx}
                id={`day-${idx}`}
                data-droppable="true"
                className={`${cardCls} px-4 py-4`}
              >
                {/* Day header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {daysData.length > 1 && (
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveDayUp(idx)}
                          className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                            darkMode ? "hover:bg-amber-600 hover:text-white text-slate-400 disabled:opacity-20" : "hover:bg-amber-500 hover:text-white text-gray-400 disabled:opacity-20"
                          }`}
                          title="Move day up in itinerary"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === daysData.length - 1}
                          onClick={() => moveDayDown(idx)}
                          className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                            darkMode ? "hover:bg-amber-600 hover:text-white text-slate-400 disabled:opacity-20" : "hover:bg-amber-500 hover:text-white text-gray-400 disabled:opacity-20"
                          }`}
                          title="Move day down in itinerary"
                        >
                          ▼
                        </button>
                      </div>
                    )}
                    <div>
                      <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                        Day {day.day}
                        {day.dayName && ` — ${day.dayName}`}
                        {day.isArrivalDay && " ✈"}
                        {day.isDepartureDay && " 🛫"}
                      </h2>
                      {day.date && (
                        <p className={`text-[11px] mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                          {fmtDate(day.date)}
                        </p>
                      )}
                    </div>
                  </div>
                  {daysData.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDay(idx)}
                      className={`text-[10px] px-2 py-1 rounded-lg ${darkMode ? "text-red-400 hover:bg-slate-800" : "text-red-500 hover:bg-red-50"}`}
                    >
                      Remove day
                    </button>
                  )}
                </div>

                <DayColumn
                  day={day}
                  darkMode={darkMode}
                  isActive={overDayIndex === idx}
                  onRemoveActivity={removeActivityFromDay}
                  onChangeActivity={changeActivityField}
                  onUpdateDayNote={updateDayNote}
                  onMoveActivityUp={handleMoveActivityUp}
                  onMoveActivityDown={handleMoveActivityDown}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addDay}
              className={`w-full rounded-xl border border-dashed py-2 text-xs font-medium flex items-center justify-center gap-1 ${
                darkMode ? "border-slate-700 text-slate-400 hover:bg-slate-900" : "border-gray-300 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Add day
            </button>

            {/* Extra fields */}
            <div className={`${cardCls} px-4 py-4 space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                  Extra Fields
                </h3>
                <button
                  type="button"
                  onClick={() => setExtraFields((prev) => [...prev, newExtraField()])}
                  className="text-[11px] font-semibold text-[#a26e35] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add field
                </button>
              </div>
              {extraFields.length === 0 && (
                <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                  Add custom label/value pairs for the traveller itinerary.
                </p>
              )}
              {extraFields.map((field, idx) => (
                <div key={field.id || idx} className="flex gap-2 items-start">
                  <input
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"}`}
                    placeholder="Field name"
                    value={field.label || ""}
                    onChange={(e) =>
                      setExtraFields((prev) =>
                        prev.map((f, i) => (i === idx ? { ...f, label: e.target.value } : f))
                      )
                    }
                  />
                  <input
                    className={`flex-[1.4] rounded-lg border px-2 py-1.5 text-xs ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"}`}
                    placeholder="Value"
                    value={field.value || ""}
                    onChange={(e) =>
                      setExtraFields((prev) =>
                        prev.map((f, i) => (i === idx ? { ...f, value: e.target.value } : f))
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setExtraFields((prev) => prev.filter((_, i) => i !== idx))}
                    className={`p-1.5 rounded-lg ${darkMode ? "text-red-400 hover:bg-slate-800" : "text-red-500 hover:bg-red-50"}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

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
                <Row label="Base Budget" value={baseBudget ? `$${baseBudget.toLocaleString()}` : "Flexible"} dark={darkMode} />
                {upliftPct > 0 && baseBudget > 0 && (
                  <Row label={`Budget Tolerance (+${Math.round(upliftPct * 100)}%)`} value={`Max $${maxAllowedTotalBudget.toLocaleString()}`} dark={darkMode} />
                )}
                <Row label="Hotel" value={hotelData?.name || "Not selected"} dark={darkMode} />
                <Row label="Transportation" value="Included in itinerary" dark={darkMode} />
                {hotelCost > 0 && <Row label={`Hotel (${nights} nights × ${rooms} rooms)`} value={`$${hotelCost.toLocaleString()}`} dark={darkMode} />}
                <Row label="Activities Cost" value={`$${activitiesTotal.toLocaleString()}`} dark={darkMode} />
                {customCostLines.map((line) => (
                  <Row key={line.id} label={line.label} value={`$${line.total.toLocaleString()}`} dark={darkMode} />
                ))}
                <div className={`border-t pt-2 mt-1 flex justify-between items-center font-bold text-sm ${darkMode ? "border-slate-700 text-white" : "border-gray-100 text-slate-900"}`}>
                  <span>Total Calculated Cost</span>
                  <span>${grandTotal.toLocaleString()}</span>
                </div>
                {baseBudget > 0 && (
                  <div className="pt-1 flex justify-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isWithinBaseBudget ? "bg-emerald-100 text-emerald-800" : isWithinTolerance ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {isWithinBaseBudget ? "✓ Within Base Budget" : isWithinTolerance ? `✓ Within +${Math.round(upliftPct * 100)}% Tolerance` : "⚠ Budget Exceeded"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {submitError && (
              <div className={`rounded-xl border px-3 py-2 text-xs ${darkMode ? "bg-rose-950/40 border-rose-900 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
                {submitError}
              </div>
            )}

            {/* Save / Submit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving || submitting || !itinerary}
                className={`w-full rounded-full py-3 text-sm font-semibold transition-colors border ${
                  saving ? "opacity-60 cursor-not-allowed" : ""
                } ${darkMode ? "border-slate-600 text-white hover:bg-slate-800" : "border-gray-300 text-slate-800 hover:bg-gray-50"}`}
              >
                {saving ? "Saving…" : saveMsg === "Draft saved" ? "Draft saved" : "Save as Draft"}
              </button>
              <button
                type="button"
                onClick={handleSubmitToTraveler}
                disabled={saving || submitting || !itinerary}
                className={`w-full rounded-full py-3 text-sm font-semibold transition-colors ${
                  submitting ? "opacity-60 cursor-not-allowed" : ""
                } ${saveMsg === "Submitted to traveller" ? "bg-emerald-600 text-white" : "bg-[#a26e35] hover:bg-[#8b5e2d] text-white"}`}
              >
                {submitting ? "Submitting…" : saveMsg === "Submitted to traveller" ? "Submitted!" : "Submit to Traveller"}
              </button>
            </div>
          </div>

          {/* ── Right: control panel + original request + activity pool ──────────────────────── */}
          {(showControlPanel || showActivitiesPool) && (
            <div className="space-y-4 lg:sticky lg:top-4 self-start">
              {showControlPanel && (
                <>
                  <ItineraryControlPanel
                    key={itinerary?._id || request?.id || request?._id}
                    darkMode={darkMode}
                    itinerary={itinerary}
                    request={request}
                    onChange={handleControlPanelChange}
                  />

                  <div className={`${cardCls} px-4 py-4 space-y-2`}>
                    <h3 className={`text-sm font-semibold flex items-center gap-1.5 ${darkMode ? "text-white" : "text-slate-900"}`}>
                      <CalendarDays className="w-4 h-4 text-[#a26e35]" /> Original Request
                    </h3>
                    <Row label="Destination" value={request?.tripDetails?.destination || request?.destination || request?.location || itinerary?.destination || "—"} dark={darkMode} />
                    <Row label="Arrival" value={fmtDate(request?.tripDetails?.arrivalDate || request?.tripDetails?.startDate || request?.arrivalDate) || "—"} dark={darkMode} />
                    <Row label="Departure" value={fmtDate(request?.tripDetails?.departureDate || request?.tripDetails?.endDate || request?.departureDate) || "—"} dark={darkMode} />
                    <Row label="Travelers" value={request?.tripDetails?.guests || request?.guests || request?.travelers || "—"} dark={darkMode} />
                    <Row label="Budget" value={request?.tripDetails?.budget || request?.amount || "—"} dark={darkMode} />
                    <Row label="Customer" value={request?.name || request?.contactDetails?.firstName || request?.email || "—"} dark={darkMode} />
                    {(request?.tripDetails?.notes || request?.notes || request?.tripDetails?.requirements || request?.message) && (
                      <div className={`text-[11px] pt-2 border-t ${darkMode ? "border-slate-700 text-slate-300" : "border-gray-100 text-gray-700"}`}>
                        <p className={`font-medium mb-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>Notes / Requirements</p>
                        <p className="whitespace-pre-wrap">
                          {request?.tripDetails?.notes || request?.notes || request?.tripDetails?.requirements || request?.message}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {showActivitiesPool && (
                <ItineraryActivityPool
                  darkMode={darkMode}
                  itinerary={itinerary}
                  assignedActivityIds={assignedActivityIds}
                />
              )}
            </div>
          )}
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
