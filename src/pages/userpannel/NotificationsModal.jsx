import { useState, useEffect } from 'react'
import api from '../../api'

export default function NotificationsModal({ onClose, onPaymentClick, onViewItinerary }) {
    const [notifications, setNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)

    const loadNotifications = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/notifications')
            const list = res?.data?.notifications ?? (Array.isArray(res?.data) ? res.data : [])
            setNotifications(Array.isArray(list) ? list : [])
            setUnreadCount(Number(res?.data?.unreadCount) || (Array.isArray(list) ? list.filter((n) => !n.read).length : 0))
        } catch (error) {
            console.error('Error fetching notifications:', error)
            setNotifications([])
            setUnreadCount(0)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadNotifications()
    }, [])

    const markOneRead = async (id) => {
        if (!id) return
        try {
            await api.patch(`/notifications/${id}/read`)
            setNotifications((prev) => prev.map((n) => (String(n._id || n.id) === String(id) ? { ...n, read: true } : n)))
            setUnreadCount((c) => Math.max(0, c - 1))
        } catch (err) {
            console.error('Failed to mark notification read:', err)
        }
    }

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all')
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error('Failed to mark all read:', err)
        }
    }

    const formatTime = (value) => {
        if (!value) return ''
        try {
            return new Date(value).toLocaleString()
        } catch {
            return ''
        }
    }

    const handleOpenItinerary = (n) => {
        const id = n.itineraryId?._id || n.itineraryId || n.bookingId?._id || n.bookingId
        if (id && onViewItinerary) {
            onViewItinerary({ _id: id, id })
            onClose()
            return
        }
        if (id) {
            window.open(`#itinerary/${id}`, '_blank', 'noopener,noreferrer')
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-end p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto mt-16"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-slate-600">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
                            </p>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="text-xs font-semibold text-[#A67C52] hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-brown"></div>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((n) => {
                                const id = n._id || n.id
                                return (
                                    <div
                                        key={id}
                                        className={`border rounded-xl p-4 cursor-pointer transition-colors ${n.read ? 'border-slate-200 bg-white' : 'border-[#A67C52]/25 bg-[#A67C52]/5'}`}
                                        onClick={() => {
                                            if (!n.read) markOneRead(id)
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-1">
                                            <h3 className="font-semibold text-slate-900 text-sm">{n.title}</h3>
                                            {!n.read && <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />}
                                        </div>
                                        <p className="text-sm text-slate-700 mb-2">{n.message}</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs text-slate-400">{formatTime(n.createdAt)}</p>
                                            {(n.itineraryId || n.bookingId) && (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="px-3 py-1 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleOpenItinerary(n)
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                    {onPaymentClick && ['itinerary_generated', 'itinerary_updated', 'approved', 'accepted'].includes(String(n.type || '')) && (
                                                        <button
                                                            type="button"
                                                            className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onPaymentClick({ _id: n.itineraryId || n.bookingId })
                                                                onClose()
                                                            }}
                                                        >
                                                            Pay
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-10 text-slate-500 text-sm italic">
                                No notifications yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
