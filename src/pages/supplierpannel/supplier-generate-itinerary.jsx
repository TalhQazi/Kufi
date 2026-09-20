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
import { CalendarDays, GripVertical, Plus, Trash2, ArrowLeft, Coffee, Car, BedDouble } from "lucide-react";
import api, { activityImagePath, AI_GENERATE_TIMEOUT_MS, getApiBaseUrl, getAuthToken, resolveActivityImage } from "../../api";
import { notifyItineraryWorkflowChanged } from "../../constants/itineraryLabels";
import { countActivities, sumActivityPrices, isBreakEntry, mergeActivitiesWithBreaks, sortDayActivitiesByTime } from "../../utils/activityClassification";
import {
  assessActivityAgainstDay,
  formatTravelWarning,
  getCoordinates,
} from "../../utils/itineraryGeo";
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
import { normalizeHotelStays, hotelCostFromStays } from "../../utils/hotelStays";
import {
  customCostLines as buildCustomCostLines,
  partyActivityCost,
  perTravellerCeiling,
} from "../../utils/tripCosts";


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
  const hotelStays = (Array.isArray(cp.hotelStays) ? cp.hotelStays : [])
    .map((s) => ({
      id: s.id,
      hotelId: s.hotelId?._id || s.hotelId || null,
      area: s.area || "",
      nights: Number(s.nights) || 0,
    }))
    .filter((s) => s.hotelId);
  return { ...cp, hotelId: hotelId || null, hotelStays };
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
  const windowLabel =
    activity?.startTime && activity?.endTime
      ? `${fmtTime(activity.startTime)} – ${fmtTime(activity.endTime)}`
      : null;
  return (
    <div
      className={`rounded-xl border border-dashed px-3 py-2 flex items-center gap-2 text-[11px] ${
        darkMode ? "bg-slate-800/40 border-slate-700 text-slate-400" : "bg-amber-50/60 border-amber-200 text-amber-800"
      }`}
    >
      <Coffee className="h-3.5 w-3.5 shrink-0" />
      <span className="font-semibold">{activity.title || "Lunch Break"}</span>
      <span className="opacity-70">·</span>
      <span>{minutes} min{windowLabel ? ` · ${windowLabel}` : ""}</span>
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
/** Which record to point at when a leg cannot be measured. */
const TRAVEL_UNKNOWN_TEXT = {
  self: "Travel time unavailable — this activity has no location set",
  previous: "Travel time unavailable — the previous activity has no location set",
  origin: "Travel time from the hotel unavailable — the hotel has no location set",
};

function TravelLegRow({ minutes, fromOrigin, unknownReason, darkMode }) {
  // An unmeasurable leg is not a zero-minute leg. Naming the record that is actually
  // missing a position matters: blaming the activity when the HOTEL is unlocated sends
  // the supplier to edit a row that was never the problem.
  if (unknownReason) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 text-[10px] ${darkMode ? "text-amber-500/70" : "text-amber-600/80"}`}>
        <Car className="h-3 w-3 shrink-0" />
        <span>{TRAVEL_UNKNOWN_TEXT[unknownReason] || TRAVEL_UNKNOWN_TEXT.self}</span>
        <span className="flex-1 border-t border-dashed border-current opacity-30" />
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 px-3 py-1 text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
      <Car className="h-3 w-3 shrink-0" />
      <span>
        {minutes > 0
          ? `${minutes} min travel${fromOrigin ? " from hotel" : ""}`
          : `Same location · 0 min travel${fromOrigin ? " from hotel" : ""}`}
      </span>
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
  const photo = resolveActivityImage(activity);

  const setField = (field, value) => onChange?.(activity.id, dayIndex, field, value);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border overflow-hidden flex gap-0 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100 shadow-sm"}`}
    >
      <div className="shrink-0 w-28 self-stretch min-h-[3rem] relative bg-slate-200 overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={activity.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        <div
          className={`absolute bottom-0 inset-x-0 bg-black/40 text-white flex items-center justify-center cursor-grab active:cursor-grabbing py-0.5`}
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <GripVertical className="h-3 w-3" />
        </div>
      </div>

      <div className="flex-1 px-1.5 py-1 min-w-0 space-y-0.5" onPointerDown={(e) => e.stopPropagation()}>
        <input
          className={inputCls}
          value={activity.title || ""}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Activity title"
        />
        <div className="flex items-center gap-1 flex-wrap">
          <input
            type="time"
            className={`${inputCls} w-[4.75rem]`}
            value={activity.startTime || ""}
            onChange={(e) => setField("startTime", e.target.value)}
          />
          <span className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>–</span>
          <input
            type="time"
            className={`${inputCls} w-[4.75rem]`}
            value={activity.endTime || ""}
            onChange={(e) => setField("endTime", e.target.value)}
          />
          <div className="relative w-14">
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
          placeholder="Location"
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

function DayColumn({ day, darkMode, isActive: isActiveProp, travellers = 1, onRemoveActivity, onChangeActivity, onUpdateDayNote, onMoveActivityUp, onMoveActivityDown }) {
  const activities = Array.isArray(day.activities) ? day.activities : [];
  // Breaks are never billable, so they must not appear in the day's total.
  const dayPerPerson = activities
    .filter((a) => !isBreakEntry(a))
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  // Catalogue prices are per head, so the day's line is what the whole party pays.
  const dayTotal = dayPerPerson * Math.max(1, Number(travellers) || 1);
  const overnight = day.overnightHotel;

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
        className={`flex-1 rounded-lg border border-dashed p-1.5 space-y-1.5 min-h-[56px] transition-colors ${
          isActiveProp
            ? (darkMode ? "border-amber-500 bg-amber-950/20" : "border-[#a26e35] bg-amber-50/50")
            : (darkMode ? "border-slate-700" : "border-gray-200")
        }`}
      >
        <SortableContext items={activities.filter((a) => !isBreakEntry(a)).map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {sortDayActivitiesByTime(activities).map((act) => {
            if (isBreakEntry(act)) {
              return <ScheduleBreakRow key={act.id} activity={act} darkMode={darkMode} />;
            }
            // null means "could not be measured"; 0 means "same place, no distance".
            // The backend only sets a reason when there is something to act on, so a
            // first stop with no hotel selected at all stays quiet.
            const rawTravel = act.travelFromPreviousMinutes;
            const unknownReason = act.travelUnknownReason || null;
            // `null`/`undefined` = the leg could not be measured (a missing coordinate);
            // a number (including 0) = it WAS measured. Show every measured leg, so two
            // stops at the same spot still render an explicit "0 min" row instead of a gap.
            const measured = rawTravel !== null && rawTravel !== undefined;
            const travel = measured ? Number(rawTravel) || 0 : 0;
            return (
              <Fragment key={act.id}>
                {(measured || unknownReason) && (
                  <TravelLegRow
                    minutes={travel}
                    fromOrigin={Boolean(act.travelFromOrigin)}
                    unknownReason={unknownReason}
                    darkMode={darkMode}
                  />
                )}
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

      {/* Where the travellers sleep at the end of this day. The departure day has no
          night, so the backend leaves `overnightHotel` off it. */}
      {overnight?.name && (
        <div
          className={`mt-2 flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] ${
            darkMode
              ? "border-slate-700 bg-slate-800/60 text-slate-300"
              : "border-gray-200 bg-gray-50 text-gray-600"
          }`}
        >
          <BedDouble className="w-3 h-3 shrink-0 opacity-70" />
          <span className="min-w-0">
            <span className="uppercase tracking-wide opacity-70">Overnight</span>{" "}
            <span className="font-medium">{overnight.name}</span>
            {overnight.area ? <span className="opacity-70"> · {overnight.area}</span> : null}
          </span>
        </div>
      )}

      {dayTotal > 0 && (
        <p className={`text-[10px] text-right mt-2 font-medium ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
          Day total: ${dayTotal.toLocaleString()}
          {travellers > 1 ? (
            <span className="font-normal opacity-70"> (${dayPerPerson.toLocaleString()} × {travellers})</span>
          ) : null}
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
  const [budgetBreakdown, setBudgetBreakdown] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [geoNotice, setGeoNotice] = useState("");
  // Staged cross-day move awaiting confirmation, shown as a card instead of window.confirm.
  const [pendingMove, setPendingMove] = useState(null);
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
      }, { timeout: AI_GENERATE_TIMEOUT_MS });
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
      setBudgetBreakdown(budgetInfo || null);
      if (budgetInfo?.fixedOverBudget || budgetInfo?.exhaustedByFixedCosts) {
        // Say which cost overran the budget and by how much. "No activities could be
        // scheduled" on its own left the supplier staring at empty days with no clue
        // that food and transport had eaten the entire trip ceiling.
        const parts = [];
        if (budgetInfo.hotelCost > 0) parts.push(`hotel $${budgetInfo.hotelCost.toLocaleString()}`);
        if (budgetInfo.customCostsTotal > 0) parts.push(`per-trip costs $${budgetInfo.customCostsTotal.toLocaleString()}`);
        setGeoNotice(
          `Fixed costs (${parts.join(" + ") || "hotel and per-trip costs"}) come to ` +
          `$${(budgetInfo.fixedCostsTotal ?? 0).toLocaleString()}, which is ` +
          `$${(budgetInfo.overBudgetBy ?? 0).toLocaleString()} over the ` +
          `$${budgetInfo.maxAllowedTotalBudget.toLocaleString()} trip ceiling. ` +
          (budgetInfo.exhaustedByFixedCosts
            ? "No activities could be scheduled. "
            : `Activities were limited to $${budgetInfo.activityCeiling.toLocaleString()} so the trip is still usable. `) +
          "Check the per-day costs and their units, the trip length, and the number of travellers."
        );
      } else {
        // Surface any day the server had to reorganize for geographic feasibility.
        const geo = res.data?.geography;
        if (geo?.activitiesSpilledToNextDay > 0) {
          setGeoNotice(
            `${geo.activitiesSpilledToNextDay} activit${geo.activitiesSpilledToNextDay === 1 ? "y" : "ies"} did not fit the activity hours and ${geo.activitiesSpilledToNextDay === 1 ? "was" : "were"} moved to the next day.`
          );
        } else if (geo?.areasDiversified) {
          setGeoNotice("Activities were spread across different areas using coordinates so the trip is not stuck in one city.");
        } else if (geo?.geographyRepaired) {
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
      const isTimeout = err?.code === "ECONNABORTED" || /timeout/i.test(String(err?.message || ""));
      const msg = isTimeout
        ? "AI generation is taking longer than usual. Please wait and try again — the server may still be working."
        : (
          err?.response?.data?.msg ||
          err?.response?.data?.error ||
          err?.message ||
          "AI itinerary generation failed."
        );
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

    const resolveDayForActivity = (activity, preferredDayIdx) => {
      const cp = itinerary?.controlPanel || {};
      // Prefer the drop target; if it does not fit activity hours, walk forward to the next day.
      for (let idx = preferredDayIdx; idx < daysData.length; idx++) {
        const day = daysData[idx];
        // Skip locked empty arrival day when startOnArrival is off.
        if (idx === 0 && cp.startOnArrival === false) continue;
        if (idx === daysData.length - 1 && cp.endOnDeparture === false) continue;
        const assessment = assessActivityAgainstDay(activity, day?.activities || [], {
          controlPanel: cp,
          isArrival: idx === 0,
          isDeparture: idx === daysData.length - 1,
        });
        if (!assessment || assessment.fitsInDayHours) {
          return { dayIdx: idx, spilled: idx !== preferredDayIdx, assessment };
        }
      }
      // Nowhere else fits — keep preferred day and let the supplier decide.
      return {
        dayIdx: preferredDayIdx,
        spilled: false,
        assessment: assessActivityAgainstDay(activity, daysData[preferredDayIdx]?.activities || [], {
          controlPanel: cp,
          isArrival: preferredDayIdx === 0,
          isDeparture: preferredDayIdx === daysData.length - 1,
        }),
        overflow: true,
      };
    };

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

      const activityId = String(activity._id || activity.id || "");
      const coords = getCoordinates(activity);
      const candidate = {
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        activityId,
        title: activity.title || "",
        description: activity.description || "",
        location: activity.city || activity.location || activity.country || "",
        image: activityImagePath(activityId) || activity.imageUrl || activity.image || "",
        price: activity.price || 0,
        category: activity.category || "",
        duration: activity.duration || "",
        startTime: activity.startTime || "",
        endTime: activity.endTime || "",
        coordinates: coords || undefined,
        isSupplierOnly: true,
      };

      const placed = resolveDayForActivity(candidate, targetDayIdx);
      setDaysData((prev) => prev.map((d, i) => {
        if (i !== placed.dayIdx) return d;
        return { ...d, activities: [...(d.activities || []), candidate] };
      }));
      if (placed.spilled) {
        const label = daysData[placed.dayIdx]?.dayName || `Day ${placed.dayIdx + 1}`;
        setGeoNotice(
          `"${candidate.title}" did not fit the activity hours on Day ${targetDayIdx + 1}, so it was added to ${label}.`
        );
      } else if (placed.overflow) {
        setGeoNotice(
          `"${candidate.title}" may overrun activity hours (${placed.assessment?.startLabel}–${placed.assessment?.endLabel}) — no later day had room.`
        );
      } else {
        setGeoNotice("");
      }
      return;
    }

    // ── Sorting within / moving between days ──────────────────────────────────
    if (activeData?.source === "day") {
      const fromDayIdx = activeData.dayIndex;
      const overDayIdx = overData?.source === "day" ? overData.dayIndex : fromDayIdx;

      if (fromDayIdx === overDayIdx) {
        // Reorder within same day — if the order no longer fits hours, spill overflow forward.
        setDaysData((prev) => {
          const next = prev.map((d, i) => {
            if (i !== fromDayIdx) return d;
            const acts = [...(d.activities || [])];
            const oldIdx = acts.findIndex((a) => a.id === active.id);
            const newIdx = acts.findIndex((a) => a.id === over.id);
            if (oldIdx < 0 || newIdx < 0) return d;
            return { ...d, activities: arrayMove(acts, oldIdx, newIdx) };
          });
          return spillOverflowInEditor(next, itinerary?.controlPanel || {});
        });
      } else {
        const movedAct = daysData[fromDayIdx]?.activities?.find((a) => a.id === active.id);
        if (!movedAct) return;
        const without = daysData.map((d, i) => (
          i === fromDayIdx
            ? { ...d, activities: (d.activities || []).filter((a) => a.id !== active.id) }
            : d
        ));

        // Assess the drop target as it will look after the activity leaves its old day.
        // This surfaces BOTH problems: the day running out of hours, and the stop being a
        // long transfer from everything else already on that day (the distance the user
        // was not being warned about before).
        const targetLabel = daysData[overDayIdx]?.dayName || `Day ${overDayIdx + 1}`;
        const assessmentOnTarget = assessActivityAgainstDay(
          movedAct,
          (without[overDayIdx]?.activities || []),
          {
            controlPanel: itinerary?.controlPanel || {},
            isArrival: overDayIdx === 0,
            isDeparture: overDayIdx === without.length - 1,
          }
        );
        const warning = formatTravelWarning(assessmentOnTarget, { dayLabel: targetLabel });

        // Commits the move to the target day and records a follow-up notice.
        const commitMove = () => {
          setDaysData(
            without.map((d, i) => (
              i === overDayIdx
                ? { ...d, activities: [...(d.activities || []), { ...movedAct }] }
                : d
            ))
          );
          if (warning) {
            setGeoNotice(
              assessmentOnTarget?.fitsInDayHours
                ? `Heads up: "${movedAct.title}" is ~${assessmentOnTarget.nearestKm} km from the other stops on ${targetLabel}.`
                : `"${movedAct.title}" may overrun ${targetLabel}'s activity hours (${assessmentOnTarget?.startLabel}–${assessmentOnTarget?.endLabel}).`
            );
          } else {
            setGeoNotice("");
          }
        };

        // A far move or an over-hours move now asks first — in a styled card, not a
        // browser confirm(). If there is nothing to warn about, move immediately.
        if (warning) {
          setPendingMove({
            title: movedAct.title || "this activity",
            fromLabel: daysData[fromDayIdx]?.dayName || `Day ${fromDayIdx + 1}`,
            toLabel: targetLabel,
            warning,
            assessment: assessmentOnTarget,
            fits: Boolean(assessmentOnTarget?.fitsInDayHours),
            onConfirm: commitMove,
          });
        } else {
          commitMove();
        }
      }
    }
  }

  /** After a same-day reorder, push activities that no longer fit hours onto later days. */
  function spillOverflowInEditor(days, controlPanel = {}) {
    const list = Array.isArray(days) ? days.map((d) => ({ ...d, activities: [...(d.activities || [])] })) : [];
    let carry = [];
    let moved = 0;
    for (let i = 0; i < list.length; i++) {
      const breaks = (list[i].activities || []).filter((a) => a?.isBreak || isBreakEntry(a));
      const real = [
        ...carry,
        ...(list[i].activities || []).filter((a) => !(a?.isBreak || isBreakEntry(a))),
      ];
      carry = [];
      if (i === 0 && controlPanel.startOnArrival === false) {
        carry = real;
        list[i] = { ...list[i], activities: [...breaks] };
        continue;
      }
      if (i === list.length - 1 && controlPanel.endOnDeparture === false) {
        carry = real;
        list[i] = { ...list[i], activities: [...breaks] };
        continue;
      }
      const kept = [];
      for (const act of real) {
        const assessment = assessActivityAgainstDay(act, kept, {
          controlPanel,
          isArrival: i === 0,
          isDeparture: i === list.length - 1,
        });
        if (!assessment || assessment.fitsInDayHours) kept.push(act);
        else {
          carry.push(act);
          moved += 1;
        }
      }
      list[i] = { ...list[i], activities: mergeActivitiesWithBreaks(kept, breaks) };
    }
    if (carry.length) {
      const last = list.length - 1;
      const breaks = (list[last].activities || []).filter((a) => a?.isBreak || isBreakEntry(a));
      const real = (list[last].activities || []).filter((a) => !(a?.isBreak || isBreakEntry(a)));
      list[last] = { ...list[last], activities: mergeActivitiesWithBreaks([...real, ...carry], breaks) };
    }
    if (moved > 0) {
      setGeoNotice(
        `${moved} activit${moved === 1 ? "y" : "ies"} did not fit the activity hours and ${moved === 1 ? "was" : "were"} moved to the next day.`
      );
    }
    return list;
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
        numberOfTravelers: Number(updatedCp.numberOfTravelers) || prev.numberOfTravelers,
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
  const hotelStays = normalizeHotelStays(itinerary?.controlPanel);
  const hotelsById = {};
  if (hotelData && typeof hotelData === "object" && hotelData._id) {
    hotelsById[String(hotelData._id)] = hotelData;
  }
  hotelStays.forEach((stay) => {
    if (stay.hotel?._id) hotelsById[String(stay.hotel._id)] = stay.hotel;
    else if (stay.hotelId && typeof stay.hotelId === "object" && stay.hotelId._id) {
      hotelsById[String(stay.hotelId._id)] = stay.hotelId;
    }
  });
  const hotelCost = hotelStays.length
    ? hotelCostFromStays(hotelStays, hotelsById, rooms, nights)
    : (hotelData?.pricePerNight ? hotelData.pricePerNight * nights * rooms : 0);
  const hotelLabel = hotelStays.length
    ? hotelStays.map((s) => s.hotel?.name || hotelsById[s.hotelId]?.name).filter(Boolean).join(" + ") || "Selected"
    : (hotelData?.name || "Not selected");
  const upliftRaw = Number(itinerary?.controlPanel?.budgetUplift ?? 15);
  // A negative tolerance holds the trip below the customer's budget, so the clamp is
  // symmetric. The legacy fraction test (0.15 = 15%) is read symmetrically too.
  const upliftMagnitude = Math.abs(upliftRaw);
  const upliftPct = Math.min(Math.max(
    (upliftMagnitude > 0 && upliftMagnitude < 1) ? upliftRaw : (upliftRaw / 100),
    -1
  ), 1);
  // The Control Panel can instead set a fixed trip ceiling, which replaces the
  // customer's budget rather than adjusting it.
  const isAmountBudget = itinerary?.controlPanel?.budgetMode === "amount";
  const customBudget = Math.max(0, Math.floor(Number(itinerary?.controlPanel?.budgetAmount) || 0));
  const useCustomBudget = isAmountBudget && customBudget > 0;

  const customCosts = Array.isArray(itinerary?.controlPanel?.customCosts)
    ? itinerary.controlPanel.customCosts
    : [];
  // Food and transport are charged per head per day, so party size is part of the total.
  const travellers = Math.max(1, Number(itinerary?.numberOfTravelers) || 1);
  const customCostLines = buildCustomCostLines(customCosts, { tripDays, travellers });
  const customCostsTotal = customCostLines.reduce((sum, c) => sum + c.total, 0);

  // Breaks (lunch, rest, free time) are scheduling placeholders, not activities, so they
  // are excluded from both the count and the price total. A day showing
  // "Pyramids / Museum / Lunch Break / Nile Cruise" counts as 3 activities, not 4.
  // Per person, as the catalogue stores it...
  const activitiesPerPerson = useMemo(() => sumActivityPrices(daysData), [daysData]);
  // ...and what the party pays, which is what has to fit the traveller's budget.
  const activitiesTotal = partyActivityCost(activitiesPerPerson, travellers);

  const totalActivitiesCount = useMemo(() => countActivities(daysData), [daysData]);

  const baseBudget = itinerary?.budget || parseBudgetValue(request?.tripDetails?.budget || request?.amount) || 0;
  const maxAllowedTotalBudget = useCustomBudget
    ? customBudget
    : (baseBudget > 0 ? Math.floor(baseBudget * (1 + upliftPct)) : 0);
  const activityBudgetAllowance = Math.max(0, (budgetBreakdown?.activityCeiling ?? (maxAllowedTotalBudget - hotelCost - customCostsTotal)));
  const perPersonBudgetAllowance = perTravellerCeiling(activityBudgetAllowance, travellers);
  const activityBudgetUsedPct = activityBudgetAllowance > 0
    ? Math.round((activitiesTotal / activityBudgetAllowance) * 100)
    : null;
  const grandTotal = activitiesTotal + hotelCost + customCostsTotal;
  const isWithinBaseBudget = useCustomBudget
    ? grandTotal <= customBudget
    : (baseBudget > 0 ? grandTotal <= baseBudget : true);
  const isWithinTolerance = maxAllowedTotalBudget > 0 ? grandTotal <= maxAllowedTotalBudget : true;

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

        {pendingMove && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setPendingMove(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
            >
              <div className={`flex items-start gap-3 px-5 py-4 border-b ${pendingMove.fits ? (darkMode ? "border-amber-900/50 bg-amber-950/20" : "border-amber-100 bg-amber-50") : (darkMode ? "border-rose-900/50 bg-rose-950/20" : "border-rose-100 bg-rose-50")}`}>
                <div className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-lg ${pendingMove.fits ? "bg-amber-500/15 text-amber-500" : "bg-rose-500/15 text-rose-500"}`}>
                  {pendingMove.fits ? "🚗" : "⏰"}
                </div>
                <div className="min-w-0">
                  <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {pendingMove.fits ? "Long travel distance" : "Day runs out of time"}
                  </h3>
                  <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Moving <span className="font-semibold">{pendingMove.title}</span> from {pendingMove.fromLabel} to {pendingMove.toLabel}
                  </p>
                </div>
              </div>

              <div className="px-5 py-4">
                <p className={`text-sm leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  {pendingMove.warning}
                </p>

                {pendingMove.assessment && (
                  <div className={`mt-3 grid grid-cols-2 gap-2 text-[11px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {pendingMove.assessment.nearestKm != null && (
                      <div className={`rounded-lg px-3 py-2 ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}>
                        <div className="font-semibold text-[10px] uppercase tracking-wide opacity-70">Distance</div>
                        <div className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{pendingMove.assessment.nearestKm} km</div>
                      </div>
                    )}
                    {!pendingMove.fits && (
                      <div className={`rounded-lg px-3 py-2 ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}>
                        <div className="font-semibold text-[10px] uppercase tracking-wide opacity-70">Over by</div>
                        <div className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{pendingMove.assessment.overrunMinutes} min</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-end gap-2 px-5 py-3 border-t ${darkMode ? "border-slate-700 bg-slate-900/60" : "border-slate-100 bg-slate-50/60"}`}>
                <button
                  type="button"
                  onClick={() => setPendingMove(null)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { pendingMove.onConfirm?.(); setPendingMove(null); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#a26e35] hover:bg-[#8a5c2b] transition-colors"
                >
                  Move anyway
                </button>
              </div>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* ── Left: compact day-by-day itinerary ─────────────────────────── */}
          <div className={`${(showControlPanel || showActivitiesPool) ? "lg:col-span-8" : "lg:col-span-12"} space-y-3 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1`}>

            {/* Vertical Days List View */}
            {daysData.map((day, idx) => (
              <div
                key={idx}
                id={`day-${idx}`}
                data-droppable="true"
                className={`${cardCls} px-3 py-2.5`}
              >
                {/* Day header */}
                <div className="flex items-center justify-between mb-2">
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
                      <h2 className={`text-xs font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
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
                  travellers={travellers}
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
                {(baseBudget > 0 || useCustomBudget) && (
                  <Row
                    label={
                      useCustomBudget
                        ? "Custom Budget (set by supplier)"
                        : upliftPct > 0
                          ? `Budget Tolerance (+${Math.round(upliftPct * 100)}%)`
                          : upliftPct < 0
                            ? `Budget Tolerance (${Math.round(upliftPct * 100)}%)`
                            : "Budget Tolerance (0% — none)"
                    }
                    value={`Max $${maxAllowedTotalBudget.toLocaleString()}`}
                    dark={darkMode}
                  />
                )}
                <Row label="Hotel" value={hotelLabel} dark={darkMode} />
                <Row label="Transportation" value="Included in itinerary" dark={darkMode} />
                {hotelCost > 0 && <Row label={`Hotel (${nights} nights × ${rooms} rooms)`} value={`$${hotelCost.toLocaleString()}`} dark={darkMode} />}
                <Row
                  label={travellers > 1 ? `Activities Cost (${travellers} travellers)` : "Activities Cost"}
                  value={
                    travellers > 1
                      ? `$${activitiesTotal.toLocaleString()} ($${activitiesPerPerson.toLocaleString()} pp)`
                      : `$${activitiesTotal.toLocaleString()}`
                  }
                  dark={darkMode}
                />
                {baseBudget > 0 && activityBudgetAllowance > 0 && (
                  <Row
                    label="Activity Budget Used"
                    value={`$${activitiesTotal.toLocaleString()} of $${activityBudgetAllowance.toLocaleString()} (${activityBudgetUsedPct ?? 0}%)`}
                    dark={darkMode}
                  />
                )}
                {/* The planner buys per head, so show the per-person target it works to. */}
                {travellers > 1 && perPersonBudgetAllowance > 0 && (
                  <Row
                    label="Per-person activity budget"
                    value={`$${activitiesPerPerson.toLocaleString()} of $${perPersonBudgetAllowance.toLocaleString()}`}
                    dark={darkMode}
                  />
                )}
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

          {/* ── Right: wider control panel + original request + activity pool ── */}
          {(showControlPanel || showActivitiesPool) && (
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4 self-start min-w-0">
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
            {resolveActivityImage(activeDragData.activity) ? (
              <img
                src={resolveActivityImage(activeDragData.activity)}
                alt=""
                className="w-full h-20 object-cover"
              />
            ) : (
              <div className="w-full h-20 bg-slate-200" />
            )}
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
