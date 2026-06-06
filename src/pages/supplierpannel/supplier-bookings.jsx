import api from "../../api";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";

const SupplierBookings = ({ darkMode, onResumeDraft, onRemoveDraft }) => {
  const [bookings, setBookings] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);



  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const bookingsRes = await api.get('/supplier/bookings');
        const rawBookings = Array.isArray(bookingsRes?.data)
          ? bookingsRes.data
          : (bookingsRes?.data?.bookings || bookingsRes?.data?.data || bookingsRes?.data || []);

        const list = Array.isArray(rawBookings) ? rawBookings : [];
        const normalized = list.map((r) => {
          const experienceTitles = r.items
            ? r.items.map(item => item.activity?.title || item.title).filter(Boolean).join(', ')
            : (r.experience || r.title || r.activity || "");

          const email =
            r.contactDetails?.email ||
            r.user?.email ||
            r.email ||
            r.contactEmail ||
            r.travelerEmail ||
            '';

          const nameFromEmail = (() => {
            const local = String(email || '').split('@')[0] || '';
            const cleaned = local.replace(/[._-]+/g, ' ').trim();
            if (!cleaned) return '';
            return cleaned
              .split(' ')
              .filter(Boolean)
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ');
          })();

          const totalGuests = r.items
            ? r.items.reduce((sum, item) => sum + (item.travelers || 0), 0)
            : (r.guests ?? r.travelers ?? r.pax ?? 0);

          return {
            ...r,
            id: r.id ?? r._id,
            name: (() => {
              const contactName = (r.contactDetails?.firstName
                ? `${r.contactDetails.firstName} ${r.contactDetails.lastName || ''}`.trim()
                : "");

              const candidate =
                contactName ||
                r.user?.name ||
                (r.name ?? r.travelerName ?? r.userName ?? '');

              const clean = String(candidate || '').trim();
              const isGeneric = !clean || clean.toLowerCase() === 'user' || clean === '—';
              if (isGeneric) return nameFromEmail || '—';
              return clean;
            })(),
            experience: experienceTitles,
            guests: totalGuests || 1,
            amount: r.tripDetails?.budget ?? r.amount ?? r.totalAmount ?? r.price ?? "N/A",
            date: r.date ?? r.createdAt?.split('T')[0] ?? "Flexible",
            status: r.status ?? "Pending",
            code: r.code ?? (r._id ? r._id.substring(r._id.length - 6).toUpperCase() : "BK-000")
          };
        });

        setBookings(normalized);

        // Extract real drafts from the backend response
        const backendDrafts = normalized
          .filter(b => {
            if (!b.itinerary) return false;
            const status = String(b.itinerary.status || '').toLowerCase();
            return status !== 'completed' && status !== 'ready';
          })
          .map(b => {
            const itin = b.itinerary;
            
            // Calculate a simple progress heuristic
            let progress = 0.1; // Base progress for having an itinerary created
            if (itin.aiGenerated) progress += 0.3; // AI generated
            if (itin.days && itin.days.length > 0) progress += 0.4; // Days populated
            if (itin.startDate && itin.endDate) progress += 0.2; // Dates are finalized
            if (progress > 1) progress = 1;

            return {
              id: b.id,
              itineraryId: itin._id,
              title: itin.title || b.experience || "Untitled Itinerary",
              destination: itin.destination || "Unknown Destination",
              author: "AI Generated",
              progress: progress,
              lastEdit: itin.updatedAt ? new Date(itin.updatedAt).toLocaleDateString() : "Just now",
              originalBooking: b
            };
          });

        setDrafts(backendDrafts);
      } catch (error) {
        console.error("Error fetching supplier bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBookings = useMemo(() => {
    if (timeFilter === 'all') return bookings;
    
    const now = new Date();
    let cutoffDate;
    
    switch (timeFilter) {
      case '24h':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return bookings;
    }
    
    return bookings.filter(b => {
      const bookingDate = new Date(b.date || b.createdAt || b._createdAt);
      return bookingDate >= cutoffDate;
    });
  }, [bookings, timeFilter]);

  const statusClass = (status) => {
    switch (status) {
      case "Completed":
        return darkMode ? "bg-emerald-900/20 text-emerald-400 border-emerald-900/30" : "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Pending":
        return darkMode ? "bg-amber-900/20 text-amber-400 border-amber-900/30" : "bg-amber-50 text-amber-600 border-amber-100";
      case "Cancelled":
        return darkMode ? "bg-rose-900/20 text-rose-400 border-rose-900/30" : "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return darkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a26e35]"></div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)] transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      {/* Left: bookings table  of the header*/}
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={`text-xl font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Bookings</h1>
            <p className={`mt-1 text-sm transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              Manage and track all your bookings
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-sm border transition-colors ${darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-gray-100 text-gray-500"}`}>
              <span className="text-xs">Wed, 29 May 2025</span>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search"
              className={`w-full rounded-full border px-4 py-2 pl-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#a26e35]/40 ${darkMode ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-600" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
            />
          </div>
        </div>

        {/* Table card */}
        <div className={`overflow-hidden rounded-2xl border shadow-sm transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <div className={`flex items-center justify-between border-b px-6 py-4 transition-colors ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Booking History</h2>
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-gray-200 text-gray-600"}`}
              >
                {timeFilter === 'all' ? 'All Time' : timeFilter === '24h' ? 'Last 24h' : timeFilter === 'weekly' ? 'Weekly' : 'Monthly'}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showFilterDropdown && (
                <div className={`absolute right-0 mt-1 w-32 rounded-lg border shadow-lg z-10 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
                  {['all', '24h', 'weekly', 'monthly'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setTimeFilter(filter);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${timeFilter === filter ? (darkMode ? "bg-slate-700 text-white" : "bg-gray-100 text-gray-900") : (darkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-600 hover:bg-gray-50")}`}
                    >
                      {filter === 'all' ? 'All Time' : filter === '24h' ? 'Last 24h' : filter === 'weekly' ? 'Weekly' : 'Monthly'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredBookings.length > 0 ? filteredBookings.map((row) => (
              <div key={row.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className={`font-semibold text-xs transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{row.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">#{row.code}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${statusClass(row.status)}`}>
                    {row.status}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className={`text-[10px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                      {row.experience} • {row.guests} Guests
                    </p>
                    <p className={`text-[10px] transition-colors ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
                      {row.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#a26e35]">{row.amount}</p>
                    {row.status !== 'Cancelled' && row.status !== 'Completed' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm("Are you sure you want to cancel this booking?")) return;
                          try {
                            await api.patch(`/bookings/${row.id}/status`, { status: 'cancelled' });
                            setBookings(prev => prev.map(b => b.id === row.id ? { ...b, status: 'Cancelled' } : b));
                            alert("Booking cancelled successfully!");
                          } catch (error) {
                            console.error("Error cancelling booking:", error);
                            alert("Failed to cancel booking");
                          }
                        }}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-medium px-2 py-1 border border-rose-200 rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )) : <div className="text-center py-8 text-gray-400 text-xs">No bookings found</div>}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className={`min-w-full border-separate border-spacing-0 text-left text-xs transition-colors ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
              <thead>
                <tr className={`${darkMode ? "bg-slate-900/50 text-slate-500" : "bg-gray-50 text-gray-400"} text-[11px] uppercase tracking-wide`}>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Code</th>
                  <th className="px-4 py-3 font-medium">Guests</th>
                  <th className="px-4 py-3 font-medium">Experience</th>
                  <th className="px-4 py-3 font-medium hidden xl:table-cell">Date</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length > 0 ? filteredBookings.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${idx % 2 === 1 ? (darkMode ? "bg-slate-800/30" : "bg-gray-50/40") : (darkMode ? "bg-slate-900" : "bg-white")}`}
                  >
                    <td className="px-6 py-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs hidden lg:table-cell">{row.code}</td>
                    <td className="px-4 py-3 text-xs">{row.guests}</td>
                    <td className="px-4 py-3 text-xs max-w-[150px] truncate">{row.experience}</td>
                    <td className="px-4 py-3 text-xs hidden xl:table-cell">{row.date}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{row.amount}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${statusClass(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.status !== 'Cancelled' && row.status !== 'Completed' && (
                        <button
                          onClick={async () => {
                            if (!window.confirm("Are you sure you want to cancel this booking?")) return;
                            try {
                              await api.patch(`/bookings/${row.id}/status`, { status: 'cancelled' });
                              setBookings(prev => prev.map(b => b.id === row.id ? { ...b, status: 'Cancelled' } : b));
                              alert("Booking cancelled successfully!");
                            } catch (error) {
                              console.error("Error cancelling booking:", error);
                              alert("Failed to cancel booking");
                            }
                          }}
                          className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan="7" className="text-center py-8 text-gray-400 text-xs">No bookings found</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Footer: pagination */}
          <div className={`flex flex-col gap-3 border-t px-6 py-3 text-[11px] sm:flex-row sm:items-center sm:justify-between transition-colors ${darkMode ? "border-slate-800 text-slate-500" : "border-gray-100 text-gray-500"}`}>
            <div className="flex items-center gap-2">
              <span>Result per page:</span>
              <select className={`rounded-full border px-2 py-1 text-[11px] focus:outline-none transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-600"}`}>
                <option>5</option>
                <option>10</option>
                <option>20</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-1 text-xs">
              <button className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${darkMode ? "border-slate-700 text-slate-500 hover:bg-slate-800" : "border-gray-200 text-gray-400 hover:bg-gray-50"}`}>
                {"<"}
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[#a26e35] text-[11px] font-semibold text-white">
                1
              </button>
              <button className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] transition-colors ${darkMode ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                2
              </button>
              <button className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] transition-colors ${darkMode ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                3
              </button>
              <button className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${darkMode ? "border-slate-700 text-slate-500 hover:bg-slate-800" : "border-gray-200 text-gray-400 hover:bg-gray-50"}`}>
                {">"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: draft itineraries */}
      <aside className="space-y-4">
        <div className={`rounded-2xl border px-5 py-5 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-[#fff7ea] border-amber-100"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Draft itineraries</h2>
              <p className={`mt-1 text-xs transition-colors ${darkMode ? "text-slate-400" : "text-amber-800/80"}`}>
                You have <span className="font-semibold">{drafts.length}</span> itineraries saved as draft.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {drafts.length > 0 ? drafts.map((draft) => (
              <div
                key={draft.id}
                className={`rounded-xl px-4 py-3 shadow-sm ring-1 transition-colors ${darkMode ? "bg-slate-800 ring-slate-700" : "bg-white/80 ring-amber-100"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={`text-xs font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {draft.title}
                    </h3>
                    <p className={`mt-0.5 text-[11px] transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{draft.author}</p>
                    <p className={`mt-0.5 text-[10px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                      Last edited: {draft.lastEdit || 'Just now'}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className={`flex items-center justify-between text-[10px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                    <span>Progress</span>
                    <span className="font-semibold text-[#a26e35]">
                      {Math.round((draft.progress || 0) * 100)}%
                    </span>
                  </div>
                  <div className={`mt-1 h-1.5 w-full overflow-hidden rounded-full transition-colors ${darkMode ? "bg-slate-700" : "bg-amber-100"}`}>
                    <div
                      className="h-full rounded-full bg-[#a26e35]"
                      style={{ width: `${(draft.progress || 0) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => onResumeDraft?.(draft.originalBooking)}
                    className="rounded-full bg-[#a26e35] px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#8b5e2d] transition-colors"
                  >
                    Resume
                  </button>
                </div>
              </div>
            )) : <div className="text-center py-8 text-gray-400 text-xs">No drafts found</div>}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SupplierBookings;
