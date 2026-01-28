import api from "../../api";
import React, { useState, useEffect } from 'react'

export default function BlogSection({ onBlogClick }) {
    const [blogData, setBlogData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [startIndex, setStartIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/blogs');
                setBlogData(response.data || []);
            } catch (error) {
                console.error("Error fetching blogs:", error);
                // Fallback blogs to prevent empty UI
                setBlogData([
                    { id: 1, title: 'Travel Experience', subtitle: 'ADVENTURE', image: '/assets/blog1.jpeg' },
                    { id: 2, title: 'Mountain Path', subtitle: 'NATURE', image: '/assets/blog2.jpeg' },
                    { id: 3, title: 'Ocean View', subtitle: 'BEACH', image: '/assets/blog3.jpeg' },
                    { id: 4, title: 'City Streets', subtitle: 'CULTURE', image: '/assets/blog4.jpeg' }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    // Get the 4 visible blogs based on current start index
    const visibleBlogs = blogData.length > 0 ? [
        blogData[startIndex % blogData.length],
        blogData[(startIndex + 1) % blogData.length],
        blogData[(startIndex + 2) % blogData.length],
        blogData[(startIndex + 3) % blogData.length]
    ] : [];

    // Auto-rotate every 4 seconds
    useEffect(() => {
        if (isPaused || blogData.length === 0) return

        const interval = setInterval(() => {
            setStartIndex((current) => (current + 1) % blogData.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [isPaused, blogData.length])

    const handleNext = () => {
        if (blogData.length === 0) return;
        setStartIndex((current) => (current + 1) % blogData.length)
    }

    const handlePrev = () => {
        if (blogData.length === 0) return;
        setStartIndex((current) => (current - 1 + blogData.length) % blogData.length)
    }

    if (isLoading) {
        return (
            <section className="bg-white py-16 sm:py-24 px-4 sm:px-8 lg:px-20">
                <div className="max-w-[1240px] mx-auto text-center text-gray-400">Loading blogs...</div>
            </section>
        );
    }

    return (
        <section
            className="bg-white py-16 sm:py-24 px-4 sm:px-8 lg:px-20"
            id="blog"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-[1240px] mx-auto">
                <div className="text-center mb-12">
                    <p className="font-['Sacramento'] text-3xl sm:text-4xl text-slate-500 mb-2">Roaming Tales</p>
                    <h2 className="text-3xl sm:text-[40px] font-bold text-slate-900 m-0">
                        Latest Travel Blog
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500">
                    {visibleBlogs.filter(Boolean).map((item, index) => (
                        <article
                            key={`${item.id}-${index}-${startIndex}`}
                            className="relative rounded-2xl overflow-hidden h-80 sm:h-[420px] group cursor-pointer shadow-lg animate-fadeIn"
                            onClick={() => {
                                const id = item?._id || item?.id
                                if (id && onBlogClick) onBlogClick(id)
                            }}
                        >
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${item.image || item.imageUrl || '/assets/blog1.jpeg'})` }}
                            />
                            {/* Dark gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                <p className="m-0 mb-2 text-xs font-semibold text-slate-300 uppercase tracking-widest opacity-90">
                                    {item.subtitle}
                                </p>
                                <h3 className="m-0 mb-4 text-2xl font-bold text-white leading-tight drop-shadow-sm">
                                    {item.title}
                                </h3>
                                {item.hasButton && (
                                    <button className="self-start mt-1 px-8 py-2.5 rounded-full bg-[#A67C52] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8e6a45] transition-colors shadow-lg">
                                        Read More
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <div className="flex justify-center items-center gap-4 mt-16">
                    <button
                        onClick={handlePrev}
                        className="w-12 h-12 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
                        aria-label="Previous blog post"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-12 h-12 rounded-full bg-[#A67C52] text-white flex items-center justify-center hover:bg-[#8e6a45] shadow-lg transition-transform hover:scale-105 active:scale-95"
                        aria-label="Next blog post"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    )
}
