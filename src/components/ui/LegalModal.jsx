import React from 'react'
import { X, Loader2 } from 'lucide-react'

const LegalModal = ({ isOpen, onClose, title, content, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-3xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#704b24] to-[#8f643e]">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#704b24]" />
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                            {content || 'No content available'}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-[#704b24] hover:bg-[#8f643e] text-white rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalModal;
