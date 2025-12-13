import Card from '../ui/Card'

export default function DestinationsSection({ onCountryClick }) {
    const destinations = [
        { id: 1, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-1.jpeg' },
        { id: 2, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-2.jpeg' },
        { id: 3, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-3.jpeg' },
        { id: 4, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/assets/dest-4.jpeg' },
    ]

    return (
        <section className="bg-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1200px] mx-auto">
                <div className="mb-8">
                    <h2 className="text-xl sm:text-[26px] font-bold text-slate-900 m-0">Explore Destinations</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {destinations.map((item) => (
                        <Card
                            key={item.id}
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
                    ))}
                </div>
            </div>
        </section>
    )
}
