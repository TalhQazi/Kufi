export default function CategoriesSection() {
    const iconColor = "#9B6F40"

    const categories = [
        {
            name: 'Trekking',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M13 4.99961C13.5523 4.99961 14 4.55189 14 3.99961C14 3.44732 13.5523 2.99961 13 2.99961C12.4477 2.99961 12 3.44732 12 3.99961C12 4.55189 12.4477 4.99961 13 4.99961Z" />
                    <path d="M5.5 21L10 11L8 9L11 7L13 9V6L15 8L17 13M9 19L11 13" />
                    <path d="M7 10L9 8" />
                </svg>
            )
        },
        {
            name: 'Camping',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M3 20L12 3L21 20H3Z" />
                    <path d="M12 3V10" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                </svg>
            )
        },
        {
            name: 'Water Activities',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M3 12C3 12 4.5 9 6 9C7.5 9 9 12 9 12C9 12 10.5 15 12 15C13.5 15 15 12 15 12C15 12 16.5 9 18 9C19.5 9 21 12 21 12" />
                    <path d="M3 17C3 17 4.5 14 6 14C7.5 14 9 17 9 17C9 17 10.5 20 12 20C13.5 20 15 17 15 17C15 17 16.5 14 18 14C19.5 14 21 17 21 17" />
                    <circle cx="12" cy="7" r="2" />
                </svg>
            )
        },
        {
            name: 'Bike Trips',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <path d="M15 6L17 8L12 14L9 11L5.5 14" />
                    <circle cx="17" cy="5" r="1" />
                </svg>
            )
        },
        {
            name: 'Paragliding',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M12 4C6 4 3 8 3 10H21C21 8 18 4 12 4Z" />
                    <path d="M12 10V14" />
                    <path d="M10 14L9 20" />
                    <path d="M14 14L15 20" />
                    <circle cx="12" cy="3" r="1" />
                </svg>
            )
        },
        {
            name: 'Aerial Activities',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M12 2L4 6L12 10L20 6L12 2Z" />
                    <path d="M12 10V22" />
                    <path d="M4 11V17L12 22" />
                    <path d="M20 11V17L12 22" />
                </svg>
            )
        },
        {
            name: 'Religious Tours',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M5 21V7L12 3L19 7V21" />
                    <path d="M5 7H19" />
                    <rect x="9" y="14" width="6" height="7" />
                    <line x1="7" y1="10.5" x2="17" y2="10.5" />
                </svg>
            )
        },
        {
            name: 'Walking Tours',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <circle cx="12" cy="4" r="2" />
                    <path d="M10 8L12 6L14 8V13L12 16" />
                    <path d="M10 15L8 21" />
                    <path d="M12 16L15 21" />
                </svg>
            )
        },
        {
            name: 'Safaris',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M3 12C3 12 5 8 12 8C19 8 21 12 21 12" />
                    <path d="M3 12C3 12 5 16 12 16C19 16 21 12 21 12" />
                    <circle cx="9" cy="12" r="1" fill={iconColor} />
                    <circle cx="15" cy="12" r="1" fill={iconColor} />
                    <path d="M12 4V8" />
                    <path d="M8 5L10 7" />
                    <path d="M16 5L14 7" />
                </svg>
            )
        },
        {
            name: 'Casinos',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="7.5" cy="7.5" r="1" fill={iconColor} />
                    <circle cx="16.5" cy="7.5" r="1" fill={iconColor} />
                    <circle cx="7.5" cy="16.5" r="1" fill={iconColor} />
                    <circle cx="16.5" cy="16.5" r="1" fill={iconColor} />
                    <circle cx="12" cy="12" r="1" fill={iconColor} />
                </svg>
            )
        },
        {
            name: 'Luxury',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M5 9L12 2L19 9" />
                    <path d="M5 9V20H19V9" />
                    <rect x="9" y="14" width="6" height="6" />
                    <path d="M12 2V6" />
                </svg>
            )
        },
        {
            name: 'Food Tour',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M3 11H21L19 20H5L3 11Z" />
                    <path d="M17 11C17 8 15 5 12 5C9 5 7 8 7 11" />
                    <line x1="12" y1="15" x2="12" y2="17" />
                </svg>
            )
        },
    ]

    return (
        <section className="bg-beige py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1120px] mx-auto text-center">
                <div className="mb-8 sm:mb-10">
                    <p className="text-xs font-normal text-primary-dark m-0 mb-1.5">Top Categories</p>
                    <h2 className="text-xl sm:text-[26px] font-bold text-[#1f2933] m-0 mb-2">Explore By Categories</h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-[560px] m-0 mx-auto">
                        Lorem ipsum dolor sit amet consectetur. Porttitor montes mi tristique elit bibendum
                        elit libero egestas pellentesque.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-6 gap-x-6 sm:gap-x-8">
                    {categories.map(({ name, icon }) => (
                        <div key={name} className="flex flex-col items-center gap-2.5 cursor-pointer transition-transform duration-200 hover:-translate-y-1">
                            <div className="w-20 h-20 flex items-center justify-center">
                                {icon}
                            </div>
                            <p className="m-0 text-sm font-medium text-[#1a1a1a] text-center">{name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
