import React, { useState, useEffect } from "react";
import { Mail, Save, Settings, CheckCircle, XCircle, AlertCircle, RefreshCw, Server, Shield } from "lucide-react";
import api from "../../api";

const EmailSettings = () => {
  const [settings, setSettings] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    fromEmail: "",
    fromName: "Kufi",
    encryption: "tls",
    templates: {
      userRegistration: true,
      supplierRegistration: true,
      supplierApproval: true,
      offerAccepted: true,
      offerRejected: true,
      itineraryReply: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/admin/email-settings");
        if (res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Error fetching email settings:", err);
        setMessage({ type: "error", text: "Failed to load email settings." });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      templates: {
        ...prev.templates,
        [key]: !prev.templates[key]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put("/admin/email-settings", settings);
      setMessage({ type: "success", text: "Email settings updated successfully!" });
    } catch (err) {
      console.error("Error updating email settings:", err);
      setMessage({ type: "error", text: "Failed to update email settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  const templateLabels = {
    userRegistration: "User Registration Welcome",
    supplierRegistration: "Supplier Registration Confirmation",
    supplierApproval: "Supplier Account Approved",
    offerAccepted: "Booking Offer Accepted",
    offerRejected: "Booking Offer Rejected",
    itineraryReply: "Itinerary Update/Reply"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-amber-600" />
            Email Configuration
          </h1>
          <p className="text-slate-500 mt-1">Configure SMTP settings and manage automated email notifications.</p>
        </div>
        
        {message.text && (
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SMTP Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-slate-800">SMTP Server Settings</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SMTP Host</label>
              <input
                type="text"
                name="smtpHost"
                value={settings.smtpHost}
                onChange={handleChange}
                placeholder="smtp.example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SMTP Port</label>
              <input
                type="number"
                name="smtpPort"
                value={settings.smtpPort}
                onChange={handleChange}
                placeholder="587"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SMTP Username</label>
              <input
                type="text"
                name="smtpUser"
                value={settings.smtpUser}
                onChange={handleChange}
                placeholder="user@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SMTP Password</label>
              <input
                type="password"
                name="smtpPass"
                value={settings.smtpPass}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Encryption</label>
              <select
                name="encryption"
                value={settings.encryption}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
              >
                <option value="tls">STARTTLS (TLS)</option>
                <option value="ssl">SSL/TLS</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sender Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-slate-800">Sender Information</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">From Name</label>
              <input
                type="text"
                name="fromName"
                value={settings.fromName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">From Email</label>
              <input
                type="email"
                name="fromEmail"
                value={settings.fromEmail}
                onChange={handleChange}
                placeholder="noreply@kufi.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Templates Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-slate-800">Email Templates (Enable/Disable)</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(templateLabels).map((key) => (
              <div 
                key={key}
                onClick={() => handleTemplateToggle(key)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  settings.templates[key] 
                    ? "border-amber-200 bg-amber-50/30" 
                    : "border-slate-100 bg-slate-50 opacity-60"
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${settings.templates[key] ? "text-amber-900" : "text-slate-500"}`}>
                    {templateLabels[key]}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">
                    {settings.templates[key] ? "System will send this email" : "Email disabled"}
                  </span>
                </div>
                
                <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
                  settings.templates[key] ? "bg-amber-600" : "bg-slate-300"
                }`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                    settings.templates[key] ? "left-6" : "left-1"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {saving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailSettings;
