import React, { useState } from "react";
import { ArrowRight, Search, Eye, Check, X } from "lucide-react";

const tabs = [
  { label: "All Listings", value: "all" },
  { label: "Pending (12)", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const listings = [
  {
    listing: "Luxury Villa in Bali",
    provider: "Paradise Stays",
    category: "Accommodation",
    location: "Bali, Indonesia",
    price: "$250/night",
    status: "pending",
  },
  {
    listing: "City Tour Package",
    provider: "Adventure Tours",
    category: "Tours",
    location: "Tokyo, Japan",
    price: "$120/person",
    status: "pending",
  },
  {
    listing: "Beach Resort Stay",
    provider: "Coastal Resorts",
    category: "Accommodation",
    location: "Maldives",
    price: "$400/night",
    status: "approved",
  },
];

const StatusBadge = ({ status }) => {
  const styles =
    status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "pending"
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";

  return (
    <span className={`px-3 py-1 text-[11px] font-semibold rounded-full ${styles}`}>
      {status}
    </span>
  );
};

const Activity = ({ onAddNew }) => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredListings =
    activeTab === "all"
      ? listings
      : listings.filter((item) => item.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Activity</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage supplier listings, categories, and promotions
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 bg-[#a26e35] text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 rounded-lg shadow-sm hover:bg-[#8b5c2a] transition-colors w-full sm:w-auto"
          onClick={onAddNew}
        >
          <ArrowRight className="w-4 h-4" />
          Add New Activity
        </button>
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-5 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">
            Listings
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${activeTab === tab.value
                      ? "bg-[#a26e35] text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#ddb071]/60"
                    }`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-sm text-gray-500 ml-0 md:ml-auto">
              <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search listings..."
                className="bg-transparent outline-none text-sm placeholder:text-gray-400 w-full md:w-40"
              />
            </div>
          </div>
        </div>

        {/* Mobile: Card View */}
        <div className="md:hidden space-y-4">
          {filteredListings.map((item) => (
            <div key={item.listing} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{item.listing}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.provider}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] border-y border-gray-100 py-3">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Category</p>
                  <p className="text-slate-700 font-medium">{item.category}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</p>
                  <p className="text-[#c18c4d] font-bold">{item.price}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Location</p>
                  <p className="text-slate-700 font-medium">{item.location}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button className="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button className="flex-1 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold flex items-center justify-center gap-1">
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table View */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-100 mt-2">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Listing</th>
                <th className="text-left px-6 py-3 font-semibold hidden lg:table-cell">Category</th>
                <th className="text-left px-6 py-3 font-semibold hidden xl:table-cell">Location</th>
                <th className="text-left px-6 py-3 font-semibold">Price</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
                <th className="text-left px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredListings.map((item) => (
                <tr key={item.listing} className="hover:bg-gray-50/80">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900 leading-tight">{item.listing}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.provider}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">{item.category}</td>
                  <td className="px-6 py-4 text-gray-600 hidden xl:table-cell">{item.location}</td>
                  <td className="px-6 py-4 text-[#a26e35] font-semibold">{item.price}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    <div className="flex items-center gap-3">
                      <button
                        className="text-[#704b24] hover:text-[#8b5c2a] transition-colors"
                        aria-label="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="hover:text-emerald-500 transition-colors" aria-label="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button className="hover:text-red-500 transition-colors" aria-label="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredListings.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500 bg-gray-50/30">
              No listings match the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;

