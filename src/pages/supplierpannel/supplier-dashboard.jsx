import api from "../../api";
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  CalendarDays,
  Star,
  Briefcase,
  ChevronDown,
  Bell,
  Settings,
  Clock3,
  Check,
  X as XIcon,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import SupplierSidebar from "./components/SupplierSidebar";
import SupplierExperience from "./supplier-experience";
import SupplierBookings from "./supplier-bookings";
import SupplierAnalytics from "./supplier-analytics";
import SupplierProfile from "./supplier-profile";
import SupplierRequests from "./supplier-requests";
import ProfilePic from "../../components/ui/ProfilePic";

const SupplierDashboard = ({ onLogout, onHomeClick }) => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [experienceView, setExperienceView] = useState("list");
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState(["Dashboard"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [travelerStats, setTravelerStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeItineraryDraft, setResumeItineraryDraft] = useState(null);

  useEffect(() => {
    const fetchSupplierDashboard = async () => {
      try {
        setIsLoading(true);
        const [bookingsRes, activitiesRes, statsRes] = await Promise.all([
          api.get('/supplier/bookings'),
          api.get('/supplier/activities'),
          api.get('/supplier/stats').catch(() => ({ data: null })),
        ]);

        const bookingsRaw = Array.isArray(bookingsRes?.data)
          ? bookingsRes.data
          : (bookingsRes?.data?.bookings || bookingsRes?.data?.data || []);
        const allBookings = Array.isArray(bookingsRaw) ? bookingsRaw : [];

        const experiencesList = Array.isArray(activitiesRes.data)
          ? activitiesRes.data
          : (activitiesRes.data?.activities || activitiesRes.data?.data || []);

        const normalizeStatus = (value) => String(value || '').trim().toLowerCase();
        const statusCounts = allBookings.reduce((acc, b) => {
          const s = normalizeStatus(b?.status);
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});

        const totalBookings = allBookings.length;
        const pendingCount = statusCounts.pending || 0;
        const confirmedCount = (statusCounts.confirmed || 0) + (statusCounts.accepted || 0);
        const rejectedCount = statusCounts.rejected || 0;

        const revenueFromBudgets = allBookings.reduce((sum, b) => {
          const status = normalizeStatus(b?.status);
          if (status !== 'confirmed' && status !== 'accepted') return sum;
          const budget =
            b?.tripDetails?.budget ??
            b?.budget ??
            b?.amount ??
            b?.totalAmount ??
            b?.price ??
            0;
          const n = Number(budget);
          return Number.isFinite(n) ? sum + n : sum;
        }, 0);

        const revenue = revenueFromBudgets > 0 ? revenueFromBudgets : (confirmedCount * 120);

        const statsApi = statsRes?.data || {};
        const ratings = (Array.isArray(experiencesList) ? experiencesList : [])
          .map((exp) => Number(exp?.rating))
          .filter((n) => Number.isFinite(n) && n > 0);
        const avgRatingFromActivities = ratings.length > 0
          ? (ratings.reduce((sum, n) => sum + n, 0) / ratings.length)
          : 0;
        const avgRating = Number.isFinite(Number(statsApi?.avgRating))
          ? Number(statsApi.avgRating)
          : avgRatingFromActivities;

        setStats([
          { label: "Total Revenue", value: `$${revenue}`, delta: "Live", icon: DollarSign },
          { label: "Active Bookings", value: String(confirmedCount), delta: "Live", icon: CalendarDays },
          { label: "Average Rating", value: String(avgRating.toFixed(1)), delta: "Live", icon: Star },
          { label: "Experiences", value: String(experiencesList.length), delta: "Live", icon: Briefcase },
        ]);

        const normalizeBooking = (r) => {
          const experienceTitles = r.items
            ? r.items.map(item => item.activity?.title || item.title).filter(Boolean).join(', ')
            : (r.experience || r.title || r.activity || "");

          const totalGuests = r.items
            ? r.items.reduce((sum, item) => sum + (item.travelers || 0), 0)
            : (r.guests ?? r.travelers ?? r.pax ?? 0);

          return {
            ...r,
            id: r.id ?? r._id,
            name: r.user?.name ?? (r.contactDetails?.firstName ? `${r.contactDetails.firstName} ${r.contactDetails.lastName || ''}`.trim() : (r.name ?? r.travelerName ?? r.userName ?? "—")),
            experience: experienceTitles,
            guests: totalGuests || 1,
            status: r.status ?? "Pending"
          };
        };

        const pendingList = allBookings
          .filter((b) => String(b?.status || '').trim().toLowerCase() === 'pending')
          .map(normalizeBooking);
        setPendingRequests(pendingList);

        const normalizedAllRequests = allBookings.map(normalizeBooking);
        setAllRequests(normalizedAllRequests);

        const recentList = [...allBookings]
          .sort((a, b) => {
            const ad = new Date(a?.createdAt || 0).getTime();
            const bd = new Date(b?.createdAt || 0).getTime();
            return bd - ad;
          })
          .slice(0, 5)
          .map(normalizeBooking);
        setRecentBookings(recentList);

        if (normalizedAllRequests.length === 0) {
          setSelectedRequestId(null);
        } else {
          setSelectedRequestId((prev) => (prev && normalizedAllRequests.some((r) => (r.id || r._id) === prev) ? prev : (normalizedAllRequests[0].id || normalizedAllRequests[0]._id)));
        }

        setExperiences(experiencesList);

        const totalRequestsCount = normalizedAllRequests.length;
        setTravelerStats([
          { label: "Total Requests", value: totalRequestsCount, icon: Clock3 },
          { label: "Accepted Requests", value: confirmedCount, icon: Check },
          { label: "Rejected Requests", value: rejectedCount, icon: XIcon },
        ]);
      } catch (error) {
        console.error("Error fetching supplier dashboard data:", error);
        setStats([
          { label: "Total Revenue", value: "$0", delta: "0%", icon: DollarSign },
          { label: "Active Bookings", value: "0", delta: "0", icon: CalendarDays },
          { label: "Average Rating", value: "0.0", delta: "0.0", icon: Star },
          { label: "Experiences", value: "0", delta: "0", icon: Briefcase },
        ]);
        setTravelerStats([
          { label: "Total Requests", value: 0, icon: Clock3 },
          { label: "Accepted Requests", value: 0, icon: Check },
          { label: "Rejected Requests", value: 0, icon: XIcon },
        ]);
        setPendingRequests([]);
        setAllRequests([]);
        setExperiences([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (activeSection === 'Dashboard') {
      fetchSupplierDashboard();
    }
  }, [activeSection]);

  const navigateTo = (section, resetExperienceView = true) => {
    if (section === activeSection && (!resetExperienceView || experienceView === "list")) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(section);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setActiveSection(section);
    if (resetExperienceView) setExperienceView("list");
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const prevSection = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setActiveSection(prevSection);
      if (prevSection === "Experience") setExperienceView("list");
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const nextSection = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setActiveSection(nextSection);
      if (nextSection === "Experience") setExperienceView("list");
    }
  };

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  if (isLoading && activeSection === 'Dashboard') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a26e35]"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen md:h-screen flex flex-col md:flex-row transition-colors duration-300 ${darkMode ? "dark bg-slate-950" : "bg-white"
        }`}
    >
      <SupplierSidebar
        activeSection={activeSection}
        onSelectSection={navigateTo}
        onLogout={onLogout}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
        <div className={`mb-4 flex items-center justify-between rounded-b-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm transition-colors duration-300 ${darkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white"}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={goBack}
              disabled={historyIndex === 0}
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-colors ${historyIndex === 0 ? "opacity-50 cursor-not-allowed" : ""} ${darkMode ? "border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={goForward}
              disabled={historyIndex === history.length - 1}
              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-colors ${historyIndex === history.length - 1 ? "opacity-50 cursor-not-allowed" : ""} ${darkMode ? "border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigateTo("Requests")}
              className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-colors ${darkMode ? "border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-red-500 border-2 border-white" />
            </button>
            <button
              onClick={() => navigateTo("Profile")}
              className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${darkMode ? "border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className="hidden sm:block">
              <ProfilePic user={JSON.parse(localStorage.getItem('currentUser'))} size="sm" />
            </div>
          </div>
        </div>

        {activeSection === "Dashboard" && (
          <>
            <div className="mb-4 sm:mb-5">
              <h1 className={`text-lg sm:text-xl font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-gray-900"}`}>Dashboard</h1>
              <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                Welcome back! Here is your overview.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats?.map((card) => {
                const Icon = card.icon || Briefcase;
                return (
                  <div
                    key={card.label}
                    className={`flex min-h-[100px] sm:min-h-[120px] flex-col justify-between rounded-xl sm:rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 shadow-sm transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}
                  >
                    <div className="mb-3 sm:mb-4 flex items-start justify-between text-xs">
                      <div className="inline-flex items-center gap-2">
                        <span className={`inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl transition-colors duration-300 ${darkMode ? "bg-slate-800 text-amber-500" : "bg-[#eef4ff] text-[#a26e35]"}`}>
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-500">
                        {card.delta}
                      </span>
                    </div>
                    <div>
                      <p className={`mb-1 text-[10px] sm:text-xs transition-colors duration-300 ${darkMode ? "text-slate-500" : "text-gray-500"}`}>{card.label}</p>
                      <p className={`text-xl sm:text-2xl font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>{card.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.9fr)] gap-4 sm:gap-5 mb-6">
              <div className={`rounded-xl sm:rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
                <h2 className={`text-xs sm:text-sm font-semibold mb-3 transition-colors duration-300 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Recent Bookings
                </h2>
                <div className="space-y-2">
                  {recentBookings.length > 0 ? recentBookings.map((booking, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-300 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"}`}
                    >
                      <div>
                        <p className={`text-sm font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>
                          {booking.experience || booking.title}
                        </p>
                        <p className={`mt-1 text-xs transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                          {booking.name} • {booking.guests} Guests
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${booking.status === 'Confirmed' || booking.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        booking.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
                        }`}>
                        {booking.status}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400 text-sm">No recent bookings</div>
                  )}
                </div>
              </div>

              <div className={`rounded-xl sm:rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 space-y-2 sm:space-y-3 transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
                <h2 className={`text-xs sm:text-sm font-semibold mb-1 transition-colors duration-300 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Quick Actions
                </h2>
                <button
                  onClick={() => {
                    navigateTo("Experience", false);
                    setExperienceView("create");
                  }}
                  className="w-full rounded-xl bg-[#a26e35] text-white text-sm font-semibold py-2.5 hover:bg-[#8b5e2d] transition-colors"
                >
                  Add New Experience
                </button>
                <button
                  onClick={() => navigateTo("Booking")}
                  className={`w-full rounded-xl border text-sm py-2.5 transition-colors duration-300 ${darkMode ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  View All Bookings
                </button>
                <button
                  onClick={() => navigateTo("Profile")}
                  className={`w-full rounded-xl border text-sm py-2.5 transition-colors duration-300 ${darkMode ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  Update Profile
                </button>
              </div>
            </div>

            <div className="bg-transparent">
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <h2 className={`text-base font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>
                    Traveler Requests
                  </h2>
                  <p className={`mt-1 text-xs transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                    Manage and respond to traveler trip requests
                  </p>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                {travelerStats?.map((item, idx) => {
                  const Icon = item.icon || Clock3;
                  const bgColor =
                    idx === 0
                      ? "bg-amber-400"
                      : idx === 1
                        ? "bg-emerald-500"
                        : "bg-rose-500";

                  return (
                    <div
                      key={item.label}
                      className={`flex min-h-[80px] sm:min-h-[96px] items-center justify-between rounded-xl sm:rounded-2xl border px-3 sm:px-4 py-3 sm:py-4 shadow-sm transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}
                    >
                      <div>
                        <p className={`mb-1 text-[10px] sm:text-[11px] transition-colors duration-300 ${darkMode ? "text-slate-500" : "text-gray-500"}`}>{item.label}</p>
                        <p className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>{item.value}</p>
                      </div>
                      <div
                        className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-white ${bgColor}`}
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`mb-4 rounded-xl sm:rounded-2xl px-3 py-2 shadow-sm transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-white"}`}>
                <select
                  value={selectedRequestId || ""}
                  onChange={(e) => setSelectedRequestId(e.target.value || null)}
                  className={`w-full flex items-center justify-between rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#a26e35]/40 ${darkMode ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-[#f7f1e7] text-gray-700 border border-gray-200"}`}
                >
                  <option value="">Select Traveler Request</option>
                  {(Array.isArray(allRequests) ? allRequests : []).map((req) => {
                    const id = req.id || req._id;
                    return (
                      <option key={id} value={id}>
                        {req.experience || req.title || req.name || "Request"} – {req.name || req.travelerName || "Traveler"} ({req.guests ?? "—"} guests)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className={`rounded-xl sm:rounded-2xl border px-3 sm:px-4 py-6 sm:py-8 transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
                {(() => {
                  const list = Array.isArray(allRequests) ? allRequests : [];
                  const selectedReq = selectedRequestId
                    ? list.find((r) => String(r?.id || r?._id || '') === String(selectedRequestId))
                    : null;

                  if (selectedReq) {
                    return (
                      <div className="space-y-3 text-xs sm:text-sm">
                        <p className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{selectedReq.experience || selectedReq.title || "—"}</p>
                        <p className={darkMode ? "text-slate-400" : "text-gray-600"}>Traveler: {selectedReq.name || selectedReq.travelerName || "—"}</p>
                        <p className={darkMode ? "text-slate-400" : "text-gray-600"}>Guests: {selectedReq.guests ?? "—"}</p>
                        {selectedReq.date && <p className={darkMode ? "text-slate-400" : "text-gray-600"}>Date: {selectedReq.date}</p>}
                        <p className={darkMode ? "text-slate-400" : "text-gray-600"}>Status: {selectedReq.status || "—"}</p>
                        <button
                          onClick={() => navigateTo("Requests")}
                          className="mt-2 rounded-lg bg-[#a26e35] text-white px-4 py-2 text-xs font-semibold hover:bg-[#8b5e2d] transition-colors"
                        >
                          Manage in Requests
                        </button>
                      </div>
                    );
                  }

                  return (
                    <p className={`text-center py-4 text-[10px] sm:text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                      {list.length === 0 ? "No traveler requests" : "Please select a traveler request to view details"}
                    </p>
                  );
                })()}
              </div>

            </div>
          </>
        )}

        {activeSection === "Experience" && (
          <SupplierExperience
            darkMode={darkMode}
            view={experienceView}
            onViewChange={setExperienceView}
          />
        )}
        {activeSection === "Booking" && (
          <SupplierBookings
            darkMode={darkMode}
            onResumeDraft={(draft) => {
              setResumeItineraryDraft(draft || null);
              navigateTo("Requests");
            }}
            onRemoveDraft={async (id) => {
              if (window.confirm("Remove this draft?")) {
                try {
                  const key = "kufi_supplier_itinerary_drafts";
                  const raw = localStorage.getItem(key);
                  const list = (() => {
                    try {
                      const parsed = JSON.parse(raw);
                      return Array.isArray(parsed) ? parsed : [];
                    } catch {
                      return [];
                    }
                  })();
                  localStorage.setItem(key, JSON.stringify(list.filter((d) => String(d?.id) !== String(id))));
                  window.dispatchEvent(new Event("kufi_itinerary_drafts_updated"));
                } catch (e) {
                  console.error("Error removing draft:", e);
                }
              }
            }}
          />
        )}
        {activeSection === "Analytics" && <SupplierAnalytics darkMode={darkMode} />}
        {activeSection === "Profile" && <SupplierProfile darkMode={darkMode} />}
        {activeSection === "Requests" && (
          <SupplierRequests
            darkMode={darkMode}
            resumeDraft={resumeItineraryDraft}
            onDraftConsumed={() => setResumeItineraryDraft(null)}
            onGoToBookings={() => navigateTo("Booking")}
          />
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard;
