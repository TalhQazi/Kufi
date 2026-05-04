import api from "../../api";
import { useState, useEffect } from 'react'
import { FiMapPin, FiStar } from 'react-icons/fi'

/**
 * TopActivitiesSection - Guaranteed visibility version.
 * Always renders on the main page with API data or high-quality fallbacks.
 */
export default function TopActivitiesSection({ onActivityClick }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [leftCards, setLeftCards] = useState([]);
    const [carouselItems, setCarouselItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // High-quality sample data to ensure the section is never empty
    const SAMPLE_ACTIVITIES = [
        { id: 's1', title: 'Raouche Rocks Exploration', subtitle: 'Experience the iconic Pigeon Rocks in Beirut', image: '/assets/activity1.jpeg', available: 'Daily', reviews: '4.9 (120 Reviews)', badge: 'Popular' },
        { id: 's2', title: 'Byblos Historic Tour', subtitle: 'Walk through one of the oldest cities in the world', image: '/assets/activity2.jpeg', available: 'Weekend', reviews: '4.8 (85 Reviews)', badge: 'Historical' },
        { id: 's3', title: 'Jeita Grotto Adventure', image: '/assets/activity3.jpeg', available: '5 available', reviews: '5.0 (250 Reviews)' },
        { id: 's4', title: 'Baalbek Temple Complex', image: '/assets/activity4.jpeg', available: '2 available', reviews: '4.9 (180 Reviews)' },
        { id: 's5', title: 'Chouf Cedars Hike', image: '/assets/activity5.jpeg', available: '10 available', reviews: '4.7 (95 Reviews)' }
    ];

    useEffect(() => {
        const fetchTopActivities = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/activities');
                const data = Array.isArray(response.data) ? response.data : [];
                
                // Use all available activities (no strict status filter for now to ensure loading)
                const allActivities = data.length > 0 ? data : [];

                const getImage = (act, fallback) => {
                    return (act.images && act.images.length > 0 ? act.images[0] : null)
                        || act.image
                        || fallback;
                };

                if (allActivities.length >= 2) {
                    setLeftCards(allActivities.slice(0, 2).map(act => ({
                        id: act._id || act.id,
                        badge: act.isInternational ? 'International' : (act.badge || ''),
                        title: act.title || 'Activity',
                        subtitle: act.summary || act.description?.substring(0, 60) || '',
                        image: getImage(act, '/assets/activity1.jpeg')
                    })));
                    
                    const carouselPart = allActivities.slice(2, 7);
                    if (carouselPart.length > 0) {
                        setCarouselItems(carouselPart.map(act => ({
                            id: act._id || act.id,
                            title: act.title || 'Activity',
                            image: getImage(act, '/assets/activity3.jpeg'),
                            available: act.availability ? `${act.availability} available` : 'Inquire for dates',
                            reviews: `${act.rating || 5} (${act.reviewsCount || 0} Reviews)`
                        })));
                    } else {
                        setCarouselItems(SAMPLE_ACTIVITIES.slice(2));
                    }
                } else {
                    // Fallback to samples if API is empty
                    setLeftCards(SAMPLE_ACTIVITIES.slice(0, 2));
                    setCarouselItems(SAMPLE_ACTIVITIES.slice(2));
                }
            } catch (error) {
                console.error("Error fetching top activities:", error);
                // Guaranteed fallback on error
                setLeftCards(SAMPLE_ACTIVITIES.slice(0, 2));
                setCarouselItems(SAMPLE_ACTIVITIES.slice(2));
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopActivities();
    }, []);

    useEffect(() => {
        if (carouselItems.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % carouselItems.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [carouselItems.length])

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
        <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-20 bg-[#E8DED0]" id="top-activities">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl sm:text-2xl tracking-wide font-bold text-slate-900">TOP ACTIVITIES</h2>
                    <div className="h-0.5 flex-1 bg-slate-900/10 ml-6 hidden sm:block" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6">
                    {/* Left Column */}
                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            [1, 2].map(i => (
                                <div key={i} className="h-56 sm:h-[210px] rounded-2xl bg-slate-200 animate-pulse" />
                            ))
                        ) : (
                            leftCards.map((card) => (
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
                            ))
                        )}
                    </div>

                    {/* Right Column: Carousel */}
                    <article
                        className="relative h-[360px] md:h-[436px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer bg-slate-200"
                        onClick={() => onActivityClick && activeItem?.id && onActivityClick(activeItem.id)}
                    >
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-[#A67C52] border-t-transparent rounded-full animate-spin" />
                                    <span className="text-slate-400 font-medium">Fetching Adventures...</span>
                                </div>
                            </div>
                        ) : (
                            <>
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

                                <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-10">
                                    <div /> 
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
                            </>
                        )}
                    </article>
                </div>
            </div>
        </section>
    )
}
