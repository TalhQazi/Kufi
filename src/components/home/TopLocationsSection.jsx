import { useEffect, useState } from 'react'
import Card from '../ui/Card'
import api from '../../api'

export default function TopLocationsSection({ onCountryClick }) {
    const [cities, setCities] = useState([])
    const [loading, setLoading] = useState(true)
    const [visibleCount, setVisibleCount] = useState(4)

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await api.get('/cities')
                setCities(response.data || [])
            } catch (error) {
                console.error("Error fetching cities:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCities()
    }, [])

    useEffect(() => {
        setVisibleCount(4)
    }, [cities.length])

    const total = Array.isArray(cities) ? cities.length : 0
    const visibleCities = Array.isArray(cities) ? cities.slice(0, visibleCount) : []
    const hasMore = visibleCount < total

    return (
        <section id="top-locations" className="bg-gradient-to-b from-white to-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1240px] mx-auto">
                <div className="text-center mb-10">
                    <p className="text-lg font-normal text-[#a67c52] m-0 mb-1 font-sacramento">Top Locations</p>
                    <h2 className="text-xl sm:text-3xl font-bold text-slate-900 m-0 mb-4">Top Locations We Are Currently Serving</h2>
                    <p className="text-sm text-slate-500 max-w-[560px] m-0 mx-auto">
                        Travel makes one modest. You see what a tiny place you occupy in the world.
                        One's destination is never a place, but a new way of seeing things.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full py-10 flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a67c52]"></div>
                        </div>
                    ) : (
                        visibleCities.map((item, index) => (
                            <div key={item?._id || `${item?.name}-${index}`} className="w-full">
                                <Card
                                    variant="destination"
                                    image={item?.image || item?.imageUrl || item?.Picture || '/assets/dest-1.jpeg'}
                                    title={item?.name}
                                   // location={item?.country?.name || item?.country || ''}
                                    rating="4.4"
                                    className="rounded-[20px] shadow-card-hover"
                                    imageClassName="h-64 sm:h-[280px]"
                                    onClick={() => {
                                        if (onCountryClick) {
                                            onCountryClick(item)
                                        }
                                    }}
                                />
                            </div>
                        ))
                    )}
                </div>

                {!loading && total > 4 && (
                    <div className="mt-10 flex justify-center">
                        <button
                            type="button"
                            onClick={() => {
                                if (hasMore) {
                                    setVisibleCount((prev) => Math.min(prev + 4, total))
                                } else {
                                    setVisibleCount(4)
                                }
                            }}
                            className="bg-[#a67c52] text-white px-10 py-3.5 rounded-full font-semibold hover:bg-[#8f643e] transition-all shadow-md active:scale-95 text-lg"
                        >
                            {hasMore ? 'Show More' : 'Show Less'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
