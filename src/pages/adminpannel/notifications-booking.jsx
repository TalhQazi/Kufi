import api from "../../api";
import React, { useState, useEffect } from "react";
import { Search, Clock3, User, MapPin, Info, CheckCircle2, AlertTriangle, Loader2, ExternalLink, ArrowRight, X } from "lucide-react";

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
  const [transferBusyId, setTransferBusyId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRequest, setDetailsRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
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

  const formatTripDate = (value) => {
    if (value === null || value === undefined) return '—';
    const v = String(value || '').trim();
    if (!v) return '—';
    const isoMatch = v.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch?.[1]) return isoMatch[1];
    const t = Date.parse(v);
    if (Number.isFinite(t)) return new Date(t).toISOString().slice(0, 10);
    return v;
  };

  const formatDates = (req) => {
    const arrival = formatTripDate(req?.tripDetails?.arrivalDate || req?.arrivalDate);
    const departure = formatTripDate(req?.tripDetails?.departureDate || req?.departureDate);
    if (arrival !== '—' && departure !== '—') return `${arrival} - ${departure}`;
    return req?.dateRange || req?.date || '—';
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

  const tryTransferBooking = async (bookingId) => {
    // Use the correct backend endpoint
    const payload = { bookingId, id: bookingId };
    return await api.patch(`/bookings/${bookingId}/transfer`, payload);
  };

  const onTransferToAnotherSupplier = async (req) => {
    const bookingId = req?.id;
    if (!bookingId) return;

    try {
      setTransferBusyId(bookingId);
      await tryTransferBooking(bookingId);

      setRequests((prev) =>
        prev.map((r) => {
          if (String(r.id) !== String(bookingId)) return r;
          const status = 'transferred';
          return {
            ...r,
            status,
            statusLabel: statusLabelFromStatus(status),
            statusColor: statusColorFromStatus(status),
            autoTransfer: 'Request transferred to another supplier.',
            raw: {
              ...(r.raw || {}),
              transferStatus: 'transferred',
              transferred: true,
            },
          };
        })
      );
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const rawMessage =
        (typeof data === 'string' && data) ||
        data?.message ||
        data?.error ||
        error?.message ||
        'Transfer failed.';
      const tried = error?._lastTriedPath ? ` (${error._lastTriedPath})` : '';
      setErrorMsg(`${String(rawMessage)}${tried}${status ? ` (Status: ${status})` : ''}`);
      console.error('Error transferring booking:', error);
    } finally {
      setTransferBusyId(null);
    }
  };

  const tryGetBookingById = async (bookingId) => {
    // Use the correct backend endpoint
    return await api.get(`/bookings/${bookingId}`);
  };

  const onOpenDetails = async (req) => {
    setDetailsError('');
    setDetailsOpen(true);
    setDetailsRequest(req?.raw || req || null);
    const bookingId = req?.id;
    if (!bookingId) return;

    try {
      setDetailsLoading(true);
      const res = await tryGetBookingById(bookingId);
      const data = res?.data?.booking ?? res?.data?.data ?? res?.data;
      if (data) setDetailsRequest(data);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const rawMessage =
        (typeof data === 'string' && data) ||
        data?.message ||
        data?.error ||
        err?.message ||
        'Failed to load request details.';
      const tried = err?._lastTriedPath ? ` (${err._lastTriedPath})` : '';
      setDetailsError(`${String(rawMessage)}${tried}${status ? ` (Status: ${status})` : ''}`);
    } finally {
      setDetailsLoading(false);
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
          raw: req,
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
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setDetailsOpen(false);
              setDetailsRequest(null);
              setDetailsError('');
            }}
            aria-label="Close"
          />
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">Request Details</p>
                <p className="text-xs text-gray-500 truncate">
                  {detailsRequest?.contactDetails?.email || detailsRequest?.email || detailsRequest?.user?.email || '—'}
                </p>
              </div>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                onClick={() => {
                  setDetailsOpen(false);
                  setDetailsRequest(null);
                  setDetailsError('');
                }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {detailsError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">
                  {detailsError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Traveler</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {(() => {
                      const first = detailsRequest?.contactDetails?.firstName || '';
                      const last = detailsRequest?.contactDetails?.lastName || '';
                      return String(`${first} ${last}`.trim() || detailsRequest?.name || detailsRequest?.user?.name || '—');
                    })()}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Destination</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {detailsRequest?.location || detailsRequest?.country || detailsRequest?.tripDetails?.destination || detailsRequest?.tripDetails?.country || '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Dates</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatDates(detailsRequest)}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Travelers</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {detailsRequest?.travelers ||
                     detailsRequest?.guests ||
                     detailsRequest?.pax ||
                     detailsRequest?.tripDetails?.travelers ||
                     (Array.isArray(detailsRequest?.items) && detailsRequest.items[0]?.travelers) ||
                     (Array.isArray(detailsRequest?.items) && detailsRequest.items.reduce((sum, item) => sum + (item.travelers || 0), 0)) ||
                     '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Budget</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {detailsRequest?.tripDetails?.budget || detailsRequest?.budget || detailsRequest?.amount || detailsRequest?.totalAmount || '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Phone</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {detailsRequest?.contactDetails?.phone || detailsRequest?.phone || detailsRequest?.user?.phone || '—'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Activities</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.isArray(detailsRequest?.items) && detailsRequest.items.length > 0 ? (
                    detailsRequest.items
                      .map((it) => it?.activity?.title || it?.title)
                      .filter(Boolean)
                      .slice(0, 12)
                      .map((title) => (
                        <span key={title} className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-slate-700">
                          {title}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  )}
                </div>
              </div>

              {detailsLoading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#a26e35]" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

                <div className="flex flex-col gap-2 items-stretch md:items-end min-w-[220px]">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold rounded-full ${req.statusColor}`}
                  >
                    <span>{req.statusLabel}</span>
                  </span>

                  {req.status !== 'transferred' ? (
                    <button
                      type="button"
                      disabled={transferBusyId === req.id}
                      onClick={() => onTransferToAnotherSupplier(req)}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        transferBusyId === req.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#a26e35] text-white hover:bg-[#8b5e2d]'
                      }`}
                    >
                      {transferBusyId === req.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      <span>Transfer to Another Supplier</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Already Transferred
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-t border-gray-100 pt-3 mt-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <span>{req.autoTransfer}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenDetails(req)}
                  className="text-xs font-semibold text-[#a26e35] hover:text-[#8d5d2b] flex items-center gap-1 self-start md:self-auto"
                >
                  <span>View Request Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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
