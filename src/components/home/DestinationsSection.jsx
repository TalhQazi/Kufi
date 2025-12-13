import { useState } from 'react'
import Card from '../ui/Card'

export default function DestinationsSection() {
    const [activeTab, setActiveTab] = useState(0)

    // Different destination sets for each tab
    const destinationSets = [
        [
            { id: 1, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-1.jpeg' },
            { id: 2, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-2.jpeg' },
            { id: 3, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-3.jpeg' },
            { id: 4, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-4.jpeg' },
        ],
        [
            { id: 5, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/activity1.jpeg' },
            { id: 6, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/activity2.jpeg' },
            { id: 7, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/hero-card1.jpeg' },
            { id: 8, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/hero-card2.jpeg' },
        ],
        [
            { id: 9, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-1.jpeg' },
            { id: 10, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/activity1.jpeg' },
            { id: 11, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-3.jpeg' },
            { id: 12, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/hero-card1.jpeg' },
        ],
        [
            { id: 13, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-2.jpeg' },
            { id: 14, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/activity2.jpeg' },
            { id: 15, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-4.jpeg' },
            { id: 16, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/hero-card2.jpeg' },
        ],
        [
            { id: 17, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/activity1.jpeg' },
            { id: 18, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-1.jpeg' },
            { id: 19, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/hero-card1.jpeg' },
            { id: 20, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-3.jpeg' },
        ],
    ]

    const tabs = ['lorem Ipi', 'lorem Ipi', 'lorem Ipi', 'lorem Ipi', 'lorem Ipi']
    const currentDestinations = destinationSets[activeTab] || destinationSets[0]

    return (
        <section className="bg-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <h2 className="text-xl sm:text-[26px] font-bold text-slate-900 m-0">Explore Destinations</h2>

                    <div className="flex flex-wrap gap-3 sm:gap-5 text-xs">
                        {tabs.map((tab, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`bg-transparent border-none p-0 text-xs cursor-pointer transition-colors ${
                                    activeTab === index
                                        ? 'text-slate-900 font-semibold'
                                        : 'text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentDestinations.map((item) => (
                        <Card
                            key={item.id}
                            variant="destination"
                            image={item.image}
                            title={item.title}
                            location={item.location}
                            rating="4.4"
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
