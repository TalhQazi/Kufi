import { useRef, useEffect } from 'react'
import Card from '../ui/Card'

export default function TopLocationsSection({ onCountryClick }) {
    const scrollRef = useRef(null)
    const isDown = useRef(false)
    const startX = useRef(0)
    const scrollLeftAtStart = useRef(0)

    const baseLocations = [
        { id: 1, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-1.jpeg' },
        { id: 2, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-2.jpeg' },
        { id: 3, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-3.jpeg' },
        { id: 4, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-4.jpeg' },
    ]

    useEffect(() => {
        const slider = scrollRef.current
        if (!slider) return

        let hasMoved = false

        const handleMouseDown = (e) => {
            // Don't interfere with button clicks
            if (e.target.closest('button')) return

            isDown.current = true
            hasMoved = false
            startX.current = e.pageX - slider.offsetLeft
            scrollLeftAtStart.current = slider.scrollLeft
        }

        const handleMouseLeave = () => {
            isDown.current = false
            slider.classList.remove('active-scroll')
        }

        const handleMouseUp = () => {
            isDown.current = false
            slider.classList.remove('active-scroll')
        }

        const handleMouseMove = (e) => {
            if (!isDown.current) return

            const x = e.pageX - slider.offsetLeft
            const distance = Math.abs(x - startX.current)

            // Only start dragging if moved more than 5px
            if (distance > 5 && !hasMoved) {
                hasMoved = true
                slider.classList.add('active-scroll')
            }

            if (hasMoved) {
                e.preventDefault()
                const walk = (x - startX.current) * 2 // Scroll speed
                slider.scrollLeft = scrollLeftAtStart.current - walk
            }
        }

        slider.addEventListener('mousedown', handleMouseDown)
        slider.addEventListener('mouseleave', handleMouseLeave)
        slider.addEventListener('mouseup', handleMouseUp)
        slider.addEventListener('mousemove', handleMouseMove)

        return () => {
            slider.removeEventListener('mousedown', handleMouseDown)
            slider.removeEventListener('mouseleave', handleMouseLeave)
            slider.removeEventListener('mouseup', handleMouseUp)
            slider.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <section className="bg-gradient-to-b from-white to-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1240px] mx-auto">
                <div className="text-center mb-10">
                    <p className="text-lg font-normal text-[#a67c52] m-0 mb-1 font-sacramento">Top Locations</p>
                    <h2 className="text-xl sm:text-3xl font-bold text-slate-900 m-0 mb-4">Top Locations We Are Currently Serving</h2>
                    <p className="text-sm text-slate-500 max-w-[560px] m-0 mx-auto">
                        Lorem ipsum dolor sit amet consectetur. Porttitor montes mi tristique elit bibendum
                        elit libero egestas pellentesque.
                    </p>
                </div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 hide-scrollbar pb-6 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
                >
                    {baseLocations.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="min-w-[280px] sm:min-w-[320px] flex-shrink-0 snap-start">
                            <Card
                                variant="destination"
                                image={item.image}
                                title={item.title}
                                location={item.location}
                                rating="4.4"
                                className="rounded-[20px] shadow-card-hover"
                                imageClassName="h-64 sm:h-[280px]"
                                onClick={() => {
                                    if (onCountryClick) {
                                        onCountryClick()
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
