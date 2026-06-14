import { useMemo, useState, useEffect, useRef } from 'react'
import api from '../../api'
import Footer from '../../components/layout/Footer'
import ProfilePic from '../../components/ui/ProfilePic'

export default function TravelBooking({ onLogout, onBack, onForward, canGoBack, canGoForward, onSubmit, onHomeClick, onNotificationClick, onProfileClick, onSettingsClick, hideHeaderFooter = false, selectedActivities = [] }) {
    const [showSuccess, setShowSuccess] = useState(false)
    const [dropdown, setDropdown] = useState(false)
    const dropdownRef = useRef(null)
    const currentUser = (() => {
        try {
            const parsed = JSON.parse(localStorage.getItem('currentUser'))
            return parsed && typeof parsed === 'object' ? parsed : null
        } catch {
            return null
        }
    })()
    const isAuthenticated = (() => {
        try {
            const token = localStorage.getItem('authToken')
            const id = currentUser?._id || currentUser?.id
            return Boolean(token && id)
        } catch {
            return false
        }
    })()

    const normalizeCountryKey = (value) => {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim()
    }

    const getActivityCountryLabel = (activity) => {
        return String(activity?.country || activity?.location || activity?.countryName || '').trim()
    }

    const availableCountries = (() => {
        const map = new Map()
        ;(selectedActivities || []).forEach((a) => {
            const label = getActivityCountryLabel(a)
            const key = normalizeCountryKey(label)
            if (!key) return
            if (!map.has(key)) map.set(key, label)
        })
        return Array.from(map.entries())
            .map(([key, label]) => ({ key, label }))
            .sort((a, b) => a.label.localeCompare(b.label))
    })()

    const [selectedCountryKey, setSelectedCountryKey] = useState('')

    useEffect(() => {
        if (availableCountries.length === 1) {
            setSelectedCountryKey(availableCountries[0].key)
            return
        }

        if (availableCountries.length > 1) {
            const stillValid = availableCountries.some(c => c.key === selectedCountryKey)
            if (!stillValid) setSelectedCountryKey('')
            return
        }

        setSelectedCountryKey('')
    }, [availableCountries.length])

    const filteredSelectedActivities = selectedCountryKey
        ? (selectedActivities || []).filter((a) => normalizeCountryKey(getActivityCountryLabel(a)) === selectedCountryKey)
        : (selectedActivities || [])

    const payloadActivities = (availableCountries.length > 1 && !selectedCountryKey)
        ? []
        : filteredSelectedActivities

    const selectedCountryLabel = availableCountries.find(c => c.key === selectedCountryKey)?.label || ''

    const selectedTotalPrice = useMemo(() => {
        const total = (payloadActivities || []).reduce((sum, activity) => {
            const raw = activity?.price ?? activity?.amount ?? activity?.cost ?? 0
            const n = Number(raw)
            return Number.isFinite(n) ? sum + n : sum
        }, 0)
        return Math.max(0, total)
    }, [payloadActivities])



    const [formData, setFormData] = useState({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        travelers: '',
        arrivalDate: '',
        departureDate: '',
        cities: '',
        budget: '',
        additionalOptions: false,
        activities: [],
        // Dynamic booking terms selections
        bookingTermSelections: {}
    })
    const [countries, setCountries] = useState([])
    const [bookingTerms, setBookingTerms] = useState([])
    const [bookingTermsLoading, setBookingTermsLoading] = useState(true)

    // Fetch user profile from API to auto-fill form
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await api.get('/auth/profile')
                const profile = res.data
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        firstName: prev.firstName || profile.fullName || profile.name || '',
                        lastName: prev.lastName || '',
                        email: prev.email || profile.email || '',
                        phone: prev.phone || profile.phone || '',
                    }))
                }
            } catch (err) {
                console.error('Error fetching profile:', err)
            }
        }
        fetchUserProfile()
    }, [])

    useEffect(() => {
        const ids = (payloadActivities || [])
            .map(a => a?.id || a?._id)
            .filter(Boolean)

        setFormData(prev => ({
            ...prev,
            activities: ids
        }))
    }, [selectedCountryKey, selectedActivities, availableCountries.length])

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await api.get('/countries')
                setCountries(Array.isArray(response.data) ? response.data : [])
            } catch (error) {
                console.error("Error fetching countries:", error)
            }
        }
        fetchCountries()
    }, [])

    // Fetch dynamic booking terms
    useEffect(() => {
        const fetchBookingTerms = async () => {
            try {
                setBookingTermsLoading(true)
                const response = await api.get('/booking-terms?isActive=true')
                const terms = Array.isArray(response.data) ? response.data : []
                setBookingTerms(terms)
            } catch (error) {
                console.error("Error fetching booking terms:", error)
                setBookingTerms([])
            } finally {
                setBookingTermsLoading(false)
            }
        }
        fetchBookingTerms()
    }, [])

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const travelersRaw = String(formData.travelers || '').trim()
            const travelersParsed = travelersRaw === '5+'
                ? 5
                : Number.parseInt(travelersRaw, 10)

            if (!Number.isFinite(travelersParsed) || travelersParsed <= 0) {
                alert('Please select number of travelers.')
                return
            }

            const arrivalDate = String(formData.arrivalDate || '').trim()
            const departureDate = String(formData.departureDate || '').trim()

            if (!arrivalDate) {
                alert('Please select arrival date.')
                return
            }

            if (!departureDate) {
                alert('Please select departure date.')
                return
            }

            if (availableCountries.length > 1 && !selectedCountryKey) {
                alert('Please select one country for your trip list.')
                return
            }

            const activities = (payloadActivities || [])
                .map(a => a?.id || a?._id)
                .filter(Boolean)

            if (activities.length === 0) {
                alert('Please select at least one activity.')
                return
            }

            const name = `${formData.firstName || ''} ${formData.lastName || ''}`.trim()
            const experience = (payloadActivities || [])
                .map(a => a?.title)
                .filter(Boolean)
                .join(', ')

            const payload = {
                ...formData,
                name,
                contactDetails: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                },
                tripDetails: {
                    country: selectedCountryLabel,
                    arrivalDate,
                    departureDate,
                    budget: formData.budget,
                },
                travelers: travelersParsed,
                guests: travelersParsed,
                activities,
                country: selectedCountryLabel,
                location: selectedCountryLabel || formData.cities,
                experience,
                amount: formData.budget,
                totalAmount: selectedTotalPrice,
                userId: currentUser?._id || currentUser?.id,
            }

            if (!payload.userId) delete payload.userId
            if (!payload.cities) delete payload.cities
            if (!payload.name) delete payload.name
            if (!payload.location) delete payload.location
            if (!payload.experience) delete payload.experience
            if (!payload.amount) delete payload.amount

            console.log('Booking submitted:', payload)
            const response = await api.post('/bookings', payload)
            setFormData(prev => ({ ...prev, ...response.data })) // Update with server data (like _id)
            setShowSuccess(true)
        } catch (error) {
            const status = error?.response?.status
            const data = error?.response?.data
            const message =
                (typeof data === 'string' && data) ||
                data?.message ||
                data?.error ||
                error?.message ||
                'Failed to submit booking.'

            console.error('Error submitting booking:', {
                status,
                data,
                error
            })

            if (status === 401 || status === 403) {
                alert('Your session is not authorized. Please login again and then submit booking.')
                return
            }

            alert(`${message}${status ? ` (Status: ${status})` : ''}`)
        }
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

    const handleBookingTermChange = (termId, option, isMultiple) => {
        setFormData(prev => {
            const currentSelections = prev.bookingTermSelections || {}
            const termSelections = currentSelections[termId] || []

            if (isMultiple) {
                // Toggle selection for multiple select
                const newSelections = termSelections.includes(option)
                    ? termSelections.filter(s => s !== option)
                    : [...termSelections, option]
                return {
                    ...prev,
                    bookingTermSelections: {
                        ...currentSelections,
                        [termId]: newSelections
                    }
                }
            } else {
                // Single select - replace with new selection
                return {
                    ...prev,
                    bookingTermSelections: {
                        ...currentSelections,
                        [termId]: [option]
                    }
                }
            }
        })
    }

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


                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdown(!dropdown)}
                                    className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <ProfilePic user={currentUser} size="sm" />
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
                        ) : (
                            <button
                                className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors text-sm font-semibold text-primary-brown"
                                onClick={() => {
                                    if (onProfileClick) onProfileClick()
                                }}
                            >
                                <span>Login</span>
                            </button>
                        )}
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
                        <div className="mb-8 p-4 bg-beige/30 rounded-xl border border-primary-brown/10">
                            <h2 className="text-sm font-bold text-primary-brown mb-3 uppercase tracking-wider">My Trip List</h2>

                            {availableCountries.length > 1 && (
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                                        Select Country
                                    </label>
                                    <select
                                        value={selectedCountryKey}
                                        onChange={(e) => setSelectedCountryKey(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm text-slate-700 bg-white"
                                    >
                                        <option value="">Select one country</option>
                                        {availableCountries.map((c) => (
                                            <option key={c.key} value={c.key}>{c.label}</option>
                                        ))}
                                    </select>
                                    <p className="mt-2 text-[11px] text-slate-500 italic">
                                        You can not travel more than one country at a time please select one country
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                {filteredSelectedActivities.length > 0 ? (
                                    filteredSelectedActivities.map((activity, idx) => (
                                        <div key={activity.id || idx} className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm border border-white">
                                                    <img
                                                        src={activity.image || activity.imageUrl || activity.images?.[0] || activity.Picture || "/assets/activity1.jpeg"}
                                                        alt={activity.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-slate-900 truncate">{activity.title}</h3>
                                                    <p className="text-[10px] text-slate-500 uppercase font-medium">{getActivityCountryLabel(activity)}</p>
                                                </div>
                                            </div>
                                           
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-500 italic py-2">
                                        No activities selected in your trip list.
                                    </p>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
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
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                        placeholder="Doe"
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

                            {/* Dynamic Booking Terms from Admin */}
                            {bookingTermsLoading ? (
                                <div className="mb-4 flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-brown"></div>
                                    <span className="ml-2 text-sm text-slate-500">Loading preferences...</span>
                                </div>
                            ) : (
                                bookingTerms.length > 0 && bookingTerms.map((term) => {
                                    const termId = term._id || term.id
                                    const selections = formData.bookingTermSelections?.[termId] || []
                                    const isMultiple = term.selectionType === 'multiple'

                                    return (
                                        <div key={termId} className="mb-4">
                                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                                {term.title}
                                            </label>
                                            <div className={`grid gap-3 ${(term.options || []).length > 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                                                {(term.options || []).map((option, idx) => {
                                                    const isSelected = selections.includes(option)

                                                    if (isMultiple) {
                                                        // Multiple select - checkboxes
                                                        return (
                                                            <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => handleBookingTermChange(termId, option, true)}
                                                                    className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                                                />
                                                                <span className="text-sm text-slate-700">{option}</span>
                                                            </label>
                                                        )
                                                    } else {
                                                        // Single select - radio buttons
                                                        return (
                                                            <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name={`term-${termId}`}
                                                                    checked={isSelected}
                                                                    onChange={() => handleBookingTermChange(termId, option, false)}
                                                                    className="w-4 h-4 border-slate-300 text-primary-brown focus:ring-primary-brown"
                                                                />
                                                                <span className="text-sm text-slate-700">{option}</span>
                                                            </label>
                                                        )
                                                    }
                                                })}
                                            </div>
                                        </div>
                                    )
                                })
                            )}

                            {/* Budget Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Choose your budget range <span className="text-red-500">*</span>
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
                                <p className="mt-1 text-xs text-slate-500">
                                    Based on {payloadActivities.length} selected activity{payloadActivities.length !== 1 ? 'ies' : 'y'}
                                </p>
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
            {!hideHeaderFooter && <Footer />}

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
                                <span>Redirecting to payment page...</span>
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
