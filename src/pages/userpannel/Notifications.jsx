import { useState, useEffect } from 'react'
import api from '../../api'
import ProfilePic from '../../components/ui/ProfilePic'

export default function Notifications({ onLogout, onBack, onHomeClick, onNotificationClick, onProfileClick, onSettingsClick, hideHeaderFooter = false }) {
    const [activeTab, setActiveTab] = useState('all')
    const [notifications, setNotifications] = useState([])
    const [systemNotifications, setSystemNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {}

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true)
                const [itinerariesRes, systemRes] = await Promise.all([
                    api.get('/itineraries').catch(() => ({ data: [] })),
                    api.get('/notifications/system').catch(() => ({ data: { notifications: [] } }))
                ])

                const tripRequests = itinerariesRes.data || []
                const mappedRequests = tripRequests.map(trip => {
                    const status = trip.status?.toLowerCase()
                    let mappedStatus = 'pending'
                    let actions = ['Awaiting Response']

                    if (['accepted', 'supplier replied back', 'ready'].includes(status)) {
                        mappedStatus = 'accepted'
                        actions = ['View Itinerary', 'Proceed to Payment']
                    }

                    return {
                        id: trip._id || trip.id,
                        type: 'inquiry',
                        supplier: trip.supplierName || 'Travel Partner',
                        avatar: trip.imageUrl || trip.image || '/assets/hero-card1.jpeg',
                        message: `Your trip request for '${trip.title}' is ${trip.status || 'in progress'}.`,
                        time: new Date(trip.createdAt).toLocaleDateString(),
                        status: mappedStatus,
                        actions: actions
                    }
                })

                setNotifications(mappedRequests)

                const sysNotifs = (systemRes.data.notifications || []).map((n, idx) => ({
                    id: `sys-${idx}`,
                    icon: n.iconType === 'success' ? 'success' : 'info',
                    title: n.title,
                    message: n.message || n.title,
                    time: n.time
                }))
                setSystemNotifications(sysNotifs)

            } catch (error) {
                console.error("Error fetching notifications:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchNotifications()
    }, [])

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'text-green-600'
            case 'pending':
                return 'text-orange-500'
            default:
                return 'text-slate-600'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green-600">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )
            case 'pending':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-orange-500">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )
            default:
                return null
        }
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            {!hideHeaderFooter && (
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


                            <div className="relative">
                                <button
                                    onClick={() => onProfileClick && onProfileClick()}
                                    className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <ProfilePic user={currentUser} size="sm" />
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Content */}
            <main className="px-4 sm:px-8 lg:px-20 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Notifications & Requests</h1>
                        <p className="text-sm text-slate-600">Track your booking requests and supplier responses</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab('replied')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'replied'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Inquiry Replied Back
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pending'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Pending
                        </button>
                    </div>

                    {/* Notification Cards */}
                    <div className="space-y-4 mb-8">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-brown"></div>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div key={notification.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4">
                                        {/* Avatar */}
                                        <img
                                            src={notification.avatar}
                                            alt={notification.supplier}
                                            className="w-12 h-12 rounded-full object-cover shrink-0"
                                        />

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{notification.supplier}</h3>
                                                    <p className="text-xs text-slate-500">{notification.time}</p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-sm font-medium capitalize ${getStatusColor(notification.status)}`}>
                                                    {getStatusIcon(notification.status)}
                                                    <span>{notification.status}</span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-700 mb-3">{notification.message}</p>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                {notification.actions.map((action, index) => (
                                                    <button
                                                        key={index}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${action === 'View Itinerary'
                                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                            : action === 'Proceed to Payment'
                                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                                : 'bg-slate-200 text-slate-600 cursor-not-allowed'
                                                            }`}
                                                        disabled={action === 'Awaiting Response'}
                                                    >
                                                        {action}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                                <p className="text-slate-500">No notifications yet.</p>
                            </div>
                        )}
                    </div>

                    {/* System Notifications */}
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">System Notifications</h2>
                        <div className="space-y-3">
                            {systemNotifications.map((notification) => (
                                <div key={notification.id} className="flex gap-3 items-start">
                                    {/* Icon */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notification.icon === 'success' ? 'bg-green-100' : 'bg-blue-100'
                                        }`}>
                                        {notification.icon === 'success' ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green-600">
                                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 text-sm">{notification.title}</h3>
                                        <p className="text-sm text-slate-600">{notification.message}</p>
                                        <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
