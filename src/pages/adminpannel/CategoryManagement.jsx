import React, { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Search, X, Pencil, Tag } from "lucide-react";
import api from "../../api";

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
            alert("Failed to save category");
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
                                                    {category.image ? (
                                                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
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
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Icon URL</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-3 text-gray-400">
                                        <ImageIcon className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/icon.png"
                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                        value={newCategory.image}
                                        onChange={e => setNewCategory({ ...newCategory, image: e.target.value })}
                                    />
                                </div>
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
