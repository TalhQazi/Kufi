import { useState, useRef, useEffect } from 'react'
import './CountryDetails.css'
import Footer from '../../components/layout/Footer'

export default function CountryDetails({
    onHomeClick,
    countryName = "Italy",
    onLogout,
    onNotificationClick,
    onProfileClick,
    onActivityClick,
    onBack,
    onSettingsClick
}) {
    const [dropdown, setDropdown] = useState(false)
    const dropdownRef = useRef(null)

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

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

    const categories = [
        { name: 'Food Tour', icon: '🍽️' },
        { name: 'When Visiting', icon: '📅' },
        { name: 'Ship Cruise', icon: '🚢' },
        { name: 'Memorable Tour', icon: '⭐' },
        { name: 'Summer Visit', icon: '☀️' },
        { name: 'Day Tour', icon: '🌄' }
    ]

    const experiences = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        title: 'Lorem ipsum',
        subtitle: 'Lorem ipsum',
        image: '/assets/activity1.jpeg',
        rating: 4.7,
        price: '$250'
    }))

    const testimonials = [
        {
            id: 1,
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis consectetur mauris id erat dapibus, a facilisis ipsum pulvinar.',
            author: 'Tommy',
            avatar: '/assets/avatar1.jpg',
            rating: 5
        },
        {
            id: 2,
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis consectetur mauris id erat dapibus, a facilisis ipsum pulvinar.',
            author: 'Tommy',
            avatar: '/assets/avatar2.jpg',
            rating: 5
        }
    ]

    const blogs = [
        {
            id: 1,
            title: 'Lorem Amet sit',
            image: '/assets/activity1.jpeg',
            date: 'March 11, 2024'
        },
        {
            id: 2,
            title: 'Lorem Amet sit',
            image: '/assets/activity1.jpeg',
            date: 'March 11, 2024'
        },
        {
            id: 3,
            title: 'Lorem Amet sit',
            image: '/assets/activity1.jpeg',
            date: 'March 11, 2024'
        },
        {
            id: 4,
            title: 'Lorem Amet sit',
            image: '/assets/activity1.jpeg',
            date: 'March 11, 2024'
        }
    ]

    return (
        <div className="country-details">
            {/* Navigation */}
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

                    <div className="country-search-bar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21L16.65 16.65" />
                        </svg>
                        <input type="text" placeholder="Search something" />
                    </div>

                    <div className="country-navbar-right">
                        <button className="country-icon-btn" onClick={onNotificationClick}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </button>

                        <button className="country-icon-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </button>

                        <div className="country-profile-dropdown" ref={dropdownRef}>
                            <button onClick={() => setDropdown(!dropdown)} className="country-profile-btn">
                                <div className="country-profile-avatar">U</div>
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

            {/* Hero Section */}
            <section className="country-hero">
                <div className="country-hero-overlay"></div>
                <img
                    src="/assets/italy-hero.jpg"
                    alt={countryName}
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
                            Italy is an art-filled playground with a long history spanning thousands of years. It is known for its Renaissance art and architecture, and is home to some of the world's most iconic landmarks. From the ancient wonders of Rome to the Renaissance treasures of Florence and the romantic canals of Venice, Italy offers an unforgettable journey through time.
                        </p>
                        <p>
                            Indulge in world-class cuisine, from authentic pasta and pizza to fine wines and gelato. Experience the warmth of Italian hospitality, explore charming villages, pristine coastlines, and stunning countryside. Whether you're seeking art, history, culture, or simply la dolce vita, Italy promises memories that will last a lifetime.
                        </p>
                    </div>
                </section>

                {/* Top Categories */}
                <section className="country-categories">
                    <h2 className="country-section-title">Top Categories in {countryName}</h2>
                    <div className="country-categories-grid">
                        {categories.map((category) => (
                            <div key={category.name} className="country-category-card">
                                <div className="country-category-icon">{category.icon}</div>
                                <h3 className="country-category-name">{category.name}</h3>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Popular Experiences */}
                <section className="country-experiences">
                    <h2 className="country-section-title">Popular Experiences</h2>
                    <div className="country-experiences-grid">
                        {experiences.map((exp) => (
                            <div
                                key={exp.id}
                                className="country-experience-card"
                                onClick={() => onActivityClick && onActivityClick(exp.id)}
                            >
                                <img src={exp.image} alt={exp.title} className="country-experience-image" />
                                <div className="country-experience-content">
                                    <h3 className="country-experience-title">{exp.title}</h3>
                                    <p className="country-experience-subtitle">{exp.subtitle}</p>
                                    <div className="country-experience-footer">
                                        <div className="country-experience-rating">
                                            <span className="star-filled">★</span>
                                            <span>{exp.rating}</span>
                                        </div>
                                        <span className="country-experience-price">{exp.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Feedback Section */}
                <section className="country-feedback">
                    <h2 className="country-section-title">Best Feedback From Clients</h2>
                    <div className="country-feedback-grid">
                        {testimonials.map((testimonial) => (
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
                        {blogs.map((blog) => (
                            <div key={blog.id} className="country-blog-card">
                                <img src={blog.image} alt={blog.title} className="country-blog-image" />
                                <div className="country-blog-content">
                                    <h3 className="country-blog-title">{blog.title}</h3>
                                    <p className="country-blog-date">{blog.date}</p>
                                    <button className="country-blog-btn">Read More</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
