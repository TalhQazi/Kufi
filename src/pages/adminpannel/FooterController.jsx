import { useEffect, useState, useCallback } from 'react';
import api from '../../api';
import { Layout, Image, Link2, Plus, Trash2, Save, Loader2, Mail, Phone, MapPin, Globe, Home, Facebook, Instagram, Youtube, Upload, GripVertical } from 'lucide-react';

const DEFAULT_CONTACT_ITEMS = [
    { type: 'email', label: 'Kufi@support.com', value: 'Kufi@support.com', icon: 'Mail', sortOrder: 0, isActive: true },
    { type: 'phone', label: '123 456 7890', value: '123 456 7890', icon: 'Phone', sortOrder: 1, isActive: true },
    { type: 'email', label: 'info@loremipsum.com', value: 'info@loremipsum.com', icon: 'Mail', sortOrder: 2, isActive: true }
];

const DEFAULT_SOCIAL_ICONS = [
    { name: 'Facebook', url: '#', iconImage: null, sortOrder: 0, isActive: true },
    { name: 'Instagram', url: '#', iconImage: null, sortOrder: 1, isActive: true },
    { name: 'YouTube', url: '#', iconImage: null, sortOrder: 2, isActive: true }
];

const DEFAULT_PAYMENT_METHODS = [
    { name: 'Visa', iconImage: '/assets/visa.svg', sortOrder: 0, isActive: true },
    { name: 'Mastercard', iconImage: '/assets/master.png', sortOrder: 1, isActive: true },
    { name: 'PayPal', iconImage: '/assets/paypal.svg', sortOrder: 2, isActive: true },
    { name: 'American Express', iconImage: '/assets/am.png', sortOrder: 3, isActive: true },
    { name: 'Discover', iconImage: '/assets/discover.png', sortOrder: 4, isActive: true }
];

const ICON_OPTIONS = [
    { value: 'Mail', label: 'Mail', Icon: Mail },
    { value: 'Phone', label: 'Phone', Icon: Phone },
    { value: 'MapPin', label: 'Map Pin', Icon: MapPin },
    { value: 'Globe', label: 'Globe', Icon: Globe },
    { value: 'Home', label: 'Home', Icon: Home }
];

export default function FooterController() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Footer settings state
    const [contactTitle, setContactTitle] = useState('Quick contact');
    const [contactItems, setContactItems] = useState(DEFAULT_CONTACT_ITEMS);
    const [socialIcons, setSocialIcons] = useState(DEFAULT_SOCIAL_ICONS);
    const [paymentMethods, setPaymentMethods] = useState(DEFAULT_PAYMENT_METHODS);
    const [brandDescription, setBrandDescription] = useState('stepping outside comfort zones, embracing the unfamiliar, and creating lasting memories');
    const [socialTitle, setSocialTitle] = useState('Connect with us');
    const [copyright, setCopyright] = useState('© Copyright lorem ipsum amet dolor All Rights Reserved.');

    // Uploading states
    const [uploadingSocialId, setUploadingSocialId] = useState(null);
    const [uploadingPaymentId, setUploadingPaymentId] = useState(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/footer');
            const data = response.data;

            if (data.contactInfo) {
                setContactTitle(data.contactInfo.title || 'Quick contact');
                setContactItems(data.contactInfo.items?.length > 0 ? data.contactInfo.items : DEFAULT_CONTACT_ITEMS);
            }

            if (data.socialIcons) {
                setSocialIcons(data.socialIcons.length > 0 ? data.socialIcons : DEFAULT_SOCIAL_ICONS);
            }

            if (data.paymentMethods) {
                setPaymentMethods(data.paymentMethods.length > 0 ? data.paymentMethods : DEFAULT_PAYMENT_METHODS);
            }

            if (data.brandSection) {
                setBrandDescription(data.brandSection.description || '');
                setSocialTitle(data.brandSection.socialTitle || 'Connect with us');
            }

            if (data.copyright) {
                setCopyright(data.copyright);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching footer settings:', err);
            setError('Failed to load footer settings');
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
                contactInfo: {
                    title: contactTitle,
                    items: contactItems
                },
                socialIcons: socialIcons,
                paymentMethods: paymentMethods,
                brandSection: {
                    description: brandDescription,
                    socialTitle: socialTitle
                },
                copyright: copyright
            };

            await api.put('/footer', payload);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving footer settings:', err);
            setError('Failed to save footer settings');
        } finally {
            setSaving(false);
        }
    };

    // Contact Items Handlers
    const addContactItem = () => {
        setContactItems([...contactItems, { type: 'other', label: '', value: '', icon: 'Globe', sortOrder: contactItems.length, isActive: true }]);
    };

    const updateContactItem = (index, field, value) => {
        const updated = [...contactItems];
        updated[index] = { ...updated[index], [field]: value };
        setContactItems(updated);
    };

    const removeContactItem = (index) => {
        setContactItems(contactItems.filter((_, i) => i !== index));
    };

    // Social Icons Handlers
    const addSocialIcon = () => {
        setSocialIcons([...socialIcons, { name: '', url: '#', iconImage: null, sortOrder: socialIcons.length, isActive: true }]);
    };

    const updateSocialIcon = (index, field, value) => {
        const updated = [...socialIcons];
        updated[index] = { ...updated[index], [field]: value };
        setSocialIcons(updated);
    };

    const removeSocialIcon = (index) => {
        setSocialIcons(socialIcons.filter((_, i) => i !== index));
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

    const handleSocialIconUpload = async (index, file) => {
        if (!file) return;

        try {
            setUploadingSocialId(index);
            
            // Convert file to base64
            const base64Image = await fileToBase64(file);
            
            // Send to backend
            const response = await api.post('/footer/upload', {
                image: base64Image,
                name: file.name
            });

            updateSocialIcon(index, 'iconImage', response.data.url);
        } catch (err) {
            console.error('Error uploading social icon:', err);
            alert('Failed to upload image');
        } finally {
            setUploadingSocialId(null);
        }
    };

    // Payment Methods Handlers
    const addPaymentMethod = () => {
        setPaymentMethods([...paymentMethods, { name: '', iconImage: '', sortOrder: paymentMethods.length, isActive: true }]);
    };

    const updatePaymentMethod = (index, field, value) => {
        const updated = [...paymentMethods];
        updated[index] = { ...updated[index], [field]: value };
        setPaymentMethods(updated);
    };

    const removePaymentMethod = (index) => {
        setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
    };

    const handlePaymentIconUpload = async (index, file) => {
        if (!file) return;

        try {
            setUploadingPaymentId(index);
            
            // Convert file to base64
            const base64Image = await fileToBase64(file);
            
            // Send to backend
            const response = await api.post('/footer/upload', {
                image: base64Image,
                name: file.name
            });

            updatePaymentMethod(index, 'iconImage', response.data.url);
        } catch (err) {
            console.error('Error uploading payment icon:', err);
            alert('Failed to upload image');
        } finally {
            setUploadingPaymentId(null);
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
                    Footer Management
                </h1>
                <p className="text-gray-600 mt-1">Manage footer content, contact details, social icons, and payment methods</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    Footer settings saved successfully!
                </div>
            )}

            <div className="space-y-8">
                {/* Brand Section */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900">Brand Section</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={brandDescription}
                                onChange={(e) => setBrandDescription(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                                placeholder="Brand description..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Social Icons Title</label>
                            <input
                                type="text"
                                value={socialTitle}
                                onChange={(e) => setSocialTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                                placeholder="e.g., Connect with us"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-[#a67c52]" />
                            Contact Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                            <input
                                type="text"
                                value={contactTitle}
                                onChange={(e) => setContactTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                                placeholder="e.g., Quick contact"
                            />
                        </div>

                        <div className="space-y-3">
                            {contactItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                    <select
                                        value={item.icon}
                                        onChange={(e) => updateContactItem(index, 'icon', e.target.value)}
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] text-sm"
                                    >
                                        {ICON_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateContactItem(index, 'label', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] text-sm"
                                        placeholder="Label"
                                    />
                                    <input
                                        type="text"
                                        value={item.value}
                                        onChange={(e) => updateContactItem(index, 'value', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] text-sm"
                                        placeholder="Value (email/phone/address)"
                                    />
                                    <select
                                        value={item.type}
                                        onChange={(e) => updateContactItem(index, 'type', e.target.value)}
                                        className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] text-sm"
                                    >
                                        <option value="email">Email</option>
                                        <option value="phone">Phone</option>
                                        <option value="address">Address</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={item.isActive}
                                            onChange={(e) => updateContactItem(index, 'isActive', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#a67c52] focus:ring-[#a67c52]"
                                        />
                                        <span className="text-sm text-gray-600">Active</span>
                                    </label>
                                    <button
                                        onClick={() => removeContactItem(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addContactItem}
                            className="mt-4 flex items-center gap-2 px-4 py-2 text-[#a67c52] hover:bg-[#a67c52]/10 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Contact Item
                        </button>
                    </div>
                </div>

                {/* Social Icons */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Facebook className="w-5 h-5 text-[#a67c52]" />
                            Social Media Icons
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {socialIcons.map((icon, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Icon #{index + 1}</span>
                                        <button
                                            onClick={() => removeSocialIcon(index)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Icon Image Upload */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Icon Image</label>
                                        <div className="flex items-center gap-2">
                                            {icon.iconImage ? (
                                                <img
                                                    src={icon.iconImage}
                                                    alt={icon.name}
                                                    className="w-10 h-10 object-contain bg-white rounded p-1"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                                    <Image className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                            <label className="flex-1 cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleSocialIconUpload(index, e.target.files[0])}
                                                    className="hidden"
                                                />
                                                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                                    {uploadingSocialId === index ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4" />
                                                    )}
                                                    <span>{icon.iconImage ? 'Change' : 'Upload'}</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={icon.name}
                                            onChange={(e) => updateSocialIcon(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] text-sm"
                                            placeholder="e.g., Facebook"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            <Link2 className="w-3 h-3" />
                                            URL
                                        </label>
                                        <input
                                            type="text"
                                            value={icon.url}
                                            onChange={(e) => updateSocialIcon(index, 'url', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] text-sm"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={icon.isActive}
                                            onChange={(e) => updateSocialIcon(index, 'isActive', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#a67c52] focus:ring-[#a67c52]"
                                        />
                                        <span className="text-sm text-gray-600">Active</span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addSocialIcon}
                            className="mt-4 flex items-center gap-2 px-4 py-2 text-[#a67c52] hover:bg-[#a67c52]/10 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Social Icon
                        </button>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Image className="w-5 h-5 text-[#a67c52]" />
                            Payment Methods
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paymentMethods.map((method, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Method #{index + 1}</span>
                                        <button
                                            onClick={() => removePaymentMethod(index)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Icon Image Upload */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Payment Icon</label>
                                        <div className="flex items-center gap-2">
                                            {method.iconImage ? (
                                                <img
                                                    src={method.iconImage}
                                                    alt={method.name}
                                                    className="w-12 h-8 object-contain bg-white rounded p-1"
                                                />
                                            ) : (
                                                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                    <Image className="w-4 h-4 text-gray-400" />
                                                </div>
                                            )}
                                            <label className="flex-1 cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handlePaymentIconUpload(index, e.target.files[0])}
                                                    className="hidden"
                                                />
                                                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                                    {uploadingPaymentId === index ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4" />
                                                    )}
                                                    <span>{method.iconImage ? 'Change' : 'Upload'}</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={method.name}
                                            onChange={(e) => updatePaymentMethod(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] text-sm"
                                            placeholder="e.g., Visa"
                                        />
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={method.isActive}
                                            onChange={(e) => updatePaymentMethod(index, 'isActive', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#a67c52] focus:ring-[#a67c52]"
                                        />
                                        <span className="text-sm text-gray-600">Active</span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addPaymentMethod}
                            className="mt-4 flex items-center gap-2 px-4 py-2 text-[#a67c52] hover:bg-[#a67c52]/10 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Payment Method
                        </button>
                    </div>
                </div>

                {/* Copyright */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900">Copyright</h2>
                    </div>
                    <div className="p-6">
                        <input
                            type="text"
                            value={copyright}
                            onChange={(e) => setCopyright(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                            placeholder="© Copyright..."
                        />
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
