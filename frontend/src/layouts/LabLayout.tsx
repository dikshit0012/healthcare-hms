import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import LaboratoryDashboard from '../pages/lab/Dashboard'
import Orders from '../pages/lab/Orders'
import Samples from '../pages/lab/Samples'
import Results from '../pages/lab/Results'
import Profile from '../pages/common/Profile'


export default function LabLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header title="Laboratory Portal" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<LaboratoryDashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="samples" element={<Samples />} />
            <Route path="results" element={<Results />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
