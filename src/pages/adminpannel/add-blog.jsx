import React, { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import api from "../../api";

const AddBlog = ({ onBack, initialData, blogId, onSaved }) => {
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await api.get('/categories');
        const list = Array.isArray(res.data) ? res.data : (res.data?.categories || []);
        setCategories(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setFormData((prev) => ({
      ...prev,
      title: initialData?.title || "",
      category: initialData?.category || "",
      description: initialData?.description || "",
      image: initialData?.image || "",
    }));
  }, [initialData]);

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setFormData((p) => ({ ...p, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const payload = {
      title: String(formData.title || "").trim(),
      category: String(formData.category || "").trim(),
      description: String(formData.description || ""),
      image: String(formData.image || ""),
    };

    if (!payload.title) {
      alert("Title is required");
      return;
    }

    try {
      setSaving(true);
      if (blogId) {
        await api.put(`/blogs/${blogId}`, payload);
      } else {
        await api.post("/blogs", payload);
      }
      alert(blogId ? 'Blog updated successfully' : 'Blog created successfully');
      if (onSaved) onSaved();
      if (onBack) onBack();
    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{blogId ? "Edit Blog" : "Add Blog"}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {blogId ? "Update blog details" : "Create a new blog post"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={onBack}
            type="button"
          >
            Back
          </button>
          <button
            className={`inline-flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 rounded-lg shadow-sm transition-colors ${saving
              ? "bg-[#a26e35]/70 cursor-not-allowed"
              : "bg-[#a26e35] hover:bg-[#8b5c2a]"}`}
            onClick={handleSave}
            type="button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-5 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-600">Title</p>
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#a26e35]"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="Enter blog title"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-600">Category</p>
            <select
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#a26e35]"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              disabled={categoriesLoading}
            >
              <option value="">{categoriesLoading ? 'Loading categories...' : 'Select category'}</option>
              {(() => {
                const options = (Array.isArray(categories) ? categories : [])
                  .map((c) => String(c?.name || '').trim())
                  .filter(Boolean)
                const current = String(formData.category || '').trim()
                const withCurrent = current && !options.includes(current) ? [current, ...options] : options
                return withCurrent.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))
              })()}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-600">Description</p>
          <textarea
            rows={6}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#a26e35]"
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            placeholder="Write blog description..."
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600">Picture</p>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-72">
              <div className="w-full h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                {formData.image ? (
                  <img src={formData.image} alt="Blog" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No image selected
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />

              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Upload className="w-4 h-4" />
                Upload Picture
              </button>

              {formData.image && (
                <button
                  className="ml-0 sm:ml-3 mt-2 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-sm font-semibold hover:bg-rose-100 transition-colors"
                  onClick={() => setFormData((p) => ({ ...p, image: "" }))}
                  type="button"
                >
                  Remove
                </button>
              )}
              <p className="text-[11px] text-gray-500 mt-2">
                Images are saved as Base64 (same pattern as existing admin screens).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
