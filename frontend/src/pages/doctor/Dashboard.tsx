import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import StatCard from '../../components/StatCard'
import Badge from '../../components/ui/Badge'
import { Calendar, Users, Activity, FlaskConical, ArrowRight, Clock, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const displayName = user?.doctor?.fullName || user?.email?.split('@')[0]

  useEffect(() => {
    api.get('/doctors/dashboard')
      .then(res => setData(res.data))
      .catch(() => setData({}))
      .finally(() => setLoading(false))
  }, [])

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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, Dr. {displayName?.split(' ').pop()}</h2>
        <p className="text-gray-500 text-sm mt-1">Here's your clinical overview for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value={data?.todayAppointments || 0} icon={Calendar} color="blue" />
        <StatCard title="Waiting Patients" value={data?.waitingPatients?.length || 0} icon={Users} color="amber" />
        <StatCard title="Active Consultations" value={data?.activeConsultations?.length || 0} icon={Activity} color="emerald" />
        <StatCard title="Pending Lab Results" value={data?.pendingLabResults || 0} icon={FlaskConical} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">Waiting Queue</h3>
              {(data?.waitingPatients?.length || 0) > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  {data.waitingPatients.length}
                </span>
              )}
            </div>
            <Link to="/doctor/encounters" className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1">
              All encounters <ArrowRight size={12} />
            </Link>
          </div>

          {!data?.waitingPatients?.length ? (
            <div className="p-10 text-center">
              <Users size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No patients waiting</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.waitingPatients.slice(0, 5).map((enc: any) => (
                <div key={enc.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                    {enc.patient?.fullName?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800">{enc.patient?.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge status={enc.status} />
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={11} />
                        {enc.chiefComplaint || 'General consultation'}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/doctor/encounters`}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
                  >
                    <Play size={12} /> Start
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/doctor/appointments', icon: Calendar, label: 'Appointments', color: 'bg-sky-50 text-sky-600 hover:bg-sky-100' },
              { to: '/doctor/prescriptions', icon: Activity, label: 'Write Rx', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
              { to: '/doctor/labs', icon: FlaskConical, label: 'Lab Orders', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
              { to: '/doctor/patients', icon: Users, label: 'My Patients', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
            ].map(a => (
              <Link key={a.to} to={a.to} className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${a.color}`}>
                <a.icon size={22} />
                <p className="text-xs font-semibold">{a.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
