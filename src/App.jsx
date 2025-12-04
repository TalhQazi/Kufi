import { useState } from 'react'
import HomePage from './pages/userpannel/HomePage.jsx'
import Login from './pages/userpannel/Login.jsx'
import Register from './pages/userpannel/Register.jsx'
import Explore from './pages/userpannel/Explore.jsx'
import AdminApp from './AdminApp.jsx'

export default function App() {
  const [page, setPage] = useState('home')
  const [showModal, setShowModal] = useState(null) // 'login' or 'register' or null

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

  if (page === 'explore') return <Explore onLogout={handleLogout} />

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
