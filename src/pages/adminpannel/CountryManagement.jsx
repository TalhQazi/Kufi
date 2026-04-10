import React, { useState, useEffect } from "react";
import { Globe, Plus, Trash2, Image as ImageIcon, Search, X, Pencil, Upload, Tag } from "lucide-react";
import api from "../../api";

const CountryManagement = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingCountryId, setEditingCountryId] = useState(null);
    const [newCountry, setNewCountry] = useState({
        name: "",
        description: "",
        image: "",
        imageFile: null,
        status: "active"
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            setLoading(true);
            const response = await api.get('/countries');
            setCountries(response.data);
        } catch (error) {
            console.error("Error fetching countries:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setNewCountry({ ...newCountry, imageFile: file });

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAddCountry = async (e, targetStatus = 'active') => {
        e.preventDefault();
        try {
            const payload = {
                name: newCountry.name,
                description: newCountry.description,
                image: imagePreview || newCountry.image || null,
                status: targetStatus
            };

            if (editingCountryId) {
                await api.put(`/countries/${editingCountryId}`, payload);
            } else {
                await api.post('/countries', payload);
            }
            setShowAddModal(false);
            setEditingCountryId(null);
            setNewCountry({ name: "", description: "", image: "", imageFile: null, status: "active" });
            setImagePreview(null);
            fetchCountries();
        } catch (error) {
            console.error("Error adding country:", error);
            alert("Failed to save country");
        }
    };

    const handleEditCountry = (country) => {
        setEditingCountryId(country?._id || null);
        setNewCountry({
            name: country?.name || "",
            description: country?.description || "",
            image: country?.image || country?.imageUrl || "",
            imageFile: null,
            status: country?.status || "active"
        });
        setImagePreview(country?.image || country?.imageUrl || null);
        setShowAddModal(true);
    };

    const handleDeleteCountry = async (id) => {
        if (!window.confirm("Are you sure you want to delete this country?")) return;
        try {
            await api.delete(`/countries/${id}`);
            fetchCountries();
        } catch (error) {
            console.error("Error deleting country:", error);
            alert("Failed to delete country");
        }
    };

    const filteredCountries = (Array.isArray(countries) ? countries : [])
        .filter(c => c?.status === 'active' || c?.status === 'draft' || !c?.status)
        .filter(c =>
            String(c?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const aIsDraft = a?.status === 'draft';
            const bIsDraft = b?.status === 'draft';
            if (aIsDraft && !bIsDraft) return -1;
            if (!aIsDraft && bIsDraft) return 1;
            return String(a?.name || '').localeCompare(String(b?.name || ''));
        });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">
                        Country Management
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Manage countries and their details for the platform.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 bg-[#704b24] hover:bg-[#5a3c1d] text-white px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add Country</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search countries..."
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
                                    <th className="px-6 py-4">Image</th>
                                    <th className="px-6 py-4">Country Name</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                        <tr key={country._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                    {country.image ? (
                                                        <img src={country.image} alt={country.name} className="w-full h-full object-cover" />
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
                                                    <span className="text-sm font-semibold text-slate-800">{country.name}</span>
                                                    {country.status === 'draft' && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                            Draft
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-gray-500 line-clamp-2 max-w-md">{country.description}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {country.status === 'draft' && (
                                                    <button
                                                        onClick={() => handleEditCountry(country)}
                                                        className="mr-2 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                                                    >
                                                        Resume
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditCountry(country)}
                                                    className="p-2 text-gray-400 hover:text-[#704b24] transition-colors rounded-lg hover:bg-[#f7f1e7]"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCountry(country._id)}
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
                                            No countries found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-slate-900">{editingCountryId ? 'Edit Country' : 'Add New Country'}</h2>
                            <button onClick={() => {
                                setShowAddModal(false)
                                setEditingCountryId(null)
                                setNewCountry({ name: "", description: "", image: "", imageFile: null, status: "active" })
                                setImagePreview(null)
                            }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={(e) => handleAddCountry(e, 'active')} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Country Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Italy"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                    value={newCountry.name}
                                    onChange={e => setNewCountry({ ...newCountry, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Enter country details..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm resize-none"
                                    value={newCountry.description}
                                    onChange={e => setNewCountry({ ...newCountry, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Country Image</label>
                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="mb-3 relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-40 object-cover rounded-xl border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setNewCountry({ ...newCountry, image: '', imageFile: null });
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {/* File Upload */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="country-image-upload"
                                    />
                                    <label
                                        htmlFor="country-image-upload"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#704b24] hover:bg-[#f7f1e7]/50 cursor-pointer transition-all"
                                    >
                                        <Upload className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {imagePreview ? 'Change Image' : 'Click to upload image'}
                                        </span>
                                    </label>
                                </div>
                                <p className="mt-1.5 text-xs text-gray-400">Supported: JPG, PNG, GIF (max 5MB)</p>
                            </div>
                            <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setEditingCountryId(null)
                                        setNewCountry({ name: "", description: "", image: "", imageFile: null, status: "active" })
                                        setImagePreview(null)
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleAddCountry(e, 'draft')}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-all border border-gray-300"
                                >
                                    Save as Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleAddCountry(e, 'active')}
                                    className="flex-1 bg-[#704b24] hover:bg-[#5a3c1d] text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
                                >
                                    {editingCountryId ? 'Update Country' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CountryManagement;
