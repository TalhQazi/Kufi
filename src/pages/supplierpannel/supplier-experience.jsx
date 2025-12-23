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

const ExperiencesListing = ({ darkMode, onAddExperience, onEditExperience }) => {
  return (
    <div className={`space-y-6 transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      {/* Top header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-xl font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Experiences</h1>
          <p className={`mt-1 text-sm transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            Manage your experiences and offerings
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-sm border transition-colors ${darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-gray-100 text-gray-500"}`}>
            <span className="text-xs">Wed, 29 May 2025</span>
          </div>
          <button
            onClick={onAddExperience}
            className="inline-flex items-center justify-center rounded-full bg-[#a26e35] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#8b5e2d] transition-colors"
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
            className={`w-full rounded-full border px-4 py-2 pl-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#a26e35]/40 ${darkMode ? "bg-slate-900 border-slate-800 text-white placeholder:text-slate-600" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
          />
        </div>
      </div>

      {/* Hero banner */}
      <div className={`relative overflow-hidden rounded-2xl px-6 py-6 sm:px-10 sm:py-8 text-white transition-colors ${darkMode ? "bg-slate-800" : "bg-[#0f9dbf]"}`}>
        <div className="max-w-md space-y-3">
          <p className={`text-xs font-medium uppercase tracking-widest transition-colors ${darkMode ? "text-slate-400" : "text-[#e3f6fb]"}`}>
            Are You Ready To Travel?
          </p>
          <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">
            Remember Us !!
          </h2>
          <p className={`text-xs sm:text-sm transition-colors ${darkMode ? "text-slate-300" : "text-[#e3f6fb]"}`}>
            Curated experiences and packages designed to give your guests
            unforgettable memories.
          </p>
          <button className={`mt-2 inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold shadow-sm transition-all ${darkMode ? "bg-[#a26e35] text-white hover:bg-[#8b5e2d]" : "bg-white text-[#0f9dbf] hover:bg-gray-100"}`}>
            Book Now
          </button>
        </div>

        <div className={`pointer-events-none absolute -right-10 bottom-0 hidden h-40 w-64 translate-y-6 overflow-hidden rounded-tl-[48px] bg-white/5 sm:block transition-colors ${darkMode ? "bg-white/10" : "bg-white/5"}`} />
      </div>

      {/* Packages header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>All Inclusive Packages!</h3>
        <button className="text-xs font-medium text-[#a26e35] hover:underline transition-all">View All</button>
      </div>

      {/* Experiences grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}
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
                  <h4 className={`mt-1 text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {exp.title}
                  </h4>
                  <p className={`mt-0.5 text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                    {exp.duration}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{exp.rating}</span>
                  </div>
                  <p className={`mt-0.5 text-[10px] transition-colors ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
                    {exp.reviews} Reviews
                  </p>
                </div>
              </div>

              <div className={`flex items-center justify-between border-y py-2 text-[11px] transition-colors ${darkMode ? "border-slate-800 text-slate-400" : "border-gray-100 text-gray-600"}`}>
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
                <div className={`text-xs font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                  $299
                  <span className={`ml-1 text-[10px] font-normal transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                    /person
                  </span>
                </div>
                <button
                  onClick={() => onEditExperience?.(exp)}
                  className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
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

const CreateExperienceForm = ({ darkMode, onBack, experience }) => {
  return (
    <>
      {/* Experience header card */}
      <div className={`mb-6 rounded-2xl border px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-gray-100 text-gray-600"}`}
            title="Go back"
          >
            <ChevronDown className="h-5 w-5 rotate-90" />
          </button>
          <div>
            <h1 className={`text-lg sm:text-xl font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
              {experience ? "Edit Experience" : "Create New Experience"}
            </h1>
            <p className={`text-xs sm:text-sm mt-1 transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              {experience
                ? `Editing: ${experience.title}`
                : "Add details about your travel experience, itinerary, and pricing."}
            </p>
          </div>
        </div>
        <button className={`self-start sm:self-auto rounded-full px-4 sm:px-5 py-2 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 text-slate-300" : "bg-[#f5f5f7] text-gray-600"}`}>
          Experience Details
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)] gap-5">
        {/* Left column: forms */}
        <div className="space-y-5">
          {/* Basic details */}
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>Basic Details</h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>
                  Experience Title
                </label>
                <input
                  type="text"
                  defaultValue={experience?.title || ""}
                  placeholder="Enter a captivating title for your experience"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Destination</label>
                <input
                  type="text"
                  defaultValue={experience ? "Hawaii, USA" : ""}
                  placeholder="City, Country or Region"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Days</label>
                  <input
                    type="number"
                    defaultValue={experience ? 3 : 1}
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Nights</label>
                  <input
                    type="number"
                    defaultValue={experience ? 2 : 0}
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>
                    Maximum Group Size
                  </label>
                  <input
                    type="number"
                    defaultValue={experience ? 12 : 1}
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Category</label>
                <div className="relative">
                  <select className={`w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-500"}`}>
                    <option value="">{experience ? "Adventure" : "Select a category"}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Cover image */}
              <div className="space-y-2">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Cover Image</label>
                {experience ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl">
                    <img src={experience.image} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button className="bg-white/90 text-gray-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl hover:bg-white transition-colors">Change Photo</button>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-2xl border border-dashed transition-colors px-6 py-8 text-center text-xs ${darkMode ? "bg-slate-800/50 border-slate-700 text-slate-500" : "bg-gray-50 border-gray-300 text-gray-500"}`}>
                    <p className={`mb-3 font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Upload Cover Photo</p>
                    <p className={`mb-4 text-[11px] transition-colors ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
                      PNG, JPG or WEBP (max. 10MB)
                    </p>
                    <button className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Experience description */}
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>
              Experience Description
            </h2>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Description</label>
                <textarea
                  rows={4}
                  defaultValue={experience ? "Enjoy a beautiful sunset while kayaking through the calm waters of the bay. This experience includes all necessary equipment and a professional guide." : ""}
                  placeholder="Provide a detailed description of your experience..."
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Highlights</label>
                <textarea
                  rows={3}
                  defaultValue={experience ? "Guided sunset tour\nAll equipment included\nComplimentary drinks" : ""}
                  placeholder="Key highlights of the experience (one per line)"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                />
                <p className={`text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                  Enter each highlight on a new line. These will appear as bullet points.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>
                  What's Included / Excluded (Optional)
                </label>
                <textarea
                  rows={3}
                  defaultValue={experience ? "Included: Kayak, life jacket, guide, water\nExcluded: Transportation to the bay, tips" : ""}
                  placeholder="Specify what is included and excluded in your experience package..."
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                />
              </div>
            </div>

            <div className={`mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end transition-colors ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
              <button onClick={onBack} className={`w-full sm:w-auto rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                Cancel
              </button>
              <button
                onClick={onBack}
                className="w-full sm:w-auto rounded-full bg-[#a26e35] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8b5e2d] transition-colors"
              >
                {experience ? "Update Experience" : "Publish Experience"}
              </button>
            </div>
          </div>
        </div>

        {/* Right column: summary */}
        <aside className="space-y-4">
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>
              Experience Summary
            </h2>
            <div className={`h-32 rounded-xl border border-dashed flex items-center justify-center text-[11px] overflow-hidden transition-colors ${darkMode ? "bg-slate-800/50 border-slate-700 text-slate-500" : "bg-gray-50 border-gray-300 text-gray-400"}`}>
              {experience ? (
                <img src={experience.image} className="w-full h-full object-cover" alt="" />
              ) : "No cover image"}
            </div>

            <div className="mt-2 space-y-1">
              <p className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>
                {experience?.title || "Untitled Experience"}
              </p>
              <p className={`text-xs transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>{experience ? "Hawaii, USA" : "No destination set"}</p>
            </div>

            <div className={`mt-3 space-y-1 text-xs transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              <p>{experience ? "3 days / 2 nights" : "1 day / 0 nights"}</p>
              <p>Up to {experience ? "12 people" : "1 person"}</p>
              <p>{experience ? "Adventure" : "Uncategorized"}</p>
            </div>

            <button className={`mt-4 w-full rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-[#a26e35] hover:bg-slate-700" : "bg-white border-gray-200 text-[#a26e35] hover:bg-gray-50"}`}>
              Preview Experience
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

const SupplierExperience = ({ darkMode, view = 'list', onViewChange }) => {
  const [editingExperience, setEditingExperience] = useState(null);

  if (view === "create" || (view === "edit")) {
    return (
      <CreateExperienceForm
        darkMode={darkMode}
        experience={view === "edit" ? editingExperience : null}
        onBack={() => {
          setEditingExperience(null);
          onViewChange?.("list");
        }}
      />
    );
  }

  return (
    <ExperiencesListing
      darkMode={darkMode}
      onAddExperience={() => onViewChange?.("create")}
      onEditExperience={(exp) => {
        setEditingExperience(exp);
        onViewChange?.("edit");
      }}
    />
  );
};

export default SupplierExperience;
