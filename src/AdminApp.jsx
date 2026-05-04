import * as React from 'react'
const { useState, useEffect, useCallback, useMemo, useRef } = React
import Sidebar from './pages/adminpannel/components/Sidebar'
import Header from './pages/adminpannel/components/Header'
import Dashboard from './pages/adminpannel/dashboard'
import Activity from './pages/adminpannel/activity'
import AddActivity from './pages/adminpannel/add-activity'
import Blogs from './pages/adminpannel/blogs'
import AddBlog from './pages/adminpannel/add-blog'
import UserManagement from './pages/adminpannel/user-management'
import SupplierManagement from './pages/adminpannel/SupplierManagement'
import Analytics from './pages/adminpannel/analytics'
import PaymentsFinance from './pages/adminpannel/payments-finance'
import SystemNotification from './pages/adminpannel/system-notification'
import SupplierDashboard from './pages/supplierpannel/supplier-dashboard'
import NotificationsBooking from './pages/adminpannel/notifications-booking'
import CountryManagement from './pages/adminpannel/CountryManagement'
import CityManagement from './pages/adminpannel/CityManagement'
import CategoryManagement from './pages/adminpannel/CategoryManagement'
import ReviewController from './pages/adminpannel/ReviewController'
import BookingTermsController from './pages/adminpannel/BookingTermsController'
import FooterController from './pages/adminpannel/FooterController'
import HeaderController from './pages/adminpannel/HeaderController'
import SectionVisibilityController from './pages/adminpannel/SectionVisibilityController'
import LegalContentController from './pages/adminpannel/LegalContentController'
import MemberRequests from './pages/adminpannel/MemberRequests'
import AdminProfile from './pages/adminpannel/AdminProfile'
import AdminSettings from './pages/adminpannel/AdminSettings'
import EmailSettings from './pages/adminpannel/EmailSettings'
import './App.css'


const AdminApp = ({ initialPage = 'Dashboard', onLogout, onHomeClick }) => {
  const [activePage, setActivePage] = useState(initialPage)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('currentUser'))
        const role = storedUser?.role || localStorage.getItem('userRole')
        
        if (role !== 'admin') return

        const [statsRes, activityRes] = await Promise.all([
          import('./api').then(m => m.default.get('/admin/stats')),
          import('./api').then(m => m.default.get('/admin/activity'))
        ])
        setNotificationCount(statsRes.data?.unreadNotifications || 0)
        setNotifications(Array.isArray(activityRes.data?.activities) ? activityRes.data.activities.slice(0, 5) : [])
      } catch (err) {
        console.error('Error fetching admin data:', err)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const markNotificationsRead = async () => {
    try {
      await import('./api').then(m => m.default.post('/admin/notifications/read'))
      setNotificationCount(0)
    } catch (err) {
      console.error('Error marking notifications read:', err)
    }
  }

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible)
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  const renderPage = () => {
    if (activePage === 'Dashboard') return <Dashboard onNavigate={setActivePage} />
    if (activePage.startsWith('Activity')) {
      if (activePage === 'Activity/Add') return <AddActivity onBack={() => setActivePage('Activity')} />
      return <Activity onAddNew={() => setActivePage('Activity/Add')} />
    }
    if (activePage.startsWith('Blogs')) {
      if (activePage === 'Blogs/Add') return <AddBlog onBack={() => setActivePage('Blogs')} />
      return <Blogs onAddNew={() => setActivePage('Blogs/Add')} />
    }
    if (activePage === 'User Management') return <UserManagement />
    if (activePage === 'Manage Supplier') return <SupplierManagement />
    if (activePage === 'Analytics') return <Analytics />
    if (activePage === 'Payments & Finance') return <PaymentsFinance />
    if (activePage === 'System Notification')
      return (
        <SystemNotification
          onViewDetails={() => setActivePage('Booking Notifications')}
        />
      )
    if (activePage === 'Supplier Dashboard') return <SupplierDashboard onLogout={onLogout} onHomeClick={onHomeClick} />
    if (activePage === 'Booking Notifications') return <NotificationsBooking />
    if (activePage === 'Manage Countries') return <CountryManagement />
    if (activePage === 'Manage Cities') return <CityManagement />
    if (activePage === 'Manage Categories') return <CategoryManagement />
    if (activePage === 'Reviews') return <ReviewController />
    if (activePage === 'Booking Terms') return <BookingTermsController />
    if (activePage === 'Footer') return <FooterController />
    if (activePage === 'Header') return <HeaderController />
    if (activePage === 'Sections') return <SectionVisibilityController />
    if (activePage === 'Legal Content') return <LegalContentController darkMode={isDarkMode} />
    if (activePage === 'Become a member') return <MemberRequests darkMode={isDarkMode} />
    if (activePage === 'Profile') return <AdminProfile />
    if (activePage === 'Settings') return <AdminSettings />
    if (activePage === 'Email Settings') return <EmailSettings />
    return <Dashboard />

  }

  return (
    <div className={`app-root min-h-screen md:h-screen flex flex-col md:flex-row overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-950' : 'bg-[#f5f6fb]'}`}>
      {activePage !== 'Supplier Dashboard' && (
        <Sidebar
          activePage={activePage}
          onSelect={setActivePage}
          onLogout={onLogout}
          onHomeClick={onHomeClick}
          isVisible={sidebarVisible}
          isDarkMode={isDarkMode}
        />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activePage !== 'Supplier Dashboard' && (
          <Header
            notificationCount={notificationCount}
            notifications={notifications}
            onBellClick={() => {
              setActivePage('Booking Notifications')
              markNotificationsRead()
            }}
            onMarkAsRead={markNotificationsRead}
            onLogout={onLogout}
            onMenuClick={toggleSidebar}
            isDarkMode={isDarkMode}
            onThemeToggle={toggleDarkMode}
            onProfileClick={() => setActivePage('Profile')}
            onSettingsClick={() => setActivePage('Settings')}
          />
        )}

        <main
          className={
            activePage === 'Supplier Dashboard'
              ? 'flex-1 overflow-y-auto'
              : 'flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 overflow-y-auto'
          }
        >
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default AdminApp

