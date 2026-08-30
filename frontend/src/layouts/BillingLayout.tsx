import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import BillingDashboard from '../pages/billing/Dashboard'
import Invoices from '../pages/billing/Invoices'
import Payments from '../pages/billing/Payments'
import Profile from '../pages/common/Profile'


export default function BillingLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header title="Billing Portal" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<BillingDashboard />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="payments" element={<Payments />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
