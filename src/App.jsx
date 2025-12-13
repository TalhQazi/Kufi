import { useState, useEffect } from 'react'
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
import AdminApp from './AdminApp.jsx'

export default function App() {
  // Get initial page from URL or default to 'home'
  const getInitialPage = () => {
    const path = window.location.hash.slice(1) || 'home'
    return path
  }

  const [page, setPage] = useState(getInitialPage())
  const [showModal, setShowModal] = useState(null) // 'login' or 'register' or null
  const [showNotifications, setShowNotifications] = useState(false)
  const [bookingData, setBookingData] = useState(null) // Store booking form data
  const [selectedActivities, setSelectedActivities] = useState([]) // Store selected activities for user profile

  // Navigation history state (for custom buttons)
  const [history, setHistory] = useState([getInitialPage()])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPopState, setIsPopState] = useState(false)

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      const newPage = event.state?.page || 'home'
      setIsPopState(true)
      setPage(newPage)

      // Update our internal history tracking
      const pageIndex = history.indexOf(newPage)
      if (pageIndex !== -1) {
        setCurrentIndex(pageIndex)
      }
    }

    window.addEventListener('popstate', handlePopState)

    // Set initial state if not already set
    if (!window.history.state) {
      window.history.replaceState({ page: page }, '', `#${page}`)
    }

    return () => window.removeEventListener('popstate', handlePopState)
  }, [history, page])

  const handleLogout = () => {
    // Clear any stored session data
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userRole')
    // Reset to home page and clear history
    setHistory(['home'])
    setCurrentIndex(0)
    setPage('home')
    window.history.pushState({ page: 'home' }, '', '#home')
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

  const handleAddToList = (activity) => {
    setSelectedActivities(prev => {
      // Check if activity already exists
      const exists = prev.find(a => a.id === activity.id)
      if (exists) return prev
      return [...prev, activity]
    })
    // Navigate to explore page to show the selection
    navigateTo('explore')
  }

  const handleRemoveFromList = (activityId) => {
    setSelectedActivities(prev => prev.filter(a => a.id !== activityId))
  }

  // Navigation functions
  const navigateTo = (newPage) => {
    // Don't navigate if we're already on this page
    if (page === newPage) return

    // If we're not at the end of history, remove forward history
    const newHistory = history.slice(0, currentIndex + 1)
    newHistory.push(newPage)
    setHistory(newHistory)
    setCurrentIndex(newHistory.length - 1)
    setPage(newPage)

    // Update browser history
    window.history.pushState({ page: newPage }, '', `#${newPage}`)

    // Scroll to top when navigating to a new page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      const prevPage = history[newIndex]
      setCurrentIndex(newIndex)
      setPage(prevPage)

      // Use browser back if possible, otherwise manually update
      window.history.back()
    }
  }

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      const nextPage = history[newIndex]
      setCurrentIndex(newIndex)
      setPage(nextPage)

      // Use browser forward
      window.history.forward()
    }
  }

  const canGoBack = currentIndex > 0
  const canGoForward = currentIndex < history.length - 1


  // simple routing
  if (page === 'admin') {
    return <AdminApp initialPage="Dashboard" onLogout={handleLogout} />
  }

  if (page === 'supplier') {
    return <AdminApp initialPage="Supplier Dashboard" onLogout={handleLogout} />
  }

  if (page === 'explore') return (
    <>
      <Explore
        selectedActivities={selectedActivities}
        onAddToList={(activity) => handleAddToList(activity)}
        onRemoveActivity={handleRemoveFromList}
        onLogout={handleLogout}
        onActivityClick={() => navigateTo('activity-detail')}
        onCategoryClick={() => navigateTo('category-page')}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={() => navigateTo('user-profile')}
        onSettingsClick={() => navigateTo('traveler-profile')}
        onSendRequest={() => navigateTo('travel-booking')}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onHomeClick={() => navigateTo('home')}
      />
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} onPaymentClick={() => navigateTo('payment')} onViewItinerary={() => navigateTo('itinerary-view')} />}
    </>
  )

  if (page === 'country-details') return (
    <>
      <CountryDetails
        countryName="Italy"
        onLogout={handleLogout}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={() => navigateTo('user-profile')}
        onActivityClick={() => navigateTo('activity-detail')}
        onBack={goBack}
        onHomeClick={() => navigateTo('home')}
        onSettingsClick={() => navigateTo('traveler-profile')}
      />
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} onPaymentClick={() => navigateTo('payment')} onViewItinerary={() => navigateTo('itinerary-view')} />}
    </>
  )

  if (page === 'category-page') return (
    <>
      <CategoryPage
        categoryName="Camping Adventures"
        onLogout={handleLogout}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={() => navigateTo('user-profile')}
        onActivityClick={() => navigateTo('activity-detail')}
        onBack={goBack}
        onHomeClick={() => navigateTo('home')}
        onSettingsClick={() => navigateTo('traveler-profile')}
      />
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} onPaymentClick={() => navigateTo('payment')} onViewItinerary={() => navigateTo('itinerary-view')} />}
    </>
  )

  if (page === 'user-profile') return (
    <>
      <UserDashboard
        onLogout={handleLogout}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onExploreClick={() => navigateTo('explore')}
        onItineraryClick={() => navigateTo('itinerary-view')}
        onHomeClick={() => navigateTo('home')}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={() => navigateTo('user-profile')}
        onSettingsClick={() => navigateTo('traveler-profile')}
        onCountryClick={() => navigateTo('country-details')}
      />
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} onPaymentClick={() => navigateTo('payment')} onViewItinerary={() => navigateTo('itinerary-view')} />}
    </>
  )

  if (page === 'activity-detail') return (
    <>
      <ActivityDetail
        onLogout={handleLogout}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onNotificationClick={() => setShowNotifications(true)}
        onAddToList={(activityData) => handleAddToList(activityData)}
      />
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} onPaymentClick={() => navigateTo('payment')} onViewItinerary={() => navigateTo('itinerary-view')} />}
    </>
  )

  if (page === 'travel-booking') return (
    <TravelBooking
      onLogout={handleLogout}
      onBack={goBack}
      onForward={goForward}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
      onSubmit={(data) => {
        setBookingData(data)
        navigateTo('explore')
      }}
    />
  )

  if (page === 'booking-confirmation') return (
    <BookingConfirmation
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
      bookingData={bookingData}
      onBack={goBack}
      onForward={goForward}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
    />
  )

  if (page === 'itinerary-view') return (
    <>
      <ItineraryView
        onBack={goBack}
        onPaymentClick={() => navigateTo('payment')}
        onRequestAdjustment={() => alert('Adjustment request sent!')}
        onLogout={handleLogout}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={() => navigateTo('user-profile')}
        onSettingsClick={() => navigateTo('traveler-profile')}
        onHomeClick={() => navigateTo('home')}
      />
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} onPaymentClick={() => navigateTo('payment')} onViewItinerary={() => navigateTo('itinerary-view')} />}
    </>
  )

  if (page === 'traveler-profile') return (
    <>
      <TravelerProfile
        onBack={goBack}
        onLogout={handleLogout}
        onProfileClick={() => navigateTo('user-profile')}
        onSettingsClick={() => navigateTo('traveler-profile')}
        onHomeClick={() => navigateTo('home')}
      />
    </>
  )

  return (
    <>
      <HomePage
        onSignupClick={handleOpenRegister}
        onSigninClick={handleOpenLogin}
        onCategoryClick={() => navigateTo('category-page')}
        onCountryClick={() => navigateTo('country-details')}
      />

      {/* Login Modal */}
      {showModal === 'login' && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-auto max-h-[90vh] overflow-auto bg-white/95 rounded-2xl shadow-2xl">
            <Login
              onRegisterClick={handleOpenRegister}
              onLoginSuccess={(role) => {
                setShowModal(null)
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

      {/* Register Modal */}
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
    </>
  )
}
