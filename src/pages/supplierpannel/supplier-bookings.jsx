import React from "react";
import { ChevronDown } from "lucide-react";

const bookings = [
  {
    id: 1,
    name: "Sarah Johnson",
    code: "VT938426",
    guests: 2,
    experience: "Mt. Hiking Adven",
    date: "11 Jun 2025",
    amount: "$746",
    status: "Pending",
  },
  {
    id: 2,
    name: "Mike Chen",
    code: "HK373983",
    guests: 4,
    experience: "Sunset Tour",
    date: "11 Jun 2025",
    amount: "$468",
    status: "Completed",
  },
  {
    id: 3,
    name: "Emma Wilson",
    code: "KL836593",
    guests: 6,
    experience: "Wine Tasting",
    date: "11 Jun 2025",
    amount: "$385",
    status: "Cancelled",
  },
  {
    id: 4,
    name: "James Brown",
    code: "GU823948",
    guests: 2,
    experience: "Mt. Hiking Adven",
    date: "11 Jun 2025",
    amount: "$581",
    status: "Completed",
  },
  {
    id: 5,
    name: "Jane Sunny",
    code: "WH847583",
    guests: 8,
    experience: "Sunset Tour",
    date: "11 Jun 2025",
    amount: "$632",
    status: "Completed",
  },
  {
    id: 6,
    name: "Jane Sunny",
    code: "WH847583",
    guests: 8,
    experience: "Sunset Tour",
    date: "11 Jun 2025",
    amount: "$632",
    status: "Completed",
  },
  {
    id: 7,
    name: "Jane Sunny",
    code: "WH847583",
    guests: 8,
    experience: "Sunset Tour",
    date: "11 Jun 2025",
    amount: "$632",
    status: "Pending",
  },
];

const drafts = [
  {
    id: 1,
    title: "Bali Adventure Plan",
    author: "Alex Johnson",
    lastEdit: "Today, 2:30 PM",
    progress: 0.95,
  },
  {
    id: 2,
    title: "Morocco Desert Tour",
    author: "Emma Wilson",
    lastEdit: "Yesterday, 10:15 AM",
    progress: 0.4,
  },
  {
    id: 3,
    title: "Greek Islands Cruise",
    author: "Michael Davis",
    lastEdit: "May 15, 2025",
    progress: 0.85,
  },
];

const statusClass = (status) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "Pending":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "Cancelled":
      return "bg-rose-50 text-rose-600 border-rose-100";
    default:
      return "bg-gray-50 text-gray-600 border-gray-100";
  }
};

const SupplierBookings = ({ darkMode, onResumeDraft, onRemoveDraft }) => {
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

  return (
    <div className={`grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)] transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      {/* Left: bookings table */}
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
            <button className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-gray-200 text-gray-600"}`}>
              Last 24h
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className={`min-w-full border-separate border-spacing-0 text-left text-xs transition-colors ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
              <thead>
                <tr className={`${darkMode ? "bg-slate-900/50 text-slate-500" : "bg-gray-50 text-gray-400"} text-[11px] uppercase tracking-wide`}>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Guests</th>
                  <th className="px-4 py-3 font-medium">Experience</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${idx % 2 === 1 ? (darkMode ? "bg-slate-800/30" : "bg-gray-50/40") : (darkMode ? "bg-slate-900" : "bg-white")}`}
                  >
                    <td className="px-6 py-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`h-7 w-7 rounded-full transition-colors ${darkMode ? "bg-slate-800" : "bg-gray-200"}`} />
                        <span className={`transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{row.code}</td>
                    <td className="px-4 py-3 text-xs">{row.guests}</td>
                    <td className="px-4 py-3 text-xs">{row.experience}</td>
                    <td className="px-4 py-3 text-xs">{row.date}</td>
                    <td className="px-4 py-3 text-xs">{row.amount}</td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${statusClass(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
                You have <span className="font-semibold">3</span> itineraries saved as draft.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {drafts.map((draft) => (
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
                      Last edited: {draft.lastEdit}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className={`flex items-center justify-between text-[10px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                    <span>Progress</span>
                    <span className="font-semibold text-[#a26e35]">
                      {Math.round(draft.progress * 100)}%
                    </span>
                  </div>
                  <div className={`mt-1 h-1.5 w-full overflow-hidden rounded-full transition-colors ${darkMode ? "bg-slate-700" : "bg-amber-100"}`}>
                    <div
                      className="h-full rounded-full bg-[#a26e35]"
                      style={{ width: `${draft.progress * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => onResumeDraft?.(draft)}
                    className="rounded-full bg-[#a26e35] px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#8b5e2d] transition-colors"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => onRemoveDraft?.(draft.id)}
                    className={`text-[11px] hover:text-rose-500 transition-colors ${darkMode ? "text-slate-600" : "text-gray-400"}`}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SupplierBookings;
