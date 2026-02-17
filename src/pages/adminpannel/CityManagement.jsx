import React, { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Image as ImageIcon, Search, X, ChevronDown, Pencil } from "lucide-react";
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
        image: ""
    });

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

    const handleAddCity = async (e) => {
        e.preventDefault();
        try {
            if (editingCityId) {
                await api.put(`/cities/${editingCityId}`, newCity);
            } else {
                await api.post('/cities', newCity);
            }
            setShowAddModal(false);
            setEditingCityId(null);
            setNewCity({ name: "", country: "", description: "", image: "" });
            fetchData();
        } catch (error) {
            console.error("Error adding city:", error);
            alert("Failed to add city");
        }
    };

    const handleEditCity = (city) => {
        setEditingCityId(city?._id || null);
        setNewCity({
            name: city?.name || "",
            country: city?.country || "",
            description: city?.description || "",
            image: city?.image || "",
        });
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

    const filteredCities = cities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                                    <span className="text-sm font-semibold text-slate-800">{city.name}</span>
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
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-slate-900">{editingCityId ? 'Edit City' : 'Add New City'}</h2>
                            <button onClick={() => {
                                setShowAddModal(false)
                                setEditingCityId(null)
                                setNewCity({ name: "", country: "", description: "", image: "" })
                            }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleAddCity} className="p-6 space-y-4">
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
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Picture URL</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-3 text-gray-400">
                                        <ImageIcon className="w-4 h-4" />
                                    </div>
                                    <input
                                        required
                                        type="url"
                                        placeholder="https://example.com/city.jpg"
                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#704b24] focus:ring-1 focus:ring-[#704b24] outline-none transition-all text-sm"
                                        value={newCity.image}
                                        onChange={e => setNewCity({ ...newCity, image: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setEditingCityId(null)
                                        setNewCity({ name: "", country: "", description: "", image: "" })
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-medium hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#704b24] hover:bg-[#5a3c1d] text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95"
                                >
                                    {editingCityId ? 'Update City' : 'Save City'}
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
