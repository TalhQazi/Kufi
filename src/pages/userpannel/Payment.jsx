import { useState } from 'react'
import PaymentSuccessModal from './PaymentSuccessModal.jsx'
import Footer from '../../components/layout/Footer'

export default function Payment({ bookingData, onBack, onForward, canGoBack, canGoForward }) {
    const [paymentMethod, setPaymentMethod] = useState('card')
    const [cardData, setCardData] = useState({
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        saveCard: false
    })
    const [couponCode, setCouponCode] = useState('')
    const [useWallet, setUseWallet] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const handlePayment = (e) => {
        e.preventDefault()
        console.log('Payment submitted:', { bookingData, paymentMethod, cardData })
        // Show success modal
        setShowSuccessModal(true)
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8 lg:px-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Complete Your Payment</h1>
                    <p className="text-sm sm:text-base text-slate-600">Your travel adventure is just one step away.</p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-600 shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p className="text-sm text-blue-800">Please review your trip details and complete your payment to confirm your booking.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Payment Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Traveler Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Traveler Information</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={`${bookingData?.firstName || ''} ${bookingData?.lastName || ''}`.trim() || 'John Anderson'}
                                        readOnly
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={bookingData?.email || 'john.anderson@email.com'}
                                        readOnly
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                                    <input
                                        type="tel"
                                        value={bookingData?.phone || '+1 (555) 123-4567'}
                                        readOnly
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Payment Method</h2>

                            <div className="space-y-3 mb-6">
                                {/* Credit/Debit Card */}
                                <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-primary-brown transition-colors">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-primary-brown focus:ring-primary-brown"
                                    />
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                        <line x1="1" y1="10" x2="23" y2="10" />
                                    </svg>
                                    <span className="text-sm font-medium text-slate-900">Credit / Debit Card</span>
                                </label>

                                {/* PayPal */}
                                <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-primary-brown transition-colors">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paypal"
                                        checked={paymentMethod === 'paypal'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-primary-brown focus:ring-primary-brown"
                                    />
                                    <span className="text-sm font-medium text-slate-900">PayPal</span>
                                </label>

                                {/* Stripe/Local Payment */}
                                <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-primary-brown transition-colors">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="stripe"
                                        checked={paymentMethod === 'stripe'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-primary-brown focus:ring-primary-brown"
                                    />
                                    <span className="text-sm font-medium text-slate-900">Stripe / Local Payment</span>
                                </label>
                            </div>

                            {/* Card Details Form (shown when card is selected) */}
                            {paymentMethod === 'card' && (
                                <div className="space-y-4 pt-4 border-t border-slate-200">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
                                        <input
                                            type="text"
                                            value={cardData.cardholderName}
                                            onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                                            placeholder="John Anderson"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                                        <input
                                            type="text"
                                            value={cardData.cardNumber}
                                            onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                                            <input
                                                type="text"
                                                value={cardData.expiryDate}
                                                onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                                                placeholder="MM/YY"
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
                                            <input
                                                type="text"
                                                value={cardData.cvv}
                                                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                                placeholder="123"
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                            />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={cardData.saveCard}
                                            onChange={(e) => setCardData({ ...cardData, saveCard: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <span className="text-sm text-slate-700">Save card for future bookings</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Coupon Code */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B6F40" strokeWidth="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                                    <polyline points="7.5 19.79 7.5 14.6 3 12" />
                                    <polyline points="21 12 16.5 14.6 16.5 19.79" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                                <h2 className="text-lg font-bold text-slate-900">Coupon Code</h2>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter coupon code"
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                />
                                <button className="px-6 py-2.5 bg-primary-brown text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm">
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Wallet Balance */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <svg width="18" height="18" className="sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#9B6F40" strokeWidth="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                        <line x1="1" y1="10" x2="23" y2="10" />
                                    </svg>
                                    <div className="min-w-0">
                                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Use Wallet Balance</h3>
                                        <p className="text-[10px] sm:text-xs text-slate-600">Available: $ 150</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useWallet}
                                        onChange={(e) => setUseWallet(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-brown/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-brown"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Trip Summary */}
                    <div className="lg:col-span-1 order-first lg:order-last">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Trip Summary</h2>

                            <div className="mb-4 pb-4 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-1">Paradise Travel Co.</h3>
                                <p className="text-sm text-slate-600">June 15 - June 20, 2025</p>
                                <p className="text-xs text-slate-500">2 Travelers</p>
                            </div>

                            <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Activities</span>
                                    <span className="font-semibold text-slate-900">$850.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Accommodation</span>
                                    <span className="font-semibold text-slate-900">$1200.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Transportation</span>
                                    <span className="font-semibold text-slate-900">$250.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Meals</span>
                                    <span className="font-semibold text-slate-900">$150.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Taxes</span>
                                    <span className="font-semibold text-slate-900">$180.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Service Fee</span>
                                    <span className="font-semibold text-slate-900">$50.00</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                                <span className="text-base sm:text-lg font-bold text-slate-900">Total Amount</span>
                                <span className="text-xl sm:text-2xl font-bold text-green-600">$2450.00</span>
                            </div>

                            <button
                                onClick={handlePayment}
                                className="w-full bg-primary-brown hover:bg-primary-dark text-white py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors mb-3 text-sm sm:text-base"
                            >
                                <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                                <span className="whitespace-nowrap">Confirm & Pay Now</span>
                            </button>

                            <button
                                onClick={onBack}
                                className="w-full py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Success Modal */}
            {showSuccessModal && (
                <PaymentSuccessModal
                    onClose={() => setShowSuccessModal(false)}
                    onViewTours={() => {
                        setShowSuccessModal(false)
                        // Navigate to user dashboard - this will be handled by App.jsx
                        window.location.href = '#user-dashboard'
                    }}
                    bookingReference="SKY-DXB-2024-1847"
                    totalAmount="2450.00"
                />
            )}
            <Footer />
        </div>
    )
}
