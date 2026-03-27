import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, X, GripVertical } from "lucide-react";
import api from "../../api";

const BookingTermsController = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [draft, setDraft] = useState({
    title: "",
    options: [""],
    selectionType: "single",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/booking-terms");
      const data = Array.isArray(response.data) ? response.data : [];
      setTerms(data);
    } catch (error) {
      console.error("Error fetching booking terms:", error);
      setTerms([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (t) =>
        (t.title || "").toLowerCase().includes(q) ||
        (t.options || []).some((opt) => (opt || "").toLowerCase().includes(q))
    );
  }, [terms, searchQuery]);

  const openAddModal = () => {
    setEditingId(null);
    setDraft({
      title: "",
      options: [""],
      selectionType: "single",
      isActive: true,
      sortOrder: terms.length,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (term) => {
    setEditingId(term._id || term.id);
    setDraft({
      title: term.title || "",
      options: Array.isArray(term.options) && term.options.length > 0 ? term.options : [""],
      selectionType: term.selectionType || "single",
      isActive: term.isActive !== false,
      sortOrder: term.sortOrder || 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleOptionChange = (index, value) => {
    setDraft((prev) => {
      const next = [...prev.options];
      next[index] = value;
      return { ...prev, options: next };
    });
  };

  const addOption = () => {
    setDraft((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index) => {
    setDraft((prev) => {
      if (prev.options.length <= 1) return prev;
      const next = prev.options.filter((_, i) => i !== index);
      return { ...prev, options: next };
    });
  };

  const handleSave = async () => {
    const payload = {
      title: draft.title.trim(),
      options: draft.options.map((o) => o.trim()).filter(Boolean),
      selectionType: draft.selectionType,
      isActive: draft.isActive,
      sortOrder: Number(draft.sortOrder) || 0,
    };

    if (!payload.title) {
      alert("Please enter a term title");
      return;
    }

    if (payload.options.length === 0) {
      alert("Please add at least one option");
      return;
    }

    try {
      setIsSaving(true);
      if (editingId) {
        await api.put(`/booking-terms/${editingId}`, payload);
      } else {
        await api.post("/booking-terms", payload);
      }
      await fetchTerms();
      closeModal();
    } catch (error) {
      console.error("Error saving booking term:", error);
      alert("Failed to save booking term. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this term?")) return;
    try {
      await api.delete(`/booking-terms/${id}`);
      await fetchTerms();
    } catch (error) {
      console.error("Error deleting booking term:", error);
      alert("Failed to delete booking term");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Booking Terms</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage booking form terms and options
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 bg-[#a26e35] text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 rounded-lg shadow-sm hover:bg-[#8b5c2a] transition-colors w-full sm:w-auto"
          onClick={openAddModal}
        >
          <Plus className="w-4 h-4" />
          Add New Term
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-5">
        <div className="flex items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-sm text-gray-500 max-w-md">
          <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search terms..."
            className="bg-transparent outline-none text-sm placeholder:text-gray-400 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Terms List */}
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-5">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            {searchQuery ? "No terms match your search." : "No booking terms yet. Add your first term."}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTerms.map((term, index) => (
              <div
                key={term._id || term.id}
                className="border border-gray-100 rounded-xl p-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="text-gray-400 pt-1">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">{term.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        term.isActive !== false
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {term.isActive !== false ? "Active" : "Inactive"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                      {term.selectionType === "multiple" ? "Multiple Select" : "Single Select"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(term.options || []).map((opt, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg text-[#704b24] hover:bg-[#f7f1e7] transition-colors"
                    onClick={() => openEditModal(term)}
                    aria-label="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                    onClick={() => handleDelete(term._id || term.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit Booking Term" : "Add Booking Term"}
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-sm"
                onClick={closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Title */}
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Term Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g., Hotel, Food Preference, Transportation"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#a26e35]/30"
                />
              </div>

              {/* Selection Type */}
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Selection Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, selectionType: "single" })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                      draft.selectionType === "single"
                        ? "bg-[#a26e35] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Single Select
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, selectionType: "multiple" })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                      draft.selectionType === "multiple"
                        ? "bg-[#a26e35] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Multiple Select
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {draft.selectionType === "single"
                    ? "User can select only one option from this term"
                    : "User can select multiple options from this term"}
                </p>
              </div>

              {/* Options */}
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Options <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {draft.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#a26e35]/30"
                      />
                      {draft.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-sm text-[#a26e35] font-medium hover:text-[#8b5c2a] transition-colors"
                >
                  + Add another option
                </button>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Status</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#a26e35] focus:ring-[#a26e35]"
                  />
                  <span className="text-sm text-gray-700">
                    {draft.isActive ? "Active (visible on booking form)" : "Inactive (hidden from booking form)"}
                  </span>
                </label>
              </div>

              {/* Sort Order */}
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={draft.sortOrder}
                  onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#a26e35]/30"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Lower numbers appear first on the booking form
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#a26e35] text-white hover:bg-[#8c5c2c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? "Saving..." : editingId ? "Update Term" : "Add Term"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTermsController;
