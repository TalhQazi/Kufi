import { useEffect, useState, useCallback } from 'react';
import api from '../../api';
import { Layout, Image, Plus, Trash2, Save, Loader2, Upload, GripVertical, Phone, Eye, EyeOff } from 'lucide-react';

const DEFAULT_NAV_ITEMS = [
    { id: 'home', label: 'Home', url: '#home', sortOrder: 0, isActive: true },
    { id: 'destinations', label: 'Destinations', url: '#destinations', sortOrder: 1, isActive: true },
    { id: 'top-locations', label: 'Top Locations', url: '#top-locations', sortOrder: 2, isActive: true },
    { id: 'blog', label: 'Blog', url: '#blog', sortOrder: 3, isActive: true }
];

export default function HeaderController() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Header settings state
    const [logo, setLogo] = useState('/assets/navbar.png');
    const [navItems, setNavItems] = useState(DEFAULT_NAV_ITEMS);
    const [contactPhone, setContactPhone] = useState('+0 123 456 789');
    const [contactIsActive, setContactIsActive] = useState(true);
    const [authButtonLabel, setAuthButtonLabel] = useState('Login/Signup');
    const [authButtonIsActive, setAuthButtonIsActive] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/header');
            const data = response.data;

            if (data.logo) setLogo(data.logo);
            if (data.navItems?.length > 0) setNavItems(data.navItems);
            if (data.contactInfo) {
                setContactPhone(data.contactInfo.phone || '+0 123 456 789');
                setContactIsActive(data.contactInfo.isActive !== false);
            }
            if (data.authButton) {
                setAuthButtonLabel(data.authButton.label || 'Login/Signup');
                setAuthButtonIsActive(data.authButton.isActive !== false);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching header settings:', err);
            setError('Failed to load header settings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setSuccess(false);

            const payload = {
                logo,
                navItems,
                contactInfo: {
                    phone: contactPhone,
                    isActive: contactIsActive
                },
                authButton: {
                    label: authButtonLabel,
                    isActive: authButtonIsActive
                }
            };

            await api.put('/header', payload);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving header settings:', err);
            setError('Failed to save header settings');
        } finally {
            setSaving(false);
        }
    };

    // Helper function to convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;

        try {
            setUploadingLogo(true);
            const base64Image = await fileToBase64(file);
            
            const response = await api.post('/header/upload', {
                image: base64Image,
                name: file.name
            });

            setLogo(response.data.url);
        } catch (err) {
            console.error('Error uploading logo:', err);
            alert('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    // Nav Items Handlers
    const addNavItem = () => {
        const newId = `section-${navItems.length + 1}`;
        setNavItems([...navItems, { id: newId, label: '', url: '#', sortOrder: navItems.length, isActive: true }]);
    };

    const updateNavItem = (index, field, value) => {
        const updated = [...navItems];
        updated[index] = { ...updated[index], [field]: value };
        setNavItems(updated);
    };

    const removeNavItem = (index) => {
        setNavItems(navItems.filter((_, i) => i !== index));
    };

    const moveNavItem = (index, direction) => {
        if (direction === 'up' && index > 0) {
            const updated = [...navItems];
            [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
            // Update sortOrder
            updated.forEach((item, i) => item.sortOrder = i);
            setNavItems(updated);
        } else if (direction === 'down' && index < navItems.length - 1) {
            const updated = [...navItems];
            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
            // Update sortOrder
            updated.forEach((item, i) => item.sortOrder = i);
            setNavItems(updated);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#a67c52]" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Layout className="w-7 h-7 text-[#a67c52]" />
                    Header Management
                </h1>
                <p className="text-gray-600 mt-1">Manage header logo, navigation items, contact number, and login button</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    Header settings saved successfully!
                </div>
            )}

            <div className="space-y-8">
                {/* Logo Section */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Image className="w-5 h-5 text-[#a67c52]" />
                            Logo
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-6">
                            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                                {logo ? (
                                    <img src={logo} alt="Header Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="text-gray-400 text-sm">No logo</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleLogoUpload(e.target.files[0])}
                                            className="hidden"
                                        />
                                        <div className="flex items-center gap-2 px-4 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8f643e] transition-colors">
                                            {uploadingLogo ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4" />
                                            )}
                                            <span>{uploadingLogo ? 'Uploading...' : 'Upload New Logo'}</span>
                                        </div>
                                    </label>
                                    {logo && logo !== '/assets/navbar.png' && (
                                        <button
                                            onClick={() => setLogo('/assets/navbar.png')}
                                            className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            Reset to Default
                                        </button>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">Recommended size: 200x66 pixels. PNG or SVG preferred for transparency.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Navigation Items</h2>
                        <span className="text-xs text-gray-500">Reorder, edit, or hide/show menu items</span>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {navItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                    
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => moveNavItem(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => moveNavItem(index, 'down')}
                                            disabled={index === navItems.length - 1}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            ↓
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateNavItem(index, 'label', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] text-sm"
                                        placeholder="Label (e.g., Home)"
                                    />

                                    <input
                                        type="text"
                                        value={item.url}
                                        onChange={(e) => updateNavItem(index, 'url', e.target.value)}
                                        className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] text-sm"
                                        placeholder="URL (e.g., #home)"
                                    />

                                    <button
                                        onClick={() => updateNavItem(index, 'isActive', !item.isActive)}
                                        className={`p-2 rounded-lg transition-colors ${item.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                        title={item.isActive ? 'Visible' : 'Hidden'}
                                    >
                                        {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>

                                    <button
                                        onClick={() => removeNavItem(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addNavItem}
                            className="mt-4 flex items-center gap-2 px-4 py-2 text-[#a67c52] hover:bg-[#a67c52]/10 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Navigation Item
                        </button>
                    </div>
                </div>

                {/* Contact Number */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-[#a67c52]" />
                            Contact Number
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                                    placeholder="+0 123 456 789"
                                />
                            </div>
                            <div className="pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={contactIsActive}
                                        onChange={(e) => setContactIsActive(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-[#a67c52] focus:ring-[#a67c52]"
                                    />
                                    <span className="text-sm text-gray-700">Show in header</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Auth Button */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900">Login/Signup Button</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                                <input
                                    type="text"
                                    value={authButtonLabel}
                                    onChange={(e) => setAuthButtonLabel(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                                    placeholder="Login/Signup"
                                />
                            </div>
                            <div className="pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={authButtonIsActive}
                                        onChange={(e) => setAuthButtonIsActive(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-[#a67c52] focus:ring-[#a67c52]"
                                    />
                                    <span className="text-sm text-gray-700">Show in header</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8f643e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
