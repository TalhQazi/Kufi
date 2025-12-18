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

    // Triple the items for seamless infinite scroll
    const locations = [...baseLocations, ...baseLocations, ...baseLocations]

    useEffect(() => {
        const slider = scrollRef.current
        if (!slider) return

        // Set initial scroll to the middle section
        const itemWidth = slider.scrollWidth / 3
        slider.scrollLeft = itemWidth

        const handleScroll = () => {
            const currentScroll = slider.scrollLeft
            const maxScroll = slider.scrollWidth
            const sectionWidth = maxScroll / 3

            if (currentScroll <= 0) {
                slider.scrollLeft = sectionWidth
            } else if (currentScroll >= sectionWidth * 2) {
                slider.scrollLeft = sectionWidth
            }
        }

        const handleMouseDown = (e) => {
            isDown.current = true
            slider.classList.add('active-scroll')
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
            e.preventDefault()
            const x = e.pageX - slider.offsetLeft
            const walk = (x - startX.current) * 2 // Scroll speed
            slider.scrollLeft = scrollLeftAtStart.current - walk
        }

        slider.addEventListener('scroll', handleScroll)
        slider.addEventListener('mousedown', handleMouseDown)
        slider.addEventListener('mouseleave', handleMouseLeave)
        slider.addEventListener('mouseup', handleMouseUp)
        slider.addEventListener('mousemove', handleMouseMove)

        return () => {
            slider.removeEventListener('scroll', handleScroll)
            slider.removeEventListener('mousedown', handleMouseDown)
            slider.removeEventListener('mouseleave', handleMouseLeave)
            slider.removeEventListener('mouseup', handleMouseUp)
            slider.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <section className="bg-gradient-to-b from-white to-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-8">
                    <p className="text-lg font-normal text-black m-0 mb-1 font-sacramento">Top Locations</p>
                    <h2 className="text-[26px] font-bold text-slate-900 m-0 mb-2">Top Locations We Are Currently Serving</h2>
                    <p className="text-xs text-slate-500 max-w-[560px] m-0 mx-auto">
                        Lorem ipsum dolor sit amet consectetur. Porttitor montes mi tristique elit bibendum
                        elit libero egestas pellentesque.
                    </p>
                </div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 mt-8 hide-scrollbar cursor-grab active:cursor-grabbing select-none pb-4"
                >
                    {locations.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="min-w-[280px] sm:min-w-[300px] flex-shrink-0">
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
