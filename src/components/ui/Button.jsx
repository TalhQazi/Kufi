export default function Button({
    children,
    variant = 'primary',
    className = '',
    onClick,
    type = 'button',
    disabled = false
}) {
    const base = 'border-none outline-none font-semibold cursor-pointer transition-all duration-200'

    const variants = {
        primary: 'bg-gold text-slate-900 rounded-full px-8 py-2.5 text-sm hover:bg-gold-dark',
        signup: 'bg-primary-brown text-white rounded-md px-7 py-2.5 text-sm hover:bg-primary-dark',
        search: 'bg-primary-brown text-white rounded-full px-8 py-2.5 text-sm hover:bg-primary-dark',
        play: 'w-11 h-11 rounded-full flex items-center justify-center bg-white/85 hover:bg-white',
        slider: 'px-5 py-2 rounded-full border border-slate-400/70 bg-slate-950/80 text-slate-200 text-xs hover:bg-slate-900',
        sliderFilled: 'px-5 py-2 rounded-full border border-gold bg-gold text-slate-900 text-xs hover:bg-gold-dark',
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    )
}
