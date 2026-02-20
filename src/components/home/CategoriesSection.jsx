import { useEffect, useMemo, useState } from "react";
import api from "../../api";

export default function CategoriesSection({ onCategoryClick }) {
    const iconColor = "#9B6F40"

    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const run = async () => {
            try {
                setIsLoading(true)
                const response = await api.get('/categories')
                const list = Array.isArray(response?.data) ? response.data : []
                if (!isMounted) return
                setCategories(list)
            } catch (error) {
                console.error('Error fetching categories:', error)
                if (!isMounted) return
                setCategories([])
            } finally {
                if (!isMounted) return
                setIsLoading(false)
            }
        }

        run()
        return () => {
            isMounted = false
        }
    }, [])

    const staticCategories = [
        {
            name: 'Culture',
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
            name: 'Sightseeing',
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
            name: 'Families',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            )
        },
        {
            name: 'Food and Drink',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M3 11H21L19 20H5L3 11Z" />
                    <path d="M17 11C17 8 15 5 12 5C9 5 7 8 7 11" />
                    <line x1="12" y1="15" x2="12" y2="17" />
                </svg>
            )
        },
        {
            name: 'Adventure',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M13 3.99961C13.5523 3.99961 14 3.55189 14 2.99961" />
                    <path d="M5.5 21L10 11L8 9L11 7L13 9V6L15 8L17 13M9 19L11 13" />
                    <path d="M7 10L9 8" />
                </svg>
            )
        },
        {
            name: 'In the Air',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M12 2L4 6L12 10L20 6L12 2Z" />
                    <path d="M12 10v12" />
                    <path d="M4 11v6l8 5" />
                    <path d="M20 11v6l-8 5" />
                </svg>
            )
        },
        {
            name: 'On the water',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M2 12c0 2 1 3 3 3s3-1 3-3 1-3 3-3 3 1 3 3 1 3 3 3 3-1 3-3" />
                    <path d="M2 17c0 2 1 3 3 3s3-1 3-3 1-3 3-3 3 1 3 3 1 3 3 3 3-1 3-3" />
                    <path d="M12 9V5" />
                    <path d="M11 5h2" />
                </svg>
            )
        },
        {
            name: 'Entertainment',
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
            name: 'Seasonal',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M3 20L12 3L21 20H3Z" />
                    <path d="M12 3v7" />
                    <path d="M2 20h20" />
                </svg>
            )
        },
        {
            name: 'Wellness',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            )
        },
        {
            name: 'Learning',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M12 12l2 2 4-4" />
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
            )
        },
        {
            name: 'Luxury',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <path d="M5 9l7-7 7 7" />
                    <path d="M5 9v11h14V9" />
                    <rect x="9" y="14" width="6" height="6" />
                    <path d="M12 2v4" />
                </svg>
            )
        },
        {
            name: 'Dates',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            )
        },
    ]

    const defaultIcon = useMemo(() => {
        return (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5">
                <rect x="4" y="4" width="16" height="16" rx="3" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
            </svg>
        )
    }, [iconColor])

    const iconByName = useMemo(() => {
        const entries = staticCategories.map(({ name, icon }) => [String(name || '').toLowerCase(), icon])
        return Object.fromEntries(entries)
    }, [staticCategories])

    const safeCategories = useMemo(() => {
        const list = Array.isArray(categories) ? categories : []
        return list
            .map((c) => {
                const name = String(c?.name || '').trim()
                return {
                    id: c?._id || name,
                    name,
                    image: String(c?.image || '').trim(),
                }
            })
            .filter((c) => Boolean(c.name))
    }, [categories])

    return (
        <section className="bg-[#F5F1ED] py-16 sm:py-20 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1200px] mx-auto text-center">
                <div className="mb-12 sm:mb-14">
                    <p className="text-2xl sm:text-3xl font-sacramento text-[#A67C52] m-0 mb-2">Top Categories</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] m-0 mb-4">Explore By Categories</h2>
                    <p className="text-sm sm:text-base text-slate-600 max-w-[680px] m-0 mx-auto leading-relaxed">
                        Select according to your interest to check. Choose your own interest and join kufi travelling agency overall world.
                    </p>
                </div>

                {isLoading ? (
                    <div className="py-10 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#704b24]"></div>
                    </div>
                ) : safeCategories.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-600">No categories found.</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-10 gap-x-8 sm:gap-x-10">
                        {safeCategories.map(({ id, name, image }) => {
                            const icon = iconByName[String(name || '').toLowerCase()] || defaultIcon
                            const hasImage = Boolean(String(image || '').trim())
                            return (
                                <div
                                    key={id}
                                    className="flex flex-col items-center gap-3 cursor-pointer transition-transform duration-300 hover:-translate-y-2"
                                    onClick={() => {
                                        if (onCategoryClick) {
                                            onCategoryClick(name)
                                        }
                                    }}
                                >
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                                        {hasImage ? (
                                            <img
                                                src={image}
                                                alt={name}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        ) : (
                                            icon
                                        )}
                                    </div>
                                    <p className="m-0 text-sm sm:text-base font-bold text-[#1a1a1a] text-center">{name}</p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}
