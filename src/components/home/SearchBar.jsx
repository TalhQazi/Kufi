import { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { FiMapPin, FiCalendar, FiBriefcase, FiUsers } from 'react-icons/fi'
import api from '../../api'

export default function SearchBar({ onSearch }) {
    const [country, setCountry] = useState('')
    const [countries, setCountries] = useState([])
    const [selectedCountryObj, setSelectedCountryObj] = useState(null)
    const today = new Date().toISOString().split('T')[0]
    const [arrivalDate, setArrivalDate] = useState(today)
    const [departureDate, setDepartureDate] = useState(today)
    const [travelers, setTravelers] = useState('')

    const departureMinDate = arrivalDate && arrivalDate > today ? arrivalDate : today

    useEffect(() => {
        if (!departureDate) return
        if (arrivalDate && departureDate < arrivalDate) {
            setDepartureDate(arrivalDate)
            return
        }
        if (departureDate < today) {
            setDepartureDate(today)
        }
    }, [arrivalDate, departureDate, today])

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await api.get('/countries')
                setCountries(response.data || [])
            } catch (error) {
                console.error("Error fetching countries:", error)
            }
        }
        fetchCountries()
    }, [])

    const handleSubmit = (event) => {
        event.preventDefault()
        if (onSearch) {
            onSearch({
                country: selectedCountryObj,
                arrivalDate,
                departureDate,
                travelers,
            })
        }
    }

    return (
        <section className="relative z-20 -mt-20 px-4 sm:px-8 lg:px-20 max-w-[1400px] mx-auto">
            <form
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 bg-white rounded-2xl p-4 shadow-2xl text-slate-950 items-center"
                onSubmit={handleSubmit}
            >
                <div className="px-2 py-1">
                    <Input
                        label="Where do you want to visit ?"
                        icon={<FiMapPin className="text-slate-500 text-lg" />}
                        value={country}
                        onChange={(e) => {
                            const val = e.target.value
                            setCountry(val)
                            const matched = countries.find((c) => (c?.name || '').toLowerCase() === (val || '').toLowerCase())
                            setSelectedCountryObj(matched || null)
                        }}
                        placeholder="Country"
                        options={countries.map(c => ({ value: c.name.toLowerCase(), label: c.name }))}
                        inputClassName="!bg-slate-50 !border-slate-300 !text-base !font-medium !text-slate-700 !h-[48px] !rounded-lg"
                        labelClassName="!text-sm !text-slate-700 !mb-2 !font-normal"
                    />
                </div>

                <div className="px-2 py-1">
                    <Input
                        label="Arrival Date"
                        type="date"
                        icon={<FiCalendar className="text-slate-500 text-lg" />}
                        value={arrivalDate}
                        onChange={(e) => {
                            const val = e.target.value
                            setArrivalDate(val)
                            if (val && departureDate && departureDate < val) {
                                setDepartureDate(val)
                            }
                        }}
                        inputProps={{ min: today }}
                        inputClassName="!bg-slate-50 !border-slate-300 !text-sm !font-medium !text-slate-700 !h-[48px] !rounded-lg"
                        labelClassName="!text-sm !text-slate-700 !mb-2 !font-normal"
                    />
                </div>

                <div className="px-2 py-1">
                    <Input
                        label="Departure Date"
                        type="date"
                        icon={<FiCalendar className="text-slate-500 text-lg" />}
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        inputProps={{ min: departureMinDate }}
                        inputClassName="!bg-slate-50 !border-slate-300 !text-sm !font-medium !text-slate-700 !h-[48px] !rounded-lg"
                        labelClassName="!text-sm !text-slate-700 !mb-2 !font-normal"
                    />
                </div>

                <div className="px-2 py-1">
                    <Input
                        label="Number of Travelers"
                        icon={<FiUsers className="text-slate-500 text-lg" />}
                        value={travelers}
                        onChange={(e) => setTravelers(e.target.value)}
                        placeholder="Guests "
                        options={[
                            { value: '1', label: '1 Guest' },
                            { value: '2', label: '2 Guests' },
                            { value: '3', label: '3 Guests' },
                            { value: '4', label: '4 Guests' },
                            { value: '5', label: '5 + Guests' },
                        ]}
                        inputClassName="!bg-slate-50 !border-slate-300 !text-base !font-medium !text-slate-700 !h-[48px] !rounded-lg"
                        labelClassName="!text-sm !text-slate-700 !mb-2 !font-normal"
                    />
                </div>

                <Button
                    variant="search"
                    type="submit"
                    className="!bg-[#A67C52] !text-white !rounded-lg !px-10 !h-[48px] !font-medium hover:!bg-[#8e6a45] w-full sm:w-auto shadow-sm !mt-[25px]"
                >
                    Search
                </Button>
            </form>
        </section>
    )
}
