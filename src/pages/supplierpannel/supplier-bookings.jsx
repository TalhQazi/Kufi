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

const SupplierBookings = () => {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)]">
      {/* Left: bookings table */}
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Bookings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track all your bookings
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
              <span className="text-xs text-gray-500">Wed, 29 May 2025</span>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 pl-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a26e35]/40"
            />
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Booking History</h2>
            <button className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600">
              Last 24h
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-xs text-gray-600">
              <thead>
                <tr className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400">
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
                    className={idx % 2 === 1 ? "bg-gray-50/40" : "bg-white"}
                  >
                    <td className="px-6 py-3 text-xs text-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded-full bg-gray-200" />
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.code}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.guests}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.experience}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.date}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{row.amount}</td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${statusClass(
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
          <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-3 text-[11px] text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span>Result per page:</span>
              <select className="rounded-full border border-gray-200 px-2 py-1 text-[11px] text-gray-600 focus:outline-none">
                <option>5</option>
                <option>10</option>
                <option>20</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-1 text-xs">
              <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-400">
                {"<"}
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[#a26e35] text-[11px] font-semibold text-white">
                1
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-[11px] text-gray-500">
                2
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-[11px] text-gray-500">
                3
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-400">
                {">"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: draft itineraries */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-amber-100 bg-[#fff7ea] px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Draft itineraries</h2>
              <p className="mt-1 text-xs text-amber-800/80">
                You have <span className="font-semibold">3</span> itineraries saved as draft.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="rounded-xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-amber-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">
                      {draft.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-gray-500">{draft.author}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Last edited: {draft.lastEdit}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>Progress</span>
                    <span className="font-semibold text-[#a26e35]">
                      {Math.round(draft.progress * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
                    <div
                      className="h-full rounded-full bg-[#a26e35]"
                      style={{ width: `${draft.progress * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button className="rounded-full bg-[#a26e35] px-4 py-1.5 text-[11px] font-semibold text-white">
                    Resume
                  </button>
                  <button className="text-[11px] text-gray-400">🗑</button>
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
