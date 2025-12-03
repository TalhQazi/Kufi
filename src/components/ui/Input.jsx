export default function Input({
    label,
    icon,
    type = 'select',
    value,
    onChange,
    options = [],
    className = '',
    inputClassName = ''
}) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">
                        {icon}
                    </span>
                )}
                {type === 'select' ? (
                    <select
                        value={value}
                        onChange={onChange}
                        className={`w-full text-sm font-medium text-slate-950 py-2.5 px-3 ${icon ? 'pl-10' : ''} rounded-lg border border-slate-200 bg-slate-50 appearance-none focus:outline-none focus:border-primary-brown transition-colors ${inputClassName}`}
                        style={{
                            backgroundImage: `linear-gradient(45deg, transparent 50%, #9ca3af 50%), linear-gradient(135deg, #9ca3af 50%, transparent 50%)`,
                            backgroundPosition: 'calc(100% - 16px) 50%, calc(100% - 11px) 50%',
                            backgroundSize: '6px 6px, 6px 6px',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={onChange}
                        className={`w-full text-sm font-medium text-slate-950 py-2.5 px-3 ${icon ? 'pl-10' : ''} rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-primary-brown transition-colors ${inputClassName}`}
                    />
                )}
            </div>
        </div>
    )
}
