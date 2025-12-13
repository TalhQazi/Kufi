import React, { useState } from "react";
import { CalendarDays, MapPin, Users, DollarSign, Info } from "lucide-react";

const SupplierGenerateItinerary = () => {
  const [expandedDays, setExpandedDays] = useState([1, 2, 3]);

  const toggleDay = (day) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const DayCard = ({ day }) => {
    const isExpanded = expandedDays.includes(day);
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50/40 overflow-hidden">
        <button
          onClick={() => toggleDay(day)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-gray-800"
        >
          <span>Day {day}</span>
          <span className="text-lg text-gray-500">{isExpanded ? "⌃" : "⌄"}</span>
        </button>
        {isExpanded && (
          <div className="border-t border-amber-100 px-4 py-4 space-y-4 text-xs">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Select Activity</p>
                <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]">
                  <option>Select an activity</option>
                  <option>Museum visit</option>
                  <option>Seine river cruise</option>
                  <option>City walking tour</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Select Location</p>
                <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]">
                  <option>Select a location</option>
                  <option>Louvre Museum</option>
                  <option>Montmartre</option>
                  <option>Notre-Dame Area</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-gray-700">Add Description</p>
              <textarea
                rows={3}
                placeholder="Add notes or highlights about this activity..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Add Estimated Cost</p>
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <span className="mr-2 text-gray-400">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Start Time</p>
                <input
                  type="time"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-700">End Time</p>
                <input
                  type="time"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-gray-700">Add Image</p>
              <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-[11px] text-gray-500">
                <span className="mr-1 text-gray-400">📷</span>
                Drag and drop an image, or <span className="ml-1 font-semibold text-[#a26e35]">browse</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-900">Generate Itinerary</h1>
        <p className="text-sm text-gray-500">
          Finalize trip details and review the budget before sending it to the traveler.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)]">
        {/* Left: travel details + itinerary days */}
        <div className="space-y-4">
          {/* Travel details */}
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Travel Details</h2>

            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Destination</p>
                <input
                  type="text"
                  defaultValue="Paris, France"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>

              <div className="space-y-1">
                <p className="font-medium text-gray-700">Budget (USD)</p>
                <input
                  type="number"
                  defaultValue={5000}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>

              <div className="space-y-1">
                <p className="font-medium text-gray-700">Start Date</p>
                <input
                  type="date"
                  defaultValue="2025-06-15"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>

              <div className="space-y-1">
                <p className="font-medium text-gray-700">End Date</p>
                <input
                  type="date"
                  defaultValue="2025-06-20"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-medium text-gray-700">Preferences</p>
              <textarea
                rows={2}
                defaultValue="Cultural sites, fine dining, museums"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
              />
            </div>
          </div>

          {/* Itinerary details */}
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Itinerary Details</h2>

            {/* Day cards */}
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((day) => (
                <DayCard key={day} day={day} />
              ))}
            </div>
          </div>

          {/* Add day & actions */}
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-3 flex items-center justify-center text-xs text-gray-500">
            <span className="mr-2 text-lg">＋</span>
            Add New Day
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 mt-1 sm:flex-row sm:items-center sm:justify-between">
            <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
              Save Draft
            </button>
            <button className="inline-flex items-center justify-center rounded-full bg-[#a26e35] px-8 py-2.5 text-xs font-semibold text-white shadow-sm">
              Send to Traveler
            </button>
          </div>
        </div>

        {/* Right: itinerary summary */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5 space-y-4 text-xs">
            <h2 className="text-sm font-semibold text-slate-900">Itinerary Summary</h2>

            <div className="space-y-2 text-gray-700">
              <div className="flex items-start gap-2">
                <MapPin className="mt-[2px] h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <p className="text-[11px] text-gray-500">Destination</p>
                  <p className="text-xs text-slate-900">Paris, France</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CalendarDays className="mt-[2px] h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <p className="text-[11px] text-gray-500">Duration</p>
                  <p className="text-xs text-slate-900">Jun 15, 2024 - Jun 20, 2024 · 5 days</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="mt-[2px] h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <p className="text-[11px] text-gray-500">Preferences</p>
                  <p className="text-xs text-slate-900">Cultural sites, Fine dining, Museums</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3" />

            <div className="space-y-1 text-xs text-gray-700">
              <p className="text-[11px] font-semibold text-gray-700 mb-1">Cost Breakdown</p>
              <div className="flex items-center justify-between">
                <span>Total Budget</span>
                <span className="font-medium text-slate-900">$5,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Itinerary Cost</span>
                <span className="font-medium text-slate-900">$1,350</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Remaining</span>
                <span className="font-semibold text-emerald-600">$3,650</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-[#eef4ff] px-4 py-4 text-[11px] text-blue-900 flex gap-2">
            <div className="mt-0.5">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold">Ready to send?</p>
              <p>
                Review all activities before sending the itinerary to the traveler.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SupplierGenerateItinerary;
