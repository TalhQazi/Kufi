import React, { useState } from "react";
import {
  DollarSign,
  CalendarDays,
  Star,
  Briefcase,
  ChevronDown,
  Bell,
  Settings,
} from "lucide-react";
import SupplierSidebar from "./components/SupplierSidebar";
import SupplierExperience from "./supplier-experience";


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
    color: "bg-amber-50 text-amber-600",
    iconBg: "bg-amber-100 text-amber-500",
  },
  {
    label: "Accepted Requests",
    value: 28,
    color: "bg-emerald-50 text-emerald-600",
    iconBg: "bg-emerald-100 text-emerald-500",
  },
  {
    label: "Rejected Requests",
    value: 5,
    color: "bg-rose-50 text-rose-600",
    iconBg: "bg-rose-100 text-rose-500",
  },
];

const SupplierDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState("Dashboard");

  return (
  <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-[#f5f5f7]">
      {/* Supplier sidebar (separate component) */}
      <SupplierSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onLogout={onLogout}
      />

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
        {activeSection === "Dashboard" && (
          <>
            {/* Full-width header bar with icons on the right */}
            <div className="mb-4 rounded-2xl bg-white  h-19 w-full">
              <div className="flex items-center justify-end gap-3">
                <button className="relative h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center bg-white text-gray-500">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                </button>
                <button className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center bg-white text-gray-500">
                  <Settings className="w-4 h-4" />
                </button>
                <div className="h-10 w-10 rounded-full bg-gray-300" />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-5">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back! Here is your overview.
              </p>
            </div>

            {/* Top stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-col justify-between min-h-[120px]"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-500 mb-3">
                      <div className="inline-flex items-center gap-2 text-gray-500">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                          <Icon className="w-4 h-4" />
                        </span>
                      </div>
                      <span className="text-emerald-500">{card.delta}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                      <p className="text-xl font-semibold text-gray-900">{card.value}</p>
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
                <div className="space-y-3">
                  {recentBookings.map((booking, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-emerald-50/60 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.subtitle}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
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
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Traveler Requests
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage and respond to traveler trip requests
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {travelerStats.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border border-gray-100 bg-white px-4 py-3 flex items-center justify-between`}
                  >
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">{item.label}</p>
                      <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                    </div>
                    <div className={`${item.iconBg} rounded-full h-9 w-9 flex items-center justify-center text-xs`}>
                      <span>●</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Select traveler request dropdown */}
              <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3 flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Select Traveler Request</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>

              {/* Empty state box */}
              <div className="rounded-2xl bg-white border border-gray-100 px-4 py-10 text-center text-xs text-gray-400">
                Please select a traveler request to view details
              </div>
            </div>
          </>
        )}

        {activeSection === "Experience" && <SupplierExperience />}
      </div>
    </div>
  );
};

export default SupplierDashboard;
