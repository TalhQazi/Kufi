import { useState } from 'react'
import PaymentSuccessModal from './PaymentSuccessModal.jsx'
import Footer from '../../components/layout/Footer'

export default function Payment({ bookingData, onBack, onForward, canGoBack, canGoForward, onNotificationClick, onHomeClick }) {
    const [paymentMethod, setPaymentMethod] = useState('card')
    const [cardData, setCardData] = useState({
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        saveCard: false
    })
    const [billingAddress, setBillingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States'
    })
    const [useWallet, setUseWallet] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (onHomeClick) {
            onHomeClick();
        } else {
            window.location.hash = '#home';
        }
    };

    const handlePayment = (e) => {
        e.preventDefault()
        console.log('Payment submitted:', { bookingData, paymentMethod, cardData })
        // Show success modal
        setShowSuccessModal(true)
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation Header */}
            <nav className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 lg:px-20 sticky top-0 z-50">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                if (onBack) {
                                    onBack()
                                } else {
                                    window.location.hash = '#home'
                                }
                            }}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <img src="/assets/navbar.png" alt="Kufi Travel" className="h-10 w-20 sm:h-[66px] sm:w-28 object-contain" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNotificationClick && onNotificationClick()}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="py-6 sm:py-10 px-4 sm:px-8 lg:px-20">
                <div className="max-w-6xl mx-auto">
                    {/* Page Title */}
                    <div className="relative mb-8 flex items-center">
                        <button
                            onClick={handleBack}
                            className="absolute left-0 flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-semibold transition-all group"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:-translate-x-1">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <div className="w-full text-center px-20">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Complete Your Payment</h1>
                            <p className="text-sm sm:text-base text-slate-600">Your travel adventure is just one step away.</p>
                        </div>
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
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
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
                                    <div className="sm:col-span-2">
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
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Payment Method</h2>

                                <div className="space-y-3 mb-6">
                                    {/* Credit/Debit Card */}
                                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary-brown bg-primary-brown/5' : 'border-slate-200'}`}>
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
                                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-primary-brown bg-primary-brown/5' : 'border-slate-200'}`}>
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

                                    {/* Stripe */}
                                    <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-primary-brown bg-primary-brown/5' : 'border-slate-200'}`}>
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

                                {/* Card Details Form */}
                                {paymentMethod === 'card' && (
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
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

                                        <label className="flex items-center gap-2 cursor-pointer pt-2">
                                            <input
                                                type="checkbox"
                                                checked={cardData.saveCard}
                                                onChange={(e) => setCardData({ ...cardData, saveCard: e.target.checked })}
                                                className="w-4 h-4 rounded border-slate-300 text-primary-brown focus:ring-primary-brown"
                                            />
                                            <span className="text-sm text-slate-700">Save card for future bookings</span>
                                        </label>

                                        {/* Billing Address Section */}
                                        <div className="pt-6 mt-6 border-t border-slate-100">
                                            <h3 className="text-sm font-bold text-slate-900 mb-4">Billing Address</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Street Address</label>
                                                    <input
                                                        type="text"
                                                        value={billingAddress.street}
                                                        onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                                                        placeholder="123 Travel Lane"
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">City</label>
                                                        <input
                                                            type="text"
                                                            value={billingAddress.city}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                                                            placeholder="San Francisco"
                                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">State / Province</label>
                                                        <input
                                                            type="text"
                                                            value={billingAddress.state}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                                                            placeholder="CA"
                                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">ZIP / Postal Code</label>
                                                        <input
                                                            type="text"
                                                            value={billingAddress.zip}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, zip: e.target.value })}
                                                            placeholder="94105"
                                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Country</label>
                                                        <select
                                                            value={billingAddress.country}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm bg-white"
                                                        >
                                                            <option value="United States">United States</option>
                                                            <option value="United Kingdom">United Kingdom</option>
                                                            <option value="Canada">Canada</option>
                                                            <option value="Australia">Australia</option>
                                                            <option value="Germany">Germany</option>
                                                            <option value="France">France</option>
                                                            <option value="UAE">UAE</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                    <p className="text-sm text-slate-600 font-medium">June 15 - June 20, 2025</p>
                                    <p className="text-xs text-slate-500">2 Travelers • 5 Nights</p>
                                </div>

                                <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Activities</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Accommodation</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Transportation</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Meals</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Taxes & Fees</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-base sm:text-lg font-bold text-slate-900">Total</span>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    className="w-full bg-primary-brown hover:bg-primary-dark text-white py-3 sm:py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-brown/20 mb-4 text-sm sm:text-base active:scale-[0.98]"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                    Confirm & Pay Now
                                </button>

                                <button
                                    onClick={handleBack}
                                    className="w-full py-2 text-slate-500 hover:text-slate-700 font-semibold transition-colors text-sm"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Payment Success Modal */}
            {showSuccessModal && (
                <PaymentSuccessModal
                    onClose={() => setShowSuccessModal(false)}
                    onViewTours={() => {
                        setShowSuccessModal(false)
                        window.location.hash = '#user-dashboard'
                    }}
                    bookingReference="SKY-DXB-2024-1847"
                />
            )}

            <Footer />
        </div>
    )
}
