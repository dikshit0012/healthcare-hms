import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import StatCard from '../../components/StatCard'
import { Pill, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PharmacyDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.get('/pharmacy/dashboard').then(res => setData(res.data))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Pharmacy Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="New Rx" value={data?.newPrescriptions || 0} icon={Pill} color="blue" />
        <StatCard title="Pending" value={data?.pending || 0} icon={Clock} color="amber" />
        <StatCard title="Partial" value={data?.partiallyDispensed || 0} icon={Package} color="purple" />
        <StatCard title="Completed" value={data?.completed || 0} icon={CheckCircle} color="green" />
        <StatCard title="Low Stock" value={data?.lowStock || 0} icon={AlertTriangle} color="red" />
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Dispensing Workflow</h3>
        <div className="flex items-center justify-between py-4">
          {['Rx Received', 'Verification', 'Preparing', 'Partially Dispensed', 'Dispensed'].map((step, i) => (
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
        <Link to="/pharmacy/prescriptions" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">Prescriptions</h3>
          <p className="text-sm text-gray-500 mt-1">View incoming prescriptions</p>
        </Link>
        <Link to="/pharmacy/inventory" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">Inventory</h3>
          <p className="text-sm text-gray-500 mt-1">Manage medication stock</p>
        </Link>
      </div>
    </div>
  )
}
