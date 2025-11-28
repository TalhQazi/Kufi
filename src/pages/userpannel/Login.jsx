import { useState } from 'react'

const ADMIN_EMAIL = 'admin@kufi.com'
const ADMIN_PASSWORD = 'Admin@123'

export default function Login({ onRegisterClick, onLoginSuccess }) {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')

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
    <div className="min-h-screen grid grid-cols-[1.1fr_1.3fr] bg-slate-200">
      {/* Left Side */}
      <div className="bg-[#B9B9B9] flex items-center justify-center py-10 px-12">
        <div className="max-w-[320px]">
          <h1 className="text-[38px] font-bold text-slate-50 m-0 mb-4">Seamless Booking Starts Here!</h1>
          <p className="text-sm text-slate-200 m-0 mb-10">
            Access your account to view upcoming stays, modify bookings, and enjoy a hassle-free
            experience.
          </p>

          <div className="flex flex-col gap-3 text-[11px] text-slate-50">
            <div className="flex gap-2">
              <span className="w-[26px] h-[26px] rounded-full border border-slate-50/70 flex items-center justify-center text-[11px]">f</span>
              <span className="w-[26px] h-[26px] rounded-full border border-slate-50/70 flex items-center justify-center text-[11px]">in</span>
              <span className="w-[26px] h-[26px] rounded-full border border-slate-50/70 flex items-center justify-center text-[11px]">ig</span>
              <span className="w-[26px] h-[26px] rounded-full border border-slate-50/70 flex items-center justify-center text-[11px]">yt</span>
            </div>
            <div className="flex items-center gap-2.5">
              <img src="/src/assets/navbar.png" alt="Kufi Travel" className="w-10 h-10 object-contain" />
              <div className="leading-tight">
                <p className="m-0 text-sm font-semibold">Kufi</p>
                <p className="m-0 text-sm font-semibold">Travel</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="bg-beige-light py-8 px-14 flex flex-col">
        <header className="flex justify-end items-center gap-4 mb-6">
          <div className="text-sm text-slate-500">EN ▼</div>
          <button className="border-none bg-transparent text-[22px] cursor-pointer">☰</button>
        </header>

        <div className="bg-white rounded-l-[28px] py-8 px-10 ml-10 shadow-lg">
          <h2 className="m-0 mb-2 text-[28px] font-bold text-slate-900">Hello!</h2>
          <p className="m-0 mb-6 text-sm text-slate-600">
            Sign in now to explore a world of curated information tailored to your interests.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Enter your email or username</span>
              <input
                type="text"
                className="py-2.5 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-primary-brown transition-colors text-sm"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Enter your password</span>
              <input
                type="password"
                className="py-2.5 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-primary-brown transition-colors text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="cursor-pointer" />
                <span className="text-slate-700">Remember Me</span>
              </label>
              <button type="button" className="bg-transparent border-none text-primary-brown cursor-pointer hover:underline">
                Forgot Password?
              </button>
            </div>

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

            <button type="submit" className="mt-2 py-3 rounded-lg bg-primary-brown text-white font-semibold text-sm hover:bg-primary-dark transition-colors">
              Sign In
            </button>
          </form>

          <div className="relative my-6 text-center text-xs text-slate-400 before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-full before:h-px before:bg-slate-200 after:content-['Or_continue_with'] after:px-3 after:bg-white after:relative after:z-10">
          </div>

          <div className="flex gap-4">
            <button type="button" className="flex-1 py-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-center gap-2 text-sm hover:bg-slate-50 transition-colors cursor-pointer">
              <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">G</span>
              <span className="font-medium">Google</span>
            </button>
            <button type="button" className="flex-1 py-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-center gap-2 text-sm hover:bg-slate-50 transition-colors cursor-pointer">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">f</span>
              <span className="font-medium">Facebook</span>
            </button>
          </div>

          {role !== 'admin' && (
            <div className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t you have an account?
              <button
                type="button"
                className="ml-1 bg-transparent border-none text-primary-brown font-semibold cursor-pointer hover:underline"
                onClick={onRegisterClick}
              >
                Register Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
