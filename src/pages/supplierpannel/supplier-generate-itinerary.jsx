import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, MapPin, Users, DollarSign, Info } from "lucide-react";
import api from "../../api";

const DRAFTS_STORAGE_KEY = "kufi_supplier_itinerary_drafts";

const createEmptyDay = (day) => ({
  day,
  isAdjustment: false,
  activity: "",
  location: "",
  description: "",
  cost: "",
  startTime: "",
  endTime: "",
  imageDataUrl: "",
});

const createDays = (count) => {
  const safeCount = Math.max(1, Number(count) || 1);
  return Array.from({ length: safeCount }, (_, idx) => createEmptyDay(idx + 1));
};

const DayCard = ({
  day,
  darkMode,
  expanded,
  onToggle,
  dayData,
  onUpdateDay,
  onBrowseImage,
  onRemoveImage,
  activityOptions,
  locationOptions,
}) => {
  const isExpanded = Boolean(expanded);
  const data = dayData || { day };

  return (
    <div className={`rounded-2xl border transition-colors outline-none overflow-hidden ${darkMode ? "bg-slate-800 border-slate-700" : "bg-amber-50/40 border-amber-100"}`}>
      <button
        type="button"
        onClick={() => onToggle?.(day)}
        className={`flex w-full items-center justify-between px-4 py-3 text-xs font-semibold transition-colors ${darkMode ? "text-white hover:bg-slate-700" : "text-gray-800 hover:bg-amber-100/50"}`}
      >
        <span>Day {day}</span>
        <span className={`text-lg transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{isExpanded ? "⌃" : "⌄"}</span>
      </button>

      {isExpanded && (
        <div className={`border-t px-4 py-4 space-y-4 text-xs transition-colors ${darkMode ? "border-slate-700" : "border-amber-100"}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Select Activity</p>
              <select
                value={data.activity || ""}
                onChange={(e) => onUpdateDay?.(day, { activity: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
              >
                <option value="">Select an activity</option>
                {(Array.isArray(activityOptions) ? activityOptions : [])
                  .filter(Boolean)
                  .map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Select Location</p>
              <select
                value={data.location || ""}
                onChange={(e) => onUpdateDay?.(day, { location: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
              >
                <option value="">Select a location</option>
                {(Array.isArray(locationOptions) ? locationOptions : [])
                  .filter(Boolean)
                  .map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Add Description</p>
            <textarea
              rows={3}
              placeholder="Add notes or highlights about this activity..."
              value={data.description || ""}
              onChange={(e) => onUpdateDay?.(day, { description: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-600" : "bg-gray-50 border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Add Estimated Cost</p>
              <div className={`flex items-center rounded-lg border px-3 py-2 text-sm transition-all ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                <span className={`mr-2 transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={data.cost || ""}
                  onChange={(e) => onUpdateDay?.(day, { cost: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Start Time</p>
              <input
                type="time"
                value={data.startTime || ""}
                onChange={(e) => onUpdateDay?.(day, { startTime: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-900 border-slate-700 text-white icon-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}
              />
            </div>

            <div className="space-y-1">
              <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>End Time</p>
              <input
                type="time"
                value={data.endTime || ""}
                onChange={(e) => onUpdateDay?.(day, { endTime: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-900 border-slate-700 text-white icon-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Add Image</p>
            <div className={`rounded-xl border border-dashed transition-all overflow-hidden ${darkMode ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-300"}`}>
              {data.imageDataUrl ? (
                <div className="relative h-28 w-full">
                  <img src={data.imageDataUrl} alt={`Day ${day}`} className="absolute inset-0 h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemoveImage?.(day)}
                    className={`absolute top-2 right-2 rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${darkMode ? "bg-slate-950/70 text-slate-200 hover:bg-slate-950" : "bg-white/80 text-gray-700 hover:bg-white"}`}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className={`flex h-24 w-full items-center justify-center text-[11px] transition-all ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                  <span className={`mr-1 transition-colors ${darkMode ? "text-slate-600" : "text-gray-400"}`}>📷</span>
                  <span>Drag and drop an image, or</span>
                  <label className="ml-1 font-semibold text-[#a26e35] hover:underline cursor-pointer" htmlFor={`day-image-${day}`}>
                    browse
                  </label>
                  <input
                    id={`day-image-${day}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onBrowseImage?.(day, e.target.files?.[0])}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SupplierGenerateItinerary = ({ darkMode, request, draft, onGoToBookings, onBack }) => {
  const initialActivitiesCount = Array.isArray(request?.items) ? request.items.length : 0;
  const initialDaysCount = Math.max(1, initialActivitiesCount || 0);
  const [expandedDays, setExpandedDays] = useState(() => {
    const maxExpanded = Math.min(3, initialDaysCount);
    return Array.from({ length: maxExpanded }, (_, idx) => idx + 1);
  });
  const [travelDetails, setTravelDetails] = useState({
    destination: "",
    budget: "",
    startDate: "",
    endDate: "",
    preferences: "",
  });
  const [daysData, setDaysData] = useState(() => createDays(initialDaysCount));
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [draftSavedMessage, setDraftSavedMessage] = useState("");
  const [sentSuccessMessage, setSentSuccessMessage] = useState("");
  const [previousItinerary, setPreviousItinerary] = useState(null);
  const [prefilledFromPrevious, setPrefilledFromPrevious] = useState(false);

  const requestItemMeta = useMemo(() => {
    const list = Array.isArray(request?.items) ? request.items : [];
    return list.map((item) => {
      const activity = item?.activity || item || {};
      const title =
        activity?.title ||
        item?.title ||
        activity?.name ||
        item?.name ||
        "";

      const description =
        activity?.description ||
        item?.description ||
        activity?.details ||
        item?.details ||
        "";

      const loc =
        activity?.country?.name ||
        activity?.country ||
        activity?.location ||
        activity?.city ||
        item?.location ||
        request?.tripDetails?.country ||
        request?.country ||
        "";

      return {
        title: String(title || "").trim(),
        description: String(description || "").trim(),
        location: String(loc || "").trim(),
      };
    });
  }, [request]);

  const activityOptions = useMemo(() => {
    return requestItemMeta
      .map((x) => x?.title)
      .filter((x) => String(x || "").trim());
  }, [requestItemMeta]);

  const locationOptions = useMemo(() => {
    const set = new Set();
    requestItemMeta.forEach((x) => {
      const v = String(x?.location || "").trim();
      if (v) set.add(v);
    });
    return Array.from(set);
  }, [requestItemMeta]);

  const safeParseJson = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const DRAFT_IMAGES_DB = "kufi_itinerary_draft_images";
  const DRAFT_IMAGES_STORE = "images";

  const openDraftImagesDb = () => {
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DRAFT_IMAGES_DB, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(DRAFT_IMAGES_STORE)) {
            db.createObjectStore(DRAFT_IMAGES_STORE, { keyPath: "key" });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
  };

  const idbPutImage = async (key, dataUrl) => {
    if (!key) return;
    const db = await openDraftImagesDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(DRAFT_IMAGES_STORE, "readwrite");
        const store = tx.objectStore(DRAFT_IMAGES_STORE);
        store.put({ key, dataUrl: String(dataUrl || "") });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  };

  const idbGetImage = async (key) => {
    if (!key) return "";
    const db = await openDraftImagesDb();
    try {
      const record = await new Promise((resolve, reject) => {
        const tx = db.transaction(DRAFT_IMAGES_STORE, "readonly");
        const store = tx.objectStore(DRAFT_IMAGES_STORE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      return String(record?.dataUrl || "");
    } catch {
      return "";
    } finally {
      db.close();
    }
  };

  const parseMoney = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const cleaned = String(value)
      .replace(/[^0-9.\-]/g, "")
      .trim();
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const formatMoney = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "$0";
    const abs = Math.abs(n);
    const formatted = abs.toLocaleString(undefined, { maximumFractionDigits: 0 });
    return n < 0 ? `$-${formatted}` : `$${formatted}`;
  };

  const parseMoneyRange = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) return { min: 0, max: 0, isRange: false, hasValue: false };
    const cleaned = raw.replace(/\$/g, "").replace(/,/g, "").trim();
    const parts = cleaned
      .split("-")
      .map((x) => x.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      const a = parseMoney(parts[0]);
      const b = parseMoney(parts[1]);
      return {
        min: Math.min(a, b),
        max: Math.max(a, b),
        isRange: true,
        hasValue: true,
      };
    }

    const n = parseMoney(cleaned);
    return { min: n, max: n, isRange: false, hasValue: Boolean(raw) };
  };

  const formatRange = ({ min, max, isRange, hasValue }) => {
    if (!hasValue) return "$0";
    if (!Number.isFinite(min) || !Number.isFinite(max)) return "$0";
    if (!isRange || min === max) return formatMoney(min);
    return `${formatMoney(min)} - ${formatMoney(max)}`;
  };

  const normalized = useMemo(() => {
    const location =
      request?.tripDetails?.country ||
      request?.location ||
      request?.destination ||
      "";

    const budget =
      request?.tripDetails?.budget ??
      request?.amount ??
      request?.totalAmount ??
      request?.price ??
      "";

    const guests =
      request?.guests ??
      request?.travelers ??
      (Array.isArray(request?.items)
        ? request.items.reduce((sum, item) => sum + (item?.travelers || 0), 0)
        : "");

    const arrival = request?.tripDetails?.arrivalDate ? new Date(request.tripDetails.arrivalDate) : null;
    const departure = request?.tripDetails?.departureDate ? new Date(request.tripDetails.departureDate) : null;

    const startDate = arrival ? arrival.toISOString().slice(0, 10) : "";
    const endDate = departure ? departure.toISOString().slice(0, 10) : "";

    const preferencesObj = request?.preferences || {};
    const preferencesText = [
      preferencesObj.includeHotel || preferencesObj.hotelIncluded ? "Hotel requested" : null,
      preferencesObj.hotelOwn ? "Own hotel" : null,
      preferencesObj.vegetarian ? "Vegetarian" : null,
      preferencesObj.foodAllGood ? "Food: all good" : null,
    ].filter(Boolean).join(", ");

    const title =
      (Array.isArray(request?.items) && request.items.length > 0
        ? request.items
          .map((i) => i?.activity?.title || i?.title)
          .filter(Boolean)
          .join(", ")
        : request?.experience || request?.title || "");

    return {
      title,
      location,
      budget,
      guests,
      startDate,
      endDate,
      preferencesText,
    };
  }, [request]);

  const totalBudgetValue = useMemo(() => {
    return parseMoney(travelDetails.budget);
  }, [travelDetails.budget]);

  const clientBudgetRange = useMemo(() => {
    return parseMoneyRange(normalized.budget);
  }, [normalized.budget]);

  const remainingBudgetDisplay = useMemo(() => {
    const total = totalBudgetValue;
    if (!clientBudgetRange?.hasValue) return formatMoney(total);

    const min = total - clientBudgetRange.max;
    const max = total - clientBudgetRange.min;
    const isRange = clientBudgetRange.isRange && clientBudgetRange.min !== clientBudgetRange.max;
    return formatRange({ min, max, isRange, hasValue: true });
  }, [clientBudgetRange, totalBudgetValue]);

  useEffect(() => {
    const draftTd = draft?.payload?.travelDetails;
    const hasDraftTravelDetails = Boolean(
      draftTd &&
      [draftTd?.destination, draftTd?.budget, draftTd?.startDate, draftTd?.endDate, draftTd?.preferences]
        .some((v) => String(v || "").trim())
    );

    if (hasDraftTravelDetails) {
      setTravelDetails((prev) => ({
        ...prev,
        ...draftTd,
      }));
    } else if (normalized.location) {
      setTravelDetails((prev) => ({
        ...prev,
        destination: prev.destination || normalized.location,
        budget: prev.budget || normalized.budget,
        startDate: prev.startDate || normalized.startDate,
        endDate: prev.endDate || normalized.endDate,
        preferences: prev.preferences || normalized.preferencesText,
      }));
    }

    if (Array.isArray(draft?.payload?.daysData) && draft.payload.daysData.length > 0) {
      setDaysData(draft.payload.daysData);
    }
  }, [draft, normalized.location, normalized.budget, normalized.startDate, normalized.endDate, normalized.preferencesText]);

  useEffect(() => {
    if (Array.isArray(draft?.payload?.daysData) && draft.payload.daysData.length > 0) return;

    const card = request?.adjustmentCard;
    if (!card) return;

    const activity = String(card?.title || '').trim();
    const description = String(card?.description || '').trim();
    const location = String(card?.location || '').trim();
    const cost = String(card?.cost || '').trim();
    const imageDataUrl = String(card?.imageDataUrl || '').trim();

    if (!activity && !description && !location && !cost && !imageDataUrl) return;

    setDaysData((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const next = list.length > 0 ? [...list] : [createEmptyDay(1)];

      const activitiesCount = Array.isArray(request?.items) ? request.items.length : 0;
      const existingAdjustmentIndex = next.findIndex((d) => Boolean(d?.isAdjustment));
      const insertIndex = existingAdjustmentIndex >= 0
        ? existingAdjustmentIndex
        : Math.max(activitiesCount, next.length);
      const desiredLen = Math.max(1, insertIndex + 1);
      while (next.length < desiredLen) next.push(createEmptyDay(next.length + 1));

      const target = next[insertIndex] || createEmptyDay(insertIndex + 1);
      next[insertIndex] = {
        ...target,
        isAdjustment: true,
        activity: String(target.activity || '').trim() ? target.activity : activity,
        description: String(target.description || '').trim() ? target.description : description,
        location: String(target.location || '').trim() ? target.location : location,
        cost: String(target.cost || '').trim() ? target.cost : cost,
        imageDataUrl: target.imageDataUrl ? target.imageDataUrl : imageDataUrl,
      };

      return next;
    });
  }, [request, draft, previousItinerary]);

  useEffect(() => {
    if (Array.isArray(draft?.payload?.daysData) && draft.payload.daysData.length > 0) return;
    if (!Array.isArray(requestItemMeta) || requestItemMeta.length === 0) return;

    setDaysData((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (list.length === 0) return list;

      return list.map((d, idx) => {
        const meta = requestItemMeta[idx];
        if (!meta) return d;

        const next = { ...d };
        if (!String(next.activity || "").trim() && meta.title) next.activity = meta.title;
        if (!String(next.description || "").trim() && meta.description) next.description = meta.description;
        if (!String(next.location || "").trim() && meta.location) next.location = meta.location;
        return next;
      });
    });
  }, [draft, requestItemMeta]);

  useEffect(() => {
    if (Array.isArray(draft?.payload?.daysData) && draft.payload.daysData.length > 0) return;

    const activitiesCount = Array.isArray(request?.items) ? request.items.length : 0;
    const card = request?.adjustmentCard;
    const hasCard = Boolean(
      card &&
      [card?.title, card?.description, card?.location, card?.cost, card?.imageDataUrl].some((v) => String(v || '').trim())
    );
    const target = Math.max(1, (activitiesCount || 0) + (hasCard ? 1 : 0));

    setDaysData((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (list.length >= target) return list;

      const next = [...list];
      const start = next.length + 1;
      for (let day = start; day <= target; day += 1) {
        next.push(createEmptyDay(day));
      }
      return next;
    });
  }, [request, draft]);

  const calcProgress = (payload) => {
    const td = payload?.travelDetails || {};
    const tdFields = [td.destination, td.budget, td.startDate, td.endDate, td.preferences];
    const tdScore = tdFields.filter((v) => String(v || "").trim()).length;

    const dayList = Array.isArray(payload?.daysData) ? payload.daysData : [];
    const dayScore = dayList.reduce((sum, d) => {
      const fields = [d.activity, d.location, d.description, d.cost, d.startTime, d.endTime, d.imageDataUrl];
      return sum + fields.filter((v) => String(v || "").trim()).length;
    }, 0);

    const max = 5 + (dayList.length * 7);
    const val = tdScore + dayScore;
    if (!max) return 0;
    return Math.max(0, Math.min(1, val / max));
  };

  const adjustmentCard = request?.adjustmentCard || null;
  const hasAdjustment = (() => {
    if (!adjustmentCard) return false;
    const fields = [adjustmentCard?.title, adjustmentCard?.description, adjustmentCard?.location, adjustmentCard?.cost, adjustmentCard?.imageDataUrl];
    return fields.some((v) => String(v || '').trim());
  })();

  useEffect(() => {
    const currentId = request?._id || request?.id || request?.bookingId || request?.requestId || "";
    if (!currentId) return;

    let cancelled = false;
    const fetchPrevious = async () => {
      try {
        const res = await api.get('/itineraries').catch(() => ({ data: [] }));
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.itineraries) ? res.data.itineraries : []);
        const match = (Array.isArray(list) ? list : []).find((it) => {
          const candidate = String(it?.bookingId || it?.requestId || it?.booking || it?.request || it?._id || it?.id || '');
          return candidate && candidate === String(currentId);
        });
        if (!cancelled) setPreviousItinerary(match || null);
      } catch {
        if (!cancelled) setPreviousItinerary(null);
      }
    };

    fetchPrevious();
    return () => {
      cancelled = true;
    };
  }, [request]);

  useEffect(() => {
    if (prefilledFromPrevious) return;
    if (!hasAdjustment) return;
    if (!previousItinerary) return;
    if (Array.isArray(draft?.payload?.daysData) && draft.payload.daysData.length > 0) return;

    const tripData = previousItinerary?.tripData || {};
    const destination = tripData?.destination || tripData?.location || previousItinerary?.destination || previousItinerary?.location || "";
    const pickNonEmpty = (...values) => {
      for (const v of values) {
        if (v === null || v === undefined) continue;
        const s = String(v).trim();
        if (s) return v;
      }
      return "";
    };

    const budgetRaw = pickNonEmpty(
      tripData?.budget,
      tripData?.totalBudget,
      tripData?.estimatedBudget,
      tripData?.price,
      previousItinerary?.budget,
      previousItinerary?.tripData?.budget
    );
    const budget = String(budgetRaw || '').trim();

    const parseDateRange = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return { start: "", end: "" };
      if (raw.includes(' - ')) {
        const parts = raw.split(' - ').map((x) => String(x || '').trim());
        return { start: parts[0] || '', end: parts[1] || '' };
      }

      const match = raw.match(/(\d{4}-\d{2}-\d{2}).*(\d{4}-\d{2}-\d{2})/);
      if (match) return { start: match[1] || '', end: match[2] || '' };

      return { start: "", end: "" };
    };

    const dateRange = parseDateRange(tripData?.date);

    setTravelDetails((prev) => ({
      ...prev,
      destination: prev.destination || destination,
      budget: prev.budget || budget,
      startDate: prev.startDate || dateRange.start,
      endDate: prev.endDate || dateRange.end,
      preferences: prev.preferences || tripData?.description || "",
    }));

    const prevDays = Array.isArray(previousItinerary?.days) ? previousItinerary.days : [];

    const stripPrefix = (value, prefix) => {
      const raw = String(value || "");
      const p = String(prefix || "");
      if (!p) return raw;
      return raw.startsWith(p) ? raw.slice(p.length).trim() : raw;
    };

    const mappedDays = prevDays.map((d, idx) => {
      const dayNo = Number(d?.day) || idx + 1;
      const activity = String(d?.title || "").trim();
      const description = String(d?.morning?.description || "").trim();
      const location = stripPrefix(d?.afternoon?.description, "Location:");
      const cost = stripPrefix(d?.evening?.description, "Estimated Cost:");
      const imageDataUrl = String(d?.image || "").trim();
      const startTime = String(d?.meta?.startTime || d?.startTime || d?.timeFrom || "").trim();
      const endTime = String(d?.meta?.endTime || d?.endTime || d?.timeTo || "").trim();

      return {
        ...createEmptyDay(dayNo),
        activity,
        description,
        location: String(location || "").trim(),
        cost: String(cost || "").trim(),
        imageDataUrl,
        startTime,
        endTime,
      };
    });

    if (mappedDays.length > 0) {
      setDaysData(mappedDays);
    }

    setPrefilledFromPrevious(true);
  }, [prefilledFromPrevious, hasAdjustment, previousItinerary, draft]);

  const readDrafts = () => {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return Array.isArray(parsed) ? parsed : [];
  };

  const writeDrafts = (list) => {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(Array.isArray(list) ? list : []));
  };

  const currentRequestId = request?._id || request?.id || request?.bookingId || request?.requestId || "";

  const draftIdRef = useRef("");
  useEffect(() => {
    if (draft?.id) {
      draftIdRef.current = String(draft.id);
      return;
    }
    if (draftIdRef.current) return;
    const base = currentRequestId ? `draft-${currentRequestId}` : `draft-${Date.now()}`;
    draftIdRef.current = base;
  }, [draft?.id, currentRequestId]);

  const getDraftImageKey = (draftId, day) => `${String(draftId || "")}:${String(day || "")}`;

  const persistImagesToIdb = async (draftId, list) => {
    const arr = Array.isArray(list) ? list : [];
    const tasks = [];
    arr.forEach((d) => {
      const day = d?.day;
      const img = String(d?.imageDataUrl || "").trim();
      if (!img) return;
      if (!img.startsWith("data:image")) return;
      const key = getDraftImageKey(draftId, day);
      tasks.push(idbPutImage(key, img));
    });
    if (tasks.length === 0) return;
    try {
      await Promise.all(tasks);
    } catch {
      // ignore
    }
  };

  const handleBrowseImage = (day, file) => {
    if (!file) return;
    if (!String(file.type || "").toLowerCase().startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setDaysData((prev) => prev.map((d) => (d.day === day ? { ...d, imageDataUrl: result } : d)));
      const did = draftIdRef.current;
      if (did && result) {
        idbPutImage(getDraftImageKey(did, day), result).catch(() => {});
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (day) => {
    setDaysData((prev) => prev.map((d) => (d.day === day ? { ...d, imageDataUrl: "" } : d)));
    const did = draftIdRef.current;
    if (did) {
      const key = getDraftImageKey(did, day);
      openDraftImagesDb()
        .then((db) => new Promise((resolve, reject) => {
          const tx = db.transaction(DRAFT_IMAGES_STORE, "readwrite");
          const store = tx.objectStore(DRAFT_IMAGES_STORE);
          store.delete(key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        }).finally(() => db.close()))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const did = draftIdRef.current;
    if (!did) return;
    const list = Array.isArray(draft?.payload?.daysData) ? draft.payload.daysData : [];
    if (!Array.isArray(list) || list.length === 0) return;

    let cancelled = false;
    const restore = async () => {
      try {
        const tasks = list.map(async (d) => {
          const day = d?.day;
          if (!day) return { day, img: "" };
          const key = getDraftImageKey(did, day);
          const img = await idbGetImage(key);
          return { day, img };
        });
        const results = await Promise.all(tasks);
        if (cancelled) return;

        setDaysData((prev) => {
          const prevList = Array.isArray(prev) ? prev : [];
          if (prevList.length === 0) return prevList;
          const imgMap = new Map(results.map((r) => [String(r.day), String(r.img || "")]));
          return prevList.map((dayObj) => {
            const k = String(dayObj?.day);
            const img = imgMap.get(k);
            if (!img) return dayObj;
            if (String(dayObj?.imageDataUrl || "").trim()) return dayObj;
            return { ...dayObj, imageDataUrl: img };
          });
        });
      } catch {
        // ignore
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [draft]);

  const buildDraftPayload = () => {
    return {
      travelDetails,
      daysData: (Array.isArray(daysData) ? daysData : []).map((d) => ({
        ...d,
        imageDataUrl: "",
      })),
      requestSnapshot: null,
    };
  };

  const buildItineraryApiPayload = () => {
    const title = normalized.title || request?.experience || request?.title || travelDetails.destination || "Itinerary";
    const destination = travelDetails.destination || normalized.location || "";
    const location = travelDetails.destination || normalized.location || "";

    const date = (travelDetails.startDate || travelDetails.endDate)
      ? `${travelDetails.startDate || '—'} - ${travelDetails.endDate || '—'}`
      : "";

    const tripData = {
      title,
      destination,
      location,
      date,
      groupSize: normalized.guests ? `${normalized.guests} People` : "",
      budget: travelDetails.budget || normalized.budget || "",
      description: travelDetails.preferences || "",
    };

    const days = (Array.isArray(daysData) ? daysData : []).map((d) => {
      const label = d?.activity || `Day ${d?.day || ''}`;
      return {
        day: d?.day,
        title: label,
        image: d?.imageDataUrl || "",
        morning: { title: "Morning", description: d?.description || "" },
        afternoon: { title: "Afternoon", description: d?.location ? `Location: ${d.location}` : "" },
        evening: { title: "Evening", description: d?.cost ? `Estimated Cost: ${d.cost}` : "" },
        meta: {
          startTime: d?.startTime || "",
          endTime: d?.endTime || "",
        },
      };
    });

    const travelerUserId =
      request?.userId ||
      request?.user?._id ||
      request?.user?.id ||
      request?.user ||
      request?.travelerId ||
      request?.customerId ||
      request?.requestSnapshot?.userId ||
      "";

    return {
      userId: travelerUserId,
      bookingId: currentRequestId || draft?.requestId || "",
      requestId: currentRequestId || draft?.requestId || "",
      title,
      destination,
      location,
      tripData,
      days,
      status: "Ready",
    };
  };

  const saveDraftInternal = async ({ showMessage, navigate } = { showMessage: true, navigate: true }) => {
    const payload = buildDraftPayload();
    const id = draftIdRef.current || draft?.id || `draft-${Date.now()}`;
    const title = normalized.title || request?.experience || request?.title || travelDetails.destination || "Itinerary Draft";
    const author = request?.name || request?.travelerName || request?.contactDetails?.firstName || "Traveler";

    const draftObj = {
      id,
      type: "itinerary",
      requestId: currentRequestId || draft?.requestId || "",
      title,
      author,
      lastEdit: new Date().toISOString(),
      progress: calcProgress(payload),
      payload,
    };

    await persistImagesToIdb(id, daysData);

    const existing = readDrafts();
    const next = [draftObj, ...existing.filter((d) => d?.id !== id)];

    try {
      writeDrafts(next);
    } catch (e) {
      const msg = String(e?.message || "");
      const isQuota = e?.name === "QuotaExceededError" || /quota/i.test(msg);
      if (!isQuota) throw e;

      const shrink = next.map((d) => {
        if (d?.id !== id) return d;
        const p = d?.payload || {};
        const compactDays = (Array.isArray(p?.daysData) ? p.daysData : []).map((day) => ({
          day: day?.day,
          activity: day?.activity || "",
          location: day?.location || "",
          description: day?.description || "",
          cost: day?.cost || "",
          startTime: day?.startTime || "",
          endTime: day?.endTime || "",
          imageDataUrl: "",
        }));
        return {
          ...d,
          payload: {
            travelDetails: p?.travelDetails || {},
            daysData: compactDays,
            requestSnapshot: null,
          },
        };
      });

      writeDrafts(shrink);
    }

    window.dispatchEvent(new Event("kufi_itinerary_drafts_updated"));

    if (showMessage) {
      setDraftSavedMessage("Saved to drafts");
    }

    if (navigate) {
      window.setTimeout(() => {
        onGoToBookings?.();
      }, 800);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      setDraftSavedMessage("");
      setSentSuccessMessage("");
      await saveDraftInternal({ showMessage: true, navigate: true });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!currentRequestId && !draftIdRef.current) return;
    if (isSaving || isSending) return;

    const t = window.setTimeout(() => {
      saveDraftInternal({ showMessage: false, navigate: false }).catch(() => {});
    }, 700);

    return () => window.clearTimeout(t);
  }, [travelDetails, daysData, currentRequestId, isSaving, isSending]);

  const handleSendToTraveler = async () => {
    try {
      setIsSending(true);
      setSentSuccessMessage("");
      setDraftSavedMessage("");
      const payload = buildDraftPayload();

      const apiPayload = buildItineraryApiPayload();
      const normalizedApiPayload = {
        ...apiPayload,
        userId: apiPayload?.userId ? String(apiPayload.userId) : "",
        bookingId: apiPayload?.bookingId ? String(apiPayload.bookingId) : "",
        requestId: apiPayload?.requestId ? String(apiPayload.requestId) : "",
      };

      if (!normalizedApiPayload.userId || !normalizedApiPayload.destination || !normalizedApiPayload.title) {
        console.warn(
          "Skipping backend itinerary persist: missing userId/title/destination",
          normalizedApiPayload
        );
        setSentSuccessMessage("Failed to send itinerary: missing traveler or trip details");
        return;
      }

      try {
        console.log("Sending itinerary to backend:", normalizedApiPayload);
        await api.post("/itineraries", normalizedApiPayload);
      } catch (e) {
        console.error("Failed to persist itinerary to backend:", e?.response?.data || e);
        const msg =
          e?.response?.data?.msg ||
          e?.response?.data?.message ||
          e?.message ||
          "Failed to send itinerary";
        setSentSuccessMessage(String(msg));
        return;
      }

      const sentKey = "kufi_supplier_sent_itineraries";
      const existing = safeParseJson(localStorage.getItem(sentKey));
      const list = Array.isArray(existing) ? existing : [];
      const record = {
        id: `sent-${Date.now()}`,
        requestId: currentRequestId || draft?.requestId || "",
        title: normalized.title || travelDetails.destination || "Itinerary",
        createdAt: new Date().toISOString(),
        payload,
      };
      localStorage.setItem(sentKey, JSON.stringify([record, ...list]));

      if (hasAdjustment) {
        const replyKey = 'kufi_adjustment_replies';
        const existingReplies = safeParseJson(localStorage.getItem(replyKey));
        const replyList = Array.isArray(existingReplies) ? existingReplies : [];
        const bookingId = currentRequestId || draft?.requestId || "";
        if (bookingId) {
          const replyRecord = { bookingId: String(bookingId), repliedAt: new Date().toISOString() };
          const nextReplies = [replyRecord, ...replyList.filter((x) => String(x?.bookingId || '') !== String(bookingId))];
          localStorage.setItem(replyKey, JSON.stringify(nextReplies));
        }
      }

      setSentSuccessMessage("Itinerary sent to traveler");
      window.setTimeout(() => {
        onGoToBookings?.();
      }, 900);
    } finally {
      setIsSending(false);
    }
  };

  const toggleDay = (day) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const updateDay = (day, patch) => {
    setDaysData((prev) => prev.map((d) => (d.day === day ? { ...d, ...patch } : d)));
  };

  const handleAddNewDay = () => {
    setDaysData((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const nextDay = list.length + 1;
      return [...list, createEmptyDay(nextDay)];
    });
  };

  return (
    <div className={`space-y-5 transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
        <h1 className={`text-xl font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Generate Itinerary</h1>
        <p className={`text-sm transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
          Finalize trip details and review the budget before sending it to the traveler.
        </p>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`shrink-0 inline-flex items-center justify-center rounded-full border px-5 py-2 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            Back
          </button>
        )}
      </div>

      {draftSavedMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold transition-colors ${darkMode ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-300" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}
        >
          {draftSavedMessage}
        </div>
      )}

      {sentSuccessMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold transition-colors ${darkMode ? "bg-blue-900/20 border-blue-900/30 text-blue-200" : "bg-[#eef4ff] border-blue-100 text-blue-900"}`}
        >
          {sentSuccessMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2.1fr)_360px]">
        {/* Left: main */}
        <div className="space-y-5">
          {/* Travel details */}
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Travel Details</h2>

            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div className="space-y-1">
                <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Destination</p>
                <input
                  type="text"
                  value={travelDetails.destination}
                  onChange={(e) => setTravelDetails((p) => ({ ...p, destination: e.target.value }))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}
                />
              </div>

              <div className="space-y-1">
                <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Budget (USD)</p>
                <input
                  type="number"
                  value={travelDetails.budget}
                  onChange={(e) => setTravelDetails((p) => ({ ...p, budget: e.target.value }))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}
                />
              </div>

              <div className="space-y-1">
                <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Start Date</p>
                <input
                  type="date"
                  value={travelDetails.startDate}
                  onChange={(e) => setTravelDetails((p) => ({ ...p, startDate: e.target.value }))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white icon-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}
                />
              </div>

              <div className="space-y-1">
                <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>End Date</p>
                <input
                  type="date"
                  value={travelDetails.endDate}
                  onChange={(e) => setTravelDetails((p) => ({ ...p, endDate: e.target.value }))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white icon-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className={`font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Preferences</p>
              <textarea
                rows={2}
                value={travelDetails.preferences}
                onChange={(e) => setTravelDetails((p) => ({ ...p, preferences: e.target.value }))}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}
              />
            </div>
          </div>

          {/* Itinerary details */}
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Itinerary Details</h2>

            {hasAdjustment && adjustmentCard && (
              <div className={`rounded-2xl border px-4 py-4 text-xs transition-colors ${darkMode ? "bg-slate-950/30 border-slate-800" : "bg-amber-50/40 border-amber-100"}`}>
                <p className={`text-[11px] font-semibold mb-2 transition-colors ${darkMode ? "text-amber-300" : "text-[#a26e35]"}`}>
                  New Adjustment Card
                </p>
                <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                  <div className={`h-20 w-full overflow-hidden rounded-xl border transition-colors ${darkMode ? "border-slate-800 bg-slate-900" : "border-gray-100 bg-white"}`}>
                    {adjustmentCard.imageDataUrl ? (
                      <img src={adjustmentCard.imageDataUrl} alt="Adjustment" className="h-full w-full object-cover" />
                    ) : (
                      <div className={`h-full w-full flex items-center justify-center ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {adjustmentCard.title || '—'}
                    </p>
                    <p className={`text-[11px] transition-colors ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                      {adjustmentCard.description || '—'}
                    </p>
                    <div className={`flex flex-wrap gap-x-4 gap-y-1 text-[11px] transition-colors ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                      <span><span className="font-semibold">Location:</span> {adjustmentCard.location || '—'}</span>
                      <span><span className="font-semibold">Cost:</span> {adjustmentCard.cost || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasAdjustment && previousItinerary && Array.isArray(previousItinerary?.days) && previousItinerary.days.length > 0 && (
              <div className={`rounded-2xl border px-4 py-4 space-y-3 text-xs transition-colors ${darkMode ? "bg-slate-950/30 border-slate-800" : "bg-white border-gray-100"}`}>
                <p className={`text-[11px] font-semibold transition-colors ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Previous Itinerary (read-only)
                </p>
                <div className="space-y-2">
                  {previousItinerary.days.slice(0, 3).map((d) => (
                    <div key={d?.day || d?.title} className={`rounded-xl border px-3 py-2 transition-colors ${darkMode ? "border-slate-800 bg-slate-900/30" : "border-gray-100 bg-gray-50/40"}`}>
                      <p className={`text-[11px] font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                        Day {d?.day || ''} {d?.title ? `- ${d.title}` : ''}
                      </p>
                      <p className={`text-[11px] mt-1 transition-colors ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                        {d?.morning?.description || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day cards */}
            <div className="space-y-2">
              {(Array.isArray(daysData) ? daysData : []).map((d) => (
                <DayCard
                  key={d.day}
                  day={d.day}
                  darkMode={darkMode}
                  expanded={expandedDays.includes(d.day)}
                  onToggle={toggleDay}
                  dayData={d}
                  onUpdateDay={updateDay}
                  onBrowseImage={handleBrowseImage}
                  onRemoveImage={handleRemoveImage}
                  activityOptions={activityOptions}
                  locationOptions={locationOptions}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddNewDay}
              className={`w-full rounded-2xl border border-dashed transition-colors px-5 py-3 flex items-center justify-center text-xs cursor-pointer ${darkMode ? "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <span className="mr-2 text-lg">＋</span>
              Add New Day
            </button>

            <div className={`flex flex-col gap-3 border-t pt-4 mt-1 sm:flex-row sm:items-center sm:justify-between transition-colors ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveDraft}
                className={`inline-flex items-center justify-center rounded-full border px-6 py-2 text-xs font-medium transition-colors ${isSaving ? "opacity-70 cursor-not-allowed" : ""} ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
              >
                Save Draft
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={handleSendToTraveler}
                className={`inline-flex items-center justify-center rounded-full bg-[#a26e35] px-8 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#8b5e2d] transition-colors ${isSending ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {hasAdjustment ? 'Resend It' : 'Send to Traveler'}
              </button>
            </div>
          </div>

        </div>

        {/* Right: itinerary summary */}
        <aside className="space-y-4">
          <div className={`rounded-2xl border px-5 py-5 space-y-4 text-xs transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Itinerary Summary</h2>

            <div className={`space-y-2 transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>
              <div className="flex items-start gap-2">
                <MapPin className="mt-[2px] h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <p className={`text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>Destination</p>
                  <p className={`text-xs transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{travelDetails.destination || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CalendarDays className="mt-[2px] h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <p className={`text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>Duration</p>
                  <p className={`text-xs transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {(travelDetails.startDate || travelDetails.endDate)
                      ? `${travelDetails.startDate || '—'} - ${travelDetails.endDate || '—'}`
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="mt-[2px] h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <p className={`text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>Travelers</p>
                  <p className={`text-xs transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{normalized.guests || "—"}</p>
                </div>
              </div>
            </div>

            <div className={`border-t transition-colors ${darkMode ? "border-slate-800" : "border-gray-100"} pt-3`} />

            <div className={`space-y-1 text-xs transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>
              <p className={`text-[11px] font-semibold mb-1 transition-colors ${darkMode ? "text-slate-300" : "text-gray-700"}`}>Cost Breakdown</p>
              <div className="flex items-center justify-between">
                <span>Total Budget</span>
                <span className={`font-medium transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{formatMoney(totalBudgetValue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Itinerary Cost</span>
                <span className={`font-medium transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{formatRange(clientBudgetRange)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Remaining</span>
                <span className="font-semibold text-emerald-600">{remainingBudgetDisplay}</span>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border transition-colors px-4 py-4 text-[11px] flex gap-2 ${darkMode ? "bg-blue-900/20 border-blue-900/30 text-blue-300" : "bg-[#eef4ff] border-blue-100 text-blue-900"}`}>
            <div className="mt-0.5">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold opacity-100">Ready to send?</p>
              <p className="opacity-90">
                Review all activities before sending the itinerary to the traveler.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SupplierGenerateItinerary;
