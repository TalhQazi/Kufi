import { useEffect, useState } from 'react'
import Card from '../ui/Card'
import api from '../../api'

export default function TopLocationsSection({ onCountryClick, sectionInfo }) {
    const [cities, setCities] = useState([])
    const [loading, setLoading] = useState(true)
    const [visibleCount, setVisibleCount] = useState(4)

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await api.get('/cities?isTopLocation=true')
                const data = response.data || []
                const activeOnly = (Array.isArray(data) ? data : [])
                    .filter((c) => c?.status !== 'draft' && c?.isTopLocation === true)
                setCities(activeOnly)
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
        <section id="top-locations" className="bg-gradient-to-b from-white to-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-20 2xl:px-8 min-[2560px]:px-4">
            <div className="max-w-[1240px] 2xl:max-w-[1600px] min-[2560px]:max-w-[2200px] mx-auto">
                <div className="text-center mb-10">
                    <p className="text-lg font-normal text-[#a67c52] m-0 mb-1 font-sacramento">{sectionInfo?.title || 'Top Locations'}</p>
                    <h2 className="text-xl sm:text-3xl font-bold text-slate-900 m-0 mb-4">{sectionInfo?.heading || 'Top Locations We Are Currently Serving'}</h2>
                    <p className="text-sm text-slate-500 max-w-[560px] 2xl:max-w-[800px] m-0 mx-auto">
                        {sectionInfo?.subheading || "Travel makes one modest. You see what a tiny place you occupy in the world. One's destination is never a place, but a new way of seeing things."}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-[2560px]:grid-cols-4 gap-4 min-[2560px]:gap-6 transition-all duration-500 place-items-center">
                    {loading ? (
                        <div className="col-span-full py-10 flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a67c52]"></div>
                        </div>
                    ) : total === 0 ? (
                        <div className="col-span-full py-10 text-center text-slate-400 text-base">
                            No top locations available at the moment.
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
                                    imageClassName="h-64 sm:h-[280px] min-[2560px]:h-[400px]"
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
