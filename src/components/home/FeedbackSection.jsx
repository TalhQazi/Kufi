export default function FeedbackSection() {
    const cards = [
        {
            id: 1,
            text: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor"',
            name: 'Liza',
            role: 'LIZA',
            avatar: '/assets/feedback-A.jpeg',
            image: '/assets/feedback-bg-1.jpeg',
        },
        {
            id: 2,
            text: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor"',
            name: 'Mr. John Doe',
            role: 'MR. JOHN DOE',
            avatar: '/assets/feedback-B.jpeg',
            image: null,
        },
        {
            id: 3,
            text: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor"',
            name: 'Mr. John Doe',
            role: 'MR. JOHN DOE',
            avatar: '/assets/feedback-C.jpeg',
            image: null,
        },
    ]

    return (
        <section className="bg-white py-16 sm:py-20 px-4 sm:px-8 lg:px-20 relative overflow-hidden">
            {/* Decorative blob background */}
            <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-[#D1B693] rounded-tl-full opacity-40 -mr-32 -mb-32 hidden lg:block" />

            <div className="max-w-[1200px] mx-auto relative z-10">
                <div className="mb-10 sm:mb-12">
                    <p className="text-sm sm:text-base text-slate-500 mb-2 uppercase tracking-wide">WHAT THEY SAYS</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 m-0">
                        Best Feedback From Clients
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cards.map((card) => (
                        <article
                            key={card.id}
                            className={`rounded-2xl overflow-hidden shadow-lg ${card.id === 1 ? 'md:row-span-2' : ''}`}
                        >
                            {/* Card with image background for first card */}
                            {card.id === 1 && card.image ? (
                                <div className="relative h-full min-h-[400px]">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${card.image})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    <div className="relative h-full p-6 flex flex-col justify-end">
                                        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5">
                                            <div className="flex gap-1 mb-3 text-[#F59E0B]">
                                                <span>★</span>
                                                <span>★</span>
                                                <span>★</span>
                                                <span>★</span>
                                                <span>★</span>
                                            </div>
                                            <p className="text-sm text-slate-700 mb-4 italic">{card.text}</p>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-full bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${card.avatar})` }}
                                                />
                                                <div>
                                                    <p className="m-0 text-sm font-semibold text-slate-900">{card.name}</p>
                                                    <p className="m-0 text-xs text-slate-500">{card.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-6">
                                    <div className="flex gap-1 mb-3 text-[#F59E0B]">
                                        <span>★</span>
                                        <span>★</span>
                                        <span>★</span>
                                        <span>★</span>
                                        <span>★</span>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-4 italic">{card.text}</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-full bg-cover bg-center"
                                            style={{ backgroundImage: `url(${card.avatar})` }}
                                        />
                                        <div>
                                            <p className="m-0 text-sm font-semibold text-slate-900">{card.name}</p>
                                            <p className="m-0 text-xs text-slate-500">{card.role}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
