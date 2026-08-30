import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Eye, EyeOff, Loader2, Heart, ArrowRight, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    dateOfBirth: '', gender: '', address: '', emergencyName: '', emergencyPhone: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: form.address.trim() || undefined,
        emergencyName: form.emergencyName.trim() || undefined,
        emergencyPhone: form.emergencyPhone.trim() || undefined,
      })
      setSuccess(true)
    } catch (err: any) {
      const message = err.response?.data?.message
      setError(Array.isArray(message) ? message.join(', ') : message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Successful</h2>
          <p className="text-gray-500 mt-2">Your account has been created. You can now sign in.</p>
          <Link to="/login" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold text-sm hover:bg-sky-700">
            Go to Sign In <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
            <Heart size={20} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-lg text-gray-800">MediCare HMS</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Create your patient account</h1>
        <p className="text-gray-500 mt-1 text-sm">Register to book appointments and manage your health records</p>

        {error && (
          <div className="mt-5 p-3.5 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input value={form.fullName} onChange={e => set('fullName', e.target.value)} className="input" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" placeholder="you@email.com" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input" placeholder="+91 98765 43210" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth *</label>
              <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender *</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className="input" required>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} className="input" placeholder="Your full address (optional)" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} className="input pr-11" placeholder="Min 8 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
              <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className="input" placeholder="Re-enter password" required />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Emergency Contact (optional)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} className="input" placeholder="Contact name" />
              <input value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} className="input" placeholder="Contact phone" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : <>Create Account <ArrowRight size={14} /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-sky-600 hover:text-sky-700 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
