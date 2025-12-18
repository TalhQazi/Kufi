import { useState, useEffect, useRef } from 'react'

const allFeedback = [
    {
        id: 1,
        text: '"The trip was absolutely amazing! The desert safari exceeded all my expectations. The guide was knowledgeable and the sunset views were breathtaking. Highly recommended!"',
        name: 'Sarah Jenkins',
        role: 'TRAVEL ENTHUSIAST',
        avatar: '/assets/feedback-A.jpeg',
        image: '/assets/feedback-bg-1.jpeg',
    },
    {
        id: 2,
        text: '"Kufi Travel made our honeymoon magical. From the moment we landed in Bali until we left, everything was perfectly organized. The private pool villa was a dream come true."',
        name: 'Michael Chen',
        role: 'HONEYMOONER',
        avatar: '/assets/feedback-B.jpeg',
        image: '/assets/activity1.jpeg',
    },
    {
        id: 3,
        text: '"I\'ve traveled with many agencies, but the attention to detail here is unmatched. The customer support was available 24/7 and helped us with a last-minute itinerary change."',
        name: 'Emma Wilson',
        role: 'ADVENTURE SEEKER',
        avatar: '/assets/feedback-C.jpeg',
        image: '/assets/activity2.jpeg',
    },
    {
        id: 4,
        text: '"A truly unforgettable experience in the Swiss Alps. The hiking trails chosen for us were perfect for our skill level. Will definitely book again for our next adventure."',
        name: 'David Thompson',
        role: 'NATURE LOVER',
        avatar: '/assets/hero-card1.jpeg',
        image: '/assets/activity3.jpeg',
    },
    {
        id: 5,
        text: '"Great service and amazing value for money. We explored hidden gems in Kyoto that we would never have found on our own. Thank you for the authentic cultural experience!"',
        name: 'Lisa Wong',
        role: 'CULTURAL EXPLORER',
        avatar: '/assets/hero-card2.jpeg',
        image: '/assets/dest-1.jpeg',
    },
    {
        id: 6,
        text: '"Professional, reliable, and friendly. The booking process was smooth and the actual trip was even better than the descriptions. 5 stars all the way!"',
        name: 'Robert Garcia',
        role: 'FAMILY TRAVELER',
        avatar: '/assets/hero-card3.jpeg',
        image: '/assets/dest-2.jpeg',
    }
]

export default function FeedbackSection() {
    const scrollRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeftState, setScrollLeftState] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const cardWidth = 400 + 32 // card width + gap

    const infiniteFeedback = [...allFeedback, ...allFeedback, ...allFeedback]

    // Initialize scroll position to center
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = allFeedback.length * cardWidth
        }
    }, [])

    // Auto-scroll logic
    useEffect(() => {
        if (isPaused || isDragging) return

        const autoScroll = setInterval(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' })
            }
        }, 4000)

        return () => clearInterval(autoScroll)
    }, [isPaused, isDragging])

    const handleMouseDown = (e) => {
        setIsDragging(true)
        setStartX(e.pageX - scrollRef.current.offsetLeft)
        setScrollLeftState(scrollRef.current.scrollLeft)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseLeave = () => {
        setIsDragging(false)
        setIsPaused(false)
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return
        e.preventDefault()
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX) * 2
        scrollRef.current.scrollLeft = scrollLeftState - walk
    }

    const handleScroll = () => {
        if (!scrollRef.current) return
        const sl = scrollRef.current.scrollLeft
        const contentWidth = allFeedback.length * cardWidth

        if (sl <= 0) {
            scrollRef.current.scrollLeft = contentWidth
        } else if (sl >= contentWidth * 2) {
            scrollRef.current.scrollLeft = contentWidth
        }
    }

    return (
        <section
            className="bg-[#F1F5F9] py-20 px-4 sm:px-8 lg:px-20 relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={handleMouseLeave}
        >
            {/* Subtle small organic shape in the corner */}
            <div className="absolute right-[-5%] bottom-[-5%] w-[40%] h-[50%] pointer-events-none z-0">
                <svg
                    viewBox="0 0 807 668"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full opacity-[0.4]"
                    preserveAspectRatio="xMaxYMax meet"
                >
                    <path d="M508.87 15.6287C654.551 -44.9862 768.324 85.2638 807 157.966V628.272C753.641 655.693 649.062 701.953 574.941 628.272C500.821 554.591 400.181 567.297 348.792 577.94C276.811 605.361 116.52 643.751 51.1999 577.94C-30.4501 495.677 -30.4501 350.634 170.452 271.619C371.354 192.603 326.769 91.3974 508.87 15.6287Z" fill="#BFAE9F" />
                </svg>
            </div>

            <div className="max-w-[1240px] mx-auto relative z-10">
                <div className="mb-14 relative z-10">
                    <p className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-[0.2em] leading-none">WHAT THEY SAYS</p>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1E293B] m-0 tracking-tight">
                        Best Feedback From Clients
                    </h2>
                </div>

                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onScroll={handleScroll}
                    className="flex gap-8 overflow-x-auto pb-10 hide-scrollbar cursor-grab active:cursor-grabbing select-none"
                >
                    {infiniteFeedback.map((card, index) => (
                        <article
                            key={`${card.id}-${index}`}
                            className="flex-shrink-0 w-[400px] transition-all duration-500 rounded-[32px] overflow-hidden"
                        >
                            <div className="bg-white p-10 rounded-3xl h-full shadow-lg border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group min-h-[420px]">
                                <div>
                                    <div className="flex gap-1.5 mb-5 text-[#F59E0B]">
                                        {[...Array(5)].map((_, i) => <span key={i} className="text-xl">★</span>)}
                                    </div>
                                    <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed italic">
                                        {card.text}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-14 h-14 rounded-full bg-cover bg-center border-4 border-white shadow-md"
                                        style={{ backgroundImage: `url(${card.avatar})` }}
                                    />
                                    <div>
                                        <p className="m-0 text-lg font-bold text-slate-900 leading-tight">{card.name}</p>
                                        <p className="m-0 text-xs text-slate-400 font-bold tracking-widest uppercase">
                                            {card.name.split(' ')[0].toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
