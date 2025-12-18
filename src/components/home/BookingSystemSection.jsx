export default function BookingSystemSection() {
    const steps = [
        {
            id: 1,
            title: 'Select Activities You Like',
            stepLabel: 'STEP 01',
            image: '/assets/book1.jpeg',
        },
        {
            id: 2,
            title: 'Fill Out Request Form',
            stepLabel: 'STEP 02',
            image: '/assets/book2.jpeg',
        },
        {
            id: 3,
            title: 'KufiTravel To Optimize Your Itinerary',
            stepLabel: 'STEP 03',
            image: '/assets/book3.jpeg',
        },
        {
            id: 4,
            title: 'Review Itinerary & Book',
            stepLabel: 'STEP 04',
            image: '/assets/book4.jpeg',
        },
    ]

    return (
        <section className="bg-white py-16 sm:py-24 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1240px] mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-20 text-center tracking-tight">
                    Booking System
                </h2>

                {/* Desktop layout - Zig-Zag flow */}
                <div className="hidden lg:block relative py-10 mb-20 min-h-[500px]">
                    {/* Connection Lines Layer - SVG Based with viewBox for reliability */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 1000 500"
                        preserveAspectRatio="none"
                        style={{ zIndex: 1 }}
                    >
                        <path
                            d="M 125,136 L 375,312 L 625,136 L 875,312"
                            fill="none"
                            stroke="#D1B693"
                            strokeWidth="2"
                            strokeDasharray="8,8"
                        />
                    </svg>

                    <div className="relative z-10 grid grid-cols-4 gap-0">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`flex flex-col items-center text-center px-4 ${index % 2 === 1 ? 'mt-44' : ''
                                    }`}
                            >
                                <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-[8px] border-slate-700/80 relative bg-white transition-transform duration-300 hover:scale-105">
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${step.image})` }}
                                    />
                                </div>
                                <h3 className="mt-8 text-lg font-bold text-slate-800 max-w-[200px] leading-tight">
                                    {step.title}
                                </h3>
                                <div className="mt-3 px-4 py-1 rounded-full border border-slate-200 bg-white shadow-sm">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                        {step.stepLabel}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tablet/Mobile layout - Vertical or 2x2 */}
                <div className="lg:hidden flex flex-col gap-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex flex-col items-center text-center">
                                <div className="w-40 h-40 rounded-full overflow-hidden shadow-lg border-[6px] border-slate-600/90">
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${step.image})` }}
                                    />
                                </div>
                                <h3 className="mt-6 text-lg font-medium text-[#A67C52] max-w-[200px]">
                                    {step.title}
                                </h3>
                                <div className="mt-3 px-4 py-1 rounded-full border border-[#D1B693] bg-white">
                                    <span className="text-[10px] font-bold text-[#A67C52] tracking-widest uppercase">
                                        {step.stepLabel}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
