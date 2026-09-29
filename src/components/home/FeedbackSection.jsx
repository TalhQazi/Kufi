import api from "../../api";
import { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function FeedbackSection() {
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const handleMouseDown = (e) => {
        if (!scrollRef.current) return
        setIsDragging(true);
        startXRef.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeftRef.current = scrollRef.current.scrollLeft;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 2;
        scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleTouchStart = (e) => {
        if (!scrollRef.current) return
        const touch = e.touches?.[0]
        if (!touch) return
        startXRef.current = touch.pageX - scrollRef.current.offsetLeft
        scrollLeftRef.current = scrollRef.current.scrollLeft
    }

    const handleTouchMove = (e) => {
        if (!scrollRef.current) return
        const touch = e.touches?.[0]
        if (!touch) return
        const x = touch.pageX - scrollRef.current.offsetLeft
        const walk = (x - startXRef.current) * 1.5
        scrollRef.current.scrollLeft = scrollLeftRef.current - walk
    }

    const [feedbackItems, setFeedbackItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/reviews?type=feedback');
                const reviews = Array.isArray(response.data) ? response.data : [];
                const mappedReviews = reviews.map((review) => ({
                    _id: review._id,
                    text: review.note,
                    name: review.name,
                    nameLabel: review.role,
                    avatar: review.image,
                    rating: review.rating,
                    sortOrder: Number(review.sortOrder) || 0,
                }));
                mappedReviews.sort((a, b) => a.sortOrder - b.sortOrder);
                setFeedbackItems(mappedReviews);
            } catch (error) {
                console.error("Error fetching feedbacks:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);

    const rightSideReviews = (Array.isArray(feedbackItems) ? feedbackItems : [])
        .slice(0, 6)
        .map((item) => ({
            id: item?._id || item?.id,
            text: item?.text || item?.message || item?.feedback || item?.comment || '',
            name: item?.name || item?.author || item?.userName || 'Client',
            nameLabel: item?.nameLabel || item?.role || 'CLIENT',
            avatar: item?.avatar || item?.image || item?.profileImage || '/assets/profile-avatar.jpeg',
            rating: Number(item?.rating) || 5,
        }));

    const updateArrowState = () => {
        const el = scrollRef.current;
        if (!el) {
            setCanScrollLeft(false);
            setCanScrollRight(false);
            return;
        }
        const max = el.scrollWidth - el.clientWidth;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(max > 4 && el.scrollLeft < max - 4);
    };

    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollLeft = 0;
        // Wait a frame so layout/widths settle before measuring overflow.
        const id = window.requestAnimationFrame(updateArrowState);
        return () => window.cancelAnimationFrame(id);
    }, [isLoading, rightSideReviews.length]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateArrowState();
        el.addEventListener('scroll', updateArrowState, { passive: true });
        window.addEventListener('resize', updateArrowState);
        return () => {
            el.removeEventListener('scroll', updateArrowState);
            window.removeEventListener('resize', updateArrowState);
        };
    }, [isLoading, rightSideReviews.length]);

    const scrollByAmount = (amount) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        window.setTimeout(updateArrowState, 350);
    };

    const arrowBtn = (dir) => {
        const isLeft = dir === 'left';
        const enabled = isLeft ? canScrollLeft : canScrollRight;
        // Always show both arrows when there is something to scroll either way,
        // so the right control is never missing on wide screens.
        const show = canScrollLeft || canScrollRight;
        if (!show) return null;
        return (
            <button
                type="button"
                aria-label={isLeft ? 'Previous reviews' : 'Next reviews'}
                disabled={!enabled}
                onClick={() => scrollByAmount(isLeft ? -360 : 360)}
                className={`w-10 h-10 rounded-full border shadow-sm flex items-center justify-center transition-colors ${
                    enabled
                        ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                }`}
            >
                {isLeft ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
            </button>
        );
    };

    return (
        <section className="bg-white py-20 px-4 sm:px-8 lg:px-20 2xl:px-8 min-[2560px]:px-4 relative overflow-visible">
            {/* Background blob clipped in its own layer so arrows are never cut off */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
                <div className="absolute right-[-5%] bottom-[-5%] w-[60%] h-[80%]">
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
            </div>

            <div className="max-w-[1400px] 2xl:max-w-[1800px] mx-auto relative z-10">
                <div className="mb-16 relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 2xl:px-8">
                    <div className="relative">
                        <p className="text-[#9BB098] text-xs font-bold uppercase tracking-[0.3em] mb-3">WHAT THEY SAY</p>
                        <h2 className="text-4xl lg:text-5xl font-bold text-[#353935] m-0">
                            Best Feedback From Clients
                        </h2>
                    </div>

                    {/* Arrows live in the header so they cannot be clipped by the carousel */}
                    {!isLoading && rightSideReviews.length > 0 && (
                        <div className="flex items-center gap-2 shrink-0">
                            {arrowBtn('left')}
                            {arrowBtn('right')}
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row items-start gap-10">
                    <div className="flex-shrink-0 relative z-0 w-full lg:w-auto 2xl:min-w-[520px]">
                        <div className="w-full sm:min-w-[420px] lg:w-[420px] 2xl:w-[520px] 2xl:h-[420px] aspect-[4/3] rounded-[28px] overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                            <img
                                src="/assets/feedback.jpeg"
                                alt="Featured feedback"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:flex-1 min-w-0">
                        {isLoading ? (
                            <div className="mt-10 flex items-center justify-center min-h-[220px]">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#9B6F40]"></div>
                            </div>
                        ) : rightSideReviews.length > 0 ? (
                            <div className="relative mt-6 w-full min-w-0">
                                <div
                                    ref={scrollRef}
                                    className="flex gap-4 sm:gap-5 overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing select-none w-full"
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseLeave}
                                    onMouseMove={handleMouseMove}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onScroll={updateArrowState}
                                >
                                    {rightSideReviews.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-[18px] px-6 py-5 shadow-[0_16px_30px_rgba(15,23,42,0.10)] border border-slate-100 w-[320px] min-h-[200px] shrink-0"
                                        >
                                            <div className="flex gap-1 text-[#FFB21E] mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-current' : 'fill-slate-200'}`}
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>

                                            <p className="m-0 text-slate-600 text-[13px] leading-relaxed">
                                                “{item.text}”
                                            </p>

                                            <div className="mt-4 flex items-center gap-3">
                                                <img
                                                    src={item.avatar}
                                                    alt={item.name}
                                                    className="w-9 h-9 rounded-full object-cover"
                                                    onError={(e) => { e.target.src = '/assets/profile-avatar.jpeg' }}
                                                />
                                                <div className="min-w-0">
                                                    <h4 className="m-0 text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                                                    <p className="m-0 text-[9px] text-slate-400 font-bold uppercase tracking-[0.22em] leading-none mt-1 truncate">{item.nameLabel}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-10 flex items-center justify-center min-h-[220px] text-sm text-slate-400">
                                No reviews yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
