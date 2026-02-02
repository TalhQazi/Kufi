import { useState, useRef, useEffect } from 'react'
import api from '../../api'
import './CategoryPage.css'
import Footer from '../../components/layout/Footer'

export default function CategoryPage({
    categoryName = "Camping Adventures",
    onLogout,
    onNotificationClick,
    onProfileClick,
    onActivityClick,
    onBack,
    onHomeClick,
    onSettingsClick,
    hideHeaderFooter = false
}) {
    const [dropdown, setDropdown] = useState(false)
    const [experiences, setExperiences] = useState([])
    const [recommendedSpots, setRecommendedSpots] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const dropdownRef = useRef(null)

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

    // Category data - can be made dynamic
    const categoryInfo = {
        "Culture": {
            subtitle: "Explore traditions, heritage, and stories that shape destinations.",
            description: "Dive into local culture through iconic landmarks, museums, art, history walks, and authentic community experiences designed to help you connect with the heart of a place.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Sightseeing": {
            subtitle: "Discover must-see places and picture-perfect highlights.",
            description: "From famous viewpoints to hidden gems, explore curated sightseeing experiences that capture the best of each destination—ideal for first-time visitors and explorers alike.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Families": {
            subtitle: "Family-friendly experiences packed with comfort and fun.",
            description: "Plan memorable family days with experiences designed for all ages—safe, engaging, and easy to enjoy together, with flexible options and helpful support.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Food and Drink": {
            subtitle: "Taste local flavors and discover signature dishes.",
            description: "Enjoy food tours, tasting experiences, cooking classes, and café discoveries. Perfect for travelers who love cuisine, culture, and unforgettable dining moments.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Adventure": {
            subtitle: "Thrilling experiences for the bold and curious.",
            description: "Chase adrenaline with outdoor adventures, hikes, off-road rides, and unique activities. Carefully selected to balance excitement with safety and quality.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "In the Air": {
            subtitle: "See the world from above with unforgettable views.",
            description: "Experience aerial activities like scenic flights and other sky-high adventures. Capture breathtaking perspectives and add a premium highlight to your trip.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "On the water": {
            subtitle: "Cruise, sail, and explore beautiful waterscapes.",
            description: "Relax on boats, explore coastlines, and enjoy water-based activities. A perfect blend of leisure and discovery for every kind of traveler.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Entertainment": {
            subtitle: "Shows, attractions, and lively experiences to enjoy.",
            description: "From events and attractions to unique entertainment picks, discover activities that keep your itinerary exciting and full of memorable moments.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Seasonal": {
            subtitle: "Limited-time experiences made for the season.",
            description: "Explore seasonal highlights such as festivals, special tours, and weather-perfect activities—curated to match the best time to visit.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Wellness": {
            subtitle: "Slow down, recharge, and travel with balance.",
            description: "Choose relaxing and wellness-focused experiences—from peaceful escapes to rejuvenating activities—crafted to help you feel refreshed during your journey.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Learning": {
            subtitle: "Learn something new while you travel.",
            description: "Hands-on learning experiences that go beyond sightseeing—workshops, local crafts, guided sessions, and cultural learning designed to enrich your trip.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Luxury": {
            subtitle: "Premium experiences with elevated comfort.",
            description: "Indulge in high-end activities and curated experiences with exceptional service, comfort, and exclusivity—crafted for travelers who want the best.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Dates": {
            subtitle: "Romantic experiences made for two.",
            description: "Plan meaningful moments together with date-friendly experiences—romantic views, cozy activities, and memorable outings tailored for couples.",
            heroImage: '/assets/camping-hero.jpg'
        },
        "Camping Adventures": {
            subtitle: "Discover unique outdoor stays and adventure escapes.",
            description: "Experience the magic of sleeping under the stars in some of the world's most breathtaking landscapes. Our curated camping adventures combine comfort with wilderness, offering everything from luxury glamping to authentic backcountry experiences.",
            heroImage: '/assets/camping-hero.jpg'
        },
        // Add more categories as needed
    }

    const pickRandomItems = (arr, count) => {
        const list = Array.isArray(arr) ? [...arr] : []
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[list[i], list[j]] = [list[j], list[i]]
        }
        return list.slice(0, count)
    }

    const normalizeCategory = (value) => {
        return String(value || '')
            .toLowerCase()
            .replace(/adventures?/g, '')
            .replace(/experiences?/g, '')
            .replace(/\s+/g, ' ')
            .trim()
    }

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                setIsLoading(true)
                const response = await api.get('/activities')
                const all = Array.isArray(response.data) ? response.data : []

                const target = normalizeCategory(categoryName)
                const filtered = all.filter((a) => {
                    const cat = normalizeCategory(a?.category)
                    if (!target) return true
                    return cat === target || cat.includes(target) || target.includes(cat)
                })

                const pool = filtered.length > 0 ? filtered : all
                setExperiences(pickRandomItems(pool, 4))

                const derivedRecommended = pickRandomItems(pool, 3).map((a, idx) => {
                    const city = a?.city?.name || a?.city || ''
                    const country = a?.country?.name || a?.country || a?.location || ''
                    const location = [city, country].filter(Boolean).join(', ')
                    return {
                        id: a?._id || a?.id || idx,
                        name: a?.title || 'Activity',
                        location: location || 'Location',
                        image: a?.imageUrl || a?.images?.[0] || a?.image || a?.Picture || '/assets/activity1.jpeg'
                    }
                })
                setRecommendedSpots(derivedRecommended)
            } catch (error) {
                console.error("Error fetching category activities:", error)
                setExperiences([])
                setRecommendedSpots([])
            } finally {
                setIsLoading(false)
            }
        }
        fetchCategoryData()
    }, [categoryName])

    const currentCategory = categoryInfo[categoryName] || categoryInfo["Camping Adventures"]
    const heroImage = experiences?.[0]?.imageUrl || experiences?.[0]?.images?.[0] || experiences?.[0]?.image || experiences?.[0]?.Picture || currentCategory.heroImage

    return (
        <div className="category-page">
            {isLoading ? (
                <div className="min-h-screen w-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
                </div>
            ) : (
                <>
                    {/* Navigation */}
                    {!hideHeaderFooter && (
                        <nav className="category-navbar">
                            <div className="category-navbar-inner">
                                <div className="category-logo">
                                    <button
                                        onClick={() => {
                                            if (onHomeClick) {
                                                onHomeClick()
                                            }
                                        }}
                                        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                                        style={{ background: 'none', border: 'none', padding: 0 }}
                                    >
                                        <img src="/assets/navbar.png" alt="Kufi Travel" className="category-logo-image" />
                                    </button>
                                </div>


                                <div className="category-navbar-right">
                                    <button className="category-icon-btn" onClick={onNotificationClick}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                        </svg>
                                    </button>


                                    <div className="category-profile-dropdown" ref={dropdownRef}>
                                        <button onClick={() => setDropdown(!dropdown)} className="category-profile-btn">
                                            <img
                                                src="/assets/profile-avatar.jpeg"
                                                alt="Profile"
                                                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </button>

                                        {dropdown && (
                                            <div className="category-dropdown-menu">
                                                <div className="category-dropdown-item" onClick={() => { onProfileClick && onProfileClick(); setDropdown(false); }}>
                                                    MY REQUESTS
                                                </div>
                                                <div className="category-dropdown-item" onClick={() => { onNotificationClick && onNotificationClick(); setDropdown(false); }}>
                                                    NOTIFICATIONS
                                                </div>
                                                <div className="category-dropdown-item" onClick={() => {
                                                    if (onSettingsClick) {
                                                        onSettingsClick()
                                                    }
                                                    setDropdown(false);
                                                }}>
                                                    PAYMENTS
                                                </div>
                                                <div className="category-dropdown-item" onClick={() => {
                                                    if (onSettingsClick) {
                                                        onSettingsClick()
                                                    }
                                                    setDropdown(false);
                                                }}>
                                                    SETTINGS
                                                </div>
                                                <div className="category-dropdown-divider"></div>
                                                <div className="category-dropdown-item logout" onClick={() => { onLogout && onLogout(); setDropdown(false); }}>
                                                    LOGOUT
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </nav>
                    )}

                    {/* Hero Banner */}
                    <section className="category-hero">
                        <div className="category-hero-overlay"></div>
                        <img
                            src={heroImage}
                            alt={categoryName}
                            className="category-hero-image"
                            onError={(e) => { e.target.src = '/assets/activity1.jpeg' }}
                        />
                        <div className="category-hero-content">
                            <h1 className="category-hero-title">{categoryName}</h1>
                            <p className="category-hero-subtitle">{currentCategory.subtitle}</p>
                        </div>
                    </section>

                    {/* Main Content */}
                    <main className="category-main">
                        <div className="category-content-wrapper">
                            {/* Left Section - Experiences */}
                            <section className="category-experiences-section">
                                <h2 className="category-section-title">Explore Experiences</h2>

                                <div className="category-experiences-grid">
                                    {isLoading ? (
                                        <div className="col-span-full py-20 flex justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
                                        </div>
                                    ) : experiences.length > 0 ? (
                                        experiences.map((exp) => (
                                            <div
                                                key={exp._id || exp.id}
                                                className="category-experience-card"
                                                onClick={() => onActivityClick && onActivityClick(exp._id || exp.id)}
                                            >
                                                <div className="category-experience-image-wrapper">
                                                    <img
                                                        src={exp.imageUrl || exp.images?.[0] || exp.image || exp.Picture || "/assets/activity1.jpeg"}
                                                        alt={exp.title}
                                                        className="category-experience-image"
                                                    />
                                                    <span
                                                        className="category-experience-badge"
                                                        style={{ backgroundColor: exp.badgeColor || brownColor }}
                                                    >
                                                        {exp.category || "Adventure"}
                                                    </span>
                                                </div>

                                                <div className="category-experience-content">
                                                    <p className="category-experience-location">{exp.city?.name || exp.city || ""} {exp.country?.name || exp.country || exp.location}</p>
                                                    <p className="category-experience-category">{exp.category}</p>
                                                    <h3 className="category-experience-title">{exp.title}</h3>

                                                    <button className="category-view-details-btn">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center text-slate-500">
                                            No experiences found in this category.
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Right Sidebar */}
                            <aside className="category-sidebar">
                                {/* About Category */}
                                <div className="category-about-card">
                                    <h3 className="category-sidebar-title">About this category</h3>
                                    <p className="category-sidebar-text">
                                        {currentCategory.description}
                                    </p>
                                </div>

                                {/* Recommended Spots */}
                                <div className="category-recommended-card">
                                    <h3 className="category-sidebar-title">Top Recommended Spots</h3>
                                    <div className="category-recommended-list">
                                        {recommendedSpots.map((spot) => (
                                            <div key={spot.id} className="category-recommended-item">
                                                <img
                                                    src={spot.image}
                                                    alt={spot.name}
                                                    className="category-recommended-image"
                                                    onError={(e) => { e.target.src = '/assets/activity1.jpeg' }}
                                                />
                                                <div className="category-recommended-info">
                                                    <h4 className="category-recommended-name">{spot.name}</h4>
                                                    <p className="category-recommended-location">{spot.location}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </main>
                    {!hideHeaderFooter && <Footer />}
                </>
            )}
        </div>
    )
}
