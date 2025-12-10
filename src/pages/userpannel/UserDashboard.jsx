import React from 'react'
import { FiSearch, FiBell, FiMessageSquare, FiMapPin, FiCalendar, FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { FaCheckCircle, FaClock, FaCreditCard } from 'react-icons/fa'

export default function UserDashboard({ selectedActivities = [], onRemoveActivity, onLogout, onBack, onForward, canGoBack, canGoForward }) {
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
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={onBack}>
                        <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-[#A67C52] p-1 rounded">
                            <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
                        </div>

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
                        <div className="flex items-center gap-3 cursor-pointer" onClick={onLogout}>
                            <img
                                src="/assets/hero-card1.jpeg"
                                alt="Profile"
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* Hero Section */}
                {/* Hero Section */}
                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12 h-[300px] md:h-[400px]">
                    <img
                        src="/assets/treking.jpeg"
                        alt="Hero"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex flex-col justify-center px-8 md:px-16">
                        <div className="flex items-center gap-2 text-white/90 text-sm md:text-base mb-3 font-medium tracking-wide">
                            <FiMapPin />
                            <span>Dubai, UAE</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-3xl leading-tight font-['Playfair_Display'] tracking-tight">
                            Welcome Back, Levent! <span className="text-4xl md:text-6xl align-middle ml-2">🌍</span> <br />
                            Ready For Your Next <br />
                            Adventure?
                        </h1>
                        <p className="text-white/90 max-w-lg mb-8 text-sm md:text-base font-light leading-relaxed hidden sm:block">
                            Here's a quick look at your latest trip requests and upcoming tours. Let's <br />
                            make your next journey unforgettable!
                        </p>
                        <button className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-3 w-fit transition-all hover:scale-105 shadow-xl text-sm md:text-base">
                            <FaCheckCircle className="text-lg" />
                            Plan a New Trip
                        </button>
                    </div>
                </div>

                {/* Your Selection Section */}
                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 mb-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Your Selection</h2>
                            <p className="text-sm text-gray-600">
                                <span className="font-bold text-[#A67C52]">{selectedActivities.length}</span>
                                <span className="ml-1">activities selected</span>
                            </p>
                        </div>
                    </div>

                    {selectedActivities.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <p className="text-base font-semibold text-gray-900 mb-2">Your selection is empty</p>
                            <p className="text-sm text-gray-500">
                                Add activities from explore page to create your custom request
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedActivities.map((activity) => (
                                <div key={activity.id} className="bg-gray-50 rounded-xl p-4 flex gap-4 items-start hover:bg-gray-100 transition-colors">
                                    <img
                                        src={activity.image}
                                        alt={activity.title}
                                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                        onError={(e) => { e.target.src = '/assets/activity1.jpeg' }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{activity.title}</h3>
                                        <p className="text-xs text-gray-500 mb-2">{activity.location}</p>
                                        <button
                                            onClick={() => onRemoveActivity && onRemoveActivity(activity.id)}
                                            className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                                <div key={trip.id} className="bg-white rounded-xl md:rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 md:gap-6 hover:shadow-md transition-shadow">
                                    <div className="w-full md:w-48 h-48 md:h-auto shrink-0">
                                        <img
                                            src={trip.image}
                                            alt={trip.title}
                                            className="w-full h-full object-cover rounded-lg md:rounded-xl"
                                        />
                                    </div>
                                    <div className="flex-1 py-1 md:py-2">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900">{trip.title}</h3>
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-fit ${trip.statusColor}`}>
                                                {trip.statusIcon}
                                                {trip.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <FiMapPin />
                                                {trip.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">👤</span>
                                                {trip.supplier}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-gray-600 mb-6">
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-gray-400" />
                                                <span>Requested: {trip.requestDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-gray-400" />
                                                <span>Travel Dates: {trip.travelDates}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto gap-4">
                                            <button className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors w-full sm:w-auto text-center">
                                                View Request Details
                                            </button>
                                            <span className="text-lg font-bold text-gray-900">{trip.price}</span>
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
                                    <div key={trip.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
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
                                    <div key={dest.id} className="relative rounded-xl overflow-hidden h-40 cursor-pointer group">
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
        </div>
    )
}
