import { useState, useEffect, useRef } from 'react'
import { FiUser } from 'react-icons/fi'
import api from '../../api'
import Footer from '../../components/layout/Footer'
import ProfilePic from '../../components/ui/ProfilePic'

export default function Explore({
  selectedActivities = [],
  onAddToList,
  onRemoveActivity,
  onLogout,
  onActivityClick,
  onNotificationClick,
  onProfileClick,
  onMyProfileClick,
  onMyRequestsClick,
  onSendRequest,
  onBack,
  onForward,
  canGoBack,
  canGoForward,
  onCategoryClick,
  onSettingsClick,
  onHomeClick,
  initialCategory = null,
  hideHeaderFooter = false
}) {
  const [dropdown, setDropdown] = useState(false)
  const [allActivities, setAllActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {}
  const dropdownRef = useRef(null)

  const normalizeCategory = (value) => {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .trim()
  }

  const backendCategoryAliases = {
    foodtour: 'foodtour',
    daytour: 'daytour',
    summervisit: 'summervisit',
    memorabletour: 'memorabletour',
    shipcurise: 'shipcurise',
    whenvisiting: 'whenvisiting'
  }

  const exploreToBackendCategories = {
    culture: ['whenvisiting'],
    sightseeing: ['memorabletour'],
    families: ['daytour'],
    foodanddrink: ['foodtour'],
    adventure: ['memorabletour'],
    intheair: ['summervisit'],
    onthewater: ['shipcurise'],
    entertainment: ['whenvisiting'],
    seasonal: ['summervisit'],
    wellness: ['memorabletour'],
    learning: ['daytour', 'shipcurise'],
    luxury: ['memorabletour', 'shipcurise'],
    dates: ['whenvisiting', 'daytour']
  }

  const getBackendCategoryKeysForFilter = (filterName) => {
    if (!filterName) return null
    const normalizedFilter = normalizeCategory(filterName)
    const mapped = exploreToBackendCategories[normalizedFilter]
    if (Array.isArray(mapped) && mapped.length > 0) return mapped
    const maybeBackend = backendCategoryAliases[normalizedFilter]
    return maybeBackend ? [maybeBackend] : null
  }

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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/activities')
        const data = Array.isArray(response.data) ? response.data : []
        setAllActivities(data)

        const keys = getBackendCategoryKeysForFilter(selectedCategory)
        if (keys && keys.length > 0) {
          setFilteredActivities(data.filter(a => keys.includes(normalizeCategory(a?.category))))
          return
        }

        setFilteredActivities(data)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivities()
  }, [])

  useEffect(() => {
    const keys = getBackendCategoryKeysForFilter(selectedCategory)
    if (keys && keys.length > 0) {
      setFilteredActivities(allActivities.filter(a => keys.includes(normalizeCategory(a?.category))))
      return
    }

    setFilteredActivities(allActivities)
  }, [selectedCategory, allActivities])

  const handleLocalCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null) // Unselect if clicked again
    } else {
      setSelectedCategory(categoryName)
    }
  }

  const brownColor = "#9B6F40"

  const categories = [
    {
      name: 'Culture',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <path d="M5 21V7L12 3L19 7V21" />
          <path d="M5 7H19" />
          <rect x="9" y="14" width="6" height="7" />
          <line x1="7" y1="10.5" x2="17" y2="10.5" />
        </svg>
      )
    },
    {
      name: 'Sightseeing',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <circle cx="12" cy="4" r="2" />
          <path d="M10 8L12 6L14 8V13L12 16" />
          <path d="M10 15L8 21" />
          <path d="M12 16L15 21" />
        </svg>
      )
    },
    {
      name: 'Families',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      name: 'Food and Drink',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <path d="M3 11H21L19 20H5L3 11Z" />
          <path d="M17 11C17 8 15 5 12 5C9 5 7 8 7 11" />
          <line x1="12" y1="15" x2="12" y2="17" />
        </svg>
      )
    },
    {
      name: 'Adventure',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <path d="M13 3.99961C13.5523 3.99961 14 3.55189 14 2.99961" />
          <path d="M5.5 21L10 11L8 9L11 7L13 9V6L15 8L17 13M9 19L11 13" />
          <path d="M7 10L9 8" />
        </svg>
      )
    },
    {
      name: 'In the Air',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <path d="M12 2L4 6L12 10L20 6L12 2Z" />
          <path d="M12 10v12" />
          <path d="M4 11v6l8 5" />
          <path d="M20 11v6l-8 5" />
        </svg>
      )
    },
    {
      name: 'On the water',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <path d="M2 12c0 2 1 3 3 3s3-1 3-3 1-3 3-3 3 1 3 3 1 3 3 3 3-1 3-3" />
          <path d="M2 17c0 2 1 3 3 3s3-1 3-3 1-3 3-3 3 1 3 3 1 3 3 3 3-1 3-3" />
          <path d="M12 9V5" />
          <path d="M11 5h2" />
        </svg>
      )
    },
    {
      name: 'Entertainment',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
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
      name: 'Seasonal',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <path d="M3 20L12 3L21 20H3Z" />
          <path d="M12 3v7" />
          <path d="M2 20h20" />
        </svg>
      )
    },
    {
      name: 'Wellness',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )
    },
    {
      name: 'Learning',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <path d="M12 12l2 2 4-4" />
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    },
    {
      name: 'Luxury',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <path d="M5 9l7-7 7 7" />
          <path d="M5 9v11h14V9" />
          <rect x="9" y="14" width="6" height="6" />
          <path d="M12 2v4" />
        </svg>
      )
    },
    {
      name: 'Dates',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
  ]


  return (
    <div className="bg-white min-h-screen">
      <nav className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 lg:px-20 sticky top-0 z-50">
        <div className="mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (onHomeClick) {
                  onHomeClick()
                }
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img src="/assets/navbar.png" alt="Kufi Travel" className="h-10 w-20 sm:h-[66px] sm:w-28 object-contain" />
            </button>
          </div>


          <div className="flex items-center gap-2 sm:gap-4">
            <button
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => onNotificationClick && onNotificationClick()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>


            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdown(!dropdown)}
                className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ProfilePic user={currentUser} size="sm" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {dropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <div
                    className="px-4 py-2 text-xs font-semibold text-primary-brown hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                      if (onMyProfileClick) {
                        onMyProfileClick()
                      }
                      setDropdown(false)
                    }}
                  >
                    MY PROFILE
                  </div>
                  <div
                    className="px-4 py-2 text-xs font-semibold text-primary-brown hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                      if (onMyRequestsClick) {
                        onMyRequestsClick()
                      } else if (onProfileClick) {
                        onProfileClick()
                      }
                      setDropdown(false)
                    }}
                  >
                    MY REQUESTS
                  </div>
                  <div
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                      onNotificationClick && onNotificationClick()
                      setDropdown(false)
                    }}
                  >
                    NOTIFICATIONS
                  </div>
                  <div
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                      // Navigate to payments or traveler profile payments tab
                      if (onSettingsClick) {
                        onSettingsClick()
                      }
                      setDropdown(false)
                    }}
                  >
                    PAYMENTS
                  </div>
                  <div
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                      onSettingsClick && onSettingsClick()
                      setDropdown(false)
                    }}
                  >
                    SETTINGS
                  </div>
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

      <div className="bg-beige py-4 sm:py-6 px-4 sm:px-8 lg:px-20 border-b border-slate-200">
        <div className="mx-auto overflow-x-auto hide-scrollbar">
          <div className="flex gap-4 sm:gap-6 lg:gap-8 min-w-max">
            <div
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all min-w-[70px] sm:min-w-[80px] p-2 rounded-xl ${!selectedCategory ? 'bg-primary-brown/10 scale-105' : 'hover:bg-slate-50'}`}
              onClick={() => setSelectedCategory(null)}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-white shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={brownColor} strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </div>
              <p className={`m-0 text-[10px] sm:text-xs font-bold text-center whitespace-nowrap ${!selectedCategory ? 'text-primary-brown' : 'text-slate-700'}`}>All</p>
            </div>
            {categories.map(({ name, icon }) => (
              <div
                key={name}
                className={`flex flex-col items-center gap-2 cursor-pointer transition-all min-w-[70px] sm:min-w-[80px] p-2 rounded-xl ${selectedCategory === name ? 'bg-primary-brown/10 scale-105' : 'hover:bg-slate-50'}`}
                onClick={() => handleLocalCategoryClick(name)}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-white shadow-sm">
                  {icon}
                </div>
                <p className={`m-0 text-[10px] sm:text-xs font-bold text-center whitespace-nowrap ${selectedCategory === name ? 'text-primary-brown' : 'text-slate-700'}`}>{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="px-4 sm:px-8 lg:px-20 py-6 sm:py-8">
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {isLoading ? (
                <div className="col-span-full py-20 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
                </div>
              ) : filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => {
                  const activityId = activity._id || activity.id;
                  const isSelected = selectedActivities.some(a => (a._id || a.id) === activityId);

                  return (
                    <article
                      key={activityId}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => onActivityClick && onActivityClick(activityId)}
                    >
                      <div className="relative">
                        <img
                          src={activity.imageUrl || activity.images?.[0] || activity.image || activity.Picture || "/assets/activity1.jpeg"}
                          alt={activity.title}
                          className="w-full h-48 object-cover"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary-brown text-white text-xs font-medium">
                          {activity.category || activity.badge || "Trekking"}
                        </span>
                      </div>

                      <div className="p-4">
                        <h3 className="m-0 mb-2 text-base font-semibold text-slate-900 line-clamp-2">{activity.title}</h3>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-gold">
                            <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-slate-300">★</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{activity.rating || 4.2}</span>
                          <span className="text-xs text-slate-500">({activity.reviewsCount || activity.reviews || 0} reviews)</span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-3 text-slate-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="text-xs truncate">
                            {activity.city ? `${activity.city}, ` : ''}{activity.country || activity.location || 'USA, India'}
                          </span>
                        </div>

                        <button
                          className={`w-full py-2 rounded-lg text-xs font-bold tracking-wide transition-colors ${isSelected
                            ? 'bg-primary-dark text-white'
                            : 'bg-beige text-primary-brown hover:bg-primary-brown hover:text-white'
                            }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!isSelected) {
                              onAddToList && onAddToList(activity)
                            }
                          }}
                        >
                          {isSelected ? 'ADDED TO LIST' : 'ADD TO LIST'}
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center text-slate-500">
                  No activities found.
                </div>
              )}
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 h-fit order-first lg:order-last lg:ml-12">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200 flex flex-col lg:max-h-[calc(100vh-8rem)]">
              <h4 className="m-0 mb-2 text-lg font-bold text-slate-900">Your Selection</h4>
              <p className="m-0 mb-6 text-sm text-slate-600">
                <span className="font-bold text-primary-brown">{selectedActivities.length}</span>
                <span className="ml-1">activities selected</span>
              </p>

              {selectedActivities.length === 0 ? (
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
                <div className="mb-4 space-y-3 lg:flex-1 lg:overflow-y-auto lg:pr-2 hide-scrollbar">
                  {selectedActivities.map(activity => (
                    <div key={activity.id} className="pb-3 border-b border-slate-200 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <img src={activity.image} alt={activity.title} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{activity.title}</h4>
                          <p className="text-xs text-slate-500 truncate">{activity.location}</p>
                        </div>
                        <button
                          onClick={() => onRemoveActivity && onRemoveActivity(activity.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="Remove"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {activity.addOns && (
                        <div className="ml-20 mt-2 space-y-1">
                          {(() => {
                            const raw = activity.addOns
                            const legacyMap = {
                              quadBiking: 'Quad Biking',
                              campingGear: 'Camping Gear',
                              photographyPackage: 'Photography Package',
                            }

                            const list = Array.isArray(raw)
                              ? raw.map((v) => String(v || '').trim()).filter(Boolean)
                              : (raw && typeof raw === 'object')
                                ? Object.keys(legacyMap).filter((k) => !!raw[k]).map((k) => legacyMap[k])
                                : []

                            if (!Array.isArray(list) || list.length === 0) return null

                            return (
                              <div className="space-y-1">
                                {list.map((label, idx) => (
                                  <div key={`${label}-${idx}`} className="text-xs text-slate-600">
                                    <span className="font-medium">• {label}</span>
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="m-0 mb-4 text-xs text-slate-500 italic">
                Review your selected adventures before sending request
              </p>

              <button
                className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${selectedActivities.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-primary-brown text-white hover:bg-primary-dark'
                  }`}
                disabled={selectedActivities.length === 0}
                onClick={() => onSendRequest && onSendRequest()}
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
      {!hideHeaderFooter && <Footer />}
    </div>
  )
}