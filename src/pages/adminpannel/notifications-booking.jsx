import api from "../../api";
import React, { useState, useEffect } from "react";
import { Search, Clock3, User, MapPin, Info, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

const tabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
];

const NotificationsBooking = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      const data = Array.isArray(response.data) ? response.data : (response.data.bookings || []);

      const transformed = data.map(req => ({
        id: req._id,
        traveler: `${req.firstName} ${req.lastName}`,
        status: (req.status || 'pending').toLowerCase(),
        statusLabel: req.status || 'Pending',
        statusColor:
          req.status === 'accepted' ? "bg-emerald-100 text-emerald-700" :
            req.status === 'rejected' ? "bg-rose-100 text-rose-700" :
              "bg-amber-100 text-amber-700",
        destination: req.cities || 'N/A',
        duration: req.duration || 'N/A',
        received: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recently',
        autoTransfer: req.status === 'pending' ? "Auto-transfer scheduled if no response within 24 hours." : `Status: ${req.status}`,
        email: req.email,
        phone: req.phone,
        travelersCount: req.travelers
      }));

      setRequests(transformed);

      // Calculate stats
      setStats({
        total: transformed.length,
        pending: transformed.filter(r => r.status === 'pending').length,
        accepted: transformed.filter(r => r.status === 'accepted').length,
        rejected: transformed.filter(r => r.status === 'rejected').length
      });

    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const overviewStats = [
    { label: "Total Requests", value: stats.total },
    { label: "Pending Replies", value: stats.pending },
    { label: "Accepted", value: stats.accepted },
    { label: "Rejected", value: stats.rejected },
  ];

  const filteredRequests = requests.filter((r) => {
    const matchesTab = activeTab === "all" || r.status === activeTab;
    const matchesSearch = r.traveler.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#a26e35]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Notifications & Booking Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track recent booking activity and manage supplier responses in real-time.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-700 hover:bg-amber-100"
        >
          Refresh Data
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="inline-flex rounded-xl bg-white border border-gray-200 p-1 self-start">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${activeTab === tab.value
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
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm text-slate-900">
                    <span className="font-semibold">{req.traveler}</span>{" "}
                    <span className="text-gray-700">submitted a new booking request.</span>
                  </p>
                  <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 items-center">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>Destination: {req.destination}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5 text-gray-400" />
                      <span>Duration: {req.duration}</span>
                    </span>
                  </div>
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
                </div>
              </div>

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
        </aside>
      </div>
    </div>
  );
};

export default NotificationsBooking;
