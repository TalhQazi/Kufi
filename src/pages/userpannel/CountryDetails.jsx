import { useState, useRef, useEffect } from 'react'
import api from '../../api'
import './CountryDetails.css'
import Footer from '../../components/layout/Footer'
import ProfilePic from '../../components/ui/ProfilePic'

export default function CountryDetails({
    onHomeClick,
    countryName = "Italy",
    onLogout,
    onNotificationClick,
    onProfileClick,
    onActivityClick,
    onBack,
    onSettingsClick,
    hideHeaderFooter = false
}) {
    const [dropdown, setDropdown] = useState(false)
    const [experiences, setExperiences] = useState([])
    const [isLoading, setIsLoading] = useState(true)
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
        {
            name: 'Food Tour',
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
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
            )
        },
        {
            name: 'Summer Visit',
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
            icon: (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2">
                    <path d="M2 20h20L15 6l-5 10L8 12 2 20z" />
                    <circle cx="18" cy="6" r="3" />
                </svg>
            )
        }
    ]

    const [testimonials, setTestimonials] = useState([])
    const [blogs, setBlogs] = useState([])
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

    useEffect(() => {
        const fetchCountryActivities = async () => {
            try {
                setIsLoading(true)
                const response = await api.get(`/activities?country=${countryName}`)
                setExperiences(Array.isArray(response.data) ? response.data : [])
            } catch (error) {
                console.error("Error fetching country activities:", error)
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
                setTestimonials(feedRes.data || []);
                setBlogs(blogRes.data || []);
            } catch (error) {
                console.error("Error fetching testimonials or blogs:", error);
            }
        }

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
                                    <ProfilePic user={currentUser} size="sm" />
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
                        {isLoading ? (
                            <div className="col-span-full py-20 flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
                            </div>
                        ) : experiences.length > 0 ? (
                            experiences.map((exp) => (
                                <div
                                    key={exp._id || exp.id}
                                    className="country-experience-card"
                                    onClick={() => onActivityClick && onActivityClick(exp._id || exp.id)}
                                >
                                    <div className="country-card-image-wrapper">
                                        <img
                                            src={exp.imageUrl || exp.image || "/assets/activity1.jpeg"}
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

            {!hideHeaderFooter && <Footer />}
        </div>
    )
}
