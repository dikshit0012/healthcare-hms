import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import StatCard from '../../components/StatCard'
import { FlaskConical, TestTube, Microscope, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LabDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.get('/lab/dashboard').then(res => setData(res.data))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Laboratory Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="New Orders" value={data?.newOrders || 0} icon={FlaskConical} color="blue" />
        <StatCard title="Sample Pending" value={data?.samplePending || 0} icon={TestTube} color="amber" />
        <StatCard title="Processing" value={data?.processing || 0} icon={Microscope} color="purple" />
        <StatCard title="Verification" value={data?.verification || 0} icon={AlertCircle} color="red" />
        <StatCard title="Completed" value={data?.completed || 0} icon={CheckCircle} color="green" />
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Lab Workflow</h3>
        <div className="flex items-center justify-between py-4">
          {['Ordered', 'Sample Pending', 'Collected', 'Processing', 'Result Pending', 'Verification', 'Completed'].map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1}
              </div>
              <span className="text-[10px] text-gray-500 text-center w-16">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link to="/lab/orders" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">Lab Orders</h3>
          <p className="text-sm text-gray-500 mt-1">View and manage all lab orders</p>
        </Link>
        <Link to="/lab/results" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">Results Entry</h3>
          <p className="text-sm text-gray-500 mt-1">Enter and verify test results</p>
        </Link>
      </div>
    </div>
  )
}
