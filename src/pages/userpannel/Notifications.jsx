import { useState, useEffect } from 'react'
import api from '../../api'
import ProfilePic from '../../components/ui/ProfilePic'

export default function Notifications({ onLogout, onBack, onHomeClick, onNotificationClick, onProfileClick, onSettingsClick, hideHeaderFooter = false }) {
    const [notifications, setNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {}

    const fetchNotifications = async ({ silent = false } = {}) => {
        try {
            if (!silent) setIsLoading(true)
            const res = await api.get('/notifications')
            const list = res?.data?.notifications ?? (Array.isArray(res?.data) ? res.data : [])
            setNotifications(Array.isArray(list) ? list : [])
            setUnreadCount(Number(res?.data?.unreadCount) || (Array.isArray(list) ? list.filter((n) => !n.read).length : 0))
        } catch (error) {
            console.error('Error fetching notifications:', error)
            // Keep whatever is already on screen rather than blanking the list on a
            // transient failure.
            if (!silent) setNotifications([])
        } finally {
            if (!silent) setIsLoading(false)
        }
    }

    // Poll so a notification raised while this page is open (e.g. the supplier sending an
    // itinerary) appears without a manual reload.
    useEffect(() => {
        fetchNotifications()

        const refresh = () => fetchNotifications({ silent: true })
        const onVisibility = () => {
            if (document.visibilityState === 'visible') refresh()
        }

        window.addEventListener('focus', refresh)
        document.addEventListener('visibilitychange', onVisibility)
        const intervalId = window.setInterval(refresh, 60000)

        return () => {
            window.removeEventListener('focus', refresh)
            document.removeEventListener('visibilitychange', onVisibility)
            window.clearInterval(intervalId)
        }
    }, [])

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all')
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error(err)
        }
    }

    const markOne = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`)
            setNotifications((prev) => prev.map((n) => (String(n._id || n.id) === String(id) ? { ...n, read: true } : n)))
            setUnreadCount((c) => Math.max(0, c - 1))
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="bg-white min-h-screen">
            {!hideHeaderFooter && (
                <nav className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 lg:px-20 sticky top-0 z-50">
                    <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
                        <button
                            onClick={() => (onHomeClick ? onHomeClick() : (window.location.hash = '#home'))}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <img src="/assets/navbar.png" alt="Kufi Travel" className="h-10 w-20 sm:h-[66px] sm:w-28 object-contain" />
                        </button>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
                                onClick={() => onNotificationClick && onNotificationClick()}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => onProfileClick && onProfileClick()}
                                className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ProfilePic user={currentUser} size="sm" />
                            </button>
                        </div>
                    </div>
                </nav>
            )}

            <main className="px-4 sm:px-8 lg:px-20 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-1">Notifications</h1>
                            <p className="text-sm text-slate-600">Updates about your trip requests and itineraries</p>
                        </div>
                        {unreadCount > 0 && (
                            <button type="button" onClick={markAllRead} className="text-xs font-semibold text-[#A67C52] hover:underline">
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-brown"></div>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((n) => {
                                const id = n._id || n.id
                                const itineraryId = n.itineraryId?._id || n.itineraryId
                                return (
                                    <div
                                        key={id}
                                        className={`border rounded-xl p-4 ${n.read ? 'border-slate-200' : 'border-[#A67C52]/25 bg-[#A67C52]/5'}`}
                                        onClick={() => !n.read && markOne(id)}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <h3 className="font-semibold text-slate-900">{n.title}</h3>
                                            <span className="text-xs text-slate-400 whitespace-nowrap">
                                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 mb-3">{n.message}</p>
                                        {itineraryId && (
                                            <a
                                                href={`#itinerary/${itineraryId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View Itinerary
                                            </a>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                                <p className="text-slate-500">No notifications yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
