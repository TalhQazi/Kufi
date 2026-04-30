import React, { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Image as ImageIcon, Search, X, ChevronDown, Pencil, Upload, Tag } from "lucide-react";
import api from "../../api";

const CityManagement = () => {
    const [cities, setCities] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingCityId, setEditingCityId] = useState(null);
    const [newCity, setNewCity] = useState({
        name: "",
        country: "",
        description: "",
        image: "",
        imageFile: null,
        status: "active",
        isTopLocation: false
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [citiesResult, countriesResult] = await Promise.allSettled([
                api.get('/cities'),
                api.get('/countries')
            ]);

            if (citiesResult.status === "fulfilled") {
                setCities(citiesResult.value.data);
            } else {
                console.error("Error fetching cities:", citiesResult.reason);
            }

            if (countriesResult.status === "fulfilled") {
                setCountries(countriesResult.value.data);
            } else {
                console.error("Error fetching countries:", countriesResult.reason);
            }
        } catch (error) {
            console.error("Unexpected error fetching data:", error);
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

        setNewCity({ ...newCity, imageFile: file });

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAddCity = async (e, targetStatus = 'active') => {
        e.preventDefault();
        try {
            const payload = {
                name: newCity.name,
                country: newCity.country,
                description: newCity.description,
                image: imagePreview || newCity.image || null,
                status: targetStatus,
                isTopLocation: newCity.isTopLocation
            };

            if (editingCityId) {
                await api.put(`/cities/${editingCityId}`, payload);
            } else {
                await api.post('/cities', payload);
            }

            setShowAddModal(false);
            setEditingCityId(null);
            setNewCity({ name: "", country: "", description: "", image: "", imageFile: null, status: "active" });
            setImagePreview(null);
            fetchData();
        } catch (error) {
            console.error("Error saving city:", error);
            alert("Failed to save city");
        }
    };

    const handleEditCity = (city) => {
        setEditingCityId(city?._id || null);
        setNewCity({
            name: city?.name || "",
            country: city?.country || "",
            description: city?.description || "",
            image: city?.image || city?.imageUrl || "",
            imageFile: null,
            status: city?.status || "active",
            isTopLocation: city?.isTopLocation || false
        });
        setImagePreview(city?.image || city?.imageUrl || null);
        setShowAddModal(true);
    };

    const handleDeleteCity = async (id) => {
        if (!window.confirm("Are you sure you want to delete this city?")) return;
        try {
            await api.delete(`/cities/${id}`);
            fetchData();
        } catch (error) {
            console.error("Error deleting city:", error);
            alert("Failed to delete city");
        }
    };

    const filteredCities = (Array.isArray(cities) ? cities : [])
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
                        City Management
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Manage cities and link them to countries.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 bg-[#704b24] hover:bg-[#5a3c1d] text-white px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add City</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search cities..."
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
                                    <th className="px-6 py-4">City Name</th>
                                    <th className="px-6 py-4">Country</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCities.length > 0 ? (
                                    filteredCities.map((city) => {
                                        const country = countries.find(co => co._id === city.country)?.name || city.country;
                                        return (
                                            <tr key={city._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                        {city.image ? (
                                                            <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
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
                                                        <span className="text-sm font-semibold text-slate-800">{city.name}</span>
                                                        {city.status === 'draft' && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                Draft
                                                            </span>
                                                        )}
                                                        {city.isTopLocation && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                                                Top Location
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {country}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-gray-500 line-clamp-2 max-w-md">{city.description}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {city.status === 'draft' && (
                                                        <button
                                                            onClick={() => handleEditCity(city)}
                                                            className="mr-2 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                                                        >
                                                            Resume
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditCity(city)}
                                                        className="p-2 text-gray-400 hover:text-[#704b24] transition-colors rounded-lg hover:bg-[#f7f1e7]"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCity(city._id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                                            No cities found.
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
                            <h2 className="text-xl font-semibold text-slate-900">{editingCityId ? 'Edit City' : 'Add New City'}</h2>
                            <button onClick={() => {
                                setShowAddModal(false)
                                setEditingCityId(null)
                                setNewCity({ name: "", country: "", description: "", image: "", imageFile: null, status: "active" })
                                setImagePreview(null)
                            }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={(e) => handleAddCity(e, 'active')} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">City Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Rome"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                    value={newCity.name}
                                    onChange={e => setNewCity({ ...newCity, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm appearance-none bg-white"
                                        value={newCity.country}
                                        onChange={e => setNewCity({ ...newCity, country: e.target.value })}
                                    >
                                        <option value="" disabled>Select a country</option>
                                        {countries.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-3 pointer-events-none text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Enter city details..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm resize-none"
                                    value={newCity.description}
                                    onChange={e => setNewCity({ ...newCity, description: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                                <input
                                    type="checkbox"
                                    id="isTopLocation"
                                    className="w-4 h-4 text-[#704b24] focus:ring-[#704b24] border-gray-300 rounded"
                                    checked={newCity.isTopLocation}
                                    onChange={e => setNewCity({ ...newCity, isTopLocation: e.target.checked })}
                                />
                                <label htmlFor="isTopLocation" className="text-sm font-medium text-amber-900 cursor-pointer">
                                    Mark as Top Location (Show on Homepage)
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">City Image</label>
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
                                                setNewCity({ ...newCity, image: '', imageFile: null });
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
                                        id="city-image-upload"
                                    />
                                    <label
                                        htmlFor="city-image-upload"
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
                                        setEditingCityId(null)
                                        setNewCity({ name: "", country: "", description: "", image: "", imageFile: null, status: "active" })
                                        setImagePreview(null)
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleAddCity(e, 'draft')}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-all border border-gray-300"
                                >
                                    Save as Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleAddCity(e, 'active')}
                                    className="flex-1 bg-[#704b24] hover:bg-[#5a3c1d] text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
                                >
                                    {editingCityId ? 'Update City' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CityManagement;
