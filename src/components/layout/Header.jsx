import Button from '../ui/Button'

export default function Header({ onSignupClick, onSigninClick }) {
    return (
        <header className="w-full bg-white shadow-header mb-10 rounded-none">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 py-2 px-4 sm:px-6 lg:px-10 flex-wrap">
                <div className="flex items-center gap-2">
                    <img
                        src="/assets/navbar.png"
                        alt="Kufi Travel"
                        className="h-12 w-20 sm:h-[66px] sm:w-28 block"
                    />
                    <span className="text-sm font-medium leading-tight">
                        Kufi <br /> Travel
                    </span>
                </div>

                <nav className="order-3 w-full md:order-2 md:w-auto flex justify-center md:justify-center gap-4 sm:gap-8 text-xs sm:text-sm mt-3 md:mt-0">
                    <a
                        href="#home"
                        className="text-slate-600 no-underline relative hover:text-slate-900 [&.active]:text-slate-900 [&.active]:before:content-[''] [&.active]:before:absolute [&.active]:before:-left-2.5 [&.active]:before:top-1/2 [&.active]:before:-translate-y-1/2 [&.active]:before:w-1 [&.active]:before:h-1 [&.active]:before:rounded-full [&.active]:before:bg-gold active"
                    >
                        Home
                    </a>
                    <a href="#destinations" className="text-slate-600 no-underline relative hover:text-slate-900">
                        Destinations
                    </a>
                    <a href="#top-locations" className="text-slate-600 no-underline relative hover:text-slate-900">
                        Top Locations
                    </a>
                    <a href="#blog" className="text-slate-600 no-underline relative hover:text-slate-900">
                        Blog
                    </a>
                </nav>

                <div className="order-2 md:order-3 flex items-center gap-4 sm:gap-6">
                    <div className="hidden sm:flex items-center gap-2 text-slate-600 text-xs">
                        <span className="text-base">📞</span>
                        <span className="whitespace-nowrap">+0 123 456 789</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="signup" onClick={onSigninClick}>
                            Sign in
                        </Button>
                        <Button variant="signup" onClick={onSignupClick}>
                            Sign up
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
