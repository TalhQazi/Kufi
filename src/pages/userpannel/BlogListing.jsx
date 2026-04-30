import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiGlobe, FiCalendar, FiUser } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import api from '../../api';

export default function BlogListing({ onBack, onHomeClick, onBlogClick }) {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await api.get('/blogs');
                setBlogs(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-10 w-10 animate-spin text-[#A67C52]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-inter text-slate-900">
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
            <main className="pt-32 pb-20 px-4 md:px-8 max-w-[1240px] mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Discover travel tips, destination guides, and stories from around the world to inspire your next adventure.
                    </p>
                </div>

                {blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <article 
                                key={blog._id} 
                                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                                onClick={() => onBlogClick(blog._id)}
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img 
                                        src={blog.image || blog.imageUrl || '/assets/placeholder-blog.jpg'} 
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[#A67C52] text-xs font-bold uppercase tracking-wider">
                                            {blog.category || 'Travel'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                                        <div className="flex items-center gap-1">
                                            <FiCalendar size={14} />
                                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FiUser size={14} />
                                            <span>{blog.author || 'Admin'}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-[#A67C52] transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-1">
                                        {blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
                                    </p>
                                    
                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-sm font-bold text-[#A67C52] group-hover:underline">Read More</span>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#A67C52] group-hover:text-white transition-all">
                                            <FiArrowLeft size={16} className="rotate-180" />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 italic">No blog posts found.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
