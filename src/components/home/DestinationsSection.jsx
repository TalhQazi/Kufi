import { useState } from 'react'
import Card from '../ui/Card'

export default function DestinationsSection({ onCountryClick }) {
    const baseDestinations = [
        { id: 1, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-1.jpeg' },
        { id: 2, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-2.jpeg' },
        { id: 3, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-3.jpeg' },
        { id: 4, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-4.jpeg' },
        { id: 5, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-1.jpeg' },
        { id: 6, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-2.jpeg' },
    ]

    const [destinations, setDestinations] = useState(baseDestinations.slice(0, 4))

    const handleShowMore = () => {
        const currentCount = destinations.length
        const nextItems = []
        const timestamp = Date.now()
        for (let i = 0; i < 4; i++) {
            const baseItem = baseDestinations[(currentCount + i) % baseDestinations.length]
            nextItems.push({ ...baseItem, id: `dest-${timestamp}-${currentCount + i}` })
        }
        setDestinations(prev => [...prev, ...nextItems])
    }

    return (
        <section className="bg-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1240px] mx-auto">
                <div className="mb-10">
                    <h2 className="text-xl sm:text-3xl font-bold text-slate-900">Explore Destinations</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {destinations.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="w-full">
                            <Card
                                variant="destination"
                                image={item.image}
                                title={item.title}
                                location={item.location}
                                rating="4.4"
                                onClick={() => {
                                    if (onCountryClick) {
                                        onCountryClick()
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        type="button"
                        onClick={handleShowMore}
                        className="bg-[#a67c52] text-white px-10 py-3.5 rounded-full font-semibold hover:bg-[#8f643e] transition-all shadow-md active:scale-95 text-lg"
                    >
                        Show More
                    </button>
                </div>
            </div>
        </section>
    )
}
