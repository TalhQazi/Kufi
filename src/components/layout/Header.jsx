import Button from '../ui/Button'
import { FiPhone } from 'react-icons/fi'

export default function Header({ onSignupClick, onSigninClick }) {
    return (
        <header className="w-full bg-white mb-0">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 py-4 px-4 sm:px-6 lg:px-12 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-20 sm:h-[66px] sm:w-28 block">
                        <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
                    </div>
                </div>

                <nav className="order-3 w-full md:order-2 md:w-auto flex justify-center md:justify-center gap-6 sm:gap-10 text-sm font-medium mt-3 md:mt-0">
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

                <div className="order-2 md:order-3 flex items-center gap-4 sm:gap-8">
                    <div className="hidden sm:flex items-center gap-2 text-slate-700 text-sm font-medium">
                        <span className="text-[#A67C52]"><FiPhone /></span>
                        <span className="whitespace-nowrap">+0 123 456 789</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="signup" onClick={onSigninClick} className="!rounded-md !px-6 !py-2 !text-sm !font-medium">
                            Login/Signup
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
