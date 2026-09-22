import { useEffect, useState } from "react";
import { resolveActivityImage } from "../api";

/**
 * Activity cover that never leaves a blank white box.
 * Many catalogue rows advertise `/api/activities/:id/image` even when the DB
 * has no photo — those 404; we fall back to a muted placeholder instead.
 */
export default function ActivityThumb({
  activity,
  alt = "",
  className = "absolute inset-0 w-full h-full object-cover",
  placeholderClassName = "",
  darkMode = false,
}) {
  const photo = resolveActivityImage(activity);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photo]);

  if (!photo || failed) {
    return (
      <div
        className={`flex items-center justify-center text-[10px] ${
          darkMode ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-400"
        } ${placeholderClassName || className}`}
        aria-hidden={!alt}
      >
        No image
      </div>
    );
  }

  return (
    <img
      src={photo}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
