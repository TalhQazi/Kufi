import { useState, useRef, useEffect, useMemo } from 'react'
import api from '../../api'
import './CountryDetails.css'
import Footer from '../../components/layout/Footer'
import BlogSection from '../../components/home/BlogSection'

export default function CountryDetails({
    onHomeClick,
    countryName = "Italy",
    selectedCityName,
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

    const categories = [
        {
            name: 'Food Tour',
            value: 'FoodTour',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2">
                    <path d="M3 11H21L19 20H5L3 11Z" />
                    <path d="M17 11C17 8 15 5 12 5C9 5 7 8 7 11" />
                    <line x1="12" y1="15" x2="12" y2="17" />
                </svg>
            )
        },
        {
            name: 'When Visiting',
            value: 'whenVisting',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            )
        },
        {
            name: 'Ship Cruise',
            value: 'ShipCrusie',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2">
                    <path d="M4 16c2 1 4 4 8 4s6-3 8-4" />
                    <path d="M4 16V10h16v6" />
                    <path d="M6 10L8 4h8l2 6" />
                    <line x1="12" y1="4" x2="12" y2="2" />
                    <path d="M2 18s4 2 10 2 10-2 10-2" strokeDasharray="2 2" />
                </svg>
            )
        },
        {
            name: 'Memorable Tour',
            value: 'MemorableTour',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
            )
        },
        {
            name: 'Summer Visit',
            value: 'SummerVisit',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            )
        },
        {
            name: 'Day Tour',
            value: 'DayTour',
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2">
                    <path d="M2 20h20L15 6l-5 10L8 12 2 20z" />
                    <circle cx="18" cy="6" r="3" />
                </svg>
            )
        }
    ]

    const displayedExperiences = selectedCategory
        ? experiences.filter((exp) => {
            const expCat = normalizeCategory(exp?.category)
            const target = normalizeCategory(selectedCategory)
            if (!target) return true
            if (!expCat) return false
            return expCat === target || expCat.includes(target)
        })
        : experiences

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
    }, [countryName])

    const getProfileImage = () => {
        if (currentUser.profileImage || currentUser.avatar || currentUser.imageUrl) {
            return currentUser.profileImage || currentUser.avatar || currentUser.imageUrl;
        }
        return null;
    };

    const profileImage = getProfileImage();

    const isPageLoading = Boolean(citiesLoading || isLoading)

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
                    <div className="country-categories-grid">
                        {categories.map((category) => (
                            <div
                                key={category.name}
                                className={`country-category-card ${selectedCategory === category.value ? 'ring-2 ring-primary-brown' : ''}`}
                                onClick={() => {
                                    setSelectedCategory((prev) => (prev === category.value ? null : category.value))
                                    const el = document.getElementById('country-popular-experiences')
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        setSelectedCategory((prev) => (prev === category.value ? null : category.value))
                                        const el = document.getElementById('country-popular-experiences')
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                    }
                                }}
                            >
                                <div className="country-category-icon">{category.icon}</div>
                                <h3 className="country-category-name">{category.name}</h3>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Popular Experiences */}
                <section id="country-popular-experiences" className="country-experiences">
                    <h2 className="country-section-title">Popular Experiences</h2>
                    <div className="country-experiences-grid">
                        {isLoading ? (
                            <div className="col-span-full py-20 flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
                            </div>
                        ) : displayedExperiences.length > 0 ? (
                            displayedExperiences.map((exp) => (
                                <div
                                    key={exp._id || exp.id}
                                    className="country-experience-card"
                                    onClick={() => onActivityClick && onActivityClick(exp._id || exp.id)}
                                >
                                    <div className="country-card-image-wrapper">
                                        <img
                                            src={exp.imageUrl || exp.images?.[0] || exp.image || exp.Picture || "/assets/activity1.jpeg"}
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
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-slate-500">
                                No experiences found in {countryName} yet.
                            </div>
                        )}
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
