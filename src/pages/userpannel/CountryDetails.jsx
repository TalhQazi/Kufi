import { useState, useRef, useEffect, useMemo } from 'react'
import api from '../../api'
import './CountryDetails.css'
import Footer from '../../components/layout/Footer'
import BlogSection from '../../components/home/BlogSection'

export default function CountryDetails({
    onHomeClick,
    countryName = "Italy",
    selectedCityName,
    selectedActivities = [],
    onAddToList,
    onRemoveActivity,
    onSendRequest,
    onLogout,
    onNotificationClick,
    onProfileClick,
    onActivityClick,
    onBlogClick,
    onBack,
    onSettingsClick,
    hideHeaderFooter = false
}) {
    const [dropdown, setDropdown] = useState(false)
    const [experiences, setExperiences] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [categories, setCategories] = useState([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [country, setCountry] = useState(null)
    const [cities, setCities] = useState([])
    const [citiesLoading, setCitiesLoading] = useState(true)
    const dropdownRef = useRef(null)

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    // If user came from homepage filter (city selected), jump to Cities section
    useEffect(() => {
        if (!selectedCityName) return
        const el = document.getElementById('country-cities')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [selectedCityName, countryName])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdown(false)
            }
        }

        if (dropdown) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdown])

    const brownColor = "#9B6F40"

    const normalizeCategory = (value) => {
        const raw = String(value || '')
            .toLowerCase()
            .replace(/adventures?/g, '')
            .replace(/experiences?/g, '')
            .replace(/[^a-z0-9]/g, '')
            .trim()

        const aliases = {
            shipcrusie: 'shipcruise',
            shipcrusiee: 'shipcruise',
            whenvisting: 'whenvisiting',
            whenvisiting: 'whenvisiting',
            daytour: 'daytour',
            foodtour: 'foodtour',
            memorabletour: 'memorabletour',
            summervisit: 'summervisit'
        }

        return aliases[raw] || raw
    }

    const defaultCategoryIcon = (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
            <rect x="4" y="4" width="16" height="16" rx="3" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
        </svg>
    )

    const normalizeCategoryKey = (value) => {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim()
    }

    const staticCategories = useMemo(() => {
        return [
            {
                name: 'Culture',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M5 21V7L12 3L19 7V21" />
                        <path d="M5 7H19" />
                        <rect x="9" y="14" width="6" height="7" />
                        <line x1="7" y1="10.5" x2="17" y2="10.5" />
                    </svg>
                )
            },
            {
                name: 'Dates',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                )
            },
            {
                name: 'Adventure',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M13 3.99961C13.5523 3.99961 14 3.55189 14 2.99961" />
                        <path d="M5.5 21L10 11L8 9L11 7L13 9V6L15 8L17 13M9 19L11 13" />
                        <path d="M7 10L9 8" />
                    </svg>
                )
            },
            {
                name: 'In the Air',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M12 2L4 6L12 10L20 6L12 2Z" />
                        <path d="M12 10v12" />
                        <path d="M4 11v6l8 5" />
                        <path d="M20 11v6l-8 5" />
                    </svg>
                )
            },
            {
                name: 'Seasonal',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M3 20L12 3L21 20H3Z" />
                        <path d="M12 3v7" />
                        <path d="M2 20h20" />
                    </svg>
                )
            },
            {
                name: 'Families',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                )
            },
            {
                name: 'Day Tour',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M13 3.99961C13.5523 3.99961 14 3.55189 14 2.99961" />
                        <path d="M5.5 21L10 11L8 9L11 7L13 9V6L15 8L17 13M9 19L11 13" />
                        <path d="M7 10L9 8" />
                    </svg>
                )
            },
            {
                name: 'FoodTour',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M3 11H21L19 20H5L3 11Z" />
                        <path d="M17 11C17 8 15 5 12 5C9 5 7 8 7 11" />
                        <line x1="12" y1="15" x2="12" y2="17" />
                    </svg>
                )
            },
            {
                name: 'Learning',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M12 12l2 2 4-4" />
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                )
            },
            {
                name: 'Luxury',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M5 9l7-7 7 7" />
                        <path d="M5 9v11h14V9" />
                        <rect x="9" y="14" width="6" height="6" />
                        <path d="M12 2v4" />
                    </svg>
                )
            },
            {
                name: 'ShipCruise',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M12 2L4 6L12 10L20 6L12 2Z" />
                        <path d="M12 10v12" />
                        <path d="M4 11v6l8 5" />
                        <path d="M20 11v6l-8 5" />
                    </svg>
                )
            },
            {
                name: 'Summer visiting',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M3 20L12 3L21 20H3Z" />
                        <path d="M12 3v7" />
                        <path d="M2 20h20" />
                    </svg>
                )
            },
            {
                name: 'Wellness',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                )
            },
            {
                name: 'WhenVisiting',
                icon: (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                )
            },
        ]
    }, [brownColor])

    const iconByName = useMemo(() => {
        const entries = staticCategories.map(({ name, icon }) => [String(name || '').toLowerCase(), icon])
        return Object.fromEntries(entries)
    }, [staticCategories])

    const iconByKey = useMemo(() => {
        const entries = staticCategories.map(({ name, icon }) => [String(name || ''), icon])
        return Object.fromEntries(entries)
    }, [staticCategories])

    const iconByNormalizedKey = useMemo(() => {
        const entries = staticCategories.map(({ name, icon }) => [normalizeCategoryKey(name), icon])
        const base = Object.fromEntries(entries)

        const aliases = {
            foodtour: 'foodtour',
            foodtours: 'foodtour',
            foodtouradventure: 'foodtour',
            foodanddrink: 'foodtour',

            daytour: 'daytour',
            daytours: 'daytour',

            shipcruise: 'shipcruise',
            shipcruises: 'shipcruise',
            shipcrusie: 'shipcruise',
            shipcrusiee: 'shipcruise',

            summervisiting: 'summervisiting',
            summervisit: 'summervisiting',
            summervisitng: 'summervisiting',

            whenvisiting: 'whenvisiting',
            whenvisting: 'whenvisiting',
        }

        Object.entries(aliases).forEach(([from, to]) => {
            if (!base[from] && base[to]) base[from] = base[to]
        })

        return base
    }, [staticCategories])

    const isIconUrl = (value) => {
        return /^https?:\/\//i.test(String(value || '').trim())
    }

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

    const displayedExperiences = selectedCategory
        ? experiences.filter((exp) => {
            const expCat = normalizeCategory(exp?.category)
            const target = normalizeCategory(selectedCategory)
            if (!target) return true
            if (!expCat) return false
            return expCat === target || expCat.includes(target)
        })
        : experiences

    const isExperienceSelected = (exp) => {
        const expId = exp?._id || exp?.id
        if (!expId) return false
        const list = Array.isArray(selectedActivities) ? selectedActivities : []
        return list.some((a) => String(a?.id || a?._id || '') === String(expId))
    }

    const selectionPanel = (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
            <h4 className="m-0 mb-2 text-lg font-bold text-slate-900">Your Selection</h4>
            <p className="m-0 mb-6 text-sm text-slate-600">
                <span className="font-bold text-primary-brown">{Array.isArray(selectedActivities) ? selectedActivities.length : 0}</span>
                <span className="ml-1">activities selected</span>
            </p>

            {(!Array.isArray(selectedActivities) || selectedActivities.length === 0) ? (
                <div className="py-8 px-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-beige flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9B6F40" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <p className="m-0 mb-2 text-sm font-semibold text-slate-900">Your selection is empty</p>
                    <p className="m-0 text-xs text-slate-500">
                        Add activities from the list to create your custom request
                    </p>
                </div>
            ) : (
                <div className="mb-4 space-y-3 lg:flex-1 lg:overflow-y-auto lg:pr-2 hide-scrollbar">
                    {selectedActivities.map((activity) => (
                        <div key={activity?.id || activity?._id} className="pb-3 border-b border-slate-200 last:border-0">
                            <div className="flex items-center gap-3 mb-2">
                                <img src={activity?.image} alt={activity?.title} className="w-16 h-16 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-900 truncate">{activity?.title}</h4>
                                    <p className="text-xs text-slate-500 truncate">{activity?.location}</p>
                                </div>
                                <button
                                    onClick={() => onRemoveActivity && onRemoveActivity(activity?.id || activity?._id)}
                                    className="p-1 hover:bg-red-50 rounded transition-colors"
                                    title="Remove"
                                    type="button"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="m-0 mb-4 text-xs text-slate-500 italic">
                Review your selected adventures before sending request
            </p>

            <button
                className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${(!Array.isArray(selectedActivities) || selectedActivities.length === 0)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-primary-brown text-white hover:bg-primary-dark'
                    }`}
                disabled={!Array.isArray(selectedActivities) || selectedActivities.length === 0}
                onClick={() => onSendRequest && onSendRequest()}
                type="button"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Send Request
            </button>
        </div>
    )

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

    const staticReviews = [
        { id: 'static-1', rating: 5, text: 'Seamless booking process and an absolutely unforgettable trip—highly recommend!', author: 'Liza', role: 'LIZA' },
        { id: 'static-2', rating: 5, text: 'The best itinerary we’ve ever had; every detail was handled perfectly.', author: 'Mr. John Doe', role: 'MR. JOHN DO' },
        { id: 'static-3', rating: 4, text: 'Professional, responsive, and found us the best deals I could not find online.', author: 'Mr.Jelly', role: 'MR.Jelly' },
        { id: 'static-4', rating: 5, text: 'They took the stress out of travel planning so we could just enjoy the sights', author: 'Mr.Allen', role: 'MR.Allen' },
        { id: 'static-5', rating: 5, text: 'Incredible service from start to finish—we would not book with anyone else now.', author: 'Samia Chahudary', role: 'Samia' },
        { id: 'static-6', rating: 4, text: 'Our honeymoon was flawless thanks to the expert recommendations from this team.', author: 'Della ', role: 'Della' },
        { id: 'static-7', rating: 5, text: 'Five-star service! They handled a last-minute flight change with total ease.', author: 'Queen Doll', role: 'Queen' },
        { id: 'static-8', rating: 5, text: 'Hidden gems and local spots we never would have found on our own.', author: 'Saima', role: 'Saima' },
        { id: 'static-9', rating: 5, text: 'Efficient, friendly, and truly cared about making our vacation special.', author: 'Malifa', role: 'Malifa' },
        { id: 'static-10', rating: 4, text: 'Professional, responsive, and found us the best deals I could not find online.', author: 'Mr.Ali Hassan', role: 'Ali' },
        { id: 'static-11', rating: 5, text: 'A world-class experience; they turned our dream vacation into a reality.', author: 'Mr.Hassan', role: 'Hassan' },
        { id: 'static-12', rating: 4, text: 'Professional, responsive, and found us the best deals I could not find online.', author: 'Faria Sheikh', role: 'Faria' },
        { id: 'static-13', rating: 5, text: 'Incredible service from start to finish—we would not book with anyone else now.', author: 'Nazim', role: 'Nazim' },

    ]

    const displayedReviews = useMemo(() => {
        const reviews = Array.isArray(staticReviews) ? staticReviews.filter(Boolean) : []
        if (reviews.length <= 3) return reviews

        const seedFromString = (value) => {
            const str = String(value || '')
            let hash = 2166136261
            for (let i = 0; i < str.length; i++) {
                hash ^= str.charCodeAt(i)
                hash = Math.imul(hash, 16777619)
            }
            return hash >>> 0
        }

        const mulberry32 = (a) => {
            return function () {
                let t = (a += 0x6D2B79F5)
                t = Math.imul(t ^ (t >>> 15), t | 1)
                t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296
            }
        }

        const rng = mulberry32(seedFromString(countryName))
        const shuffled = [...reviews]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        return shuffled.slice(0, 3)
    }, [countryName])

    useEffect(() => {
        const fetchCountryAndCities = async () => {
            try {
                setCitiesLoading(true)
                const countriesRes = await api.get('/countries')
                const allCountries = Array.isArray(countriesRes.data) ? countriesRes.data : []

                const matchedCountry = allCountries.find(
                    (c) => (c?.name || '').toLowerCase() === (countryName || '').toLowerCase()
                )

                setCountry(matchedCountry || null)

                if (matchedCountry?._id) {
                    const citiesRes = await api.get(
                        `/cities?country=${matchedCountry._id}&countryName=${encodeURIComponent(matchedCountry.name || '')}`
                    )
                    setCities(Array.isArray(citiesRes.data) ? citiesRes.data : [])
                } else {
                    setCities([])
                }
            } catch (error) {
                console.error("Error fetching country/cities:", error)
                setCountry(null)
                setCities([])
            } finally {
                setCitiesLoading(false)
            }
        }

        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true)
                const response = await api.get('/categories')
                setCategories(Array.isArray(response?.data) ? response.data : [])
            } catch (error) {
                console.error('Error fetching categories:', error)
                setCategories([])
            } finally {
                setCategoriesLoading(false)
            }
        }

        const fetchCountryActivities = async () => {
            try {
                setIsLoading(true)
                const response = await api.get('/activities')
                const allActivities = Array.isArray(response.data) ? response.data : []

                const filtered = allActivities.filter((a) => {
                    const c = String(a?.country?.name || a?.country || '').toLowerCase()
                    const loc = String(a?.location || '').toLowerCase()
                    const target = (countryName || '').toLowerCase()
                    return c === target || loc.includes(target)
                })

                setExperiences(filtered)
            } catch (error) {
                console.error("Error fetching country activities:", error)
                setExperiences([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchCountryAndCities()
        fetchCountryActivities()
        fetchCategories()
    }, [countryName])

    const getProfileImage = () => {
        if (currentUser.profileImage || currentUser.avatar || currentUser.imageUrl) {
            return currentUser.profileImage || currentUser.avatar || currentUser.imageUrl;
        }
        return null;
    };

    const profileImage = getProfileImage();

    const isPageLoading = Boolean(citiesLoading || isLoading || categoriesLoading)

    return (
        <div className="country-details">
            {isPageLoading ? (
                <div className="min-h-screen w-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
                </div>
            ) : (
                <>
                    {/* Navigation */}
                    {!hideHeaderFooter && (
                        <nav className="country-navbar">
                            <div className="country-navbar-inner">
                                <div className="country-logo">
                            <button
                                onClick={() => {
                                    if (onHomeClick) {
                                        onHomeClick()
                                    }
                                }}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ background: 'none', border: 'none', padding: 0 }}
                            >
                                <img src="/assets/navbar.png" alt="Kufi Travel" className="country-logo-image" />
                            </button>
                                </div>


                        <div className="country-navbar-right">
                            <button className="country-icon-btn" onClick={onNotificationClick}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                            </button>


                            <div className="country-profile-dropdown" ref={dropdownRef}>
                                <button onClick={() => setDropdown(!dropdown)} className="country-profile-btn">
                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                            onError={(e) => { e.target.src = '/assets/profile-avatar.jpeg' }}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[#a26e35] text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                                            {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                {dropdown && (
                                    <div className="country-dropdown-menu">
                                        <div className="country-dropdown-item" onClick={() => { onProfileClick && onProfileClick(); setDropdown(false); }}>
                                            MY REQUESTS
                                        </div>
                                        <div className="country-dropdown-item" onClick={() => { onNotificationClick && onNotificationClick(); setDropdown(false); }}>
                                            NOTIFICATIONS
                                        </div>
                                        <div className="country-dropdown-item" onClick={() => {
                                            if (onSettingsClick) {
                                                onSettingsClick()
                                            }
                                            setDropdown(false);
                                        }}>
                                            PAYMENTS
                                        </div>
                                        <div className="country-dropdown-item" onClick={() => {
                                            if (onSettingsClick) {
                                                onSettingsClick()
                                            }
                                            setDropdown(false);
                                        }}>
                                            SETTINGS
                                        </div>
                                        <div className="country-dropdown-divider"></div>
                                        <div className="country-dropdown-item logout" onClick={() => { onLogout && onLogout(); setDropdown(false); }}>
                                            LOGOUT
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                            </div>
                        </nav>
                    )}

            {/* Hero Section */}
            <section className="country-hero">
                <div className="country-hero-overlay"></div>
                <img
                    src={country?.image || country?.imageUrl || "/assets/italy-hero.jpg"}
                    alt={country?.name || countryName}
                    className="country-hero-image"
                    onError={(e) => { e.target.src = '/assets/activity1.jpeg' }}
                />
                <div className="country-hero-content">
                    <div className="country-breadcrumb">
                        <button onClick={onBack} className="country-back-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                    </div>
                    <h1 className="country-hero-title">Explore {countryName}</h1>
                    <p className="country-hero-subtitle">Everything you need to know about your next adventure</p>
                </div>
            </section>

            {/* Main Content */}
            <main className="country-main">
                {/* About Section */}
                <section className="country-about">
                    <h2 className="country-section-title">About {countryName}</h2>
                    <div className="country-about-text">
                        <p>
                            {country?.description || `No description found for ${countryName} yet.`}
                        </p>
                    </div>
                </section>

                {/* Cities Section */}
                <section id="country-cities" className="country-experiences">
                    <h2 className="country-section-title">Cities in {countryName}</h2>
                    <div className="country-experiences-grid">
                        {citiesLoading ? (
                            <div className="col-span-full py-20 flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
                            </div>
                        ) : cities.length > 0 ? (
                            cities.map((city) => (
                                <div
                                    key={city._id}
                                    className="country-experience-card"
                                >
                                    <div className="country-card-image-wrapper">
                                        <img
                                            src={city.image || "/assets/activity1.jpeg"}
                                            alt={city.name}
                                            className="country-experience-image"
                                        />
                                    </div>
                                    <div className="country-experience-content">
                                        <h3 className="country-experience-title">{city.name}</h3>
                                        <p className="country-experience-subtitle">{city.description || ""}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-slate-500">
                                No cities found in {countryName} yet.
                            </div>
                        )}
                    </div>
                </section>

                {/* Top Categories */}
                <section className="country-categories">
                    <h2 className="country-section-title">Top Categories in {countryName}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-10 gap-x-8 sm:gap-x-10">
                        {safeCategories.map((category) => {
                            const normalizedNameKey = normalizeCategoryKey(category.name)
                            const normalizedImageKey = normalizeCategoryKey(category.image)
                            const icon = iconByNormalizedKey[normalizedNameKey] || iconByName[String(category.name || '').toLowerCase()] || defaultCategoryIcon
                            const hasImage = Boolean(String(category.image || '').trim())
                            const hasUrlImage = hasImage && isIconUrl(category.image)
                            const builtInIcon = iconByKey[String(category.image || '')]
                            const renderedIcon = hasUrlImage
                                ? (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-contain"
                                        loading="lazy"
                                    />
                                )
                                : builtInIcon
                                    ? builtInIcon
                                    : iconByNormalizedKey[normalizedImageKey]
                                        ? iconByNormalizedKey[normalizedImageKey]
                                        : icon

                            return (
                                <div
                                    key={category.id}
                                    className="flex flex-col items-center gap-3 cursor-pointer transition-transform duration-300 hover:-translate-y-2"
                                    onClick={() => {
                                        setSelectedCategory((prev) => (prev === category.name ? null : category.name))
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            setSelectedCategory((prev) => (prev === category.name ? null : category.name))
                                        }
                                    }}
                                >
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                                        {renderedIcon}
                                    </div>
                                    <p className="m-0 text-sm sm:text-base font-bold text-[#1a1a1a] text-center">{category.name}</p>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Popular Experiences */}
                <section id="country-popular-experiences" className="country-experiences">
                    <h2 className="country-section-title">Popular Experiences</h2>
                    <div className="mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
                        <div className="country-experiences-grid">
                            {isLoading ? (
                                <div className="col-span-full py-20 flex justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
                                </div>
                            ) : displayedExperiences.length > 0 ? (
                                displayedExperiences.map((exp) => {
                                    const expId = exp._id || exp.id
                                    const selected = isExperienceSelected(exp)
                                    const location = exp?.location || exp?.city?.name || exp?.country?.name || exp?.country || ''
                                    const image = exp.imageUrl || exp.images?.[0] || exp.image || exp.Picture || "/assets/activity1.jpeg"

                                    return (
                                        <div
                                            key={expId}
                                            className="country-experience-card"
                                            onClick={() => onActivityClick && onActivityClick(expId)}
                                        >
                                            <div className="country-card-image-wrapper">
                                                <img
                                                    src={image}
                                                    alt={exp.title}
                                                    className="country-experience-image"
                                                />
                                                <div className="country-experience-rating">
                                                    <span>★</span>
                                                    <span>{exp.rating || 4.7}</span>
                                                </div>
                                            </div>
                                            <div className="country-experience-content">
                                                <h3 className="country-experience-title">{exp.title}</h3>
                                                <p className="country-experience-subtitle">{exp.category || "Discovery"}</p>

                                                <button
                                                    type="button"
                                                    className={`mt-3 w-full py-2 rounded-lg text-xs font-bold tracking-wide transition-colors ${selected
                                                        ? 'bg-primary-dark text-white'
                                                        : 'bg-beige text-primary-brown hover:bg-primary-brown hover:text-white'
                                                        }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (selected) return
                                                        onAddToList && onAddToList({
                                                            id: expId,
                                                            title: exp?.title || 'Activity',
                                                            location: location || 'Location',
                                                            image: image,
                                                        })
                                                    }}
                                                >
                                                    {selected ? 'ADDED TO LIST' : 'ADD TO LIST'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="col-span-full py-20 text-center text-slate-500">
                                    No experiences found in {countryName} yet.
                                </div>
                            )}
                        </div>

                        <aside className="lg:sticky lg:top-24 h-fit order-first lg:order-last lg:ml-12">
                            {selectionPanel}
                        </aside>
                    </div>
                </section>

                {/* Feedback Section */}
                <section className="country-feedback">
                    <h2 className="country-section-title">Best Feedback From Clients</h2>
                    <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-5">
                        {displayedReviews.map((testimonial) => (
                                <div
                                    key={testimonial.id}
                                    className="bg-white rounded-[18px] px-6 py-5 shadow-[0_16px_30px_rgba(15,23,42,0.10)] border border-slate-100 w-full sm:w-[320px] lg:w-[310px] min-h-[200px]"
                                >
                                    <div className="flex gap-1 text-[#FFB21E] mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={`${testimonial.id}-star-${i}`}
                                                className={`w-3.5 h-3.5 ${i < (Number(testimonial.rating) || 0) ? 'fill-current' : 'fill-slate-200'}`}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>

                                    <p className="m-0 text-slate-600 text-[13px] leading-relaxed">
                                        “{testimonial.text}”
                                    </p>

                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                                            {(testimonial.author || 'C').charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="m-0 text-xs font-bold text-slate-900 truncate">{testimonial.author}</h4>
                                            <p className="m-0 text-[9px] text-slate-400 font-bold uppercase tracking-[0.22em] leading-none mt-1 truncate">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>

                {/* Travel Blog */}
                <BlogSection onBlogClick={onBlogClick} />
            </main>

                    {!hideHeaderFooter && <Footer />}
                </>
            )}
        </div>
    )
}
