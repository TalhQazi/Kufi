import React from "react";
import { ChevronDown } from "lucide-react";

const SupplierExperience = () => {
  return (
    <>
      {/* Experience header card */}
      <div className="mb-6 bg-white rounded-2xl border border-gray-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
            Create New Experience
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Add details about your travel experience, itinerary, and pricing.
          </p>
        </div>
        <button className="self-start sm:self-auto rounded-full bg-[#f5f5f7] px-4 sm:px-5 py-2 text-xs font-semibold text-gray-600">
          Experience Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)] gap-5">
        {/* Left column: forms */}
        <div className="space-y-5">
          {/* Basic details */}
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Basic Details</h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Experience Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a captivating title for your experience"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Destination</label>
                <input
                  type="text"
                  placeholder="City, Country or Region"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Days</label>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Nights</label>
                  <input
                    type="number"
                    defaultValue={0}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Maximum Group Size
                  </label>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Category</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 pr-8 text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#a26e35]">
                    <option value="">Select a category</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Cover image */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Cover Image</label>
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-xs text-gray-500">
                  <p className="mb-3 font-medium">Upload Cover Photo</p>
                  <p className="mb-4 text-[11px] text-gray-400">
                    PNG, JPG or WEBP (max. 10MB)
                  </p>
                  <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700">
                    Browse Files
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Experience description */}
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Experience Description
            </h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide a detailed description of your experience..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Highlights</label>
                <textarea
                  rows={3}
                  placeholder="Key highlights of the experience (one per line)"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
                <p className="text-[11px] text-gray-400">
                  Enter each highlight on a new line. These will appear as bullet points.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  What's Included / Excluded (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify what is included and excluded in your experience package..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <button className="w-full sm:w-auto rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700">
                Save as Draft
              </button>
              <button className="w-full sm:w-auto rounded-full bg-[#a26e35] px-5 py-2 text-xs font-semibold text-white">
                Publish Experience
              </button>
            </div>
          </div>
        </div>

        {/* Right column: summary */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Experience Summary
            </h2>
            <div className="h-32 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-[11px] text-gray-400">
              No cover image
            </div>

            <div className="mt-2 space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                Untitled Experience
              </p>
              <p className="text-xs text-gray-400">No destination set</p>
            </div>

            <div className="mt-3 space-y-1 text-xs text-gray-500">
              <p>1 day / 0 nights</p>
              <p>Up to 1 person</p>
              <p>Uncategorized</p>
            </div>

            <button className="mt-4 w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-[#a26e35]">
              Preview Experience
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default SupplierExperience;
