import React, { useState, useEffect, useRef } from 'react'
import { FiSearch, FiBell, FiMapPin, FiCalendar, FiFilter, FiArrowUp, FiArrowDown, FiUser } from 'react-icons/fi'
import { FaCheckCircle, FaClock, FaCreditCard } from 'react-icons/fa'
import api from '../../api'
import Footer from '../../components/layout/Footer'
import ProfilePic from '../../components/ui/ProfilePic'

export default function UserDashboard({ onLogout, onBack, onForward, canGoBack, canGoForward, onExploreClick, onItineraryClick, onHomeClick, onNotificationClick, onProfileClick, onMyProfileClick, onMyRequestsClick, onSettingsClick, onCountryClick, hideHeaderFooter = false }) {
    const [dropdown, setDropdown] = useState(false)
    const [tripRequests, setTripRequests] = useState([])
    const [countries, setCountries] = useState([])
    const [cities, setCities] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {}
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

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true)
                const [itinerariesRes, countriesRes, citiesRes] = await Promise.all([
                    api.get('/itineraries').catch(() => ({ data: [] })),
                    api.get('/countries').catch(() => ({ data: [] })),
                    api.get('/cities').catch(() => ({ data: [] }))
                ])
                setTripRequests(itinerariesRes.data || [])
                setCountries(countriesRes.data || [])
                setCities(citiesRes.data || [])
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    const normalizeItineraries = (items) => {
        const list = Array.isArray(items) ? items : []
        return list.map((r) => {
            const id = r?._id || r?.id
            const title = r?.title || r?.tripData?.title || r?.experience || 'Trip Request'
            const destination =
                r?.destination ||
                r?.location ||
                r?.tripData?.location ||
                r?.country ||
                r?.tripData?.country ||
                '—'
            const createdAt = r?.createdAt || r?.date || r?.updatedAt
            const status = r?.status || r?.tripStatus || 'Pending'
            const imageUrl = r?.imageUrl || r?.image || r?.tripData?.imageUrl || '/assets/dest-1.jpeg'

            const userId =
                r?.userId ||
                r?.user?._id ||
                r?.user?.id ||
                r?.user ||
                r?.travelerId ||
                r?.customerId
            const email = r?.email || r?.user?.email || r?.contactDetails?.email

            return {
                ...r,
                id,
                title,
                destination,
                createdAt,
                status,
                imageUrl,
                _userId: userId,
                _email: email,
            }
        })
    }

    const myTripRequests = React.useMemo(() => {
        const normalized = normalizeItineraries(tripRequests)
        const currentUserId = currentUser?._id || currentUser?.id
        const currentEmail = (currentUser?.email || '').toLowerCase()

        const filtered = normalized.filter((r) => {
            const requestUserId = r?._userId
            const requestEmail = (r?._email || '').toLowerCase()
            if (currentUserId && requestUserId) return String(requestUserId) === String(currentUserId)
            if (currentEmail && requestEmail) return requestEmail === currentEmail
            return false
        })

        return filtered.length > 0 ? filtered : normalized
    }, [tripRequests, currentUser?._id, currentUser?.id, currentUser?.email])

    const upcomingTrips = myTripRequests
        .filter(req => {
            const s = String(req.status || '').toLowerCase()
            return s === 'payment completed' || s === 'completed' || s === 'accepted'
        })
        .slice(0, 2)

    const normalizeCountryKey = (value) => {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim()
    }

    const countryImageByKey = React.useMemo(() => {
        const map = new Map()

        const list = Array.isArray(cities) ? cities : []
        list.forEach((c) => {
            const countryLabel = c?.country?.name || c?.country
            const key = normalizeCountryKey(countryLabel)
            if (!key) return
            const img = c?.image || c?.imageUrl || c?.Picture || c?.images?.[0]
            if (!img) return
            if (!map.has(key)) map.set(key, img)
        })

        return map
    }, [cities])

    const resolveDestinationImage = (dest) => {
        return (
            dest?.image ||
            dest?.imageUrl ||
            dest?.Picture ||
            dest?.images?.[0] ||
            dest?.coverImage ||
            dest?.thumbnail ||
            countryImageByKey.get(normalizeCountryKey(dest?.name)) ||
            '/assets/dest-1.jpeg'
        )
    }

    const suggestedDestinations = React.useMemo(() => {
        const list = Array.isArray(countries) ? countries.filter(Boolean) : []
        if (list.length <= 3) return list

        const shuffled = [...list]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        const picked = []
        const seenImages = new Set()

        for (const item of shuffled) {
            if (picked.length >= 3) break
            const img = resolveDestinationImage(item)
            const key = String(img || '')
            if (!key) continue
            if (seenImages.has(key)) continue
            seenImages.add(key)
            picked.push(item)
        }

        if (picked.length >= 3) return picked

        // If not enough unique images exist, fill remaining slots.
        for (const item of shuffled) {
            if (picked.length >= 3) break
            if (picked.includes(item)) continue
            picked.push(item)
        }

        return picked.slice(0, 3)
    }, [countries, cities])

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'payment completed':
            case 'accepted':
                return { color: 'bg-emerald-100 text-emerald-700', icon: <FaCreditCard /> };
            case 'supplier replied back':
            case 'ready':
                return { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle /> };
            case 'pending':
            case 'pending review':
            default:
                return { color: 'bg-yellow-100 text-yellow-700', icon: <FaClock /> };
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-primary-brown font-inter">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6E4E]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            {/* Header */}
            {!hideHeaderFooter && (
                <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    if (onHomeClick) {
                                        onHomeClick()
                                    }
                                }}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <img src="/assets/navbar.png" alt="Kufi Travel" className="h-10 w-20 sm:h-[66px] sm:w-28 object-contain" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6">
                            <button
                                className="text-gray-500 hover:text-gray-700 relative"
                                onClick={() => onNotificationClick && onNotificationClick()}
                            >
                                <FiBell size={22} />
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdown(!dropdown)}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <ProfilePic user={currentUser} size="sm" />
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B6E4E" strokeWidth="2" className="hidden md:block">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                {dropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-[#A67C52] hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                if (onMyProfileClick) onMyProfileClick()
                                                setDropdown(false)
                                            }}
                                        >
                                            MY PROFILE
                                        </div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-[#A67C52] hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                if (onMyRequestsClick) {
                                                    onMyRequestsClick()
                                                } else if (onProfileClick) {
                                                    onProfileClick()
                                                }
                                                setDropdown(false)
                                            }}
                                        >
                                            {currentUser.role === 'admin' ? 'ADMIN DASHBOARD' :
                                                currentUser.role === 'supplier' ? 'SUPPLIER DASHBOARD' : 'MY REQUESTS'}
                                        </div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                if (onNotificationClick) onNotificationClick()
                                                setDropdown(false)
                                            }}
                                        >
                                            NOTIFICATIONS
                                        </div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                if (onSettingsClick) onSettingsClick()
                                                setDropdown(false)
                                            }}
                                        >
                                            PAYMENTS
                                        </div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                if (onSettingsClick) onSettingsClick()
                                                setDropdown(false)
                                            }}
                                        >
                                            SETTINGS
                                        </div>
                                        <div className="border-t border-slate-200 my-1"></div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                                            onClick={() => {
                                                if (onLogout) {
                                                    onLogout()
                                                }
                                                setDropdown(false)
                                            }}
                                        >
                                            LOGOUT
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* Hero Section */}
                <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden mb-6 sm:mb-8 md:mb-12 h-[250px] sm:h-[300px] md:h-[400px]">
                    <img
                        src="/assets/treking.jpeg"
                        alt="Hero"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex flex-col justify-center px-4 sm:px-8 md:px-16">
                        <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 font-medium tracking-wide">
                            <FiMapPin />
                            <span>Destination Discovery</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 max-w-3xl leading-tight font-['Playfair_Display'] tracking-tight">
                            Welcome Back! <span className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl align-middle ml-1 sm:ml-2">🌍</span> <br className="hidden sm:block" />
                            <span className="hidden sm:inline">Ready For Your Next <br />Adventure?</span>
                            <span className="sm:hidden">Ready For Your Next Adventure?</span>
                        </h1>
                        <p className="text-white/90 max-w-lg mb-4 sm:mb-8 text-xs sm:text-sm md:text-base font-light leading-relaxed hidden sm:block">
                            Here's a quick look at your latest trip requests and upcoming tours. Let's <br className="hidden md:block" />
                            make your next journey unforgettable!
                        </p>
                        <button
                            onClick={() => {
                                if (onExploreClick) {
                                    onExploreClick()
                                }
                            }}
                            className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3.5 rounded-full font-bold flex items-center gap-2 sm:gap-3 w-fit transition-all hover:scale-105 shadow-xl text-xs sm:text-sm md:text-base"
                        >
                            <FaCheckCircle className="text-sm sm:text-base md:text-lg" />
                            <span className="whitespace-nowrap">Plan a New Trip</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                    {/* Left Column - Trip Requests */}
                    <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">My Trip Requests</h2>

                            <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-600 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                                <button className="flex items-center gap-2 hover:text-gray-900 whitespace-nowrap">
                                    <FiFilter />
                                    All Requests
                                    <FiArrowDown size={14} />
                                </button>
                                <button className="flex items-center gap-2 hover:text-gray-900 whitespace-nowrap">
                                    <FiArrowUp size={14} />
                                    <FiArrowDown size={14} />
                                    Date Created
                                    <FiArrowDown size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 md:gap-6">
                            {myTripRequests.length > 0 ? (
                                myTripRequests.map((trip) => {
                                    const styles = getStatusStyles(trip.status);
                                    return (
                                        <div
                                            key={trip.id || trip._id}
                                            className="bg-white rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => onItineraryClick && onItineraryClick(trip.id || trip._id)}
                                        >
                                            <div className="w-full md:w-48 h-40 sm:h-48 md:h-auto shrink-0">
                                                <img
                                                    src={trip.imageUrl}
                                                    alt={trip.title}
                                                    className="w-full h-full object-cover rounded-lg md:rounded-xl"
                                                />
                                            </div>
                                            <div className="flex-1 py-1 md:py-2">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{trip.title}</h3>
                                                    <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 w-fit ${styles.color}`}>
                                                        {styles.icon}
                                                        <span className="whitespace-nowrap">{trip.status || 'Pending'}</span>
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <FiMapPin className="shrink-0" />
                                                        <span className="truncate">{trip.destination}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                                                    <div className="flex items-center gap-2">
                                                        <FiCalendar className="text-gray-400 shrink-0" />
                                                        <span>Requested: {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : '—'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                                    <p className="text-gray-500 mb-4">No trip requests found.</p>
                                    <button
                                        onClick={onExploreClick}
                                        className="text-primary-brown font-bold hover:underline"
                                    >
                                        Explore experiences to start planning
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="flex flex-col gap-8">
                        {/* Upcoming Trips */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Trips</h3>
                            <div className="flex flex-col gap-4">
                                {upcomingTrips.length > 0 ? (
                                    upcomingTrips.map((trip) => (
                                        <div
                                            key={trip.id || trip._id}
                                            onClick={() => onItineraryClick && onItineraryClick(trip.id || trip._id)}
                                            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div className="h-32 rounded-lg overflow-hidden mb-3">
                                                <img src={trip.imageUrl || trip.image || '/assets/dest-1.jpeg'} alt={trip.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                                                <FiMapPin className="text-gray-400" />
                                                {trip.destination || trip.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 pl-6">
                                                <FiCalendar />
                                                {new Date(trip.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 bg-white rounded-xl border border-gray-100 text-center text-sm text-gray-500">
                                        No upcoming trips.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Suggested Destinations */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Suggested Destinations</h3>
                            <div className="flex flex-col gap-4">
                                {suggestedDestinations.length > 0 ? (
                                    suggestedDestinations.map((dest) => (
                                        <div
                                            key={dest._id || dest.id}
                                            onClick={() => onCountryClick && onCountryClick(dest)}
                                            className="relative rounded-xl overflow-hidden h-40 cursor-pointer group"
                                        >
                                            <img
                                                src={resolveDestinationImage(dest)}
                                                alt={dest.name}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                <span className="text-white font-bold">{dest.name}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 bg-white rounded-xl border border-gray-100 text-center text-sm text-gray-500">
                                        Check back later for suggestions.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {!hideHeaderFooter && <Footer />}
        </div>
    )
}
