import React, { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import api from "../../api";

const AddActivity = ({ onBack }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "Easy",
    location: "",
    season: "Summer",
    duration: "",
    status: "active",
    price: "",
    thumbnail: "",
    addOns: {
      quadBiking: false,
      campingGear: false,
      photographyPackage: false,
    },
  });

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await api.get('/countries');
        const countriesData = Array.isArray(response.data) ? response.data : (response.data.countries || []);
        setCountries(countriesData);
        console.log("✅ Countries loaded:", countriesData);
      } catch (error) {
        console.error("❌ Error fetching countries:", error);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "active" : "inactive") : value,
    }));
  };

  const handleAddOnChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      addOns: {
        ...(prev.addOns || {}),
        [key]: !(prev.addOns && prev.addOns[key]),
      },
    }));
  };

  const handleThumbnailChange = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category || !formData.location) {
      alert("Please fill in the required fields (Name, Category, Location)");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        country: formData.location,
        location: formData.location,
        duration: formData.duration,
        // Convert price to number if possible
        price: formData.price ? Number(formData.price) : undefined,
        // Backend expects `image` field, use thumbnail data if provided
        image: formData.thumbnail || undefined,
        // Map UI status (active/inactive) to valid enum values
        status: formData.status === "active" ? "approved" : "pending",
        addOns: {
          quadBiking: !!formData?.addOns?.quadBiking,
          campingGear: !!formData?.addOns?.campingGear,
          photographyPackage: !!formData?.addOns?.photographyPackage,
        },
      };

      await api.post("/activities", payload);
      alert("Activity saved successfully!");
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error("Error saving activity:", error);
      alert("Failed to save activity. Please try again.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
      <div className="bg-white rounded-3xl border border-gray-100 card-shadow p-6 space-y-6">
        <div className="pb-4 border-b border-gray-100 space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Activity Details</h2>
          <p className="text-sm text-gray-500">
            Fill in the information below to create a new activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <LabeledInput
            label="Activity Name"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Mountain Hiking"
          />
          <ThumbnailDrop
            thumbnail={formData.thumbnail}
            onThumbnailChange={handleThumbnailChange}
          />
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 block">
              Short Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Brief description of the activity"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a26e35]/30 resize-none"
            />
          </div>
          <SelectField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[
              { label: "Select a category", value: "" },
              { label: "FoodTour", value: "FoodTour" },
              { label: "whenVisting", value: "whenVisting" },
              { label: "ShipCrusie", value: "ShipCrusie" },
              { label: "MemorableTour", value: "MemorableTour" },
              { label: "SummerVisit", value: "SummerVisit" },
              { label: "DayTour", value: "DayTour" },
            ]}
          />
          <SelectField
            label="Difficulty Level"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            options={[
              { label: "Easy", value: "Easy" },
              { label: "Moderate", value: "Moderate" },
              { label: "Challenging", value: "Challenging" },
            ]}
          />
          <SelectField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            disabled={loading}
            options={[
              { label: loading ? "Loading countries..." : "Select a country", value: "" },
              ...countries.map((country) => {
                const label = country.name || country.countryName || country.title
                return {
                  label,
                  value: label
                }
              })
            ]}
          />
          <SelectField
            label="Recommended Season"
            name="season"
            value={formData.season}
            onChange={handleChange}
            options={[
              { label: "Summer", value: "Summer" },
              { label: "Winter", value: "Winter" },
              { label: "Autumn", value: "Autumn" },
              { label: "Spring", value: "Spring" },
              { label: "Year Round", value: "Year Round" },
            ]}
          />
          <LabeledInput
            label="Duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 3 Days"
          />
          <LabeledInput
            label="Price ($)"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 150"
          />
          <StatusToggle status={formData.status} onChange={handleChange} />
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Optional Add-ons</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!formData?.addOns?.quadBiking}
                onChange={() => handleAddOnChange('quadBiking')}
                className="w-4 h-4"
              />
              Quad Biking
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!formData?.addOns?.campingGear}
                onChange={() => handleAddOnChange('campingGear')}
                className="w-4 h-4"
              />
              Camping Gear
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!formData?.addOns?.photographyPackage}
                onChange={() => handleAddOnChange('photographyPackage')}
                className="w-4 h-4"
              />
              Photography Package
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100"
            onClick={onBack}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#a26e35] text-white hover:bg-[#8c5c2c]"
          >
            Save Activity
          </button>
        </div>
      </div>

      <PreviewCard formData={formData} />
    </div>
  );
};

const LabeledInput = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="text-sm font-semibold text-gray-600 mb-2 block">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a26e35]/30"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, disabled }) => (
  <div>
    <label className="text-sm font-semibold text-gray-600 mb-2 block">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#a26e35]/30 disabled:bg-gray-100 disabled:cursor-not-allowed"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const ThumbnailDrop = ({ thumbnail, onThumbnailChange }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      onThumbnailChange(file);
    }
  };

  return (
    <div>
      <label className="text-sm font-semibold text-gray-600 mb-2 block">
        Thumbnail Image
      </label>
      <div
        className="w-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center text-sm text-gray-500 p-6 min-h-[180px] cursor-pointer hover:border-[#a26e35]/60 transition-colors"
        onClick={handleClick}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt="Activity thumbnail"
            className="w-full h-40 object-cover rounded-xl mb-3"
          />
        ) : (
          <>
            <Upload className="w-7 h-7 text-gray-400 mb-3" />
            <p className="font-semibold text-gray-600">Drag and drop or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
          </>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};

const StatusToggle = ({ status, onChange }) => (
  <div>
    <label className="text-sm font-semibold text-gray-600 mb-2 block">Status</label>
    <div className="flex items-center gap-3">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          name="status"
          type="checkbox"
          checked={status === "active"}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-12 h-6 bg-gray-200 rounded-full peer-checked:bg-[#a26e35]/60 transition" />
        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-6 peer-checked:bg-[#a26e35] transition" />
      </label>
      <span className="text-sm text-gray-600">
        {status === "active" ? "Active" : "Inactive"}
      </span>
    </div>
  </div>
);

const PreviewCard = ({ formData }) => (
  <div className="bg-white rounded-3xl border border-gray-100 card-shadow p-6 space-y-4 h-fit self-start">
    <div>
      <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
      <p className="text-xs text-gray-400">How your activity will appear</p>
    </div>
    <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
      <div className="h-36 bg-gray-200 flex flex-col items-center justify-center text-gray-500 text-sm">
        {formData.thumbnail ? (
          <img
            src={formData.thumbnail}
            alt="Activity thumbnail preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <Upload className="w-5 h-5 mb-2" />
            Thumbnail preview
          </>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h4 className="font-semibold text-slate-900">
          {formData.title || "Activity Name"}
        </h4>
        <div className="text-sm text-gray-500 space-y-1">
          <p>{formData.location || "Location"}</p>
          <p>{formData.duration || "Duration"}</p>
          <p className="font-bold text-[#a26e35]">
            {formData.price ? `$${formData.price}` : "Price"}
          </p>
        </div>
        <p className="text-xs text-gray-400 line-clamp-2">
          {formData.description || "Short description will appear here..."}
        </p>
        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold">
          {formData.difficulty}
        </span>
      </div>
    </div>
  </div>
);

export default AddActivity;

