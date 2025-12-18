import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import { FiPhone } from 'react-icons/fi'
import { HiMenu, HiX } from 'react-icons/hi'

export default function Header({ onSignupClick, onSigninClick, onHomeClick }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
                        <Button variant="signup" onClick={onSigninClick} className="!rounded-md !px-6 !py-2 !text-sm !font-medium">
                            Login/Signup
                        </Button>
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
                            <Button variant="signup" onClick={onSigninClick} className="!rounded-md !px-6 !py-2 !text-sm !font-medium w-full">
                                Login/Signup
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
