import { useEffect, useState } from "react";
import api from "../../api";

export default function SupplierHotels({ darkMode }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/hotels")
      .then(r => setHotels(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = hotels.filter(h =>
    !search ||
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase()) ||
    h.country.toLowerCase().includes(search.toLowerCase())
  );

  const base = darkMode ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900";
  const cardCls = `rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`;
  const inputCls = `rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a26e35] ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-white border-gray-200 text-gray-800"}`;

  return (
    <div className={`min-h-screen px-4 py-6 space-y-5 ${base}`}>
      <div className="flex items-center justify-between">
        <h1 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Available Hotels</h1>
      </div>

      <input
        type="text"
        placeholder="Search by name, city, country…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={`${inputCls} w-full max-w-sm`}
      />

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">No hotels found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(hotel => (
            <div key={hotel._id} className={`${cardCls} overflow-hidden`}>
              {/* Image */}
              <div className="h-36 bg-gray-200 overflow-hidden">
                {hotel.images?.[0] ? (
                  <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-xs ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
                    No image
                  </div>
                )}
              </div>

              <div className="px-4 py-3 space-y-1.5">
                <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{hotel.name}</h3>
                <p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  {hotel.city}, {hotel.country}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-xs font-bold text-amber-600`}>
                    ${hotel.pricePerNight?.toLocaleString()} / night
                  </span>
                  <span className={`text-[11px] ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                    ⭐ {hotel.rating} · {hotel.rooms} rooms
                  </span>
                </div>

                {hotel.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {hotel.amenities.slice(0, 3).map(a => (
                      <span key={a} className={`text-[10px] px-2 py-0.5 rounded-full ${darkMode ? "bg-slate-800 text-slate-400" : "bg-gray-100 text-gray-500"}`}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
