import { useState, useEffect, useRef } from 'react'
import api from '../../api'
import Footer from '../../components/layout/Footer'
import ProfilePic from '../../components/ui/ProfilePic'

export default function ActivityDetail({
    activityId,
    onBack,
    onForward,
    canGoBack,
    canGoForward,
    onLogout,
    onNotificationClick,
    onActivityClick,
    onAddToList,
    onHomeClick,
    onProfileClick,
    onSettingsClick,
    hideHeaderFooter = false
}) {
    const [activeTab, setActiveTab] = useState('overview')
    const [travelers, setTravelers] = useState(2)
    const [isLoading, setIsLoading] = useState(true)
    const [activity, setActivity] = useState(null)
    const [similarActivities, setSimilarActivities] = useState([])
    const [addOns, setAddOns] = useState({
        quadBiking: false,
        campingGear: false,
        photographyPackage: false
    })
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const loadData = async () => {
            if (!activityId) {
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const activityRes = await api.get(`/activities/${activityId}`)
                const loadedActivity = activityRes?.data
                setActivity(loadedActivity)

                const normalizeActivities = (items) => {
                    const list = Array.isArray(items) ? items : []
                    return list
                        .filter(a => (a?._id || a?.id) && (a?._id || a?.id) !== activityId)
                        .slice(0, 4)
                        .map((a) => {
                            const id = a?._id || a?.id
                            const image = a?.imageUrl || a?.images?.[0] || a?.image || a?.Picture || '/assets/dest-1.jpeg'
                            const title = a?.title || 'Activity'
                            const badge = a?.category || loadedActivity?.category || ''
                            const location = a?.location || a?.city?.name || a?.country?.name || 'Location'
                            return { id, image, title, badge, location }
                        })
                }

                const loadFallbackSimilarFromAll = async () => {
                    const allRes = await api.get('/activities')
                    const normalized = normalizeActivities(allRes?.data)
                    setSimilarActivities(normalized)
                }

                const loadedCategory = loadedActivity?.category
                if (loadedCategory) {
                    try {
                        const similarRes = await api.get(`/activities/similar?category=${encodeURIComponent(loadedCategory)}`)
                        const rawSimilar = Array.isArray(similarRes?.data) ? similarRes.data : []
                        const normalized = normalizeActivities(rawSimilar)
                        if (normalized.length > 0) {
                            setSimilarActivities(normalized)
                        } else {
                            await loadFallbackSimilarFromAll()
                        }
                    } catch (error) {
                        console.error('Error loading similar activities:', error)
                        try {
                            await loadFallbackSimilarFromAll()
                        } catch (fallbackError) {
                            console.error('Error loading fallback activities:', fallbackError)
                            setSimilarActivities([])
                        }
                    }
                } else {
                    try {
                        await loadFallbackSimilarFromAll()
                    } catch (fallbackError) {
                        console.error('Error loading fallback activities:', fallbackError)
                        setSimilarActivities([])
                    }
                }
            } catch (error) {
                console.error("Error loading activity details:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [activityId])

    const toggleAddOn = (key) => {
        setAddOns(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const activityImage = activity?.imageUrl || activity?.images?.[0] || activity?.image || "/assets/dest-1.jpeg"
    const activityTitle = activity?.title || "Activity"
    const activityCategoryBadges = Array.isArray(activity?.categories)
        ? activity.categories
        : (activity?.category ? [activity.category] : [])
    const activityLocation =
        activity?.location ||
        [activity?.city?.name, activity?.country?.name].filter(Boolean).join(', ') ||
        activity?.city ||
        activity?.country ||
        ""
    const activityRating = typeof activity?.rating === 'number' ? activity.rating : null
    const activityReviewsCount =
        typeof activity?.reviewsCount === 'number'
            ? activity.reviewsCount
            : (Array.isArray(activity?.reviews) ? activity.reviews.length : null)

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            {!hideHeaderFooter && (
                <nav className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 lg:px-20 sticky top-0 z-50">
                    <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    if (onHomeClick) {
                                        onHomeClick()
                                    } else {
                                        window.location.hash = '#home'
                                    }
                                }}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <img src="/assets/navbar.png" alt="Kufi Travel" className="h-10 w-20 sm:h-[66px] sm:w-28 object-contain" />
                            </button>
                        </div>


                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                onClick={() => onNotificationClick && onNotificationClick()}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                            </button>


                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                    className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <ProfilePic user={JSON.parse(localStorage.getItem('currentUser') || '{}')} size="sm" />
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                {showProfileDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-[#A67C52] hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                if (onProfileClick) onProfileClick()
                                                setShowProfileDropdown(false)
                                            }}
                                        >
                                            MY REQUESTS
                                        </div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                if (onNotificationClick) onNotificationClick()
                                                setShowProfileDropdown(false)
                                            }}
                                        >
                                            NOTIFICATIONS
                                        </div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                if (onSettingsClick) onSettingsClick()
                                                setShowProfileDropdown(false)
                                            }}
                                        >
                                            SETTINGS
                                        </div>
                                        <div className="border-t border-slate-200 my-1"></div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                                            onClick={() => {
                                                if (onLogout) onLogout()
                                                setShowProfileDropdown(false)
                                            }}
                                        >
                                            LOGOUT
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Content */}
            <main className="px-4 sm:px-8 lg:px-20 py-6 sm:py-8">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
                    {/* Left Column */}
                    <div>
                        {/* Hero Image */}
                        <div className="relative rounded-2xl overflow-hidden mb-6">
                            <img
                                src={activityImage}
                                alt={activityTitle}
                                className="w-full h-[300px] sm:h-[400px] object-cover"
                            />
                        </div>

                        {/* Category Badges */}
                        {activityCategoryBadges.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {activityCategoryBadges.slice(0, 3).map((badge) => (
                                    <span
                                        key={badge}
                                        className="px-3 py-1 rounded-full bg-beige text-primary-brown text-xs font-medium"
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                            {activityTitle}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 text-xs sm:text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span className="whitespace-nowrap">{activityLocation || 'Location'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-gold">★</span>
                                <span className="font-semibold text-slate-900">{activityRating ?? '—'}</span>
                                <span className="hidden sm:inline">({activityReviewsCount ?? '—'} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                <span>{activity?.duration || '—'}</span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-slate-200 mb-6 overflow-x-auto">
                            <div className="flex gap-4 sm:gap-8 min-w-max">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'overview'
                                        ? 'text-green-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Overview
                                    {activeTab === 'overview' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'reviews'
                                        ? 'text-green-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Reviews ({activityReviewsCount ?? 0})
                                    {activeTab === 'reviews' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('map')}
                                    className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative whitespace-nowrap ${activeTab === 'map'
                                        ? 'text-green-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Map
                                    {activeTab === 'map' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'overview' && (
                            <div>
                                {/* About */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 mb-3">About this experience</h2>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {activity?.description || '—'}
                                    </p>
                                </div>

                                {/* Highlights */}
                                {Array.isArray(activity?.highlights) && activity.highlights.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold text-slate-900 mb-3">Highlights</h2>
                                        <ul className="space-y-2">
                                            {activity.highlights.map((text, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                                                        <path d="M20 6L9 17l-5-5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <span>{text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="py-8 text-center text-slate-500">
                                <p>Reviews content coming soon...</p>
                            </div>
                        )}

                        {activeTab === 'map' && (
                            <div className="py-8 text-center text-slate-500">
                                <p>Map content coming soon...</p>
                            </div>
                        )}

                        {/* Similar Experience */}
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Similar Experience</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {similarActivities.map((activity) => (
                                    <article
                                        key={activity.id}
                                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => {
                                            if (onActivityClick && activity?.id) onActivityClick(activity.id)
                                        }}
                                    >
                                        <div className="relative">
                                            <img
                                                src={activity.image}
                                                alt={activity.title}
                                                className="w-full h-40 object-cover"
                                            />
                                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary-brown text-white text-xs font-medium">
                                                {activity.badge}
                                            </span>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2">{activity.title}</h3>
                                            <div className="flex items-center gap-1.5 mb-3 text-slate-600">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                <span className="text-xs">{activity.location}</span>
                                            </div>
                                            <button
                                                className="w-full py-2 rounded-lg text-xs font-bold bg-beige text-primary-brown hover:bg-primary hover:text-white transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (onAddToList) {
                                                        onAddToList({
                                                            id: activity?.id,
                                                            title: activity?.title,
                                                            location: activity?.location,
                                                            image: activity?.image,
                                                            travelers: travelers,
                                                            addOns: addOns
                                                        })
                                                    }
                                                }}
                                            >
                                                ADD TO LIST
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="lg:sticky lg:top-24 h-fit order-2 lg:order-2">
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
                            {/* Number of Travelers */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-900 mb-3">Number of Travelers</h3>
                                <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                                    <button
                                        onClick={() => setTravelers(Math.max(1, travelers - 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600"
                                    >
                                        −
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        <span className="font-semibold text-slate-900">{travelers}</span>
                                    </div>
                                    <button
                                        onClick={() => setTravelers(travelers + 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Optional Add-ons */}
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-slate-900 mb-3">Optional Add-ons</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={addOns.quadBiking}
                                            onChange={() => toggleAddOn('quadBiking')}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">Quad Biking</div>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={addOns.campingGear}
                                            onChange={() => toggleAddOn('campingGear')}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">Camping Gear</div>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={addOns.photographyPackage}
                                            onChange={() => toggleAddOn('photographyPackage')}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">Photography Package</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Add to List Button */}
                            <button
                                className="w-full py-3 rounded-lg text-sm font-bold bg-primary-brown text-white hover:bg-primary-dark transition-colors"
                                onClick={() => {
                                    if (onAddToList) {
                                        onAddToList({
                                            id: activity?._id || activityId,
                                            title: activityTitle,
                                            location: activityLocation || 'Location',
                                            image: activityImage,
                                            travelers: travelers,
                                            addOns: addOns
                                        })
                                    }
                                }}
                            >
                                ADD TO LIST
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
            {!hideHeaderFooter && <Footer />}
        </div>
    )
}
