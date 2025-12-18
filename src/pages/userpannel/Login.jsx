import { useState } from 'react'
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { FiMail, FiLock, FiGlobe } from 'react-icons/fi'

const ADMIN_EMAIL = 'admin@kufi.com'
const ADMIN_PASSWORD = 'Admin@123'

// Dummy user credentials for quick login
const DUMMY_USERNAME = 'user'
const DUMMY_PASSWORD = 'user123'

// Dummy supplier credentials for quick login
const DUMMY_SUPPLIER_USERNAME = 'supplier'
const DUMMY_SUPPLIER_PASSWORD = 'supplier123'

export default function Login({ onRegisterClick, onLoginSuccess, onClose }) {
    const [emailOrUsername, setEmailOrUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    const handleSubmit = (event) => {
        event.preventDefault()

        // 1. Check Admin
        if (emailOrUsername === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            localStorage.setItem('currentUser', JSON.stringify({ name: 'Admin', role: 'admin' }))
            localStorage.setItem('userRole', 'admin')
            if (onLoginSuccess) onLoginSuccess('admin')
            return
        }

        // 2. Check Dummy User
        if (emailOrUsername === DUMMY_USERNAME && password === DUMMY_PASSWORD) {
            localStorage.setItem('currentUser', JSON.stringify({ name: 'User', role: 'user' }))
            localStorage.setItem('userRole', 'user')
            if (onLoginSuccess) onLoginSuccess('user')
            return
        }

        // 3. Check Dummy Supplier
        if (emailOrUsername === DUMMY_SUPPLIER_USERNAME && password === DUMMY_SUPPLIER_PASSWORD) {
            localStorage.setItem('currentUser', JSON.stringify({ name: 'Supplier', role: 'supplier' }))
            localStorage.setItem('userRole', 'supplier')
            if (onLoginSuccess) onLoginSuccess('supplier')
            return
        }

        // 4. Check LocalStorage for registered users
        const storedUsers = localStorage.getItem('kufiUsers')
        if (storedUsers) {
            const users = JSON.parse(storedUsers)
            const foundUser = users.find(
                (u) => (u.email === emailOrUsername || u.name === emailOrUsername) && u.password === password
            )

            if (foundUser) {
                localStorage.setItem('currentUser', JSON.stringify(foundUser))
                localStorage.setItem('userRole', foundUser.role)
                if (onLoginSuccess) onLoginSuccess(foundUser.role)
                return
            }
        }

        alert('Invalid credentials')
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-[45%_55%] bg-white font-inter">
            {/* Left Side */}
            <div className="bg-[#B9B9B9] relative flex flex-col justify-between px-8 md:px-16 lg:px-24 py-12 md:py-16 rounded-br-[50px] md:rounded-br-[0px] md:rounded-tr-[50px] lg:rounded-tr-[80px] z-10">
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
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 border-2 border-[#A67C52] p-1 rounded">
                            <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
                        </div>
                        <div className="leading-tight text-[#A67C52]">
                            <p className="m-0 text-xl font-bold">Kufi</p>
                            <p className="m-0 text-xl font-bold">Travel</p>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="flex gap-6 text-white/80 text-sm">
                        <a href="#" className="hover:text-white hover:underline transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white hover:underline transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="bg-white flex flex-col relative">
                <header className="absolute top-0 right-0 p-6 md:p-8 flex items-center gap-6 z-20">
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

                <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20 py-20">
                    <div className="w-full max-w-md">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Welcome Back</h2>
                        <p className="text-slate-500 mb-8">
                            Log in to access your account and explore new adventures.
                        </p>

                        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                            <div className="relative group">
                                <div className="absolute left-0 top-3 text-[#A67C52]">
                                    <FiMail size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your email or username"
                                    className="w-full py-3 pl-8 pr-0 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400"
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
                                    className="w-full py-3 pl-8 pr-10 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400"
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
                                    <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Remember Me</span>
                                </label>
                                <a href="#" className="text-sm text-[#A67C52] font-semibold hover:underline">
                                    Forgot Password?
                                </a>
                            </div>

                            <button type="submit" className="mt-4 py-3.5 rounded bg-[#A67C52] text-white font-bold text-lg hover:bg-[#8e6a45] transition-colors w-full shadow-md hover:shadow-lg">
                                Login
                            </button>
                        </form>

                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <span className="relative bg-white px-4 text-sm font-medium text-slate-500">Or continue with</span>
                        </div>

                        <div className="flex gap-4">
                            <button type="button" className="flex-1 py-3 rounded border-2 border-[#A67C52] bg-white flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                                <FcGoogle size={20} />
                                <span className="font-semibold text-[#A67C52] group-hover:text-[#8e6a45]">Google</span>
                            </button>
                            <button type="button" className="flex-1 py-3 rounded border-2 border-[#A67C52] bg-white flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                                <FaFacebookF size={20} className="text-[#A67C52]" />
                                <span className="font-semibold text-[#A67C52] group-hover:text-[#8e6a45]">Facebook</span>
                            </button>
                        </div>

                        <div className="mt-8 text-center text-slate-600">
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
