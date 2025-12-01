import { useState, useEffect } from 'react'
import Button from '../ui/Button'

export default function HeroSection({ onSignupClick }) {
    const cards = [
        '/src/assets/hero-card1.jpeg',
        '/src/assets/hero-card2.jpeg',
        '/src/assets/hero-card3.jpeg',
        '/src/assets/hero-card4.jpeg'
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
        <div className="min-h-screen flex flex-col bg-cover bg-center text-white px-4 sm:px-8 lg:px-20 pb-12 box-border"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('/src/assets/hero.jpeg')`
            }}>

        <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-10 items-center mt-6">
                <section className="max-w-[520px]">
                    <p className="text-2xl sm:text-[25px] mb-4 font-sacramento">
                        <span className="font-sacramento">Lorem</span>
                        <span className="text-yellow-400 ml-1">Ipsum</span>
                        <span className="font-sacramento ml-1">Amet</span>
                    </p>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight m-0 mb-4">
                        Lorem Ipsum Dol <br />
                        Sit Amet Conse
                    </h1>
                    <p className="text-sm sm:text-base max-w-[420px] text-slate-200">
                        Lorem ipsum dolor sit amet consectetur. Ultricies varius praesent aliquam cum egestas tristique sit blandit tortor.
                    </p>

                    <div className="flex items-center gap-3 sm:gap-4 mt-7">
                        <Button variant="primary">Let's Explore</Button>
                        <Button variant="play">
                            <span className="text-slate-900 ml-0.5">▶</span>
                        </Button>
                    </div>
                </section>

                <section className="relative mt-6 lg:mt-0">
                    {/* Mobile/simple card */}
                    <div className="md:hidden">
                        <div className="rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src={cards[idx]}
                                alt="Featured experience"
                                className="w-full h-64 object-cover"
                            />
                        </div>
                    </div>

                    {/* Desktop cards with spacing - show 3 at a time */}
                    <div 
                        className="hidden md:flex gap-6"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {visibleOrder.map((cardIdx) => (
                            <div
                                key={`${cardIdx}-${idx}`}
                                className="w-60 h-[340px] rounded-3xl overflow-hidden shadow-2xl text-white flex-shrink-0 transition-opacity duration-500"
                            >
                                <div
                                    className="w-full h-[75%] bg-cover bg-center"
                                    style={{ backgroundImage: `url(${cards[cardIdx]})` }}
                                />
                                <div className="p-4 bg-gradient-to-b from-slate-950/90 to-slate-950">
                                    <h3 className="m-0 mb-1.5 text-base">Lorem Ipsum</h3>
                                    <span className="text-sm">★ 4.4</span>
                                    <span className="ml-2">🔖</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:flex mt-6 gap-2">
                        <Button variant="slider" onClick={prev}>
                            Prev / Next
                        </Button>
                        <Button variant="sliderFilled" onClick={next}>
                            →
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    )
}
