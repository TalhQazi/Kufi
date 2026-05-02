import { useEffect, useState, useCallback } from 'react';
import api from '../../api';
import { Layout, Eye, EyeOff, Save, Loader2, RefreshCw, Home, Map, Layers, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function SectionVisibilityController() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const [sections, setSections] = useState([]);
    const [activeTab, setActiveTab] = useState('home');
    const [expandedSection, setExpandedSection] = useState(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/sections');
            const data = response.data;
            
            if (data.sections) {
                setSections(data.sections);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching section visibility:', err);
            setError('Failed to load section visibility settings');
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

            await api.put('/sections', { sections });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving section visibility:', err);
            setError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('Are you sure you want to reset all sections to default? This cannot be undone.')) {
            return;
        }

        try {
            setResetting(true);
            setSuccess(false);

            await api.post('/sections/reset');
            await fetchSettings();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error resetting section visibility:', err);
            setError('Failed to reset settings');
        } finally {
            setResetting(false);
        }
    };

    const toggleSection = (sectionId) => {
        setSections(sections.map(section => 
            section.id === sectionId 
                ? { ...section, isVisible: !section.isVisible }
                : section
        ));
    };

    const updateSectionText = (sectionId, field, value) => {
        setSections(sections.map(section =>
            section.id === sectionId
                ? { ...section, [field]: value }
                : section
        ));
    };

    const getFilteredSections = () => {
        return sections
            .filter(s => s.page === activeTab)
            .sort((a, b) => a.sortOrder - b.sortOrder);
    };

    const getPageIcon = (page) => {
        switch (page) {
            case 'home': return <Home className="w-5 h-5" />;
            case 'country': return <Map className="w-5 h-5" />;
            default: return <Layers className="w-5 h-5" />;
        }
    };

    const getPageTitle = (page) => {
        switch (page) {
            case 'home': return 'Home Page';
            case 'country': return 'Country Details Page';
            default: return page;
        }
    };

    const tabs = ['home', 'country'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#a67c52]" />
            </div>
        );
    }

    const filteredSections = getFilteredSections();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Layout className="w-7 h-7 text-[#a67c52]" />
                    Section Visibility Control
                </h1>
                <p className="text-gray-600 mt-1">
                    Show or hide sections on your website pages, and customize their titles and text. Hidden sections will not be visible to visitors.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Settings saved successfully!
                </div>
            )}

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                activeTab === tab
                                    ? 'text-[#a67c52] border-b-2 border-[#a67c52]'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {getPageIcon(tab)}
                            {getPageTitle(tab)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sections List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        {getPageIcon(activeTab)}
                        {getPageTitle(activeTab)} Sections
                    </h2>
                    <span className="text-sm text-gray-500">
                        {filteredSections.filter(s => s.isVisible).length} of {filteredSections.length} visible
                    </span>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {filteredSections.map((section) => (
                        <div key={section.id} className="flex flex-col">
                            <div 
                                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                                    !section.isVisible ? 'bg-gray-50/50' : ''
                                }`}
                            >
                                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        section.isVisible 
                                            ? 'bg-[#a67c52]/10 text-[#a67c52]' 
                                            : 'bg-gray-200 text-gray-400'
                                    }`}>
                                        <span className="text-sm font-bold">{section.sortOrder + 1}</span>
                                    </div>
                                    <div>
                                        <h3 className={`font-medium flex items-center gap-2 ${
                                            section.isVisible ? 'text-gray-900' : 'text-gray-500'
                                        }`}>
                                            {section.name}
                                            {expandedSection === section.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </h3>
                                        <p className="text-sm text-gray-500">{section.description}</p>
                                        <span className="text-xs text-gray-400 mt-1 inline-block">
                                            ID: {section.id}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleSection(section.id); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        section.isVisible
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                    }`}
                                >
                                    {section.isVisible ? (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            <span>Visible</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-4 h-4" />
                                            <span>Hidden</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {/* Expanded Text Fields */}
                            {expandedSection === section.id && (
                                <div className="p-4 bg-gray-50 border-t border-gray-100 pl-16">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                                            <input 
                                                type="text" 
                                                value={section.title || ''} 
                                                onChange={(e) => updateSectionText(section.id, 'title', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a67c52] focus:border-[#a67c52]"
                                                placeholder="e.g. Top Categories"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Section Heading</label>
                                            <input 
                                                type="text" 
                                                value={section.heading || ''} 
                                                onChange={(e) => updateSectionText(section.id, 'heading', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a67c52] focus:border-[#a67c52]"
                                                placeholder="e.g. Explore By Categories"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Section Subheading / Description</label>
                                            <textarea 
                                                value={section.subheading || ''} 
                                                onChange={(e) => updateSectionText(section.id, 'subheading', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#a67c52] focus:border-[#a67c52]"
                                                rows="2"
                                                placeholder="e.g. Select according to your interest to check..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                    {resetting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    Reset to Defaults
                </button>

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
    );
}
