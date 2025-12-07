import { useState, useEffect } from 'react'
import HomePage from './pages/userpannel/HomePage.jsx'
import Login from './pages/userpannel/Login.jsx'
import Register from './pages/userpannel/Register.jsx'
import Explore from './pages/userpannel/Explore.jsx'
import UserDashboard from './pages/userpannel/UserDashboard.jsx'
import ActivityDetail from './pages/userpannel/ActivityDetail.jsx'
import NotificationsModal from './pages/userpannel/NotificationsModal.jsx'
import TravelBooking from './pages/userpannel/TravelBooking.jsx'
import BookingConfirmation from './pages/userpannel/BookingConfirmation.jsx'
import Payment from './pages/userpannel/Payment.jsx'
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
        onLogout={handleLogout}
        onActivityClick={() => navigateTo('activity-detail')}
        onNotificationClick={() => setShowNotifications(true)}
        onAddToList={() => navigateTo('travel-booking')}
        onProfileClick={() => navigateTo('user-profile')}
        onBack={goBack}
        onForward={goForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
      />
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
    </>
  )

  if (page === 'user-profile') return (
    <UserDashboard
      onLogout={handleLogout}
      onBack={goBack}
      onForward={goForward}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
    />
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
        onAddToList={() => navigateTo('travel-booking')}
      />
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
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
        navigateTo('booking-confirmation')
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

  return (
    <>
      <HomePage onSignupClick={handleOpenRegister} onSigninClick={handleOpenLogin} />

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
