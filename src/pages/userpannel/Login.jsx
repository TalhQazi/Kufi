import { useState } from 'react'
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { FiMail, FiLock, FiGlobe } from 'react-icons/fi'
import api from '../../api'


export default function Login({ onRegisterClick, onLoginSuccess, onClose }) {

    const [emailOrUsername, setEmailOrUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()

        try {
            const response = await api.post('/auth/login', {
                email: emailOrUsername, // Assuming backend accepts either email or username in this field
                password: password
            })


            if (response.data.token) {
                if (response.data.user.role === 'supplier' && response.data.user.status === 'pending') {
                    alert('Your account is currently pending admin approval. Please check back later.')
                    return
                }

                localStorage.setItem('authToken', response.data.token)
                localStorage.setItem('currentUser', JSON.stringify(response.data.user))
                localStorage.setItem('userRole', response.data.user.role)

                if (onLoginSuccess) onLoginSuccess(response.data.user.role)
            } else {
                alert('Login failed: Token not received')
            }
        } catch (error) {
            console.error('Login error:', error)
            alert(error.response?.data?.message || 'Invalid credentials or server error')
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-[45%_55%] bg-white font-inter min-h-screen">
            {/* Left Side - Hidden on mobile */}
            <div className="hidden md:flex bg-[#B9B9B9] relative flex-col justify-between px-8 md:px-16 lg:px-24 py-12 md:py-16 rounded-tr-[50px] lg:rounded-tr-[80px] z-10">
                <div className="max-w-md">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        Seamless<br />Booking Starts<br />Here!
                    </h1>
                    <div className="w-12 h-1 bg-white mb-6"></div>
                    <p className="text-white/90 text-base leading-relaxed">
                        Access your account to view upcoming stays, modify bookings, and enjoy a hassle-free experience.
                    </p>
                </div>

                <div className="flex flex-col gap-6 max-w-md">
                    {/* Social Icons */}
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-[#A67C52] text-white flex items-center justify-center hover:bg-[#8e6a45] transition-colors">
                            <FaFacebookF size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-[#A67C52] text-white flex items-center justify-center hover:bg-[#8e6a45] transition-colors">
                            <FaTwitter size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-[#A67C52] text-white flex items-center justify-center hover:bg-[#8e6a45] transition-colors">
                            <FaInstagram size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-[#A67C52] text-white flex items-center justify-center hover:bg-[#8e6a45] transition-colors">
                            <FaYoutube size={18} />
                        </a>
                    </div>

                    {/* Logo */}
                    <button
                        onClick={() => {
                            window.location.hash = '#explore'
                        }}
                        className="h-12 w-20 sm:h-[66px] sm:w-28 block cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
                    </button>

                    {/* Footer Links */}
                    <div className="flex gap-6 text-white/80 text-sm">
                        <a href="#" className="hover:text-white hover:underline transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white hover:underline transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="bg-white flex flex-col relative">
                <header className="absolute top-0 right-0 p-4 md:p-6 lg:p-8 flex items-center gap-4 md:gap-6 z-20">
                    <div className="flex items-center gap-2 text-slate-600 cursor-pointer hover:text-slate-900">
                        <FiGlobe size={20} />
                        <span className="font-medium text-sm">EN</span>
                        <span className="text-xs">▼</span>
                    </div>
                    <button
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all"
                        onClick={onClose}
                        aria-label="Close"
                        title="Close"
                    >
                        <FaTimes size={18} />
                    </button>
                </header>

                {/* Mobile Logo - Only visible on mobile */}
                <div className="md:hidden flex justify-center pt-6 pb-4">
                    <button
                        onClick={() => {
                            window.location.hash = '#explore'
                        }}
                        className="h-12 w-20 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
                    <div className="w-full max-w-md">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 md:mb-3">Welcome Back</h2>
                        <p className="text-slate-500 mb-6 md:mb-8 text-sm md:text-base">
                            Log in to access your account and explore new adventures.
                        </p>

                        <form className="flex flex-col gap-4 md:gap-5" onSubmit={handleSubmit}>
                            <div className="relative group">
                                <div className="absolute left-0 top-3 text-[#A67C52]">
                                    <FiMail size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your email or username"
                                    className="w-full py-3 pl-8 pr-0 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400 text-sm md:text-base"
                                    value={emailOrUsername}
                                    onChange={(e) => setEmailOrUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-0 top-3 text-[#A67C52]">
                                    <FiLock size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className="w-full py-3 pl-8 pr-10 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400 text-sm md:text-base"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-3 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <div className="w-5 h-5 border-2 border-[#A67C52] rounded bg-white flex items-center justify-center transition-colors">
                                            {rememberMe && <FaCheck className="text-[#A67C52] text-xs" />}
                                        </div>
                                    </div>
                                    <span className="text-xs md:text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Remember Me</span>
                                </label>
                                <a href="#" className="text-xs md:text-sm text-[#A67C52] font-semibold hover:underline">
                                    Forgot Password?
                                </a>
                            </div>

                            <button type="submit" className="mt-3 md:mt-4 py-3 md:py-3.5 rounded bg-[#A67C52] text-white font-bold text-base md:text-lg hover:bg-[#8e6a45] transition-colors w-full shadow-md hover:shadow-lg">
                                Login
                            </button>
                        </form>

                        <div className="relative my-6 md:my-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <span className="relative bg-white px-4 text-xs md:text-sm font-medium text-slate-500">Or continue with</span>
                        </div>

                        <div className="flex gap-3 md:gap-4">
                            <button type="button" className="flex-1 py-2.5 md:py-3 rounded border-2 border-[#A67C52] bg-white flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                                <FcGoogle size={20} />
                                <span className="font-semibold text-sm md:text-base text-[#A67C52] group-hover:text-[#8e6a45]">Google</span>
                            </button>
                            <button type="button" className="flex-1 py-2.5 md:py-3 rounded border-2 border-[#A67C52] bg-white flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                                <FaFacebookF size={20} className="text-[#A67C52]" />
                                <span className="font-semibold text-sm md:text-base text-[#A67C52] group-hover:text-[#8e6a45]">Facebook</span>
                            </button>
                        </div>

                        <div className="mt-6 md:mt-8 text-center text-slate-600 text-sm md:text-base">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                className="text-[#A67C52] font-bold hover:underline"
                                onClick={onRegisterClick}
                            >
                                Signup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
