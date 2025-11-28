import { useState } from 'react'
import Button from '../ui/Button'

export default function HeroSection({ onSignupClick }) {
    const cards = [
        '/src/assets/hero-card1.jpeg',
        '/src/assets/hero-card2.jpeg',
        '/src/assets/hero-card3.jpeg',
        '/src/assets/hero-card4.jpeg'
    ]
    const [idx, setIdx] = useState(0)

    const visibleOrder = [0, 1, 2, 3].map((offset) => (idx + offset) % cards.length)

    const prev = () => setIdx((p) => (p - 1 + cards.length) % cards.length)
    const next = () => setIdx((p) => (p + 1) % cards.length)

    return (
        <div className="min-h-screen flex flex-col bg-cover bg-center text-white px-20 pb-12 box-border"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('/src/assets/hero.jpeg')`
            }}>

            <main className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-10 items-center mt-6">
                <section className="max-w-[520px]">
                    <p className="text-[25px] mb-4 font-sacramento">
                        <span className="font-sacramento">Lorem</span>
                        <span className="text-yellow-400 ml-1">Ipsum</span>
                        <span className="font-sacramento ml-1">Amet</span>
                    </p>
                    <h1 className="text-5xl font-bold leading-tight m-0 mb-4">
                        Lorem Ipsum Dol <br />
                        Sit Amet Conse
                    </h1>
                    <p className="text-sm max-w-[420px] text-slate-200">
                        Lorem ipsum dolor sit amet consectetur. Ultricies varius praesent aliquam cum egestas tristique sit blandit tortor.
                    </p>

                    <div className="flex items-center gap-4 mt-7">
                        <Button variant="primary">Let's Explore</Button>
                        <Button variant="play">
                            <span className="text-slate-900 ml-0.5">▶</span>
                        </Button>
                    </div>
                </section>

                <section className="relative h-[310px]">
                    <div className="relative h-full">
                        {visibleOrder.map((cardIdx, pos) => {
                            const styles = pos === 0
                                ? 'w-60 h-[340px] left-10 z-30'
                                : pos === 1
                                    ? 'w-[210px] h-[300px] left-[210px] top-7 z-20'
                                    : pos === 2
                                        ? 'w-[210px] h-[300px] left-[360px] top-7 z-20'
                                        : 'w-[210px] h-[300px] left-[510px] top-7 z-20'

                            return (
                                <div
                                    key={cardIdx}
                                    className={`absolute top-0 rounded-3xl overflow-hidden shadow-2xl text-white ${styles}`}
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
                            )
                        })}
                    </div>

                    <div className="absolute -bottom-24 left-10 flex gap-2">
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
