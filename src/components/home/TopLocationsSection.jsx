import Card from '../ui/Card'

export default function TopLocationsSection() {
    const locations = [
        { id: 1, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/src/assets/dest-1.jpeg' },
        { id: 2, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/src/assets/dest-2.jpeg' },
        { id: 3, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/src/assets/dest-3.jpeg' },
        { id: 4, title: 'Lorem Ipsum', location: 'Lorem Ipi', image: '/src/assets/dest-4.jpeg' },
    ]

    return (
        <section className="bg-gradient-to-b from-white to-slate-50 py-16 px-20">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-8">
                    <p className="text-lg font-normal text-black m-0 mb-1 font-sacramento">Top Locations</p>
                    <h2 className="text-[26px] font-bold text-slate-900 m-0 mb-2">Top Locations We Are Currently Serving</h2>
                    <p className="text-xs text-slate-500 max-w-[560px] m-0 mx-auto">
                        Lorem ipsum dolor sit amet consectetur. Porttitor montes mi tristique elit bibendum
                        elit libero egestas pellentesque.
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-6 mt-8">
                    {locations.map((item) => (
                        <Card
                            key={item.id}
                            variant="destination"
                            image={item.image}
                            title={item.title}
                            location={item.location}
                            rating="4.4"
                            className="rounded-[20px] shadow-card-hover"
                            imageClassName="h-[280px]"
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
