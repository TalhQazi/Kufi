import { useState, useEffect, useRef } from 'react'

export default function Explore({ onLogout }) {
  const [selected, setSelected] = useState([])
  const [dropdown, setDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false)
      }
    }

    if (dropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdown])

  const brownColor = "#9B6F40"

  const categories = [
    {
      name: 'Trekking',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <path d="M13 4.99961C13.5523 4.99961 14 4.55189 14 3.99961C14 3.44732 13.5523 2.99961 13 2.99961C12.4477 2.99961 12 3.44732 12 3.99961C12 4.55189 12.4477 4.99961 13 4.99961Z" />
          <path d="M5.5 21L10 11L8 9L11 7L13 9V6L15 8L17 13M9 19L11 13" />
          <path d="M7 10L9 8" />
        </svg>
      )
    },
    {
      name: 'Camping',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <path d="M3 20L12 3L21 20H3Z" />
          <path d="M12 3V10" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      )
    },
    {
      name: 'Water Activities',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <path d="M3 12C3 12 4.5 9 6 9C7.5 9 9 12 9 12C9 12 10.5 15 12 15C13.5 15 15 12 15 12C15 12 16.5 9 18 9C19.5 9 21 12 21 12" />
          <path d="M3 17C3 17 4.5 14 6 14C7.5 14 9 17 9 17C9 17 10.5 20 12 20C13.5 20 15 17 15 17C15 17 16.5 14 18 14C19.5 14 21 17 21 17" />
          <circle cx="12" cy="7" r="2" />
        </svg>
      )
    },
    {
      name: 'Bike Trips',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6L17 8L12 14L9 11L5.5 14" />
          <circle cx="17" cy="5" r="1" />
        </svg>
      )
    },
    {
      name: 'Paragliding',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <path d="M12 4C6 4 3 8 3 10H21C21 8 18 4 12 4Z" />
          <path d="M12 10V14" />
          <path d="M10 14L9 20" />
          <path d="M14 14L15 20" />
          <circle cx="12" cy="3" r="1" />
        </svg>
      )
    },
    {
      name: 'Aerial Activities',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <path d="M12 2L4 6L12 10L20 6L12 2Z" />
          <path d="M12 10V22" />
          <path d="M4 11V17L12 22" />
          <path d="M20 11V17L12 22" />
        </svg>
      )
    },
    {
      name: 'Religious Tours',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <path d="M5 21V7L12 3L19 7V21" />
          <path d="M5 7H19" />
          <rect x="9" y="14" width="6" height="7" />
          <line x1="7" y1="10.5" x2="17" y2="10.5" />
        </svg>
      )
    },
    {
      name: 'Walking Tours',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <circle cx="12" cy="4" r="2" />
          <path d="M10 8L12 6L14 8V13L12 16" />
          <path d="M10 15L8 21" />
          <path d="M12 16L15 21" />
        </svg>
      )
    },
    {
      name: 'Safaris',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <path d="M3 12C3 12 5 8 12 8C19 8 21 12 21 12" />
          <path d="M3 12C3 12 5 16 12 16C19 16 21 12 21 12" />
          <circle cx="9" cy="12" r="1" fill={brownColor} />
          <circle cx="15" cy="12" r="1" fill={brownColor} />
          <path d="M12 4V8" />
          <path d="M8 5L10 7" />
          <path d="M16 5L14 7" />
        </svg>
      )
    },
    {
      name: 'Casinos',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="7.5" cy="7.5" r="1" fill={brownColor} />
          <circle cx="16.5" cy="7.5" r="1" fill={brownColor} />
          <circle cx="7.5" cy="16.5" r="1" fill={brownColor} />
          <circle cx="16.5" cy="16.5" r="1" fill={brownColor} />
          <circle cx="12" cy="12" r="1" fill={brownColor} />
        </svg>
      )
    },
    {
      name: 'Luxury',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <path d="M5 9L12 2L19 9" />
          <path d="M5 9V20H19V9" />
          <rect x="9" y="14" width="6" height="6" />
          <path d="M12 2V6" />
        </svg>
      )
    },
    {
      name: 'Food Tour',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="1.5">
          <path d="M3 11H21L19 20H5L3 11Z" />
          <path d="M17 11C17 8 15 5 12 5C9 5 7 8 7 11" />
          <line x1="12" y1="15" x2="12" y2="17" />
        </svg>
      )
    },
  ]

  // temp data - replace with API later
  const activities = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: 'Himalayan Trekking Expedition',
    image: '/assets/activity1.jpeg',
    badge: 'Trekking',
    rating: 4.2,
    reviews: 218,
    location: 'USA, India',
  }))

  const toggleActivity = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <nav className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 lg:px-20 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <img src="/assets/navbar.png" alt="Kufi Travel" className="h-10 w-20 sm:h-[66px] sm:w-28 object-contain" />
            <span className="text-sm font-medium leading-tight">Kufi<br />Travel</span>
          </div>

          <div className="hidden sm:block flex-1 max-w-md mx-6 lg:mx-12">
            <div className="relative flex items-center">
              <svg className="absolute left-3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21L16.65 16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search something"
                className="w-full py-2.5 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-brown text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdown(!dropdown)}
                className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {dropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 text-xs font-semibold text-primary-brown hover:bg-slate-50 cursor-pointer">MY REQUESTS</div>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">NOTIFICATIONS</div>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">PAYMENTS</div>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">SETTINGS</div>
                  <div className="border-t border-slate-200 my-1"></div>
                  <div 
                    className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={() => {
                      if (onLogout) {
                        onLogout()
                      }
                      setDropdown(false)
                    }}
                  >
                    LOGOUT
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-beige py-6 px-20 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {categories.map(({ name, icon }) => (
              <div key={name} className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-[80px]">
                <div className="w-16 h-16 flex items-center justify-center">
                  {icon}
                </div>
                <p className="m-0 text-xs font-medium text-slate-700 text-center whitespace-nowrap">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="px-4 sm:px-8 lg:px-20 py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <article key={activity.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-48 object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary-brown text-white text-xs font-medium">
                      {activity.badge}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="m-0 mb-2 text-base font-semibold text-slate-900 line-clamp-2">{activity.title}</h3>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-gold">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-slate-300">★</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{activity.rating}</span>
                      <span className="text-xs text-slate-500">({activity.reviews} reviews)</span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3 text-slate-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-xs">{activity.location}</span>
                    </div>

                    <button
                      className={`w-full py-2 rounded-lg text-xs font-bold tracking-wide transition-colors ${selected.includes(activity.id)
                          ? 'bg-primary-dark text-white'
                          : 'bg-beige text-primary-brown hover:bg-primary hover:text-white'
                        }`}
                      onClick={() => toggleActivity(activity.id)}
                    >
                      {selected.includes(activity.id) ? 'ADDED TO LIST' : 'ADD TO LIST'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="sticky top-24 h-fit">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h4 className="m-0 mb-2 text-lg font-bold text-slate-900">Your Selection</h4>
              <p className="m-0 mb-6 text-sm text-slate-600">
                <span className="font-bold text-primary-brown">{selected.length}</span>
                <span className="ml-1">activities selected</span>
              </p>

              {selected.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-beige flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9B6F40" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <p className="m-0 mb-2 text-sm font-semibold text-slate-900">Your selection is empty</p>
                  <p className="m-0 text-xs text-slate-500">
                    Add activities from the list to create your custom request
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  {/* TODO: list selected items here */}
                </div>
              )}

              <p className="m-0 mb-4 text-xs text-slate-500 italic">
                Review your selected adventures before sending request
              </p>

              <button
                className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${selected.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-primary-brown text-white hover:bg-primary-dark'
                  }`}
                disabled={selected.length === 0}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Send Request
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}