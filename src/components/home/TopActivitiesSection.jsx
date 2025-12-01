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
        <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-20" style={{ background: 'radial-gradient(circle at top, #fdfaf5 0, #d1b693 60%, #a9753b 100%)' }}>
            <div className="max-w-[1200px] mx-auto">
                <h2 className="text-lg tracking-[0.12em] font-bold text-slate-900 mb-6">TOP ACTIVITIES</h2>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-6">
                    <div className="flex flex-col gap-4">
                        {leftCards.map((card) => (
                            <article key={card.id} className="relative h-56 sm:h-[210px] rounded-2xl overflow-hidden">
                                <div
                                    className="absolute inset-0 w-full h-full bg-cover bg-top"
                                    style={{ backgroundImage: `url(${card.image})` }}
                                />
                                <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black/75 via-black/5 to-transparent">
                                    {card.badge && <span className="inline-block mb-2 mr-[430px] py-1 px-2.5 rounded-full bg-teal-500 text-white text-[11px]">{card.badge}</span>}
                                    <h3 className="m-0 mb-1 text-lg font-semibold text-slate-50">{card.title}</h3>
                                    <p className="m-0 text-xs text-slate-200">{card.subtitle}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <article className="relative h-[360px] md:h-[430px] rounded-3xl overflow-hidden">
                        <div
                            className="absolute inset-0 w-full h-full bg-cover bg-top"
                            style={{ backgroundImage: `url(${rightCard.image})` }}
                        />
                        <div className="absolute inset-0 flex flex-col justify-between items-start p-5 bg-gradient-to-t from-black/75 via-black/5 to-transparent">
                            <h3 className="m-0 mb-1 text-lg font-semibold text-slate-50">{rightCard.title}</h3>

                            <div className="w-full">
                                <div className="mt-2">
                                    <p className="m-0 text-xs text-slate-200">📍 {rightCard.available}</p>
                                    <p className="m-0 text-xs text-slate-200">★ {rightCard.reviews}</p>
                                </div>

                                <div className="mt-4 w-full flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <span className="w-6 h-0.5 rounded-full bg-slate-100"></span>
                                        <span className="w-[18px] h-0.5 rounded-full bg-slate-100/70"></span>
                                        <span className="w-[18px] h-0.5 rounded-full bg-slate-100/70"></span>
                                        <span className="w-[18px] h-0.5 rounded-full bg-slate-100/70"></span>
                                        <span className="w-[18px] h-0.5 rounded-full bg-slate-100/70"></span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="w-[30px] h-[30px] rounded-full border border-slate-950/20 bg-slate-50 text-slate-900 text-sm flex items-center justify-center shadow-md cursor-pointer">←</button>
                                        <button className="w-[30px] h-[30px] rounded-full border border-slate-950/35 bg-slate-50 text-slate-900 text-sm flex items-center justify-center shadow-md cursor-pointer">→</button>
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
