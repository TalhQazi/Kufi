import React, { useState } from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  X,
  Mail,
  Phone,
  Heart,
  Sparkles,
} from "lucide-react";
import SupplierGenerateItinerary from "./supplier-generate-itinerary";

const requests = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar:
      "https://images.pexels.com/photos/3760853/pexels-photo-3760853.jpeg?auto=compress&cs=tinysrgb&w=200",
    status: "Pending",
    location: "Bali, Indonesia",
    travelers: 2,
    amount: "$2,130",
    dateRange: "Dec 15 - Dec 22, 2024",
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar:
      "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=200",
    status: "Pending",
    location: "Tokyo, Japan",
    travelers: 4,
    amount: "$2,830",
    dateRange: "Jan 10 - Jan 20, 2025",
  },
  {
    id: 3,
    name: "Emma Williams",
    avatar:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200",
    status: "Pending",
    location: "Paris, France",
    travelers: 2,
    amount: "$2,450",
    dateRange: "Feb 14 - Feb 21, 2025",
  },
];

const SupplierRequests = () => {
  const [selectedId, setSelectedId] = useState(1);
  const [view, setView] = useState("list"); // 'list' | 'itinerary' | 'generate'
  const [acceptedRequestId, setAcceptedRequestId] = useState(null);
  const [itineraryRequestId, setItineraryRequestId] = useState(null);

  const selected = requests.find((r) => r.id === selectedId) ?? requests[0];
  const itineraryRequest =
    requests.find((r) => r.id === itineraryRequestId) ?? selected;

  if (view === "itinerary") {
    return (
      <div className="space-y-6">
        {/* Hero banner */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-tr from-[#1f2933] via-[#4b5563] to-[#9ca3af] relative h-48 flex items-end">
          <img
            src="https://images.pexels.com/photos/5700446/pexels-photo-5700446.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="City skyline"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="relative w-full px-6 pb-6 text-white flex flex-col gap-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-200 flex items-center gap-1">
              <span className="opacity-80">Dashboard</span>
              <span className="opacity-60">/</span>
              <span className="opacity-80">Requests</span>
              <span className="opacity-60">/</span>
              <span className="font-semibold">Create Itinerary</span>
            </p>
            <h1 className="text-2xl font-semibold drop-shadow-sm">
              Proceed to Create Itinerary
            </h1>
            <p className="text-xs text-gray-100 max-w-xl">
              Review traveler preferences and choose a personalized itinerary plan.
            </p>
          </div>
        </div>

        {/* Traveler overview + CTA */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Traveler Overview
            </h2>

            <div className="grid gap-4 text-[11px] text-gray-700 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  Destination
                </p>
                <p className="text-sm text-slate-900">{itineraryRequest.location}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                  Dates
                </p>
                <p className="text-sm text-slate-900">{itineraryRequest.dateRange}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  Travelers
                </p>
                <p className="text-sm text-slate-900">{itineraryRequest.travelers} Adults</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  Budget range
                </p>
                <p className="text-sm text-slate-900">$2000 - $2500</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-emerald-500" />
                  Interests
                </p>
                <p className="text-sm text-slate-900">Culture, Food, Art, Nightlife</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <span className="inline-block h-3.5 w-3.5 rounded-full bg-emerald-500" />
                  Accessibility
                </p>
                <p className="text-sm text-slate-900">Wheelchair Accessible</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-[11px] text-gray-700">
              <p className="mb-1 text-[11px] font-semibold text-gray-700">
                Traveler Notes
              </p>
              <p>
                Would love to explore local cafés and art museums.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setView("generate")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a26e35] px-6 py-3 text-xs font-semibold text-white shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Proceed to auto generate Itinerary</span>
          </button>
        </div>

        {/* Recommended templates */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recommended itinerary Templates
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Based on traveler preferences similar trips performed well.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col"
              >
                <div className="h-32 w-full overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/161853/eiffel-tower-paris-france-tower-161853.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Paris"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 px-4 py-3 text-[11px] text-gray-600">
                  <p className="text-sm font-semibold text-slate-900">
                    6-Day Classic Paris Discovery
                  </p>
                  <p>
                    Balanced mix of landmarks, culture & gastronomy.
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Louvre, Seine Cruise, Montmartre, local cafés
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {["Family-friendly", "Art & Culture", "Guided"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] text-gray-700"
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">From</span>
                    <span className="font-semibold text-slate-900">$2,150 est.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setView("generate")}
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-[#a26e35] px-4 py-2 text-[11px] font-semibold text-white"
                  >
                    Select Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 mt-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setView("list")}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="mr-2 rotate-180">➜</span>
            Back to Requests
          </button>
          <button
            type="button"
            onClick={() => setView("generate")}
            className="inline-flex items-center justify-center rounded-full bg-[#a26e35] px-6 py-2.5 text-xs font-semibold text-white shadow-sm"
          >
            Proceed to Auto Generate Itinerary
          </button>
        </div>
      </div>
    );
  }

  if (view === "generate") {
    return <SupplierGenerateItinerary />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)]">
      {/* Left: requests list */}
      <div className="space-y-5">
        {/* Header + search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Received Booking Request</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and manage incoming travel requests
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 pl-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a26e35]/40"
            />
          </div>
        </div>

        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm cursor-pointer hover:border-[#a26e35]/50"
              onClick={() => setSelectedId(req.id)}
            >
              {/* Top row: avatar, name, status */}
              <div className="flex items-center gap-3">
                <img
                  src={req.avatar}
                  alt={req.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {req.name}
                  </p>
                  <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                    {req.status}
                  </span>
                </div>
              </div>

              {/* Middle row: info */}
              <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-[12px] text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  {req.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                  {req.dateRange}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  {req.travelers} Travelers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  {req.amount}
                </span>
              </div>

              {/* Bottom row: actions */}
              <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <button
                  type="button"
                  disabled={acceptedRequestId !== req.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (acceptedRequestId === req.id) {
                      setItineraryRequestId(req.id);
                      setView("itinerary");
                    }
                  }}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
                    acceptedRequestId === req.id
                      ? "bg-[#a26e35] text-white shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="text-sm">★</span>
                  <span>Proceed To Create Itinerary</span>
                </button>
                <div className="flex w-full items-center justify-end gap-2 md:w-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAcceptedRequestId(req.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm"
                  >
                    <span className="text-sm leading-none">✔</span>
                    <span>Accept</span>
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm">
                    <span className="text-sm leading-none">✕</span>
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: traveler details */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between bg-gray-50 px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-slate-900">Traveler Details</p>
            <button className="text-xs text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-4 text-xs">
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <img
                src={selected.avatar}
                alt={selected.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {selected.name}
                </p>
                <p className="text-[11px] text-emerald-600">Verified Traveler</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 pt-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] text-gray-500">Email</p>
                <p className="text-xs text-slate-900">sarah.j@email.com</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] text-gray-500">Phone</p>
                <p className="text-xs text-slate-900">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 mt-1" />

            {/* Interests */}
            <div>
              <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-gray-700">
                <Heart className="h-3.5 w-3.5 text-emerald-500" />
                <span>Interests</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Beach", "Culture", "Adventure"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] text-emerald-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3" />

            {/* Special requests */}
            <div>
              <p className="mb-1 text-[11px] font-semibold text-gray-700">
                Special Requests
              </p>
              <div className="rounded-xl bg-gray-50 px-3 py-2 text-[11px] text-gray-600">
                Looking for romantic beachfront accommodations
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3" />

            {/* Trip summary */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-gray-700">Trip Summary</p>
              <div className="space-y-1.5 text-[11px] text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Destination:</span>
                  <span className="font-medium text-slate-900">Bali, Indonesia</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dates:</span>
                  <span className="font-medium text-slate-900">Dec 15 - Dec 22, 2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Travelers:</span>
                  <span className="font-medium text-slate-900">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Budget:</span>
                  <span className="font-semibold text-emerald-600">$3,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SupplierRequests;
