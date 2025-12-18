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
import './App.css'

const AdminApp = ({ initialPage = 'Dashboard', onLogout, onHomeClick }) => {
  const [activePage, setActivePage] = useState(initialPage)

  const renderPage = () => {
    if (activePage === 'Dashboard') return <Dashboard />
    if (activePage.startsWith('Activity')) {
      if (activePage === 'Activity/Add') return <AddActivity />
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
    return <Dashboard />
  }

  return (
    <div className="app-root bg-[#f5f6fb] min-h-screen md:h-screen flex flex-col md:flex-row overflow-hidden">
      {activePage !== 'Supplier Dashboard' && (
        <Sidebar activePage={activePage} onSelect={setActivePage} onLogout={onLogout} onHomeClick={onHomeClick} />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activePage !== 'Supplier Dashboard' && (
          <Header
            onBellClick={() => setActivePage('Booking Notifications')}
            onLogout={onLogout}
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

