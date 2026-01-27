import { useState, useRef, useEffect } from 'react'
import api from '../../api'
import './CategoryPage.css'
import Footer from '../../components/layout/Footer'
import ProfilePic from '../../components/ui/ProfilePic'

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
        "Camping Adventures": {
            subtitle: "Discover unique outdoor stays and adventure escapes.",
            description: "Experience the magic of sleeping under the stars in some of the world's most breathtaking landscapes. Our curated camping adventures combine comfort with wilderness, offering everything from luxury glamping to authentic backcountry experiences.",
            heroImage: '/assets/camping-hero.jpg'
        },
        // Add more categories as needed
    }

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                setIsLoading(true)
                // Assuming backend supports filtering by category
                const response = await api.get(`/activities?category=${categoryName}`)
                setExperiences(Array.isArray(response.data) ? response.data : [])
            } catch (error) {
                console.error("Error fetching category activities:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCategoryData()
    }, [categoryName])

    const recommendedSpots = [
        {
            id: 1,
            name: 'Glacier National Park',
            location: 'Montana, USA',
            image: '/assets/activity1.jpeg'
        },
        {
            id: 2,
            name: 'Lake Louise',
            location: 'Alberta, Canada',
            image: '/assets/activity1.jpeg'
        },
        {
            id: 3,
            name: 'Sedona Red Rocks',
            location: 'Arizona, USA',
            image: '/assets/activity1.jpeg'
        }
    ]

    const currentCategory = categoryInfo[categoryName] || categoryInfo["Camping Adventures"]

    return (
        <div className="category-page">
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
                                    <ProfilePic user={JSON.parse(localStorage.getItem('currentUser') || '{}')} size="sm" />
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
                    src={currentCategory.heroImage}
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
                                                src={exp.imageUrl || exp.image || "/assets/activity1.jpeg"}
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
                                            <p className="category-experience-location">{exp.city || ""} {exp.country || exp.location}</p>
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
        </div>
    )
}
