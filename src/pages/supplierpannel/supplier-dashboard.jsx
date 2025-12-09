import React, { useState } from "react";
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

const SupplierDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(false);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
  <div
      className={`min-h-screen md:h-screen flex flex-col md:flex-row transition-colors ${
        darkMode ? "bg-slate-900" : "bg-white"
      }`}
    >
      {/* Supplier sidebar (separate component) */}
      <SupplierSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onLogout={onLogout}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
        {activeSection === "Dashboard" && (
          <>
            {/* Top header bar with icons */}
            <div className="mb-4 flex items-center justify-end gap-3 rounded-b-2xl bg-white px-4 py-3 shadow-sm">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500">
                <Settings className="w-4 h-4" />
              </button>
              <div className="h-9 w-9 rounded-full bg-gray-300" />
            </div>

            {/* Heading */}
            <div className="mb-5">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back! Here is your overview.
              </p>
            </div>

            {/* Top stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between text-xs">
                      <div className="inline-flex items-center gap-2">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#a26e35]">
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-500">
                        {card.delta}
                      </span>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-gray-500">{card.label}</p>
                      <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Middle row: Recent bookings + Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.9fr)] gap-5 mb-6">
              {/* Recent bookings */}
              <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  Recent Bookings
                </h2>
                <div className="space-y-2">
                  {recentBookings.map((booking, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {booking.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
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
              <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 space-y-3">
                <h2 className="text-sm font-semibold text-gray-900 mb-1">
                  Quick Actions
                </h2>
                <button className="w-full rounded-xl bg-[#a26e35] text-white text-sm font-semibold py-2.5">
                  Add New Experience
                </button>
                <button className="w-full rounded-xl border border-gray-200 text-sm text-gray-700 py-2.5">
                  View All Bookings
                </button>
                <button className="w-full rounded-xl border border-gray-200 text-sm text-gray-700 py-2.5">
                  Update Profile
                </button>
              </div>
            </div>

            {/* Traveler requests */}
            <div className="bg-transparent">
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Traveler Requests
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Manage and respond to traveler trip requests
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                      className="flex min-h-[96px] items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
                    >
                      <div>
                        <p className="mb-1 text-[11px] text-gray-500">{item.label}</p>
                        <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                      </div>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${bgColor}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Select traveler request dropdown */}
              <div className="mb-4 rounded-2xl bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between rounded-2xl bg-[#f7f1e7] px-4 py-3 text-sm text-gray-700">
                  <span>Select Traveler Request</span>
                  <ChevronDown className="h-4 w-4 text-amber-500" />
                </div>
              </div>

              {/* Empty state box */}
              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-10 text-center text-xs text-gray-400">
                Please select a traveler request to view details
              </div>
            </div>
          </>
        )}

        {activeSection === "Experience" && <SupplierExperience />}
        {activeSection === "Booking" && <SupplierBookings />}
        {activeSection === "Analytics" && <SupplierAnalytics />}
        {activeSection === "Profile" && <SupplierProfile />}
        {activeSection === "Requests" && <SupplierRequests />}
      </div>
    </div>
  );
};

export default SupplierDashboard;
