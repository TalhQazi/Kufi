import React, { useRef, useState, useEffect } from "react";
import { Check, Upload, Mail, Phone, MapPin, Info, Building } from "lucide-react";
import api from "../../api";

const SupplierProfile = ({ darkMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    contactEmail: "",
    phoneNumber: "",
    businessAddress: "",
    country: "",
    city: "",
    aboutBusiness: "",
    image: ""
  });

  const [countries, setCountries] = useState([]);

  const [documents, setDocuments] = useState([]);
  
  const [verificationStatus, setVerificationStatus] = useState({
    businessLicenseStatus: 'pending',
    businessProfileStatus: 'pending',
    isVerified: false
  });

  // Normalize profile object (from DB via login user), support camelCase or snake_case
  const normalizeProfile = (data) => {
    if (!data || typeof data !== "object") return {};
    return {
      businessName: data.businessName ?? data.business_name ?? data.name ?? "",
      contactEmail: data.contactEmail ?? data.contact_email ?? data.email ?? "",
      phoneNumber: data.phoneNumber ?? data.phone_number ?? data.phone ?? "",
      businessAddress: data.businessAddress ?? data.business_address ?? data.address ?? "",
      country: data.country ?? "",
      city: data.city ?? "",
      aboutBusiness: data.aboutBusiness ?? data.about_business ?? data.about ?? "",
      image: data.image ?? data.avatar ?? data.profileImage ?? "",
    };
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get('/countries')
        setCountries(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Error fetching countries:', error)
        setCountries([])
      }
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        let profileFromApi = null;
        try {
          const res = await api.get("/auth/profile");
          profileFromApi = res?.data || null;
        } catch (e) {
          profileFromApi = null;
        }

        const stored = localStorage.getItem("currentUser");
        const rawUser = stored ? JSON.parse(stored) : null;
        const userFields = normalizeProfile(profileFromApi || rawUser);

        setForm((prev => ({ ...prev, ...userFields })));
        
        // Set verification status from API
        if (profileFromApi) {
          setVerificationStatus({
            businessLicenseStatus: profileFromApi.businessLicenseStatus || 'pending',
            businessProfileStatus: profileFromApi.businessProfileStatus || 'pending',
            isVerified: profileFromApi.isVerified || false
          });
        }
      } catch (error) {
        console.error("Error loading supplier profile from stored user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
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
          country: form.country,
          city: form.city,
          aboutBusiness: form.aboutBusiness,
          image: form.image,
        };
        const authPayload = {
          businessName: form.businessName,
          business_name: form.businessName,
          name: form.businessName,
          contactEmail: form.contactEmail,
          contact_email: form.contactEmail,
          email: form.contactEmail,
          phoneNumber: form.phoneNumber,
          phone_number: form.phoneNumber,
          phone: form.phoneNumber,
          businessAddress: form.businessAddress,
          business_address: form.businessAddress,
          address: form.businessAddress,
          country: form.country,
          city: form.city,
          aboutBusiness: form.aboutBusiness,
          about_business: form.aboutBusiness,
          about: form.aboutBusiness,
          image: form.image,
        };

        const res = await api.patch("/auth/profile", authPayload);

        try {
          const stored = localStorage.getItem("currentUser");
          const rawUser = stored ? JSON.parse(stored) : null;
          const serverData = res?.data?.user ?? res?.data ?? null;
          const nextUser = {
            ...(rawUser && typeof rawUser === "object" ? rawUser : {}),
            ...(serverData && typeof serverData === "object" ? serverData : {}),
            ...payload,
          };
          localStorage.setItem("currentUser", JSON.stringify(nextUser));
        } catch (e) {
          console.error("Error updating stored currentUser after profile save:", e);
        }
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      const msg = error.response?.data?.msg || error.response?.data?.message || 'Failed to change password';
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload/business-license', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = response.data?.url || response.data?.fileUrl;
      
      // Save to user profile in backend
      await api.patch('/auth/profile', { businessLicense: fileUrl });
      
      // Update local state
      const now = new Date();
      const meta = `Pending review • Uploaded ${now.toLocaleDateString()}`;
      
      setDocuments((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: file.name,
          status: "Pending",
          meta,
          url: fileUrl,
        },
      ]);
      
      alert("Business license uploaded! Pending verification.");
    } catch (error) {
      console.error("Error uploading business license:", error);
      alert("Failed to upload business license");
    }

    event.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a26e35]"></div>
      </div>
    );
  }

  const tabs = ['Profile', 'Settings'];

  return (
    <div className={`space-y-6 transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      {/* Top bar: title + tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>
              {activeTab === 'Profile' ? 'Profile & Verification' : 'Settings'}
            </h1>
            <p className={`mt-1 text-xs sm:text-sm transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              {activeTab === 'Profile' ? 'Manage your supplier profile and documents' : 'Manage your account settings'}
            </p>
          </div>

          {activeTab === 'Profile' && (
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
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-[#a26e35] text-[#a26e35]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Profile' && (
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
                <p className={`font-medium transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-700"}`}>Country</p>
                <select
                  disabled={!isEditing}
                  value={form.country}
                  onChange={handleChange("country")}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode
                    ? "bg-slate-800 border-slate-700 text-white disabled:bg-slate-900/50"
                    : "bg-gray-50 border-gray-200 text-gray-700 disabled:bg-gray-100"
                    }`}
                >
                  <option value="">Select your country</option>
                  {countries.map((c) => (
                    <option key={c?._id || c?.name} value={c?.name || ''}>
                      {c?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <p className={`font-medium transition-colors duration-300 ${darkMode ? "text-slate-400" : "text-gray-700"}`}>City</p>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.city}
                  onChange={handleChange("city")}
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
              {[
                { label: "Email", verified: !!(form.contactEmail && form.contactEmail.includes('@')) },
                { label: "Phone", verified: !!(form.phoneNumber && form.phoneNumber.length >= 7) },
                { label: "Business License", verified: verificationStatus.businessLicenseStatus === 'verified' },
                { label: "Business Profile", verified: verificationStatus.businessProfileStatus === 'verified' },
              ].map((item, idx) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between py-1.5 transition-colors ${darkMode ? "border-slate-800" : "border-gray-100"
                    } ${idx !== 3 ? "border-b" : ""}`}
                >
                  <span className={`transition-colors ${darkMode ? "text-slate-400" : "text-gray-700"}`}>{item.label}</span>
                  <span className={`flex items-center gap-1 text-[11px] font-medium ${item.verified ? 'text-emerald-600' : (darkMode ? 'text-slate-500' : 'text-gray-400')}`}>
                    <Check className={`h-3.5 w-3.5 ${item.verified ? '' : 'opacity-30'}`} />
                    {item.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border transition-colors duration-300 px-5 py-5 text-xs ${verificationStatus.isVerified ? (darkMode ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-300" : "bg-emerald-50 border-emerald-100 text-emerald-900") : (darkMode ? "bg-amber-900/20 border-amber-900/30 text-amber-300" : "bg-amber-50 border-amber-100 text-amber-900")}`}>
            <h2 className={`text-sm font-semibold mb-2 transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Account Status</h2>
            <p className="text-[11px] leading-relaxed opacity-90">
              {verificationStatus.isVerified 
                ? "Your account is fully verified and active. You can now receive bookings and manage your experiences."
                : "Your account is pending verification. Please complete your business profile and upload business license."}
            </p>
          </div>
        </aside>
      </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'Settings' && (
        <div className="space-y-5">
          <div className={`rounded-2xl border transition-colors duration-300 px-5 py-5 space-y-4 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h2 className={`text-sm font-semibold transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>Security</h2>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Password</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Last changed 3 months ago</p>
                </div>
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#a26e35] hover:bg-slate-50 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
              <button 
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  setPasswordError('')
                  setPasswordSuccess('')
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#a26e35] bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#a26e35] bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#a26e35] bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-green-500 text-sm">{passwordSuccess}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    setPasswordError('')
                    setPasswordSuccess('')
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 bg-[#a26e35] text-white rounded-lg text-sm font-medium hover:bg-[#8b5e2d] disabled:opacity-50"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProfile;
