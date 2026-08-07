import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import api from '../../api'
import PaymentSuccessModal from './PaymentSuccessModal.jsx'
import { countableActivities } from '../../utils/activityClassification'
import Footer from '../../components/layout/Footer'

export default function Payment({ bookingData, onBack, onForward, canGoBack, canGoForward, onNotificationClick, onHomeClick, hideHeaderFooter = false }) {
    const [activeBookingData, setActiveBookingData] = useState(bookingData || {})
    const [paymentMethod, setPaymentMethod] = useState('stripe')
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
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({ commissionPercentage: 10, stripePublicKey: '', countdownMinutes: 30 })
    const [countries, setCountries] = useState([])
    const [travelerInfo, setTravelerInfo] = useState({
        fullName: '',
        email: '',
        phone: ''
    })
    const [secondsLeft, setSecondsLeft] = useState(null)
    const [sessionExpired, setSessionExpired] = useState(false)
    const [sessionEndsAt, setSessionEndsAt] = useState(null)

    useEffect(() => {
        setActiveBookingData(bookingData || {})
    }, [bookingData])

    useEffect(() => {
        const id = bookingData?._id || bookingData?.bookingId || bookingData?.itineraryId || bookingData?.id;
        if (!id) return;

        const hasDetails = Boolean(
            activeBookingData?.days?.length ||
            activeBookingData?.items?.length ||
            activeBookingData?.totalAmount ||
            activeBookingData?.amount ||
            activeBookingData?.budget ||
            activeBookingData?.tripDetails
        );

        if (!hasDetails) {
            const fetchDetails = async () => {
                try {
                    // Try itinerary endpoint first
                    let res = await api.get(`/itineraries/${id}`).catch(() => null);
                    if (res?.data?._id) {
                        setActiveBookingData(prev => ({ ...prev, ...res.data }));
                        return;
                    }
                    // Try booking endpoint
                    res = await api.get(`/bookings/${id}`).catch(() => null);
                    if (res?.data?._id) {
                        setActiveBookingData(prev => ({ ...prev, ...res.data }));
                        return;
                    }
                    // Try itinerary by booking ID
                    res = await api.get(`/itineraries/booking/${encodeURIComponent(id)}`).catch(() => null);
                    if (res?.data?._id) {
                        setActiveBookingData(prev => ({ ...prev, ...res.data }));
                    }
                } catch (err) {
                    console.error('Error fetching booking details in Payment component:', err);
                }
            };
            fetchDetails();
        }
    }, [bookingData]);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
        
        // Try to get name from activeBookingData or currentUser
        let initialName = ''
        if (activeBookingData?.firstName || activeBookingData?.lastName) {
            initialName = `${activeBookingData.firstName || ''} ${activeBookingData.lastName || ''}`.trim()
        } else if (activeBookingData?.title && activeBookingData?.status) {
             initialName = currentUser?.name || currentUser?.fullName || ''
        } else {
            initialName = currentUser?.name || currentUser?.fullName || ''
        }

        setTravelerInfo({
            fullName: initialName || '',
            email: activeBookingData?.email || activeBookingData?._email || currentUser?.email || '',
            phone: activeBookingData?.phone || activeBookingData?._phone || currentUser?.phone || ''
        })
    }, [activeBookingData])


    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/payment/settings');
                setSettings(res.data);
                const mins = Number(res.data?.countdownMinutes);
                const durationSec = (Number.isFinite(mins) && mins > 0 ? mins : 30) * 60;
                setSessionEndsAt(Date.now() + durationSec * 1000);
            } catch (err) {
                console.error('Error fetching settings:', err);
                setSessionEndsAt(Date.now() + 30 * 60 * 1000);
            }
        };

        fetchSettings();
    }, []);

    useEffect(() => {
        if (!sessionEndsAt) return undefined
        const tick = () => {
            const left = Math.max(0, Math.ceil((sessionEndsAt - Date.now()) / 1000))
            setSecondsLeft(left)
            if (left <= 0) setSessionExpired(true)
        }
        tick()
        const id = window.setInterval(tick, 1000)
        return () => window.clearInterval(id)
    }, [sessionEndsAt])

    const formatCountdown = (totalSeconds) => {
        const s = Math.max(0, Number(totalSeconds) || 0)
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }

    // Fetch countries from API
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await api.get('/countries?status=active');
                const countryList = res.data || [];
                setCountries(countryList);
                // Set default country to first one if available
                if (countryList.length > 0 && !billingAddress.country) {
                    setBillingAddress(prev => ({ ...prev, country: countryList[0].name }));
                }
            } catch (err) {
                console.error('Error fetching countries:', err);
            }
        };
        fetchCountries();
    }, []);

    const parseAmount = (budget) => {
        if (!budget) return 0;
        const raw = String(budget).trim();
        const matches = raw.replace(/,/g, '').match(/\d+(?:\.\d+)?/g);
        if (!matches || matches.length === 0) return 0;
        const numbers = matches.map(Number).filter(Number.isFinite);
        if (numbers.length === 0) return 0;
        return Math.max(...numbers);
    };

    // Calculate total itinerary price from activities + hotel + uplift if available
    const calculateItineraryTotal = () => {
        const daysData = activeBookingData?.days || [];
        const itinerary = activeBookingData?.tripData;
        if (!daysData.length && !itinerary) return 0;

        // Calculate activities total. Schedule breaks (lunch/rest) are not activities and
        // are never billable, so they are excluded here as well as from the counts.
        const activitiesTotal = daysData.reduce((sum, d) => {
            return sum + countableActivities(d).reduce((s, a) => s + (Number(a.price || a.cost || 0) || 0), 0);
        }, 0);

        // Calculate hotel cost
        const controlPanel = itinerary?.controlPanel;
        const hotelData = controlPanel?.hotelId;
        const startDate = itinerary?.startDate || activeBookingData?.startDate || activeBookingData?.tripDetails?.arrivalDate;
        const endDate = itinerary?.endDate || activeBookingData?.endDate || activeBookingData?.tripDetails?.departureDate;

        let hotelCost = 0;
        let tripDays = 1;
        if (startDate && endDate) {
            const a = new Date(startDate), b = new Date(endDate);
            const nights = Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
            tripDays = Math.max(1, nights + 1);
            if (hotelData?.pricePerNight) {
                const rooms = controlPanel?.numberOfRooms || 1;
                hotelCost = hotelData.pricePerNight * nights * rooms;
            }
        }

        const customCostsTotal = (Array.isArray(controlPanel?.customCosts) ? controlPanel.customCosts : []).reduce((sum, cost) => {
            const amount = Number(cost?.amount) || 0;
            if (!amount) return sum;
            if (cost?.unit === 'per_day') return sum + (amount * tripDays);
            return sum + amount;
        }, 0);

        // Calculate budget uplift (support legacy 0.15 and percent 15)
        const upliftRaw = controlPanel?.budgetUplift != null ? Number(controlPanel.budgetUplift) : 0.15;
        const upliftPct = Math.min(Math.max(
            (upliftRaw > 0 && upliftRaw < 1) ? upliftRaw : (upliftRaw / 100),
            0
        ), 1);

        // Grand Total
        const calculatedTotal = Math.round((activitiesTotal + hotelCost + customCostsTotal) * (1 + upliftPct));
        return calculatedTotal;
    };

    const calculatedItineraryPrice = calculateItineraryTotal();

    const totalAmount = (calculatedItineraryPrice > 0 ? calculatedItineraryPrice : null) || 
                        activeBookingData?.totalAmount || 
                        activeBookingData?.amount || 
                        activeBookingData?.budget ||
                        activeBookingData?.tripData?.budget ||
                        activeBookingData?.tripData?.amount ||
                        parseAmount(activeBookingData?.adjustmentCard?.cost || 
                                   activeBookingData?.cost || 
                                   activeBookingData?.tripDetails?.budget || 
                                   activeBookingData?.budget || 
                                   activeBookingData?.price ||
                                   activeBookingData?.tripData?.price);
    const commissionPercentage = settings.commissionPercentage;
    const commissionAmount = (totalAmount * commissionPercentage) / 100;
    const netAmount = totalAmount - commissionAmount;

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (onHomeClick) {
            onHomeClick();
        } else {
            window.location.hash = '#home';
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault()

        if (sessionExpired) {
            alert('Your payment session hold has expired. Please go back and reopen payment to continue.')
            return
        }
        
        if (paymentMethod === 'stripe') {
            try {
                setLoading(true);
                
                // 1. Update booking with current traveler info and total amount
                // This ensures the backend has the final price and info before Stripe session is created
                const bookingId = activeBookingData?.bookingId || activeBookingData?._id || activeBookingData?.id;
                const [firstName, ...lastNameParts] = (travelerInfo.fullName || '').split(' ');
                const lastName = lastNameParts.join(' ');
                
                await api.patch(`/bookings/${bookingId}`, {
                    contactDetails: {
                        firstName: firstName || '',
                        lastName: lastName || '',
                        email: travelerInfo.email,
                        phone: travelerInfo.phone
                    },
                    totalAmount: totalAmount
                });

                // 2. Create checkout session
                const res = await api.post('/payment/create-checkout-session', {
                    bookingId: bookingId
                });
                
                const stripe = await loadStripe(settings.stripePublicKey || 'pk_live_51Szm5B7o3RqGTYsBgSP9DaC45gkgqsAoJd3nXl8BoMNVVRErbQtb8yyKT1MQdZLjAA85ZzCm5aq6BuNC4xf7PsuI008U0yNpfy');
                if (res.data.url) {
                    window.location.href = res.data.url;
                } else {
                    const { error } = await stripe.redirectToCheckout({
                        sessionId: res.data.id,
                    });
                    if (error) {
                        console.error('Stripe error:', error);
                        alert(error.message);
                    }
                }
            } catch (err) {
                console.error('Payment error:', err);
                alert('Failed to initiate payment. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            console.log('Payment submitted:', { bookingData, paymentMethod, cardData })
            // Show success modal for mock payments
            setShowSuccessModal(true)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation Header */}
            {!hideHeaderFooter && (
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
            )}

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

                    {/* Session hold countdown */}
                    <div className={`rounded-lg p-4 mb-6 flex items-start gap-3 border ${sessionExpired ? 'bg-red-50 border-red-200' : secondsLeft != null && secondsLeft <= 120 ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={`shrink-0 mt-0.5 ${sessionExpired ? 'text-red-600' : secondsLeft != null && secondsLeft <= 120 ? 'text-amber-600' : 'text-blue-600'}`}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <p className={`text-sm ${sessionExpired ? 'text-red-800' : secondsLeft != null && secondsLeft <= 120 ? 'text-amber-800' : 'text-blue-800'}`}>
                                {sessionExpired
                                    ? 'Your payment session hold has expired. Go back and reopen payment to continue.'
                                    : 'Please complete payment before your session hold expires.'}
                            </p>
                            {secondsLeft != null && (
                                <span className={`text-sm font-bold font-mono tabular-nums ${sessionExpired ? 'text-red-700' : secondsLeft <= 120 ? 'text-amber-700' : 'text-blue-700'}`}>
                                    {formatCountdown(secondsLeft)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left Column - Payment Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Traveler Information */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Traveler Information</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={travelerInfo.fullName}
                                            onChange={(e) => setTravelerInfo({ ...travelerInfo, fullName: e.target.value })}
                                            placeholder="John Anderson"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-slate-900 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={travelerInfo.email}
                                            onChange={(e) => setTravelerInfo({ ...travelerInfo, email: e.target.value })}
                                            placeholder="john.anderson@email.com"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-slate-900 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                                        <input
                                            type="tel"
                                            value={travelerInfo.phone}
                                            onChange={(e) => setTravelerInfo({ ...travelerInfo, phone: e.target.value })}
                                            placeholder="+1 (555) 123-4567"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-slate-900 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Payment Method</h2>

                                <div className="space-y-3 mb-6">
                                    {/* Credit/Debit Card */}
                                    {/* <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary-brown bg-primary-brown/5' : 'border-slate-200'}`}>
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
                                    </label> */}

                                    {/* PayPal */}
                                    {/* <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-primary-brown bg-primary-brown/5' : 'border-slate-200'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="paypal"
                                            checked={paymentMethod === 'paypal'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-primary-brown focus:ring-primary-brown"
                                        />
                                        <span className="text-sm font-medium text-slate-900">PayPal</span>
                                    </label> */}

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
                                                            {countries.length > 0 ? (
                                                                countries
                                                                    .filter((country) => country.status === 'active')
                                                                    .map((country) => (
                                                                        <option key={country._id || country.id} value={country.name}>
                                                                            {country.name}
                                                                        </option>
                                                                    ))
                                                            ) : (
                                                                <option value="">Loading countries...</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Trip Summary */}
                        <div className="lg:col-span-1 order-first lg:order-last">
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Trip Summary</h2>

                                <div className="mb-4 pb-4 border-b border-slate-200">
                                    <h3 className="font-semibold text-slate-900 mb-1">{bookingData?.title || bookingData?.experience || 'Trip Booking'}</h3>
                                    <p className="text-sm text-slate-600 font-medium">
                                        {bookingData?.tripDetails?.arrivalDate ? (
                                            `${new Date(bookingData.tripDetails.arrivalDate).toLocaleDateString()} - ${bookingData?.tripDetails?.departureDate ? new Date(bookingData.tripDetails.departureDate).toLocaleDateString() : ''}`
                                        ) : bookingData?.startDate || bookingData?.tripData?.startDate ? (
                                            `${new Date(bookingData.startDate || bookingData.tripData.startDate).toLocaleDateString()} - ${bookingData?.endDate || bookingData?.tripData?.endDate ? new Date(bookingData.endDate || bookingData.tripData.endDate).toLocaleDateString() : ''}`
                                        ) : bookingData?.date || bookingData?.tripData?.date || 'Date TBD'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {bookingData?.guests || bookingData?.travelers || bookingData?.numberOfTravelers || bookingData?.tripData?.guests || bookingData?.tripData?.travelers || '—'} Travelers 
                                        {bookingData?.duration || bookingData?.tripData?.duration ? ` • ${bookingData.duration || bookingData.tripData.duration}` : ''}
                                    </p>
                                </div>

                                <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Base Price</span>
                                        <span className="text-slate-900 font-medium">${netAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Platform Fee ({commissionPercentage}%)</span>
                                        <span className="text-slate-900 font-medium">${commissionAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Processing Fee</span>
                                        <span className="text-slate-900 font-medium">$0.00</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-base sm:text-lg font-bold text-slate-900">Total</span>
                                    <span className="text-base sm:text-lg font-bold text-primary-brown">${totalAmount.toLocaleString()}</span>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={loading || sessionExpired}
                                    className="w-full bg-primary-brown hover:bg-primary-dark disabled:opacity-50 text-white py-3 sm:py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-brown/20 mb-4 text-sm sm:text-base active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                        </svg>
                                    )}
                                    {sessionExpired ? 'Session Expired' : loading ? 'Processing...' : 'Confirm & Pay Now'}
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

            {!hideHeaderFooter && <Footer />}
        </div>
    )
}
