import React, { useRef, useState, useEffect } from "react";
import { Check, Upload, Mail, Phone, MapPin, Info, Building } from "lucide-react";

const SupplierProfile = ({ darkMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    contactEmail: "",
    phoneNumber: "",
    businessAddress: "",
    aboutBusiness: "",
    image: ""
  });

  const [documents, setDocuments] = useState([]);

  // Normalize profile object (from DB via login user), support camelCase or snake_case
  const normalizeProfile = (data) => {
    if (!data || typeof data !== "object") return {};
    return {
      businessName: data.businessName ?? data.business_name ?? data.name ?? "",
      contactEmail: data.contactEmail ?? data.contact_email ?? data.email ?? "",
      phoneNumber: data.phoneNumber ?? data.phone_number ?? data.phone ?? "",
      businessAddress: data.businessAddress ?? data.business_address ?? data.address ?? "",
      aboutBusiness: data.aboutBusiness ?? data.about_business ?? data.about ?? "",
      image: data.image ?? data.avatar ?? data.profileImage ?? "",
    };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Load supplier profile details from login user stored in localStorage (fetched from DB at login)
        const stored = localStorage.getItem("currentUser");
        const rawUser = stored ? JSON.parse(stored) : null;
        const userFields = normalizeProfile(rawUser);

        setForm((prev) => ({
          ...prev,
          ...userFields,
        }));
      } catch (error) {
        console.error("Error loading supplier profile from stored user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fileInputRef = useRef(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      try {
        setIsSaving(true);
        // Save to database – name, contact email, phone, address, about, image
        const payload = {
          businessName: form.businessName,
          contactEmail: form.contactEmail,
          phoneNumber: form.phoneNumber,
          businessAddress: form.businessAddress,
          aboutBusiness: form.aboutBusiness,
          image: form.image,
        };
        await api.put("/supplier/profile", payload);
        alert("Profile updated successfully!");
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating supplier profile:", error);
        alert("Failed to update profile");
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);

    const now = new Date();
    const meta = `Pending review • Uploaded ${now.toLocaleDateString()}`;

    setDocuments((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: file.name,
        status: "Pending",
        meta,
      },
    ]);

    event.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a26e35]"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      {/* Top bar: title + button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-xl sm:text-2xl font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>Profile & Verification</h1>
          <p className={`mt-1 text-xs sm:text-sm transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            Manage your supplier profile and documents
          </p>
        </div>

        <button
          onClick={handleToggleEdit}
          disabled={isSaving}
          className={`w-full sm:w-auto rounded-full px-6 py-2.5 text-xs font-semibold shadow-sm transition-all ${isEditing
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-[#a26e35] text-white hover:bg-[#8b5e2d]"
            } ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)]">
        {/* Left: business information & documents */}
        <div className="space-y-5">
          {/* Business information card */}
          <div className={`rounded-2xl border transition-colors duration-300 px-5 py-5 space-y-4 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>Business Information</h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <p className={`font-medium transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Business Name</p>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.businessName}
                  onChange={handleChange("businessName")}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode
                    ? "bg-slate-800 border-slate-700 text-white disabled:bg-slate-900/50"
                    : "bg-gray-50 border-gray-200 text-gray-700 disabled:bg-gray-100"
                    }`}
                />
              </div>

              <div className="space-y-1">
                <p className={`font-medium transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Contact Email</p>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={form.contactEmail}
                  onChange={handleChange("contactEmail")}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode
                    ? "bg-slate-800 border-slate-700 text-white disabled:bg-slate-900/50"
                    : "bg-gray-50 border-gray-200 text-gray-700 disabled:bg-gray-100"
                    }`}
                />
              </div>

              <div className="space-y-1">
                <p className={`font-medium transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Phone Number</p>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode
                    ? "bg-slate-800 border-slate-700 text-white disabled:bg-slate-900/50"
                    : "bg-gray-50 border-gray-200 text-gray-700 disabled:bg-gray-100"
                    }`}
                />
              </div>

              <div className="space-y-1">
                <p className={`font-medium transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Business Address</p>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={form.businessAddress}
                  onChange={handleChange("businessAddress")}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode
                    ? "bg-slate-800 border-slate-700 text-white disabled:bg-slate-900/50"
                    : "bg-gray-50 border-gray-200 text-gray-700 disabled:bg-gray-100"
                    }`}
                />
              </div>

              <div className="space-y-1">
                <p className={`font-medium transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-700"}`}>About Your Business</p>
                <textarea
                  rows={3}
                  disabled={!isEditing}
                  value={form.aboutBusiness}
                  onChange={handleChange("aboutBusiness")}
                  className={`w-full rounded-lg border px-3 py-2 text-sm leading-snug transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode
                    ? "bg-slate-800 border-slate-700 text-white disabled:bg-slate-900/50"
                    : "bg-gray-50 border-gray-200 text-gray-700 disabled:bg-gray-100"
                    }`}
                />
              </div>
            </div>
          </div>

          {/* Verification documents card */}
          <div className={`rounded-2xl border transition-colors duration-300 px-4 sm:px-5 py-5 space-y-4 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>Verification Documents</h2>

            {/* Upload area */}
            <button
              type="button"
              onClick={handleUploadClick}
              className={`w-full rounded-2xl border border-dashed px-4 sm:px-6 py-6 sm:py-8 text-center text-xs transition-all ${darkMode
                ? "bg-slate-800 border-slate-700 text-slate-400 hover:border-amber-500/60 hover:bg-slate-700"
                : "bg-gray-50 border-gray-300 text-gray-500 hover:border-[#a26e35]/60 hover:bg-gray-100"
                }`}
            >
              <div className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${darkMode ? "bg-slate-700 text-slate-400 border-slate-600" : "bg-white text-gray-400 border-gray-200"}`}>
                <span className="text-lg">↑</span>
              </div>
              <p className={`mb-1 text-xs sm:text-sm font-medium transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Click to upload</p>
              <p className={`mb-2 text-[10px] sm:text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>or drag and drop</p>
              <p className={`text-[10px] sm:text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                Business License (PDF, PNG, JPG up to 10MB)
              </p>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Document list */}
            <div className="space-y-3 text-xs">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-colors ${doc.status === "Verified"
                    ? (darkMode ? "bg-emerald-900/20" : "bg-emerald-50")
                    : (darkMode ? "bg-amber-900/20" : "bg-amber-50")
                    }`}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold transition-colors truncate ${doc.status === "Verified"
                        ? (darkMode ? "text-emerald-400" : "text-emerald-800")
                        : (darkMode ? "text-amber-400" : "text-amber-800")
                        }`}
                    >
                      {doc.name}
                    </p>
                    <p
                      className={`mt-0.5 text-[10px] sm:text-[11px] transition-colors ${doc.status === "Verified"
                        ? (darkMode ? "text-emerald-500/80" : "text-emerald-700")
                        : (darkMode ? "text-amber-500/80" : "text-amber-700")
                        }`}
                    >
                      {doc.meta}
                    </p>
                  </div>
                  <button className="ml-4 text-xs font-semibold text-[#a26e35] underline shrink-0">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: verification status + account status */}
        <aside className="space-y-4">
          <div className={`rounded-2xl border transition-colors duration-300 px-5 py-5 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold mb-3 transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Verification Status</h2>

            <div className="space-y-2 text-xs">
              {["Email", "Phone", "Business License", "Insurance"].map((item, idx) => (
                <div
                  key={item}
                  className={`flex items-center justify-between py-1.5 transition-colors ${darkMode ? "border-slate-800" : "border-gray-100"
                    } ${idx !== 3 ? "border-b" : ""}`}
                >
                  <span className={`transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>{item}</span>
                  <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-medium">
                    <Check className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border transition-colors duration-300 px-5 py-5 text-xs ${darkMode ? "bg-blue-900/20 border-blue-900/30 text-blue-300" : "bg-[#eef4ff] border-blue-100 text-blue-900"}`}>
            <h2 className={`text-sm font-semibold mb-2 transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Account Status</h2>
            <p className="text-[11px] leading-relaxed opacity-90">
              Your account is fully verified and active. You can now receive
              bookings and manage your experiences.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SupplierProfile;
