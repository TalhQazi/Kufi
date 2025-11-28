export default function BookingSystemSection() {
    const steps = [
        {
            id: 1,
            title: 'Select Activities You Like',
            stepLabel: 'STEP 01',
            image: '/src/assets/book1.jpeg',
        },
        {
            id: 2,
            title: 'Fill Out Request Form',
            stepLabel: 'STEP 02',
            image: '/src/assets/book2.jpeg',
        },
        {
            id: 3,
            title: 'KufiTravel To Optimize Your Itinerary',
            stepLabel: 'STEP 03',
            image: '/src/assets/book3.jpeg',
        },
        {
            id: 4,
            title: 'Review Itinerary & Book',
            stepLabel: 'STEP 04',
            image: '/src/assets/book4.jpeg',
        },
    ]

    return (
        <section className="bg-beige-light py-16 px-20">
            <div className="max-w-[1200px] mx-auto">
                <h2 className="text-[26px] font-bold text-slate-900 mb-10 text-center">Booking System</h2>

                <div className="flex justify-between items-start relative">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className="flex flex-col items-center relative z-10"
                        >
                            <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-primary/30 to-primary-dark/20">
                                <div className="w-full h-full rounded-full overflow-hidden">
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${step.image})` }}
                                    />
                                </div>
                            </div>

                            <p className="mt-4 text-sm font-medium text-center max-w-[140px]">{step.title}</p>
                            <span className="mt-1 text-xs text-slate-500 font-semibold">{step.stepLabel}</span>

                            {index < steps.length - 1 && (
                                <div className="absolute top-20 left-[calc(50%+80px)] w-[calc(100%+40px)] h-0.5 bg-primary/30 -z-10" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
