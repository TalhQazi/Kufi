import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiGlobe } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import api from '../../api';

export default function About({ onBack, onHomeClick }) {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAboutContent = async () => {
            try {
                setLoading(true);
                const response = await api.get('/legal-content/about');
                setContent(response.data);
            } catch (error) {
                console.error('Error fetching about content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutContent();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-10 w-10 animate-spin text-[#A67C52]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-inter">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 px-4 md:px-8 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-[#A67C52] transition-colors font-medium"
                >
                    <FiArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <button
                    onClick={onHomeClick}
                    className="h-10 w-20 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
                </button>

                <div className="flex items-center gap-2 text-slate-600">
                    <FiGlobe size={20} />
                    <span className="font-medium text-sm">EN</span>
                </div>
            </header>

            {/* Content */}
            <main className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 text-center">
                    {content?.title || 'About Us'}
                </h1>

                <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed">
                    {content?.content ? (
                        <div dangerouslySetInnerHTML={{ __html: content.content }} />
                    ) : (
                        <p className="text-center italic text-slate-400">
                            No content available at the moment.
                        </p>
                    )}
                </div>

                <div className="mt-16 p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                    <p className="text-slate-600">
                        At Kufi Travel, we believe every journey should be as unique as the traveler. Our mission is to bridge the gap between dream destinations and reality through seamless technology and curated experiences.
                    </p>
                </div>
            </main>
        </div>
    );
}
