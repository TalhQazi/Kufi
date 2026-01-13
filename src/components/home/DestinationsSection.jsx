import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import api from '../../api'

export default function DestinationsSection({ onCountryClick }) {
    const [allCountries, setAllCountries] = useState([])
    const [destinations, setDestinations] = useState([])
    const [loading, setLoading] = useState(true)
    const [clickCount, setClickCount] = useState(0)
    const [isShowingLess, setIsShowingLess] = useState(false)

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await api.get('/countries')
                const data = response.data || []
                setAllCountries(data)
                setDestinations(data.slice(0, 4))
            } catch (error) {
                console.error("Error fetching countries:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCountries()
    }, [])

    const handleAction = () => {
        if (isShowingLess) {
            // "Show Less" logic: remove 4 items
            const newCount = destinations.length - 4
            setDestinations(prev => prev.slice(0, -4))
            setClickCount(prev => prev - 1)

            // If we're back to the initial state, allow "Show More" again
            if (newCount <= 4) {
                setIsShowingLess(false)
            }
            return
        }

        // "Show More" logic: add 4 items
        const currentCount = destinations.length
        const nextItems = []
        const timestamp = Date.now()
        for (let i = 0; i < 4; i++) {
            const baseItem = allCountries[(currentCount + i) % allCountries.length]
            if (baseItem) {
                nextItems.push({ ...baseItem, _id: `dest-${timestamp}-${currentCount + i}` })
            }
        }
        setDestinations(prev => [...prev, ...nextItems])
        const newClickCount = clickCount + 1
        setClickCount(newClickCount)

        // After 1 click, the next action should be "Show Less"
        if (newClickCount >= 1) {
            setIsShowingLess(true)
        }
    }

    return (
        <section className="bg-slate-50 py-12 sm:py-16 px-4 sm:px-8 lg:px-20">
            <div className="max-w-[1240px] mx-auto">
                <div className="mb-10">
                    <h2 className="text-xl sm:text-3xl font-bold text-slate-900">Explore Destinations</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full py-10 flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a67c52]"></div>
                        </div>
                    ) : (
                        destinations.map((item, index) => (
                            <div key={`${item._id || item.id}-${index}`} className="w-full">
                                <Card
                                    variant="destination"
                                    image={item.imageUrl || item.image}
                                    title={item.name || item.title}
                                    location={item.description?.substring(0, 20) || item.location}
                                    rating="4.4"
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

                <div className="mt-8 flex justify-center">
                    <button
                        type="button"
                        onClick={handleAction}
                        className="bg-[#a67c52] text-white px-10 py-3.5 rounded-full font-semibold hover:bg-[#8f643e] transition-all shadow-md active:scale-95 text-lg"
                    >
                        {isShowingLess ? 'Show Less' : 'Show More'}
                    </button>
                </div>
            </div>
        </section>
    )
}
