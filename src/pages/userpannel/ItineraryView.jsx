import React, { useState, useEffect, useRef } from 'react'
import Footer from '../../components/layout/Footer'

export default function ItineraryView({ onBack, onPaymentClick, onRequestAdjustment, onNotificationClick, onProfileClick, onLogout, onSettingsClick, onHomeClick }) {
    const [dropdown, setDropdown] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
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
            morning: {
                title: "Morning",
                description: "Arrive at Tribhuvan International Airport, Kathmandu (1,300 meter) and your guide, then to your hotel to check-in."
            },
            afternoon: {
                title: "Afternoon",
                description: "Orientation and gears checking by our expert local trekking organizing team and brief you about the trek."
            },
            evening: {
                title: "Evening",
                description: "Welcome dinner with traditional cultural dances and entertainment"
            }
        },
        {
            day: 2,
            title: "Kathmandu Valley Exploration",
            image: "/assets/hero-card2.jpeg",
            morning: {
                title: "Morning",
                description: "Visit the popularly known Kathmandu Durbar Square and explore the other temple grids."
            },
            afternoon: {
                title: "Afternoon",
                description: "Explore Royal Garden Square amidst City of culture. Traditional Nepali art or local food court."
            },
            evening: {
                title: "Evening",
                description: "Return to hotel. Optional hike for sunset/ wine bar session in Kathmandu"
            }
        },
        {
            day: 3,
            title: "Journey to Pokhara",
            image: "/assets/blog1.jpeg",
            morning: {
                title: "Morning",
                description: "Depart early to Pokhara (6-7 hours) through the beautiful mountain countryside"
            },
            afternoon: {
                title: "Afternoon",
                description: "Orientation at lakeside hotel. Exploring local life as Phewa Lake with souvenirs street"
            },
            evening: {
                title: "Evening",
                description: "Lakeside relaxation with sunset of the Annapurna range"
            }
        },
        {
            day: 4,
            title: "Annapurna Base Camp Trek Day 1",
            image: "/assets/blog3.jpeg",
            morning: {
                title: "Morning",
                description: "Early breakfast. Drive to Nayapul, starting point of the trek. Hike to Tikhedhunga"
            },
            afternoon: {
                title: "Afternoon",
                description: "Continue trek through bamboo villages and suspension bridges"
            },
            evening: {
                title: "Evening",
                description: "Traditional mountain lodge stay with hot meal of local favorite dishes with play day rests"
            }
        },
        {
            day: 5,
            title: "Annapurna Base Camp Trek Day 2",
            image: "/assets/blog4.jpeg",
            morning: {
                title: "Morning",
                description: "Trek from Tikhedhunga to Ullerybot through rhododendron historic forests"
            },
            afternoon: {
                title: "Afternoon",
                description: "Arrive at Ghorepani. Rest and acclimatization"
            },
            evening: {
                title: "Evening",
                description: "Dinner at teahouse. Early night for sunrise hike"
            }
        },
        {
            day: 6,
            title: "Poon Hill Sunrise & Return to Pokhara",
            image: "/assets/hero-card1.jpeg",
            morning: {
                title: "Morning",
                description: "Early morning hike to Poon Hill (3,210m) for spectacular sunrise views over Annapurna and Dhaulagiri ranges"
            },
            afternoon: {
                title: "Afternoon",
                description: "Trek back to Nayapul and drive to Pokhara. Check into lakeside hotel"
            },
            evening: {
                title: "Evening",
                description: "Celebratory dinner at lakeside restaurant. Free time for shopping and relaxation"
            }
        },
        {
            day: 7,
            title: "Departure Day",
            image: "/assets/hero-card2.jpeg",
            morning: {
                title: "Morning",
                description: "Breakfast at hotel. Optional early morning boat ride on Phewa Lake"
            },
            afternoon: {
                title: "Afternoon",
                description: "Drive back to Kathmandu (6-7 hours) or optional domestic flight. Last-minute shopping"
            },
            evening: {
                title: "Evening",
                description: "Transfer to airport for departure. End of memorable Nepal adventure"
            }
        }
    ])

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
        newDays[dayIndex][time] = { ...newDays[dayIndex][time], [field]: value }
        setDays(newDays)
    }

    const handleAddDay = () => {
        const nextDayNumber = days.length + 1
        const newDay = {
            day: nextDayNumber,
            title: `New Adventure - Day ${nextDayNumber}`,
            image: "/assets/hero-card1.jpeg",
            morning: {
                title: "Morning",
                description: "Describe the morning activities here..."
            },
            afternoon: {
                title: "Afternoon",
                description: "Describe the afternoon activities here..."
            },
            evening: {
                title: "Evening",
                description: "Describe the evening activities here..."
            }
        }
        setDays([...days, newDay])
    }

    const handleRemoveDay = (index) => {
        const updatedDays = days.filter((_, i) => i !== index).map((day, i) => ({
            ...day,
            day: i + 1 // Re-index day numbers
        }))
        setDays(updatedDays)
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <nav className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 lg:px-20 sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
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
                                <div className="w-8 h-8 rounded-full bg-[#A67C52] flex items-center justify-center text-white font-semibold">
                                    U
                                </div>
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
                                            if (onSettingsClick) {
                                                onSettingsClick()
                                            }
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
            </nav>

            {/* Main Content */}
            <main className="pb-24">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-20 pt-6 sm:pt-8">
                    {/* Hero Image */}
                    <div className="w-full h-[200px] sm:h-[280px] md:h-[320px] relative rounded-2xl sm:rounded-3xl overflow-hidden">
                        <img
                            src="/assets/itinerary-hero.png"
                            alt="Trip Cover"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Content Container */}
                <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

                    {/* Trip Overview */}
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
                                    className={`px-3 sm:px-5 py-2 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${isEditing ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                        }`}
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

                        {/* Info Grid */}
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
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
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

                    {/* Day by Day Itinerary */}
                    <section className="mb-8 sm:mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Day-by-Day Itinerary</h2>

                        <div className="space-y-4 sm:space-y-6">
                            {days.map((day, index) => (
                                <div key={index} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Image */}
                                        <div className="md:w-1/2 h-48 sm:h-64 md:h-72 relative">
                                            <img
                                                src={day.image}
                                                alt={day.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-[#A67C52] text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-bold">
                                                Day {day.day}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="md:w-1/2 p-4 sm:p-6 relative">
                                            {isEditing && (
                                                <button
                                                    onClick={() => handleRemoveDay(index)}
                                                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove Day"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        <line x1="10" y1="11" x2="10" y2="17" />
                                                        <line x1="14" y1="11" x2="14" y2="17" />
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
                                                {/* Morning */}
                                                <div className="flex items-start gap-3">
                                                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
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
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 mb-1">{day.morning.title}</p>
                                                        {isEditing ? (
                                                            <textarea
                                                                value={day.morning.description}
                                                                onChange={(e) => handleSubDayChange(index, 'morning', 'description', e.target.value)}
                                                                className="text-xs text-slate-600 leading-relaxed w-full border border-slate-200 rounded p-1 focus:outline-none focus:border-[#A67C52]"
                                                            />
                                                        ) : (
                                                            <p className="text-xs text-slate-600 leading-relaxed">{day.morning.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Afternoon */}
                                                <div className="flex items-start gap-3">
                                                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="5" />
                                                        <line x1="12" y1="1" x2="12" y2="3" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 mb-1">{day.afternoon.title}</p>
                                                        {isEditing ? (
                                                            <textarea
                                                                value={day.afternoon.description}
                                                                onChange={(e) => handleSubDayChange(index, 'afternoon', 'description', e.target.value)}
                                                                className="text-xs text-slate-600 leading-relaxed w-full border border-slate-200 rounded p-1 focus:outline-none focus:border-[#A67C52]"
                                                            />
                                                        ) : (
                                                            <p className="text-xs text-slate-600 leading-relaxed">{day.afternoon.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Evening */}
                                                <div className="flex items-start gap-3">
                                                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
                                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 mb-1">{day.evening.title}</p>
                                                        {isEditing ? (
                                                            <textarea
                                                                value={day.evening.description}
                                                                onChange={(e) => handleSubDayChange(index, 'evening', 'description', e.target.value)}
                                                                className="text-xs text-slate-600 leading-relaxed w-full border border-slate-200 rounded p-1 focus:outline-none focus:border-[#A67C52]"
                                                            />
                                                        ) : (
                                                            <p className="text-xs text-slate-600 leading-relaxed">{day.evening.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Icons */}
                                            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="1" y="3" width="15" height="13" />
                                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                                    </svg>
                                                    <span>Car</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                                        <line x1="1" y1="10" x2="23" y2="10" />
                                                    </svg>
                                                    <span>Bus</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                        <circle cx="8.5" cy="7" r="4" />
                                                        <polyline points="17 11 19 13 23 9" />
                                                    </svg>
                                                    <span>Transfer</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="8" r="7" />
                                                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                                    </svg>
                                                    <span>Guide</span>
                                                </div>
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

                    {/* Accommodation & Transport */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Accommodation & Transport</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Accommodation */}
                            <div className="border border-slate-200 rounded-lg p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
                                            <path d="M3 21h18M5 21V7l8-4 8 4v14H5z" />
                                        </svg>
                                        <h3 className="text-base font-bold text-slate-900">Accommodation</h3>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Hotel A & B, Kathmandu</p>
                                                <p className="text-xs text-slate-500">Standard Room</p>
                                            </div>
                                            <button className="text-xs text-[#A67C52] font-semibold hover:underline">View it</button>
                                        </div>
                                        <p className="text-xs text-slate-600">3 Star Hotel • 2 Nights (2 - 4th Oct)</p>
                                    </div>

                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Trekkers View Resort & Spa, Pokhara</p>
                                                <p className="text-xs text-slate-500">Standard Room</p>
                                            </div>
                                            <button className="text-xs text-[#A67C52] font-semibold hover:underline">View it</button>
                                        </div>
                                        <p className="text-xs text-slate-600">3 Star Hotel • 2-3 Nights (4 - 6 Oct)</p>
                                    </div>

                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">SivaRanot Lodge (Teahouse)</p>
                                                <p className="text-xs text-slate-500">Standard 3 Bed Room</p>
                                            </div>
                                            <button className="text-xs text-[#A67C52] font-semibold hover:underline">View it</button>
                                        </div>
                                        <p className="text-xs text-slate-600">2 TM/3 Hotel • (7 Oct)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Transportation */}
                            <div className="border border-slate-200 rounded-lg p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
                                            <rect x="1" y="3" width="15" height="13" />
                                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                            <circle cx="5.5" cy="18.5" r="2.5" />
                                            <circle cx="18.5" cy="18.5" r="2.5" />
                                        </svg>
                                        <h3 className="text-base font-bold text-slate-900">Transportation</h3>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Airport Pickup</p>
                                                <p className="text-xs text-slate-500">Private Car Arrival</p>
                                            </div>
                                            <button className="text-xs text-[#A67C52] font-semibold hover:underline">View</button>
                                        </div>
                                        <p className="text-xs text-slate-600">Meets at airport round-trip to hotel (1 KM from RAA to)</p>
                                    </div>

                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Kathmandu to Pokhara</p>
                                                <p className="text-xs text-slate-500">Private Bus</p>
                                            </div>
                                            <button className="text-xs text-[#A67C52] font-semibold hover:underline">View</button>
                                        </div>
                                        <p className="text-xs text-slate-600">Tourist Bus • 220 KM • 6-7 Hours</p>
                                    </div>

                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Pokhara to Kathmandu</p>
                                                <p className="text-xs text-slate-500">Tourist Standard Grade</p>
                                            </div>
                                            <button className="text-xs text-[#A67C52] font-semibold hover:underline">View</button>
                                        </div>
                                        <p className="text-xs text-slate-600">7 - 15 Hotel (1 - 5 Group) • 6 Hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Important Notes */}
                    <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <h3 className="text-base font-bold text-slate-900 mb-3">Important Notes</h3>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            This itinerary is created for traveling back to swarms countries or unforeseen circumstances. Trekking purchases require minimum fitness level. Please contact admin here if you wish to confirm certain routes before booking.
                        </p>
                    </section>
                </div>
                <Footer />
            </main>

            {/* Fixed Bottom Actions */}
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
                                    className="flex-1 sm:flex-none px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false)
                                    }}
                                    className="flex-1 sm:flex-none px-8 py-3 rounded-lg bg-[#22C55E] text-white font-semibold hover:bg-[#16A34A] shadow-lg transition-all"
                                >
                                    Save Adjustments
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 sm:flex-none px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Request Adjustment
                                </button>
                                <button
                                    onClick={onPaymentClick}
                                    className="flex-1 sm:flex-none px-8 py-3 rounded-lg bg-[#A67C52] text-white font-semibold hover:bg-[#8e6a45] shadow-lg transition-all"
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
