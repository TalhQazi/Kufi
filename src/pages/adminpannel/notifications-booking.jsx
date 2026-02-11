import api from "../../api";
import React, { useState, useEffect } from "react";
import { Search, Clock3, User, MapPin, Info, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

const tabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Transferred", value: "transferred" },
  { label: "Expired (24h)", value: "expired" },
];

const NotificationsBooking = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [requests, setRequests] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const timeAgo = (date) => {
    if (!date) return '';
    const ts = new Date(date).getTime();
    if (!Number.isFinite(ts)) return '';
    const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  const normalizeBookingStatus = (raw) => {
    const s = String(raw || 'pending').toLowerCase();
    if (s === 'confirmed' || s === 'accepted' || s === 'approve' || s === 'approved') return 'accepted';
    if (s === 'cancelled' || s === 'canceled' || s === 'rejected' || s === 'reject') return 'rejected';
    return 'pending';
  };

  const detectTransferred = (req) => {
    const transferStatus = String(req?.transferStatus || req?.transfer_state || '').toLowerCase();
    if (transferStatus === 'transferred') return true;
    if (req?.transferred === true) return true;
    if (req?.isTransferred === true) return true;
    if (req?.transferredToSupplier || req?.transferredTo) return true;
    return false;
  };

  const detectExpired = (req) => {
    const created = req?.createdAt ? new Date(req.createdAt).getTime() : NaN;
    if (!Number.isFinite(created)) return false;
    const ageHours = (Date.now() - created) / (1000 * 60 * 60);
    return ageHours >= 24;
  };

  const getDerivedStatus = (req) => {
    const base = normalizeBookingStatus(req?.status);
    if (detectTransferred(req)) return 'transferred';
    if (base === 'pending' && detectExpired(req)) return 'expired';
    return base;
  };

  const statusLabelFromStatus = (status) => {
    if (status === 'accepted') return 'Accepted';
    if (status === 'rejected') return 'Rejected';
    if (status === 'transferred') return 'Transferred';
    if (status === 'expired') return 'Expired';
    return 'Pending Supplier Response';
  };

  const statusColorFromStatus = (status) => {
    if (status === 'accepted') return "bg-emerald-100 text-emerald-700";
    if (status === 'rejected') return "bg-rose-100 text-rose-700";
    if (status === 'transferred') return "bg-blue-100 text-blue-700";
    if (status === 'expired') return "bg-gray-100 text-gray-700";
    return "bg-amber-100 text-amber-700";
  };

  const tryGetBookings = async () => {
    const candidates = [
      '/admin/bookings',
      '/bookings',
      '/booking',
      '/admin/booking',
      '/admin/booking-requests'
    ];

    let lastErr;
    let lastTriedPath = '';
    for (const path of candidates) {
      lastTriedPath = path;
      try {
        return await api.get(path);
      } catch (err) {
        lastErr = err;

        const status = err?.response?.status;
        // Only try the next candidate for "not found".
        // For auth/server errors, stop so we surface the real issue.
        if (status && status !== 404) {
          err._lastTriedPath = lastTriedPath;
          throw err;
        }
      }
    }

    if (lastErr) lastErr._lastTriedPath = lastTriedPath;
    throw lastErr;
  };

  const fetchSystemActivity = async () => {
    try {
      const activityRes = await api.get('/admin/activity');
      const iconMap = {
        bell: AlertTriangle,
        users: User,
        userCheck: CheckCircle2,
        clock: Clock3,
        dollar: Info,
        alert: AlertTriangle,
      };

      const activityFeed = Array.isArray(activityRes?.data?.activities) ? activityRes.data.activities : [];
      const mappedSystem = activityFeed.map((item, idx) => {
        const Icon = iconMap[item?.iconType] || AlertTriangle;
        return {
          id: `sys-${idx}`,
          title: item?.title || 'System update',
          time: item?.time || '',
          iconBg: item?.iconBg || 'bg-slate-50 text-slate-600',
          Icon,
        };
      });
      setSystemNotifications(mappedSystem);
    } catch (err) {
      // Keep whatever was already on screen; avoid blanking the UI.
      console.error('Error fetching system activity:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // Fetch activity feed independently so it can still show even if bookings fails.
      fetchSystemActivity();

      const response = await tryGetBookings();

      const data = Array.isArray(response.data)
        ? response.data
        : (response.data.bookings || response.data.data || response.data?.results || []);

      const transformed = (Array.isArray(data) ? data : []).map(req => {
        const derivedStatus = getDerivedStatus(req);

        const firstName = req.contactDetails?.firstName || req.firstName || '';
        const lastName = req.contactDetails?.lastName || req.lastName || '';
        const travelerName = String(`${firstName} ${lastName}`.trim() || req.name || req.user?.name || 'Traveler');

        const destination =
          req.location ||
          req.country ||
          req.cities ||
          req.tripDetails?.destination ||
          'N/A';

        const duration =
          req.tripDetails?.duration ||
          req.duration ||
          req.tripDetails?.days ||
          'N/A';

        const email = req.contactDetails?.email || req.email || req.user?.email;
        const phone = req.contactDetails?.phone || req.phone;

        return {
          id: req._id,
          traveler: travelerName,
          status: derivedStatus,
          statusLabel: statusLabelFromStatus(derivedStatus),
          statusColor: statusColorFromStatus(derivedStatus),
          destination: String(destination || 'N/A'),
          duration: String(duration || 'N/A'),
          received: req.createdAt ? timeAgo(req.createdAt) : 'Recently',
          autoTransfer: derivedStatus === 'pending'
            ? "Auto-transfer scheduled if no response within 24 hours."
            : `Status: ${statusLabelFromStatus(derivedStatus)}`,
          email,
          phone,
          travelersCount: req.travelers || req.guests || req.pax
        };
      });

      setRequests(transformed);

      // Calculate stats
      setStats({
        total: transformed.length,
        pending: transformed.filter(r => r.status === 'pending').length,
        accepted: transformed.filter(r => r.status === 'accepted').length,
        rejected: transformed.filter(r => r.status === 'rejected').length
      });

    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      const rawMessage =
        (typeof data === 'string' && data) ||
        data?.message ||
        data?.error ||
        error?.message ||
        'Failed to load bookings.';

      const looksLikeHtml = typeof rawMessage === 'string' && /<!doctype|<html/i.test(rawMessage);
      const tried = error?._lastTriedPath ? ` (${error._lastTriedPath})` : '';
      const message = looksLikeHtml
        ? `Bookings endpoint not found${tried}. Please confirm backend route.`
        : String(rawMessage);

      setRequests([]);
      setStats({ total: 0, pending: 0, accepted: 0, rejected: 0 });
      setErrorMsg(`${message}${status ? ` (Status: ${status})` : ''}`);
      console.error("Error fetching bookings:", { status, data, error });
    } finally {
      setLoading(false);
    }
  };

  const derivedCounts = {
    transferred: requests.filter(r => r.status === 'transferred').length,
    expired: requests.filter(r => r.status === 'expired').length,
  };

  const overviewStats = [
    { label: "Total Requests", value: stats.total },
    { label: "Pending Supplier Replies", value: stats.pending },
    { label: "Auto-Transferred", value: derivedCounts.transferred },
    { label: "Expired (24h)", value: derivedCounts.expired },
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
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-5 py-4 text-sm">
              {errorMsg}
            </div>
          )}

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

          {filteredRequests.length === 0 && !errorMsg && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 px-5 py-12 text-center text-sm text-gray-500">
              No booking requests in this filter.
            </div>
          )}

          <div className="pt-2">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">System Notifications</h2>
            <div className="space-y-3">
              {systemNotifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 px-5 py-10 text-center text-sm text-gray-500">
                  No system notifications yet.
                </div>
              ) : (
                systemNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between bg-white rounded-lg border border-gray-100 card-shadow px-5 h-[84px]"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 h-10 w-10 rounded-2xl flex items-center justify-center ${n.iconBg}`}>
                        <n.Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 leading-snug">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
