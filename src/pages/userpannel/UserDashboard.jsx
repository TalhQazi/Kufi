import React, { useState, useEffect, useRef } from 'react'
import { FiSearch, FiBell, FiMessageSquare, FiMapPin, FiCalendar, FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { FaCheckCircle, FaClock, FaCreditCard } from 'react-icons/fa'
import Footer from '../../components/layout/Footer'

export default function UserDashboard({ onLogout, onBack, onForward, canGoBack, canGoForward, onExploreClick, onItineraryClick, onHomeClick, onNotificationClick, onProfileClick, onSettingsClick, onCountryClick }) {
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
    const tripRequests = [
        {
            id: 1,
            title: '3-Day Dubai Adventure',
            location: 'Dubai, UAE',
            supplier: 'Desert Dreams Travel',
            requestDate: '1/15/2025',
            travelDates: 'Mar 20-23, 2025',
            price: '$2,450',
            status: 'Accepted by Supplier',
            statusColor: 'bg-green-100 text-green-700',
            statusIcon: <FaCheckCircle />,
            image: '/assets/dest-1.jpeg'
        },
        {
            id: 2,
            title: 'Bali Cultural Experience',
            location: 'Bali, Indonesia',
            supplier: 'Island Explorers',
            requestDate: '1/15/2025',
            travelDates: 'Mar 20-23, 2025',
            price: '$2,450',
            status: 'Pending Review',
            statusColor: 'bg-yellow-100 text-yellow-700',
            statusIcon: <FaClock />,
            image: '/assets/dest-2.jpeg'
        },
        {
            id: 3,
            title: 'Paris Romance Getaway',
            location: 'Paris, France',
            supplier: 'Desert Dreams Travel',
            requestDate: '1/15/2025',
            travelDates: 'Mar 20-23, 2025',
            price: '$2,450',
            status: 'Payment Completed',
            statusColor: 'bg-emerald-100 text-emerald-700',
            statusIcon: <FaCreditCard />,
            image: '/assets/dest-3.jpeg'
        },
        {
            id: 4,
            title: 'Tokyo City Explorer',
            location: 'Tokyo, Japan',
            supplier: 'Desert Dreams Travel',
            requestDate: '1/15/2025',
            travelDates: 'Mar 20-23, 2025',
            price: '$2,450',
            status: 'Accepted by Supplier',
            statusColor: 'bg-green-100 text-green-700',
            statusIcon: <FaCheckCircle />,
            image: '/assets/dest-4.jpeg'
        }
    ]

    const upcomingTrips = [
        {
            id: 1,
            location: 'Dubai, UAE',
            dates: 'Mar 20-23, 2025',
            image: '/assets/dest-1.jpeg'
        },
        {
            id: 2,
            location: 'Bali, Indonesia',
            dates: 'Apr 5-12, 2025',
            image: '/assets/dest-2.jpeg'
        }
    ]

    const suggestedDestinations = [
        {
            id: 1,
            name: 'Santorini, Greece',
            image: '/assets/activity1.jpeg'
        },
        {
            id: 2,
            name: 'Maldives',
            image: '/assets/activity2.jpeg'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            {/* Header */}
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

                    <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden md:block">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search something"
                                className="w-full bg-gray-100 border-none rounded-lg py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-[#A67C52]/20"
                            />
                            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <button className="text-gray-500 hover:text-gray-700 relative">
                            <FiBell size={22} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 hidden md:block">
                            <FiMessageSquare size={22} />
                        </button>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdown(!dropdown)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <img
                                    src="/assets/hero-card1.jpeg"
                                    alt="Profile"
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B6E4E" strokeWidth="2" className="hidden md:block">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {dropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                    <div
                                        className="px-4 py-2 text-xs font-semibold text-[#A67C52] hover:bg-slate-50 cursor-pointer"
                                        onClick={() => {
                                            if (onProfileClick) onProfileClick()
                                            setDropdown(false)
                                        }}
                                    >
                                        MY REQUESTS
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
                            <span>Dubai, UAE</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 max-w-3xl leading-tight font-['Playfair_Display'] tracking-tight">
                            Welcome Back, Levent! <span className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl align-middle ml-1 sm:ml-2">🌍</span> <br className="hidden sm:block" />
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
                            {tripRequests.map((trip) => (
                                <div key={trip.id} className="bg-white rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 hover:shadow-md transition-shadow">
                                    <div className="w-full md:w-48 h-40 sm:h-48 md:h-auto shrink-0">
                                        <img
                                            src={trip.image}
                                            alt={trip.title}
                                            className="w-full h-full object-cover rounded-lg md:rounded-xl"
                                        />
                                    </div>
                                    <div className="flex-1 py-1 md:py-2">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{trip.title}</h3>
                                            <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 w-fit ${trip.statusColor}`}>
                                                {trip.statusIcon}
                                                <span className="whitespace-nowrap">{trip.status}</span>
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                                            <div className="flex items-center gap-1">
                                                <FiMapPin className="shrink-0" />
                                                <span className="truncate">{trip.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] sm:text-[10px] shrink-0">👤</span>
                                                <span className="truncate">{trip.supplier}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-gray-400 shrink-0" />
                                                <span>Requested: {trip.requestDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-gray-400 shrink-0" />
                                                <span>Travel: {trip.travelDates}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-auto gap-3 sm:gap-4">
                                            <button
                                                onClick={() => {
                                                    if (onItineraryClick) {
                                                        onItineraryClick()
                                                    }
                                                }}
                                                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors w-full sm:w-auto text-center"
                                            >
                                                View Request Details
                                            </button>
                                            <span className="text-base sm:text-lg font-bold text-gray-900 text-center sm:text-right">{trip.price}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="flex flex-col gap-8">
                        {/* Upcoming Trips */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Trips</h3>
                            <div className="flex flex-col gap-4">
                                {upcomingTrips.map((trip) => (
                                    <div
                                        key={trip.id}
                                        onClick={() => {
                                            if (onItineraryClick) {
                                                onItineraryClick()
                                            }
                                        }}
                                        className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <div className="h-32 rounded-lg overflow-hidden mb-3">
                                            <img src={trip.image} alt={trip.location} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                                            <FiMapPin className="text-gray-400" />
                                            {trip.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 pl-6">
                                            <FiCalendar />
                                            {trip.dates}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Suggested Destinations */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Suggested Destinations</h3>
                            <div className="flex flex-col gap-4">
                                {suggestedDestinations.map((dest) => (
                                    <div
                                        key={dest.id}
                                        onClick={() => {
                                            if (onCountryClick) {
                                                onCountryClick()
                                            }
                                        }}
                                        className="relative rounded-xl overflow-hidden h-40 cursor-pointer group"
                                    >
                                        <img
                                            src={dest.image}
                                            alt={dest.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                            <span className="text-white font-bold">{dest.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
