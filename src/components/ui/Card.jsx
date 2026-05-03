export default function Card({
    image,
    title,
    subtitle,
    rating,
    location,
    badge,
    className = '',
    imageClassName = '',
    variant = 'destination',
    onClick
}) {
    if (variant === 'destination') {
        return (
            <article 
                onClick={onClick}
                className={`relative rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer ${className}`}
            >
                <div className={`relative w-full h-64 bg-slate-200 overflow-hidden ${imageClassName}`}>
                    <img 
                        src={image} 
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent">
                    <div className="text-white">
                        <h3 className="m-0 mb-1 text-base font-semibold">{title}</h3>
                        {location && (
                            <p className="m-0 text-xs text-slate-200">📍 {location}</p>
                        )}
                    </div>
                    {rating && (
                        <div className="text-sm text-yellow-400">★ {rating}</div>
                    )}
                </div>
            </article>
        )
    }

    if (variant === 'hero') {
        return (
            <div className={`rounded-3xl overflow-hidden shadow-2xl text-white ${className}`}>
                <div className="relative w-full h-[75%] bg-slate-900 overflow-hidden">
                    <img 
                        src={image} 
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-4 bg-gradient-to-b from-slate-950/90 to-slate-950">
                    <h3 className="m-0 mb-1.5 text-base">{title}</h3>
                    {rating && (
                        <span className="text-sm">★ {rating}</span>
                    )}
                </div>
            </div>
        )
    }

    return null
}
