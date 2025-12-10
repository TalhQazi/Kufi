import { useState } from 'react'

export default function NotificationsModal({ onClose, onPaymentClick }) {
    const [activeTab, setActiveTab] = useState('all')

    const notifications = [
        {
            id: 1,
            type: 'inquiry',
            supplier: 'SkyHigh Adventures',
            avatar: '/assets/hero-card1.jpeg',
            message: "Your trip request for 'Dubai Desert Safari' has been accepted.",
            time: '2 hrs ago',
            status: 'accepted',
            actions: ['View Itinerary', 'Proceed to Payment']
        },
        {
            id: 2,
            type: 'inquiry',
            supplier: 'Ocean Explorers',
            avatar: '/assets/hero-card2.jpeg',
            message: "Your trip request for 'Maldives Diving' is pending review.",
            time: '5 hrs ago',
            status: 'pending',
            actions: ['Awaiting Response']
        }
    ]

    const systemNotifications = [
        {
            id: 1,
            icon: 'success',
            title: 'Payment Successful',
            message: 'Your payment for Bali Adventure has been processed',
            time: '1 day ago'
        },
        {
            id: 2,
            icon: 'info',
            title: 'Your trip starts in 3 days',
            message: 'Dubai Desert Safari begins on March 15, 2024',
            time: '2 days ago'
        }
    ]

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

    // Filter notifications based on active tab
    const filteredNotifications = notifications.filter((notification) => {
        if (activeTab === 'all') return true
        if (activeTab === 'replied') return notification.status === 'accepted'
        if (activeTab === 'pending') return notification.status === 'pending'
        return true
    })

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
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-xl font-bold text-slate-900">Notifications & Requests</h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-slate-600">Track your booking requests and supplier responses</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'all'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab('replied')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'replied'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Inquiry Replied Back
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'pending'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Pending
                        </button>
                    </div>

                    {/* Notification Cards */}
                    <div className="space-y-4 mb-6">
                        {filteredNotifications.map((notification) => (
                            <div key={notification.id} className="border border-slate-200 rounded-xl p-4">
                                <div className="flex gap-3">
                                    {/* Avatar */}
                                    <img
                                        src={notification.avatar}
                                        alt={notification.supplier}
                                        className="w-12 h-12 rounded-full object-cover shrink-0"
                                    />

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-900 text-sm">{notification.supplier}</h3>
                                                <p className="text-xs text-slate-500">{notification.time}</p>
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-xs font-medium ml-2 ${getStatusColor(notification.status)}`}>
                                                {getStatusIcon(notification.status)}
                                                <span>{notification.status === 'accepted' ? 'Inquiry Replied Back' : 'Pending'}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-700 mb-3">{notification.message}</p>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            {notification.actions.map((action, index) => (
                                                <button
                                                    key={index}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${action === 'View Itinerary'
                                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                        : action === 'Proceed to Payment'
                                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                                            : 'bg-slate-200 text-slate-600 cursor-not-allowed'
                                                        }`}
                                                    disabled={action === 'Awaiting Response'}
                                                    onClick={() => {
                                                        if (action === 'Proceed to Payment') {
                                                            onPaymentClick && onPaymentClick()
                                                            onClose()
                                                        }
                                                    }}
                                                >
                                                    {action}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* System Notifications */}
                    <div>
                        <h3 className="text-base font-bold text-slate-900 mb-3">System Notifications</h3>
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
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-900 text-sm">{notification.title}</h4>
                                        <p className="text-sm text-slate-600">{notification.message}</p>
                                        <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
