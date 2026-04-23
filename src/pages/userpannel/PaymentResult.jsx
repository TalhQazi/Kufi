import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function PaymentResult({ type, onHomeClick, onProfileClick }) {
    const [loading, setLoading] = useState(type === 'success');
    const [bookingId, setBookingId] = useState(null);

    useEffect(() => {
        const query = new URLSearchParams(window.location.hash.split('?')[1]);
        const bId = query.get('booking_id');
        setBookingId(bId);

        if (type === 'success' && bId) {
            // Optional: Verify payment with backend
            setLoading(false);
        }
    }, [type]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {type === 'success' ? (
                    <>
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
                        <p className="text-slate-600 mb-8">Your booking has been confirmed. You can view your trip details in your profile.</p>
                        <div className="space-y-3">
                            <button
                                onClick={onProfileClick}
                                className="w-full bg-primary-brown text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all"
                            >
                                View My Requests
                            </button>
                            <button
                                onClick={onHomeClick}
                                className="w-full text-slate-500 font-semibold hover:text-slate-700 transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h1>
                        <p className="text-slate-600 mb-8">Something went wrong with your transaction. Please try again or contact support.</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.hash = '#payment'}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={onHomeClick}
                                className="w-full text-slate-500 font-semibold hover:text-slate-700 transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
