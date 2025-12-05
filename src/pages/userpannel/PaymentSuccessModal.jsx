export default function PaymentSuccessModal({ onClose, onViewTours, bookingReference = "SKY-DXB-2024-1847", totalAmount = "2450.00" }) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-green-600">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Payment Successful!</h2>

                {/* Message */}
                <p className="text-slate-600 text-center mb-6">
                    Your trip to Dubai is almost ready for an amazing adventure!
                </p>

                {/* Booking Details */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Booking Reference</span>
                        <span className="text-sm font-bold text-slate-900">{bookingReference}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Total Amount Paid</span>
                        <span className="text-lg font-bold text-green-600">${totalAmount}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-4">
                    <button
                        onClick={onViewTours}
                        className="w-full bg-primary-brown hover:bg-primary-dark text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        View Upcoming Tours
                    </button>

                    <button
                        onClick={() => {
                            console.log('Downloading receipt...')
                            // Handle receipt download
                        }}
                        className="w-full border-2 border-slate-300 text-slate-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Receipt
                    </button>
                </div>

                {/* Email Confirmation Note */}
                <p className="text-xs text-slate-500 text-center">
                    A confirmation email has been sent to your registered email address
                </p>
            </div>
        </div>
    )
}
