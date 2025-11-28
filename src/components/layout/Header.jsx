import Button from '../ui/Button'

export default function Header({ onSignupClick }) {
    return (
        <header className="flex items-center justify-between py-2 px-10 bg-white shadow-header -mx-20 mb-10 rounded-none">
            <div className="flex items-center gap-0">
                <img
                    src="/src/assets/navbar.png"
                    alt="Kufi Travel"
                    className="h-[66px] w-28 block"
                />
                <span className="text-sm font-medium leading-tight">
                    Kufi <br /> Travel
                </span>
            </div>

            <nav className="flex gap-8 text-sm ml-20 flex-1 justify-center">
                <a href="#home" className="text-slate-600 no-underline relative hover:text-slate-900 [&.active]:text-slate-900 [&.active]:before:content-[''] [&.active]:before:absolute [&.active]:before:-left-2.5 [&.active]:before:top-1/2 [&.active]:before:-translate-y-1/2 [&.active]:before:w-1 [&.active]:before:h-1 [&.active]:before:rounded-full [&.active]:before:bg-gold active">
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

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600 text-xs">
                    <span className="text-base">📞</span>
                    <span>+0 123 456 789</span>
                </div>
                <Button variant="signup" onClick={onSignupClick}>
                    Sign up
                </Button>
            </div>
        </header>
    )
}
