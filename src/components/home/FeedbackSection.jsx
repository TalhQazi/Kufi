import api from "../../api";
import { useState, useRef, useEffect } from 'react';

export default function FeedbackSection() {
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftState, setScrollLeftState] = useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeftState(scrollRef.current.scrollLeft);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        scrollRef.current.scrollLeft = scrollLeftState - walk;
    };

    const [feedbackItems, setFeedbackItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/feedbacks');
                setFeedbackItems(response.data || []);
            } catch (error) {
                console.error("Error fetching feedbacks:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);

    // Triple the items for infinite loop logic
    const loopedItems = [...feedbackItems, ...feedbackItems, ...feedbackItems];

    const fallbackReviews = [
        {
            id: 'fallback-1',
            text: 'Amazing experience! Everything was perfectly organized and the itinerary was exactly what we wanted.',
            name: 'Ayesha Khan',
            nameLabel: 'TRAVELER',
            avatar: '/assets/girl1.jif',
        },
        {
            id: 'fallback-2',
            text: 'Support team was super responsive. Booking was smooth and the recommendations were spot on.',
            name: 'Hassan Ali',
            nameLabel: 'CLIENT',
            avatar: '/assets/boy1.jif',
        },
        {
            id: 'fallback-3',
            text: 'Loved the destinations and activities. Great value for money and a very premium feel overall.',
            name: 'Sara Ahmed',
            nameLabel: 'TRAVELER',
            avatar: '/assets/girl2.jif',
        },
        {
            id: 'fallback-4',
            text: 'We had a wonderful family trip. Everything was planned nicely and we felt taken care of throughout.',
            name: 'Usman Riaz',
            nameLabel: 'CLIENT',
            avatar: '/assets/boy2.jif',
        },
    ];

    const rightSideReviews = (Array.isArray(feedbackItems) && feedbackItems.length > 0 ? feedbackItems : fallbackReviews)
        .slice(0, 4)
        .map((item) => ({
            id: item?._id || item?.id,
            text: item?.text || item?.message || item?.feedback || item?.comment || '',
            name: item?.name || item?.author || item?.userName || 'Client',
            nameLabel: item?.nameLabel || item?.role || 'CLIENT',
            avatar: item?.avatar || item?.image || item?.profileImage || '/assets/profile-avatar.jpeg',
            rating: Number(item?.rating) || 5,
        }));

    // Handle Infinite Scroll Loop Positioning
    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const singleSectionWidth = container.scrollWidth / 3;
            // Shift to the middle section and add a slight offset to center the first card on the picture
            const offset = 50; // Fine-tune this based on desired overlap
            container.scrollLeft = singleSectionWidth - offset;
        }
    }, []);

    const handleScroll = () => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const singleSectionWidth = container.scrollWidth / 3;

            if (container.scrollLeft <= 0) {
                // Jump to the start of the second section
                container.scrollLeft = singleSectionWidth;
            } else if (container.scrollLeft >= singleSectionWidth * 2) {
                // Jump back to the start of the second section
                container.scrollLeft = singleSectionWidth;
            }
        }
    };

    return (
        <section className="bg-white py-24 px-4 sm:px-8 lg:px-20 relative overflow-hidden">
            {/* Background Organic Blob */}
            <div className="absolute right-[-5%] bottom-[-5%] w-[60%] h-[80%] pointer-events-none z-0">
                <svg
                    viewBox="0 0 800 600"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full opacity-[0.8]"
                    preserveAspectRatio="xMaxYMax meet"
                >
                    <path
                        d="M740 400C740 510.457 650.457 600 540 600C429.543 600 200 600 100 500C0 400 0 300 100 200C200 100 300 0 450 0C600 0 740 289.543 740 400Z"
                        fill="#D3C7B9"
                    />
                </svg>
            </div>

            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Header Section */}
                <div className="mb-16 relative flex flex-col md:flex-row justify-between items-start md:items-center px-4">
                    <div className="relative">
                        <p className="text-[#9BB098] text-xs font-bold uppercase tracking-[0.3em] mb-3">WHAT THEY SAY</p>
                        <h2 className="text-4xl lg:text-5xl font-bold text-[#353935] m-0">
                            Best Feedback From Clients
                        </h2>

                        <div className="hidden lg:block absolute -top-4 left-[60%] opacity-20 transform translate-x-12">
                            <div className="grid grid-cols-6 gap-2">
                                {[...Array(24)].map((_, i) => (
                                    <div key={i} className="w-1 h-1 rounded-full bg-slate-400"></div>
                                ))}
                            </div>
                        </div>
                    </div>


                </div>

                {/* Feedback Content with Constant Picture */}
                <div className="flex flex-col lg:flex-row items-start gap-10">

                    {/* Constant Image - Stays static on the left */}
                    <div className="flex-shrink-0 relative z-0">
                        <div className="w-full sm:min-w-[450px] sm:w-[500px] aspect-[4/3] rounded-[32px] overflow-hidden shadow-lg">
                            <img
                                src="/assets/feedback.jpeg"
                                alt="Featured feedback"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Right Side Reviews */}
                    <div className="w-full lg:flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                            {rightSideReviews.map((item) => (
                                <div key={item.id} className="bg-white rounded-[28px] p-6 shadow-xl border border-white">
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={item.avatar}
                                                alt={item.name}
                                                className="w-10 h-10 rounded-[14px] object-cover"
                                                onError={(e) => { e.target.src = '/assets/profile-avatar.jpeg' }}
                                            />
                                            <div className="min-w-0">
                                                <h4 className="m-0 text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                                                <p className="m-0 text-[10px] text-[#A8B9A6] font-bold uppercase tracking-widest leading-none mt-1 truncate">{item.nameLabel}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 text-[#FFB21E] shrink-0">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${i < item.rating ? 'fill-current' : 'fill-slate-200'}`}
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="m-0 text-slate-600 text-sm leading-relaxed">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {isLoading && (
                            <div className="mt-6 text-sm text-slate-400">
                                Loading reviews...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
