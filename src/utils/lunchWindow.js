/**
 * Where the lunch break falls on a day.
 *
 * The supplier configures a *duration* only. A start time was a second thing to keep
 * consistent with the activity window, and getting it wrong silently produced days where
 * lunch sat outside working hours. The break is instead centred in the day's activity
 * window, so the one setting applies sensibly to every day of the trip.
 *
 *   09:00–19:00, 60 min  ->  13:30–14:30
 *   08:00–18:00, 60 min  ->  12:30–13:30
 *   09:00–19:00, 90 min  ->  13:15–14:45
 *
 * Browser mirror of `resolveLunchWindow` in the backend's `utils/geo.js` — keep the two
 * in sync so the panel always previews exactly what generation will do.
 */

export const DEFAULT_LUNCH_MINUTES = 60;

export function parseTimeToMinutes(value, fallback = null) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value || '').trim());
  if (!m) return fallback;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function minutesToTime(mins) {
  const clamped = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
}

/** @returns {{ lunchStart, lunchEnd, durationMinutes }} */
export function resolveLunchWindow(controlPanel = {}) {
  const dayStart = parseTimeToMinutes(controlPanel.activityStartTime, 9 * 60);
  const dayEnd = parseTimeToMinutes(controlPanel.activityEndTime, 19 * 60);

  let duration = Number(controlPanel.lunchDurationMinutes);
  if (!Number.isFinite(duration) || duration < 0) {
    // Legacy records carry an explicit window instead of a duration.
    const legacyStart = parseTimeToMinutes(controlPanel.lunchStart, null);
    const legacyEnd = parseTimeToMinutes(controlPanel.lunchEnd, null);
    duration = legacyStart !== null && legacyEnd !== null && legacyEnd > legacyStart
      ? legacyEnd - legacyStart
      : DEFAULT_LUNCH_MINUTES;
  }

  const window = Math.max(0, dayEnd - dayStart);
  duration = Math.max(0, Math.min(duration, window));

  const midpoint = dayStart + Math.floor(window / 2);
  let startMinutes = Math.floor((midpoint - Math.floor(duration / 2)) / 15) * 15;
  startMinutes = Math.max(dayStart, Math.min(startMinutes, dayEnd - duration));

  return {
    lunchStart: minutesToTime(startMinutes),
    lunchEnd: minutesToTime(startMinutes + duration),
    durationMinutes: duration,
  };
}
