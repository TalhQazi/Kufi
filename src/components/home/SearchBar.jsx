import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

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
        <section className="relative z-10 -mt-10">
            <form
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] gap-4 sm:gap-6 bg-white rounded-2xl py-4 sm:py-5 px-4 sm:px-7 shadow-card-hover text-slate-950"
                onSubmit={handleSubmit}
            >
                <Input
                    label="Where do you want to stay?"
                    icon="📍"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    options={[
                        { value: 'dubai', label: 'Dubai' },
                        { value: 'bali', label: 'Bali' },
                        { value: 'paris', label: 'Paris' },
                        { value: 'maldives', label: 'Maldives' },
                    ]}
                />

                <Input
                    label="Duration"
                    icon="📅"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    options={[
                        { value: '3', label: '03 Days' },
                        { value: '5', label: '05 Days' },
                        { value: '8', label: '08 Days' },
                        { value: '10', label: '10 Days' },
                    ]}
                />

                <Input
                    label="Travel Style"
                    icon="🎒"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    options={[
                        { value: 'travelling', label: 'Travelling' },
                        { value: 'adventure', label: 'Adventure' },
                        { value: 'luxury', label: 'Luxury' },
                        { value: 'family', label: 'Family' },
                    ]}
                />

                <Input
                    label="Number of Travelers"
                    icon="👥"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    options={[
                        { value: '1', label: '1 Guest' },
                        { value: '2', label: '2 Guests' },
                        { value: '3', label: '3 Guests' },
                        { value: '4', label: '4 Guests' },
                    ]}
                />

                <Button
                    variant="search"
                    type="submit"
                    className="w-full sm:w-auto self-end sm:self-center justify-self-stretch sm:justify-self-end"
                >
                    Search
                </Button>
            </form>
        </section>
    )
}
