import { useState, useEffect, useRef } from 'react'
import Button from '../ui/Button'
import { FaPlay, FaBookmark, FaStar } from 'react-icons/fa'
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi'

export default function HeroSection({ onSignupClick }) {
    const cards = [
        '/assets/hero-card1.jpeg',
        '/assets/hero-card2.jpeg',
        '/assets/hero-card3.jpeg',
        '/assets/hero-card4.jpeg'
    ]
    const [idx, setIdx] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const scrollRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)

    // Triple the cards for infinite effect
    const infiniteCards = [...cards, ...cards, ...cards]
    const cardWidth = 260 + 24 // card width + gap

    // Auto-scroll effect (one picture at a time)
    useEffect(() => {
        if (isPaused || isDragging) return

        const autoScroll = setInterval(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' })
            }
        }, 5000) // Slide every 5 seconds

        return () => clearInterval(autoScroll)
    }, [isPaused, isDragging, cardWidth])

    // Center scroll on mount
    useEffect(() => {
        if (scrollRef.current) {
            const initialScroll = cards.length * cardWidth
            scrollRef.current.scrollLeft = initialScroll
        }
    }, [])

    const handleScroll = () => {
        if (!scrollRef.current) return

        const sl = scrollRef.current.scrollLeft
        const contentWidth = cards.length * cardWidth

        // Reset to middle if we go too far left or right
        if (sl <= 0) {
            scrollRef.current.scrollLeft = contentWidth
        } else if (sl >= contentWidth * 2) {
            scrollRef.current.scrollLeft = contentWidth
        }

        // Update active index based on scroll position (focused card)
        const currentActive = Math.round((sl % contentWidth) / cardWidth)
        setIdx(currentActive % cards.length)
    }

    const handleMouseDown = (e) => {
        setIsDragging(true)
        startX.current = e.pageX - scrollRef.current.offsetLeft
        scrollLeft.current = scrollRef.current.scrollLeft
    }

    const handleMouseLeave = () => {
        setIsDragging(false)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return
        e.preventDefault()
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX.current) * 2
        scrollRef.current.scrollLeft = scrollLeft.current - walk
    }

    const prev = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' })
        }
    }
    const next = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' })
        }
    }



    return (
        <div className="min-h-[600px] lg:min-h-[700px] flex flex-col bg-cover bg-center text-white px-4 sm:px-8 lg:px-20 pb-20 box-border relative"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('/assets/hero.jpeg')`
            }}>

            {/* Dashed line decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[60%] h-[80%] border border-dashed border-white/20 rounded-full rotate-12"></div>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-10 items-center mt-12 lg:mt-20 relative z-10">
                <section className="max-w-[550px]">
                    <p className="text-2xl sm:text-[28px] mb-2 font-sacramento text-white/90">
                        <span className="font-sacramento">Lorem</span>
                        <span className="text-[#A67C52] ml-2 font-sacramento">Ipsum</span>
                        <span className="font-sacramento ml-2">Amet</span>
                    </p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] m-0 mb-6">
                        Lorem Ipsum Dol <br />
                        Sit Amet Conse
                    </h1>
                    <div className="w-16 h-1 bg-[#A67C52] mb-6"></div>
                    <p className="text-sm sm:text-base max-w-[480px] text-slate-200 leading-relaxed mb-8">
                        Lorem ipsum dolor sit amet consectetur. Ultricies varius praesent aliquam cum egestas tristique sit blandit tortor.
                    </p>

                    <div className="flex items-center gap-4">
                        <Button variant="primary" className="!bg-[#A67C52] !text-white !rounded-full !px-8 !py-3 hover:!bg-[#8e6a45]">Let's Explore</Button>
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <FaPlay size={14} className="ml-1" />
                        </button>
                    </div>
                </section>

                <section className="relative mt-8 lg:mt-0">
                    {/* Mobile/simple card */}
                    <div className="md:hidden">
                        <div
                            className="rounded-3xl overflow-hidden shadow-2xl relative cursor-pointer"
                            onClick={() => {
                                setIsPaused(true)
                                setIdx((idx + 1) % cards.length)
                                setTimeout(() => setIsPaused(false), 5000)
                            }}
                        >
                            <img
                                src={cards[idx]}
                                alt="Featured experience"
                                className="w-full h-80 object-cover"
                            />
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="text-lg font-bold">Lorem Ipsum</h3>
                                <div className="flex items-center gap-1 text-sm text-[#F59E0B]">
                                    <FaStar /> <span>4.4</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop cards - Horizontal scroll with mouse drag */}
                    <div
                        ref={scrollRef}
                        className={`hidden md:flex gap-6 overflow-x-auto pb-16 items-end px-20 hide-scrollbar cursor-grab active:cursor-grabbing select-none`}
                        onScroll={handleScroll}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={() => {
                            setIsDragging(false)
                            setIsPaused(false)
                        }}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsPaused(true)}
                    >
                        {infiniteCards.map((cardPath, index) => {
                            const isActive = (index % cards.length) === idx
                            return (
                                <div key={index} className="relative group flex-shrink-0 flex items-center h-[420px] w-[260px] justify-center">
                                    {/* Background Number */}
                                    <div className={`absolute left-1/2 -translate-x-1/2 text-[180px] font-normal text-transparent font-outline-2 text-white/5 select-none z-0 pointer-events-none font-playfair leading-none transition-all duration-500 ${isActive ? '-top-10 opacity-50' : '-top-5 opacity-20'}`}>
                                        0{(index % cards.length) + 1}
                                    </div>

                                    <div
                                        className={`relative rounded-2xl overflow-hidden shadow-lg shadow-black/50 bg-gray-900 text-white transition-all duration-500 z-10 border-none ring-0 ${isActive ? 'w-[260px] h-[400px] opacity-100 mb-0' : 'w-[240px] h-[300px] opacity-80 mb-[-20px]'}`}
                                    >
                                        <img
                                            src={cardPath}
                                            alt={`Experience ${index + 1}`}
                                            className="absolute inset-0 w-full h-full object-cover block m-0 p-0 border-none pointer-events-none"
                                        />
                                        <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h3 className="m-0 mb-1.5 text-lg font-semibold whitespace-nowrap">Lorem Ipsum</h3>
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <FaStar size={13} className="text-[#F59E0B]" />
                                                        <span className="text-white font-medium">4.4</span>
                                                    </div>
                                                </div>
                                                <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
                                                    <FaBookmark size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Navigation controls */}
                    <div className="hidden md:flex items-center gap-3 absolute bottom-0 left-0">
                        <span className="text-sm font-medium text-white/90">Prev / Next</span>
                        <button
                            onClick={prev}
                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
                        >
                            <FiChevronLeft size={18} />
                        </button>
                        <button
                            onClick={next}
                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
                        >
                            <FiChevronRight size={18} />
                        </button>
                    </div>

                    {/* Pagination Indicators */}
                    <div className="hidden md:flex items-center absolute bottom-0 right-0 h-6">
                        {/* Background track */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-[#D4AF37]/30 rounded-full" />

                        {/* Individual indicators */}
                        <div className="flex items-center gap-3 relative z-10">
                            {cards.map((_, index) => (
                                <div
                                    key={index}
                                    className={`transition-all duration-300 cursor-pointer rounded-full ${index === idx
                                        ? 'w-12 h-[3px] bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/50'
                                        : 'w-8 h-[2px] bg-white/60 hover:bg-white/80'
                                        }`}
                                    onClick={() => {
                                        if (scrollRef.current) {
                                            const contentWidth = cards.length * cardWidth
                                            const scrollAmount = contentWidth + (index * cardWidth)
                                            scrollRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' })
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
