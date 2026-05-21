import { useEffect, useState } from "react";
import api from "../../api";

const EMPTY = {
  name: "", country: "", city: "", pricePerNight: "", rooms: 1,
  rating: 4.0, description: "", amenities: "", status: "active", images: "",
};

export default function HotelManagement({ darkMode }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/hotels/all");
      setHotels(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(hotel) {
    setEditing(hotel._id);
    setForm({
      ...hotel,
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : hotel.amenities || "",
      images: Array.isArray(hotel.images) ? hotel.images.join(", ") : hotel.images || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerNight: Number(form.pricePerNight),
        rooms: Number(form.rooms),
        rating: Number(form.rating),
        amenities: form.amenities ? form.amenities.split(",").map(s => s.trim()).filter(Boolean) : [],
        images: form.images ? form.images.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      if (editing) {
        await api.put(`/hotels/${editing}`, payload);
      } else {
        await api.post("/hotels", payload);
      }
      await load();
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this hotel?")) return;
    try {
      await api.delete(`/hotels/${id}`);
      setHotels(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = hotels.filter(h => {
    const matchSearch = !search ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()) ||
      h.country.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || h.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const base = darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900";
  const cardCls = `rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`;
  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-gray-50 border-gray-200 text-gray-800"}`;
  const labelCls = `text-xs font-medium mb-1 block ${darkMode ? "text-slate-400" : "text-gray-600"}`;

  return (
    <div className={`min-h-screen px-4 py-6 space-y-5 ${base}`}>
      <div className="flex items-center justify-between">
        <h1 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Hotel Management</h1>
        <button onClick={openAdd} className="px-4 py-2 rounded-full bg-[#a26e35] text-white text-xs font-semibold hover:bg-[#8b5e2d] transition-colors">
          + Add Hotel
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search name, city, country…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`${inputCls} max-w-xs`}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`${inputCls} w-36`}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className={cardCls}>
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No hotels found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b text-left ${darkMode ? "border-slate-800 text-slate-500" : "border-gray-100 text-gray-500"}`}>
                  {["Name", "Country", "City", "Price/Night", "Rooms", "Rating", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(hotel => (
                  <tr key={hotel._id} className={`border-b last:border-0 ${darkMode ? "border-slate-800 hover:bg-slate-800/50" : "border-gray-50 hover:bg-gray-50"}`}>
                    <td className={`px-4 py-3 font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>{hotel.name}</td>
                    <td className="px-4 py-3 text-gray-500">{hotel.country}</td>
                    <td className="px-4 py-3 text-gray-500">{hotel.city}</td>
                    <td className="px-4 py-3 font-medium text-amber-600">${hotel.pricePerNight?.toLocaleString()}</td>
                    <td className="px-4 py-3">{hotel.rooms}</td>
                    <td className="px-4 py-3">⭐ {hotel.rating}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${hotel.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {hotel.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(hotel)} className="text-blue-500 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(hotel._id)} className="text-red-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto ${darkMode ? "bg-slate-900 border border-slate-700" : "bg-white"}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                {editing ? "Edit Hotel" : "Add Hotel"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Hotel Name *</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="e.g. Riad Atlas" />
                </div>
                <div>
                  <label className={labelCls}>Country *</label>
                  <input required value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className={inputCls} placeholder="Morocco" />
                </div>
                <div>
                  <label className={labelCls}>City *</label>
                  <input required value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={inputCls} placeholder="Marrakech" />
                </div>
                <div>
                  <label className={labelCls}>Price Per Night ($) *</label>
                  <input required type="number" min={0} value={form.pricePerNight} onChange={e => setForm(p => ({ ...p, pricePerNight: e.target.value }))} className={inputCls} placeholder="120" />
                </div>
                <div>
                  <label className={labelCls}>Rooms Available</label>
                  <input type="number" min={1} value={form.rooms} onChange={e => setForm(p => ({ ...p, rooms: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Rating (0-5)</label>
                  <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputCls} placeholder="Brief description…" />
              </div>
              <div>
                <label className={labelCls}>Amenities (comma-separated)</label>
                <input value={form.amenities} onChange={e => setForm(p => ({ ...p, amenities: e.target.value }))} className={inputCls} placeholder="WiFi, Pool, Breakfast" />
              </div>
              <div>
                <label className={labelCls}>Image URLs (comma-separated)</label>
                <input value={form.images} onChange={e => setForm(p => ({ ...p, images: e.target.value }))} className={inputCls} placeholder="https://…" />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className={`flex-1 rounded-full py-2 text-xs font-medium border ${darkMode ? "border-slate-700 text-slate-400" : "border-gray-200 text-gray-600"}`}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={`flex-1 rounded-full py-2 text-xs font-semibold text-white bg-[#a26e35] hover:bg-[#8b5e2d] transition-colors ${saving ? "opacity-60" : ""}`}>
                  {saving ? "Saving…" : editing ? "Update" : "Add Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
