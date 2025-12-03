import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { FiMapPin, FiCalendar, FiBriefcase, FiUsers } from 'react-icons/fi'

export default function SearchBar() {
    const [city, setCity] = useState('dubai')
    const [duration, setDuration] = useState('8')
    const [style, setStyle] = useState('travelling')
    const [travelers, setTravelers] = useState('2')

    const handleSubmit = (event) => {
        event.preventDefault()
        console.log({ city, duration, style, travelers })
    }

    return (
        <section className="relative z-20 -mt-16 px-4 sm:px-8 lg:px-20 max-w-[1400px] mx-auto">
            <form
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_auto] gap-4 bg-white rounded-xl p-3 shadow-xl text-slate-950 items-center"
                onSubmit={handleSubmit}
            >
                <div className="bg-[#F3F4F6] rounded-lg p-2">
                    <Input
                        label="Where do you want to stay?"
                        icon={<FiMapPin className="text-slate-400" />}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        options={[
                            { value: 'dubai', label: 'Dubai' },
                            { value: 'bali', label: 'Bali' },
                            { value: 'paris', label: 'Paris' },
                            { value: 'maldives', label: 'Maldives' },
                        ]}
                        inputClassName="!bg-transparent !border-none"
                    />
                </div>

                <div className="bg-[#F3F4F6] rounded-lg p-2">
                    <Input
                        label="Duration"
                        icon={<FiCalendar className="text-slate-400" />}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        options={[
                            { value: '3', label: '03 Days' },
                            { value: '5', label: '05 Days' },
                            { value: '8', label: '08 Days' },
                            { value: '10', label: '10 Days' },
                        ]}
                        inputClassName="!bg-transparent !border-none"
                    />
                </div>

                <div className="bg-[#F3F4F6] rounded-lg p-2">
                    <Input
                        label="Travel Style"
                        icon={<FiBriefcase className="text-slate-400" />}
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        options={[
                            { value: 'travelling', label: 'Travelling' },
                            { value: 'adventure', label: 'Adventure' },
                            { value: 'luxury', label: 'Luxury' },
                            { value: 'family', label: 'Family' },
                        ]}
                        inputClassName="!bg-transparent !border-none"
                    />
                </div>

                <div className="bg-[#F3F4F6] rounded-lg p-2">
                    <Input
                        label="Number of Travelers"
                        icon={<FiUsers className="text-slate-400" />}
                        value={travelers}
                        onChange={(e) => setTravelers(e.target.value)}
                        options={[
                            { value: '1', label: '1 Guest' },
                            { value: '2', label: 'Guest and rooms' },
                            { value: '3', label: '3 Guests' },
                            { value: '4', label: '4 Guests' },
                        ]}
                        inputClassName="!bg-transparent !border-none"
                    />
                </div>

                <Button
                    variant="search"
                    type="submit"
                    className="!bg-[#A67C52] !text-white !rounded-lg !px-10 !py-4 !h-full !font-medium hover:!bg-[#8e6a45] w-full sm:w-auto"
                >
                    Search
                </Button>
            </form>
        </section>
    )
}
