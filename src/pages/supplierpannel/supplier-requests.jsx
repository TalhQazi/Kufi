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

const SupplierRequests = ({ darkMode }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState("list"); // 'list' | 'itinerary' | 'generate'
  const [acceptedRequestId, setAcceptedRequestId] = useState(null);
  const [itineraryRequestId, setItineraryRequestId] = useState(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/bookings/supplier?status=pending');
      const data = response.data.bookings || [];
      setRequests(data);
      if (data.length > 0) setSelectedId(data[0].id || data[0]._id);
    } catch (error) {
      console.error("Error fetching supplier requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      alert(`Request ${status} successfully`);
      fetchRequests();
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      alert(`Failed to ${status} request`);
    }
  };

  const selected = requests.find((r) => (r.id || r._id) === selectedId) || (requests.length > 0 ? requests[0] : null);
  const itineraryRequest =
    requests.find((r) => (r.id || r._id) === itineraryRequestId) || selected;

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
        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>No pending requests found</p>
      </div>
    );
  }

  if (view === "itinerary" && itineraryRequest) {
    return (
      <div className={`space-y-6 transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-tr from-[#1f2933] via-[#4b5563] to-[#9ca3af] relative h-40 sm:h-48 flex items-end">
          <img
            src="https://images.pexels.com/photos/5700446/pexels-photo-5700446.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="City skyline"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="relative w-full px-4 sm:px-6 pb-4 sm:pb-6 text-white flex flex-col gap-1 sm:gap-2">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-gray-200 flex items-center gap-1">
              <span className="opacity-80">Dashboard</span>
              <span className="opacity-60">/</span>
              <span className="opacity-80">Requests</span>
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold drop-shadow-sm">
              Proceed to Create Itinerary
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-100 max-w-xl line-clamp-2 sm:line-clamp-none">
              Review traveler preferences and choose a personalized itinerary plan.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-3xl border transition-colors duration-300 px-6 py-5 shadow-sm ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`mb-3 text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
              Traveler Overview
            </h2>

            <div className={`grid gap-4 text-[11px] transition-colors sm:grid-cols-2 lg:grid-cols-3 ${darkMode ? "text-slate-400" : "text-gray-700"}`}>
              <div className="space-y-1">
                <p className={`font-semibold flex items-center gap-1.5 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  Destination
                </p>
                <p className={`text-sm transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{itineraryRequest.location || itineraryRequest.experience}</p>
              </div>

              <div className="space-y-1">
                <p className={`font-semibold flex items-center gap-1.5 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                  Dates
                </p>
                <p className={`text-sm transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{itineraryRequest.dateRange || itineraryRequest.date}</p>
              </div>

              <div className="space-y-1">
                <p className={`font-semibold flex items-center gap-1.5 ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  Travelers
                </p>
                <p className={`text-sm transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{itineraryRequest.travelers || itineraryRequest.guests} Adults</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setView("generate")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a26e35] px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#8b5e2d] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Proceed to auto generate Itinerary</span>
          </button>
        </div>

        <div className={`flex flex-col gap-3 border-t pt-4 mt-2 sm:flex-row sm:items-center sm:justify-between transition-colors ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-xs font-medium transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            <span className="mr-2 rotate-180">➜</span>
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  if (view === "generate") {
    return <SupplierGenerateItinerary darkMode={darkMode} />;
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
                  <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${darkMode ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
                    {req.status}
                  </span>
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
                  disabled={acceptedRequestId !== (req.id || req._id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (acceptedRequestId === (req.id || req._id)) {
                      setItineraryRequestId(req.id || req._id);
                      setView("itinerary");
                    }
                  }}
                  className={`inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${acceptedRequestId === (req.id || req._id)
                    ? "bg-[#a26e35] text-white shadow-sm hover:bg-[#8b5e2d]"
                    : (darkMode ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")
                    }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Proceed To Create Itinerary</span>
                </button>
                <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(req.id || req._id, 'Confirmed');
                      setAcceptedRequestId(req.id || req._id);
                    }}
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                  >
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(req.id || req._id, 'Cancelled');
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
                <div>
                  <p className={`text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>Email</p>
                  <p className={`text-xs transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{selected.email || "N/A"}</p>
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
