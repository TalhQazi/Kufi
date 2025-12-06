import { FiMapPin, FiStar } from 'react-icons/fi'

export default function TopActivitiesSection() {
    const leftCards = [
        {
            id: 1,
            badge: 'International',
            title: 'Rajasthan Heritage Tour',
            subtitle: 'Find out why travelers like you are raving about Bali',
            image: '/assets/activity1.jpeg',
        },
        {
            id: 2,
            badge: '',
            title: 'Kerala Backwaters',
            subtitle: 'Find out why travelers like you are raving about Bali',
            image: '/assets/activity2.jpeg',
        },
    ]

    const rightCard = {
        title: 'Maldives Luxury Escape',
        image: '/assets/activity3.jpeg',
        available: '363 available',
        reviews: '4.7 (2,543 Reviews)',
    }

    return (
        <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-20 bg-[#E8DED0]">
            <div className="max-w-[1200px] mx-auto">
                <h2 className="text-xl sm:text-2xl tracking-wide font-bold text-slate-900 mb-8">TOP ACTIVITIES</h2>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6">
                    <div className="flex flex-col gap-4">
                        {leftCards.map((card) => (
                            <article key={card.id} className="relative h-56 sm:h-[210px] rounded-2xl overflow-hidden shadow-lg">
                                <div
                                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${card.image})` }}
                                />
                                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                                    {card.badge && <span className="inline-block mb-2 self-start py-1 px-3 rounded-md bg-teal-500 text-white text-xs font-medium">{card.badge}</span>}
                                    <h3 className="m-0 mb-1.5 text-xl font-bold text-white">{card.title}</h3>
                                    <p className="m-0 text-sm text-slate-200">{card.subtitle}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <article className="relative h-[360px] md:h-[430px] rounded-2xl overflow-hidden shadow-lg">
                        <div
                            className="absolute inset-0 w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${rightCard.image})` }}
                        />
                        <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                            <div></div>

                            <div className="w-full">
                                <h3 className="m-0 mb-3 text-2xl font-bold text-white">{rightCard.title}</h3>

                                <div className="flex flex-col gap-1.5 mb-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <FiMapPin size={16} />
                                        <span className="text-sm">{rightCard.available}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <FiStar size={16} />
                                        <span className="text-sm">{rightCard.reviews}</span>
                                    </div>
                                </div>

                                <div className="w-full flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <span className="w-8 h-1 rounded-full bg-white"></span>
                                        <span className="w-8 h-1 rounded-full bg-white/50"></span>
                                        <span className="w-8 h-1 rounded-full bg-white/50"></span>
                                        <span className="w-8 h-1 rounded-full bg-white/50"></span>
                                        <span className="w-8 h-1 rounded-full bg-white/50"></span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="w-9 h-9 rounded-full bg-white text-slate-900 text-base flex items-center justify-center shadow-md hover:bg-slate-100 transition-colors">←</button>
                                        <button className="w-9 h-9 rounded-full bg-white text-slate-900 text-base flex items-center justify-center shadow-md hover:bg-slate-100 transition-colors">→</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    )
}
