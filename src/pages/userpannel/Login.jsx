import { useState } from 'react'

const ADMIN_EMAIL = 'admin@kufi.com'
const ADMIN_PASSWORD = 'Admin@123'

export default function Login({ onRegisterClick, onLoginSuccess }) {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!emailOrUsername || !password) {
      alert('Please enter both email/username and password.')
      return
    }

    if (role === 'admin') {
      const isAdminMatch =
        (emailOrUsername === ADMIN_EMAIL || emailOrUsername === 'admin') &&
        password === ADMIN_PASSWORD

      if (!isAdminMatch) {
        alert('Invalid admin credentials.')
        return
      }

      if (onLoginSuccess) onLoginSuccess('admin')
      return
    }

    const stored = localStorage.getItem('kufiUsers')
    const users = stored ? JSON.parse(stored) : []

    const match = users.find((u) => {
      const identifierMatch =
        u.email === emailOrUsername || u.name === emailOrUsername
      const passwordMatch = u.password === password
      const roleMatch = (u.role || 'user') === role
      return identifierMatch && passwordMatch && roleMatch
    })

    if (!match) {
      alert('Invalid credentials for this role. Please check your details.')
      return
    }

    if (onLoginSuccess) onLoginSuccess(role)
  }

  return (
  <div className="min-h-screen grid grid-cols-1 md:grid-cols-[2fr_3fr] bg-white">
      {/* Left Side */}
      <div className="bg-[#B9B9B9] flex items-center justify-center py-10 px-6 md:px-12 rounded-tl-[28px] rounded-bl-[28px]">
        <div className="max-w-[380px]">
          <h1 className="text-[38px] font-bold text-white m-0 mb-4">Seamless Booking Starts Here!</h1>
          <p className="text-sm text-white m-0 mb-12">
            Access your account to view upcoming stays, modify bookings, and enjoy a hassle-free
            experience.
          </p>

          <div className="flex flex-col gap-5 text-sm text-white">
            <div className="flex gap-3">
              <span className="w-[36px] h-[36px] rounded-full bg-primary-brown text-white flex items-center justify-center text-sm font-bold">f</span>
              <span className="w-[36px] h-[36px] rounded-full bg-primary-brown text-white flex items-center justify-center text-base">🐦</span>
              <span className="w-[36px] h-[36px] rounded-full bg-primary-brown text-white flex items-center justify-center text-base">📷</span>
              <span className="w-[36px] h-[36px] rounded-full bg-primary-brown text-white flex items-center justify-center text-base">▶</span>
            </div>
            <div className="flex items-center gap-3">
              <img src="/assets/navbar.png" alt="Kufi Travel" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
              <div className="leading-tight">
                <p className="m-0 text-lg font-semibold">Kufi</p>
                <p className="m-0 text-lg font-semibold">Travel</p>
              </div>
            </div>
            <div className="flex gap-6">
              <span className="cursor-pointer hover:underline text-sm">Privacy Policy</span>
              <span className="cursor-pointer hover:underline text-sm">Terms of Service</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="bg-white py-8 px-6 md:px-14 flex flex-col">
        <header className="flex justify-end items-center gap-4 mb-6">
          <span className="text-lg">🌐</span>
          <div className="text-sm text-slate-500">EN V</div>
          <button className="border-none bg-transparent text-[22px] cursor-pointer">☰</button>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="m-0 mb-2 text-[28px] font-bold text-slate-900">Hello!</h2>
            <p className="m-0 mb-8 text-sm text-slate-600">
              Sign in now to explore a world of curated information tailored to your interests!
            </p>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 text-base">✉</span>
                <input
                  type="text"
                  placeholder="Enter your email or username"
                  className="w-full py-2.5 pl-8 pr-0 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-primary-brown transition-colors text-sm text-slate-900 placeholder:text-slate-400"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                />
              </div>

              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 text-base">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full py-2.5 pl-8 pr-8 border-0 border-b border-slate-300 bg-transparent focus:outline-none focus:border-primary-brown transition-colors text-sm text-slate-900 placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-slate-700 text-base"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <span className="text-lg">👁️</span>
                  ) : (
                    <span className="text-lg">👁️‍🗨️</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="cursor-pointer" />
                  <span className="text-slate-700">Remember Me</span>
                </label>
                <button type="button" className="bg-transparent border-none text-primary-brown cursor-pointer hover:underline">
                  Forgot Password?
                </button>
              </div>

              {/* Hidden role selector for functionality - can be shown via a toggle if needed */}
              <div className="hidden">
                <div className="mt-3 flex flex-col gap-2 text-xs text-slate-700">
                  <span className="font-semibold">Login as</span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                        role === 'admin'
                          ? 'bg-primary-brown text-white border-primary-brown'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                      onClick={() => setRole('admin')}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                        role === 'supplier'
                          ? 'bg-primary-brown text-white border-primary-brown'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                      onClick={() => setRole('supplier')}
                    >
                      Supplier
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                        role === 'user'
                          ? 'bg-primary-brown text-white border-primary-brown'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                      onClick={() => setRole('user')}
                    >
                      User
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="mt-2 py-3 rounded-lg bg-primary-brown text-white font-semibold text-sm hover:bg-primary-dark transition-colors w-full">
                Sign In
              </button>
            </form>

            <div className="relative my-6 text-center text-xs text-slate-400 before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-full before:h-px before:bg-slate-200 after:content-['Or_continue_with'] after:px-3 after:bg-white after:relative after:z-10">
            </div>

            <div className="flex gap-4">
              <button type="button" className="flex-1 py-2.5 rounded-lg border border-primary-brown bg-white flex items-center justify-center gap-2 text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">G</span>
                <span className="font-medium">Google</span>
              </button>
              <button type="button" className="flex-1 py-2.5 rounded-lg border border-primary-brown bg-white flex items-center justify-center gap-2 text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">f</span>
                <span className="font-medium">Facebook</span>
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t you have an account?{' '}
              <button
                type="button"
                className="bg-transparent border-none text-primary-brown font-semibold cursor-pointer hover:underline"
                onClick={onRegisterClick}
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
