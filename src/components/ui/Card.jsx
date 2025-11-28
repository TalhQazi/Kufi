export default function Card({
    image,
    title,
    subtitle,
    rating,
    location,
    badge,
    className = '',
    imageClassName = '',
    variant = 'destination'
}) {
    if (variant === 'destination') {
        return (
            <article className={`relative rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200 ${className}`}>
                <div
                    className={`w-full h-64 bg-cover bg-center ${imageClassName}`}
                    style={{ backgroundImage: `url(${image})` }}
                />
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
                <div
                    className="w-full h-[75%] bg-cover bg-center"
                    style={{ backgroundImage: `url(${image})` }}
                />
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
