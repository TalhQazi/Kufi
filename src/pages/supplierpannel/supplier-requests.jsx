import api from "../../api";
import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  X,
  Mail,
  Phone,
  Heart,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SupplierGenerateItinerary from "./supplier-generate-itinerary";
import { PROCEED_WITH_AI_LABEL } from "../../constants/itineraryLabels";

const openAiItinerary = (setItineraryRequestId, setView, requestId) => {
  setItineraryRequestId(requestId);
  setView("generate");
};

const DEFAULT_ITINERARY_HERO =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80";

const handleImageError = (e, fallback = DEFAULT_ITINERARY_HERO) => {
  if (e.currentTarget.src !== fallback) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  }
};

const SupplierRequests = ({
  darkMode,
  resumeDraft,
  onDraftConsumed,
  onGoToBookings,
  initialItineraryRequestId = null,
  initialView = null,
  onInitialNavigationConsumed,
}) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("list"); // 'list' | 'itinerary' | 'generate'
  const [itineraryRequestId, setItineraryRequestId] = useState(null);
  const [resumeItineraryDraft, setResumeItineraryDraft] = useState(null);
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
    if (!initialItineraryRequestId) return;
    setItineraryRequestId(initialItineraryRequestId);
    setView(initialView || "generate");
    onInitialNavigationConsumed?.();
  }, [initialItineraryRequestId, initialView, onInitialNavigationConsumed]);
  const [expandedGroups, setExpandedGroups] = useState(new Set()); // Track expanded user groups
  const [currentChildIndex, setCurrentChildIndex] = useState({}); // Track carousel index per group
  const [bookingTerms, setBookingTerms] = useState([]); // Dynamic booking terms from admin

  const safeParseJson = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const readAdjustmentStore = () => {
    const parsed = safeParseJson(localStorage.getItem('kufi_adjustment_requests'));
    return Array.isArray(parsed) ? parsed : [];
  };

  const formatStatusLabel = (value) => {
    const v = String(value || "").trim().toLowerCase();
    if (!v) return "Pending";
    return v.charAt(0).toUpperCase() + v.slice(1);
  };

  const formatTripDate = (value) => {
    if (value === null || value === undefined) return "—";
    const v = String(value || "").trim();
    if (!v) return "—";

    // Common case: ISO string e.g. 2026-03-03T00:00:00.000Z
    const isoMatch = v.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch?.[1]) return isoMatch[1];

    // Try parsing if it's some other date-like string
    const t = Date.parse(v);
    if (Number.isFinite(t)) {
      return new Date(t).toISOString().slice(0, 10);
    }

    return v;
  };

  const hasAdjustment = (req) => {
    const card = req?.adjustmentCard;
    if (!card) return false;
    const fields = [card?.title, card?.description, card?.location, card?.cost, card?.imageDataUrl];
    return fields.some((v) => String(v || "").trim());
  };

  // Group requests by user email - creates parent-child node structure
  const groupedRequests = useMemo(() => {
    const groups = {};
    
    requests.forEach((req) => {
      // Use email as unique identifier for user, fallback to name
      const userKey = req.email || req.name || 'unknown';
      if (!groups[userKey]) {
        groups[userKey] = {
          user: {
            name: req.name,
            email: req.email,
            avatar: req.avatar,
            phone: req.phone,
          },
          requests: [],
        };
      }
      groups[userKey].requests.push(req);
    });
    
    // Convert to array and sort each group's requests by date (newest first)
    return Object.values(groups).map((group) => ({
      ...group,
      requests: group.requests.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB - dateA;
      }),
    }));
  }, [requests]);

  // Toggle group expand/collapse
  const toggleGroup = (userKey) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(userKey)) {
        next.delete(userKey);
      } else {
        next.add(userKey);
      }
      return next;
    });
  };
  const fetchRequests = async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      // Uses supplier bookings endpoint from backend; it may return all statuses
      const response = await api.get("/supplier/bookings");
      // Be flexible with backend response shapes: {bookings}, {requests}, {data}, or array
      const raw =
        response.data?.bookings ??
        response.data?.requests ??
        response.data?.data ??
        response.data;
      const list = Array.isArray(raw) ? raw : [];
      const adjustments = readAdjustmentStore();
      // Normalize for DB fields (id/_id, name, email, experience, location, date, guests, etc.)
      const normalized = list.map((r) => {
        const bookingId = r.id ?? r._id;
        const adjustmentRecord = adjustments.find((x) => String(x?.bookingId || '') === String(bookingId || ''));

        const pickNonEmpty = (...values) => {
          for (const v of values) {
            if (v === null || v === undefined) continue;
            const s = String(v).trim();
            if (s) return v;
          }
          return undefined;
        };

        // Calculate experience titles from items
        const experienceTitles = r.items
          ? r.items.map(item => item.activity?.title || item.title).filter(Boolean).join(', ')
          : (r.experience || r.title || r.activity || "");

        // Calculate total guests
        const bookingLevelGuests = r.guests ?? r.travelers ?? r.pax;
        const itemGuests = Array.isArray(r.items)
          ? r.items
              .map((item) => Number(item?.travelers) || 0)
              .filter((n) => n > 0)
          : [];
        const fallbackItemGuests = itemGuests.length > 0 ? Math.max(...itemGuests) : 0;
        const totalGuests =
          (Number(bookingLevelGuests) || 0) > 0
            ? Number(bookingLevelGuests)
            : fallbackItemGuests;

        return {
          ...r,
          id: bookingId,
          // Prefer populated user fields, then contactDetails, then fallback
          name: (r.contactDetails?.firstName ? `${r.contactDetails.firstName} ${r.contactDetails.lastName || ''}`.trim() : "") || r.user?.name || (r.name ?? r.travelerName ?? r.userName ?? "—"),
          email: r.contactDetails?.email || r.user?.email || r.email || r.contactEmail || r.travelerEmail || "",
          phone: r.contactDetails?.phone || r.user?.phone || r.phone || "N/A",
          experience: experienceTitles,
          location: r.tripDetails?.country ?? r.location ?? r.destination ?? "—",
          date: r.date ?? r.dateRange ?? r.startDate ?? "Flexible",
          travelers: totalGuests || 1,
          guests: totalGuests || 1,
          amount: pickNonEmpty(
            r.tripDetails?.budget,
            r.tripDetails?.budgetUSD,
            r.tripDetails?.totalBudget,
            r.tripDetails?.estimatedBudget,
            r.budget,
            r.tripData?.budget,
            r.amount,
            r.totalAmount,
            r.price
          ) ?? "N/A",
          status: String(r.status || "pending").trim().toLowerCase(),
          avatar: r.user?.avatar ?? r.avatar ?? r.image ?? r.profileImage ?? "",
          preferences: r.preferences || {},
          adjustmentCard: r?.adjustmentCard || adjustmentRecord?.card || null,
          adjustmentRequestedAt: r?.adjustmentRequestedAt || adjustmentRecord?.createdAt || null,
        };
      });
      // Frontend safety: prefer only pending, but if nothing matches, show all
      const finalList = [...normalized].sort((a, b) => {
        const aPending = String(a.status || '').trim().toLowerCase() === 'pending'
        const bPending = String(b.status || '').trim().toLowerCase() === 'pending'
        if (aPending === bPending) return 0
        return aPending ? -1 : 1
      });

      setRequests(finalList);

      // If none selected yet, pick the first one
      if (!silent) {
        if (finalList.length > 0) {
          setSelectedId((prev) =>
            prev && finalList.some((r) => (r.id || r._id) === prev)
              ? prev
              : (finalList[0].id || finalList[0]._id)
          );
        } else {
          setSelectedId(null);
        }
      }
    } catch (error) {
      console.error("Error fetching supplier requests from database:", error);
      setRequests([]);
      if (!silent) setSelectedId(null);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Fetch booking terms from admin panel
  const fetchBookingTerms = async () => {
    try {
      const response = await api.get("/booking-terms?isActive=true");
      const terms = response.data || [];
      setBookingTerms(terms);
    } catch (error) {
      console.error("Error fetching booking terms:", error);
      setBookingTerms([]);
    }
  };

  // Helper to get preference display value from bookingTermSelections
  const getPreferenceValue = (term, request) => {
    if (!term) return "No";
    
    const termId = term._id || term.id;
    const selections = request?.bookingTermSelections || {};
    
    // Get selected options for this term
    const selectedOptions = selections[termId] || [];
    
    if (selectedOptions.length > 0) {
      // Join multiple selections with comma
      return selectedOptions.join(", ");
    }
    
    // Fallback to old preferences format for backward compatibility
    const preferences = request?.preferences || {};
    const termTitle = String(term.title || "").toLowerCase().trim();
    
    // Direct field mapping based on common term titles
    if (termTitle.includes("hotel") && termTitle.includes("own")) {
      return preferences.hotelOwn ? "Yes" : "No";
    }
    if (termTitle.includes("hotel") || termTitle.includes("stay")) {
      return (preferences.includeHotel || preferences.hotelIncluded) ? "Yes" : "No";
    }
    if (termTitle.includes("food") || termTitle.includes("meal")) {
      return preferences.foodAllGood ? "All Good" : "Standard";
    }
    if (termTitle.includes("veg") || termTitle.includes("vegetarian")) {
      return preferences.vegetarian ? "Yes" : "No";
    }
    if (termTitle.includes("kufi") || termTitle.includes("guide")) {
      return (preferences.kufiTravel || preferences.guide || preferences.tour) ? "Yes" : "No";
    }
    
    return "No";
  };

  // Helper to check if preference is active/positive
  const isPreferenceActive = (term, request) => {
    const value = getPreferenceValue(term, request);
    const inactiveValues = ["no", "standard", "", null, undefined];
    return !inactiveValues.includes(String(value).toLowerCase().trim());
  };

  useEffect(() => {
    fetchRequests();
    fetchBookingTerms();
  }, []);

  useEffect(() => {
    if (!resumeDraft) return;
    setResumeItineraryDraft(resumeDraft);

    const snap = resumeDraft?.payload?.requestSnapshot;
    const snapId = snap?._id || snap?.id;

    if (snap && snapId) {
      setItineraryRequestId(snapId);
      setSelectedId(snapId);
    } else if (resumeDraft?.requestId) {
      setItineraryRequestId(resumeDraft.requestId);
      setSelectedId(resumeDraft.requestId);
    }

    setView("generate");
    onDraftConsumed?.();
  }, [resumeDraft, onDraftConsumed]);

  useEffect(() => {
    if (view === "itinerary") setShowTemplate(false);
  }, [view]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const normalizedStatus = String(status || "").trim().toLowerCase();
      // Optimistic update:
      // - Accept keeps the request visible.
      // - Reject removes the request from this supplier (backend re-routes to another supplier).
      if (normalizedStatus === 'cancelled') {
        setRequests((prev) => {
          const next = (Array.isArray(prev) ? prev : []).filter((r) => (r.id || r._id) !== id);
          setSelectedId((selectedPrev) => {
            if (String(selectedPrev || '') !== String(id || '')) return selectedPrev;
            return next.length > 0 ? (next[0].id || next[0]._id) : null;
          });
          return next;
        });
      } else {
        setRequests((prev) =>
          prev.map((r) => ((r.id || r._id) === id ? { ...r, status: normalizedStatus } : r))
        );
      }
      await api.patch(`/bookings/${id}/status`, { status: normalizedStatus });
      fetchRequests({ silent: true });
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      fetchRequests({ silent: true });
    }
  };

  const getRequestImages = (req) => {
    const images = [];
    const push = (v) => {
      if (!v) return;
      const url = String(v).trim();
      if (!url) return;
      if (!images.includes(url)) images.push(url);
    };

    if (Array.isArray(req?.items)) {
      req.items.forEach((item) => {
        push(item?.activity?.imageUrl);
        push(item?.activity?.image);
        if (Array.isArray(item?.activity?.images)) item.activity.images.forEach(push);
        push(item?.imageUrl);
        push(item?.image);
        if (Array.isArray(item?.images)) item.images.forEach(push);
      });
    }

    push(req?.imageUrl);
    push(req?.image);
    push(req?.avatar);

    return images;
  };

  // Find selected request from either flat array or grouped requests (for child requests)
  const selected = useMemo(() => {
    // First try to find in flat requests array
    const fromRequests = requests.find((r) => (r.id || r._id) === selectedId);
    if (fromRequests) return fromRequests;
    
    // If not found, search through grouped requests (child requests)
    for (const group of Object.values(groupedRequests)) {
      const fromGroup = group.requests.find((r) => (r.id || r._id) === selectedId);
      if (fromGroup) return fromGroup;
    }
    
    // Fallback to first request
    return requests.length > 0 ? requests[0] : null;
  }, [requests, selectedId, groupedRequests]);
  
  const itineraryRequest =
    requests.find((r) => (r.id || r._id) === itineraryRequestId) || selected || resumeItineraryDraft?.payload?.requestSnapshot || null;

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a26e35]"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <Sparkles className="h-12 w-12 text-[#a26e35] opacity-20" />
        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>No requests found</p>
      </div>
    );
  }

  if (view === "itinerary" && itineraryRequest) {
    const itineraryImages = getRequestImages(itineraryRequest);
    const heroImage = itineraryImages[0] || DEFAULT_ITINERARY_HERO;
    const gallery = itineraryImages.slice(0, 3);
    const itineraryActivities = Array.isArray(itineraryRequest?.items)
      ? itineraryRequest.items
          .map((item) => item?.activity?.title || item?.title)
          .filter(Boolean)
      : [];

    const travelerName =
      (itineraryRequest?.contactDetails?.firstName
        ? `${itineraryRequest.contactDetails.firstName} ${itineraryRequest.contactDetails.lastName || ''}`.trim()
        : '') ||
      itineraryRequest?.name ||
      itineraryRequest?.user?.name ||
      '—';

    const travelerEmail =
      itineraryRequest?.contactDetails?.email ||
      itineraryRequest?.email ||
      itineraryRequest?.user?.email ||
      '—';

    const travelerPhone =
      itineraryRequest?.contactDetails?.phone ||
      itineraryRequest?.phone ||
      itineraryRequest?.user?.phone ||
      '—';

    return (
      <div className={`space-y-6 transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
        <div className="overflow-hidden rounded-3xl relative h-44 sm:h-56 flex items-end">
          <img
            src={heroImage}
            alt="Trip cover"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => handleImageError(e)}
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative w-full px-4 sm:px-6 pb-4 sm:pb-6 text-white flex flex-col gap-2">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-gray-100 flex items-center gap-1">
              <span className="opacity-90">Requests</span>
              <span className="opacity-60">/</span>
              <span className="opacity-90">Proceed</span>
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold drop-shadow-sm">Proceed to Create Itinerary</h1>
            <p className="text-[11px] sm:text-xs text-gray-100 max-w-2xl">
              Traveler: <span className="font-semibold">{travelerName}</span>
            </p>
            <p className="text-[10px] sm:text-xs text-gray-100 max-w-2xl">
              Review traveler preferences and choose a personalized itinerary plan.
            </p>
            {gallery.length > 1 && (
              <div className="mt-2 flex items-center gap-2">
                {gallery.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt="Selected activity"
                    className="h-10 w-14 rounded-xl object-cover ring-2 ring-white/60"
                    onError={(e) => handleImageError(e)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

       

        <div className={`rounded-3xl border transition-colors duration-300 px-6 py-5 shadow-sm ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <h2 className={`mb-4 text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
            Traveler Overview
          </h2>

          <div className={`grid gap-4 text-[11px] transition-colors sm:grid-cols-2 lg:grid-cols-3 ${darkMode ? "text-slate-400" : "text-gray-700"}`}>
            <div className="space-y-1">
              <p className={`font-semibold flex items-center gap-1.5 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                Destination
              </p>
              <p className={`text-sm transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                {itineraryRequest.location || itineraryRequest.experience || "—"}
              </p>
            </div>

            <div className="space-y-1">
              <p className={`font-semibold flex items-center gap-1.5 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                Dates
              </p>
              <p className={`text-sm transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                {(() => {
                  const arrival = formatTripDate(itineraryRequest?.tripDetails?.arrivalDate);
                  const departure = formatTripDate(itineraryRequest?.tripDetails?.departureDate);
                  if (arrival !== "—" && departure !== "—") {
                    return `${arrival} - ${departure}`;
                  }
                  return itineraryRequest.dateRange || itineraryRequest.date || "—";
                })()}
              </p>
            </div>

            <div className="space-y-1">
              <p className={`font-semibold flex items-center gap-1.5 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                <Users className="h-3.5 w-3.5 text-emerald-500" />
                Travelers
              </p>
              <p className={`text-sm transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                {itineraryRequest.guests ?? itineraryRequest.travelers ?? 0} Travelers
              </p>
            </div>

            <div className="space-y-1">
              <p className={`font-semibold flex items-center gap-1.5 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                Budget
              </p>
              <p className={`text-sm transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                {itineraryRequest.amount ?? "—"}
              </p>
            </div>

            <div className="space-y-1">
              <p className={`font-semibold flex items-center gap-1.5 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                <Mail className="h-3.5 w-3.5 text-emerald-500" />
                Email
              </p>
              <p className={`text-sm transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                {travelerEmail}
              </p>
            </div>

            <div className="space-y-1">
              <p className={`font-semibold flex items-center gap-1.5 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                <Phone className="h-3.5 w-3.5 text-emerald-500" />
                Phone
              </p>
              <p className={`text-sm transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                {travelerPhone}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t transition-colors" style={{ borderColor: darkMode ? "#1e293b" : "#f1f5f9" }}>
            <p className={`text-[10px] uppercase tracking-wider font-bold mb-3 ${darkMode ? "text-amber-500/80" : "text-[#a26e35]"}`}>
              Activities
            </p>

            {itineraryActivities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {itineraryActivities.map((title) => (
                  <span
                    key={title}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border transition-colors ${darkMode ? "bg-slate-800/50 border-slate-700 text-slate-200" : "bg-white border-gray-200 text-slate-700"}`}
                  >
                    {title}
                  </span>
                ))}
              </div>
            ) : (
              <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-gray-500"}`}>No activities selected</p>
            )}
          </div>
        </div>
         <div className="flex flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setView("generate")}
            className="inline-flex w-full max-w-[720px] items-center justify-center gap-2 rounded-full bg-[#a26e35] px-8 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#8b5e2d] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>{PROCEED_WITH_AI_LABEL}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTemplate(true)}
            className={`text-[11px] font-medium underline-offset-2 hover:underline ${darkMode ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-700"}`}
          >
            Preview recommended template first
          </button>
        </div>

        {showTemplate && (
          <div className="space-y-3">
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
              Recommended Itinerary Template
            </h2>

            <div className="flex items-center justify-center">
              <div className={`w-full max-w-[460px] rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
                <div className="relative h-44">
                  <img
                    src={heroImage}
                    alt="Template"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => handleImageError(e)}
                  />
                  <div className="absolute inset-0 bg-black/15" />
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                    Template
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={itineraryRequest.avatar || "/assets/profile-avatar.jpeg"}
                      alt={travelerName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                        {travelerName}
                      </p>
                      <p className={`text-[11px] transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                        {formatStatusLabel(itineraryRequest.status)} Request
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className={`text-[10px] uppercase tracking-wider font-bold ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                      Activities
                    </p>
                    <p className={`text-[11px] transition-colors ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                      {itineraryActivities.length > 0 ? itineraryActivities.join(', ') : '—'}
                    </p>
                  </div>

                  <div className={`grid grid-cols-2 gap-3 text-[11px] transition-colors ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                    <div className="inline-flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-emerald-500" />
                      <span className={`${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {itineraryRequest.guests ?? itineraryRequest.travelers ?? 0} Travelers
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      <span className={`${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {itineraryRequest.amount ?? "—"}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                      <span className={`truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {(() => {
                          const arrival = formatTripDate(itineraryRequest?.tripDetails?.arrivalDate);
                          const departure = formatTripDate(itineraryRequest?.tripDetails?.departureDate);
                          if (arrival !== "—" && departure !== "—") {
                            return `${arrival} - ${departure}`;
                          }
                          return itineraryRequest.dateRange || itineraryRequest.date || "—";
                        })()}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      <span className={`truncate ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {itineraryRequest.location || "—"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setView("generate")}
                    className={`w-full inline-flex items-center justify-center rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 text-slate-200 hover:bg-[#a26e35]" : "bg-[#a26e35] text-white hover:bg-[#a26e35]"}`}
                  >
                    {PROCEED_WITH_AI_LABEL}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`inline-flex w-full sm:w-auto items-center justify-center rounded-full border px-6 py-3 text-xs font-medium transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  if (view === "generate") {
    return (
      <SupplierGenerateItinerary
        darkMode={darkMode}
        request={itineraryRequest}
        draft={resumeItineraryDraft}
        onGoToBookings={onGoToBookings}
        onBack={() => setView("itinerary")}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)] transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={`text-xl font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Received Booking Request</h1>
            <p className={`mt-1 text-sm transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              Review and manage incoming travel requests
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Node Tree Structure - Grouped by User */}
          {Object.values(groupedRequests).map((group, groupIndex) => {
            const userKey = group.user.email || group.user.name || `group-${groupIndex}`;
            const isExpanded = expandedGroups.has(userKey);
            const parentRequest = group.requests[0];
            const childRequests = group.requests.slice(1);
            const hasChildren = childRequests.length > 0;

            return (
              <div key={userKey} className="relative">
                {/* Connection Line for Node Tree */}
                {hasChildren && isExpanded && (
                  <div 
                    className="absolute left-6 top-16 w-0.5 bg-gradient-to-b from-emerald-400 to-emerald-200"
                    style={{ height: 'calc(100% - 80px)' }}
                  />
                )}

                {/* PARENT CARD - Largest */}
                <div
                  className={`rounded-2xl border px-6 py-5 shadow-md cursor-pointer transition-all relative z-10 ${
                    (parentRequest.id || parentRequest._id) === selectedId 
                      ? (darkMode ? "border-amber-500/50 bg-slate-800/70" : "border-[#a26e35]/50 bg-amber-50/50") 
                      : (darkMode ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white")
                  }`}
                  onClick={() => setSelectedId(parentRequest.id || parentRequest._id)}
                >
                  {/* Parent Badge */}
                  <div className="absolute -top-3 left-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      darkMode 
                        ? "bg-emerald-600 text-white" 
                        : "bg-emerald-500 text-white"
                    }`}>
                      Parent Request
                    </span>
                  </div>

                  <div className="flex items-start justify-between mt-2">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={parentRequest.avatar || "/assets/profile-avatar.jpeg"}
                          alt={parentRequest.name}
                          className="h-14 w-14 rounded-full object-cover border-3 border-emerald-200 shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">P</span>
                        </div>
                      </div>
                      <div>
                        <p className={`text-base font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                          {parentRequest.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                            darkMode ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-700"
                          }`}>
                            {formatStatusLabel(parentRequest.status)}
                          </span>
                          {hasChildren && (
                            <span className={`text-[11px] ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                              +{childRequests.length} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroup(userKey);
                        }}
                        className={`p-2 rounded-full transition-all ${
                          darkMode 
                            ? "hover:bg-slate-800 text-slate-400" 
                            : "hover:bg-gray-100 text-gray-500"
                        } ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className={`mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] transition-colors ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      {parentRequest.location || parentRequest.experience}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-emerald-500" />
                      {(() => {
                        const arrival = formatTripDate(parentRequest?.tripDetails?.arrivalDate);
                        const departure = formatTripDate(parentRequest?.tripDetails?.departureDate);
                        if (arrival !== "—" && departure !== "—") {
                          return `${arrival} - ${departure}`;
                        }
                        return parentRequest.dateRange || parentRequest.date || "—";
                      })()}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-emerald-500" />
                      {parentRequest.travelers || parentRequest.guests} Travelers
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      {parentRequest.amount}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-t transition-colors pt-4" style={{ borderColor: darkMode ? "#1e293b" : "#f1f5f9" }}>
                    <button
                      type="button"
                      disabled={(() => {
                        const normalizedStatus = String(parentRequest.status || '').trim().toLowerCase();
                        if (hasAdjustment(parentRequest)) return false;
                        return normalizedStatus !== 'confirmed';
                      })()}
                      onClick={(e) => {
                        e.stopPropagation();
                        openAiItinerary(setItineraryRequestId, setView, parentRequest.id || parentRequest._id);
                      }}
                      className={`inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[10px] sm:text-xs font-semibold text-center transition-all ${
                        (String(parentRequest.status || '').trim().toLowerCase() === 'confirmed')
                          ? "bg-[#a26e35] text-white shadow-sm hover:bg-[#8b5e2d]"
                          : (darkMode ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{hasAdjustment(parentRequest) ? "View Adjustment" : PROCEED_WITH_AI_LABEL}</span>
                    </button>
                    
                    {/* Parent Button Area - Accept/Reject */}
                    <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
                      {/* Accept Button - Hidden when confirmed */}
                      {(() => {
                        const parentStatus = String(parentRequest.status || '').trim().toLowerCase();
                        const isParentConfirmed = parentStatus === 'confirmed';
                        const isParentCancelled = parentStatus === 'cancelled';
                        return (
                          <>
                            {!isParentConfirmed && !isParentCancelled && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(parentRequest.id || parentRequest._id, 'confirmed');
                                }}
                                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                              >
                                Accept
                              </button>
                            )}
                            {/* Reject Button - Always visible unless cancelled */}
                            {!isParentCancelled && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(parentRequest.id || parentRequest._id, 'cancelled');
                                }}
                                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-600 transition-colors"
                              >
                                Reject
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* CHILD REQUESTS - Carousel Navigation */}
                  {isExpanded && childRequests.length > 0 && (
                    <div className="mt-4 pt-4 border-t transition-colors" style={{ borderColor: darkMode ? "#1e293b" : "#f1f5f9" }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className={`text-[10px] uppercase tracking-wider font-bold ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                          Additional Requests ({childRequests.length})
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentChildIndex(prev => ({
                                ...prev,
                                [userKey]: Math.max(0, (prev[userKey] || 0) - 1)
                              }));
                            }}
                            disabled={(currentChildIndex[userKey] || 0) === 0}
                            className={`p-1.5 rounded-full transition-colors ${
                              (currentChildIndex[userKey] || 0) === 0
                                ? (darkMode ? "text-slate-600" : "text-gray-300")
                                : (darkMode ? "text-slate-400 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100")
                            }`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className={`text-[11px] font-medium ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                            {(currentChildIndex[userKey] || 0) + 1} / {childRequests.length}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentChildIndex(prev => ({
                                ...prev,
                                [userKey]: Math.min(childRequests.length - 1, (prev[userKey] || 0) + 1)
                              }));
                            }}
                            disabled={(currentChildIndex[userKey] || 0) >= childRequests.length - 1}
                            className={`p-1.5 rounded-full transition-colors ${
                              (currentChildIndex[userKey] || 0) >= childRequests.length - 1
                                ? (darkMode ? "text-slate-600" : "text-gray-300")
                                : (darkMode ? "text-slate-400 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100")
                            }`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {(() => {
                        const childIndex = currentChildIndex[userKey] || 0;
                        const childReq = childRequests[childIndex];
                        const childStatus = String(childReq.status || '').trim().toLowerCase();
                        const isConfirmed = childStatus === 'confirmed';
                        const isCancelled = childStatus === 'cancelled';
                        return (
                          <div
                            key={childReq.id || childReq._id}
                            className={`rounded-2xl border px-6 py-5 shadow-md cursor-pointer transition-all relative ${
                              (childReq.id || childReq._id) === selectedId 
                                ? (darkMode ? "border-emerald-500/50 bg-slate-800/70" : "border-emerald-400/50 bg-emerald-50/50") 
                                : (darkMode ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white")
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(childReq.id || childReq._id);
                            }}
                          >
                            {/* Child Badge */}
                            <div className="absolute -top-3 left-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                darkMode 
                                  ? "bg-slate-600 text-white" 
                                  : "bg-gray-500 text-white"
                              }`}>
                                Child #{childIndex + 1}
                              </span>
                            </div>

                            <div className="flex items-start justify-between mt-2">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img
                                    src={childReq.avatar || "/assets/profile-avatar.jpeg"}
                                    alt={childReq.name}
                                    className="h-14 w-14 rounded-full object-cover border-3 border-slate-200 shadow-sm"
                                  />
                                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-slate-500 border-2 border-white flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-white">C</span>
                                  </div>
                                </div>
                                <div>
                                  <p className={`text-base font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                                    {childReq.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                                      darkMode ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-700"
                                    }`}>
                                      {formatStatusLabel(childReq.status)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className={`mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] transition-colors ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-emerald-500" />
                                {childReq.location || childReq.experience}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4 text-emerald-500" />
                                {(() => {
                                  const arrival = formatTripDate(childReq?.tripDetails?.arrivalDate);
                                  const departure = formatTripDate(childReq?.tripDetails?.departureDate);
                                  if (arrival !== "—" && departure !== "—") {
                                    return `${arrival} - ${departure}`;
                                  }
                                  return childReq.dateRange || childReq.date || "—";
                                })()}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Users className="h-4 w-4 text-emerald-500" />
                                {childReq.travelers || childReq.guests} Travelers
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                                {childReq.amount}
                              </span>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-t transition-colors pt-4" style={{ borderColor: darkMode ? "#1e293b" : "#f1f5f9" }}>
                              <button
                                type="button"
                                disabled={(() => {
                                  const normalizedStatus = String(childReq.status || '').trim().toLowerCase();
                                  if (hasAdjustment(childReq)) return false;
                                  return normalizedStatus !== 'confirmed';
                                })()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAiItinerary(setItineraryRequestId, setView, childReq.id || childReq._id);
                                }}
                                className={`inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[10px] sm:text-xs font-semibold text-center transition-all ${
                                  (String(childReq.status || '').trim().toLowerCase() === 'confirmed')
                                    ? "bg-[#a26e35] text-white shadow-sm hover:bg-[#8b5e2d]"
                                    : (darkMode ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")
                                }`}
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>{hasAdjustment(childReq) ? "View Adjustment" : PROCEED_WITH_AI_LABEL}</span>
                              </button>
                              
                              {/* Button Area - Accept/Reject */}
                              <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
                                {/* Accept Button - Hidden when confirmed */}
                                {!isConfirmed && !isCancelled && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusUpdate(childReq.id || childReq._id, 'confirmed');
                                    }}
                                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                                  >
                                    Accept
                                  </button>
                                )}
                                {/* Reject Button - Always visible unless cancelled */}
                                {!isCancelled && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusUpdate(childReq.id || childReq._id, 'cancelled');
                                    }}
                                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-600 transition-colors"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="space-y-4">
        {selected && (
          <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="px-5 py-4 border-b transition-colors" style={{ borderColor: darkMode ? "#1e293b" : "#f1f5f9" }}>
              <p className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Traveler Details</p>
            </div>
            <div className="px-5 py-4 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={selected.avatar || "/assets/profile-avatar.jpeg"}
                  alt={selected.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <p className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {selected.name}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium">Verified Traveler</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${darkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[10px] uppercase tracking-wider font-semibold transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Email</p>
                  <p className={`text-xs font-medium truncate transition-colors ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{selected.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${darkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                  <Phone className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[10px] uppercase tracking-wider font-semibold transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Phone</p>
                  <p className={`text-xs font-medium truncate transition-colors ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{selected.phone || "N/A"}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed transition-colors" style={{ borderColor: darkMode ? "#1e293b" : "#f1f5f9" }}>
                <p className={`text-[10px] uppercase tracking-wider font-bold mb-3 ${darkMode ? "text-amber-500/80" : "text-[#a26e35]"}`}>Trip Overview</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30 p-2 rounded-lg">
                    <span className={darkMode ? "text-slate-400" : "text-gray-500"}>Destination</span>
                    <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{selected.location}</span>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30 p-2 rounded-lg">
                    <span className={darkMode ? "text-slate-400" : "text-gray-500"}>Arrival Date</span>
                    <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {formatTripDate(selected?.tripDetails?.arrivalDate)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30 p-2 rounded-lg">
                    <span className={darkMode ? "text-slate-400" : "text-gray-500"}>Departure Date</span>
                    <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {formatTripDate(selected?.tripDetails?.departureDate)}
                    </span>
                  </div>

                  <div className={`rounded-xl border p-2 transition-colors ${darkMode ? "bg-slate-800/30 border-slate-800" : "bg-gray-50/50 border-gray-100"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={darkMode ? "text-slate-400" : "text-gray-500"}>Experiences</span>
                      <span className={`text-[10px] font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                        {Array.isArray(selected?.items) ? selected.items.length : 0}
                      </span>
                    </div>

                    {Array.isArray(selected?.items) && selected.items.length > 0 ? (
                      <div className="space-y-2">
                        {selected.items.map((item, idx) => {
                          const title = item?.activity?.title || item?.title || `Experience ${idx + 1}`;
                          const image =
                            item?.activity?.imageUrl ||
                            item?.activity?.images?.[0] ||
                            item?.activity?.image ||
                            item?.imageUrl ||
                            item?.image ||
                            DEFAULT_ITINERARY_HERO;
                          const travelers = item?.travelers;
                          return (
                            <div
                              key={item?._id || item?.id || `${title}-${idx}`}
                              className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${darkMode ? "bg-slate-900/30 border-slate-800" : "bg-white border-gray-100"}`}
                            >
                              <img
                                src={image}
                                alt={title}
                                className="h-9 w-10 rounded-lg object-cover shrink-0"
                                onError={(e) => handleImageError(e)}
                              />
                              <div className="min-w-0 flex-1">
                                <p className={`text-[11px] font-semibold truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{title}</p>
                                <p className={`text-[10px] truncate ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                                  {typeof travelers === 'number' ? `${travelers} Traveler${travelers === 1 ? '' : 's'}` : ""}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className={`text-[11px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>No experiences selected</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30 p-2 rounded-lg">
                    <span className={darkMode ? "text-slate-400" : "text-gray-500"}>Travelers</span>
                    <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{selected.guests} PAX</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30 p-2 rounded-lg">
                    <span className={darkMode ? "text-slate-400" : "text-gray-500"}>Budget</span>
                    <span className={`font-semibold text-emerald-500`}>{selected.amount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed transition-colors" style={{ borderColor: darkMode ? "#1e293b" : "#f1f5f9" }}>
                <p className={`text-[10px] uppercase tracking-wider font-bold mb-3 ${darkMode ? "text-amber-500/80" : "text-[#a26e35]"}`}>Preferences</p>
                <div className="grid grid-cols-2 gap-2">
                  {bookingTerms.length > 0 ? (
                    // Dynamic preferences from admin panel booking terms
                    bookingTerms.map((term) => {
                      const isActive = isPreferenceActive(term, selected);
                      const value = getPreferenceValue(term, selected);
                      return (
                        <div
                          key={term._id || term.title}
                          className={`flex flex-col gap-1 p-2 rounded-xl border ${
                            isActive
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400"
                              : "bg-gray-50 border-gray-100 text-gray-400 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500"
                          }`}
                        >
                          <span className="font-bold">{term.title}</span>
                          <span className="text-[9px] uppercase">{value}</span>
                        </div>
                      );
                    })
                  ) : (
                    // Fallback to static preferences if no booking terms available
                    <>
                      <div className={`flex flex-col gap-1 p-2 rounded-xl border ${selected.preferences?.includeHotel || selected.preferences?.hotelIncluded ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400" : "bg-gray-50 border-gray-100 text-gray-400 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500"}`}>
                        <span className="font-bold">Hotel</span>
                        <span className="text-[9px] uppercase">{(selected.preferences?.includeHotel || selected.preferences?.hotelIncluded) ? "Requested" : "No"}</span>
                      </div>
                      <div className={`flex flex-col gap-1 p-2 rounded-xl border ${selected.preferences?.vegetarian ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400" : "bg-gray-50 border-gray-100 text-gray-400 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500"}`}>
                        <span className="font-bold">Veg Only</span>
                        <span className="text-[9px] uppercase">{selected.preferences?.vegetarian ? "Yes" : "No"}</span>
                      </div>
                      <div className={`flex flex-col gap-1 p-2 rounded-xl border ${selected.preferences?.foodAllGood ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400" : "bg-gray-50 border-gray-100 text-gray-400 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500"}`}>
                        <span className="font-bold">Food</span>
                        <span className="text-[9px] uppercase">{selected.preferences?.foodAllGood ? "All Good" : "Standard"}</span>
                      </div>
                      <div className={`flex flex-col gap-1 p-2 rounded-xl border ${selected.preferences?.hotelOwn ? "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400" : "bg-gray-50 border-gray-100 text-gray-400 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500"}`}>
                        <span className="font-bold">Own Hotel</span>
                        <span className="text-[9px] uppercase">{selected.preferences?.hotelOwn ? "Yes" : "No"}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default SupplierRequests;
