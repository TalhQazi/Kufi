import { useState, useEffect, useRef, useMemo } from 'react'
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
    selectedActivities = [],
    onRemoveActivity,
    onSendRequest,
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
    const [selectedAddOnLabels, setSelectedAddOnLabels] = useState([])
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const loadData = async () => {
            setActivity(null)
            setSimilarActivities([])
            setAddOns({
                quadBiking: false,
                campingGear: false,
                photographyPackage: false
            })
            setSelectedAddOnLabels([])

            if (!activityId) {
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const activityRes = await api.get(`/activities/${activityId}`)
                const loadedActivity = activityRes?.data
                setActivity(loadedActivity)

                const normalizeCountryKey = (value) => {
                    return String(value || '')
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '')
                        .trim()
                }

                const getCountryLabel = (a) => {
                    const fromLocationString = () => {
                        const loc = String(a?.location || a?.locationName || '').trim()
                        if (!loc) return ''
                        const parts = loc.split(',').map(p => p.trim()).filter(Boolean)
                        if (parts.length === 0) return ''
                        return parts[parts.length - 1]
                    }

                    return (
                        a?.country?.name ||
                        a?.country?.title ||
                        a?.country?.label ||
                        (Array.isArray(a?.country) ? (a.country[0]?.name || a.country[0]?.title || '') : '') ||
                        a?.city?.country?.name ||
                        a?.city?.countryName ||
                        a?.countryName ||
                        a?.country ||
                        a?.locationCountry ||
                        a?.location?.country ||
                        fromLocationString() ||
                        ''
                    )
                }

                const activeCountryKey = normalizeCountryKey(getCountryLabel(loadedActivity))

                const normalizeActivities = (items) => {
                    const list = Array.isArray(items) ? items : []
                    return list
                        .filter(a => (a?._id || a?.id) && (a?._id || a?.id) !== activityId)
                        .filter((a) => {
                            if (!activeCountryKey) return true
                            return normalizeCountryKey(getCountryLabel(a)) === activeCountryKey
                        })
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
                setActivity(null)
                setSimilarActivities([])
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [activityId])

    const toggleAddOn = (key) => {
        const allowed = !!activity?.addOns?.[key]
        if (!allowed) return
        setAddOns(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const toggleAddOnLabel = (label) => {
        const normalized = String(label || '').trim()
        if (!normalized) return
        if (!availableAddOnLabels.includes(normalized)) return
        setSelectedAddOnLabels((prev) => {
            const next = Array.isArray(prev) ? [...prev] : []
            const idx = next.indexOf(normalized)
            if (idx >= 0) {
                next.splice(idx, 1)
            } else {
                next.push(normalized)
            }
            return next
        })
    }

    const rawAvailableAddOns = activity?.addOns
    const legacyAddOnMap = {
        quadBiking: 'Quad Biking',
        campingGear: 'Camping Gear',
        photographyPackage: 'Photography Package',
    }

    const availableAddOnLabels = Array.isArray(rawAvailableAddOns)
        ? rawAvailableAddOns.map((v) => String(v || '').trim()).filter(Boolean)
        : (rawAvailableAddOns && typeof rawAvailableAddOns === 'object')
            ? Object.keys(legacyAddOnMap).filter((k) => !!rawAvailableAddOns[k]).map((k) => legacyAddOnMap[k])
            : []

    const availableAddOns = (rawAvailableAddOns && typeof rawAvailableAddOns === 'object' && !Array.isArray(rawAvailableAddOns))
        ? rawAvailableAddOns
        : {}

    const hasAnyAddOns = Array.isArray(availableAddOnLabels) && availableAddOnLabels.length > 0

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
    const googleMapsApiKey = "AIzaSyAWXLVRCfHG9losAeOQjq5TiMcTDbtDeGQ"
    const mapQuery = encodeURIComponent(activityLocation || activityTitle || '')
    const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${mapQuery}`
    const activityRating = typeof activity?.rating === 'number' ? activity.rating : null
    const activityReviewsCount =
        typeof activity?.reviewsCount === 'number'
            ? activity.reviewsCount
            : (Array.isArray(activity?.reviews) ? activity.reviews.length : null)

    const isCurrentActivityInSelection = useMemo(() => {
        const currentId = activity?._id || activityId
        if (!currentId) return false
        const list = Array.isArray(selectedActivities) ? selectedActivities : []
        return list.some((a) => String(a?.id || a?._id || '') === String(currentId))
    }, [selectedActivities, activity?._id, activityId])

    const displayedReviews = useMemo(() => {
        const normalizeReviews = (items) => {
            const list = Array.isArray(items) ? items : []
            return list
                .map((r, idx) => {
                    const id = r?._id || r?.id || `${activityId || 'activity'}-review-${idx}`
                    const rating = Number(r?.rating ?? r?.stars ?? 5)
                    const text = r?.text || r?.message || r?.comment || r?.feedback || ''
                    const author = r?.author || r?.name || 'Client'
                    const role = r?.role || r?.title || 'CLIENT'
                    return { id, rating: Number.isFinite(rating) ? rating : 5, text, author, role }
                })
                .filter((r) => r.text)
        }

        const realReviews = normalizeReviews(activity?.reviews)
        if (realReviews.length > 0) return realReviews.slice(0, 6)

        const fallbackReviews = [
            { id: 'fb-1', rating: 5, text: 'Great experience overall. Everything was smooth and well-managed.', author: 'Ayesha', role: 'CLIENT' },
            { id: 'fb-2', rating: 5, text: 'Super responsive support and the activity was exactly as described.', author: 'Hassan', role: 'CLIENT' },
            { id: 'fb-3', rating: 4, text: 'Worth the price. Timing and coordination were excellent.', author: 'Sara', role: 'CLIENT' },
            { id: 'fb-4', rating: 5, text: 'We had an amazing time. Would definitely recommend to friends.', author: 'Usman', role: 'CLIENT' },
            { id: 'fb-5', rating: 4, text: 'Very professional team and great suggestions for the itinerary.', author: 'Nimra', role: 'CLIENT' },
            { id: 'fb-6', rating: 5, text: 'Perfectly organized. No hassle, just pure enjoyment.', author: 'Ali', role: 'CLIENT' },
        ]

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

        const rng = mulberry32(seedFromString(activityId || activityTitle || ''))
        const shuffled = [...fallbackReviews]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        return shuffled.slice(0, 3)
    }, [activityId, activityTitle, activity?.reviews])

    const addToListPanel = (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
            {hasAnyAddOns && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Optional Add-ons</h3>
                    <div className="space-y-3">
                        {Array.isArray(rawAvailableAddOns) ? (
                            <div className="space-y-3">
                                {availableAddOnLabels.map((label, idx) => {
                                    const checked = Array.isArray(selectedAddOnLabels)
                                        ? selectedAddOnLabels.includes(label)
                                        : false

                                    return (
                                        <label key={`${label}-${idx}`} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleAddOnLabel(label)}
                                                className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{label}</div>
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        ) : availableAddOns?.quadBiking && (
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
                        )}

                        {!Array.isArray(rawAvailableAddOns) && availableAddOns?.campingGear && (
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
                        )}

                        {!Array.isArray(rawAvailableAddOns) && availableAddOns?.photographyPackage && (
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
                        )}
                    </div>
                </div>
            )}

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
                            addOns: Array.isArray(rawAvailableAddOns)
                                ? selectedAddOnLabels
                                : addOns
                        })
                    }
                }}
            >
                ADD TO LIST
            </button>
        </div>
    )

    const selectionPanel = (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
            <h4 className="m-0 mb-2 text-lg font-bold text-slate-900">Your Selection</h4>
            <p className="m-0 mb-6 text-sm text-slate-600">
                <span className="font-bold text-primary-brown">{selectedActivities.length}</span>
                <span className="ml-1">activities selected</span>
            </p>

            {selectedActivities.length === 0 ? (
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
                <div className="space-y-3">
                    {selectedActivities.map(item => (
                        <div key={item.id || item._id} className="pb-3 border-b border-slate-200 last:border-0">
                            <div className="flex items-center gap-3">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h4>
                                    <p className="text-xs text-slate-500 truncate">{item.location}</p>
                                </div>
                                <button
                                    onClick={() => onRemoveActivity && onRemoveActivity(item.id || item._id)}
                                    className="p-1 hover:bg-red-50 rounded transition-colors"
                                    title="Remove"
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

            <button
                className={`w-full mt-5 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${selectedActivities.length === 0
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-primary-brown text-white hover:bg-primary-dark'
                    }`}
                disabled={selectedActivities.length === 0}
                onClick={() => onSendRequest && onSendRequest()}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Send Request
            </button>
        </div>
    )

    return (
        <div className="bg-white min-h-screen">
            {isLoading ? (
                <div className="min-h-screen w-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
                </div>
            ) : !activityId ? (
                <div className="min-h-screen w-full flex items-center justify-center text-slate-500">
                    No activity selected.
                </div>
            ) : !activity ? (
                <div className="min-h-screen w-full flex items-center justify-center text-slate-500">
                    Activity not found.
                </div>
            ) : (
                <>
                   
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

            
            <main className="px-4 sm:px-8 lg:px-20 py-6 sm:py-8">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
                   
                    <div className="lg:hidden order-1">
                        {selectionPanel}
                    </div>
                    
                    <div className="order-2 lg:order-none">
                        
                        <div className="relative rounded-2xl overflow-hidden mb-6">
                            <img
                                src={activityImage}
                                alt={activityTitle}
                                className="w-full h-[300px] sm:h-[400px] object-cover"
                            />
                        </div>

                        
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

                       
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                            {activityTitle}
                        </h1>

                       
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 text-xs sm:text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span className="whitespace-nowrap">{activityLocation || '—'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-gold">★</span>
                                <span className="font-semibold text-slate-900">{activityRating ?? '—'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                <span>{activity?.duration || '—'}</span>
                            </div>
                        </div>

                       
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
                                    Reviews 
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

                       
                        {activeTab === 'overview' && (
                            <div>
                               
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 mb-3">About this experience</h2>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {activity?.description || '—'}
                                    </p>
                                </div>

                               
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

                                
                                <div className="lg:hidden mb-8">
                                    {!isCurrentActivityInSelection ? addToListPanel : null}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="py-6">
                                {displayedReviews.length === 0 ? (
                                    <div className="py-8 text-center text-slate-500">
                                        No reviews yet.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {displayedReviews.slice(0, 3).map((review) => (
                                            <div
                                                key={review.id}
                                                className="bg-white rounded-xl px-5 py-4 shadow-[0_16px_30px_rgba(15,23,42,0.08)] border border-slate-100"
                                            >
                                                <div className="flex gap-1 text-[#FFB21E] mb-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={`${review.id}-star-${i}`}
                                                            className={`w-3.5 h-3.5 ${i < (Number(review.rating) || 0) ? 'fill-current' : 'fill-slate-200'}`}
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>

                                                <p className="m-0 text-slate-600 text-sm leading-relaxed">“{review.text}”</p>

                                                <div className="mt-4 flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {(review.author || 'C').charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="m-0 text-xs font-bold text-slate-900 truncate">{review.author}</h4>
                                                        <p className="m-0 text-[9px] text-slate-400 font-bold uppercase tracking-[0.22em] leading-none mt-1 truncate">{review.role}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'map' && (
                            <div className="py-6">
                                {mapQuery ? (
                                    <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden shadow-md border border-slate-200">
                                        <iframe
                                            title="Activity location map"
                                            src={mapEmbedUrl}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500">
                                        No location available for this activity.
                                    </p>
                                )}
                                {!googleMapsApiKey && (
                                    <p className="mt-3 text-xs text-center text-amber-600">
                                        Google Maps API key is not configured. Add VITE_GOOGLE_MAPS_API_KEY in your .env.local.
                                    </p>
                                )}
                            </div>
                        )}

                        
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
                                                            addOns: Array.isArray(rawAvailableAddOns)
                                                                ? selectedAddOnLabels
                                                                : addOns
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

                   
                    <aside className="hidden lg:block lg:sticky lg:top-24 h-fit order-2 lg:order-2">
                        <div className="space-y-6">
                            {!isCurrentActivityInSelection ? addToListPanel : null}
                            {selectionPanel}
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
