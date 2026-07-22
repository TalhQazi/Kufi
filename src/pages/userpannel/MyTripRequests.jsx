import React, { useState, useEffect, useRef } from 'react'
import { FiBell, FiMapPin, FiCalendar, FiExternalLink, FiEye } from 'react-icons/fi'
import api from '../../api'
import ProfilePic from '../../components/ui/ProfilePic'
import { mapCustomerStatus, customerStatusColor } from '../../utils/customerStatus'

export default function MyTripRequests({
    onLogout,
    onBack,
    onHomeClick,
    onNotificationClick,
    onProfileClick,
    onMyProfileClick,
    onSettingsClick,
    onItineraryClick,
    hideHeaderFooter = false,
}) {
    const [rows, setRows] = useState([])
    const [notifications, setNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [selectedDetails, setSelectedDetails] = useState(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [dropdown, setDropdown] = useState(false)
    const dropdownRef = useRef(null)
    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('currentUser')) || {}
        } catch {
            return {}
        }
    })()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdown(false)
            }
        }
        if (dropdown) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [dropdown])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setLoadError(null)
                const userId = currentUser?._id || currentUser?.id
                const email = String(currentUser?.email || '').trim()

                const bookingsPromise = userId
                    ? api.get(`/bookings/user/${encodeURIComponent(String(userId))}${email ? `?email=${encodeURIComponent(email)}` : ''}`)
                        .catch(() => api.get('/bookings'))
                    : api.get('/bookings')

                const [bookingsRes, itinerariesRes, notifRes] = await Promise.all([
                    bookingsPromise.catch(() => ({ data: [] })),
                    api.get('/itineraries', { timeout: 8000 }).catch(() => ({ data: [] })),
                    api.get('/notifications').catch(() => ({ data: { notifications: [], unreadCount: 0 } })),
                ])

                const bookingsRaw =
                    bookingsRes?.data?.bookings ??
                    bookingsRes?.data?.requests ??
                    bookingsRes?.data?.data ??
                    bookingsRes?.data
                const bookings = Array.isArray(bookingsRaw) ? bookingsRaw : []

                const itinerariesRaw = itinerariesRes?.data
                const itineraries = Array.isArray(itinerariesRaw)
                    ? itinerariesRaw
                    : (itinerariesRaw?.itineraries ?? itinerariesRaw?.data ?? [])

                const itinByBooking = new Map()
                itineraries.forEach((it) => {
                    const key = String(it?.bookingId?._id || it?.bookingId || '')
                    if (key) itinByBooking.set(key, it)
                })

                const mapped = bookings.map((b) => {
                    const id = b._id || b.id
                    const itin = itinByBooking.get(String(id)) || null
                    const supplier =
                        b.supplier ||
                        itin?.supplierId ||
                        null
                    const supplierName =
                        (typeof supplier === 'object' && (supplier?.name || supplier?.businessName || supplier?.companyName)) ||
                        b.supplierName ||
                        '—'
                    const destination =
                        b.tripDetails?.country ||
                        itin?.destination ||
                        b.destination ||
                        '—'
                    const statusLabel = mapCustomerStatus(itin?.status || b.status, {
                        hasItinerary: Boolean(itin && !['Pending', 'Pending Review'].includes(itin?.status)),
                        paymentStatus: b.paymentStatus,
                    })
                    const requestNumber = `REQ-${String(id).slice(-8).toUpperCase()}`

                    return {
                        id,
                        requestNumber,
                        destination,
                        submissionDate: b.createdAt,
                        lastUpdated: itin?.updatedAt || b.updatedAt || b.createdAt,
                        supplierName,
                        status: statusLabel,
                        rawStatus: itin?.status || b.status,
                        booking: b,
                        itinerary: itin,
                        itineraryId: itin?._id || itin?.id || null,
                    }
                })

                // Include itineraries without a matched booking
                itineraries.forEach((it) => {
                    const bookingKey = String(it?.bookingId?._id || it?.bookingId || '')
                    if (bookingKey && itinByBooking.has(bookingKey) && mapped.some((r) => String(r.id) === bookingKey)) {
                        return
                    }
                    const id = it._id || it.id
                    if (mapped.some((r) => String(r.itineraryId) === String(id))) return
                    const supplier = it.supplierId
                    mapped.push({
                        id,
                        requestNumber: `ITN-${String(id).slice(-8).toUpperCase()}`,
                        destination: it.destination || it.location || '—',
                        submissionDate: it.createdAt,
                        lastUpdated: it.updatedAt || it.createdAt,
                        supplierName:
                            (typeof supplier === 'object' && (supplier?.name || supplier?.companyName)) ||
                            '—',
                        status: mapCustomerStatus(it.status, { hasItinerary: true }),
                        rawStatus: it.status,
                        booking: null,
                        itinerary: it,
                        itineraryId: id,
                    })
                })

                mapped.sort((a, b) => new Date(b.submissionDate || 0) - new Date(a.submissionDate || 0))
                setRows(mapped)

                const notifs = notifRes?.data?.notifications ?? (Array.isArray(notifRes?.data) ? notifRes.data : [])
                setNotifications(Array.isArray(notifs) ? notifs : [])
                setUnreadCount(Number(notifRes?.data?.unreadCount) || (Array.isArray(notifs) ? notifs.filter((n) => !n.read).length : 0))
            } catch (err) {
                console.error('MyTripRequests load error:', err)
                setLoadError('Unable to load your trip requests. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const formatDate = (value) => {
        if (!value) return '—'
        try {
            return new Date(value).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        } catch {
            return '—'
        }
    }

    const itineraryHref = (id) => (id ? `#itinerary/${id}` : null)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6E4E]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {!hideHeaderFooter && (
                <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => (onHomeClick ? onHomeClick() : (window.location.hash = '#home'))}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <img src="/assets/navbar.png" alt="Kufi Travel" className="h-10 w-20 sm:h-[66px] sm:w-28 object-contain" />
                        </button>
                        <div className="flex items-center gap-4 md:gap-6">
                            <button
                                type="button"
                                className="text-gray-500 hover:text-gray-700 relative"
                                onClick={() => onNotificationClick && onNotificationClick()}
                            >
                                <FiBell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <div className="relative" ref={dropdownRef}>
                                <button type="button" onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2">
                                    <ProfilePic user={currentUser} size="sm" />
                                </button>
                                {dropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-[#A67C52] hover:bg-slate-50"
                                            onClick={() => {
                                                onMyProfileClick && onMyProfileClick()
                                                setDropdown(false)
                                            }}
                                        >
                                            MY PROFILE
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                            onClick={() => {
                                                onSettingsClick && onSettingsClick()
                                                setDropdown(false)
                                            }}
                                        >
                                            SETTINGS
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-slate-50"
                                            onClick={() => {
                                                onLogout && onLogout()
                                                setDropdown(false)
                                            }}
                                        >
                                            LOG OUT
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Trip Requests</h1>
                        <p className="text-sm text-slate-600 mt-1">Track submissions, supplier responses, and itinerary updates</p>
                    </div>
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-sm font-semibold text-[#A67C52] hover:underline w-fit"
                        >
                            ← Back
                        </button>
                    )}
                </div>

                {loadError && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {loadError}
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[720px]">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-4 py-3">Request Number</th>
                                    <th className="px-4 py-3">Destination</th>
                                    <th className="px-4 py-3">Submission Date</th>
                                    <th className="px-4 py-3">Supplier Name</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Last Updated</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">
                                            No trip requests yet.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/60">
                                            <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-800">
                                                {row.requestNumber}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FiMapPin className="text-slate-400 shrink-0" />
                                                    {row.destination}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FiCalendar className="text-slate-400 shrink-0" />
                                                    {formatDate(row.submissionDate)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700">{row.supplierName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${customerStatusColor(row.status)}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{formatDate(row.lastUpdated)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedDetails(row)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <FiEye size={14} />
                                                        Details
                                                    </button>
                                                    {row.itineraryId ? (
                                                        <a
                                                            href={itineraryHref(row.itineraryId)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#A67C52] text-white text-xs font-semibold hover:bg-[#8e6a45]"
                                                        >
                                                            <FiExternalLink size={14} />
                                                            View Itinerary
                                                        </a>
                                                    ) : (
                                                        <span className="inline-flex px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed">
                                                            View Itinerary
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Notification History</h2>
                        {unreadCount > 0 && (
                            <span className="text-xs font-semibold text-[#A67C52]">{unreadCount} unread</span>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <p className="text-sm text-slate-500">No notifications yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {notifications.slice(0, 20).map((n) => (
                                <li
                                    key={n._id || n.id}
                                    className={`rounded-xl border px-4 py-3 ${n.read ? 'border-slate-100 bg-white' : 'border-[#A67C52]/20 bg-[#A67C52]/5'}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                                            <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                                        </div>
                                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                            {formatDate(n.createdAt)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>

            {selectedDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setSelectedDetails(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Request Details</h3>
                                <p className="text-xs text-slate-500 font-mono mt-1">{selectedDetails.requestNumber}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedDetails(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-500">Destination</dt>
                                <dd className="font-semibold text-slate-900 text-right">{selectedDetails.destination}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-500">Supplier</dt>
                                <dd className="font-semibold text-slate-900 text-right">{selectedDetails.supplierName}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-500">Status</dt>
                                <dd>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${customerStatusColor(selectedDetails.status)}`}>
                                        {selectedDetails.status}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-500">Submitted</dt>
                                <dd className="font-semibold text-slate-900">{formatDate(selectedDetails.submissionDate)}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-slate-500">Last Updated</dt>
                                <dd className="font-semibold text-slate-900">{formatDate(selectedDetails.lastUpdated)}</dd>
                            </div>
                        </dl>
                        <div className="mt-6 flex flex-wrap gap-2 justify-end">
                            {selectedDetails.itineraryId && (
                                <a
                                    href={itineraryHref(selectedDetails.itineraryId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-lg bg-[#A67C52] text-white text-sm font-semibold hover:bg-[#8e6a45]"
                                >
                                    Open Itinerary
                                </a>
                            )}
                            {onItineraryClick && selectedDetails.itinerary && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onItineraryClick(selectedDetails.itinerary)
                                        setSelectedDetails(null)
                                    }}
                                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    View Here
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setSelectedDetails(null)}
                                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
