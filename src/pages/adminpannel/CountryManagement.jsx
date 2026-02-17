import React, { useState, useEffect } from "react";
import { Globe, Plus, Trash2, Image as ImageIcon, Search, X, Pencil } from "lucide-react";
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
        image: ""
    });

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

    const handleAddCountry = async (e) => {
        e.preventDefault();
        try {
            if (editingCountryId) {
                await api.put(`/countries/${editingCountryId}`, newCountry);
            } else {
                await api.post('/countries', newCountry);
            }
            setShowAddModal(false);
            setEditingCountryId(null);
            setNewCountry({ name: "", description: "", image: "" });
            fetchCountries();
        } catch (error) {
            console.error("Error adding country:", error);
            alert("Failed to add country");
        }
    };

    const handleEditCountry = (country) => {
        setEditingCountryId(country?._id || null);
        setNewCountry({
            name: country?.name || "",
            description: country?.description || "",
            image: country?.image || country?.imageUrl || "",
        });
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

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                                <span className="text-sm font-semibold text-slate-800">{country.name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-gray-500 line-clamp-2 max-w-md">{country.description}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
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
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-slate-900">{editingCountryId ? 'Edit Country' : 'Add New Country'}</h2>
                            <button onClick={() => {
                                setShowAddModal(false)
                                setEditingCountryId(null)
                                setNewCountry({ name: "", description: "", image: "" })
                            }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleAddCountry} className="p-6 space-y-4">
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
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Picture URL</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-3 text-gray-400">
                                        <ImageIcon className="w-4 h-4" />
                                    </div>
                                    <input
                                        required
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                        value={newCountry.image}
                                        onChange={e => setNewCountry({ ...newCountry, image: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setEditingCountryId(null)
                                        setNewCountry({ name: "", description: "", image: "" })
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#704b24] hover:bg-[#5a3c1d] text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
                                >
                                    {editingCountryId ? 'Update Country' : 'Save Country'}
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
