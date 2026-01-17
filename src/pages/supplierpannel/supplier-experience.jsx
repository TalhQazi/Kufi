import api from "../../api";
import React, { useState, useEffect } from "react";
import { Clock, Star, Users, Bus, MapPin, ChevronDown } from "lucide-react";

const ExperienceDetails = ({ darkMode, experience, onBack, onBookNow }) => {
  return (
    <div className={`space-y-6 transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      {/* Header card */}
      <div className={`rounded-2xl border px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-gray-100 text-gray-600"}`}
            title="Go back"
          >
            <ChevronDown className="h-5 w-5 rotate-90" />
          </button>
          <div className="min-w-0">
            <h1 className={`text-base sm:text-xl font-semibold transition-colors truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
              {experience.title}
            </h1>
            <p className={`text-[10px] sm:text-sm mt-0.5 transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              Detailed information about this package
            </p>
          </div>
        </div>
        <button
          onClick={onBookNow}
          className="w-full sm:w-auto rounded-full bg-[#a26e35] px-6 py-2.5 sm:py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#8b5e2d] transition-colors"
        >
          Book Now
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image and Key Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video sm:h-80 w-full overflow-hidden rounded-2xl shadow-sm">
            <img src={experience.image || experience.imageUrl || "/assets/activity1.jpeg"} alt={experience.title} className="w-full h-full object-cover" />
          </div>

          <div className={`rounded-2xl border p-4 sm:p-6 space-y-6 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div>
              <h2 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Description</h2>
              <p className={`text-xs sm:text-sm leading-relaxed transition-colors ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                {experience.description || `Experience the magic of ${experience.title}. This package offers a unique blend of adventure and relaxation.`}
              </p>
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-6 transition-colors ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto mb-2 text-[#a26e35]" />
                <p className={`text-[10px] uppercase tracking-wider transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Duration</p>
                <p className={`text-[11px] sm:text-xs font-semibold mt-1 transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{experience.duration || "N/A"}</p>
              </div>
              <div className="text-center">
                <Users className="w-5 h-5 mx-auto mb-2 text-[#a26e35]" />
                <p className={`text-[10px] uppercase tracking-wider transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Capacity</p>
                <p className={`text-[11px] sm:text-xs font-semibold mt-1 transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{experience.capacity || "12"} People</p>
              </div>
              <div className="text-center">
                <Star className="w-5 h-5 mx-auto mb-2 text-amber-500 fill-amber-500" />
                <p className={`text-[10px] uppercase tracking-wider transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Rating</p>
                <p className={`text-[11px] sm:text-xs font-semibold mt-1 transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{experience.rating || "4.5"}</p>
              </div>
              <div className="text-center">
                <Bus className="w-5 h-5 mx-auto mb-2 text-[#a26e35]" />
                <p className={`text-[10px] uppercase tracking-wider transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Activities</p>
                <p className={`text-[11px] sm:text-xs font-semibold mt-1 transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{experience.activitiesCount || "4"} Activities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Summary / Pricing */}
        <div className="space-y-6">
          <div className={`rounded-2xl border p-6 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h3 className={`text-sm font-semibold mb-4 transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>Pricing Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className={darkMode ? "text-slate-400" : "text-gray-600"}>Base Price</span>
                <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>${experience.price || "299"}.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className={darkMode ? "text-slate-400" : "text-gray-600"}>Tax & Fees</span>
                <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>$0.00</span>
              </div>
              <div className={`border-t pt-3 flex justify-between items-center transition-colors ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
                <span className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Total /person</span>
                <span className="text-lg font-bold text-[#a26e35]">${experience.price || "299"}.00</span>
              </div>
            </div>
            <button
              onClick={onBookNow}
              className="w-full mt-6 rounded-xl bg-[#a26e35] text-white py-3 font-semibold shadow-md hover:bg-[#8b5e2d] transition-colors"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExperiencesListing = ({ darkMode, experiences, onAddExperience, onEditExperience, onViewDetails, onBookNow }) => {
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
          <button
            onClick={onBookNow}
            className={`mt-2 inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold shadow-sm transition-all ${darkMode ? "bg-[#a26e35] text-white hover:bg-[#8b5e2d]" : "bg-white text-[#0f9dbf] hover:bg-gray-100"}`}>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {experiences.length > 0 ? experiences.map((exp) => (
          <div
            key={exp._id || exp.id}
            onClick={() => onViewDetails?.(exp)}
            className={`flex flex-col cursor-pointer overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}
          >
            <div className="h-40 w-full overflow-hidden">
              <img
                src={exp.image || exp.imageUrl || "/assets/activity1.jpeg"}
                alt={exp.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-3 px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-[#a26e35] flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {exp.category || "Adventure"}
                  </p>
                  <h4 className={`mt-1 text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {exp.title}
                  </h4>
                  <p className={`mt-0.5 text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                    {exp.duration || "N/A"}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{exp.rating || "4.5"}</span>
                  </div>
                  <p className={`mt-0.5 text-[10px] transition-colors ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
                    {exp.reviews || "0"} Reviews
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
                  <span>{exp.activitiesCount || "4"} Activities</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className={`text-xs font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                  ${exp.price || "299"}
                  <span className={`ml-1 text-[10px] font-normal transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                    /person
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditExperience?.(exp);
                  }}
                  className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )) : <div className="col-span-full py-12 text-center text-gray-400 text-sm">No experiences found</div>}
      </div>
    </div>
  );
};

const CreateExperienceForm = ({ darkMode, onBack, experience }) => {
  return (
    <>
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
        <div className="space-y-5">
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>Basic Details</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Experience Title</label>
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
                  defaultValue={experience?.location || ""}
                  placeholder="City, Country or Region"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Days</label>
                  <input
                    type="number"
                    defaultValue={experience?.days || 1}
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Nights</label>
                  <input
                    type="number"
                    defaultValue={experience?.nights || 0}
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Max Group Size</label>
                  <input
                    type="number"
                    defaultValue={experience?.capacity || 12}
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Category</label>
                <div className="relative">
                  <select className={`w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-500"}`}>
                    <option value="">{experience?.category || "Select a category"}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Cover Image</label>
                {experience ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl">
                    <img src={experience.image || experience.imageUrl || ""} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button className="bg-white/90 text-gray-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl hover:bg-white transition-colors">Change Photo</button>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-2xl border border-dashed transition-colors px-6 py-8 text-center text-xs ${darkMode ? "bg-slate-800/50 border-slate-700 text-slate-500" : "bg-gray-50 border-gray-300 text-gray-500"}`}>
                    <p className={`mb-3 font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Upload Cover Photo</p>
                    <button className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>Browse Files</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>Experience Description</h2>
            <div className="space-y-3">
              <textarea
                rows={4}
                defaultValue={experience?.description || ""}
                placeholder="Provide a detailed description of your experience..."
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400"}`}
              />
            </div>
            <div className={`mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end transition-colors ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
              <button onClick={onBack} className={`w-full sm:w-auto rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>Cancel</button>
              <button onClick={onBack} className="w-full sm:w-auto rounded-full bg-[#a26e35] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8b5e2d] transition-colors">{experience ? "Update Experience" : "Publish Experience"}</button>
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>Summary</h2>
            <div className={`h-32 rounded-xl border border-dashed flex items-center justify-center text-[11px] overflow-hidden transition-colors ${darkMode ? "bg-slate-800/50 border-slate-700 text-slate-500" : "bg-gray-50 border-gray-300 text-gray-400"}`}>
              {(experience?.image || experience?.imageUrl) ? <img src={experience.image || experience.imageUrl} className="w-full h-full object-cover" alt="" /> : "No cover image"}
            </div>
            <p className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>{experience?.title || "Untitled"}</p>
            <button className={`mt-4 w-full rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-[#a26e35] hover:bg-slate-700" : "bg-white border-gray-200 text-[#a26e35] hover:bg-gray-50"}`}>Preview</button>
          </div>
        </aside>
      </div>
    </>
  );
};

const SupplierExperience = ({ darkMode, view = 'list', onViewChange, navigateTo }) => {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/activities/supplier');
        setExperiences(response.data || []);
      } catch (error) {
        console.error("Error fetching supplier experiences:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a26e35]"></div>
      </div>
    );
  }

  if (view === "create" || view === "edit") {
    return (
      <CreateExperienceForm
        darkMode={darkMode}
        experience={view === "edit" ? selectedExperience : null}
        onBack={() => {
          setSelectedExperience(null);
          onViewChange?.("list");
        }}
      />
    );
  }

  if (view === "details" && selectedExperience) {
    return (
      <ExperienceDetails
        darkMode={darkMode}
        experience={selectedExperience}
        onBack={() => {
          setSelectedExperience(null);
          onViewChange?.("list");
        }}
        onBookNow={() => {
          navigateTo?.("Booking");
        }}
      />
    );
  }

  return (
    <ExperiencesListing
      darkMode={darkMode}
      experiences={experiences}
      onAddExperience={() => onViewChange?.("create")}
      onEditExperience={(exp) => {
        setSelectedExperience(exp);
        onViewChange?.("edit");
      }}
      onViewDetails={(exp) => {
        setSelectedExperience(exp);
        onViewChange?.("details");
      }}
      onBookNow={() => {
        navigateTo?.("Booking");
      }}
    />
  );
};

export default SupplierExperience;
