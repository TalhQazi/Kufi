/** Multiple hotel stays on an itinerary Control Panel (mirrors backend utils/hotelStays.js). */

export function hotelIdOf(value) {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || "").trim();
  const id = String(value).trim();
  return id === "null" || id === "undefined" ? "" : id;
}

export function nightsForStay(stay, index, stays, tripNights) {
  const list = Array.isArray(stays) ? stays : [];
  const assigned = list.reduce((sum, s) => sum + Math.max(0, Number(s.nights) || 0), 0);
  if (assigned > 0) return Math.max(0, Number(stay?.nights) || 0);
  const n = Math.max(0, Number(tripNights) || 0);
  const count = list.length || 1;
  const base = Math.floor(n / count);
  const rem = n % count;
  return base + (index < rem ? 1 : 0);
}

export function normalizeHotelStays(cp = {}) {
  const raw = Array.isArray(cp.hotelStays) ? cp.hotelStays : [];
  const stays = raw
    .map((s, i) => ({
      id: s.id || `stay-${i}`,
      hotelId: hotelIdOf(s.hotelId),
      area: String(s.area || "").trim(),
      nights: Math.max(0, Number(s.nights) || 0),
      hotel: typeof s.hotelId === "object" && s.hotelId ? s.hotelId : null,
    }))
    .filter((s) => s.hotelId);
  if (stays.length) return stays;
  const legacy = hotelIdOf(cp.hotelId);
  if (!legacy) return [];
  return [{
    id: "stay-legacy",
    hotelId: legacy,
    area: String(cp.hotelBaseArea || "").trim(),
    nights: 0,
    hotel: typeof cp.hotelId === "object" ? cp.hotelId : null,
  }];
}

export function hotelCostFromStays(stays, hotelsById, rooms, tripNights) {
  const r = Math.max(1, Number(rooms) || 1);
  const list = Array.isArray(stays) ? stays : [];
  return list.reduce((sum, stay, i) => {
    const hotel = stay.hotel || hotelsById?.[stay.hotelId] || hotelsById?.[String(stay.hotelId)];
    const rate = Number(hotel?.pricePerNight) || 0;
    const n = nightsForStay(stay, i, list, tripNights);
    return sum + rate * n * r;
  }, 0);
}

export function hotelsByIdFromList(hotels) {
  const map = {};
  (Array.isArray(hotels) ? hotels : []).forEach((h) => {
    if (h?._id) map[String(h._id)] = h;
  });
  return map;
}
