import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import StatCard from '../../components/StatCard'
import { Users, ClipboardCheck, Activity, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NurseDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.get('/nursing/dashboard').then(res => setData(res.data))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Nurse Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Patients Waiting" value={data?.waiting || 0} icon={Users} color="amber" />
        <StatCard title="Assessments Pending" value={data?.pendingAssessment || 0} icon={ClipboardCheck} color="blue" />
        <StatCard title="Active Patients" value={data?.active || 0} icon={Activity} color="green" />
        <StatCard title="Completed Today" value={data?.completed || 0} icon={CheckCircle} color="sky" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Patient Queue</h3>
          <Link to="/nurse/queue" className="block w-full py-3 bg-sky-50 text-sky-700 text-center rounded-lg hover:bg-sky-100 transition-colors font-medium">
            View Full Queue
          </Link>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/nurse/vitals" className="p-4 bg-sky-50 rounded-xl hover:bg-sky-100 text-center">
              <Activity className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-sky-700">Record Vitals</p>
            </Link>
            <Link to="/nurse/assessments" className="p-4 bg-green-50 rounded-xl hover:bg-green-100 text-center">
              <ClipboardCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-700">Assessments</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
