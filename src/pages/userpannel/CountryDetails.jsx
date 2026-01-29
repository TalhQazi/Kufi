import { useState, useRef, useEffect } from 'react'
import api from '../../api'
import './CountryDetails.css'
import Footer from '../../components/layout/Footer'

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

    const [testimonials, setTestimonials] = useState([])
    const [blogs, setBlogs] = useState([])
    const [displayedTestimonials, setDisplayedTestimonials] = useState([])
    const [displayedBlogs, setDisplayedBlogs] = useState([])
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

    const fallbackTestimonials = [
        { id: 'fb-1', rating: 5, text: 'Everything was well organized and the support was super quick. Highly recommended!', author: 'Ayesha Khan' },
        { id: 'fb-2', rating: 5, text: 'Booking process was smooth and the itinerary was exactly as promised.', author: 'Hassan Ali' },
        { id: 'fb-3', rating: 4, text: 'Great experience overall. Activities were premium and worth it.', author: 'Sara Ahmed' },
        { id: 'fb-4', rating: 5, text: 'We had an amazing family trip. Excellent planning and guidance.', author: 'Usman Riaz' },
        { id: 'fb-5', rating: 4, text: 'Very cooperative team. They adjusted our plan as per our needs.', author: 'Nimra Zahid' },
        { id: 'fb-6', rating: 5, text: 'The destinations were beautiful and everything was on time.', author: 'Ali Raza' },
        { id: 'fb-7', rating: 5, text: 'Loved the overall service and responsiveness. Will book again.', author: 'Fatima Noor' },
        { id: 'fb-8', rating: 4, text: 'Good value for money and great recommendations for activities.', author: 'Bilal Ahmed' },
    ]

    const fallbackBlogs = [
        { id: 'blog-1', title: 'Top Tips for a Perfect Trip', date: 'Jan 2026', image: '/assets/blog1.jpeg' },
        { id: 'blog-2', title: 'Hidden Gems You Must Visit', date: 'Jan 2026', image: '/assets/blog2.jpeg' },
        { id: 'blog-3', title: 'How to Travel on a Smart Budget', date: 'Jan 2026', image: '/assets/blog3.jpeg' },
        { id: 'blog-4', title: 'What to Pack for Any Trip', date: 'Jan 2026', image: '/assets/blog4.jpeg' },
    ]

    const pickRandomItems = (items, count) => {
        const list = Array.isArray(items) ? items.filter(Boolean) : []
        if (list.length <= count) return list
        const shuffled = [...list]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled.slice(0, count)
    }

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

        const fetchTestimonialsAndBlogs = async () => {
            try {
                const [feedRes, blogRes] = await Promise.all([
                    api.get('/feedbacks'),
                    api.get('/blogs')
                ]);
                const fetchedTestimonials = Array.isArray(feedRes.data) ? feedRes.data : []
                const fetchedBlogs = Array.isArray(blogRes.data) ? blogRes.data : []

                setTestimonials(fetchedTestimonials)
                setBlogs(fetchedBlogs)

                const testimonialsPool = [...fetchedTestimonials, ...fallbackTestimonials]
                    .map((t, idx) => ({
                        id: t?._id || t?.id || `t-${idx}`,
                        rating: t?.rating || 5,
                        text: t?.text || t?.message || t?.comment || '',
                        author: t?.author || t?.name || 'Client'
                    }))
                    .filter(t => t.text)

                setDisplayedTestimonials(pickRandomItems(testimonialsPool, 2))

                const normalizedBlogs = (fetchedBlogs.length > 0 ? fetchedBlogs : fallbackBlogs).map((b, idx) => ({
                    id: b?._id || b?.id || `b-${idx}`,
                    title: b?.title || 'Travel Blog',
                    date: b?.date || (b?.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''),
                    image: b?.imageUrl || b?.image || b?.coverImage || '/assets/blog1.jpeg'
                }))

                setDisplayedBlogs(pickRandomItems(normalizedBlogs, 2))
            } catch (error) {
                console.error("Error fetching testimonials or blogs:", error);
                setDisplayedTestimonials(pickRandomItems(fallbackTestimonials, 2))
                setDisplayedBlogs(pickRandomItems(fallbackBlogs, 2))
            }
        }

        fetchCountryAndCities()
        fetchCountryActivities()
        fetchTestimonialsAndBlogs()
    }, [countryName])

    const getProfileImage = () => {
        if (currentUser.profileImage || currentUser.avatar || currentUser.imageUrl) {
            return currentUser.profileImage || currentUser.avatar || currentUser.imageUrl;
        }
        return null;
    };

    const profileImage = getProfileImage();

    return (
        <div className="country-details">
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
                    <div className="country-feedback-grid">
                        {displayedTestimonials.map((testimonial) => (
                            <div key={testimonial.id} className="country-feedback-card">
                                <div className="country-feedback-stars">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="star-filled">★</span>
                                    ))}
                                </div>
                                <p className="country-feedback-text">{testimonial.text}</p>
                                <div className="country-feedback-author">
                                    <div className="country-feedback-avatar">
                                        {testimonial.author.charAt(0)}
                                    </div>
                                    <span className="country-feedback-name">{testimonial.author}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Travel Blog */}
                <section className="country-blog">
                    <h2 className="country-section-title">Latest Travel Blog</h2>
                    <div className="country-blog-grid">
                        {displayedBlogs.map((blog) => (
                            <div
                                key={blog.id}
                                className="country-blog-card"
                                onClick={() => {
                                    if (onBlogClick && blog?.id) onBlogClick(blog.id)
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        if (onBlogClick && blog?.id) onBlogClick(blog.id)
                                    }
                                }}
                            >
                                <img src={blog.image} alt={blog.title} className="country-blog-image" />
                                <div className="country-blog-content">
                                    <h3 className="country-blog-title">{blog.title}</h3>
                                    <p className="country-blog-date">{blog.date}</p>
                                    <button
                                        className="country-blog-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (onBlogClick && blog?.id) onBlogClick(blog.id)
                                        }}
                                    >
                                        Read More
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {!hideHeaderFooter && <Footer />}
        </div>
    )
}
