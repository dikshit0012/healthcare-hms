import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import Badge from '../../components/ui/Badge'
import { Mail, Phone, MapPin, Save, Loader2, Calendar, Shield, Briefcase } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/users/profile').then(res => { setProfile(res.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const { data } = await api.patch('/users/profile', profile)
      setProfile(data)
      updateUser(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  const details = profile?.patient || profile?.doctor || profile?.staff || {}
  const displayName = details.fullName || profile?.email

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>

      {/* Profile header card */}
      <div className="card">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg shadow-sky-500/20">
            {displayName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge status={profile?.status || 'ACTIVE'} />
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Shield size={12} /> {profile?.role?.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <Mail size={13} /> {profile?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="card space-y-5">
        <h4 className="font-semibold text-gray-800">Personal Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-500 border border-gray-100">
              <Mail size={15} className="text-gray-400" /> {profile?.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone</label>
            <input
              value={details.phone || ''}
              onChange={e => {
                const key = profile.role === 'PATIENT' ? 'patient' : profile.role === 'DOCTOR' ? 'doctor' : 'staff'
                setProfile({ ...profile, [key]: { ...details, phone: e.target.value } })
              }}
              className="input"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        {profile?.patient && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={details.dateOfBirth?.split('T')[0] || ''}
                  onChange={e => setProfile({ ...profile, patient: { ...details, dateOfBirth: e.target.value } })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Blood Group</label>
                <select
                  value={details.bloodGroup || ''}
                  onChange={e => setProfile({ ...profile, patient: { ...details, bloodGroup: e.target.value } })}
                  className="input"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Gender</label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-500 border border-gray-100 capitalize">
                  {details.gender?.toLowerCase() || '—'}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Address</label>
              <input
                value={details.address || ''}
                onChange={e => setProfile({ ...profile, patient: { ...details, address: e.target.value } })}
                className="input"
                placeholder="Your full address"
              />
            </div>
          </>
        )}

        {profile?.doctor && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Specialization</label>
                <input
                  value={details.specialization || ''}
                  onChange={e => setProfile({ ...profile, doctor: { ...details, specialization: e.target.value } })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={details.consultationFee || ''}
                  onChange={e => setProfile({ ...profile, doctor: { ...details, consultationFee: parseFloat(e.target.value) } })}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Qualifications</label>
              <input
                value={details.qualifications || ''}
                onChange={e => setProfile({ ...profile, doctor: { ...details, qualifications: e.target.value } })}
                className="input"
                placeholder="e.g. MBBS, MD (Internal Medicine)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Professional Bio</label>
              <textarea
                value={details.professionalBio || ''}
                onChange={e => setProfile({ ...profile, doctor: { ...details, professionalBio: e.target.value } })}
                className="input min-h-[100px] resize-none"
                placeholder="Brief description of your practice…"
              />
            </div>
          </>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save Changes</>}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-medium animate-slide-in">Changes saved</span>}
        </div>
      </div>
    </div>
  )
}
