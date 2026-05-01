import api from "../../api";
import React, { useState, useEffect } from "react";
import { Clock, Star, Users, Bus, MapPin, ChevronDown, Plus } from "lucide-react";

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

const ExperiencesListing = ({ darkMode, experiences, drafts = [], onAddExperience, onEditExperience, onResumeDraft, onDeleteDraft, onViewDetails, onBookNow }) => {
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
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditExperience?.(exp);
                    }}
                    className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      {/* We need to pass delete handler down or move it up */ }
                      if (window.confirm("Delete this experience?")) {
                        api.delete(`/activities/${exp._id || exp.id}`).then(() => window.location.reload());
                      }
                    }}
                    className={`inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-colors ${darkMode ? "bg-rose-950/20 border-rose-900/30 hover:bg-rose-900/40" : ""}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : <div className="col-span-full py-12 text-center text-gray-400 text-sm">No experiences found</div>}
      </div>

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div className="mt-8">
          <h3 className={`text-lg font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"} mb-4`}>
            Drafts ({drafts.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {drafts.map((draft) => (
              <div
                key={draft._id}
                className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}
              >
                <div className="h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {draft.image ? (
                    <img src={draft.image} alt={draft.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className={`flex h-full items-center justify-center ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
                      <Clock className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="space-y-3 px-4 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Draft
                        </span>
                      </div>
                      <h4 className={`mt-2 text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                        {draft.title || "Untitled Draft"}
                      </h4>
                      <p className={`mt-0.5 text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                        {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : "No date"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`text-xs font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
                      ${draft.price || "0"}
                      <span className={`ml-1 text-[10px] font-normal transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
                        /person
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onResumeDraft?.(draft)}
                        className="inline-flex items-center justify-center rounded-full bg-[#a26e35] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#8b5e2d]"
                      >
                        Resume
                      </button>
                      <button
                        onClick={() => onDeleteDraft?.(draft._id)}
                        className={`inline-flex items-center justify-center rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-colors ${darkMode ? "bg-rose-950/20 border-rose-900/30 hover:bg-rose-900/40" : ""}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CreateExperienceForm = ({ darkMode, onBack, experience, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: experience?.title || "",
    location: experience?.location || "",
    category: experience?.category || "",
    description: experience?.description || "",
    price: experience?.price || "",
    image: experience?.image || experience?.imageUrl || "",
    duration: experience?.duration || "",
    difficulty: experience?.difficulty || "Easy",
    season: experience?.season || "Summer",
    highlights: experience?.highlights || [""],
    addOns: experience?.addOns || [""],
    coordinates: experience?.coordinates || { lat: "", lng: "" }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState(experience?.countryId || "");
  const [selectedCityId, setSelectedCityId] = useState(experience?.cityId || "");
  const [destLoading, setDestLoading] = useState(true);

  const [supplierCountryName, setSupplierCountryName] = useState("");
  const [lockedCountryId, setLockedCountryId] = useState("");

  // Categories from website (same as homepage CategoriesSection)
  const websiteCategories = [
    "Culture",
    "Sightseeing",
    "Families",
    "Food and Drink",
    "Adventure",
    "In the Air",
    "On the water",
    "Entertainment",
    "Seasonal",
  ];

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setDestLoading(true);
        const countriesRes = await api.get('/countries').catch(() => ({ data: [] }));
        setCountries(Array.isArray(countriesRes.data) ? countriesRes.data : []);
      } catch (err) {
        console.error("Error fetching countries:", err);
      } finally {
        setDestLoading(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser')
      const user = stored ? JSON.parse(stored) : null
      const name = user?.country || user?.Country || user?.profile?.country || ''
      setSupplierCountryName(String(name || '').trim())
    } catch {
      setSupplierCountryName('')
    }
  }, [])

  useEffect(() => {
    if (supplierCountryName) return
    const fetchSupplierCountry = async () => {
      try {
        const res = await api.get('/auth/profile')
        const name = res?.data?.country || res?.data?.user?.country || ''
        const next = String(name || '').trim()
        if (next) setSupplierCountryName(next)
      } catch {
      }
    }
    fetchSupplierCountry()
  }, [supplierCountryName])

  useEffect(() => {
    if (!supplierCountryName || !countries.length) return
    const normalized = String(supplierCountryName).trim()

    const matchedById = countries.find((c) => String(c?._id || c?.id || '') === normalized)
    const matchedByName = countries.find((c) => String(c?.name || '').toLowerCase() === normalized.toLowerCase())
    const matched = matchedById || matchedByName
    const matchedId = matched?._id || matched?.id || ''
    if (!matchedId) return

    setLockedCountryId(matchedId)
    if (selectedCountryId !== matchedId) {
      setSelectedCountryId(matchedId)
      setSelectedCityId("")
    }
  }, [supplierCountryName, countries])

  useEffect(() => {
    if (!selectedCountryId) {
      setCities([]);
      setSelectedCityId("");
      return;
    }
    const fetchCities = async () => {
      try {
        const response = await api.get(`/cities?country=${encodeURIComponent(selectedCountryId)}`);
        const list = Array.isArray(response.data) ? response.data : [];
        setCities(list);
        if (!list.some((c) => (c._id || c.id) === selectedCityId)) {
          setSelectedCityId("");
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
        setCities([]);
        setSelectedCityId("");
      }
    };
    fetchCities();
  }, [selectedCountryId]);

  // When editing: try to preselect country & city from experience.location (e.g. "Lahore, Pakistan")
  useEffect(() => {
    if (!experience?.location || !countries.length) return;
    const parts = String(experience.location).split(",").map((s) => s.trim());
    const countryName = parts[parts.length - 1];
    const cityName = parts[0];
    if (!countryName) return;
    const country = countries.find((c) => (c.name || "").toLowerCase() === countryName.toLowerCase());
    if (country && !selectedCountryId) {
      setSelectedCountryId(country._id || country.id);
    }
  }, [countries, experience?.location]);

  useEffect(() => {
    if (!experience?.location || !cities.length) return;
    const parts = String(experience.location).split(",").map((s) => s.trim());
    const cityName = parts[0];
    const city = cities.find((c) => (c.name || "").toLowerCase() === (cityName || "").toLowerCase());
    if (city && !selectedCityId) {
      setSelectedCityId(city._id || city.id);
    }
  }, [cities, experience?.location]);

  useEffect(() => {
    if (!selectedCityId || !selectedCountryId || !cities.length || !countries.length) return;
    const city = cities.find((c) => (c._id || c.id) === selectedCityId);
    const country = countries.find((c) => (c._id || c.id) === selectedCountryId);
    if (city && country) {
      setFormData((prev) => ({ ...prev, location: `${city.name}, ${country.name}` }));
    }
  }, [selectedCityId, selectedCountryId, cities, countries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        highlights: (Array.isArray(formData.highlights) ? formData.highlights : [])
          .map((v) => String(v || '').trim())
          .filter(Boolean),
        addOns: (Array.isArray(formData.addOns) ? formData.addOns : [])
          .map((v) => String(v || '').trim())
          .filter(Boolean),
        coordinates: {
          lat: formData.coordinates?.lat ? Number(formData.coordinates.lat) : null,
          lng: formData.coordinates?.lng ? Number(formData.coordinates.lng) : null,
        },
        price: formData.price ? Number(formData.price) : undefined,
        duration: formData.duration || undefined,
        status: 'pending', // Send to admin for approval
      };
      if (experience) {
        await api.put(`/activities/${experience._id || experience.id}`, payload);
        alert("Experience updated successfully!");
      } else {
        await api.post('/supplier/activities', payload);
        alert("Experience published successfully!");
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving experience:", error);
      alert("Failed to save experience");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoordinateChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: { ...prev.coordinates, [field]: value }
    }));
  };

  const handleHighlightInputChange = (index, value) => {
    setFormData((prev) => {
      const next = Array.isArray(prev.highlights) ? [...prev.highlights] : [""];
      next[index] = value;
      return { ...prev, highlights: next };
    });
  };

  const handleHighlightAppend = () => {
    setFormData((prev) => {
      const current = Array.isArray(prev.highlights) ? prev.highlights : [""];
      return { ...prev, highlights: [...current, ""] };
    });
  };

  const handleAddOnInputChange = (index, value) => {
    setFormData((prev) => {
      const next = Array.isArray(prev.addOns) ? [...prev.addOns] : [""];
      next[index] = value;
      return { ...prev, addOns: next };
    });
  };

  const handleAddOnAppend = () => {
    setFormData((prev) => {
      const current = Array.isArray(prev.addOns) ? prev.addOns : [""];
      return { ...prev, addOns: [...current, ""] };
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={`mb-6 rounded-2xl border px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className="flex items-center gap-4">
          <button
            type="button"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)] gap-5">
        <div className="space-y-5">
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>Basic Details</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Experience Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a captivating title"
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-gray-200 text-gray-700"}`}
                />
              </div>
              <div className="space-y-3">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Destination (Country & City from database)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-500"}`}>Country</span>
                    <select
                      required
                      value={selectedCountryId}
                      onChange={(e) => {
                        setSelectedCountryId(e.target.value);
                        setSelectedCityId("");
                      }}
                      disabled={destLoading || !!lockedCountryId}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                    >
                      <option value="">Select country</option>
                      {countries.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <span className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-500"}`}>City</span>
                    <select
                      required
                      value={selectedCityId}
                      onChange={(e) => setSelectedCityId(e.target.value)}
                      disabled={!selectedCountryId || destLoading}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                    >
                      <option value="">{selectedCountryId ? "Select city" : "Select country first"}</option>
                      {cities.map((city) => (
                        <option key={city._id || city.id} value={city._id || city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {formData.location && (
                  <p className={`text-[10px] ${darkMode ? "text-slate-500" : "text-gray-500"}`}>Destination: {formData.location}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Duration (hours)</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2 hours"
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200"}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Price ($)</label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200"}`}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Category (from website)</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                >
                  <option value="">Select category</option>
                  {websiteCategories.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Difficulty Level</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Recommended Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-700"}`}
                  >
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                    <option value="Spring">Spring</option>
                    <option value="Autumn">Autumn</option>
                    <option value="All Year">All Year</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Latitude</label>
                  <input
                    type="text"
                    value={formData.coordinates?.lat || ""}
                    onChange={(e) => handleCoordinateChange("lat", e.target.value)}
                    placeholder="e.g., 40.7128"
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200"}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Longitude</label>
                  <input
                    type="text"
                    value={formData.coordinates?.lng || ""}
                    onChange={(e) => handleCoordinateChange("lng", e.target.value)}
                    placeholder="e.g., -74.0060"
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200"}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Highlights</label>
                <div className="space-y-2">
                  {(Array.isArray(formData.highlights) ? formData.highlights : [""]).map((value, idx) => {
                    const isLast = idx === (Array.isArray(formData.highlights) ? formData.highlights.length - 1 : 0);
                    const canAppend = String(value || "").trim().length > 0;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleHighlightInputChange(idx, e.target.value)}
                          placeholder="Enter highlight"
                          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200"}`}
                        />
                        {canAppend && isLast && (
                          <button
                            type="button"
                            onClick={handleHighlightAppend}
                            className="p-2 rounded-lg bg-[#a26e35] text-white hover:bg-[#8b5e2d]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Optional Add-ons</label>
                <div className="space-y-2">
                  {(Array.isArray(formData.addOns) ? formData.addOns : [""]).map((value, idx) => {
                    const isLast = idx === (Array.isArray(formData.addOns) ? formData.addOns.length - 1 : 0);
                    const canAppend = String(value || "").trim().length > 0;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleAddOnInputChange(idx, e.target.value)}
                          placeholder="Enter add-on"
                          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200"}`}
                        />
                        {canAppend && isLast && (
                          <button
                            type="button"
                            onClick={handleAddOnAppend}
                            className="p-2 rounded-lg bg-[#a26e35] text-white hover:bg-[#8b5e2d]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Cover Image</label>
                <div className={`rounded-2xl border border-dashed p-4 text-center ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-gray-50 border-gray-300"}`}>
                  {formData.image && (
                    <div className="mb-3 h-40 w-full overflow-hidden rounded-xl">
                      <img src={formData.image} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    id="exp-image"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <label
                    htmlFor="exp-image"
                    className="inline-flex cursor-pointer items-center justify-center rounded-lg border bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {formData.image ? "Change Photo" : "Upload Photo"}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>Description</h2>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the experience..."
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200"}`}
            />
            <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onBack}
                className={`w-full sm:w-auto rounded-full border px-4 py-2 text-xs font-semibold ${darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-700"}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    const payload = {
                      ...formData,
                      title: formData.title || "Untitled",
                      highlights: (Array.isArray(formData.highlights) ? formData.highlights : [])
                        .map((v) => String(v || '').trim())
                        .filter(Boolean),
                      addOns: (Array.isArray(formData.addOns) ? formData.addOns : [])
                        .map((v) => String(v || '').trim())
                        .filter(Boolean),
                      coordinates: {
                        lat: formData.coordinates?.lat ? Number(formData.coordinates.lat) : null,
                        lng: formData.coordinates?.lng ? Number(formData.coordinates.lng) : null,
                      },
                      price: formData.price ? Number(formData.price) : undefined,
                      duration: formData.duration || undefined,
                      status: 'draft',
                    };
                    
                    // Save to localStorage
                    const existingDrafts = JSON.parse(localStorage.getItem('kufi_supplier_drafts') || '[]');
                    const draftId = experience?._id || experience?.id || `draft_${Date.now()}`;
                    const existingIndex = existingDrafts.findIndex(d => d._id === draftId);
                    
                    if (existingIndex >= 0) {
                      existingDrafts[existingIndex] = { ...payload, _id: draftId, updatedAt: new Date().toISOString() };
                    } else {
                      existingDrafts.push({ ...payload, _id: draftId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
                    }
                    
                    localStorage.setItem('kufi_supplier_drafts', JSON.stringify(existingDrafts));
                    alert("Draft saved successfully!");
                    onSuccess?.();
                  } catch (error) {
                    console.error("Error saving draft:", error);
                    alert("Failed to save draft");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-full bg-[#a26e35] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8b5e2d] disabled:opacity-50"
              >
                {isSubmitting ? "Publishing..." : experience ? "Update & Publish" : "Publish Experience"}
              </button>
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className={`rounded-2xl border px-5 py-5 space-y-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}>Live Preview</h2>
            <div className={`aspect-video rounded-xl border border-dashed flex items-center justify-center text-[10px] overflow-hidden ${darkMode ? "bg-slate-800/50 border-slate-700 text-slate-500" : "bg-gray-50 border-gray-300 text-gray-400"}`}>
              {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="" /> : "No image"}
            </div>
            <p className={`text-xs font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{formData.title || "Untitled Experience"}</p>
            <p className="text-[10px] text-[#a26e35] font-semibold">${formData.price || "0"}</p>
          </div>
        </aside>
      </div>
    </form>
  );
};

const SupplierExperience = ({ darkMode, view = 'list', onViewChange, navigateTo }) => {
  const [experiences, setExperiences] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setIsLoading(true);
        // Match backend supplier activities route on Vercel
        const response = await api.get('/supplier/activities');
        setExperiences(response.data || []);
        
        // Load drafts from localStorage
        const savedDrafts = JSON.parse(localStorage.getItem('kufi_supplier_drafts') || '[]');
        setDrafts(savedDrafts);
      } catch (error) {
        console.error("Error fetching supplier experiences:", error);
        // Still load drafts even if API fails
        const savedDrafts = JSON.parse(localStorage.getItem('kufi_supplier_drafts') || '[]');
        setDrafts(savedDrafts);
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

  const handleDeleteExperience = async (id) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) return;
    try {
      await api.delete(`/activities/${id}`);
      alert("Experience deleted successfully!");
      // Refresh list
      const response = await api.get('/supplier/activities');
      setExperiences(response.data || []);
    } catch (error) {
      console.error("Error deleting experience:", error);
      alert("Failed to delete experience");
    }
  };

  if (view === "create" || view === "edit") {
    return (
      <CreateExperienceForm
        darkMode={darkMode}
        experience={view === "edit" ? selectedExperience : null}
        onBack={() => {
          setSelectedExperience(null);
          onViewChange?.("list");
        }}
        onSuccess={() => {
          setSelectedExperience(null);
          onViewChange?.("list");
          // Refresh list - would be better to fetch again
          api.get('/supplier/activities').then(res => setExperiences(res.data || []));
        }}
      />
    );
  }

  return (
    <ExperiencesListing
      darkMode={darkMode}
      experiences={experiences}
      drafts={drafts}
      onAddExperience={() => onViewChange?.("create")}
      onEditExperience={(exp) => {
        setSelectedExperience(exp);
        onViewChange?.("edit");
      }}
      onResumeDraft={(draft) => {
        setSelectedExperience(draft);
        onViewChange?.("edit");
      }}
      onDeleteDraft={(draftId) => {
        if (!window.confirm("Delete this draft?")) return;
        const updatedDrafts = drafts.filter(d => d._id !== draftId);
        localStorage.setItem('kufi_supplier_drafts', JSON.stringify(updatedDrafts));
        setDrafts(updatedDrafts);
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
