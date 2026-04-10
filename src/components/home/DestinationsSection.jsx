import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import api from '../../api'

export default function DestinationsSection({ onCountryClick }) {
    const [allCountries, setAllCountries] = useState([])
    const [destinations, setDestinations] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await api.get('/countries')
                const data = response.data || []
                const activeOnly = (Array.isArray(data) ? data : []).filter((c) => c?.status !== 'draft')
                setAllCountries(activeOnly)
                setDestinations(activeOnly.slice(0, 4))
            } catch (error) {
                console.error("Error fetching countries:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCountries()
    }, [])

    const handleAction = () => {
        setShowAll((prev) => {
            const next = !prev
            setDestinations(next ? allCountries : allCountries.slice(0, 4))
            return next
        })
    }

    return (
        <section id="destinations" className="bg-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-20 2xl:px-8 min-[2560px]:px-4">
            <div className="max-w-[1240px] 2xl:max-w-[1600px] min-[2560px]:max-w-[2200px] mx-auto">
                <div className="mb-10">
                    <h2 className="text-xl sm:text-3xl font-bold text-slate-900">Explore Destinations</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-[2560px]:grid-cols-4 gap-4 min-[2560px]:gap-6 transition-all duration-500 place-items-center">
                    {loading ? (
                        <div className="col-span-full py-10 flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a67c52]"></div>
                        </div>
                    ) : (
                        destinations.map((item, index) => (
                            <div key={`${item._id || item.id}-${index}`} className="w-full">
                                <Card
                                    variant="destination"
                                    image={item.image || item.imageUrl || '/assets/hero-card1.jpeg'}
                                    title={item.name || item.title}
                                    location={item.description?.substring(0, 20) || item.location}
                                    rating="4.4"
                                    imageClassName="h-64 min-[2560px]:h-[400px]"
                                    onClick={() => {
                                        if (onCountryClick) {
                                            onCountryClick(item.name)
                                        }
                                    }}
                                />
                            </div>
                        ))
                    )}
                </div>

                {allCountries.length > 4 && (
                    <div className="mt-8 flex justify-center">
                        <button
                            type="button"
                            onClick={handleAction}
                            className="bg-[#a67c52] text-white px-10 py-3.5 rounded-full font-semibold hover:bg-[#8f643e] transition-all shadow-md active:scale-95 text-lg"
                        >
                            {showAll ? 'Show Less' : 'Show More'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
