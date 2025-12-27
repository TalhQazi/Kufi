import { useState, useEffect, useRef } from 'react'
import Footer from '../../components/layout/Footer'

export default function TravelBooking({ onLogout, onBack, onForward, canGoBack, canGoForward, onSubmit, onHomeClick, onNotificationClick, onProfileClick, onSettingsClick }) {
    const [showSuccess, setShowSuccess] = useState(false)
    const [dropdown, setDropdown] = useState(false)
    const dropdownRef = useRef(null)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        travelers: '',
        country: 'Dubai',
        hasSpecificCountry: true,
        cities: '',
        arrivalDate: '',
        departureDate: '',
        includeHotel: false,
        includeHotel: false,
        hotelOwn: false,
        foodAllGood: false,
        vegetarian: false,
        insuranceOwn: false,
        travelOwn: true,
        withTransport: true,
        budget: '',
        additionalOptions: false
    })

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

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Booking submitted:', formData)
        // Show success message
        setShowSuccess(true)
    }

    // Auto-redirect after showing success message
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                onSubmit && onSubmit(formData)
            }, 3000) // Redirect after 3 seconds
            return () => clearTimeout(timer)
        }
    }, [showSuccess, formData, onSubmit])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
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
                                onClick={() => setDropdown(!dropdown)}
                                className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <img
                                    src="/assets/profile-avatar.jpeg"
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {dropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                    <div
                                        className="px-4 py-2 text-xs font-semibold text-primary-brown hover:bg-slate-50 cursor-pointer"
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
            <main className="px-4 sm:px-8 lg:px-20 py-6 sm:py-8">
                <div className="max-w-xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Travel Booking</h1>
                            <p className="text-xs sm:text-sm text-slate-600">Fill your details so we may assist you</p>
                        </div>

                        {/* My List */}
                        <div className="mb-6">
                            <h2 className="text-sm font-semibold text-slate-700 mb-3">My List</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B6F40" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    </svg>
                                    <span className="text-slate-700">Paradise Travel Co.</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B6F40" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span className="text-slate-700">2 Days</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Country Preference */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Country Preference</label>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.hasSpecificCountry}
                                            onChange={(e) => handleChange('hasSpecificCountry', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <span className="text-sm text-slate-700">I have a specific country in mind</span>
                                    </label>

                                    {formData.hasSpecificCountry && (
                                        <div className="animate-fadeIn">
                                            <input
                                                type="text"
                                                value={formData.country}
                                                onChange={(e) => handleChange('country', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                                placeholder="Enter country name (e.g. Italy, Japan)"
                                                required={formData.hasSpecificCountry}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                    placeholder="johndoe@email.com"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                    placeholder="+1 (555) 000-0000"
                                    required
                                />
                            </div>

                            {/* Number of Travelers */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Number of Travelers <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.travelers}
                                    onChange={(e) => handleChange('travelers', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm text-slate-500"
                                    required
                                >
                                    <option value="">Select number of travelers</option>
                                    <option value="1">1 Traveler</option>
                                    <option value="2">2 Travelers</option>
                                    <option value="3">3 Travelers</option>
                                    <option value="4">4 Travelers</option>
                                    <option value="5+">5+ Travelers</option>
                                </select>
                            </div>


                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Arrival Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.arrivalDate}
                                        onChange={(e) => handleChange('arrivalDate', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Departure Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.departureDate}
                                        onChange={(e) => handleChange('departureDate', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Hotel Preferences */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Hotel</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.includeHotel}
                                            onChange={(e) => handleChange('includeHotel', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <span className="text-sm text-slate-700">Include Hotel</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.hotelOwn}
                                            onChange={(e) => handleChange('hotelOwn', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <span className="text-sm text-slate-700">I will choose my own</span>
                                    </label>
                                </div>
                            </div>

                            {/* Food Preference */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Food Preference</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.foodAllGood}
                                            onChange={(e) => handleChange('foodAllGood', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <span className="text-sm text-slate-700">All is good</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.vegetarian}
                                            onChange={(e) => handleChange('vegetarian', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <span className="text-sm text-slate-700">Vegetarian</span>
                                    </label>
                                </div>
                            </div>

                            {/* Transportation */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Transportation</label>
                                <div className="grid grid-cols-1 mb-4 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <label className="flex items-center gap-2 cursor-not-allowed opacity-80">
                                        <div className="w-5 h-5 rounded bg-primary-brown flex items-center justify-center">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-800 tracking-tight">Included in Itinerary</span>
                                    </label>
                                    <p className="text-[11px] text-slate-500 ml-7 leading-tight italic">
                                        Ground transportation for all scheduled itinerary activities is provided.
                                    </p>
                                </div>
                            </div>

                            {/* Travel Health Insurance */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-3">Travel Health Insurance</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.includeInsurance}
                                            onChange={(e) => handleChange('includeInsurance', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <span className="text-sm text-slate-700">Include Insurance</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.insuranceOwn}
                                            onChange={(e) => handleChange('insuranceOwn', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <span className="text-sm text-slate-700">I will choose my own</span>
                                    </label>
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Select Budget <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.budget}
                                    onChange={(e) => handleChange('budget', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm text-slate-500"
                                    required
                                >
                                    <option value="">Choose your budget range</option>
                                    <option value="<1000">Less than $1,000</option>
                                    <option value="1000-3000">$1,000 - $3,000</option>
                                    <option value="3000-5000">$3,000 - $5,000</option>
                                    <option value="5000-10000">$5,000 - $10,000</option>
                                    <option value=">10000">More than $10,000</option>
                                </select>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-primary-brown hover:bg-primary-dark text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                Submit Booking Request
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 2L11 13" />
                                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div >
            </main >
            <Footer />

            {/* Success Modal */}
            {
                showSuccess && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform animate-scaleIn">
                            {/* Success Icon */}
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>

                            {/* Success Message */}
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Request Submitted!</h2>
                            <p className="text-slate-600 mb-6">
                                Your travel booking request has been successfully submitted.
                                We'll get back to you shortly.
                            </p>

                            {/* Loading Indicator */}
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                <span>Redirecting to explore page...</span>
                            </div>
                        </div>
                    </div>
                )
            }

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div >
    )
}
