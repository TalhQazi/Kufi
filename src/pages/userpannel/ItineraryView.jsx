import React, { useState, useEffect, useRef } from 'react'
import api from '../../api'
import Footer from '../../components/layout/Footer'
import ProfilePic from '../../components/ui/ProfilePic'

export default function ItineraryView({
    itineraryId,
    request,
    onBack,
    onPaymentClick,
    onRequestAdjustment,
    onNotificationClick,
    onProfileClick,
    onLogout,
    onSettingsClick,
    onHomeClick,
    hideHeaderFooter = false
}) {
    const [dropdown, setDropdown] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const dropdownRef = useRef(null)

    const isBookingRequest = Boolean(request && (Array.isArray(request?.items) || request?.tripDetails || request?.contactDetails))

    const coverImage =
        request?.imageUrl ||
        request?.image ||
        request?.items?.[0]?.activity?.imageUrl ||
        request?.items?.[0]?.activity?.images?.[0] ||
        request?.items?.[0]?.activity?.image ||
        request?.items?.[0]?.imageUrl ||
        request?.items?.[0]?.image ||
        '/assets/itinerary-hero.png'

    const [tripData, setTripData] = useState({
        title: "Dubai Desert Safari & City Exploration",
        duration: "7 Days / 6 Nights",
        location: "Dubai, United Arab Emirates",
        date: "10-15th Oct, 2024",
        description: "It involves one or various nights of the itinerary and the carefully curated adventures. From the top of Burj Khalifa to the vast dunes of the desert safari, this trip is fully designed around innovative and outstanding and cultural ventures.",
        adrenalineLevel: "Adrenaline factor",
        category: "Adventure & Culture",
        groupSize: "5 People"
    })

    const [days, setDays] = useState([
        {
            day: 1,
            title: "Arrival & Orientation",
            image: "/assets/hero-card1.jpeg",
            morning: { title: "Morning", description: "Arrive at Tribhuvan International Airport..." },
            afternoon: { title: "Afternoon", description: "Orientation and gears checking..." },
            evening: { title: "Evening", description: "Welcome dinner..." }
        }
    ])

    useEffect(() => {
        const loadFromBooking = () => {
            const title =
                (Array.isArray(request?.items) && request.items.length > 0
                    ? request.items
                        .map((i) => i?.activity?.title || i?.title)
                        .filter(Boolean)
                        .join(', ')
                    : '') ||
                request?.experience ||
                request?.title ||
                'Trip Request'

            const location =
                request?.tripDetails?.country ||
                request?.country ||
                request?.destination ||
                request?.location ||
                '—'

            const budget = request?.tripDetails?.budget || request?.amount || request?.price
            const travelers = request?.guests ?? request?.travelers ?? request?.items?.[0]?.travelers
            const arrival = request?.tripDetails?.arrivalDate
            const departure = request?.tripDetails?.departureDate

            const dateLabel =
                arrival || departure
                    ? `${arrival ? new Date(arrival).toLocaleDateString() : '—'} - ${departure ? new Date(departure).toLocaleDateString() : '—'}`
                    : request?.createdAt
                        ? new Date(request.createdAt).toLocaleDateString()
                        : '—'

            setTripData({
                title,
                duration: request?.duration || '',
                location,
                date: dateLabel,
                description: request?.notes || request?.message || request?.specialRequest || 'Trip request details',
                adrenalineLevel: '',
                category: '',
                groupSize: travelers ? `${travelers} People` : '',
                budget: budget ? String(budget) : '',
                status: request?.status || 'pending',
            })
            setDays([])
        }

        const fetchItinerary = async () => {
            try {
                setLoadError(null)

                if (isBookingRequest) {
                    setLoading(true)
                    loadFromBooking()
                    setLoading(false)
                    return
                }

                if (!itineraryId) {
                    setLoading(false)
                    return
                }

                setLoading(true)
                const response = await api.get(`/itineraries/${itineraryId}`)
                if (response.data) {
                    setTripData(response.data.tripData || response.data)
                    setDays(response.data.days || [])
                }
            } catch (error) {
                setLoadError(error)
                console.error("Error fetching itinerary:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchItinerary()
    }, [itineraryId, isBookingRequest, request])

    const handleSaveAdjustment = async () => {
        try {
            if (!itineraryId) {
                alert('No itinerary selected.')
                return
            }
            await api.patch(`/itineraries/${itineraryId}`, { tripData, days })
            alert("Adjustments saved successfully!")
            setIsEditing(false)
        } catch (error) {
            console.error("Error saving adjustments:", error)
            alert("Failed to save adjustments")
        }
    }

    const handleTripDataChange = (field, value) => {
        setTripData(prev => ({ ...prev, [field]: value }))
    }

    const handleDayChange = (index, field, value) => {
        const newDays = [...days]
        newDays[index] = { ...newDays[index], [field]: value }
        setDays(newDays)
    }

    const handleSubDayChange = (dayIndex, time, field, value) => {
        const newDays = [...days]
        if (newDays[dayIndex][time]) {
            newDays[dayIndex][time] = { ...newDays[dayIndex][time], [field]: value }
            setDays(newDays)
        }
    }

    const handleAddDay = () => {
        const nextDayNumber = days.length + 1
        const newDay = {
            day: nextDayNumber,
            title: `New Adventure - Day ${nextDayNumber}`,
            image: "/assets/hero-card1.jpeg",
            morning: { title: "Morning", description: "Describe the morning activities here..." },
            afternoon: { title: "Afternoon", description: "Describe the afternoon activities here..." },
            evening: { title: "Evening", description: "Describe the evening activities here..." }
        }
        setDays([...days, newDay])
    }

    const handleRemoveDay = (index) => {
        const updatedDays = days.filter((_, i) => i !== index).map((day, i) => ({
            ...day,
            day: i + 1
        }))
        setDays(updatedDays)
    }

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

    if (loading && (itineraryId || isBookingRequest)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A67C52]"></div>
            </div>
        )
    }

    if (!isBookingRequest && !itineraryId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center px-6">
                    <p className="text-slate-600">No request selected.</p>
                    <button
                        type="button"
                        onClick={() => onBack && onBack()}
                        className="mt-4 px-5 py-2 rounded-lg bg-[#A67C52] text-white text-sm font-semibold"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    if (loadError && itineraryId && !isBookingRequest) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center px-6">
                    <p className="text-slate-600">Unable to load itinerary.</p>
                    <button
                        type="button"
                        onClick={() => onBack && onBack()}
                        className="mt-4 px-5 py-2 rounded-lg bg-[#A67C52] text-white text-sm font-semibold"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            {!hideHeaderFooter && (
                <nav className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 lg:px-20 sticky top-0 z-50">
                    <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onHomeClick && onHomeClick()}
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
                                    onClick={() => setDropdown(!dropdown)}
                                    className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <ProfilePic user={JSON.parse(localStorage.getItem('currentUser') || '{}')} size="sm" />
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                {dropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-[#A67C52] hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                onProfileClick && onProfileClick()
                                                setDropdown(false)
                                            }}
                                        >
                                            MY REQUESTS
                                        </div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                onNotificationClick && onNotificationClick()
                                                setDropdown(false)
                                            }}
                                        >
                                            NOTIFICATIONS
                                        </div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                onSettingsClick && onSettingsClick()
                                                setDropdown(false)
                                            }}
                                        >
                                            PAYMENTS
                                        </div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                            onClick={() => {
                                                onSettingsClick && onSettingsClick()
                                                setDropdown(false)
                                            }}
                                        >
                                            SETTINGS
                                        </div>
                                        <div className="border-t border-slate-200 my-1"></div>
                                        <div
                                            className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                                            onClick={() => {
                                                if (onLogout) onLogout()
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
                </nav>
            )}

            <main className="pb-24">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-20 pt-6 sm:pt-8">
                    <div className="w-full h-[200px] sm:h-[280px] md:h-[320px] relative rounded-2xl sm:rounded-3xl overflow-hidden">
                        <img
                            src={coverImage}
                            alt="Trip Cover"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <section className="mb-8 sm:mb-10">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={tripData.title}
                                    onChange={(e) => handleTripDataChange('title', e.target.value)}
                                    className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-300 focus:outline-none focus:border-[#A67C52] bg-transparent w-full sm:w-auto"
                                />
                            ) : (
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{tripData.title}</h2>
                            )}
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                <button className="px-3 sm:px-5 py-2 sm:py-2.5 bg-[#A67C52] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#8e6a45] transition-colors flex items-center gap-2">
                                    <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    <span className="hidden sm:inline">Download PDF</span>
                                    <span className="sm:hidden">PDF</span>
                                </button>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`px-3 sm:px-5 py-2 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${isEditing ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    {isEditing ? 'Cancel Adjustment' : (
                                        <>
                                            <span className="hidden sm:inline">Request Adjustment</span>
                                            <span className="sm:hidden">Adjust</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {isEditing ? (
                            <textarea
                                value={tripData.description}
                                onChange={(e) => handleTripDataChange('description', e.target.value)}
                                className="w-full text-slate-600 leading-relaxed mb-6 text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-[#A67C52]"
                                rows={4}
                            />
                        ) : (
                            <p className="text-slate-600 leading-relaxed mb-6 text-sm">{tripData.description}</p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 rounded-lg p-2 sm:p-3">
                                <svg width="16" height="16" className="sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={tripData.location}
                                        onChange={(e) => handleTripDataChange('location', e.target.value)}
                                        className="text-[10px] sm:text-xs font-semibold text-slate-700 bg-transparent border-none focus:ring-0 p-0 w-full"
                                    />
                                ) : (
                                    <span className="text-[10px] sm:text-xs font-semibold text-slate-700 truncate">{tripData.location}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 rounded-lg p-2 sm:p-3">
                                <svg width="16" height="16" className="sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                </svg>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={tripData.groupSize}
                                        onChange={(e) => handleTripDataChange('groupSize', e.target.value)}
                                        className="text-[10px] sm:text-xs font-semibold text-slate-700 bg-transparent border-none focus:ring-0 p-0 w-full"
                                    />
                                ) : (
                                    <span className="text-[10px] sm:text-xs font-semibold text-slate-700 truncate">{tripData.groupSize}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 rounded-lg p-2 sm:p-3">
                                <svg width="16" height="16" className="sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <path d="M16 2v4M8 2v4M3 10h18" />
                                </svg>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={tripData.date}
                                        onChange={(e) => handleTripDataChange('date', e.target.value)}
                                        className="text-[10px] sm:text-xs font-semibold text-slate-700 bg-transparent border-none focus:ring-0 p-0 w-full"
                                    />
                                ) : (
                                    <span className="text-[10px] sm:text-xs font-semibold text-slate-700 truncate">{tripData.date}</span>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="mb-8 sm:mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Day-by-Day Itinerary</h2>
                        <div className="space-y-4 sm:space-y-6">
                            {days.map((day, index) => (
                                <div key={index} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-1/2 h-48 sm:h-64 md:h-72 relative">
                                            <img
                                                src={day.image || "/assets/hero-card1.jpeg"}
                                                alt={day.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-[#A67C52] text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-bold">
                                                Day {day.day}
                                            </div>
                                        </div>

                                        <div className="md:w-1/2 p-4 sm:p-6 relative">
                                            {isEditing && (
                                                <button
                                                    onClick={() => handleRemoveDay(index)}
                                                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove Day"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            )}
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={day.title}
                                                    onChange={(e) => handleDayChange(index, 'title', e.target.value)}
                                                    className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-5 border-b border-slate-200 focus:outline-none focus:border-[#A67C52] bg-transparent w-full pr-10"
                                                />
                                            ) : (
                                                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-5">{day.title}</h3>
                                            )}

                                            <div className="space-y-4">
                                                {['morning', 'afternoon', 'evening'].map((time) => (
                                                    <div key={time} className="flex items-start gap-3">
                                                        <div className="mt-1">
                                                            {time === 'morning' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>}
                                                            {time === 'afternoon' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /></svg>}
                                                            {time === 'evening' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-bold text-slate-900 mb-1 capitalize">{day[time]?.title || time}</p>
                                                            {isEditing ? (
                                                                <textarea
                                                                    value={day[time]?.description || ''}
                                                                    onChange={(e) => handleSubDayChange(index, time, 'description', e.target.value)}
                                                                    className="text-xs text-slate-600 leading-relaxed w-full border border-slate-200 rounded p-1 focus:outline-none focus:border-[#A67C52]"
                                                                />
                                                            ) : (
                                                                <p className="text-xs text-slate-600 leading-relaxed">{day[time]?.description || ''}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isEditing && (
                            <button
                                onClick={handleAddDay}
                                className="w-full mt-6 py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-semibold hover:border-[#A67C52] hover:text-[#A67C52] hover:bg-orange-50/30 transition-all flex items-center justify-center gap-2"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Another Day
                            </button>
                        )}
                    </section>

                    {!hideHeaderFooter && <Footer />}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-4 px-4 sm:px-8 lg:px-20 shadow-lg z-40">
                <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <p className="text-sm text-slate-500">{isEditing ? 'Editing your itinerary adjustment request...' : 'Ready to book this itinerary?'}</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAdjustment}
                                    className="px-8 py-3 rounded-lg bg-[#22C55E] text-white font-semibold hover:bg-[#16A34A] shadow-lg transition-all"
                                >
                                    Save Adjustments
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Request Adjustment
                                </button>
                                <button
                                    onClick={onPaymentClick}
                                    className="px-8 py-3 rounded-lg bg-[#A67C52] text-white font-semibold hover:bg-[#8e6a45] shadow-lg transition-all"
                                >
                                    Accept Itinerary
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
