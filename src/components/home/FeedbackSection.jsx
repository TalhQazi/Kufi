export default function FeedbackSection() {
    const cards = [
        {
            id: 1,
            text: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor"',
            name: 'Liza',
            role: 'LIZA',
            avatar: '/assets/feedback-A.jpeg',
        },
        {
            id: 2,
            text: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor"',
            name: 'Mr. John Doe',
            role: 'MR. JOHN DOE',
            avatar: '/assets/feedback-B.jpeg',
        },
        {
            id: 3,
            text: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor"',
            name: 'Mr. John Doe',
            role: 'MR. JOHN DOE',
            avatar: '/assets/feedback-C.jpeg',
        },
    ]

    const bottomIcons = [
        { id: 1, label: 'Different Constraints', icon: '/assets/constraints.jpeg' },
        { id: 2, label: 'Food Tour', icon: '/assets/food-tour.jpeg' },
        { id: 3, label: 'Ship Cruise', icon: '/assets/ship.jpeg' },
        { id: 4, label: 'Mountains Tour', icon: '/assets/mountains.jpeg' },
        { id: 5, label: 'Summer Rest', icon: '/assets/summer.jpeg' },
        { id: 6, label: 'Bus Tour', icon: '/assets/bus.jpeg' },
    ]

    return (
        <section className="bg-beige py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1200px] mx-auto">
                <div className="mb-6 sm:mb-8 text-center sm:text-left">
                    <h2 className="text-xl sm:text-[26px] font-bold text-slate-900 m-0">
                        Best Feedback From Clients
                    </h2>
                </div>

                <div className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cards.map((card) => (
                            <article key={card.id} className="p-5 sm:p-6 rounded-2xl bg-white shadow-md">
                                <div className="flex gap-1 mb-3 text-gold text-sm sm:text-base md:text-lg">
                                    <span>★</span>
                                    <span>★</span>
                                    <span>★</span>
                                    <span>★</span>
                                    <span>★</span>
                                </div>
                                <p className="text-sm sm:text-[15px] text-slate-700 mb-4">{card.text}</p>

                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${card.avatar})` }}
                                    />
                                    <div>
                                        <p className="m-0 text-sm font-semibold text-slate-900">{card.name}</p>
                                        <p className="m-0 text-xs text-slate-500">{card.role}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-between items-center gap-4 sm:gap-6">
                    {bottomIcons.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-primary/20">
                                <img src={item.icon} alt={item.label} className="w-full h-full object-cover" />
                            </div>
                            <p className="m-0 text-[11px] sm:text-xs text-center font-medium text-slate-700 max-w-[90px] sm:max-w-[100px]">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
