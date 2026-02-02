export default function ServicesSection({ onServiceClick }) {
    const services = [
        {
            id: 1,
            label: 'Food Tour',
            categoryKey: 'foodtour',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="stroke-[#A67C52]" strokeWidth="1.2">
                    {/* Globe with pins */}
                    <circle cx="12" cy="14" r="8" />
                    {/* Lat/Long approximation */}
                    <path d="M12 6c-2.5 0-4.5 3.58-4.5 8s2 8 4.5 8 4.5-3.58 4.5-8-2-8-4.5-8" />
                    <path d="M4.5 14h15" />
                    {/* Pin 1 (Center) */}
                    <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5c0 1.5-1.5 3-1.5 3s-1.5-1.5-1.5-3A1.5 1.5 0 0 1 12 2z" fill="none" />
                    {/* Pin 2 (Left) */}
                    <path d="M7 4a1.5 1.5 0 0 1 1.5 1.5c0 1.5-1.5 3-1.5 3s-1.5-1.5-1.5-3A1.5 1.5 0 0 1 7 4z" fill="none" />
                    {/* Pin 3 (Right) */}
                    <path d="M17 4a1.5 1.5 0 0 1 1.5 1.5c0 1.5-1.5 3-1.5 3s-1.5-1.5-1.5-3A1.5 1.5 0 0 1 17 4z" fill="none" />
                </svg>
            )
        },
        {
            id: 2,
            label: 'Day Tour',
            categoryKey: 'daytour',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="stroke-[#A67C52]" strokeWidth="1.2">
                    {/* Cloche */}
                    <path d="M12 3v2" />
                    <path d="M4 17h16" />
                    <path d="M4 17c0-5 3-9 8-9s8 4 8 9" />
                    <path d="M2 17h20v2H2z" /> {/* Plate base */}
                </svg>
            )
        },
        {
            id: 3,
            label: 'Summer Visit',
            categoryKey: 'summervisit',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="stroke-[#A67C52]" strokeWidth="1.2">
                    {/* Ship Front */}
                    <path d="M4 16c2 1 4 4 8 4s6-3 8-4" />
                    <path d="M4 16V10h16v6" />
                    <path d="M6 10L8 4h8l2 6" />
                    <line x1="12" y1="4" x2="12" y2="2" />
                    <path d="M2 18s4 2 10 2 10-2 10-2" strokeDasharray="2 2" /> {/* Water */}
                </svg>
            )
        },
        {
            id: 4,
            label: 'Memorable Tour',
            categoryKey: 'memorabletour',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="stroke-[#A67C52]" strokeWidth="1.2">
                    {/* Mountains */}
                    <path d="M2 20h20L15 6l-5 10L8 12 2 20z" />
                    {/* Sun */}
                    <circle cx="18" cy="6" r="3" />
                    <path d="M18 2v1m4 3h-1m-7 0h1m3 4v-1" /> {/* Rays */}
                    {/* Cloud */}
                    <path d="M4 6a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4" />
                </svg>
            )
        },
        {
            id: 5,
            label: 'Ship Curise',
            categoryKey: 'shipcurise',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="stroke-[#A67C52]" strokeWidth="1.2">
                    {/* Umbrella */}
                    <path d="M12 4v16" />
                    <path d="M4 8c0-4 3.5-5 8-5s8 1 8 5" />
                    <path d="M4 8h16" />
                    {/* Chair Base */}
                    <path d="M7 20h10" />
                    <path d="M7 20l3-6" />
                    <path d="M17 20l-3-6" />
                    <path d="M5 14h14" strokeWidth="1" /> {/* Deck chair seat */}
                </svg>
            )
        },
        {
            id: 6,
            label: 'When Visiting',
            categoryKey: 'whenvisiting',
            icon: (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="stroke-[#A67C52]" strokeWidth="1.2">
                    {/* Bus Front */}
                    <rect x="4" y="4" width="16" height="14" rx="2" />
                    <path d="M4 10h16" /> {/* Windshield bottom */}
                    <path d="M6 18h2" /> {/* Headlight Left */}
                    <path d="M16 18h2" /> {/* Headlight Right */}
                    <path d="M4 22h3" /> {/* Wheel Left */}
                    <path d="M17 22h3" /> {/* Wheel Right */}
                    <line x1="12" y1="10" x2="12" y2="18" /> {/* Grill divider */}
                </svg>
            )
        },
    ]

    return (
        <section className="bg-white py-12 px-4 sm:px-8 lg:px-20 border-b border-[#f0f0f0]">
            <div className="max-w-[1240px] mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-8 text-center">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="flex flex-col items-center gap-3 group cursor-pointer"
                            // onClick={() => {
                            //     if (onServiceClick && service.categoryKey) {
                            //         onServiceClick(service.categoryKey)
                            //     }
                            // }}
                        >
                            <div className="mb-2">
                                {service.icon}
                            </div>
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight">
                                {service.label}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
