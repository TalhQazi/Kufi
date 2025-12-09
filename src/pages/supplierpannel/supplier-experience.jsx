import React, { useState } from "react";
import { Clock, Star, Users, Bus, MapPin, ChevronDown } from "lucide-react";

const experiences = [
  {
    id: 1,
    title: "Sunset Kayaking Tour",
    duration: "3 Days 4 Nights",
    rating: 4.7,
    reviews: 128,
    image:
      "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 2,
    title: "Mountain Hiking Escape",
    duration: "4 Days 3 Nights",
    rating: 4.9,
    reviews: 94,
    image:
      "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 3,
    title: "Scenic Road Trip",
    duration: "5 Days 4 Nights",
    rating: 4.8,
    reviews: 73,
    image:
      "https://images.pexels.com/photos/1521296/pexels-photo-1521296.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 4,
    title: "Island Adventure Getaway",
    duration: "2 Days 3 Nights",
    rating: 4.6,
    reviews: 51,
    image:
      "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 5,
    title: "Forest Camping Retreat",
    duration: "3 Days 2 Nights",
    rating: 4.5,
    reviews: 39,
    image:
      "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 6,
    title: "Tropical Beach Escape",
    duration: "4 Days 4 Nights",
    rating: 4.9,
    reviews: 112,
    image:
      "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

const ExperiencesListing = ({ onAddExperience }) => {
  return (
    <div className="space-y-6">
      {/* Top header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Experiences</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your experiences and offerings
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-100">
            <span className="text-xs text-gray-500">Wed, 29 May 2025</span>
          </div>
          <button
            onClick={onAddExperience}
            className="inline-flex items-center justify-center rounded-full bg-[#a26e35] px-5 py-2 text-xs font-semibold text-white shadow-sm"
          >
            Add Experience
          </button>
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

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f9dbf] px-6 py-6 sm:px-10 sm:py-8 text-white">
        <div className="max-w-md space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-[#e3f6fb]">
            Are You Ready To Travel?
          </p>
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">
            Remember Us !!
          </h2>
          <p className="text-xs sm:text-sm text-[#e3f6fb]">
            Curated experiences and packages designed to give your guests
            unforgettable memories.
          </p>
          <button className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold text-[#0f9dbf] shadow-sm">
            Book Now
          </button>
        </div>

        <div className="pointer-events-none absolute -right-10 bottom-0 hidden h-40 w-64 translate-y-6 overflow-hidden rounded-tl-[48px] bg-white/5 sm:block" />
      </div>

      {/* Packages header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">All Inclusive Packages!</h3>
        <button className="text-xs font-medium text-[#a26e35]">View All</button>
      </div>

      {/* Experiences grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="h-40 w-full overflow-hidden">
              <img
                src={exp.image}
                alt={exp.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-3 px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-[#a26e35] flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Adventure
                  </p>
                  <h4 className="mt-1 text-sm font-semibold text-slate-900">
                    {exp.title}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {exp.duration}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{exp.rating}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {exp.reviews} Reviews
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-y border-gray-100 py-2 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#a26e35]" />
                  <span>Duration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#a26e35]" />
                  <span>Capacity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bus className="h-3.5 w-3.5 text-[#a26e35]" />
                  <span>4 Activities</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-900">
                  $299
                  <span className="ml-1 text-[10px] font-normal text-gray-500">
                    /person
                  </span>
                </div>
                <button className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateExperienceForm = () => {
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

const SupplierExperience = () => {
  const [view, setView] = useState("list");

  if (view === "create") {
    return <CreateExperienceForm />;
  }

  return <ExperiencesListing onAddExperience={() => setView("create")} />;
};

export default SupplierExperience;
