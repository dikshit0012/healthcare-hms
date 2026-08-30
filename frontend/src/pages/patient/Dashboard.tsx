import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import StatCard from '../../components/StatCard'
import Badge from '../../components/ui/Badge'
import { Calendar, Pill, FileText, Stethoscope, ArrowRight, Clock, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PatientDashboard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [stats, setStats] = useState({ appointments: 0, prescriptions: 0, records: 0 })

  const displayName = user?.patient?.fullName || user?.email?.split('@')[0]

  useEffect(() => {
    Promise.allSettled([
      api.get('/appointments?limit=5'),
      api.get('/patients/my/prescriptions?limit=3'),
    ]).then(([aptsRes, rxRes]) => {
      if (aptsRes.status === 'fulfilled') {
        const apts = aptsRes.value.data?.data || []
        setAppointments(apts.slice(0, 3))
        setStats(prev => ({ ...prev, appointments: aptsRes.value.data?.total || 0 }))
      }
      if (rxRes.status === 'fulfilled') {
        setPrescriptions(rxRes.value.data?.data || [])
        setStats(prev => ({ ...prev, prescriptions: rxRes.value.data?.total || 0 }))
      }
      setLoading(false)
    })
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-sky-100 text-sm font-medium">{greeting()}</p>
          <h2 className="text-2xl font-bold mt-1">{displayName}</h2>
          <p className="text-sky-200 text-sm mt-2 max-w-md">
            Your health dashboard is up to date. Book an appointment or review your medical records below.
          </p>
          <Link to="/patient/doctors" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-white text-sky-700 rounded-xl font-semibold text-sm hover:bg-sky-50 transition-colors shadow-lg shadow-black/10">
            <Stethoscope size={16} /> Book Appointment <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Appointments" value={stats.appointments} icon={Calendar} color="blue" />
        <StatCard title="Prescriptions" value={stats.prescriptions} icon={Pill} color="emerald" />
        <StatCard title="Medical Records" value={stats.records || '—'} icon={FileText} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upcoming appointments */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800">Upcoming Appointments</h3>
            <Link to="/patient/appointments" className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {appointments.length === 0 ? (
            <div className="p-10 text-center">
              <Calendar size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No upcoming appointments</p>
              <Link to="/patient/doctors" className="inline-block mt-3 text-sm text-sky-600 font-semibold hover:text-sky-700">Find a doctor</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {appointments.map(apt => (
                <div key={apt.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">Dr. {apt.doctor?.fullName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <Clock size={12} />
                      <span>{new Date(apt.appointmentDate).toLocaleDateString()} at {apt.startTime}</span>
                    </div>
                  </div>
                  <Badge status={apt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              {[
                { to: '/patient/doctors', icon: Stethoscope, label: 'Find a doctor', color: 'bg-sky-50 text-sky-600' },
                { to: '/patient/prescriptions', icon: Pill, label: 'View prescriptions', color: 'bg-emerald-50 text-emerald-600' },
                { to: '/patient/labs', icon: FileText, label: 'Lab reports', color: 'bg-violet-50 text-violet-600' },
                { to: '/patient/billing', icon: Heart, label: 'Billing & invoices', color: 'bg-amber-50 text-amber-600' },
              ].map(a => (
                <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={`w-9 h-9 rounded-lg ${a.color} flex items-center justify-center shrink-0`}>
                    <a.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{a.label}</span>
                  <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
