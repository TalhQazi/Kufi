import { useState } from 'react'

export default function Register({ onLoginClick }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (form.password !== form.confirmPassword) {
      alert('Password and Confirm Password must match.')
      return
    }

    const stored = localStorage.getItem('kufiUsers')
    const users = stored ? JSON.parse(stored) : []

    const newUser = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: form.role === 'supplier' ? 'supplier' : 'user',
    }

    users.push(newUser)
    localStorage.setItem('kufiUsers', JSON.stringify(users))

    alert('Account created successfully (saved locally). You can now log in.')

    if (onLoginClick) onLoginClick()
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.1fr_1.3fr] bg-slate-200">
      {/* Left Side */}
      <div className="bg-[#B9B9B9] flex items-center justify-center py-10 px-6 md:px-12">
        <div className="max-w-[320px]">
          <h1 className="text-[38px] font-bold text-slate-50 m-0 mb-4">Create Your Account</h1>
          <p className="text-sm text-slate-200 m-0 mb-10">
            Join Kufi Travel to manage your bookings, discover new destinations, and save your
            favorite experiences.
          </p>

          <div className="flex flex-col gap-3 text-[11px] text-slate-50">
            <div className="flex gap-2">
              <span className="w-[26px] h-[26px] rounded-full border border-slate-50/70 flex items-center justify-center text-[11px]">f</span>
              <span className="w-[26px] h-[26px] rounded-full border border-slate-50/70 flex items-center justify-center text-[11px]">in</span>
              <span className="w-[26px] h-[26px] rounded-full border border-slate-50/70 flex items-center justify-center text-[11px]">ig</span>
              <span className="w-[26px] h-[26px] rounded-full border border-slate-50/70 flex items-center justify-center text-[11px]">yt</span>
            </div>
            <div className="flex items-center gap-2.5">
              <img src="/src/assets/navbar.png" alt="Kufi Travel" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
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
      <div className="bg-beige-light py-8 px-6 md:px-14 flex flex-col">
        <header className="flex justify-end items-center gap-4 mb-6">
          <div className="text-sm text-slate-500">EN ▼</div>
          <button className="border-none bg-transparent text-[22px] cursor-pointer">☰</button>
        </header>

        <div className="bg-white rounded-2xl md:rounded-l-[28px] py-8 px-6 md:px-10 md:ml-10 shadow-lg">
          <h2 className="m-0 mb-2 text-[28px] font-bold text-slate-900">Register</h2>
          <p className="m-0 mb-6 text-sm text-slate-600">
            Fill in your details below to create a new account and start your journey.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Full Name</span>
              <input
                type="text"
                name="name"
                className="py-2.5 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-primary-brown transition-colors text-sm"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <div className="flex flex-col gap-1.5 text-xs text-slate-700">
              <span className="text-xs text-slate-500">Register as</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                    form.role === 'user'
                      ? 'bg-primary-brown text-white border-primary-brown'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  onClick={() => setForm((prev) => ({ ...prev, role: 'user' }))}
                >
                  User
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                    form.role === 'supplier'
                      ? 'bg-primary-brown text-white border-primary-brown'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  onClick={() => setForm((prev) => ({ ...prev, role: 'supplier' }))}
                >
                  Supplier
                </button>
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Email Address</span>
              <input
                type="email"
                name="email"
                className="py-2.5 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-primary-brown transition-colors text-sm"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Phone Number</span>
              <input
                type="tel"
                name="phone"
                className="py-2.5 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-primary-brown transition-colors text-sm"
                value={form.phone}
                onChange={handleChange}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Password</span>
              <input
                type="password"
                name="password"
                className="py-2.5 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-primary-brown transition-colors text-sm"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                className="py-2.5 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-primary-brown transition-colors text-sm"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>

            <button type="submit" className="mt-2 py-3 rounded-lg bg-primary-brown text-white font-semibold text-sm hover:bg-primary-dark transition-colors">
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?
            <button
              type="button"
              className="ml-1 bg-transparent border-none text-primary-brown font-semibold cursor-pointer hover:underline"
              onClick={onLoginClick}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
