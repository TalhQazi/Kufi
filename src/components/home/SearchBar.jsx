import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { FiMapPin, FiCalendar, FiBriefcase, FiUsers } from 'react-icons/fi'

export default function SearchBar() {
    const [city, setCity] = useState('')
    const [duration, setDuration] = useState('')
    const [style, setStyle] = useState('')
    const [travelers, setTravelers] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault()
        console.log({ city, duration, style, travelers })
    }

    return (
        <section className="relative z-20 -mt-20 px-4 sm:px-8 lg:px-20 max-w-[1400px] mx-auto">
            <form
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.2fr_1.5fr_1.2fr_auto] gap-4 bg-white rounded-2xl p-4 shadow-2xl text-slate-950 items-center"
                onSubmit={handleSubmit}
            >
                <div className="px-2 py-1">
                    <Input
                        label="Where do you want to visit ?"
                        icon={<FiMapPin className="text-slate-500 text-lg" />}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Dubai"
                        options={[
                            { value: 'dubai', label: 'Dubai' },
                            { value: 'bali', label: 'Bali' },
                            { value: 'paris', label: 'Paris' },
                            { value: 'maldives', label: 'Maldives' },
                        ]}
                        inputClassName="!bg-slate-50 !border-slate-300 !text-base !font-medium !text-slate-700 !h-[48px] !rounded-lg"
                        labelClassName="!text-sm !text-slate-700 !mb-2 !font-normal"
                    />
                </div>

                <div className="px-2 py-1">
                    <Input
                        label="Duration"
                        icon={<FiCalendar className="text-slate-500 text-lg" />}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Select Days"
                        options={[
                            { value: '3', label: '01 Day' },
                            { value: '5', label: '02 Days' },
                            { value: '8', label: '03 Days' },
                            { value: '10', label: '04 Days' },
                            { value: '3', label: '05 Days' },
                            { value: '5', label: '06 Days' },
                            { value: '8', label: '07 Days' },
                            { value: '10', label: '08 Days' },
                        ]}
                        inputClassName="!bg-slate-50 !border-slate-300 !text-base !font-medium !text-slate-700 !h-[48px] !rounded-lg"
                        labelClassName="!text-sm !text-slate-700 !mb-2 !font-normal"
                    />
                </div>

                <div className="px-2 py-1">
                    <Input
                        label="Travel Style"
                        icon={<FiBriefcase className="text-slate-500 text-lg" />}
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        placeholder="Choose Your Preference"
                        options={[
                            { value: 'travelling', label: 'Travelling' },
                            { value: 'adventure', label: 'Adventure' },
                            { value: 'luxury', label: 'Luxury' },
                            { value: 'family', label: 'Family' },
                        ]}
                        inputClassName="!bg-slate-50 !border-slate-300 !text-base !font-medium !text-slate-700 !h-[48px] !rounded-lg"
                        labelClassName="!text-sm !text-slate-700 !mb-2 !font-normal"
                    />
                </div>

                <div className="px-2 py-1">
                    <Input
                        label="Number of Travelers"
                        icon={<FiUsers className="text-slate-500 text-lg" />}
                        value={travelers}
                        onChange={(e) => setTravelers(e.target.value)}
                        placeholder="Guest "
                        options={[
                            { value: '1', label: '1 Guest' },
                            { value: '2', label: '2 Guest' },
                            { value: '3', label: '3 Guest' },
                            { value: '4', label: '4 Guest' },
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
