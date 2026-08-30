import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import StatCard from '../../components/StatCard'
import { Calendar, Users, CheckCircle, XCircle, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ReceptionDashboard() {
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    api.get('/appointments').then(res => {
      const apts = res.data.data || []
      setStats({
        today: apts.filter((a: any) => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length,
        checkedIn: apts.filter((a: any) => a.status === 'CHECKED_IN').length,
        waiting: apts.filter((a: any) => a.status === 'WAITING').length,
        noShow: apts.filter((a: any) => a.status === 'NO_SHOW').length,
      })
    })
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Reception Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value={stats.today || 0} icon={Calendar} color="blue" />
        <StatCard title="Checked In" value={stats.checkedIn || 0} icon={CheckCircle} color="green" />
        <StatCard title="Waiting" value={stats.waiting || 0} icon={Users} color="amber" />
        <StatCard title="No Show" value={stats.noShow || 0} icon={XCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/reception/check-in" className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors">
              <CheckCircle className="text-sky-600" size={20} />
              <span className="font-medium text-sky-700">Patient Check-in</span>
            </Link>
            <Link to="/reception/appointments" className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <Calendar className="text-green-600" size={20} />
              <span className="font-medium text-green-700">Manage Appointments</span>
            </Link>
            <Link to="/reception/queue" className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
              <Users className="text-amber-600" size={20} />
              <span className="font-medium text-amber-700">Waiting Queue</span>
            </Link>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Today's Schedule Overview</h3>
          <p className="text-gray-500">View and manage all appointments for today.</p>
        </div>
      </div>
    </div>
  )
}
