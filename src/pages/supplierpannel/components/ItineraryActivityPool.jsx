import { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import api from "../../../api";

const resolveImageUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("data:")) return raw;
  if (raw.startsWith("/")) {
    const base = String(api?.defaults?.baseURL || "")
      .replace(/\/$/, "")
      .replace(/\/api$/, "");
    if (!base) return raw;
    return `${base}${raw}`;
  }
  return raw;
};

// ─── Draggable activity card ─────────────────────────────────────────────────

function DraggableCard({ activity, darkMode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pool-${activity._id || activity.id}`,
    data: { source: "pool", activity },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 999 }
    : undefined;

  const activityUrl = `/activities/${activity._id || activity.id}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-xl border overflow-hidden cursor-grab active:cursor-grabbing transition-all select-none ${
        isDragging ? "opacity-50 shadow-xl" : ""
      } ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100 shadow-sm"}`}
    >
      <div className="relative h-24 bg-gray-200 overflow-hidden">
        {activity.image ? (
          <img src={resolveImageUrl(activity.image)} alt={activity.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
            No image
          </div>
        )}
        {activity.category && (
          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium bg-black/40 text-white">
            {activity.category}
          </span>
        )}
      </div>

      <div className="px-2 py-1.5">
        {activityUrl ? (
          <a
            href={activityUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className={`text-[11px] font-medium leading-tight block truncate hover:underline ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}
          >
            {activity.title}
          </a>
        ) : (
          <h4 className={`text-[11px] font-medium leading-tight block truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
            {activity.title}
          </h4>
        )}
        {activity.duration && (
          <p className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
            {activity.duration}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Activity Pool ───────────────────────────────────────────────────────────

export default function ItineraryActivityPool({ darkMode, itinerary, assignedActivityIds = [] }) {
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const country = itinerary?.country || itinerary?.tripData?.country || "";
  const city = itinerary?.city || itinerary?.tripData?.city || itinerary?.destination || "";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [catRes, actRes] = await Promise.all([
          api.get("/categories"),
          api.get("/activities?includeImages=true"),
        ]);

        setCategories(catRes.data || []);

        const all = (actRes.data?.activities || actRes.data || []);
        const filtered = all.filter(a => {
          if (a.status && a.status !== "approved") return false;
          if (!country && !city) return true;
          const matchCountry = !country || (a.country || "").toLowerCase().includes(country.toLowerCase());
          const matchCity = !city || (a.location || "").toLowerCase().includes(city.toLowerCase());
          return matchCountry || matchCity;
        });

        setActivities(filtered);
      } catch (err) {
        console.error("Failed to load activity pool", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [country, city]);

  // Only show activities not yet assigned to any day
  const assignedSet = new Set(assignedActivityIds.map(String));
  const unassigned = activities.filter(a => !assignedSet.has(String(a._id || a.id)));

  const displayed = activeCategory === "All"
    ? unassigned
    : unassigned.filter(a => (a.category || "").toLowerCase() === activeCategory.toLowerCase());

  const catList = ["All", ...categories.map(c => c.name)];

  const base = darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100";

  return (
    <div className={`rounded-2xl border text-xs ${base}`}>
      <div className={`px-4 py-3 border-b ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
        <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
          Activities
        </h3>
        <p className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
          Drag onto a day to assign
        </p>
      </div>

      {/* Category tabs */}
      <div className={`flex gap-1.5 px-3 py-2 overflow-x-auto border-b ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
        {catList.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${
              activeCategory === cat
                ? "bg-[#a26e35] text-white"
                : darkMode
                  ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="px-3 py-3 max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className={`text-center py-8 text-[11px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
            Loading activities…
          </div>
        ) : displayed.length === 0 ? (
          <div className={`text-center py-8 text-[11px] ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
            {unassigned.length === 0 ? "All activities assigned" : "No activities in this category"}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {displayed.map(a => (
              <DraggableCard key={a._id || a.id} activity={a} darkMode={darkMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
