import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Loader2, Save, AlertCircle, CheckCircle, Scale, FileText, HelpCircle, MessageSquare } from 'lucide-react';

const contentTypes = [
  { type: 'terms', title: 'Terms & Conditions', icon: FileText, description: 'Terms and conditions for using the platform' },
  { type: 'privacy', title: 'Privacy Policy', icon: Scale, description: 'Privacy policy and data protection information' },
  { type: 'faqs', title: 'FAQs', icon: HelpCircle, description: 'Frequently asked questions' },
  { type: 'support', title: 'Support', icon: MessageSquare, description: 'Support information and contact details' },
  { type: 'about', title: 'About Us', icon: FileText, description: 'About Us page content' },
];

export default function LegalContentController({ darkMode }) {
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('terms');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/legal-content');
      const contentMap = {};
      response.data.forEach(item => {
        contentMap[item.type] = item;
      });
      setContents(contentMap);
    } catch (error) {
      console.error('Error fetching legal content:', error);
      setMessage({ type: 'error', text: 'Failed to load content' });
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (type, field, value) => {
    setContents(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const currentContent = contents[activeTab];
      await api.put(`/legal-content/${activeTab}`, {
        title: currentContent.title,
        content: currentContent.content,
        isActive: currentContent.isActive
      });

      setMessage({ type: 'success', text: 'Content saved successfully!' });
      setHasChanges(false);
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setMessage({ type: 'error', text: 'Failed to save content' });
    } finally {
      setSaving(false);
    }
  };

  const currentContent = contents[activeTab] || { title: '', content: '', isActive: true };
  const ActiveIcon = contentTypes.find(t => t.type === activeTab)?.icon || FileText;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className={`h-8 w-8 animate-spin ${darkMode ? 'text-blue-400' : 'text-[#704b24]'}`} />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Legal Content Management
          </h1>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage Terms, Privacy Policy, FAQs, and Support content
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className={`text-sm ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
              saving ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
            } ${darkMode ? 'bg-blue-600' : 'bg-[#704b24]'}`}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'error' 
            ? (darkMode ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-red-50 text-red-600 border border-red-200')
            : (darkMode ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-50 text-green-600 border border-green-200')
        }`}>
          {message.type === 'error' ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className={`flex flex-wrap gap-2 p-1 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {contentTypes.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.type;
          return (
            <button
              key={item.type}
              onClick={() => setActiveTab(item.type)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? (darkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-[#704b24] shadow-sm')
                  : (darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200')
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </button>
          );
        })}
      </div>

      {/* Content Editor */}
      <div className={`rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-6`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-[#704b24]/10'}`}>
            <ActiveIcon className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-[#704b24]'}`} />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {contentTypes.find(t => t.type === activeTab)?.title}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {contentTypes.find(t => t.type === activeTab)?.description}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Title
            </label>
            <input
              type="text"
              value={currentContent.title || ''}
              onChange={(e) => handleContentChange(activeTab, 'title', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-[#704b24] focus:border-[#704b24]'
              }`}
              placeholder="Enter title..."
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleContentChange(activeTab, 'isActive', !currentContent.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentContent.isActive
                  ? (darkMode ? 'bg-blue-600' : 'bg-[#704b24]')
                  : (darkMode ? 'bg-gray-700' : 'bg-gray-300')
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentContent.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentContent.isActive ? 'Active (visible to users)' : 'Inactive (hidden from users)'}
            </span>
          </div>

          {/* Content Editor */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Content
            </label>
            <textarea
              value={currentContent.content || ''}
              onChange={(e) => handleContentChange(activeTab, 'content', e.target.value)}
              rows={15}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-opacity-50 transition-colors text-sm ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-[#704b24] focus:border-[#704b24]'
              }`}
              placeholder="Enter your content here..."
            />
            <p className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Plain text only. Use line breaks to separate paragraphs.
            </p>
          </div>

          {/* Preview Section */}
          <div className={`border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} pt-6`}>
            <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Preview
            </h3>
            <div 
              className={`p-4 rounded-lg prose prose-sm max-w-none ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'}`}
              dangerouslySetInnerHTML={{ 
                __html: currentContent.content || '<p class="text-gray-400 italic">No content to preview</p>' 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
