import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import { FaPlay, FaBookmark, FaStar } from 'react-icons/fa'
import { FiChevronRight } from 'react-icons/fi'

export default function HeroSection({ onSignupClick }) {
    const cards = [
        '/assets/hero-card1.jpeg',
        '/assets/hero-card2.jpeg',
        '/assets/hero-card3.jpeg',
        '/assets/hero-card4.jpeg'
    ]
    const [idx, setIdx] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    // Show only 3 cards at a time
    const visibleOrder = [0, 1, 2].map((offset) => (idx + offset) % cards.length)

    const prev = () => {
        setIsPaused(true)
        setIdx((p) => (p - 1 + cards.length) % cards.length)
        setTimeout(() => setIsPaused(false), 5000) // Resume after 5 seconds
    }
    const next = () => {
        setIsPaused(true)
        setIdx((p) => (p + 1) % cards.length)
        setTimeout(() => setIsPaused(false), 5000) // Resume after 5 seconds
    }

    // Auto-rotate every 4 seconds
    useEffect(() => {
        if (isPaused) return

        const interval = setInterval(() => {
            setIdx((p) => (p + 1) % cards.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [isPaused, cards.length])

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
                        <div className="rounded-3xl overflow-hidden shadow-2xl relative">
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

                    {/* Desktop cards with spacing - show 3 at a time */}
                    <div
                        className="hidden md:flex gap-6 overflow-hidden pb-10 pl-4"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {visibleOrder.map((cardIdx, index) => (
                            <div
                                key={`${cardIdx}-${idx}`}
                                className={`relative rounded-3xl overflow-hidden shadow-2xl text-white flex-shrink-0 transition-all duration-500 ${index === 0 ? 'w-[280px] h-[420px] -mt-10' : 'w-[260px] h-[380px] mt-0 opacity-90'}`}
                            >
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${cards[cardIdx]})` }}
                                />
                                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="m-0 mb-1 text-xl font-bold">Lorem Ipsum</h3>
                                            <div className="flex items-center gap-1 text-sm text-[#F59E0B]">
                                                <FaStar size={12} /> <span className="text-white font-medium">4.4</span>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                            <FaBookmark size={12} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4 absolute bottom-0 left-0">
                        <span className="text-sm font-medium">Prev / Next</span>
                        <button onClick={next} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm">
                            <FiChevronRight size={20} />
                        </button>
                        <div className="w-32 h-0.5 bg-white/30 ml-4 relative">
                            <div className="absolute top-0 left-0 w-1/3 h-full bg-white"></div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
