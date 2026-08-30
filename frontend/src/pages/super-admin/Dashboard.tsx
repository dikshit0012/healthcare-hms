import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import StatCard from '../../components/StatCard'
import { Users, Shield, Building2, Activity, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={data ? (data.patients + data.doctors + data.nurses + data.receptionists + data.labTechnicians + data.pharmacists + data.billingStaff) : 0} icon={Users} color="blue" />
        <StatCard title="Total Doctors" value={data?.doctors || 0} icon={Shield} color="green" />
        <StatCard title="Total Patients" value={data?.patients || 0} icon={Users} color="amber" />
        <StatCard title="System Activity" value="Active" icon={Activity} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to="/super-admin/users" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">Global Users</h3>
          <p className="text-sm text-gray-500 mt-1">Manage all platform users</p>
        </Link>
        <Link to="/super-admin/roles" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">Roles & Permissions</h3>
          <p className="text-sm text-gray-500 mt-1">Configure RBAC settings</p>
        </Link>
        <Link to="/super-admin/settings" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">System Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Global configuration</p>
        </Link>
      </div>
    </div>
  )
}
