export default function Input({
    label,
    icon,
    type = 'select',
    value,
    onChange,
    options = [],
    placeholder = '',
    className = '',
    inputClassName = '',
    labelClassName = '',
    inputProps = {}
}) {
    return (
        <div className={className}>
            {label && (
                <label className={labelClassName || "block text-xs text-slate-400 mb-1.5"}>{label}</label>
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
                        {...inputProps}
                        className={`w-full text-sm font-medium py-2.5 px-3 ${icon ? 'pl-10' : ''} rounded-lg border border-slate-200 bg-slate-50 appearance-none focus:outline-none focus:border-primary-brown transition-colors ${value === '' ? 'text-slate-400' : 'text-slate-950'} ${inputClassName}`}
                        style={{
                            backgroundImage: `linear-gradient(45deg, transparent 50%, #9ca3af 50%), linear-gradient(135deg, #9ca3af 50%, transparent 50%)`,
                            backgroundPosition: 'calc(100% - 16px) 50%, calc(100% - 11px) 50%',
                            backgroundSize: '6px 6px, 6px 6px',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        {placeholder && (
                            <option value="" disabled hidden>
                                {placeholder}
                            </option>
                        )}
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
                        {...inputProps}
                        className={`w-full text-sm font-medium text-slate-950 py-2.5 px-3 ${icon ? 'pl-10' : ''} rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-primary-brown transition-colors ${inputClassName}`}
                    />
                )}
            </div>
        </div >
    )
}
