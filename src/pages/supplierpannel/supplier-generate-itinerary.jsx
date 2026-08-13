import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { CalendarDays, GripVertical, Plus, Trash2, ArrowLeft, Coffee, Car } from "lucide-react";
import api, { getApiBaseUrl, getAuthToken } from "../../api";
import { notifyItineraryWorkflowChanged } from "../../constants/itineraryLabels";
import { countActivities, sumActivityPrices, isBreakEntry } from "../../utils/activityClassification";
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

/**
 * A schedule break (lunch/rest) inside a day.
 *
 * Breaks were previously rendered with the full activity card — time inputs, a price
 * field and a rank badge — which is wrong on every count: a break is not ranked, not
 * priced, and its window is derived from the Control Panel's duration rather than typed
 * per day. It is shown read-only, as the duration the supplier configured.
 */
function ScheduleBreakRow({ activity, darkMode }) {
  const minutes = breakMinutes(activity);
  return (
    <div
      className={`rounded-xl border border-dashed px-3 py-2 flex items-center gap-2 text-[11px] ${
        darkMode ? "bg-slate-800/40 border-slate-700 text-slate-400" : "bg-amber-50/60 border-amber-200 text-amber-800"
      }`}
    >
      <Coffee className="h-3.5 w-3.5 shrink-0" />
      <span className="font-semibold">{activity.title || "Lunch Break"}</span>
      <span className="opacity-70">·</span>
      <span>{minutes} min</span>
      <span className={`ml-auto text-[10px] ${darkMode ? "text-slate-500" : "text-amber-700/70"}`}>
        Set by the Control Panel
      </span>
    </div>
  );
}

/**
 * The journey between two consecutive stops.
 *
 * Travel time is reserved in the schedule, which leaves a gap between one activity
 * ending and the next beginning. Unlabelled, that gap just looks like a scheduling bug —
 * this says what it is.
 */
function TravelLegRow({ minutes, darkMode }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
      <Car className="h-3 w-3 shrink-0" />
      <span>{minutes} min travel</span>
      <span className="flex-1 border-t border-dashed border-current opacity-30" />
    </div>
  );
}

/** Break length in minutes, from its window. */
function breakMinutes(activity) {
  const toMin = (t) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || "").trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const start = toMin(activity?.startTime);
  const end = toMin(activity?.endTime);
  if (start === null || end === null || end <= start) return 60;
  return end - start;
}

// ─── Sortable activity card inside a day ─────────────────────────────────────

function SortableActivityCard({ activity, activityIndex, dayIndex, darkMode, onRemove, onChange, onMoveUp, onMoveDown }) {
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
      <div className="flex flex-col justify-center items-center px-1.5 py-1 border-r border-slate-100 dark:border-slate-700/60 shrink-0 bg-slate-50/50 dark:bg-slate-900/30" onPointerDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMoveUp?.(activity.id, dayIndex); }}
          className={`p-1 rounded hover:bg-amber-500 hover:text-white transition-colors text-xs font-bold ${darkMode ? "text-slate-400" : "text-gray-500"}`}
          title="Move activity UP in rank position"
        >
          ▲
        </button>

        <span className="text-[10px] font-bold px-1.5 py-0.5 my-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          #{Number.isInteger(activityIndex) ? activityIndex + 1 : 1}
        </span>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMoveDown?.(activity.id, dayIndex); }}
          className={`p-1 rounded hover:bg-amber-500 hover:text-white transition-colors text-xs font-bold ${darkMode ? "text-slate-400" : "text-gray-500"}`}
          title="Move activity DOWN in rank position"
        >
          ▼
        </button>
      </div>

      <div className="shrink-0 w-16 h-16 relative">
        <img
          src={resolveImageUrl(activity.image) || "/assets/dest-1.jpeg"}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute bottom-0 inset-x-0 bg-black/40 text-white flex items-center justify-center cursor-grab active:cursor-grabbing py-0.5`}
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <GripVertical className="h-3 w-3" />
        </div>
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
          <div className="relative w-16">
            <span className="absolute left-1.5 top-1 text-[10px] text-gray-400 pointer-events-none">$</span>
            <input
              type="text"
              inputMode="numeric"
              className={`${inputCls} pl-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              value={activity.price ?? ""}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                setField("price", val ? Number(val) : 0);
              }}
              placeholder="0"
            />
          </div>
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
  // Breaks are never billable, so they must not appear in the day's total.
  const dayTotal = activities
    .filter((a) => !isBreakEntry(a))
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  // Rank badges number the real activities only — a lunch break is not "#3".
  const activityRanks = new Map(
    activities.filter((a) => !isBreakEntry(a)).map((a, i) => [a.id, i])
  );

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
        <SortableContext items={activities.filter((a) => !isBreakEntry(a)).map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {activities.map((act) => {
            if (isBreakEntry(act)) {
              return <ScheduleBreakRow key={act.id} activity={act} darkMode={darkMode} />;
            }
            const travel = Number(act.travelFromPreviousMinutes) || 0;
            return (
              <Fragment key={act.id}>
                {travel > 0 && <TravelLegRow minutes={travel} darkMode={darkMode} />}
              <SortableActivityCard
                activity={act}
                activityIndex={activityRanks.get(act.id) ?? 0}
                dayIndex={day.day - 1}
                darkMode={darkMode}
                onRemove={onRemoveActivity}
                onChange={onChangeActivity}
                onMoveUp={onMoveActivityUp}
                onMoveDown={onMoveActivityDown}
              />
              </Fragment>
            );
          })}
        </SortableContext>
        {activities.length === 0 && (
          <p className={`text-[11px] text-center py-4 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
            Drag activities here
          </p>
        )}
      </div>

      {Number(day.overrunMinutes) > 0 && (
        <p className={`text-[10px] mt-1 ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
          Runs {day.overrunMinutes} min past your activity end time — travel between stops
          does not fit the configured window.
        </p>
      )}

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
  const [geoNotice, setGeoNotice] = useState("");
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

  /**
   * Apply the configuration the supplier set on the "Proceed to create itinerary" screen.
   *
   * That screen carries its own Control Panel, and its values arrive here on
   * `overviewItinerary.controlPanel`. They were only used when a brand-new itinerary was
   * created — for a request that already had one, the stored record won and the
   * supplier's changes (lunch duration, activity hours, arrival/departure, uplift) were
   * silently dropped before generation ever ran.
   */
  function withOverviewControlPanel(record) {
    const overviewCp = overviewItinerary?.controlPanel;
    if (!record || !overviewCp || typeof overviewCp !== "object") return record;

    // Only fields the supplier actually set; `undefined` must not blank stored values.
    const provided = Object.fromEntries(
      Object.entries(overviewCp).filter(([, v]) => v !== undefined)
    );
    if (Object.keys(provided).length === 0) return record;

    return {
      ...record,
      startDate: overviewItinerary?.startDate || record.startDate,
      endDate: overviewItinerary?.endDate || record.endDate,
      controlPanel: { ...(record.controlPanel || {}), ...provided },
    };
  }

  async function triggerGenerate(itin, { genMode = mode } = {}) {
    if (!itin?._id) return;
    setGenerating(true);
    setGenerateError("");
    try {
      // Send the Control Panel exactly as the supplier has it on screen. Their config may
      // not be saved yet, and generation must be driven by what they configured — not by
      // whatever the database still holds.
      const liveControlPanel = serializeControlPanel(itin);

      // `persist` is intentionally omitted: the server returns the generated plan without
      // writing it. The itinerary only becomes a draft when the supplier saves it, sends
      // it, or leaves the builder with unsaved work.
      const res = await api.post(`/itineraries/${itin._id}/generate`, {
        mode: genMode,
        controlPanel: liveControlPanel,
        startDate: toDateString(itin?.startDate) || null,
        endDate: toDateString(itin?.endDate) || null,
      });
      const updated = res.data.itinerary || res.data;
      const generatedDays = Array.isArray(updated.days) ? updated.days : [];

      // Merge, never replace. Assigning the server document wholesale used to overwrite
      // the supplier's unsaved Control Panel with the persisted copy — which is why the
      // panel appeared to "reset" after generating and the summary showed stale values
      // (a deliberate Uplift = 0 coming back as the 15% default).
      setItinerary((prev) => ({
        ...updated,
        startDate: prev?.startDate ?? updated.startDate,
        endDate: prev?.endDate ?? updated.endDate,
        controlPanel: prev?.controlPanel
          ? {
              ...prev.controlPanel,
              // Keep the hotel object the server populated so pricing can still resolve,
              // but only when the supplier has not picked a different one.
              hotelId:
                (prev.controlPanel.hotelId?._id || prev.controlPanel.hotelId) ===
                (updated.controlPanel?.hotelId?._id || updated.controlPanel?.hotelId)
                  ? updated.controlPanel?.hotelId ?? prev.controlPanel.hotelId
                  : prev.controlPanel.hotelId,
            }
          : updated.controlPanel,
      }));
      setDaysData(updateDaysData(generatedDays));
      setExtraFields(Array.isArray(updated.extraFields) ? updated.extraFields : []);
      // Explain how the Control Panel constrained the result, so an empty or thin plan
      // is never a mystery. A zero ceiling is the common case: accommodation and fixed
      // costs have consumed the traveller's whole budget and the uplift left no headroom.
      const budgetInfo = res.data?.budget;
      if (budgetInfo?.exhaustedByFixedCosts) {
        setGeoNotice(
          `No activities could be scheduled: hotel ($${budgetInfo.hotelCost.toLocaleString()}) and custom costs ` +
          `($${budgetInfo.customCostsTotal.toLocaleString()}) already use the whole $${budgetInfo.maxAllowedTotalBudget.toLocaleString()} ` +
          `ceiling at ${budgetInfo.upliftPercent}% uplift. Raise the uplift, lower the accommodation cost, or reduce custom costs.`
        );
      } else {
        // Surface any day the server had to reorganize for geographic feasibility.
        const geo = res.data?.geography;
        if (geo?.geographyRepaired) {
          setGeoNotice("Some days were regrouped so activities in the same day stay in the same area.");
        } else if (geo?.geographyIssues?.length) {
          setGeoNotice(geo.geographyIssues[0].message);
        } else {
          setGeoNotice("");
        }
      }
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
        // What the supplier configured on the previous screen takes precedence over the
        // stored copy, so generation below runs with their settings.
        const itin = withOverviewControlPanel(await resolveItineraryRecord());
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

  /**
   * Pick the best representation of the chosen hotel.
   *
   * Prefers a freshly resolved object, then a previously resolved object for the same id,
   * and only then the bare id.
   */
  function resolveHotelValue(previous, selectedHotel, nextId) {
    if (selectedHotel) return selectedHotel;
    if (!nextId) return nextId ?? null;
    const previousId = previous?._id || previous;
    if (previous && typeof previous === "object" && String(previousId) === String(nextId)) {
      return previous;
    }
    return nextId;
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
          // Keep the resolved hotel OBJECT — the summary needs `pricePerNight`. The
          // lookup can transiently miss (the hotel list loads asynchronously), so fall
          // back to the object already held for the same id rather than downgrading to a
          // bare string and silently zeroing the hotel cost.
          hotelId: resolveHotelValue(prev.controlPanel?.hotelId, selectedHotel, updatedCp.hotelId),
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
      // Saving previously left the supplier sitting on the same screen with only a
      // transient label, so it was impossible to tell whether anything had happened.
      // Confirm briefly, then return to the requests list where the draft now appears.
      setTimeout(() => {
        setSaveMsg("");
        if (onGoToBookings) onGoToBookings();
      }, 900);
    } catch (err) {
      console.error("Save failed", err);
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        "Could not save the draft. Please try again.";
      // Surface the reason instead of a bare "Save failed" that disappears.
      setSubmitError(msg);
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

  // Breaks (lunch, rest, free time) are scheduling placeholders, not activities, so they
  // are excluded from both the count and the price total. A day showing
  // "Pyramids / Museum / Lunch Break / Nile Cruise" counts as 3 activities, not 4.
  const activitiesTotal = useMemo(() => sumActivityPrices(daysData), [daysData]);

  const totalActivitiesCount = useMemo(() => countActivities(daysData), [daysData]);

  const baseBudget = itinerary?.budget || parseBudgetValue(request?.tripDetails?.budget || request?.amount) || 0;
  const maxAllowedTotalBudget = baseBudget > 0 ? Math.floor(baseBudget * (1 + upliftPct)) : 0;
  const grandTotal = activitiesTotal + hotelCost + customCostsTotal;
  const isWithinBaseBudget = baseBudget > 0 ? grandTotal <= baseBudget : true;
  const isWithinTolerance = baseBudget > 0 ? grandTotal <= maxAllowedTotalBudget : true;

  const currentDay = daysData[activeDay] || null;

  /**
   * The traveller's adjustment request, if there is one.
   *
   * It lives on the booking, which arrives here as the `request` prop. Only surfaced when
   * the card actually carries content — an empty card is not a request.
   */
  const adjustmentRequest = useMemo(() => {
    const card = request?.adjustmentCard;
    if (!card || typeof card !== "object") return null;
    const hasContent = [card.title, card.description, card.location, card.cost, card.imageDataUrl]
      .some((v) => String(v || "").trim());
    if (!hasContent) return null;
    return { card, requestedAt: request?.adjustmentRequestedAt || null };
  }, [request?.adjustmentCard, request?.adjustmentRequestedAt]);

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

        {/* What the traveller actually asked to change. "View Adjustment" navigated here
            but nothing ever rendered the card, so the supplier arrived at the builder
            with no idea what had been requested. */}
        {adjustmentRequest && (
          <div className={`rounded-2xl border px-4 py-4 mb-4 ${darkMode ? "bg-rose-950/20 border-rose-900/50" : "bg-rose-50 border-rose-200"}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className={`text-sm font-semibold ${darkMode ? "text-rose-300" : "text-rose-800"}`}>
                Adjustment requested by the traveller
              </h3>
              {adjustmentRequest.requestedAt && (
                <span className={`text-[11px] shrink-0 ${darkMode ? "text-rose-400/70" : "text-rose-600"}`}>
                  {fmtDate(adjustmentRequest.requestedAt) || new Date(adjustmentRequest.requestedAt).toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex gap-3 flex-col sm:flex-row">
              {adjustmentRequest.card.imageDataUrl && (
                <img
                  src={adjustmentRequest.card.imageDataUrl}
                  alt="Traveller reference"
                  className="w-full sm:w-32 h-24 object-cover rounded-lg border border-black/5 shrink-0"
                />
              )}
              <div className="flex-1 space-y-1">
                {adjustmentRequest.card.title && (
                  <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {adjustmentRequest.card.title}
                  </p>
                )}
                {adjustmentRequest.card.description && (
                  <p className={`text-xs whitespace-pre-wrap ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                    {adjustmentRequest.card.description}
                  </p>
                )}
                <div className={`flex flex-wrap gap-x-4 gap-y-1 text-[11px] pt-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {adjustmentRequest.card.location && <span>Location: <strong>{adjustmentRequest.card.location}</strong></span>}
                  {adjustmentRequest.card.cost && <span>Budget: <strong>{adjustmentRequest.card.cost}</strong></span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {geoNotice && (
          <div className={`rounded-2xl border px-4 py-3 mb-4 text-sm ${darkMode ? "bg-amber-950/30 border-amber-900/50 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
            {geoNotice}
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
                {/* Shown even at 0%. Hiding the row when the uplift was zero made a
                    deliberate "no tolerance" look like the setting had been ignored. */}
                {baseBudget > 0 && (
                  <Row
                    label={upliftPct > 0 ? `Budget Tolerance (+${Math.round(upliftPct * 100)}%)` : "Budget Tolerance (0% — none)"}
                    value={`Max $${maxAllowedTotalBudget.toLocaleString()}`}
                    dark={darkMode}
                  />
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
                    // Keyed on the request: `itinerary` resolves asynchronously, and
                    // keying on its id remounted the panel mid-edit and reset it.
                    key={request?.id || request?._id || "control-panel"}
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
