import { useState, useEffect } from 'react'

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
    const [startIndex, setStartIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [selectedCardId, setSelectedCardId] = useState(null)

    // Get the 3 visible cards based on current start index
    const visibleCards = [
        allFeedback[startIndex % allFeedback.length],
        allFeedback[(startIndex + 1) % allFeedback.length],
        allFeedback[(startIndex + 2) % allFeedback.length]
    ]

    // Auto-rotate every 3 seconds
    useEffect(() => {
        if (isPaused) return

        const interval = setInterval(() => {
            setStartIndex((current) => (current + 1) % allFeedback.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [isPaused])

    return (
        <section
            className="bg-white py-16 sm:py-20 px-4 sm:px-8 lg:px-20 relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Decorative blob background */}
            <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-[#D1B693] rounded-tl-full opacity-40 -mr-32 -mb-32 hidden lg:block" />

            <div className="max-w-[1200px] mx-auto relative z-10">
                <div className="mb-10 sm:mb-12">
                    <p className="text-sm sm:text-base text-slate-500 mb-2 uppercase tracking-wide">WHAT THEY SAYS</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 m-0">
                        Best Feedback From Clients
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500">
                    {visibleCards.map((card, index) => (
                        <article
                            key={`${card.id}-${index}-${startIndex}`}
                            onClick={() => setSelectedCardId(card.id)}
                            className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ${index === 0 ? 'md:row-span-2' : ''} hover:shadow-xl cursor-pointer ${
                                selectedCardId === card.id ? 'ring-4 ring-[#A67C52] ring-offset-2' : ''
                            }`}
                        >
                            {/* Featured Card Style (First Item) */}
                            {index === 0 ? (
                                <div className="relative h-full min-h-[400px] group">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${card.image})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                    <div className="relative h-full p-6 flex flex-col justify-end">
                                        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg transform transition-transform duration-300 hover:-translate-y-1">
                                            <div className="flex gap-1 mb-3 text-[#F59E0B]">
                                                {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                                            </div>
                                            <p className="text-sm text-slate-700 mb-4 italic leading-relaxed">{card.text}</p>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-white shadow-md"
                                                    style={{ backgroundImage: `url(${card.avatar})` }}
                                                />
                                                <div>
                                                    <p className="m-0 text-sm font-bold text-slate-900">{card.name}</p>
                                                    <p className="m-0 text-xs text-slate-500 font-medium tracking-wide">{card.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Standard Card Style */
                                <div className="bg-white p-6 h-full border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
                                    <div>
                                        <div className="flex gap-1 mb-3 text-[#F59E0B]">
                                            {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                                        </div>
                                        <p className="text-sm text-slate-700 mb-4 italic leading-relaxed">{card.text}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-full bg-cover bg-center border border-slate-200"
                                            style={{ backgroundImage: `url(${card.avatar})` }}
                                        />
                                        <div>
                                            <p className="m-0 text-sm font-bold text-slate-900">{card.name}</p>
                                            <p className="m-0 text-xs text-slate-500 font-medium tracking-wide">{card.role}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
