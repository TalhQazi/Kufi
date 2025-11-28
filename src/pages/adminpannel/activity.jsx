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
          <h1 className="text-2xl font-semibold text-slate-900">Activity</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage supplier listings, categories, and promotions
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 bg-[#a26e35] text-white text-sm font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-[#8b5c2a]"
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
          <div className="mt-2 flex flex-wrap gap-3 items-center">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === tab.value
                    ? "bg-[#a26e35] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#ddb071]/60"
                }`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
            <div className="ml-auto flex items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-sm text-gray-500">
              <Search className="w-4 h-4 mr-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings..."
                className="bg-transparent outline-none text-sm placeholder:text-gray-400 w-40"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Listing</th>
                <th className="text-left px-6 py-3 font-semibold">Category</th>
                <th className="text-left px-6 py-3 font-semibold">Location</th>
                <th className="text-left px-6 py-3 font-semibold">Price</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
                <th className="text-left px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredListings.map((item) => (
                <tr key={item.listing} className="hover:bg-gray-50/80">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{item.listing}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.provider}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.category}</td>
                  <td className="px-6 py-4 text-gray-600">{item.location}</td>
                  <td className="px-6 py-4 text-gray-600">{item.price}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <button
                        className="text-[#704b24] hover:text-[#8b5c2a]"
                        aria-label="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="hover:text-emerald-500" aria-label="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button className="hover:text-red-500" aria-label="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredListings.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">
              No listings in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;

