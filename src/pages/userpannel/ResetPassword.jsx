import React, { useState } from 'react'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { Loader2 } from 'lucide-react'
import api from '../../api'

export default function ResetPassword({ token, onComplete }) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState('idle') // 'idle' | 'success' | 'error'

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            alert('Passwords do not match')
            return
        }
        if (password.length < 8) {
            alert('Password must be at least 8 characters long')
            return
        }

        setIsLoading(true)
        try {
            await api.post('/auth/reset-password', { token, password })
            setStatus('success')
            setTimeout(() => {
                if (onComplete) onComplete()
                window.location.hash = ''
            }, 3000)
        } catch (error) {
            console.error('Reset password error:', error)
            alert(error.response?.data?.msg || 'Failed to reset password. The link may have expired.')
            setStatus('error')
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Successful</h2>
                    <p className="text-slate-600 mb-6">Your password has been updated. You will be redirected to the login page shortly.</p>
                    <button 
                        onClick={() => {
                            if (onComplete) onComplete()
                            window.location.hash = ''
                        }}
                        className="w-full py-3 bg-[#A67C52] text-white rounded-lg font-bold hover:bg-[#8e6a45] transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
                <p className="text-slate-500 mb-8">Please enter your new password below.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <div className="absolute left-0 top-3 text-[#A67C52]">
                            <FiLock size={20} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New Password"
                            className="w-full py-3 pl-8 pr-10 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>

                    <div className="relative group">
                        <div className="absolute left-0 top-3 text-[#A67C52]">
                            <FiLock size={20} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm New Password"
                            className="w-full py-3 pl-8 pr-0 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3.5 bg-[#A67C52] text-white rounded-lg font-bold text-lg hover:bg-[#8e6a45] transition-all shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-70"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}
