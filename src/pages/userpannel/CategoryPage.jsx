import { useState, useRef, useEffect } from 'react'
import './CategoryPage.css'

export default function CategoryPage({
    categoryName = "Camping Adventures",
    onLogout,
    onNotificationClick,
    onProfileClick,
    onActivityClick,
    onBack
}) {
    const [dropdown, setDropdown] = useState(false)
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

    const experiences = [
        {
            id: 1,
            title: '3-Day Desert Camp under the Stars',
            location: 'Moab, United States',
            category: 'Wild Nature Experiences',
            image: '/assets/activity1.jpeg',
            badge: 'Popular',
            badgeColor: '#9B6F40'
        },
        {
            id: 2,
            title: 'Lakeside Camping & Aurora Viewing',
            location: 'Banff, Canada',
            category: 'Mountain Escape Des...',
            image: '/assets/activity1.jpeg',
            badge: 'Adventure',
            badgeColor: '#059669'
        },
        {
            id: 3,
            title: 'Glamping in the Heart of Yosemite',
            location: 'Yosemite, United States',
            category: 'Wild Nature Experiences',
            image: '/assets/activity1.jpeg',
            badge: 'Luxury',
            badgeColor: '#9B6F40'
        },
        {
            id: 4,
            title: 'Remote Camping in Patagonia Wilderness',
            location: 'Torres del Paine, Chile',
            category: 'Patagonia Adventures',
            image: '/assets/activity1.jpeg',
            badge: 'Recommended',
            badgeColor: '#0ea5e9'
        }
    ]

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
            <nav className="category-navbar">
                <div className="category-navbar-inner">
                    <div className="category-logo">
                        <img src="/assets/navbar.png" alt="Kufi Travel" className="category-logo-image" />
                        <span className="category-logo-text">Kufi<br />Travel</span>
                    </div>

                    <div className="category-search-bar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21L16.65 16.65" />
                        </svg>
                        <input type="text" placeholder="Search something" />
                    </div>

                    <div className="category-navbar-right">
                        <button className="category-icon-btn" onClick={onNotificationClick}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </button>

                        <button className="category-icon-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </button>

                        <div className="category-profile-dropdown" ref={dropdownRef}>
                            <button onClick={() => setDropdown(!dropdown)} className="category-profile-btn">
                                <div className="category-profile-avatar">U</div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {dropdown && (
                                <div className="category-dropdown-menu">
                                    <div className="category-dropdown-item" onClick={() => { onProfileClick && onProfileClick(); setDropdown(false); }}>
                                        MY REQUESTS
                                    </div>
                                    <div className="category-dropdown-item">NOTIFICATIONS</div>
                                    <div className="category-dropdown-item">PAYMENTS</div>
                                    <div className="category-dropdown-item">SETTINGS</div>
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
                            {experiences.map((exp) => (
                                <div
                                    key={exp.id}
                                    className="category-experience-card"
                                    onClick={() => onActivityClick && onActivityClick(exp.id)}
                                >
                                    <div className="category-experience-image-wrapper">
                                        <img src={exp.image} alt={exp.title} className="category-experience-image" />
                                        <span
                                            className="category-experience-badge"
                                            style={{ backgroundColor: exp.badgeColor }}
                                        >
                                            {exp.badge}
                                        </span>
                                    </div>

                                    <div className="category-experience-content">
                                        <p className="category-experience-location">{exp.location}</p>
                                        <p className="category-experience-category">{exp.category}</p>
                                        <h3 className="category-experience-title">{exp.title}</h3>

                                        <button className="category-view-details-btn">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
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
        </div>
    )
}
