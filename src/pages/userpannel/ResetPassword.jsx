import React, { useState, useEffect } from 'react'
import { FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'
import { Loader2 } from 'lucide-react'
import api from '../../api'

/**
 * ResetPassword Component
 * Handles the password reset flow using a token provided in the URL.
 */
export default function ResetPassword({ token, onComplete }) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState('idle') // 'idle' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('')

    // Validate token existence on mount
    useEffect(() => {
        if (!token || token === 'reset-password') {
            setStatus('error')
            setErrorMsg('Invalid or missing reset token. Please use the link from your email.')
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!token) {
            setStatus('error')
            setErrorMsg('No reset token found.')
            return
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match')
            return
        }
        
        if (password.length < 8) {
            alert('Password must be at least 8 characters long')
            return
        }

        setIsLoading(true)
        setErrorMsg('')
        
        try {
            await api.post('/auth/reset-password', { token, password })
            setStatus('success')
            // Redirect after 3 seconds
            setTimeout(() => {
                if (onComplete) onComplete()
                window.location.hash = ''
            }, 3000)
        } catch (error) {
            console.error('Reset password error:', error)
            const msg = error.response?.data?.msg || 'Failed to reset password. The link may have expired or is invalid.'
            setErrorMsg(msg)
            setStatus('error')
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E8DED0] px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Success!</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Your password has been reset successfully. You are being redirected to the login page.
                    </p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 animate-[progress_3s_linear]" style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E8DED0] px-4 font-inter">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 md:p-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Reset Password</h2>
                    <p className="text-slate-500">Secure your account with a new password.</p>
                </div>

                {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                        <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                        <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-[#A67C52] transition-colors">
                                <FiLock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min 8 characters"
                                className="w-full py-3.5 pl-10 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all text-slate-900 placeholder:text-slate-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={status === 'error' && !token}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-[#A67C52] transition-colors">
                                <FiLock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Repeat password"
                                className="w-full py-3.5 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A67C52]/20 focus:border-[#A67C52] transition-all text-slate-900 placeholder:text-slate-400"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={status === 'error' && !token}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || (status === 'error' && !token)}
                        className="w-full py-4 bg-[#A67C52] text-white rounded-xl font-bold text-lg hover:bg-[#8e6a45] transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Updating...</span>
                            </div>
                        ) : 'Update Password'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => window.location.hash = ''}
                        className="w-full text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors py-2"
                    >
                        Back to Home
                    </button>
                </form>
            </div>
        </div>
    )
}
