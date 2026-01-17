import api from "../../api";
import { useState, useEffect } from 'react'
import { FiMapPin, FiStar } from 'react-icons/fi'

export default function TopActivitiesSection() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [leftCards, setLeftCards] = useState([]);
    const [carouselItems, setCarouselItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTopActivities = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/activities'); // Fetching all activities and filtering/slicing for top ones
                const allActivities = response.data || [];

                // Simulate "top" by slicing or use a specific endpoint if available
                setLeftCards(allActivities.slice(0, 2).map(act => ({
                    id: act._id,
                    badge: act.isInternational ? 'International' : '',
                    title: act.title,
                    subtitle: act.summary || act.description?.substring(0, 50),
                    image: act.images?.[0] || act.image || '/assets/activity1.jpeg'
                })));

                setCarouselItems(allActivities.slice(2, 7).map(act => ({
                    id: act._id,
                    title: act.title,
                    image: act.images?.[0] || act.image || '/assets/activity3.jpeg',
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

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (carouselItems.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % carouselItems.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [carouselItems.length])

    if (isLoading) {
        return (
            <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-20 bg-[#E8DED0]">
                <div className="max-w-[1200px] mx-auto text-center text-slate-500">Loading top activities...</div>
            </section>
        );
    }

    const handleNext = () => {
        setActiveIndex((current) => (current + 1) % carouselItems.length)
    }

    const handlePrev = () => {
        setActiveIndex((current) => (current - 1 + carouselItems.length) % carouselItems.length)
    }

    const activeItem = carouselItems[activeIndex]

    return (
        <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-20 bg-[#E8DED0]">
            <div className="max-w-[1200px] mx-auto">
                <h2 className="text-xl sm:text-2xl tracking-wide font-bold text-slate-900 mb-8">TOP ACTIVITIES</h2>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6">
                    <div className="flex flex-col gap-4">
                        {leftCards.map((card) => (
                            <article key={card.id} className="relative h-56 sm:h-[210px] rounded-2xl overflow-hidden shadow-lg cursor-pointer">
                                <div
                                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform hover:scale-105 duration-700"
                                    style={{ backgroundImage: `url(${card.image})` }}
                                />
                                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                                    {card.badge && <span className="inline-block mb-2 self-start py-1 px-3 rounded-md bg-teal-500 text-white text-xs font-medium">{card.badge}</span>}
                                    <h3 className="m-0 mb-1.5 text-xl font-bold text-white">{card.title}</h3>
                                    <p className="m-0 text-sm text-slate-200">{card.subtitle}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <article className="relative h-[360px] md:h-[430px] rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                        {carouselItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            >
                                <div
                                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                />
                                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                                    <div></div>

                                    <div className="w-full">
                                        <h3 className="m-0 mb-3 text-2xl font-bold text-white transform transition-transform duration-500 translate-y-0">{item.title}</h3>

                                        <div className="flex flex-col gap-1.5 mb-4">
                                            <div className="flex items-center gap-2 text-white">
                                                <FiMapPin size={16} />
                                                <span className="text-sm">{item.available}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white">
                                                <FiStar size={16} />
                                                <span className="text-sm">{item.reviews}</span>
                                            </div>
                                        </div>

                                        <div className="w-full flex items-center justify-between">
                                            <div className="flex gap-2">
                                                {carouselItems.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setActiveIndex(idx)}
                                                        className={`h-1 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-8 bg-white' : 'w-4 bg-white/50 hover:bg-white/70'}`}
                                                        aria-label={`Go to slide ${idx + 1}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex gap-2 z-20">
                                                <button
                                                    onClick={handlePrev}
                                                    className="w-9 h-9 rounded-full bg-white text-slate-900 text-base flex items-center justify-center shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
                                                    aria-label="Previous slide"
                                                >
                                                    ←
                                                </button>
                                                <button
                                                    onClick={handleNext}
                                                    className="w-9 h-9 rounded-full bg-white text-slate-900 text-base flex items-center justify-center shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
                                                    aria-label="Next slide"
                                                >
                                                    →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </article>
                </div>
            </div>
        </section>
    )
}
