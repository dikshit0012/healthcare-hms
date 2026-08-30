import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { Eye, EyeOff, Loader2, Heart, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email: email.trim().toLowerCase(), password })
      setAuth(data)
      const routes: Record<string, string> = {
        PATIENT: '/patient/dashboard',
        DOCTOR: '/doctor/dashboard',
        NURSE: '/nurse/dashboard',
        RECEPTIONIST: '/reception/dashboard',
        LAB_TECHNICIAN: '/lab/dashboard',
        PHARMACIST: '/pharmacy/dashboard',
        BILLING_STAFF: '/billing/dashboard',
        ADMIN: '/admin/dashboard',
        SUPER_ADMIN: '/super-admin/dashboard',
      }
      navigate(routes[data.user.role] || '/login', { replace: true })
    } catch (err: any) {
      const message = err.response?.data?.message
      setError(Array.isArray(message) ? message.join(', ') : message || 'Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-sky-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
              <Heart size={22} className="text-white" fill="white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">MediCare HMS</span>
              <p className="text-[10px] text-sky-300 tracking-widest uppercase">Hospital Cloud</p>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Modern healthcare,<br />
              <span className="text-sky-400">intelligently managed.</span>
            </h2>
            <p className="text-white/60 mt-4 text-lg leading-relaxed max-w-md">
              Streamline patient care, appointments, prescriptions, billing, and lab workflows — all in one secure platform.
            </p>

            <div className="flex gap-6 mt-10">
              {[
                { n: '9', label: 'Role types' },
                { n: '24/7', label: 'Availability' },
                { n: '100%', label: 'Secure' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">{s.n}</p>
                  <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/30">© 2026 MediCare HMS — HIPAA-ready infrastructure</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-lg text-gray-800">MediCare HMS</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to access your dashboard</p>

          {error && (
            <div className="mt-5 p-3.5 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 flex items-start gap-2.5">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 focus:bg-white transition-all text-sm"
                placeholder="you@hospital.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 focus:bg-white transition-all text-sm pr-11"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl hover:from-sky-700 hover:to-blue-700 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            New patient?{' '}
            <Link to="/register" className="text-sky-600 hover:text-sky-700 font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
