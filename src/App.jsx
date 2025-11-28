import { useState } from 'react'
import HomePage from './pages/userpannel/HomePage'
import Login from './pages/userpannel/Login'
import Register from './pages/userpannel/Register'
import Explore from './pages/userpannel/Explore'
import AdminApp from './AdminApp'

export default function App() {
  const [page, setPage] = useState('home')

  // simple routing
  if (page === 'login') {
    return (
      <Login
        onRegisterClick={() => setPage('register')}
        onLoginSuccess={(role) => {
          if (role === 'admin') {
            setPage('admin')
          } else if (role === 'supplier') {
            setPage('supplier')
          } else {
            setPage('explore')
          }
        }}
      />
    )
  }

  if (page === 'register') {
    return <Register onLoginClick={() => setPage('login')} />
  }

  if (page === 'admin') {
    return <AdminApp initialPage="Dashboard" />
  }

  if (page === 'supplier') {
    return <AdminApp initialPage="Supplier Dashboard" />
  }

  if (page === 'explore') return <Explore />

  return <HomePage onSignupClick={() => setPage('login')} />
}
