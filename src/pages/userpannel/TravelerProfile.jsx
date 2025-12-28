import React, { useState, useEffect, useRef } from 'react'
import NotificationsModal from './NotificationsModal'
import Footer from '../../components/layout/Footer'

export default function TravelerProfile({ onBack, onLogout, onProfileClick, onSettingsClick, onHomeClick }) {
    const [activeTab, setActiveTab] = useState('Personal Info')
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState({
        fullName: 'Sarah Anderson',
        email: 'sarah.anderson@email.com',
        phone: '+1 (555) 123-4567',
        country: 'United States',
        dob: '1988-03-15',
        gender: 'Female',
        address: '123 Maple Street, Apt 4B',
        city: 'San Francisco, CA',
        nationality: 'American'
    })
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false)
            }
        }

        if (showProfileDropdown) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showProfileDropdown])

    const tabs = ['Personal Info', 'Preferences', 'Travel History', 'Wishlist', 'Payments', 'Settings']

    return (
        <div className="min-h-screen bg-[#F5F1EB] font-sans overflow-x-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
                    {/* Left: Logo */}
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

                    {/* Right: Notifications, Messages, Profile */}
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Bell Icon with notification dot */}
                        <button
                            onClick={() => setShowNotifications(true)}
                            className="text-gray-500 hover:text-gray-700 relative"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>


                        {/* Profile with dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <img
                                    src="/assets/profile-avatar.jpeg"
                                    alt="Profile"
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#8B6E4E"
                                    strokeWidth="2"
                                    className="hidden md:block"
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
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
                                            setShowNotifications(true)
                                            setShowProfileDropdown(false)
                                        }}
                                    >
                                        NOTIFICATIONS
                                    </div>
                                    <div
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                        onClick={() => {
                                            setActiveTab('Payments')
                                            setShowProfileDropdown(false)
                                            // Scroll to top if needed
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                    >
                                        PAYMENTS
                                    </div>
                                    <div
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                        onClick={() => {
                                            setActiveTab('Settings')
                                            setShowProfileDropdown(false)
                                            // Scroll to top if needed
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
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
            </header>

            {/* Container */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

                {/* Header */}
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Traveler Profile</h1>
                        <p className="text-xs sm:text-sm text-slate-500">View traveler details, preferences, and journey history in one place.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-brown text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                        <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#8B6E4E] text-white rounded-lg text-xs font-semibold hover:bg-[#7a5d3f]">
                            <svg width="12" height="12" className="sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span className="hidden sm:inline">Download Profile</span>
                            <span className="sm:hidden">Download</span>
                        </button>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                        {/* Left: Profile Info */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
                            <div className="flex flex-col items-center sm:items-start">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3">
                                    <img src="/assets/profile-avatar.jpeg" alt="Sarah Anderson" className="w-full h-full object-cover" />
                                </div>
                                <button className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-[#D4AF37] text-white text-[10px] sm:text-xs font-semibold">
                                    Gold Member
                                </button>
                            </div>
                            <div className="flex-1 sm:flex-none">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.fullName}
                                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                        className="text-lg sm:text-xl font-bold text-slate-900 mb-2 bg-slate-50 border-b border-[#8B6E4E] focus:outline-none w-full"
                                    />
                                ) : (
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{profileData.fullName}</h2>
                                )}
                                <div className="space-y-1 text-sm text-slate-600">
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="bg-transparent border-b border-slate-200 focus:outline-none w-full py-0.5"
                                            />
                                        ) : (
                                            <span>{profileData.email}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                className="bg-transparent border-b border-slate-200 focus:outline-none w-full py-0.5"
                                            />
                                        ) : (
                                            <span>{profileData.phone}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="2" y1="12" x2="22" y2="12" />
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </svg>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.country}
                                                onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                                                className="bg-transparent border-b border-slate-200 focus:outline-none w-full py-0.5"
                                            />
                                        ) : (
                                            <span>{profileData.country}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 lg:gap-8 xl:gap-12 w-full sm:w-auto justify-between sm:justify-start">
                            <div className="text-center flex-1 sm:flex-none">
                                <div className="text-2xl sm:text-3xl font-bold text-slate-900">12</div>
                                <div className="text-[10px] sm:text-xs text-slate-500 mt-1">Total Trips</div>
                            </div>
                            <div className="text-center flex-1 sm:flex-none">
                                <div className="text-2xl sm:text-3xl font-bold text-slate-900">2</div>
                                <div className="text-[10px] sm:text-xs text-slate-500 mt-1">In Progress</div>
                            </div>
                            <div className="text-center flex-1 sm:flex-none">
                                <div className="text-2xl sm:text-3xl font-bold text-slate-900">8</div>
                                <div className="text-[10px] sm:text-xs text-slate-500 mt-1">Wishlist</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl p-2 sm:p-3 mb-6 sm:mb-8 shadow-sm">
                    <div className="flex flex-nowrap gap-2 overflow-x-auto hide-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap rounded-lg ${activeTab === tab
                                    ? 'bg-[#F0F4F8] text-slate-900'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content Container */}
                <div className="max-w-[1000px] mx-auto">
                    {/* Tab Content */}
                    {activeTab === 'Personal Info' && (
                        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm min-h-[500px]">
                            <h3 className="text-xl font-bold text-slate-900 mb-10">Personal Information</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 max-w-[800px]">
                                {/* Date of Birth */}
                                <div>
                                    <div className="flex items-center gap-2 text-[11px] text-[#C4A574] font-medium mb-1.5 uppercase tracking-wider">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        Date of Birth
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={profileData.dob}
                                            onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-brown"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-slate-900 font-medium">
                                            {new Date(profileData.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    )}
                                </div>

                                {/* Gender */}
                                <div>
                                    <div className="flex items-center gap-2 text-[11px] text-[#C4A574] font-medium mb-1.5 uppercase tracking-wider">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Gender
                                    </div>
                                    {isEditing ? (
                                        <select
                                            value={profileData.gender}
                                            onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-brown"
                                        >
                                            <option value="Female">Female</option>
                                            <option value="Male">Male</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <div className="text-sm sm:text-base text-slate-900 font-medium">{profileData.gender}</div>
                                    )}
                                </div>


                                {/* Address */}
                                <div>
                                    <div className="flex items-center gap-2 text-[11px] text-[#C4A574] font-medium mb-1.5 uppercase tracking-wider">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        Address
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.address}
                                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-brown"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-slate-900 font-medium">{profileData.address}</div>
                                    )}
                                </div>

                                {/* City */}
                                <div>
                                    <div className="flex items-center gap-2 text-[11px] text-[#C4A574] font-medium mb-1.5 uppercase tracking-wider">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        City
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.city}
                                            onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-brown"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-slate-900 font-medium">{profileData.city}</div>
                                    )}
                                </div>

                                {/* Nationality */}
                                <div>
                                    <div className="flex items-center gap-2 text-[11px] text-[#C4A574] font-medium mb-1.5 uppercase tracking-wider">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="2" y1="12" x2="22" y2="12" />
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </svg>
                                        Nationality
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.nationality}
                                            onChange={(e) => setProfileData({ ...profileData, nationality: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-brown"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-slate-900 font-medium">{profileData.nationality}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Preferences' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Traveler Preferences</h3>

                            <div className="space-y-6">
                                {/* Preferred Destinations */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="2">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                            <line x1="1" y1="10" x2="23" y2="10" />
                                        </svg>
                                        Preferred Destinations
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Europe', 'Southeast Asia', 'South America', 'Mediterranean'].map((dest) => (
                                            <button
                                                key={dest}
                                                className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium hover:bg-[#7a5d3f]"
                                            >
                                                {dest}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Preferred Trip Types */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="2">
                                            <path d="M3 12h18M3 6h18M3 18h18" />
                                            <path d="M6 3v6M6 15v6M18 3v6M18 15v6" />
                                        </svg>
                                        Preferred Trip Types
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Cultural', 'Adventure', 'Relaxation', 'Food & Wine'].map((type) => (
                                            <button
                                                key={type}
                                                className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium hover:bg-[#7a5d3f]"
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Budget Range */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="2">
                                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                            <line x1="7" y1="7" x2="7.01" y2="7" />
                                        </svg>
                                        Budget Range
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium hover:bg-[#7a5d3f]">
                                            $3,000 - $5,000 per trip
                                        </button>
                                    </div>
                                </div>

                                {/* Food Preferences */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="2">
                                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                                            <path d="M7 2v20" />
                                            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v0" />
                                            <path d="M21 15c0 1.1-.9 2-2 2h-5v2a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-4z" />
                                        </svg>
                                        Food Preferences
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Local Cuisine', 'Vegetarian Options', 'Fine Dining'].map((food) => (
                                            <button
                                                key={food}
                                                className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium hover:bg-[#7a5d3f]"
                                            >
                                                {food}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Accommodation Preferences */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                            <polyline points="9 22 9 12 15 12 15 22" />
                                        </svg>
                                        Accommodation Preferences
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Boutique Hotels', '4-5 Star', 'Unique Stays'].map((accom) => (
                                            <button
                                                key={accom}
                                                className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium hover:bg-[#7a5d3f]"
                                            >
                                                {accom}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Travel Style */}
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="2" y1="12" x2="22" y2="12" />
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </svg>
                                        Travel Style
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium hover:bg-[#7a5d3f]">
                                            Luxury
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Travel History' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Travel History</h3>

                            <div className="space-y-4">
                                {/* Travel Entry 1: Greek Islands Explorer */}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:shadow-md transition-shadow">
                                    <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200&h=200&fit=crop"
                                            alt="Santorini, Greece"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                                        <h4 className="font-bold text-slate-900 mb-2">Greek Islands Explorer</h4>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 mb-3 sm:mb-0">
                                            <div className="flex items-center gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                <span>Santorini, Greece</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                <span className="hidden sm:inline">Jun 15 - Jun 25, 2024</span>
                                                <span className="sm:hidden">Jun 15-25, 2024</span>
                                            </div>
                                            <span>• 10 days</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                                        <button className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                                            View Itinerary
                                        </button>
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold whitespace-nowrap text-center">
                                            Completed
                                        </span>
                                    </div>
                                </div>

                                {/* Travel Entry 2: Tropical Paradise Retreat */}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:shadow-md transition-shadow">
                                    <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=200&h=200&fit=crop"
                                            alt="Bali, Indonesia"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                                        <h4 className="font-bold text-slate-900 mb-2">Tropical Paradise Retreat</h4>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 mb-3 sm:mb-0">
                                            <div className="flex items-center gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                <span>Bali, Indonesia</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                <span className="hidden sm:inline">Dec 1 - Dec 15, 2024</span>
                                                <span className="sm:hidden">Dec 1-15, 2024</span>
                                            </div>
                                            <span>• 14 days</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                                        <button className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                                            View Itinerary
                                        </button>
                                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold whitespace-nowrap text-center">
                                            In Progress
                                        </span>
                                    </div>
                                </div>

                                {/* Travel Entry 3: Romantic Paris Getaway */}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:shadow-md transition-shadow">
                                    <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&h=200&fit=crop"
                                            alt="Paris, France"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                                        <h4 className="font-bold text-slate-900 mb-2">Romantic Paris Getaway</h4>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 mb-3 sm:mb-0">
                                            <div className="flex items-center gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                <span>Paris, France</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                <span className="hidden sm:inline">Apr 10 - Apr 17, 2024</span>
                                                <span className="sm:hidden">Apr 10-17, 2024</span>
                                            </div>
                                            <span>• 7 days</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                                        <button className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                                            View Itinerary
                                        </button>
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold whitespace-nowrap text-center">
                                            Completed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Wishlist' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Saved Itineraries & Wishlist</h3>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {/* Card 1: Machu Picchu Adventure */}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1587595431973-160d0d94a8c0?w=400&h=250&fit=crop"
                                            alt="Machu Picchu, Peru"
                                            className="w-full h-48 object-cover rounded-t-xl"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="text-xs text-slate-400 font-medium mb-1">Adventure</div>
                                        <h4 className="font-bold text-slate-900 mb-2">Machu Picchu Adventure</h4>
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                            <span>Peru</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: Safari Experience */}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=250&fit=crop"
                                            alt="Safari, Tanzania"
                                            className="w-full h-48 object-cover rounded-t-xl"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="text-xs text-slate-400 font-medium mb-1">Wildlife</div>
                                        <h4 className="font-bold text-slate-900 mb-2">Safari Experience</h4>
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                            <span>Tanzania</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3: Northern Lights Tour */}
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400&h=250&fit=crop"
                                            alt="Northern Lights, Iceland"
                                            className="w-full h-48 object-cover rounded-t-xl"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="text-xs text-slate-400 font-medium mb-1">Nature</div>
                                        <h4 className="font-bold text-slate-900 mb-2">Northern Lights Tour</h4>
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                            <span>Iceland</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Payments' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Payments</h3>
                            <div className="flex flex-col items-center justify-center py-12">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="1.5" className="mb-4">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                    <line x1="1" y1="10" x2="23" y2="10" />
                                </svg>
                                <p className="text-lg font-semibold text-slate-900 mb-2">Payment System</p>
                                <p className="text-sm text-slate-500">Coming Soon</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Settings' && (
                        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm min-h-[400px]">
                            <h3 className="text-xl font-bold text-slate-900 mb-8">Account Settings</h3>

                            <div className="space-y-8 max-w-2xl">
                                {/* Notification Settings */}
                                <section>
                                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6E4E" strokeWidth="2">
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                        </svg>
                                        Notifications
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Email Notifications</p>
                                                <p className="text-xs text-slate-500">Receive updates about your trip requests via email</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B6E4E]"></div>
                                            </label>
                                        </div>
                                    </div>
                                </section>

                                {/* Security Settings */}
                                <section>
                                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6E4E" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        Security
                                    </h4>
                                    <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Password</p>
                                                <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                                            </div>
                                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#8B6E4E] hover:bg-slate-50 transition-colors">
                                                Update Password
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showNotifications && (
                <NotificationsModal
                    onClose={() => setShowNotifications(false)}
                    onPaymentClick={() => {
                        setShowNotifications(false)
                        setActiveTab('Payments')
                    }}
                    onViewItinerary={() => {
                        setShowNotifications(false)
                    }}
                />
            )}
            <Footer />
        </div>
    )
}
