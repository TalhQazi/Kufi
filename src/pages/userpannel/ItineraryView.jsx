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
    const [isAdjusting, setIsAdjusting] = useState(false)
    const [isSavingAdjustment, setIsSavingAdjustment] = useState(false)
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
    const [extraFields, setExtraFields] = useState([])

    const bookingKey = String(request?.id || request?._id || itineraryId || '')

    const readAdjustmentStore = () => {
        try {
            const raw = localStorage.getItem('kufi_adjustment_requests')
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }

    const writeAdjustmentStore = (list) => {
        localStorage.setItem('kufi_adjustment_requests', JSON.stringify(Array.isArray(list) ? list : []))
    }

    const [adjustmentCard, setAdjustmentCard] = useState({
        title: '',
        description: '',
        location: '',
        cost: '',
        imageDataUrl: ''
    })

    useEffect(() => {
        if (!bookingKey) return
        const existing = readAdjustmentStore().find((x) => String(x?.bookingId || '') === bookingKey)
        if (!existing?.card) return
        setAdjustmentCard((prev) => ({
            ...prev,
            ...existing.card,
        }))
    }, [bookingKey])

    const findItineraryForBooking = async () => {
        const bookingKey = String(request?.id || request?._id || '')
        if (!bookingKey) return null

        // IMPORTANT: the list endpoint (GET /itineraries) is a metadata projection — it
        // deliberately omits `days` and `extraFields`. Reading the itinerary from it gave
        // us a record with `days === undefined`, so the traveler opened a itinerary that
        // rendered completely empty even though the supplier had sent it. Always resolve
        // the full document.
        try {
            const res = await api.get(`/itineraries/booking/${encodeURIComponent(bookingKey)}`)
            if (res?.data?._id) return res.data
        } catch {
            // Fall through to the list lookup below.
        }

        try {
            const res = await api.get('/itineraries').catch(() => ({ data: [] }))
            const list = Array.isArray(res?.data) ? res.data : []
            const match = list.find((it) => {
                const candidate = String(it?.bookingId || it?.requestId || it?.booking || it?.request || it?._id || it?.id || '')
                return candidate && candidate === bookingKey
            })
            if (!match) return null

            // The match came from the projected list, so re-read it in full before use.
            const id = match?._id || match?.id
            if (id) {
                try {
                    const full = await api.get(`/itineraries/${id}`)
                    if (full?.data?._id) return full.data
                } catch {
                    // Fall back to the projected record below.
                }
            }
            return match
        } catch {
            return null
        }
    }

    const formatTripData = (data, reqData) => {
        const raw = data?.tripData && typeof data.tripData === 'object' ? data.tripData : (data || {});

        const title =
            raw?.title ||
            data?.title ||
            (Array.isArray(reqData?.items) && reqData.items.length > 0
                ? reqData.items.map((i) => i?.activity?.title || i?.title).filter(Boolean).join(', ')
                : '') ||
            reqData?.experience ||
            reqData?.title ||
            'Trip Itinerary';

        const locationParts = [
            raw?.city || data?.city,
            raw?.country || data?.country || raw?.destination || data?.destination || reqData?.tripDetails?.country || reqData?.country || reqData?.destination
        ].filter(Boolean);

        const location =
            raw?.location ||
            data?.location ||
            (locationParts.length > 0 ? Array.from(new Set(locationParts)).join(', ') : null) ||
            '—';

        const travelers =
            raw?.groupSize ||
            data?.groupSize ||
            (data?.numberOfTravelers ? `${data.numberOfTravelers} ${data.numberOfTravelers === 1 ? 'Person' : 'People'}` : null) ||
            (raw?.numberOfTravelers ? `${raw.numberOfTravelers} ${raw.numberOfTravelers === 1 ? 'Person' : 'People'}` : null) ||
            (reqData?.guests ? `${reqData.guests} ${reqData.guests === 1 ? 'Person' : 'People'}` : null) ||
            (reqData?.travelers ? `${reqData.travelers} ${reqData.travelers === 1 ? 'Person' : 'People'}` : null) ||
            '1 Person';

        const sDate = raw?.startDate || data?.startDate || reqData?.tripDetails?.arrivalDate;
        const eDate = raw?.endDate || data?.endDate || reqData?.tripDetails?.departureDate;

        let dateLabel = raw?.date || data?.date || '';
        if (!dateLabel && (sDate || eDate)) {
            const d1 = sDate ? new Date(sDate).toLocaleDateString() : '—';
            const d2 = eDate ? new Date(eDate).toLocaleDateString() : '—';
            dateLabel = `${d1} to ${d2}`;
        }
        if (!dateLabel) {
            dateLabel = data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : (reqData?.createdAt ? new Date(reqData.createdAt).toLocaleDateString() : '—');
        }

        const description =
            raw?.description ||
            data?.notes ||
            reqData?.notes ||
            reqData?.message ||
            reqData?.specialRequest ||
            'Carefully curated itinerary details for your upcoming trip.';

        return {
            ...raw,
            title,
            location,
            groupSize: travelers,
            date: dateLabel,
            description,
            status: data?.status || reqData?.status || 'Pending',
        };
    };

    useEffect(() => {
        const loadFromBooking = () => {
            setTripData(formatTripData(null, request))
            setDays([])
            setExtraFields([])
        }

        const fetchItinerary = async () => {
            try {
                setLoadError(null)

                if (isBookingRequest) {
                    setLoading(true)
                    loadFromBooking()

                    const match = await findItineraryForBooking()
                    if (match) {
                        setTripData(formatTripData(match, request))
                        setDays(match.days || [])
                        setExtraFields(Array.isArray(match.extraFields) ? match.extraFields : [])
                    }

                    setLoading(false)
                    return
                }

                if (!itineraryId) {
                    setLoading(false)
                    return
                }

                setLoading(true)
                let record = null
                try {
                    const response = await api.get(`/itineraries/${itineraryId}`)
                    record = response?.data?._id ? response.data : null
                } catch (err) {
                    if (err?.response?.status !== 404) throw err
                }

                if (!record) {
                    const byBooking = await api
                        .get(`/itineraries/booking/${encodeURIComponent(itineraryId)}`)
                        .catch(() => null)
                    record = byBooking?.data?._id ? byBooking.data : null
                }

                if (record) {
                    setTripData(formatTripData(record, request))
                    setDays(record.days || [])
                    setExtraFields(Array.isArray(record.extraFields) ? record.extraFields : [])
                } else {
                    setLoadError(new Error('Itinerary not found'))
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
            if (!bookingKey) {
                alert('No request selected.')
                return
            }

            const cleanTitle = String(adjustmentCard.title || '').trim()
            const cleanDescription = String(adjustmentCard.description || '').trim()
            const cleanLocation = String(adjustmentCard.location || '').trim()
            const cleanCost = String(adjustmentCard.cost || '').trim()
            const cleanImage = String(adjustmentCard.imageDataUrl || '').trim()

            if (!cleanTitle && !cleanDescription && !cleanLocation && !cleanCost && !cleanImage) {
                alert('Please add at least one field (image/title/description/location/cost).')
                return
            }

            setIsSavingAdjustment(true)

            const record = {
                bookingId: bookingKey,
                createdAt: new Date().toISOString(),
                card: {
                    title: cleanTitle,
                    description: cleanDescription,
                    location: cleanLocation,
                    cost: cleanCost,
                    imageDataUrl: cleanImage,
                },
            }

            const list = readAdjustmentStore()
            const next = [record, ...list.filter((x) => String(x?.bookingId || '') !== bookingKey)]
            writeAdjustmentStore(next)

            try {
                await api.patch(`/bookings/${encodeURIComponent(String(bookingKey))}/adjustment`, {
                    card: record.card,
                })
            } catch (e) {
                console.error('Failed to persist adjustment request to backend:', e?.response?.data || e)
            }

            alert('Adjustment request sent!')
            setIsAdjusting(false)
            onRequestAdjustment && onRequestAdjustment(record)
        } catch (error) {
            console.error('Error saving adjustment request:', error)
            alert('Failed to send adjustment request')
        } finally {
            setIsSavingAdjustment(false)
        }
    }

    const handleAdjustmentImage = (file) => {
        if (!file) return
        if (!String(file.type || '').toLowerCase().startsWith('image/')) return
        const reader = new FileReader()
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : ''
            setAdjustmentCard((prev) => ({ ...prev, imageDataUrl: result }))
        }
        reader.readAsDataURL(file)
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
            morning: { title: "Description", description: "Describe the morning activities here..." },
            afternoon: { title: "Location", description: "Add the location details here..." },
            evening: { title: "Cost", description: "Add the estimated cost here..." }
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
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{tripData.title}</h2>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                               
                                <button
                                    onClick={() => setIsAdjusting(!isAdjusting)}
                                    className={`px-3 sm:px-5 py-2 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${isAdjusting ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    {isAdjusting ? 'Cancel Adjustment' : (
                                        <>
                                            <span className="hidden sm:inline">Request Adjustment</span>
                                            <span className="sm:hidden">Adjust</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-6 text-sm">{tripData.description}</p>

                        {isAdjusting && (
                            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                                <p className="text-sm font-bold text-slate-900 mb-3">Adjustment Request Card</p>

                                <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
                                    <div>
                                        <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                                            {adjustmentCard.imageDataUrl ? (
                                                <img src={adjustmentCard.imageDataUrl} alt="Adjustment" className="w-full h-full object-cover" />
                                            ) : (
                                                <p className="text-xs text-slate-400">Upload image</p>
                                            )}
                                        </div>

                                        <label className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                                            <span>Choose Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleAdjustmentImage(e.target.files?.[0])}
                                            />
                                        </label>

                                        {adjustmentCard.imageDataUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setAdjustmentCard((prev) => ({ ...prev, imageDataUrl: '' }))}
                                                className="mt-2 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                Remove Image
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 mb-1">Name</p>
                                            <input
                                                type="text"
                                                value={adjustmentCard.title}
                                                onChange={(e) => setAdjustmentCard((prev) => ({ ...prev, title: e.target.value }))}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#A67C52]"
                                                placeholder="e.g. Museum Visit"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold text-slate-900 mb-1">Description</p>
                                            <textarea
                                                rows={3}
                                                value={adjustmentCard.description}
                                                onChange={(e) => setAdjustmentCard((prev) => ({ ...prev, description: e.target.value }))}
                                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#A67C52]"
                                                placeholder="Write details for supplier..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 mb-1">Location</p>
                                                <input
                                                    type="text"
                                                    value={adjustmentCard.location}
                                                    onChange={(e) => setAdjustmentCard((prev) => ({ ...prev, location: e.target.value }))}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#A67C52]"
                                                    placeholder="e.g. Louvre Museum"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 mb-1">Cost</p>
                                                <input
                                                    type="text"
                                                    value={adjustmentCard.cost}
                                                    onChange={(e) => setAdjustmentCard((prev) => ({ ...prev, cost: e.target.value }))}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#A67C52]"
                                                    placeholder="e.g. 100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 rounded-lg p-2 sm:p-3">
                                <svg width="16" height="16" className="sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span className="text-[10px] sm:text-xs font-semibold text-slate-700 truncate">{tripData.location}</span>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 rounded-lg p-2 sm:p-3">
                                <svg width="16" height="16" className="sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                </svg>
                                <span className="text-[10px] sm:text-xs font-semibold text-slate-700 truncate">{tripData.groupSize}</span>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 rounded-lg p-2 sm:p-3">
                                <svg width="16" height="16" className="sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <path d="M16 2v4M8 2v4M3 10h18" />
                                </svg>
                                <span className="text-[10px] sm:text-xs font-semibold text-slate-700 truncate">{tripData.date}</span>
                            </div>
                        </div>
                    </section>

                    {Array.isArray(extraFields) && extraFields.filter((f) => String(f?.label || '').trim() || String(f?.value || '').trim()).length > 0 && (
                        <section className="mb-8 sm:mb-10">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Additional Details</h2>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                                {extraFields
                                    .filter((f) => String(f?.label || '').trim() || String(f?.value || '').trim())
                                    .map((field, idx) => (
                                        <div key={field.id || idx} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500 sm:w-40 shrink-0">
                                                {field.label || 'Detail'}
                                            </dt>
                                            <dd className="text-sm text-slate-800 whitespace-pre-wrap">
                                                {field.value || '—'}
                                            </dd>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    )}

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
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-5">{day.title}</h3>

                                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                                {Array.isArray(day.activities) && day.activities.length > 0 ? (
                                                    day.activities.map((act, aIdx) => (
                                                        <div key={act.id || aIdx} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0 space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#A67C52]/10 text-[#A67C52]">#{aIdx + 1}</span>
                                                                    <span>{act.title || 'Activity'}</span>
                                                                </p>
                                                                {(act.startTime || act.endTime) && (
                                                                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                                        {act.startTime || ''} {act.endTime ? `– ${act.endTime}` : ''}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-start gap-2 text-xs">
                                                                <span className="font-bold text-slate-700 min-w-[75px] shrink-0">Description:</span>
                                                                <span className="text-slate-600 leading-relaxed">{act.description || 'Included in day itinerary'}</span>
                                                            </div>

                                                            <div className="flex items-start gap-2 text-xs">
                                                                <span className="font-bold text-slate-700 min-w-[75px] shrink-0">Location:</span>
                                                                <span className="text-slate-600">{act.location || tripData.location || 'Included in destination'}</span>
                                                            </div>

                                                            <div className="flex items-start gap-2 text-xs">
                                                                <span className="font-bold text-slate-700 min-w-[75px] shrink-0">Cost:</span>
                                                                <span className="text-emerald-700 font-semibold">
                                                                    {act.price != null && act.price !== '' ? `$${act.price}` : 'Included in Package'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    ['morning', 'afternoon', 'evening'].map((time) => (
                                                        <div key={time} className="flex items-start gap-3">
                                                            <div className="mt-1">
                                                                {time === 'morning' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>}
                                                                {time === 'afternoon' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /></svg>}
                                                                {time === 'evening' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A67C52" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold text-slate-900 mb-1">{time === 'morning' ? 'Description' : time === 'afternoon' ? 'Location' : 'Cost'}</p>
                                                                <p className="text-xs text-slate-600 leading-relaxed">{day[time]?.description || 'Included in itinerary'}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {!hideHeaderFooter && <Footer />}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-4 px-4 sm:px-8 lg:px-20 shadow-lg z-40">
                <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <p className="text-sm text-slate-500">{isAdjusting ? 'Creating your adjustment request...' : 'Ready to book this itinerary?'}</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        {isAdjusting ? (
                            <>
                                <button
                                    onClick={() => setIsAdjusting(false)}
                                    className="px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAdjustment}
                                    disabled={isSavingAdjustment}
                                    className={`px-8 py-3 rounded-lg text-white font-semibold shadow-lg transition-all ${isSavingAdjustment ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#22C55E] hover:bg-[#16A34A]'}`}
                                >
                                    {isSavingAdjustment ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsAdjusting(true)}
                                    className="px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Request Adjustment
                                </button>
                                <button
                                    onClick={() => onPaymentClick && onPaymentClick({ ...request, days, tripData })}
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
