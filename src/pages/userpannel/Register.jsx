import { useState } from 'react'
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaEye, FaEyeSlash } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { FiMail, FiLock, FiGlobe, FiUser, FiPhone } from 'react-icons/fi'
import { HiMenu } from 'react-icons/hi'

export default function Register({ onLoginClick, onClose }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (form.password !== form.confirmPassword) {
            alert('Password and Confirm Password must match.')
            return
        }

        const stored = localStorage.getItem('kufiUsers')
        const users = stored ? JSON.parse(stored) : []

        const newUser = {
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            role: form.role === 'supplier' ? 'supplier' : 'user',
        }

        users.push(newUser)
        localStorage.setItem('kufiUsers', JSON.stringify(users))

        alert('Account created successfully (saved locally). You can now log in.')

        if (onLoginClick) onLoginClick()
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-[45%_55%] bg-white font-inter">
            {/* Left Side */}
            <div className="bg-[#B9B9B9] relative flex flex-col justify-between px-8 md:px-16 lg:px-24 py-12 md:py-16 rounded-br-[50px] md:rounded-br-[0px] md:rounded-tr-[50px] lg:rounded-tr-[80px] z-10">
                <div className="max-w-md">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        Join Kufi<br />Travel Today!
                    </h1>
                    <div className="w-12 h-1 bg-white mb-6"></div>
                    <p className="text-white/90 text-base leading-relaxed">
                        Create your account to manage bookings, discover new destinations, and save your favorite experiences.
                    </p>
                </div>

                <div className="flex flex-col gap-6 max-w-md">
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

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 border-2 border-[#A67C52] p-1 rounded">
                            <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
                        </div>
                        <div className="leading-tight text-[#A67C52]">
                            <p className="m-0 text-xl font-bold">Kufi</p>
                            <p className="m-0 text-xl font-bold">Travel</p>
                        </div>
                    </div>

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
                        className="text-slate-800 hover:text-black transition-colors"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <HiMenu size={28} />
                    </button>
                </header>

                <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20 py-20">
                    <div className="w-full max-w-md">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Create Account</h2>
                        <p className="text-slate-500 mb-8">
                            Fill in your details below to create a new account and start your journey.
                        </p>

                        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                            <div className="relative group">
                                <div className="absolute left-0 top-3 text-[#A67C52]">
                                    <FiUser size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    className="w-full py-3 pl-8 pr-0 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-0 top-3 text-[#A67C52]">
                                    <FiMail size={20} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    className="w-full py-3 pl-8 pr-0 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-0 top-3 text-[#A67C52]">
                                    <FiPhone size={20} />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    className="w-full py-3 pl-8 pr-0 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-0 top-3 text-[#A67C52]">
                                    <FiLock size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Enter your password"
                                    className="w-full py-3 pl-8 pr-10 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400"
                                    value={form.password}
                                    onChange={handleChange}
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

                            <div className="relative group">
                                <div className="absolute left-0 top-3 text-[#A67C52]">
                                    <FiLock size={20} />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    className="w-full py-3 pl-8 pr-10 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-[#A67C52] transition-colors text-slate-900 placeholder:text-slate-400"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-0 top-3 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                <span className="text-sm text-slate-600">Register as:</span>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className={`px-6 py-2 rounded-full border-2 text-sm font-semibold transition ${form.role === 'user'
                                                ? 'bg-[#A67C52] text-white border-[#A67C52]'
                                                : 'bg-white text-slate-700 border-slate-300 hover:border-[#A67C52]'
                                            }`}
                                        onClick={() => setForm((prev) => ({ ...prev, role: 'user' }))}
                                    >
                                        User
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-6 py-2 rounded-full border-2 text-sm font-semibold transition ${form.role === 'supplier'
                                                ? 'bg-[#A67C52] text-white border-[#A67C52]'
                                                : 'bg-white text-slate-700 border-slate-300 hover:border-[#A67C52]'
                                            }`}
                                        onClick={() => setForm((prev) => ({ ...prev, role: 'supplier' }))}
                                    >
                                        Supplier
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="mt-4 py-3.5 rounded bg-[#A67C52] text-white font-bold text-lg hover:bg-[#8e6a45] transition-colors w-full shadow-md hover:shadow-lg">
                                Sign Up
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
                            Already have an account?{' '}
                            <button
                                type="button"
                                className="text-[#A67C52] font-bold hover:underline"
                                onClick={onLoginClick}
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
