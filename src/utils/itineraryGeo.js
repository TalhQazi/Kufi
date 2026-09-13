/** Default same-area radius for clustering (km). Day fit uses activity hours, not this. */
export const SAME_AREA_RADIUS_KM = 60;

const EARTH_RADIUS_KM = 6371;
const AVG_TRAVEL_SPEED_KMH = 70;
const TRANSFER_OVERHEAD_MIN = 60;
const DEFAULT_ACTIVITY_MIN = 120;

function toRad(deg) {
  return (Number(deg) * Math.PI) / 180;
}

function parseTimeToMinutes(value, fallback = null) {
  if (value == null || value === "") return fallback;
  const raw = String(value).trim();
  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return fallback;
  const h = Number(m[1]);
  const mins = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(mins)) return fallback;
  return h * 60 + mins;
}

function parseDurationMinutes(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return Math.round(value);
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return DEFAULT_ACTIVITY_MIN;
  const hours = raw.match(/(\d+(?:\.\d+)?)\s*h/);
  const mins = raw.match(/(\d+(?:\.\d+)?)\s*m/);
  let total = 0;
  if (hours) total += Number(hours[1]) * 60;
  if (mins) total += Number(mins[1]);
  if (total > 0) return Math.round(total);
  const asNum = Number(raw);
  if (Number.isFinite(asNum) && asNum > 0) return Math.round(asNum);
  return DEFAULT_ACTIVITY_MIN;
}

/** Usable { lat, lng } from an activity or coordinates object. */
export function getCoordinates(source) {
  if (!source || typeof source !== "object") return null;
  const c = source.coordinates || source.coords || source;
  const lat = Number(c?.lat ?? c?.latitude);
  const lng = Number(c?.lng ?? c?.lon ?? c?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function haversineKm(a, b) {
  if (!a || !b) return null;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Rough road minutes for a hop (matches backend conservative speed). */
export function travelMinutesForKm(km) {
  if (km == null || !Number.isFinite(km)) return null;
  const overhead = km > SAME_AREA_RADIUS_KM ? TRANSFER_OVERHEAD_MIN : 0;
  return Math.max(5, Math.ceil((km / AVG_TRAVEL_SPEED_KMH) * 60 + overhead));
}

/**
 * Bookable minutes for a day from Control Panel activity start/end (+ lunch).
 */
export function dayCapacityMinutes(controlPanel = {}, { isArrival = false, isDeparture = false } = {}) {
  let start = parseTimeToMinutes(controlPanel.activityStartTime, 9 * 60);
  let end = parseTimeToMinutes(controlPanel.activityEndTime, 19 * 60);
  if (isArrival && controlPanel.arrivalTime) {
    const arrival = parseTimeToMinutes(controlPanel.arrivalTime, null);
    if (arrival != null) start = Math.max(start, arrival);
  }
  if (isDeparture && controlPanel.departureTime) {
    const departure = parseTimeToMinutes(controlPanel.departureTime, null);
    if (departure != null) end = Math.min(end, departure);
  }
  const lunch = Math.max(0, Number(controlPanel.lunchDurationMinutes) || 0);
  return Math.max(0, end - start - lunch);
}

/**
 * Whether adding `activity` to a day still fits inside activity start → end time,
 * after existing activity durations and travel between coordinates.
 */
export function assessActivityAgainstDay(
  activity,
  dayActivities = [],
  {
    controlPanel = {},
    isArrival = false,
    isDeparture = false,
  } = {}
) {
  const capacity = dayCapacityMinutes(controlPanel, { isArrival, isDeparture });
  const startLabel = controlPanel.activityStartTime || "09:00";
  const endLabel = controlPanel.activityEndTime || "19:00";

  const others = (Array.isArray(dayActivities) ? dayActivities : []).filter((other) => {
    if (!other || other.isBreak) return false;
    if (other.id && activity?.id && other.id === activity.id) return false;
    return true;
  });

  const proposed = [...others, activity].filter(Boolean);
  let used = 0;
  let prev = null;
  let farthestKm = 0;
  let farthestTitle = "";
  let travelTotal = 0;

  proposed.forEach((act) => {
    used += parseDurationMinutes(act.durationMinutes ?? act.duration);
    const here = getCoordinates(act);
    if (prev && here) {
      const km = haversineKm(prev, here);
      if (km != null) {
        const travel = travelMinutesForKm(km) || 0;
        used += travel;
        travelTotal += travel;
        if (km > farthestKm) {
          farthestKm = km;
          farthestTitle = act.title || "another activity";
        }
      }
    }
    if (here) prev = here;
  });

  const overrunMinutes = Math.max(0, used - capacity);
  const fitsInDayHours = used <= capacity;

  return {
    capacityMinutes: capacity,
    usedMinutes: used,
    travelMinutes: travelTotal,
    farthestKm: Math.round(farthestKm),
    otherTitle: farthestTitle,
    startLabel,
    endLabel,
    fitsInDayHours,
    overrunMinutes,
    /** Warn when the move does not fit the Control Panel activity window. */
    exceedsSameArea: !fitsInDayHours,
  };
}

export function formatTravelWarning(assessment, { dayLabel = "this day" } = {}) {
  if (!assessment || assessment.fitsInDayHours) return "";
  const travelBit = assessment.farthestKm > 0
    ? ` Travel between stops is about ${assessment.farthestKm} km` +
      (assessment.travelMinutes ? ` (~${assessment.travelMinutes} min)` : "") +
      "."
    : "";
  return (
    `This does not fit ${dayLabel}'s activity hours (${assessment.startLabel}–${assessment.endLabel}). ` +
    `Needed ~${assessment.usedMinutes} min, available ${assessment.capacityMinutes} min` +
    (assessment.overrunMinutes ? ` (over by ${assessment.overrunMinutes} min)` : "") +
    `.${travelBit} Move anyway?`
  );
}
