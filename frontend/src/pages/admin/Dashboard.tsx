import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import StatCard from '../../components/StatCard'
import { Users, Stethoscope, UserCheck, FlaskConical, Pill, CreditCard, Calendar, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Patients" value={data?.patients || 0} icon={Users} color="blue" />
        <StatCard title="Doctors" value={data?.doctors || 0} icon={Stethoscope} color="green" />
        <StatCard title="Appointments" value={data?.appointments || 0} icon={Calendar} color="amber" />
        <StatCard title="Pending Verification" value={data?.pendingVerification || 0} icon={ShieldAlert} color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Nurses" value={data?.nurses || 0} icon={UserCheck} color="purple" />
        <StatCard title="Receptionists" value={data?.receptionists || 0} icon={Users} color="sky" />
        <StatCard title="Lab Techs" value={data?.labTechnicians || 0} icon={FlaskConical} color="pink" />
        <StatCard title="Pharmacists" value={data?.pharmacists || 0} icon={Pill} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to="/admin/users" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">User Management</h3>
          <p className="text-sm text-gray-500 mt-1">Manage all system users</p>
        </Link>
        <Link to="/admin/doctors" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">Doctor Verification</h3>
          <p className="text-sm text-gray-500 mt-1">Verify and manage doctors</p>
        </Link>
        <Link to="/admin/staff" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">Staff Management</h3>
          <p className="text-sm text-gray-500 mt-1">Add and manage staff</p>
        </Link>
      </div>
    </div>
  )
}
