import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import PharmacyDashboard from '../pages/pharmacy/Dashboard'
import PharmacyPrescriptions from '../pages/pharmacy/Prescriptions'
import Dispensing from '../pages/pharmacy/Dispensing'
import Inventory from '../pages/pharmacy/Inventory'
import Profile from '../pages/common/Profile'


export default function PharmacyLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header title="Pharmacy Portal" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<PharmacyDashboard />} />
            <Route path="prescriptions" element={<PharmacyPrescriptions />} />
            <Route path="dispensing" element={<Dispensing />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
