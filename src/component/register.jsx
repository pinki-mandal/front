import { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = "http://localhost:5000/api"

function Register() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [pendingOtp, setPendingOtp] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    otp: '',
    newPassword: '',
  })

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
      })
      setMessage(response.data.message)
      setPendingOtp({ type: 'register', email: form.email, phone: form.phone })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const completeRegistration = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/set-password`, {
        email: form.email,
        phone: form.phone,
        otp: form.otp,
        password: form.password,
      })
      setMessage(response.data.message)
      setPendingOtp(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete registration')
    } finally {
      setLoading(false)
    }
  }

  const loginWithPassword = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login-password`, {
        email: form.email,
        password: form.password,
      })
      if (response.data.requiresOtp) {
        setPendingOtp({ type: 'login-password', email: form.email })
        setMessage(response.data.message)
      } else {
        setUser(response.data.user)
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        setMessage('Signed in successfully')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const sendEmailOtp = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login-otp`, { email: form.email })
      setPendingOtp({ type: 'email-otp', email: form.email })
      setMessage(response.data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const sendPhoneOtp = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/phone-otp`, { phone: form.phone })
      setPendingOtp({ type: 'phone-otp', phone: form.phone })
      setMessage(response.data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send phone OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const endpoint = pendingOtp?.type === 'phone-otp' ? `${API_BASE_URL}/auth/verify-login-otp` : `${API_BASE_URL}/auth/verify-login-otp`
      const payload = pendingOtp?.type === 'phone-otp'
        ? { phone: pendingOtp.phone, otp: form.otp }
        : { email: pendingOtp.email, otp: form.otp }

      const response = await axios.post(endpoint, payload)
      setUser(response.data.user)
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      setMessage('OTP verified successfully')
      setPendingOtp(null)
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const sendForgotPasswordOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email: form.email })
      setPendingOtp({ type: 'forgot-password', email: form.email })
      setMessage(response.data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reset OTP')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      })
      setMessage(response.data.message)
      setPendingOtp(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
        email: pendingOtp?.email,
        phone: pendingOtp?.phone,
      })
      setMessage(response.data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      setMessage('Logged out')
    } catch (err) {
      setError(err.response?.data?.message || 'Logout failed')
    }
  }

  const tabStyle = (tabName) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${mode === tabName ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'}`

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.3),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#111827_100%)] px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <div className="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl lg:w-[45%]">
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-300">Authentication Suite</p>
            <h1 className="text-4xl font-semibold sm:text-5xl">Secure sign-in and registration flows</h1>
            <p className="max-w-xl text-sm text-slate-400 sm:text-base">
              This UI covers registration, OTP verification, password login, email and phone OTP login, forgot password, and token-based sessions.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => { setMode('login'); setPendingOtp(null); setError(''); setMessage('') }} className={tabStyle('login')}>Login</button>
            <button type="button" onClick={() => { setMode('register'); setPendingOtp(null); setError(''); setMessage('') }} className={tabStyle('register')}>Register</button>
            <button type="button" onClick={() => { setMode('forgot'); setPendingOtp(null); setError(''); setMessage('') }} className={tabStyle('forgot')}>Forgot Password</button>
          </div>

          {message ? <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div> : null}
          {error ? <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}

          {mode === 'register' ? (
            <form onSubmit={pendingOtp?.type === 'register' ? completeRegistration : handleRegister} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
                  <span className="mb-2 block">Name</span>
                  <input name="name" value={form.name} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-400" placeholder="Ava Stone" />
                </label>
                <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
                  <span className="mb-2 block">Email</span>
                  <input name="email" type="email" value={form.email} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="you@example.com" />
                </label>
                <label className="block text-sm font-medium text-slate-300 sm:col-span-2">
                  <span className="mb-2 block">Phone</span>
                  <input name="phone" value={form.phone} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="+1234567890" />
                </label>
              </div>

              {pendingOtp?.type === 'register' ? (
                <>
                  <label className="block text-sm font-medium text-slate-300">
                    <span className="mb-2 block">OTP</span>
                    <input name="otp" value={form.otp} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="123456" />
                  </label>
                  <label className="block text-sm font-medium text-slate-300">
                    <span className="mb-2 block">Password</span>
                    <input name="password" type="password" value={form.password} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="StrongPassword1!" />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={loading} className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Working...' : 'Complete Registration'}</button>
                    <button type="button" onClick={resendOtp} disabled={loading} className="rounded-2xl border border-slate-600 px-5 py-3 font-semibold text-slate-200 transition hover:border-indigo-400 hover:text-indigo-300 disabled:opacity-60">Resend OTP</button>
                  </div>
                </>
              ) : (
                <button type="submit" disabled={loading} className="w-full rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Working...' : 'Register & Send OTP'}</button>
              )}
            </form>
          ) : null}

          {mode === 'login' ? (
            <div className="space-y-6">
              <form onSubmit={loginWithPassword} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Email + Password</div>
                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-2 block">Email</span>
                  <input name="email" type="email" value={form.email} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="you@example.com" />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                  <span className="mb-2 block">Password</span>
                  <input name="password" type="password" value={form.password} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="Password123!" />
                </label>
                <button type="submit" disabled={loading} className="w-full rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Working...' : 'Sign In'}</button>
              </form>

              <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Email OTP</div>
                  <input name="email" value={form.email} onChange={updateField} className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="you@example.com" />
                  <button type="button" onClick={sendEmailOtp} disabled={loading} className="w-full rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-indigo-400 hover:text-indigo-300 disabled:opacity-60">Send Email OTP</button>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Phone OTP</div>
                  <input name="phone" value={form.phone} onChange={updateField} className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="+1234567890" />
                  <button type="button" onClick={sendPhoneOtp} disabled={loading} className="w-full rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-indigo-400 hover:text-indigo-300 disabled:opacity-60">Send Phone OTP</button>
                </div>
              </div>

              {pendingOtp?.type && pendingOtp.type !== 'register' ? (
                <form onSubmit={verifyOtp} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Verify OTP</div>
                  <input name="otp" value={form.otp} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="123456" />
                  <button type="submit" disabled={loading} className="w-full rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Working...' : 'Verify OTP'}</button>
                </form>
              ) : null}
            </div>
          ) : null}

          {mode === 'forgot' ? (
            <form onSubmit={pendingOtp?.type === 'forgot-password' ? resetPassword : sendForgotPasswordOtp} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <label className="block text-sm font-medium text-slate-300">
                <span className="mb-2 block">Email</span>
                <input name="email" type="email" value={form.email} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="you@example.com" />
              </label>

              {pendingOtp?.type === 'forgot-password' ? (
                <>
                  <label className="block text-sm font-medium text-slate-300">
                    <span className="mb-2 block">OTP</span>
                    <input name="otp" value={form.otp} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="123456" />
                  </label>
                  <label className="block text-sm font-medium text-slate-300">
                    <span className="mb-2 block">New Password</span>
                    <input name="newPassword" type="password" value={form.newPassword} onChange={updateField} required className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400" placeholder="NewPassword1!" />
                  </label>
                </>
              ) : null}

              <button type="submit" disabled={loading} className="w-full rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">{pendingOtp?.type === 'forgot-password' ? (loading ? 'Working...' : 'Reset Password') : (loading ? 'Working...' : 'Send Reset OTP')}</button>
            </form>
          ) : null}
        </div>

        <div className="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl lg:w-[55%]">
          <h2 className="text-2xl font-semibold">What is included</h2>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">• User registration with OTP verification and secure password setup</li>
            <li className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">• Email/password authentication with JWT and refresh tokens</li>
            <li className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">• Email OTP login and phone OTP login</li>
            <li className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">• Forgot password, resend OTP, rate limiting, and validation</li>
          </ul>

          <div className="mt-8 rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-5">
            <h3 className="text-lg font-semibold text-indigo-200">Session status</h3>
            {user ? (
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p><span className="font-semibold text-white">Signed in as:</span> {user.email}</p>
                <p><span className="font-semibold text-white">Name:</span> {user.name}</p>
                <button type="button" onClick={logout} className="rounded-2xl border border-indigo-400/40 px-4 py-2 font-semibold text-indigo-200 transition hover:bg-indigo-500/20">Logout</button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-300">No active session. Use one of the auth flows to begin.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
