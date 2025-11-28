import React, { useState } from "react";
import { Search, Clock3, User, MapPin, Info, CheckCircle2, AlertTriangle } from "lucide-react";

const tabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Transferred", value: "transferred" },
  { label: "Expired (24h)", value: "expired" },
];

const requests = [
  {
    id: 1,
    traveler: "Emily Parker",
    status: "pending",
    statusLabel: "Pending Supplier Response",
    statusColor: "bg-amber-100 text-amber-700",
    destination: "Paris, France",
    duration: "6 Days / 5 Nights",
    received: "10 minutes ago",
    autoTransfer: "Auto-transfer scheduled if no response within 24 hours.",
  },
  {
    id: 2,
    traveler: "Michael Johnson",
    status: "accepted",
    statusLabel: "Accepted",
    statusColor: "bg-emerald-100 text-emerald-700",
    destination: "Tokyo, Japan",
    duration: "8 Days / 7 Nights",
    received: "1 hour ago",
    autoTransfer: "Request confirmed by Supplier.",
  },
  {
    id: 3,
    traveler: "Sarah Williams",
    status: "transferred",
    statusLabel: "Transferred",
    statusColor: "bg-sky-100 text-sky-700",
    destination: "Barcelona, Spain",
    duration: "6 Days / 4 Nights",
    received: "3 hours ago",
    autoTransfer: "Request transferred to Supplier 62.",
  },
  {
    id: 4,
    traveler: "David Brown",
    status: "expired",
    statusLabel: "Expired",
    statusColor: "bg-rose-100 text-rose-700",
    destination: "New York, USA",
    duration: "4 Days / 3 Nights",
    received: "1 day ago",
    autoTransfer: "Request expired due to no response.",
  },
];

const overviewStats = [
  { label: "Total Requests Today", value: 42 },
  { label: "Pending Supplier Replies", value: 9 },
  { label: "Auto-Transferred", value: 3 },
  { label: "Manually Transferred", value: 4 },
];

const NotificationsBooking = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredRequests =
    activeTab === "all" ? requests : requests.filter((r) => r.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Notifications  Booking Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track recent booking activity and manage supplier responses in real-time.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-700 hover:bg-amber-100">
          Mark All as Read
        </button>
      </div>

      {/* Top controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-sm flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Notifications..."
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="inline-flex rounded-xl bg-white border border-gray-200 p-1 self-start">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === tab.value
                  ? "bg-[#a26e35] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(260px,0.9fr)] gap-5">
        {/* Requests list */}
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-gray-100 card-shadow px-5 py-4 space-y-3"
            >
              {/* Top row */}
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm text-slate-900">
                    <span className="font-semibold">{req.traveler}</span>{" "}
                    <span className="text-gray-700">submitted a new booking request.</span>
                  </p>
                  <p className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 items-center">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>Destination: {req.destination}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5 text-gray-400" />
                      <span>Duration: {req.duration}</span>
                    </span>
                  </p>
                  <p className="mt-2 text-[11px] text-gray-400 inline-flex items-center gap-1">
                    <Clock3 className="w-3 h-3" />
                    <span>Received {req.received}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-2 items-stretch md:items-end min-w-[180px]">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold rounded-full ${req.statusColor}`}
                  >
                    <span>{req.statusLabel}</span>
                  </span>
                  <button className="mt-1 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#a26e35] text-white text-xs font-semibold hover:bg-[#8d5d2b]">
                    Transfer to Another Supplier
                  </button>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-t border-gray-100 pt-3 mt-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <span>{req.autoTransfer}</span>
                </div>
                <button className="text-xs font-semibold text-[#a26e35] hover:text-[#8d5d2b] flex items-center gap-1 self-start md:self-auto">
                  <span>View Request Details</span>
                </button>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 px-5 py-12 text-center text-sm text-gray-500">
              No booking requests in this filter.
            </div>
          )}
        </div>

        {/* Quick overview */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 card-shadow px-5 py-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Quick Overview</h2>
            <div className="space-y-3 text-sm">
              {overviewStats.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <p className="text-gray-500">{item.label}</p>
                  <p className="font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 card-shadow px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Supplier Response Time
            </h3>
            <div className="flex items-end justify-between h-32 gap-3 text-[11px] text-gray-500">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full rounded-t-md bg-[#c7a27a] h-8" />
                <span>1h</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full rounded-t-md bg-[#a26e35] h-16" />
                <span>Avg. 7h</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full rounded-t-md bg-[#c7a27a] h-24" />
                <span>24h</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NotificationsBooking;
