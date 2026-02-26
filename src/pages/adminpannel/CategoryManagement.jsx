import React, { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Search, X, Pencil, Tag } from "lucide-react";
import api from "../../api";

const iconColor = "#9B6F40"

const CATEGORY_ICONS = [
    {
        key: 'Culture',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M5 21V7L12 3L19 7V21" />
                <path d="M5 7H19" />
                <rect x="9" y="14" width="6" height="7" />
                <line x1="7" y1="10.5" x2="17" y2="10.5" />
            </svg>
        )
    },
    {
        key: 'Sightseeing',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <circle cx="12" cy="4" r="2" />
                <path d="M10 8L12 6L14 8V13L12 16" />
                <path d="M10 15L8 21" />
                <path d="M12 16L15 21" />
            </svg>
        )
    },
    {
        key: 'Families',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        )
    },
    {
        key: 'Food and Drink',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M3 11H21L19 20H5L3 11Z" />
                <path d="M17 11C17 8 15 5 12 5C9 5 7 8 7 11" />
                <line x1="12" y1="15" x2="12" y2="17" />
            </svg>
        )
    },
    {
        key: 'Adventure',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M13 3.99961C13.5523 3.99961 14 3.55189 14 2.99961" />
                <path d="M5.5 21L10 11L8 9L11 7L13 9V6L15 8L17 13M9 19L11 13" />
                <path d="M7 10L9 8" />
            </svg>
        )
    },
    {
        key: 'In the Air',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M12 2L4 6L12 10L20 6L12 2Z" />
                <path d="M12 10v12" />
                <path d="M4 11v6l8 5" />
                <path d="M20 11v6l-8 5" />
            </svg>
        )
    },
    {
        key: 'On the water',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M2 12c0 2 1 3 3 3s3-1 3-3 1-3 3-3 3 1 3 3 1 3 3 3 3-1 3-3" />
                <path d="M2 17c0 2 1 3 3 3s3-1 3-3 1-3 3-3 3 1 3 3 1 3 3 3 3-1 3-3" />
                <path d="M12 9V5" />
                <path d="M11 5h2" />
            </svg>
        )
    },
    {
        key: 'Entertainment',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="7.5" cy="7.5" r="1" fill={iconColor} />
                <circle cx="16.5" cy="7.5" r="1" fill={iconColor} />
                <circle cx="7.5" cy="16.5" r="1" fill={iconColor} />
                <circle cx="16.5" cy="16.5" r="1" fill={iconColor} />
                <circle cx="12" cy="12" r="1" fill={iconColor} />
            </svg>
        )
    },
    {
        key: 'Seasonal',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M3 20L12 3L21 20H3Z" />
                <path d="M12 3v7" />
                <path d="M2 20h20" />
            </svg>
        )
    },
    {
        key: 'Wellness',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        )
    },
    {
        key: 'Learning',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M12 12l2 2 4-4" />
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        )
    },
    {
        key: 'Luxury',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <path d="M5 9l7-7 7 7" />
                <path d="M5 9v11h14V9" />
                <rect x="9" y="14" width="6" height="6" />
                <path d="M12 2v4" />
            </svg>
        )
    },
    {
        key: 'Dates',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        )
    },
]

const getIconByKey = (key) => {
    const found = CATEGORY_ICONS.find((i) => i.key === key)
    return found?.icon || null
}

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [newCategory, setNewCategory] = useState({
        name: "",
        description: "",
        image: ""
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/categories');
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            if (editingCategoryId) {
                await api.put(`/categories/${editingCategoryId}`, newCategory);
            } else {
                await api.post('/categories', newCategory);
            }
            setShowAddModal(false);
            setEditingCategoryId(null);
            setNewCategory({ name: "", description: "", image: "" });
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            const status = error?.response?.status
            const msg = error?.response?.data?.msg || error?.response?.data?.message || error?.message
            alert(`Failed to save category${status ? ` (Status: ${status})` : ''}: ${msg || 'Unknown error'}`);
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategoryId(category?._id || null);
        setNewCategory({
            name: category?.name || "",
            description: category?.description || "",
            image: category?.image || "",
        });
        setShowAddModal(true);
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Failed to delete category");
        }
    };

    const filteredCategories = (Array.isArray(categories) ? categories : []).filter(c =>
        String(c?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isIconUrl = (value) => {
        return /^https?:\/\//i.test(String(value || '').trim())
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">
                        Category Management
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Manage categories shown on the landing page.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 bg-[#704b24] hover:bg-[#5a3c1d] text-white px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add Category</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-700 placeholder:text-gray-400"
                    />
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#704b24]"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Icon</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map((category) => (
                                        <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                    {category.image && isIconUrl(category.image) ? (
                                                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                                    ) : category.image ? (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            {getIconByKey(category.image) || <ImageIcon className="w-5 h-5 text-gray-300" />}
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="w-5 h-5 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-[#704b24]" />
                                                    <span className="text-sm font-semibold text-slate-800">{category.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-gray-500 line-clamp-2 max-w-md">{category.description || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleEditCategory(category)}
                                                    className="p-2 text-gray-400 hover:text-[#704b24] transition-colors rounded-lg hover:bg-[#f7f1e7]"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 text-sm">
                                            No categories found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-slate-900">{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h2>
                            <button onClick={() => {
                                setShowAddModal(false)
                                setEditingCategoryId(null)
                                setNewCategory({ name: "", description: "", image: "" })
                            }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleAddCategory} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Culture"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                    value={newCategory.name}
                                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Optional description..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm resize-none"
                                    value={newCategory.description}
                                    onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Icon</label>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                    {CATEGORY_ICONS.map((icon) => {
                                        const isSelected = newCategory.image === icon.key
                                        return (
                                            <button
                                                key={icon.key}
                                                type="button"
                                                onClick={() => setNewCategory({ ...newCategory, image: icon.key })}
                                                className={`h-12 rounded-xl border transition-all flex items-center justify-center ${isSelected
                                                    ? 'border-[#704b24] bg-[#f7f1e7]'
                                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    }`}
                                                title={icon.key}
                                            >
                                                {icon.icon}
                                            </button>
                                        )
                                    })}
                                </div>
                                {newCategory.image ? (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                                            {getIconByKey(newCategory.image) || <ImageIcon className="w-5 h-5 text-gray-300" />}
                                        </div>
                                        <span>{newCategory.image}</span>
                                    </div>
                                ) : null}
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setEditingCategoryId(null)
                                        setNewCategory({ name: "", description: "", image: "" })
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#704b24] hover:bg-[#5a3c1d] text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
                                >
                                    {editingCategoryId ? 'Update Category' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
