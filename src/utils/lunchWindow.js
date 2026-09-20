/**
 * Where the lunch break falls on a day.
 *
 * The supplier configures a *duration* only. The break is placed inside the fixed
 * 13:00–15:00 lunch band, centred in the overlap between that band and the day's
 * activity hours. If the day does not overlap 13:00–15:00 (e.g. activities start at
 * 16:00), no lunch break is scheduled.
 *
 *   09:00–19:00, 60 min  ->  13:30–14:30
 *   08:00–18:00, 60 min  ->  13:30–14:30
 *   09:00–19:00, 90 min  ->  13:15–14:45
 *   16:00–19:00, 60 min  ->  none (duration 0)
 *
 * Browser mirror of `resolveLunchWindow` in the backend's `utils/geo.js` — keep the two
 * in sync so the panel always previews exactly what generation will do.
 */

export const DEFAULT_LUNCH_MINUTES = 60;
/** Lunch may only fall inside this band (1:00 PM – 3:00 PM). */
export const LUNCH_BAND_START = 13 * 60;
export const LUNCH_BAND_END = 15 * 60;

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

  const bandStart = Math.max(dayStart, LUNCH_BAND_START);
  const bandEnd = Math.min(dayEnd, LUNCH_BAND_END);
  const available = Math.max(0, bandEnd - bandStart);

  if (duration <= 0 || available <= 0) {
    return {
      lunchStart: minutesToTime(LUNCH_BAND_START),
      lunchEnd: minutesToTime(LUNCH_BAND_START),
      durationMinutes: 0,
    };
  }

  duration = Math.min(duration, available);

  const midpoint = bandStart + Math.floor(available / 2);
  let startMinutes = Math.floor((midpoint - Math.floor(duration / 2)) / 15) * 15;
  startMinutes = Math.max(bandStart, Math.min(startMinutes, bandEnd - duration));

  return {
    lunchStart: minutesToTime(startMinutes),
    lunchEnd: minutesToTime(startMinutes + duration),
    durationMinutes: duration,
  };
}
