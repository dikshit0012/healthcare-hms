import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import StatCard from '../../components/StatCard'
import { DollarSign, CreditCard, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BillingDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.get('/billing/dashboard').then(res => setData(res.data))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Billing Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Today's Revenue" value={`$${data?.todayRevenue || 0}`} icon={DollarSign} color="green" />
        <StatCard title="Pending Bills" value={data?.pendingBills || 0} icon={AlertCircle} color="amber" />
        <StatCard title="Paid Bills" value={data?.paidBills || 0} icon={CheckCircle} color="green" />
        <StatCard title="Failed" value={data?.failedPayments || 0} icon={CreditCard} color="red" />
        <StatCard title="Refunds" value={data?.refunds || 0} icon={RotateCcw} color="gray" />
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Billing Workflow</h3>
        <div className="flex items-center justify-between py-4">
          {['Bill Generated', 'Pending', 'Payment Processing', 'Paid', 'Receipt'].map((step, i) => (
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
        <Link to="/billing/invoices" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">Invoices</h3>
          <p className="text-sm text-gray-500 mt-1">Manage patient invoices</p>
        </Link>
        <Link to="/billing/payments" className="card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-800">Payments</h3>
          <p className="text-sm text-gray-500 mt-1">Process and verify payments</p>
        </Link>
      </div>
    </div>
  )
}
