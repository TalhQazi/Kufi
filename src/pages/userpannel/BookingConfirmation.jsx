export default function BookingConfirmation({ onContinueBrowsing, onGoToCart }) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-green-600">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Item Added to Your Cart</h1>
                    <p className="text-slate-600">Review your selected trip details or continue exploring unforgettable experiences.</p>
                </div>

                {/* Trip Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    {/* Hero Image */}
                    <div className="relative h-32">
                        <img
                            src="/assets/dest-1.jpeg"
                            alt="Explore Thailand"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-6">
                            <div>
                                <h2 className="text-white text-xl font-bold mb-1">Explore Thailand</h2>
                                <div className="flex items-center gap-1.5 text-white text-sm">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <span>Thailand</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trip Details */}
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* Travel Dates */}
                            <div>
                                <div className="flex items-center gap-2 text-slate-600 mb-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span className="text-sm font-medium">Travel Dates</span>
                                </div>
                                <p className="text-sm text-slate-900">Mar 15, 2024 - Mar 25, 2024</p>
                                <p className="text-xs text-slate-500">10 days</p>
                            </div>

                            {/* Travelers */}
                            <div>
                                <div className="flex items-center gap-2 text-slate-600 mb-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    <span className="text-sm font-medium">Travelers</span>
                                </div>
                                <p className="text-sm text-slate-900">2 people</p>
                            </div>

                            {/* Accommodation */}
                            <div>
                                <div className="flex items-center gap-2 text-slate-600 mb-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    </svg>
                                    <span className="text-sm font-medium">Accommodation</span>
                                </div>
                                <p className="text-sm text-slate-900">Luxury Resort</p>
                            </div>

                            {/* Transport */}
                            <div>
                                <div className="flex items-center gap-2 text-slate-600 mb-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="3" width="15" height="13" />
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                    <span className="text-sm font-medium">Transport</span>
                                </div>
                                <p className="text-sm text-slate-900">Private Transfer</p>
                            </div>
                        </div>

                        {/* Activities Included */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 11 12 14 22 4" />
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                                <span className="text-sm font-medium">Activities Included</span>
                            </div>
                            <ul className="space-y-1.5 ml-6">
                                <li className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span>Bangkok City Tour & Grand Palace</span>
                                </li>
                                <li className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span>Phi Phi Islands Day Trip</span>
                                </li>
                                <li className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span>Thai Cooking Class</span>
                                </li>
                                <li className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span>Elephant Sanctuary Visit</span>
                                </li>
                            </ul>
                        </div>

                        {/* Edit Link */}
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                            Edit Trip Details
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onContinueBrowsing}
                        className="flex-1 py-3 px-6 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        Continue Browsing
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button
                        onClick={onGoToCart}
                        className="flex-1 py-3 px-6 bg-primary-brown text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        GO TO CART
                    </button>
                </div>
            </div>
        </div>
    )
}
