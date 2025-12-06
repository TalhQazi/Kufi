import { useState } from 'react'
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
  const [page, setPage] = useState('home')
  const [showModal, setShowModal] = useState(null) // 'login' or 'register' or null
  const [showNotifications, setShowNotifications] = useState(false)
  const [bookingData, setBookingData] = useState(null) // Store booking form data

  const handleLogout = () => {
    // Clear any stored session data
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userRole')
    // Reset to home page
    setPage('home')
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
        onActivityClick={() => setPage('activity-detail')}
        onNotificationClick={() => setShowNotifications(true)}
        onAddToList={() => setPage('travel-booking')}
        onProfileClick={() => setPage('user-profile')}
      />
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
    </>
  )

  if (page === 'user-profile') return (
    <UserDashboard
      onLogout={handleLogout}
      onBack={() => setPage('explore')}
    />
  )

  if (page === 'activity-detail') return (
    <>
      <ActivityDetail
        onLogout={handleLogout}
        onBack={() => setPage('explore')}
        onNotificationClick={() => setShowNotifications(true)}
        onAddToList={() => setPage('travel-booking')}
      />
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
    </>
  )

  if (page === 'travel-booking') return (
    <TravelBooking
      onLogout={handleLogout}
      onBack={() => setPage('explore')}
      onSubmit={(data) => {
        setBookingData(data)
        setPage('booking-confirmation')
      }}
    />
  )

  if (page === 'booking-confirmation') return (
    <BookingConfirmation
      bookingData={bookingData}
      onContinueBrowsing={() => setPage('explore')}
      onGoToCart={() => setPage('payment')}
    />
  )

  if (page === 'payment') return (
    <Payment
      bookingData={bookingData}
      onBack={() => setPage('booking-confirmation')}
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
                  setPage('admin')
                } else if (role === 'supplier') {
                  setPage('supplier')
                } else {
                  setPage('explore')
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
