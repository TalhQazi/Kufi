import { useEffect, useMemo, useState } from "react";
import api from "../../api";

const EMPTY = {
  name: "",
  country: "",
  city: "",
  pricePerNight: "",
  rooms: 1,
  rating: 4.0,
  description: "",
  amenities: "",
  status: "active",
  images: [],
  sortOrder: 0,
};

export default function HotelManagement({ darkMode }) {
  const [hotels, setHotels] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/hotels/all");
      const list = Array.isArray(res.data) ? res.data : [];
      list.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || String(a.name || "").localeCompare(String(b.name || "")));
      setHotels(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    api.get("/countries")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.countries || []);
        setCountries(list);
      })
      .catch((err) => {
        console.error("Error fetching countries:", err);
        setCountries([]);
      });
  }, []);

  useEffect(() => {
    if (!selectedCountryId) {
      setCities([]);
      return;
    }
    api.get(`/cities?country=${encodeURIComponent(selectedCountryId)}`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setCities(list);
      })
      .catch((err) => {
        console.error("Error fetching cities:", err);
        setCities([]);
      });
  }, [selectedCountryId]);

  // Resolve country id once countries finish loading (e.g. opening edit early)
  useEffect(() => {
    if (!showForm || !form.country || selectedCountryId || countries.length === 0) return;
    const id = resolveCountryId(form.country);
    if (id) setSelectedCountryId(id);
  }, [showForm, form.country, selectedCountryId, countries]);

  function resolveCountryId(countryName) {
    if (!countryName) return "";
    const match = countries.find(
      (c) => String(c.name || "").toLowerCase() === String(countryName).toLowerCase()
    );
    return match?._id || match?.id || "";
  }

  function openAdd() {
    setEditing(null);
    const nextOrder = hotels.reduce((max, h) => Math.max(max, Number(h.sortOrder) || 0), -1) + 1;
    setForm({ ...EMPTY, sortOrder: nextOrder, images: [] });
    setSelectedCountryId("");
    setCities([]);
    setShowForm(true);
  }

  function openEdit(hotel) {
    setEditing(hotel._id);
    const imageList = Array.isArray(hotel.images) ? hotel.images : (hotel.images ? [hotel.images] : []);
    setForm({
      name: hotel.name || "",
      country: hotel.country || "",
      city: hotel.city || "",
      pricePerNight: hotel.pricePerNight ?? "",
      rooms: hotel.rooms ?? 1,
      rating: hotel.rating ?? 4.0,
      description: hotel.description || "",
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : hotel.amenities || "",
      status: hotel.status || "active",
      images: imageList,
      sortOrder: Number(hotel.sortOrder) || 0,
    });
    setSelectedCountryId(resolveCountryId(hotel.country));
    setShowForm(true);
  }

  function handleCountryChange(countryId) {
    setSelectedCountryId(countryId);
    const country = countries.find((c) => String(c._id || c.id) === String(countryId));
    setForm((p) => ({
      ...p,
      country: country?.name || "",
      city: "",
    }));
  }

  function handleCityChange(cityName) {
    setForm((p) => ({ ...p, city: cityName }));
  }

  function handleImageUpload(files) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be 5MB or less");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index) {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        country: form.country,
        city: form.city,
        pricePerNight: Number(form.pricePerNight),
        rooms: Number(form.rooms),
        rating: Number(form.rating),
        description: form.description || "",
        amenities: form.amenities ? form.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
        images: Array.isArray(form.images) ? form.images.filter(Boolean) : [],
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
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
      alert("Failed to save hotel");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this hotel?")) return;
    try {
      await api.delete(`/hotels/${id}`);
      setHotels((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  async function moveHotel(index, direction) {
    const sorted = [...hotels].sort(
      (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || String(a.name || "").localeCompare(String(b.name || ""))
    );
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const current = sorted[index];
    const neighbor = sorted[swapIndex];
    const currentOrder = Number(current.sortOrder) || 0;
    const neighborOrder = Number(neighbor.sortOrder) || 0;

    // If equal orders, assign sequential then swap
    let nextCurrentOrder = neighborOrder;
    let nextNeighborOrder = currentOrder;
    if (currentOrder === neighborOrder) {
      nextCurrentOrder = swapIndex;
      nextNeighborOrder = index;
    }

    setReordering(true);
    try {
      await Promise.all([
        api.put(`/hotels/${current._id}`, { sortOrder: nextCurrentOrder }),
        api.put(`/hotels/${neighbor._id}`, { sortOrder: nextNeighborOrder }),
      ]);
      setHotels((prev) =>
        prev
          .map((h) => {
            if (h._id === current._id) return { ...h, sortOrder: nextCurrentOrder };
            if (h._id === neighbor._id) return { ...h, sortOrder: nextNeighborOrder };
            return h;
          })
          .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || String(a.name || "").localeCompare(String(b.name || "")))
      );
    } catch (err) {
      console.error("Error reordering hotels:", err);
      alert("Failed to reorder hotel");
    } finally {
      setReordering(false);
    }
  }

  const sortedHotels = useMemo(
    () =>
      [...hotels].sort(
        (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || String(a.name || "").localeCompare(String(b.name || ""))
      ),
    [hotels]
  );

  const filtered = sortedHotels.filter((h) => {
    const matchSearch =
      !search ||
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase()) ||
      h.country?.toLowerCase().includes(search.toLowerCase());
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
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputCls} max-w-xs`}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputCls} w-36`}>
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
                  {["Order", "Name", "Country", "City", "Price/Night", "Rooms", "Rating", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((hotel) => {
                  const fullIndex = sortedHotels.findIndex((h) => h._id === hotel._id);
                  return (
                    <tr key={hotel._id} className={`border-b last:border-0 ${darkMode ? "border-slate-800 hover:bg-slate-800/50" : "border-gray-50 hover:bg-gray-50"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className={`tabular-nums mr-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                            {Number(hotel.sortOrder) || 0}
                          </span>
                          <button
                            type="button"
                            disabled={reordering || fullIndex <= 0 || !!search || filterStatus !== "all"}
                            onClick={() => moveHotel(fullIndex, "up")}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={reordering || fullIndex < 0 || fullIndex >= sortedHotels.length - 1 || !!search || filterStatus !== "all"}
                            onClick={() => moveHotel(fullIndex, "down")}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move down"
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>
                        <div className="flex items-center gap-2">
                          {hotel.images?.[0] && (
                            <img src={hotel.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                          )}
                          {hotel.name}
                        </div>
                      </td>
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
                  );
                })}
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
                <div className="col-span-2">
                  <label className={labelCls}>Hotel Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="e.g. Riad Atlas" />
                </div>
                <div>
                  <label className={labelCls}>Country *</label>
                  <select
                    required
                    value={selectedCountryId}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>City *</label>
                  <select
                    required
                    value={form.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className={inputCls}
                    disabled={!selectedCountryId}
                  >
                    <option value="">{selectedCountryId ? "Select city" : "Select country first"}</option>
                    {cities.map((c) => (
                      <option key={c._id || c.id} value={c.name}>{c.name}</option>
                    ))}
                    {form.city && !cities.some((c) => c.name === form.city) && (
                      <option value={form.city}>{form.city}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Price Per Night ($) *</label>
                  <input required type="number" min={0} value={form.pricePerNight} onChange={(e) => setForm((p) => ({ ...p, pricePerNight: e.target.value }))} className={inputCls} placeholder="120" />
                </div>
                <div>
                  <label className={labelCls}>Rooms Available</label>
                  <input type="number" min={1} value={form.rooms} onChange={(e) => setForm((p) => ({ ...p, rooms: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Rating (0-5)</label>
                  <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={inputCls} placeholder="Brief description…" />
              </div>
              <div>
                <label className={labelCls}>Amenities (comma-separated)</label>
                <input value={form.amenities} onChange={(e) => setForm((p) => ({ ...p, amenities: e.target.value }))} className={inputCls} placeholder="WiFi, Pool, Breakfast" />
              </div>
              <div>
                <label className={labelCls}>Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleImageUpload(e.target.files);
                    e.target.value = "";
                  }}
                  className="w-full text-sm"
                />
                {form.images?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img} alt="" className="w-16 h-16 rounded object-cover border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={inputCls}>
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
