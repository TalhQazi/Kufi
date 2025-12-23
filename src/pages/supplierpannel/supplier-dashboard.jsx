import React, { useState } from "react";
import Footer from "../../components/layout/Footer";
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
} from "lucide-react";
import SupplierSidebar from "./components/SupplierSidebar";
import SupplierExperience from "./supplier-experience";
import SupplierBookings from "./supplier-bookings";
import SupplierAnalytics from "./supplier-analytics";
import SupplierProfile from "./supplier-profile";
import SupplierRequests from "./supplier-requests";


const statCards = [
  {
    label: "Total Revenue",
    value: "$12,450",
    delta: "+12.5%",
    icon: DollarSign,
  },
  {
    label: "Active Bookings",
    value: "23",
    delta: "+4",
    icon: CalendarDays,
  },
  {
    label: "Average Rating",
    value: "4.8",
    delta: "+0.2",
    icon: Star,
  },
  {
    label: "Experiences",
    value: "8",
    delta: "+2",
    icon: Briefcase,
  },
];

const recentBookings = [
  {
    title: "Mountain Hiking Adventure",
    subtitle: "Sarah Johnson • 2 guests",
    status: "Confirmed",
  },
  {
    title: "Mountain Hiking Adventure",
    subtitle: "Sarah Johnson • 2 guests",
    status: "Confirmed",
  },
  {
    title: "Mountain Hiking Adventure",
    subtitle: "Sarah Johnson • 2 guests",
    status: "Confirmed",
  },
];

const travelerStats = [
  {
    label: "Total Pending Requests",
    value: 12,
    icon: Clock3,
  },
  {
    label: "Accepted Requests",
    value: 28,
    icon: Check,
  },
  {
    label: "Rejected Requests",
    value: 5,
    icon: XIcon,
  },
];

const SupplierDashboard = ({ onLogout, onHomeClick }) => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [experienceView, setExperienceView] = useState("list");
  const [darkMode, setDarkMode] = useState(false);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen md:h-screen flex flex-col md:flex-row transition-colors duration-300 ${darkMode ? "dark bg-slate-950" : "bg-white"
        }`}
    >
      {/* Supplier sidebar (separate component) */}
      <SupplierSidebar
        activeSection={activeSection}
        onSelectSection={(section) => {
          setActiveSection(section);
          if (section === "Experience") setExperienceView("list");
        }}
        onLogout={onLogout}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
        {activeSection === "Dashboard" && (
          <>
            {/* Top header bar with icons */}
            <div className={`mb-4 flex items-center justify-end gap-2 sm:gap-3 rounded-b-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm transition-colors duration-300 ${darkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white"}`}>
              <button
                onClick={() => setActiveSection("Requests")}
                className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-colors ${darkMode ? "border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-red-500 border-2 border-white" />
              </button>
              <button
                onClick={() => setActiveSection("Profile")}
                className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${darkMode ? "border-slate-800 bg-slate-800 text-slate-400 hover:bg-slate-700" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveSection("Profile")}
                className={`hidden sm:block h-9 w-9 rounded-full overflow-hidden border-2 transition-colors ${darkMode ? "bg-slate-700 border-slate-800" : "bg-gray-300 border-white shadow-sm"}`}
              >
                <img src="/assets/hero-card1.jpeg" alt="Profile" className="w-full h-full object-cover" />
              </button>
            </div>

            {/* Heading */}
            <div className="mb-4 sm:mb-5">
              <h1 className={`text-lg sm:text-xl font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-gray-900"}`}>Dashboard</h1>
              <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                Welcome back! Here is your overview.
              </p>
            </div>

            {/* Top stats */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
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

            {/* Middle row: Recent bookings + Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.9fr)] gap-4 sm:gap-5 mb-6">
              {/* Recent bookings */}
              <div className={`rounded-xl sm:rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
                <h2 className={`text-xs sm:text-sm font-semibold mb-3 transition-colors duration-300 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Recent Bookings
                </h2>
                <div className="space-y-2">
                  {recentBookings.map((booking, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-300 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"}`}
                    >
                      <div>
                        <p className={`text-sm font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>
                          {booking.title}
                        </p>
                        <p className={`mt-1 text-xs transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                          {booking.subtitle}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-600">
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className={`rounded-xl sm:rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 space-y-2 sm:space-y-3 transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
                <h2 className={`text-xs sm:text-sm font-semibold mb-1 transition-colors duration-300 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Quick Actions
                </h2>
                <button
                  onClick={() => {
                    setActiveSection("Experience");
                    setExperienceView("create");
                  }}
                  className="w-full rounded-xl bg-[#a26e35] text-white text-sm font-semibold py-2.5 hover:bg-[#8b5e2d] transition-colors"
                >
                  Add New Experience
                </button>
                <button
                  onClick={() => setActiveSection("Booking")}
                  className={`w-full rounded-xl border text-sm py-2.5 transition-colors duration-300 ${darkMode ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  View All Bookings
                </button>
                <button
                  onClick={() => setActiveSection("Profile")}
                  className={`w-full rounded-xl border text-sm py-2.5 transition-colors duration-300 ${darkMode ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  Update Profile
                </button>
              </div>
            </div>

            {/* Traveler requests */}
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

              {/* Stats row */}
              <div className="mb-4 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                {travelerStats.map((item, idx) => {
                  const Icon = item.icon;
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

              {/* Select traveler request dropdown */}
              <div className={`mb-4 rounded-xl sm:rounded-2xl px-3 py-2 shadow-sm transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-white"}`}>
                <div className={`flex items-center justify-between rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors duration-300 ${darkMode ? "bg-slate-800 text-slate-300" : "bg-[#f7f1e7] text-gray-700"}`}>
                  <span>Select Traveler Request</span>
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                </div>
              </div>

              {/* Empty state box */}
              <div className={`rounded-xl sm:rounded-2xl border px-3 sm:px-4 py-8 sm:py-10 text-center text-[10px] sm:text-xs transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-white border-gray-100 text-gray-400"}`}>
                Please select a traveler request to view details
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
              setActiveSection("Experience");
              setExperienceView("create");
            }}
            onRemoveDraft={(id) => {
              console.log("Removing draft:", id);
            }}
          />
        )}
        {activeSection === "Analytics" && <SupplierAnalytics darkMode={darkMode} />}
        {activeSection === "Profile" && <SupplierProfile darkMode={darkMode} />}
        {activeSection === "Requests" && <SupplierRequests darkMode={darkMode} />}
        <Footer />
      </div>
    </div>
  );
};

export default SupplierDashboard;
