import React, { useState, useEffect, useRef } from 'react'
import { FiUser } from 'react-icons/fi'
import api from '../../api'
import NotificationsModal from './NotificationsModal'
import Footer from '../../components/layout/Footer'
import ProfilePic from '../../components/ui/ProfilePic'

export default function TravelerProfile({ onBack, onLogout, onProfileClick, onSettingsClick, onHomeClick, initialTab = null, hideHeaderFooter = false }) {
    const [activeTab, setActiveTab] = useState('Personal Info')
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [bookings, setBookings] = useState([])
    const [profileData, setProfileData] = useState(() => {
        try {
            const saved = localStorage.getItem('kufi_user_profile')
            const parsed = saved ? JSON.parse(saved) : {}
            return {
                fullName: parsed.fullName || '',
                email: parsed.email || '',
                phone: parsed.phone || '',
                country: parsed.country || '',
                dob: parsed.dob || '',
                gender: parsed.gender || '',
                streetNumber: parsed.streetNumber || '',
                address: parsed.address || '',
                city: parsed.city || '',
                state: parsed.state || '',
                zipCode: parsed.zipCode || '',
                nationality: parsed.nationality || ''
            }
        } catch {
            return {
                fullName: '',
                email: '',
                phone: '',
                country: '',
                dob: '',
                gender: '',
                streetNumber: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                nationality: ''
            }
        }
    })
    
    const countriesList = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Democratic Republic of the)", "Congo (Republic of the)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea (North)", "Korea (South)", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ]
    
    const [wishlist, setWishlist] = useState([])
    const [userPreferences, setUserPreferences] = useState(() => {
        try {
            const saved = localStorage.getItem('kufi_user_preferences')
            return saved ? JSON.parse(saved) : {
                destinations: [],
                tripTypes: [],
                budget: '',
                foodPreferences: [],
                accommodation: [],
                travelStyle: []
            }
        } catch {
            return {
                destinations: [],
                tripTypes: [],
                budget: '',
                foodPreferences: [],
                accommodation: [],
                travelStyle: []
            }
        }
    })
    const [isPreferencesEditing, setIsPreferencesEditing] = useState(false)
    const dropdownRef = useRef(null)

    // Save preferences to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('kufi_user_preferences', JSON.stringify(userPreferences))
        } catch (err) {
            console.error('Error saving preferences:', err)
        }
    }, [userPreferences])

    // Save profileData to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('kufi_user_profile', JSON.stringify(profileData))
        } catch (err) {
            console.error('Error saving profile:', err)
        }
    }, [profileData])

    const availableDestinations = ['Europe', 'Asia', 'Middle East', 'Africa', 'North America', 'South America', 'Oceania', 'Caribbean']
    const availableTripTypes = ['Adventure', 'Relaxation', 'Cultural', 'Business', 'Family', 'Honeymoon', 'Solo', 'Group']
    const availableFoodPreferences = ['Local Cuisine', 'Vegetarian Options', 'Vegan', 'Fine Dining', 'Street Food', 'Halal', 'Kosher', 'Seafood']
    const availableAccommodation = ['Boutique Hotels', '4-5 Star', 'Hostels', 'Unique Stays', 'Airbnb', 'Resorts', 'Eco-Lodges']
    const availableTravelStyle = ['Luxury', 'Budget', 'Mid-Range', 'Backpacking', 'Slow Travel', 'Digital Nomad']

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

    const readWishlistStore = () => {
        try {
            const raw = localStorage.getItem('kufi_wishlist')
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true)

                const storedUserRaw = localStorage.getItem('currentUser')
                const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null
                const currentUserId = storedUser?._id || storedUser?.id

                const [profileRes, bookingsList] = await Promise.all([
                    api.get('/auth/profile').catch(() => ({ data: null })),
                    (async () => {
                        const endpoints = [
                            currentUserId ? `/bookings/user/${encodeURIComponent(String(currentUserId))}` : null,
                            '/bookings',
                        ].filter(Boolean)

                        for (const url of endpoints) {
                            try {
                                const res = await api.get(url)
                                const raw =
                                    res?.data?.bookings ??
                                    res?.data?.requests ??
                                    res?.data?.data ??
                                    res?.data
                                const list = Array.isArray(raw) ? raw : []
                                if (list.length > 0) return list
                            } catch {
                                continue
                            }
                        }
                        return []
                    })(),
                ])

                const profile = profileRes?.data || {}

                setProfileData({
                    fullName: profile.fullName || storedUser?.fullName || storedUser?.name || '',
                    email: profile.email || storedUser?.email || '',
                    phone: profile.phone || storedUser?.phone || '',
                    country: profile.country || storedUser?.country || '',
                    dob: profile.dob ? String(profile.dob).split('T')[0] : (storedUser?.dob ? String(storedUser.dob).split('T')[0] : ''),
                    gender: profile.gender || storedUser?.gender || '',
                    streetNumber: profile.streetNumber || '',
                    address: profile.address || storedUser?.address || '',
                    city: profile.city || storedUser?.city || '',
                    state: profile.state || '',
                    zipCode: profile.zipCode || '',
                    nationality: profile.nationality || storedUser?.nationality || ''
                })

                setBookings(Array.isArray(bookingsList) ? bookingsList : [])
                setWishlist(readWishlistStore())
            } catch (error) {
                console.error('Error fetching profile:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [])

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab)
        }
    }, [initialTab])

    const handleUpdateProfile = async () => {
        try {
            await api.patch('/auth/profile', profileData)
            setIsEditing(false)
            try {
                const storedUserRaw = localStorage.getItem('currentUser')
                const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null
                const nextUser = {
                    ...(storedUser && typeof storedUser === 'object' ? storedUser : {}),
                    ...profileData,
                    name: profileData.fullName,
                    fullName: profileData.fullName,
                }
                localStorage.setItem('currentUser', JSON.stringify(nextUser))
            } catch {
                // ignore
            }
            alert("Profile updated successfully!")
        } catch (error) {
            console.error("Error updating profile:", error)
            alert("Failed to update profile. Please try again.")
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setPasswordError('')
        setPasswordSuccess('')

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All fields are required')
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match')
            return
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters')
            return
        }

        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
            setPasswordSuccess('Password changed successfully!')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setTimeout(() => {
                setShowPasswordModal(false)
                setPasswordSuccess('')
            }, 2000)
        } catch (error) {
            const msg = error.response?.data?.msg || error.response?.data?.message || 'Failed to change password'
            setPasswordError(msg)
        }
    }

    const normalizedBookings = React.useMemo(() => {
        const list = Array.isArray(bookings) ? bookings : []
        return list.map((b) => {
            const id = b?._id || b?.id
            const createdAt = b?.createdAt || b?.date || b?.updatedAt
            const status = String(b?.status || b?.tripStatus || 'pending')
            const experience =
                (Array.isArray(b?.items) && b.items.length > 0
                    ? b.items
                        .map((i) => i?.activity?.title || i?.title)
                        .filter(Boolean)
                        .join(', ')
                    : '') ||
                b?.experience ||
                b?.title ||
                'Trip'

            const destination =
                b?.tripDetails?.country ||
                b?.country ||
                b?.destination ||
                b?.location ||
                '—'

            const imageUrl =
                b?.imageUrl ||
                b?.image ||
                b?.items?.[0]?.activity?.imageUrl ||
                b?.items?.[0]?.activity?.images?.[0] ||
                b?.items?.[0]?.activity?.image ||
                b?.items?.[0]?.imageUrl ||
                b?.items?.[0]?.image ||
                ''

            const start = b?.tripDetails?.arrivalDate || b?.startDate || b?.arrivalDate
            const end = b?.tripDetails?.departureDate || b?.endDate || b?.departureDate

            const durationLabel = (() => {
                if (!start || !end) return ''
                try {
                    const s = new Date(start)
                    const e = new Date(end)
                    const diffDays = Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)))
                    if (!Number.isFinite(diffDays) || diffDays <= 0) return ''
                    return `${diffDays} days`
                } catch {
                    return ''
                }
            })()

            return {
                ...b,
                _id: id,
                _createdAt: createdAt,
                _status: status,
                _experience: experience,
                _destination: destination,
                _imageUrl: imageUrl,
                _startDate: start,
                _endDate: end,
                _durationLabel: durationLabel,
            }
        })
    }, [bookings])

    const tripStats = React.useMemo(() => {
        const list = Array.isArray(normalizedBookings) ? normalizedBookings : []
        const totalTrips = list.length
        const inProgress = list.filter((b) => {
            const st = String(b?._status || '').toLowerCase().trim()
            return ['pending', 'accepted', 'confirmed', 'in progress', 'processing'].includes(st)
        }).length
        const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0
        return { totalTrips, inProgress, wishlistCount }
    }, [normalizedBookings, wishlist])

    const derivedPreferences = React.useMemo(() => {
        const list = Array.isArray(normalizedBookings) ? normalizedBookings : []
        const destinationMap = new Map()
        const typeMap = new Map()

        list.forEach((b) => {
            const dest = String(b?._destination || '').trim()
            if (dest) destinationMap.set(dest, (destinationMap.get(dest) || 0) + 1)

            const categories = (Array.isArray(b?.items) ? b.items : [])
                .map((i) => i?.activity?.category || i?.activity?.type || i?.category || i?.type)
                .filter(Boolean)
            categories.forEach((c) => {
                const key = String(c).trim()
                if (!key) return
                typeMap.set(key, (typeMap.get(key) || 0) + 1)
            })
        })

        const preferredDestinations = Array.from(destinationMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label]) => label)

        const preferredTripTypes = Array.from(typeMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label]) => label)

        return { preferredDestinations, preferredTripTypes }
    }, [normalizedBookings])

    const tabs = ['Personal Info', 'Preferences', 'Travel History', 'Wishlist', 'Settings']

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
            </div>
        )
    }

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
                                    <ProfilePic user={profileData} size="sm" />
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
                        <div className="flex items-center gap-2">
                            
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Traveler Profile</h1>
                        </div>
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
                                    onClick={handleUpdateProfile}
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
                                <ProfilePic user={profileData} size="xl" />
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
                                <div className="text-2xl sm:text-3xl font-bold text-slate-900">{tripStats.totalTrips}</div>
                                <div className="text-[10px] sm:text-xs text-slate-500 mt-1">Total Trips</div>
                            </div>
                            <div className="text-center flex-1 sm:flex-none">
                                <div className="text-2xl sm:text-3xl font-bold text-slate-900">{tripStats.inProgress}</div>
                                <div className="text-[10px] sm:text-xs text-slate-500 mt-1">In Progress</div>
                            </div>
                            <div className="text-center flex-1 sm:flex-none">
                                <div className="text-2xl sm:text-3xl font-bold text-slate-900">{tripStats.wishlistCount}</div>
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
                                            {profileData.dob ? new Date(profileData.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
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


                                {/* Street Number */}
                                <div>
                                    <div className="flex items-center gap-2 text-[11px] text-[#C4A574] font-medium mb-1.5 uppercase tracking-wider">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        Street Number
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.streetNumber}
                                            onChange={(e) => setProfileData({ ...profileData, streetNumber: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-brown"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-slate-900 font-medium">{profileData.streetNumber}</div>
                                    )}
                                </div>

                                {/* Address */}
                                {/* <div>
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
                                </div> */}

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

                                {/* State */}
                                <div>
                                    <div className="flex items-center gap-2 text-[11px] text-[#C4A574] font-medium mb-1.5 uppercase tracking-wider">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        State
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.state}
                                            onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-brown"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-slate-900 font-medium">{profileData.state}</div>
                                    )}
                                </div>

                                {/* Zip Code */}
                                <div>
                                    <div className="flex items-center gap-2 text-[11px] text-[#C4A574] font-medium mb-1.5 uppercase tracking-wider">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        Zip Code
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.zipCode}
                                            onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-brown"
                                        />
                                    ) : (
                                        <div className="text-sm sm:text-base text-slate-900 font-medium">{profileData.zipCode}</div>
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
                                        <select
                                            value={profileData.nationality}
                                            onChange={(e) => setProfileData({ ...profileData, nationality: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary-brown"
                                        >
                                            <option value="">Select Nationality</option>
                                            {countriesList.map((country) => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="text-sm sm:text-base text-slate-900 font-medium">{profileData.nationality}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Preferences' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Traveler Preferences</h3>
                                <button
                                    onClick={() => setIsPreferencesEditing(!isPreferencesEditing)}
                                    className="text-xs font-medium text-[#8B6E4E] hover:text-[#7a5d3f]"
                                >
                                    {isPreferencesEditing ? 'Done' : 'Edit'}
                                </button>
                            </div>

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
                                        {isPreferencesEditing ? (
                                            availableDestinations.map((dest) => {
                                                const isSelected = userPreferences.destinations.includes(dest)
                                                return (
                                                    <button
                                                        key={dest}
                                                        onClick={() => {
                                                            setUserPreferences(prev => ({
                                                                ...prev,
                                                                destinations: isSelected 
                                                                    ? prev.destinations.filter(d => d !== dest)
                                                                    : [...prev.destinations, dest]
                                                            }))
                                                        }}
                                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                                                            isSelected 
                                                                ? 'bg-[#8B6E4E] text-white' 
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {dest}
                                                    </button>
                                                )
                                            })
                                        ) : userPreferences.destinations.length > 0 ? (
                                            userPreferences.destinations.map((dest) => (
                                                <span key={dest} className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium">
                                                    {dest}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500">No preferences selected</span>
                                        )}
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
                                        {isPreferencesEditing ? (
                                            availableTripTypes.map((type) => {
                                                const isSelected = userPreferences.tripTypes.includes(type)
                                                return (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            setUserPreferences(prev => ({
                                                                ...prev,
                                                                tripTypes: isSelected 
                                                                    ? prev.tripTypes.filter(t => t !== type)
                                                                    : [...prev.tripTypes, type]
                                                            }))
                                                        }}
                                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                                                            isSelected 
                                                                ? 'bg-[#8B6E4E] text-white' 
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                )
                                            })
                                        ) : userPreferences.tripTypes.length > 0 ? (
                                            userPreferences.tripTypes.map((type) => (
                                                <span key={type} className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium">
                                                    {type}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500">No preferences selected</span>
                                        )}
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
                                        {isPreferencesEditing ? (
                                            ['Under $1,000', '$1,000 - $3,000', '$3,000 - $5,000', '$5,000 - $10,000', 'Over $10,000'].map((budget) => {
                                                const isSelected = userPreferences.budget === budget
                                                return (
                                                    <button
                                                        key={budget}
                                                        onClick={() => setUserPreferences(prev => ({ ...prev, budget: isSelected ? '' : budget }))}
                                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                                                            isSelected 
                                                                ? 'bg-[#8B6E4E] text-white' 
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {budget}
                                                    </button>
                                                )
                                            })
                                        ) : userPreferences.budget ? (
                                            <span className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium">
                                                {userPreferences.budget}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-500">No budget selected</span>
                                        )}
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
                                        {isPreferencesEditing ? (
                                            availableFoodPreferences.map((food) => {
                                                const isSelected = userPreferences.foodPreferences.includes(food)
                                                return (
                                                    <button
                                                        key={food}
                                                        onClick={() => {
                                                            setUserPreferences(prev => ({
                                                                ...prev,
                                                                foodPreferences: isSelected 
                                                                    ? prev.foodPreferences.filter(f => f !== food)
                                                                    : [...prev.foodPreferences, food]
                                                            }))
                                                        }}
                                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                                                            isSelected 
                                                                ? 'bg-[#8B6E4E] text-white' 
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {food}
                                                    </button>
                                                )
                                            })
                                        ) : userPreferences.foodPreferences.length > 0 ? (
                                            userPreferences.foodPreferences.map((food) => (
                                                <span key={food} className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium">
                                                    {food}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500">No preferences selected</span>
                                        )}
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
                                        {isPreferencesEditing ? (
                                            availableAccommodation.map((accom) => {
                                                const isSelected = userPreferences.accommodation.includes(accom)
                                                return (
                                                    <button
                                                        key={accom}
                                                        onClick={() => {
                                                            setUserPreferences(prev => ({
                                                                ...prev,
                                                                accommodation: isSelected 
                                                                    ? prev.accommodation.filter(a => a !== accom)
                                                                    : [...prev.accommodation, accom]
                                                            }))
                                                        }}
                                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                                                            isSelected 
                                                                ? 'bg-[#8B6E4E] text-white' 
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {accom}
                                                    </button>
                                                )
                                            })
                                        ) : userPreferences.accommodation.length > 0 ? (
                                            userPreferences.accommodation.map((accom) => (
                                                <span key={accom} className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium">
                                                    {accom}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500">No preferences selected</span>
                                        )}
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
                                        {isPreferencesEditing ? (
                                            availableTravelStyle.map((style) => {
                                                const isSelected = userPreferences.travelStyle.includes(style)
                                                return (
                                                    <button
                                                        key={style}
                                                        onClick={() => {
                                                            setUserPreferences(prev => ({
                                                                ...prev,
                                                                travelStyle: isSelected 
                                                                    ? prev.travelStyle.filter(s => s !== style)
                                                                    : [...prev.travelStyle, style]
                                                            }))
                                                        }}
                                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                                                            isSelected 
                                                                ? 'bg-[#8B6E4E] text-white' 
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {style}
                                                    </button>
                                                )
                                            })
                                        ) : userPreferences.travelStyle.length > 0 ? (
                                            userPreferences.travelStyle.map((style) => (
                                                <span key={style} className="px-4 py-2 rounded-full bg-[#8B6E4E] text-white text-xs font-medium">
                                                    {style}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500">No preferences selected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Travel History' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Travel History</h3>

                            <div className="space-y-4">
                                {normalizedBookings.length > 0 ? normalizedBookings.map((trip) => {
                                    const createdAt = trip?._createdAt ? new Date(trip._createdAt) : null
                                    const dateLabel = createdAt && !Number.isNaN(createdAt.valueOf())
                                        ? createdAt.toLocaleDateString()
                                        : '—'
                                    const status = String(trip?._status || '').toLowerCase().trim()
                                    const statusLabel = status || 'pending'
                                    const statusClass = ['confirmed', 'accepted', 'completed'].includes(status)
                                        ? 'bg-green-100 text-green-700'
                                        : ['pending', 'processing', 'in progress'].includes(status)
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-slate-100 text-slate-600'

                                    return (
                                        <div key={trip._id || trip.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:shadow-md transition-shadow">
                                            <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                                {trip._imageUrl ? (
                                                    <img
                                                        src={trip._imageUrl}
                                                        alt={trip._experience}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="flex-1 min-w-0 w-full sm:w-auto">
                                                <h4 className="font-bold text-slate-900 mb-2 truncate">{trip._experience}</h4>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 mb-3 sm:mb-0">
                                                    <div className="flex items-center gap-1">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                            <circle cx="12" cy="10" r="3" />
                                                        </svg>
                                                        <span className="truncate">{trip._destination}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                            <line x1="16" y1="2" x2="16" y2="6" />
                                                            <line x1="8" y1="2" x2="8" y2="6" />
                                                            <line x1="3" y1="10" x2="21" y2="10" />
                                                        </svg>
                                                        <span>{dateLabel}</span>
                                                    </div>
                                                    {trip._durationLabel ? <span>• {trip._durationLabel}</span> : null}
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                                                <button className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap">
                                                    View Itinerary
                                                </button>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap text-center ${statusClass}`}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <div className="py-10 text-center text-sm text-slate-500">No trips found yet</div>
                                )}
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

                            {wishlist.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {wishlist.map((item, idx) => {
                                        const title = item?.title || item?.name || item?.activityTitle || 'Wishlist Item'
                                        const location = item?.country || item?.location || item?.destination || '—'
                                        const category = item?.category || item?.type || item?.tag || ''
                                        const imageUrl = item?.imageUrl || item?.image || item?.images?.[0] || ''

                                        return (
                                            <div key={item?.id || item?._id || `${title}-${idx}`} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                <div className="relative">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={title}
                                                            className="w-full h-48 object-cover rounded-t-xl"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-48 bg-slate-100 rounded-t-xl" />
                                                    )}
                                                    <div className="absolute top-3 right-3">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="2">
                                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    {category ? <div className="text-xs text-slate-400 font-medium mb-1">{category}</div> : null}
                                                    <h4 className="font-bold text-slate-900 mb-2 truncate">{title}</h4>
                                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4A574" strokeWidth="2">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                            <circle cx="12" cy="10" r="3" />
                                                        </svg>
                                                        <span className="truncate">{location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-10 text-center text-sm text-slate-500">No saved items yet</div>
                            )}
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
                                            <button 
                                                onClick={() => setShowPasswordModal(true)}
                                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#8B6E4E] hover:bg-slate-50 transition-colors"
                                            >
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
                        setActiveTab('Travel History')
                    }}
                    onViewItinerary={() => {
                        setShowNotifications(false)
                    }}
                />
            )}

            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                            <button 
                                onClick={() => {
                                    setShowPasswordModal(false)
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                                    setPasswordError('')
                                    setPasswordSuccess('')
                                }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            {passwordError && (
                                <p className="text-red-500 text-sm">{passwordError}</p>
                            )}
                            {passwordSuccess && (
                                <p className="text-green-500 text-sm">{passwordSuccess}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false)
                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                                        setPasswordError('')
                                        setPasswordSuccess('')
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#8B6E4E] text-white rounded-lg text-sm font-medium hover:bg-[#7a5d3f]"
                                >
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!hideHeaderFooter && <Footer />}
        </div>
    )
}
