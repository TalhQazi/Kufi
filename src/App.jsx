import { useState, useEffect } from 'react'
import api from './api'
import HomePage from './pages/userpannel/HomePage.jsx'
import Login from './pages/userpannel/Login.jsx'
import Register from './pages/userpannel/Register.jsx'
import Explore from './pages/userpannel/Explore.jsx'
import UserDashboard from './pages/userpannel/UserDashboard.jsx'
import ActivityDetail from './pages/userpannel/ActivityDetail.jsx'
import CountryDetails from './pages/userpannel/CountryDetails.jsx'
import CategoryPage from './pages/userpannel/CategoryPage.jsx'
import NotificationsModal from './pages/userpannel/NotificationsModal.jsx'
import TravelBooking from './pages/userpannel/TravelBooking.jsx'
import BookingConfirmation from './pages/userpannel/BookingConfirmation.jsx'
import Payment from './pages/userpannel/Payment.jsx'
import ItineraryView from './pages/userpannel/ItineraryView.jsx'
import TravelerProfile from './pages/userpannel/TravelerProfile.jsx'
import BlogDetail from './pages/userpannel/BlogDetail.jsx'
import AdminApp from './AdminApp.jsx'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'

export default function App() {
  const SELECTED_ACTIVITIES_STORAGE_KEY = 'kufi_selected_activities'

  const getInitialPage = () => {
    const rawHash = window.location.hash.slice(1)
    const path = rawHash || 'home'

    const storedUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('currentUser'))
      } catch {
        return null
      }
    })()
    const role = storedUser?.role || localStorage.getItem('userRole')
    const token = localStorage.getItem('authToken')

    if ((path === 'home' || !rawHash) && role === 'supplier' && token) return 'supplier'
    if ((path === 'home' || !rawHash) && role === 'admin' && token) return 'admin'
    return path
  }

  const [page, setPage] = useState(getInitialPage())
  const [showModal, setShowModal] = useState(null) // 'login' or 'register' or null
  const [showNotifications, setShowNotifications] = useState(false)
  const [bookingData, setBookingData] = useState(null) // Store booking form data
  const [selectedActivities, setSelectedActivities] = useState(() => {
    try {
      const raw = localStorage.getItem(SELECTED_ACTIVITIES_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }) // Store selected activities for user profile
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('currentUser')) || null)

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_ACTIVITIES_STORAGE_KEY, JSON.stringify(Array.isArray(selectedActivities) ? selectedActivities : []))
    } catch {
    }
  }, [selectedActivities])

  const hasAuthToken = () => {
    try {
      return Boolean(localStorage.getItem('authToken'))
    } catch {
      return false
    }
  }

  const getStoredRole = () => {
    try {
      const storedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('currentUser'))
        } catch {
          return null
        }
      })()
      return (storedUser?.role || localStorage.getItem('userRole') || '').toLowerCase()
    } catch {
      return ''
    }
  }

  useEffect(() => {
    const getOrCreateSessionId = () => {
      try {
        const existing = localStorage.getItem('kufi_session_id')
        if (existing) return existing
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
        localStorage.setItem('kufi_session_id', id)
        return id
      } catch {
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`
      }
    }

    const sessionId = getOrCreateSessionId()

    const getRole = () => {
      const storedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('currentUser'))
        } catch {
          return null
        }
      })()
      return storedUser?.role || localStorage.getItem('userRole') || null
    }

    const getUserId = () => {
      const storedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('currentUser'))
        } catch {
          return null
        }
      })()
      return storedUser?._id || storedUser?.id || null
    }

    const sendPageView = async () => {
      const path = window.location.hash || '#home'
      try {
        await api.post('/analytics/track/pageview', {
          sessionId,
          path,
          role: getRole(),
          userId: getUserId(),
        })
      } catch {
      }
    }

    sendPageView()
    const onHash = () => sendPageView()
    window.addEventListener('hashchange', onHash)

    const intervalSeconds = 15
    const heartbeat = async () => {
      const path = window.location.hash || '#home'
      try {
        await api.post('/analytics/track/heartbeat', {
          sessionId,
          seconds: intervalSeconds,
          path,
          role: getRole(),
          userId: getUserId(),
        })
      } catch {
      }
    }
    const intervalId = setInterval(heartbeat, intervalSeconds * 1000)

    return () => {
      window.removeEventListener('hashchange', onHash)
      clearInterval(intervalId)
    }
  }, [])

  const [selectedActivityId, setSelectedActivityId] = useState(null)
  const [selectedCountryName, setSelectedCountryName] = useState('Italy')
  const [selectedCategoryName, setSelectedCategoryName] = useState('Camping Adventures')
  const [selectedItineraryId, setSelectedItineraryId] = useState(null)
  const [selectedItineraryRequest, setSelectedItineraryRequest] = useState(null)
  const [selectedCityName, setSelectedCityName] = useState(null)
  const [selectedBlogId, setSelectedBlogId] = useState(null)
  const [exploreInitialCategory, setExploreInitialCategory] = useState(null)
  const [travelerProfileInitialTab, setTravelerProfileInitialTab] = useState(null)

  const handleActivityClick = (id) => {
    setSelectedActivityId(id)
    navigateTo('activity-detail')
  }

  const handleCountryClick = async (payload) => {
    
    const maybeName = typeof payload === 'string' ? payload : payload?.name
    const maybeCountry = payload?.country

    if (maybeCountry) {
      setSelectedCityName(maybeName || null)

      try {
        if (typeof maybeCountry === 'string' && !/^[0-9a-fA-F]{24}$/.test(maybeCountry)) {
          setSelectedCountryName(maybeCountry)
          navigateTo('country-details')
          return
        }

        const countryId = typeof maybeCountry === 'string' ? maybeCountry : maybeCountry?._id
        if (countryId) {
          const countriesRes = await api.get('/countries')
          const allCountries = Array.isArray(countriesRes.data) ? countriesRes.data : []
          const matched = allCountries.find((c) => c?._id === countryId)
          if (matched?.name) {
            setSelectedCountryName(matched.name)
            navigateTo('country-details')
            return
          }
        }
      } catch (e) {
        console.error('Error resolving city country:', e)
      }

      if (maybeName) {
        setSelectedCountryName(maybeName)
      }
      navigateTo('country-details')
      return
    }

    const countryName = maybeName
    if (!countryName) return
    setSelectedCityName(null)
    setSelectedCountryName(countryName)
    navigateTo('country-details')
  }

  const handleCategoryClick = (name) => {
    setSelectedCategoryName(name)
    navigateTo('category-page')
  }

  const handleItineraryClick = (payload) => {
    const id = payload?._id || payload?.id || payload
    setSelectedItineraryId(id || null)
    setSelectedItineraryRequest(payload && typeof payload === 'object' ? payload : null)
    navigateTo('itinerary-view')
  }

  const handleServiceClick = (categoryKey) => {
    if (!categoryKey) return
    setExploreInitialCategory(categoryKey)
    navigateTo('explore')
  }

  const handleBlogClick = (id) => {
    if (!id) return
    setSelectedBlogId(id)
    try {
      sessionStorage.setItem('selectedBlogId', String(id))
    } catch (e) {
    }
    navigateTo('blog-detail')
  }

  const handleProfileClick = () => {
    if (!currentUser) {
      setShowModal('login')
      return
    }
    const role = currentUser.role || localStorage.getItem('userRole')
    if (role === 'admin') {
      navigateTo('admin')
    } else if (role === 'supplier') {
      navigateTo('supplier')
    } else {
      navigateTo('user-profile')
    }
  }

  const handleMyRequestsClick = () => {
    if (!currentUser) {
      setShowModal('login')
      return
    }
    setTravelerProfileInitialTab(null)
    navigateTo('user-profile')
  }

  const handleMyProfileClick = () => {
    if (!currentUser) {
      setShowModal('login')
      return
    }
    setTravelerProfileInitialTab('Personal Info')
    navigateTo('traveler-profile')
  }

  const handleSettingsClick = () => {
    if (!currentUser) {
      setShowModal('login')
      return
    }
    setTravelerProfileInitialTab('Settings')
    navigateTo('traveler-profile')
  }

  const [history, setHistory] = useState([getInitialPage()])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPopState, setIsPopState] = useState(false)

  useEffect(() => {
    const handleNavigationChange = (event) => {
      const newPage = (event.type === 'popstate' ? event.state?.page : window.location.hash.slice(1)) || 'home';

      const role = (currentUser?.role || localStorage.getItem('userRole') || '').toLowerCase()

      const isAdminRoute = String(newPage || '').startsWith('admin')
      const isSupplierRoute = String(newPage || '').startsWith('supplier')

      if ((isAdminRoute || isSupplierRoute) && !hasAuthToken()) {
        setIsPopState(true);
        setPage('home');
        setShowModal('login')
        window.history.replaceState({ page: 'home' }, '', '#home')
        return
      }

      if (isAdminRoute && getStoredRole() !== 'admin') {
        setIsPopState(true);
        setPage('home');
        setShowModal('login')
        window.history.replaceState({ page: 'home' }, '', '#home')
        return
      }

      if (isSupplierRoute && getStoredRole() !== 'supplier') {
        setIsPopState(true);
        setPage('home');
        setShowModal('login')
        window.history.replaceState({ page: 'home' }, '', '#home')
        return
      }

      if (role === 'supplier' && newPage !== 'supplier') {
        setIsPopState(true);
        setPage('supplier');
        window.history.replaceState({ page: 'supplier' }, '', '#supplier')
        return
      }

      if (role === 'admin' && !String(newPage || '').startsWith('admin')) {
        setIsPopState(true);
        setPage('admin');
        window.history.replaceState({ page: 'admin' }, '', '#admin')
        return
      }

      console.log(`Navigation change detected (${event.type}): ${newPage}`);
      setIsPopState(true);
      setPage(newPage);

      const pageIndex = history.indexOf(newPage);
      if (pageIndex !== -1) {
        setCurrentIndex(pageIndex);
      }
    };

    window.addEventListener('popstate', handleNavigationChange);
    window.addEventListener('hashchange', handleNavigationChange);

    if (!window.history.state) {
      window.history.replaceState({ page: page }, '', `#${page}`);
    }

    try {
      const role = (currentUser?.role || localStorage.getItem('userRole') || '').toLowerCase()
      const guardKey = role === 'supplier' ? 'kufi_supplier_back_guard' : role === 'admin' ? 'kufi_admin_back_guard' : ''
      if (guardKey && !sessionStorage.getItem(guardKey)) {
        sessionStorage.setItem(guardKey, '1')
        window.history.pushState({ page: page }, '', `#${page}`)
      }
    } catch {
    }

    return () => {
      window.removeEventListener('popstate', handleNavigationChange);
      window.removeEventListener('hashchange', handleNavigationChange);
    };
  }, [history, page, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userRole')
    localStorage.removeItem('authToken')
    try {
      localStorage.removeItem(SELECTED_ACTIVITIES_STORAGE_KEY)
    } catch {
    }
    setSelectedActivities([])
    setCurrentUser(null)
    setHistory(['home'])
    setCurrentIndex(0)
    setPage('home')
    window.history.pushState({ page: 'home' }, '', '#home')
    try {
      sessionStorage.removeItem('kufi_supplier_back_guard')
      sessionStorage.removeItem('kufi_admin_back_guard')
    } catch {
    }
    setShowModal(null)
  }

  const handleCloseModal = () => {
    setShowModal(null)
  }

  const handleOpenLogin = () => {
    setShowModal('login')
  }

  const handleOpenRegister = () => {
    setShowModal('register')
  }

  const handleAddToList = (activity, options = {}) => {
    const { navigate = true } = options || {}
    const normalizedActivity = activity
      ? {
        ...activity,
        id: activity.id || activity._id,
        image: activity.image || activity.imageUrl || activity.images?.[0] || activity.Picture,
        location: activity.location || [activity.city?.name, activity.country?.name].filter(Boolean).join(', ') || activity.country || activity.city,
      }
      : null

    setSelectedActivities(prev => {
      if (!normalizedActivity?.id) return prev
      const exists = prev.find(a => (a.id || a._id) === normalizedActivity.id)
      if (exists) return prev
      return [...prev, normalizedActivity]
    })
    if (navigate) {
      navigateTo('explore')
    }
  }

  const handleRemoveFromList = (activityId) => {
    setSelectedActivities(prev => prev.filter(a => (a.id || a._id) !== activityId))
  }

  const navigateTo = (newPage) => {
    if (page === newPage) return

    const newHistory = history.slice(0, currentIndex + 1)
    newHistory.push(newPage)
    setHistory(newHistory)
    setCurrentIndex(newHistory.length - 1)
    setPage(newPage)

    window.history.pushState({ page: newPage }, '', `#${newPage}`)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      const prevPage = history[newIndex]
      setCurrentIndex(newIndex)
      setPage(prevPage)

      window.history.back()
    }
  }

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      const nextPage = history[newIndex]
      setCurrentIndex(newIndex)
      setPage(nextPage)

  
      window.history.forward()
    }
  }

  const canGoBack = currentIndex > 0
  const canGoForward = currentIndex < history.length - 1


  const renderUserPage = () => {
    if (page === 'explore') return (
      <Explore
        selectedActivities={selectedActivities}
        onAddToList={(activity) => handleAddToList(activity)}
        onRemoveActivity={handleRemoveFromList}
        onLogout={handleLogout}
        onActivityClick={handleActivityClick}
        onCategoryClick={handleCategoryClick}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={handleMyRequestsClick}
        onMyProfileClick={handleMyProfileClick}
        onMyRequestsClick={handleMyRequestsClick}
        onSettingsClick={handleSettingsClick}
        onSendRequest={() => navigateTo('travel-booking')}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onHomeClick={() => navigateTo('home')}
        initialCategory={exploreInitialCategory}
        hideHeaderFooter={true}
      />
    )

    if (page === 'blog-detail') return (
      <BlogDetail
        blogId={selectedBlogId}
        onBack={goBack}
        onHomeClick={() => navigateTo('home')}
        hideHeaderFooter={true}
      />
    )

    if (page === 'country-details') return (
      <CountryDetails
        countryName={selectedCountryName}
        selectedCityName={selectedCityName}
        onLogout={handleLogout}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={handleProfileClick}
        onActivityClick={handleActivityClick}
        onBlogClick={handleBlogClick}
        onBack={goBack}
        onHomeClick={() => navigateTo('home')}
        onSettingsClick={() => navigateTo('traveler-profile')}
        hideHeaderFooter={true}
      />
    )

    if (page === 'category-page') return (
      <CategoryPage
        categoryName={selectedCategoryName}
        onLogout={handleLogout}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={handleProfileClick}
        onActivityClick={handleActivityClick}
        onBack={goBack}
        onHomeClick={() => navigateTo('home')}
        onSettingsClick={() => navigateTo('traveler-profile')}
        hideHeaderFooter={true}
      />
    )

    if (page === 'user-profile') return (
      <UserDashboard
        onLogout={handleLogout}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onExploreClick={() => navigateTo('explore')}
        onItineraryClick={handleItineraryClick}
        onHomeClick={() => navigateTo('home')}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={handleMyRequestsClick}
        onMyProfileClick={handleMyProfileClick}
        onMyRequestsClick={handleMyRequestsClick}
        onSettingsClick={handleSettingsClick}
        onCountryClick={handleCountryClick}
        hideHeaderFooter={true}
      />
    )

    if (page === 'activity-detail') return (
      <ActivityDetail
        activityId={selectedActivityId}
        onHomeClick={() => navigateTo('home')}
        onLogout={handleLogout}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={handleProfileClick}
        onSettingsClick={() => navigateTo('traveler-profile')}
        onActivityClick={handleActivityClick}
        selectedActivities={selectedActivities}
        onRemoveActivity={handleRemoveFromList}
        onSendRequest={() => navigateTo('travel-booking')}
        onAddToList={(activityData) => handleAddToList(activityData, { navigate: false })}
        hideHeaderFooter={true}
      />
    )

    if (page === 'travel-booking') return (
      <TravelBooking
        onHomeClick={() => navigateTo('home')}
        onLogout={handleLogout}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={handleProfileClick}
        onSettingsClick={() => navigateTo('traveler-profile')}
        selectedActivities={selectedActivities}
        hideHeaderFooter={true}
        onSubmit={(data) => {
          setBookingData(data)
          setSelectedActivities([])
          navigateTo('explore')
        }}
      />
    )

    if (page === 'booking-confirmation') return (
      <BookingConfirmation
        onHomeClick={() => navigateTo('home')}
        bookingData={bookingData}
        onContinueBrowsing={() => navigateTo('explore')}
        onGoToCart={() => navigateTo('payment')}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
      />
    )

    if (page === 'payment') return (
      <Payment
        onHomeClick={() => navigateTo('home')}
        bookingData={bookingData}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onNotificationClick={() => setShowNotifications(true)}
      />
    )

    if (page === 'itinerary-view') return (
      <ItineraryView
        itineraryId={selectedItineraryId}
        request={selectedItineraryRequest}
        onBack={goBack}
        onPaymentClick={() => navigateTo('payment')}
        onRequestAdjustment={() => navigateTo('user-profile')}
        onLogout={handleLogout}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={handleProfileClick}
        onSettingsClick={() => navigateTo('traveler-profile')}
        onHomeClick={() => navigateTo('home')}
        hideHeaderFooter={true}
      />
    )

    if (page === 'traveler-profile') return (
      <TravelerProfile
        onBack={goBack}
        onLogout={handleLogout}
        onProfileClick={handleMyRequestsClick}
        onSettingsClick={handleSettingsClick}
        onHomeClick={() => navigateTo('home')}
        initialTab={travelerProfileInitialTab}
        hideHeaderFooter={true}
      />
    )

    return (
      <HomePage
        onHomeClick={() => navigateTo('home')}
        onSignupClick={handleOpenRegister}
        onSigninClick={handleOpenLogin}
        onExploreClick={() => navigateTo('explore')}
        onCategoryClick={handleCategoryClick}
        onCountryClick={handleCountryClick}
        onActivityClick={handleActivityClick}
        onBlogClick={handleBlogClick}
        currentUser={currentUser}
        onLogout={handleLogout}
        onProfileClick={handleMyProfileClick}
        onMyRequestsClick={handleMyRequestsClick}
        onSettingsClick={handleSettingsClick}
        onServiceClick={handleServiceClick}
        hideHeaderFooter={true}
      />
    )
  }


 
  if (page === 'admin') {
    const role = (currentUser?.role || localStorage.getItem('userRole') || '').toLowerCase()
    if (!hasAuthToken() || role !== 'admin') {
      if (window.location.hash !== '#home') window.location.hash = '#home'
      if (!showModal) setShowModal('login')
      return renderUserPage()
    }
    return <AdminApp initialPage="Dashboard" onLogout={handleLogout} onHomeClick={() => navigateTo('admin')} />
  }

  if (page === 'admin-profile') {
    const role = (currentUser?.role || localStorage.getItem('userRole') || '').toLowerCase()
    if (!hasAuthToken() || role !== 'admin') {
      if (window.location.hash !== '#home') window.location.hash = '#home'
      if (!showModal) setShowModal('login')
      return renderUserPage()
    }
    return <AdminApp initialPage="Profile" onLogout={handleLogout} onHomeClick={() => navigateTo('admin')} />
  }

  if (page === 'admin-settings') {
    const role = (currentUser?.role || localStorage.getItem('userRole') || '').toLowerCase()
    if (!hasAuthToken() || role !== 'admin') {
      if (window.location.hash !== '#home') window.location.hash = '#home'
      if (!showModal) setShowModal('login')
      return renderUserPage()
    }
    return <AdminApp initialPage="Settings" onLogout={handleLogout} onHomeClick={() => navigateTo('admin')} />
  }

  if (page === 'supplier') {
    const role = (currentUser?.role || localStorage.getItem('userRole') || '').toLowerCase()
    if (!hasAuthToken() || role !== 'supplier') {
      if (window.location.hash !== '#home') window.location.hash = '#home'
      if (!showModal) setShowModal('login')
      return renderUserPage()
    }
    return <AdminApp initialPage="Supplier Dashboard" onLogout={handleLogout} onHomeClick={() => navigateTo('supplier')} />
  }

  const hideUniversalHeaderFooter =
    page === 'user-profile' ||
    page === 'traveler-profile' ||
    page === 'travel-booking' ||
    page === 'explore' ||
    page === 'payment'

  return (
    <div className="flex flex-col min-h-screen">
      {!hideUniversalHeaderFooter && (
        <Header
          onHomeClick={() => navigateTo('home')}
          onSignupClick={handleOpenRegister}
          onSigninClick={handleOpenLogin}
          currentUser={currentUser}
          onLogout={handleLogout}
          onProfileClick={handleMyProfileClick}
          onMyRequestsClick={handleMyRequestsClick}
          onSettingsClick={handleSettingsClick}
        />
      )}

      <main className="flex-grow">
        {renderUserPage()}
      </main>

      {!hideUniversalHeaderFooter && <Footer />}

      {showNotifications && (
        <NotificationsModal
          onClose={() => setShowNotifications(false)}
          onPaymentClick={() => navigateTo('payment')}
          onViewItinerary={() => navigateTo('itinerary-view')}
        />
      )}

     
      {showModal === 'login' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-auto max-h-[90vh] overflow-auto bg-white/95 rounded-2xl shadow-2xl">
            <Login
              onRegisterClick={handleOpenRegister}
              onLoginSuccess={(role) => {
                setShowModal(null)
                const user = JSON.parse(localStorage.getItem('currentUser'))
                setCurrentUser(user)
                if (role === 'admin') {
                  navigateTo('admin')
                } else if (role === 'supplier') {
                  navigateTo('supplier')
                } else {
                  navigateTo('explore')
                }
              }}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}

      {showModal === 'register' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-auto max-h-[90vh] overflow-auto bg-white/95 rounded-2xl shadow-2xl">
            <Register
              onLoginClick={handleOpenLogin}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  )
}
