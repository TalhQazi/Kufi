import { useState, useEffect, useRef } from 'react'
import Button from '../ui/Button'
import { FiPhone, FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi'
import { HiMenu, HiX } from 'react-icons/hi'

export default function Header({ onSignupClick, onSigninClick, onHomeClick, currentUser, onLogout, onProfileClick }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close profile dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Prevent background scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [mobileMenuOpen])

    return (
        <header className="w-full bg-white mb-0 sticky top-0 z-50 shadow-sm">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 py-4 px-4 sm:px-6 lg:px-12">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (onHomeClick) {
                                onHomeClick()
                            } else {
                                window.location.hash = '#home'
                            }
                        }}
                        className="h-12 w-20 sm:h-[66px] sm:w-28 block cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
                    </button>
                </div>

                <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-sm font-medium">
                    <a
                        href="#home"
                        className="text-[#A67C52] no-underline relative hover:text-[#8e6a45]"
                    >
                        Home
                    </a>
                    <a href="#destinations" className="text-slate-700 no-underline relative hover:text-[#A67C52] transition-colors">
                        Destinations
                    </a>
                    <a href="#top-locations" className="text-slate-700 no-underline relative hover:text-[#A67C52] transition-colors">
                        Top Locations
                    </a>
                    <a href="#blog" className="text-slate-700 no-underline relative hover:text-[#A67C52] transition-colors">
                        Blog
                    </a>
                </nav>

                <div className="flex items-center gap-4 sm:gap-8">
                    <div className="hidden sm:flex items-center gap-2 text-slate-700 text-sm font-medium">
                        <span className="text-[#A67C52]"><FiPhone /></span>
                        <span className="whitespace-nowrap">+0 123 456 789</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                        {currentUser ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center gap-2 p-1 pr-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#A67C52] flex items-center justify-center text-white overflow-hidden">
                                        {currentUser.profileImage ? (
                                            <img src={currentUser.profileImage} alt={currentUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <FiUser size={18} />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 hidden lg:block">
                                        {currentUser.name?.split(' ')[0] || 'Profile'}
                                    </span>
                                    <FiChevronDown size={14} className={`text-slate-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in duration-200">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name || 'User'}</p>
                                            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                onProfileClick && onProfileClick()
                                                setProfileDropdownOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <FiUser size={16} />
                                            <span>My Profile</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Using hash for now as per App.jsx logic
                                                window.location.hash = '#traveler-profile'
                                                setProfileDropdownOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <FiSettings size={16} />
                                            <span>Settings</span>
                                        </button>
                                        <div className="border-t border-slate-100 my-1"></div>
                                        <button
                                            onClick={() => {
                                                onLogout && onLogout()
                                                setProfileDropdownOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <FiLogOut size={16} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Button variant="signup" onClick={onSigninClick} className="!rounded-md !px-6 !py-2 !text-sm !font-medium">
                                Login/Signup
                            </Button>
                        )}
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-700 hover:text-[#A67C52] transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white">
                    <nav className="flex flex-col px-4 py-4 gap-4">
                        <a
                            href="#home"
                            className="text-[#A67C52] no-underline py-2 hover:text-[#8e6a45]"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </a>
                        <a
                            href="#destinations"
                            className="text-slate-700 no-underline py-2 hover:text-[#A67C52] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Destinations
                        </a>
                        <a
                            href="#top-locations"
                            className="text-slate-700 no-underline py-2 hover:text-[#A67C52] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Top Locations
                        </a>
                        <a
                            href="#blog"
                            className="text-slate-700 no-underline py-2 hover:text-[#A67C52] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Blog
                        </a>
                        <div className="pt-2 border-t border-slate-200">
                            {currentUser ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-2">
                                        <div className="w-10 h-10 rounded-full bg-[#A67C52] flex items-center justify-center text-white overflow-hidden">
                                            {currentUser.profileImage ? (
                                                <img src={currentUser.profileImage} alt={currentUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FiUser size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                                            <p className="text-xs text-slate-500">{currentUser.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onProfileClick && onProfileClick()
                                            setMobileMenuOpen(false)
                                        }}
                                        className="flex items-center gap-3 py-2 px-1 text-slate-700 font-medium"
                                    >
                                        <FiUser size={18} />
                                        <span>My Profile</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.location.hash = '#traveler-profile'
                                            setMobileMenuOpen(false)
                                        }}
                                        className="flex items-center gap-3 py-2 px-1 text-slate-700 font-medium"
                                    >
                                        <FiSettings size={18} />
                                        <span>Settings</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            onLogout && onLogout()
                                            setMobileMenuOpen(false)
                                        }}
                                        className="flex items-center gap-3 py-2 px-1 text-red-600 font-medium"
                                    >
                                        <FiLogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <Button variant="signup" onClick={onSigninClick} className="!rounded-md !px-6 !py-2 !text-sm !font-medium w-full">
                                    Login/Signup
                                </Button>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
