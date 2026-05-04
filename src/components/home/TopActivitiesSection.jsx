import api from "../../api";
import { useState, useEffect } from 'react'
import { FiMapPin, FiStar } from 'react-icons/fi'

/**
 * TopActivitiesSection - Displays a mix of static cards and an auto-rotating carousel
 * of the most popular activities.
 * 
 * Fixes included:
 * 1. Filtered only 'approved' activities.
 * 2. Robust image fallback logic.
 * 3. Smooth, glitch-free carousel transitions.
 * 4. Conditional rendering to prevent empty UI states.
 */
export default function TopActivitiesSection({ onActivityClick }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [leftCards, setLeftCards] = useState([]);
    const [carouselItems, setCarouselItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTopActivities = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/activities');
                
                // Only show approved activities to ensure quality data
                const allActivities = (Array.isArray(response.data) ? response.data : [])
                    .filter((a) => a?.status === 'approved');

                // Utility for prioritized image selection
                const getImage = (act, fallback) => {
                    return (act.images && act.images.length > 0 ? act.images[0] : null)
                        || act.image
                        || fallback;
                };

                // Setup static left-side cards (first 2)
                setLeftCards(allActivities.slice(0, 2).map(act => ({
                    id: act._id,
                    badge: act.isInternational ? 'International' : '',
                    title: act.title || 'Untitled Activity',
                    subtitle: act.summary || act.description?.substring(0, 60) || '',
                    image: getImage(act, '/assets/activity1.jpeg')
                })));

                // Setup carousel items (next 5)
                setCarouselItems(allActivities.slice(2, 7).map(act => ({
                    id: act._id,
                    title: act.title || 'Untitled Activity',
                    image: getImage(act, '/assets/activity3.jpeg'),
                    available: `${act.availability || 0} available`,
                    reviews: `${act.rating || 0} (${act.reviewsCount || 0} Reviews)`
                })));
            } catch (error) {
                console.error("Error fetching top activities:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopActivities();
    }, []);

    // Auto-rotate every 5 seconds with pause capability potential
    useEffect(() => {
        if (carouselItems.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % carouselItems.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [carouselItems.length])

    if (isLoading) {
        return (
            <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-20 bg-[#E8DED0]">
                <div className="max-w-[1200px] mx-auto text-center text-slate-500 animate-pulse">
                    Loading top activities...
                </div>
            </section>
        );
    }

    // Guard: Don't render section if there's no approved data
    if (leftCards.length === 0 && carouselItems.length === 0) {
        return null;
    }

    const handleNext = () => {
        if (carouselItems.length === 0) return;
        setActiveIndex((current) => (current + 1) % carouselItems.length)
    }

    const handlePrev = () => {
        if (carouselItems.length === 0) return;
        setActiveIndex((current) => (current - 1 + carouselItems.length) % carouselItems.length)
    }

    const activeItem = carouselItems[activeIndex]

    return (
        <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-20 bg-[#E8DED0]">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl sm:text-2xl tracking-wide font-bold text-slate-900">TOP ACTIVITIES</h2>
                    <div className="h-0.5 flex-1 bg-slate-900/10 ml-6 hidden sm:block" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6">
                    {/* Left Column: Static Cards */}
                    <div className="flex flex-col gap-4">
                        {leftCards.map((card) => (
                            <article
                                key={card.id}
                                className="relative h-56 sm:h-[210px] rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                                onClick={() => onActivityClick && onActivityClick(card.id)}
                            >
                                <div className="absolute inset-0 w-full h-full overflow-hidden">
                                    <img 
                                        src={card.image} 
                                        alt={card.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </div>
                                <div className="absolute inset-0 flex flex-col justify-end p-6">
                                    {card.badge && (
                                        <span className="inline-block mb-2 self-start py-1 px-3 rounded-md bg-teal-500 text-white text-[10px] uppercase tracking-wider font-bold">
                                            {card.badge}
                                        </span>
                                    )}
                                    <h3 className="m-0 mb-1.5 text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="m-0 text-sm text-slate-200 line-clamp-1">
                                        {card.subtitle}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Right Column: Refactored Glitch-Free Carousel */}
                    {carouselItems.length > 0 && (
                        <article
                            className="relative h-[360px] md:h-[436px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer bg-slate-200"
                            onClick={() => onActivityClick && activeItem?.id && onActivityClick(activeItem.id)}
                        >
                            {/* Slides Layer - Images Cross-fade */}
                            <div className="absolute inset-0">
                                {carouselItems.map((item, index) => (
                                    <div
                                        key={`slide-${item.id}`}
                                        className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                                            index === activeIndex 
                                                ? 'opacity-100 scale-100 z-10' 
                                                : 'opacity-0 scale-105 z-0 pointer-events-none'
                                        }`}
                                    >
                                        <img 
                                            src={item.image} 
                                            alt={item.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                    </div>
                                ))}
                            </div>

                            {/* Content Layer - Robust text rendering to prevent overlapping */}
                            <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-10">
                                <div /> {/* Top Spacer */}

                                <div className="w-full">
                                    <div className="relative min-h-[140px]">
                                        {carouselItems.map((item, index) => (
                                            <div 
                                                key={`text-${item.id}`}
                                                className={`transition-all duration-700 ease-out ${
                                                    index === activeIndex 
                                                        ? 'opacity-100 translate-y-0 relative' 
                                                        : 'opacity-0 translate-y-8 absolute inset-0 pointer-events-none'
                                                }`}
                                            >
                                                <h3 className="m-0 mb-4 text-2xl md:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                                                    {item.title}
                                                </h3>

                                                <div className="flex flex-wrap gap-5 mb-2">
                                                    <div className="flex items-center gap-2 text-slate-100">
                                                        <FiMapPin size={18} className="text-teal-400" />
                                                        <span className="text-sm font-semibold tracking-wide uppercase">{item.available}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-100">
                                                        <FiStar size={18} className="text-yellow-400" />
                                                        <span className="text-sm font-semibold tracking-wide uppercase">{item.reviews}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Carousel UI Controls */}
                                    <div className="w-full flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                                        <div className="flex gap-3">
                                            {carouselItems.map((_, idx) => (
                                                <button
                                                    key={`dot-${idx}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setActiveIndex(idx)
                                                    }}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                        idx === activeIndex 
                                                            ? 'w-12 bg-white' 
                                                            : 'w-4 bg-white/30 hover:bg-white/50'
                                                    }`}
                                                    aria-label={`Go to slide ${idx + 1}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handlePrev()
                                                }}
                                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all cursor-pointer group shadow-xl"
                                                aria-label="Previous slide"
                                            >
                                                <span className="text-2xl leading-none transform group-hover:-translate-x-1 transition-transform">←</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleNext()
                                                }}
                                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all cursor-pointer group shadow-xl"
                                                aria-label="Next slide"
                                            >
                                                <span className="text-2xl leading-none transform group-hover:translate-x-1 transition-transform">→</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    )}
                </div>
            </div>
        </section>
    )
}
