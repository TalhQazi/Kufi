import api from "../../api";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import SupplierGenerateItinerary from "./supplier-generate-itinerary";

const SupplierRequests = ({ darkMode, resumeDraft, onDraftConsumed, onGoToBookings }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("list"); // 'list' | 'itinerary' | 'generate'
  const [itineraryRequestId, setItineraryRequestId] = useState(null);
  const [resumeItineraryDraft, setResumeItineraryDraft] = useState(null);
  const [showTemplate, setShowTemplate] = useState(false);

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

  const hasAdjustment = (req) => {
    const card = req?.adjustmentCard;
    if (!card) return false;
    const fields = [card?.title, card?.description, card?.location, card?.cost, card?.imageDataUrl];
    return fields.some((v) => String(v || "").trim());
  };

  // Load requests from database (GET /supplier/bookings)
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
        const totalGuests = r.items
          ? r.items.reduce((sum, item) => sum + (item.travelers || 0), 0)
          : (r.guests ?? r.travelers ?? r.pax ?? 0);

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

  useEffect(() => {
    fetchRequests();
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
      // Optimistic update so the request stays visible and Proceed can enable immediately.
      setRequests((prev) =>
        prev.map((r) => ((r.id || r._id) === id ? { ...r, status: normalizedStatus } : r))
      );
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

  const selected = requests.find((r) => (r.id || r._id) === selectedId) || (requests.length > 0 ? requests[0] : null);
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
    const heroImage = itineraryImages[0] || "https://images.pexels.com/photos/5700446/pexels-photo-5700446.jpeg?auto=compress&cs=tinysrgb&w=1200";
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
                {itineraryRequest.dateRange || itineraryRequest.date || "—"}
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
         <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => setShowTemplate(true)}
            className="inline-flex w-full max-w-[720px] items-center justify-center gap-2 rounded-full bg-[#a26e35] px-8 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#8b5e2d] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Proceed to auto generate Itinerary</span>
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
                  <img src={heroImage} alt="Template" className="absolute inset-0 h-full w-full object-cover" />
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
                        {itineraryRequest.dateRange || itineraryRequest.date || "—"}
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
                    Select Template
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

        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id || req._id}
              className={`rounded-2xl border px-5 py-4 shadow-sm cursor-pointer transition-all ${((req.id || req._id) === selectedId) ? (darkMode ? "border-amber-500/50 bg-slate-800/50" : "border-[#a26e35]/50 bg-amber-50/30") : (darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100")}`}
              onClick={() => setSelectedId(req.id || req._id)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={req.avatar || "/assets/profile-avatar.jpeg"}
                  alt={req.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex flex-col gap-1">
                  <p className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {req.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${darkMode ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
                      {formatStatusLabel(req.status)}
                    </span>
                    {hasAdjustment(req) && (
                      <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-50 text-blue-700"}`}>
                        Requested Adjustment
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={`mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-[12px] transition-colors ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  {req.location || req.experience}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                  {req.dateRange || req.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  {req.travelers || req.guests} Travelers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  {req.amount}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-t transition-colors pt-4" style={{ borderColor: darkMode ? "#1e293b" : "#f1f5f9" }}>
                <button
                  type="button"
                  disabled={(() => {
                    const normalizedStatus = String(req.status || '').trim().toLowerCase();
                    if (hasAdjustment(req)) return false;
                    return normalizedStatus !== 'confirmed';
                  })()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setItineraryRequestId(req.id || req._id);
                    setView(hasAdjustment(req) ? "generate" : "itinerary");
                  }}
                  className={`inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${(String(req.status || '').trim().toLowerCase() === 'confirmed')
                    ? "bg-[#a26e35] text-white shadow-sm hover:bg-[#8b5e2d]"
                    : (darkMode ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")
                    }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{hasAdjustment(req) ? 'View Adjustment Itinerary' : 'Proceed To Create Itinerary'}</span>
                </button>
                <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(req.id || req._id, 'confirmed');
                    }}
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                  >
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(req.id || req._id, 'cancelled');
                    }}
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-600 transition-colors"
                  >
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="space-y-4">
        {selected && (
          <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className={`flex items-center justify-between px-5 py-3 border-b transition-colors ${darkMode ? "bg-slate-800/50 border-slate-800" : "bg-gray-50 border-gray-100"}`}>
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
                            "/assets/dest-1.jpeg";
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
