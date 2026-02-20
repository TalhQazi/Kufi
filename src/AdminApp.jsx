import React, { useState } from 'react'
import Sidebar from './pages/adminpannel/components/Sidebar'
import Header from './pages/adminpannel/components/Header'
import Dashboard from './pages/adminpannel/dashboard'
import Activity from './pages/adminpannel/activity'
import AddActivity from './pages/adminpannel/add-activity'
import UserManagement from './pages/adminpannel/user-management'
import Analytics from './pages/adminpannel/analytics'
import PaymentsFinance from './pages/adminpannel/payments-finance'
import SystemNotification from './pages/adminpannel/system-notification'
import SupplierDashboard from './pages/supplierpannel/supplier-dashboard'
import NotificationsBooking from './pages/adminpannel/notifications-booking'
import CountryManagement from './pages/adminpannel/CountryManagement'
import CityManagement from './pages/adminpannel/CityManagement'
import CategoryManagement from './pages/adminpannel/CategoryManagement'
import AdminProfile from './pages/adminpannel/AdminProfile'
import AdminSettings from './pages/adminpannel/AdminSettings'
import './App.css'


const AdminApp = ({ initialPage = 'Dashboard', onLogout, onHomeClick }) => {
  const [activePage, setActivePage] = useState(initialPage)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible)
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  const renderPage = () => {
    if (activePage === 'Dashboard') return <Dashboard onNavigate={setActivePage} />
    if (activePage.startsWith('Activity')) {
      if (activePage === 'Activity/Add') return <AddActivity onBack={() => setActivePage('Activity')} />
      return <Activity onAddNew={() => setActivePage('Activity/Add')} />
    }
    if (activePage === 'User Management') return <UserManagement />
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
    if (activePage === 'Manage Countries') return <CountryManagement />
    if (activePage === 'Manage Cities') return <CityManagement />
    if (activePage === 'Manage Categories') return <CategoryManagement />
    if (activePage === 'Profile') return <AdminProfile />
    if (activePage === 'Settings') return <AdminSettings />
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
            onBellClick={() => setActivePage('Booking Notifications')}
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

