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
                <div className="hidden lg:block relative py-10">
                    {/* Connection Lines Layer - CSS Based */}
                    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                        {/* Line 1: Step 1 (top-left) to Step 2 (bottom-center-left) */}
                        <div
                            className="absolute"
                            style={{
                                left: 'calc(12.5% + 88px)',
                                top: 'calc(88px)',
                                width: 'calc(25% - 176px)',
                                transformOrigin: 'top left',
                                borderBottom: '2px dashed #A67C52',
                                transform: 'rotate(32deg)'
                            }}
                        />
                        {/* Line 2: Step 2 (bottom-center-left) to Step 3 (top-center-right) */}
                        <div
                            className="absolute"
                            style={{
                                left: 'calc(37.5% + 88px)',
                                top: 'calc(144px + 88px)',
                                width: 'calc(25% - 176px)',
                                transformOrigin: 'top left',
                                borderBottom: '2px dashed #A67C52',
                                transform: 'rotate(-32deg)'
                            }}
                        />
                        {/* Line 3: Step 3 (top-center-right) to Step 4 (bottom-right) */}
                        <div
                            className="absolute"
                            style={{
                                left: 'calc(62.5% + 88px)',
                                top: 'calc(88px)',
                                width: 'calc(25% - 176px)',
                                transformOrigin: 'top left',
                                borderBottom: '2px dashed #A67C52',
                                transform: 'rotate(32deg)'
                            }}
                        />
                    </div>

                    {/* Gap-0 grid for precise alignment, using padding for spacing */}
                    <div className="grid grid-cols-4 gap-0 relative z-10 intro-step-grid">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`flex flex-col items-center text-center px-4 ${index % 2 === 1 ? 'mt-36' : ''
                                    }`}
                            >
                                <div className="w-44 h-44 rounded-full overflow-hidden shadow-xl border-[6px] border-slate-600/90 relative bg-white z-10 transition-transform duration-300 hover:scale-105">
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${step.image})` }}
                                    />
                                </div>
                                <h3 className="mt-8 text-lg font-medium text-[#A67C52] max-w-[200px] leading-tight">
                                    {step.title}
                                </h3>
                                <div className="mt-4 px-4 py-1 rounded-full border border-[#D1B693] bg-[#fffbf6]">
                                    <span className="text-[10px] font-bold text-[#A67C52] tracking-widest uppercase">
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
