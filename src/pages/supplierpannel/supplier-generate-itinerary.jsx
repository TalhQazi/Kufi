import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Users, DollarSign, Info } from "lucide-react";
import api from "../../api";

const DRAFTS_STORAGE_KEY = "kufi_supplier_itinerary_drafts";

const createEmptyDay = (day) => ({
  day,
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
                <option value="Museum visit">Museum visit</option>
                <option value="Seine river cruise">Seine river cruise</option>
                <option value="City walking tour">City walking tour</option>
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
                <option value="Louvre Museum">Louvre Museum</option>
                <option value="Montmartre">Montmartre</option>
                <option value="Notre-Dame Area">Notre-Dame Area</option>
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

  useEffect(() => {
    if (normalized.location) {
      setTravelDetails((prev) => ({
        ...prev,
        destination: normalized.location,
        budget: normalized.budget,
        startDate: normalized.startDate,
        endDate: normalized.endDate,
        preferences: normalized.preferencesText,
      }));
    }

    if (Array.isArray(draft?.payload?.daysData) && draft.payload.daysData.length > 0) {
      setDaysData(draft.payload.daysData);
    }
  }, [draft, normalized.location, normalized.budget, normalized.startDate, normalized.endDate, normalized.preferencesText]);

  useEffect(() => {
    if (Array.isArray(draft?.payload?.daysData) && draft.payload.daysData.length > 0) return;

    const activitiesCount = Array.isArray(request?.items) ? request.items.length : 0;
    const target = Math.max(1, activitiesCount || 0);

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

  const safeParseJson = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const readDrafts = () => {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    const parsed = safeParseJson(raw);
    return Array.isArray(parsed) ? parsed : [];
  };

  const writeDrafts = (list) => {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(Array.isArray(list) ? list : []));
  };

  const currentRequestId = request?._id || request?.id || request?.bookingId || request?.requestId || "";

  const handleBrowseImage = (day, file) => {
    if (!file) return;
    if (!String(file.type || "").toLowerCase().startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setDaysData((prev) => prev.map((d) => (d.day === day ? { ...d, imageDataUrl: result } : d)));
    };
    reader.readAsDataURL(file);
  };

  const buildDraftPayload = () => {
    return {
      travelDetails,
      daysData,
      requestSnapshot: request || null,
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

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      setDraftSavedMessage("");
      setSentSuccessMessage("");
      const payload = buildDraftPayload();
      const id = draft?.id || `draft-${Date.now()}`;
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

      const existing = readDrafts();
      const next = [draftObj, ...existing.filter((d) => d?.id !== id)];
      writeDrafts(next);
      window.dispatchEvent(new Event("kufi_itinerary_drafts_updated"));

      setDraftSavedMessage("Saved to drafts");
      window.setTimeout(() => {
        onGoToBookings?.();
      }, 800);
    } finally {
      setIsSaving(false);
    }
  };

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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)]">
        {/* Left: travel details + itinerary days */}
        <div className="space-y-4">
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
                  onRemoveImage={(targetDay) => updateDay(targetDay, { imageDataUrl: "" })}
                />
              ))}
            </div>
          </div>

          {/* Add day & actions */}
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
              Send to Traveler
            </button>
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
                <span className={`font-medium transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{travelDetails.budget ? `$${travelDetails.budget}` : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Itinerary Cost</span>
                <span className={`font-medium transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>$1,350</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Remaining</span>
                <span className="font-semibold text-emerald-600">$3,650</span>
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
