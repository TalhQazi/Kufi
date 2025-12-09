import React, { useRef, useState } from "react";
import { Check } from "lucide-react";

const SupplierProfile = () => {
  const [form, setForm] = useState({
    businessName: "Adventure Tours Co.",
    contactEmail: "contact@adventuretours.com",
    phoneNumber: "+1 (555) 123-4567",
    businessAddress: "Lorem ipsum dolor sit amet consectetur.",
    aboutBusiness:
      "Lorem ipsum dolor sit amet consectetur. Varius gravida purus nibh elit viverra vel sit ultrices praesent.",
  });

  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Business_License.pdf",
      status: "Verified",
      meta: "Verified • Uploaded 2 months ago",
    },
    {
      id: 2,
      name: "Insurance_Certificate.pdf",
      status: "Verified",
      meta: "Verified • Uploaded 2 months ago",
    },
  ]);

  const fileInputRef = useRef(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

  return (
    <div className="space-y-6">
      {/* Top bar: title + button */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Profile & Verification</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your supplier profile and documents
          </p>
        </div>

        <button className="self-start rounded-full bg-[#a26e35] px-5 py-2 text-xs font-semibold text-white shadow-sm">
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)]">
        {/* Left: business information & documents */}
        <div className="space-y-5">
          {/* Business information card */}
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Business Information</h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <p className="font-medium text-gray-700">Business Name</p>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={handleChange("businessName")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>

              <div className="space-y-1">
                <p className="font-medium text-gray-700">Contact Email</p>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange("contactEmail")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>

              <div className="space-y-1">
                <p className="font-medium text-gray-700">Phone Number</p>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>

              <div className="space-y-1">
                <p className="font-medium text-gray-700">Business Address</p>
                <textarea
                  rows={2}
                  value={form.businessAddress}
                  onChange={handleChange("businessAddress")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>

              <div className="space-y-1">
                <p className="font-medium text-gray-700">About Your Business</p>
                <textarea
                  rows={3}
                  value={form.aboutBusiness}
                  onChange={handleChange("aboutBusiness")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 leading-snug focus:outline-none focus:ring-1 focus:ring-[#a26e35]"
                />
              </div>
            </div>
          </div>

          {/* Verification documents card */}
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Verification Documents</h2>

            {/* Upload area */}
            <button
              type="button"
              onClick={handleUploadClick}
              className="w-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-xs text-gray-500 hover:border-[#a26e35]/60 hover:bg-gray-100 transition"
            >
              <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-400 border border-gray-200">
                <span className="text-lg">↑</span>
              </div>
              <p className="mb-1 text-sm font-medium text-slate-900">Click to upload</p>
              <p className="mb-2 text-[11px] text-gray-400">or drag and drop</p>
              <p className="text-[11px] text-gray-400">
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
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                    doc.status === "Verified"
                      ? "bg-emerald-50"
                      : "bg-amber-50"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        doc.status === "Verified"
                          ? "text-emerald-800"
                          : "text-amber-800"
                      }`}
                    >
                      {doc.name}
                    </p>
                    <p
                      className={`mt-0.5 text-[11px] ${
                        doc.status === "Verified"
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {doc.meta}
                    </p>
                  </div>
                  <button className="text-xs font-semibold text-[#a26e35] underline">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: verification status + account status */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Verification Status</h2>

            <div className="space-y-2 text-xs">
              {["Email", "Phone", "Business License", "Insurance"].map((item, idx) => (
                <div
                  key={item}
                  className={`flex items-center justify-between py-1.5 ${
                    idx !== 3 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <span className="text-gray-700">{item}</span>
                  <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-medium">
                    <Check className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-[#eef4ff] px-5 py-5 text-xs">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Account Status</h2>
            <p className="text-[11px] text-blue-900 leading-relaxed">
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
