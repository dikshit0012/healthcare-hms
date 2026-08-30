import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import ReceptionDashboard from '../pages/reception/Dashboard'
import ReceptionAppointments from '../pages/reception/Appointments'
import CheckIn from '../pages/reception/CheckIn'
import ReceptionQueue from '../pages/reception/Queue'
import Profile from '../pages/common/Profile'


export default function ReceptionLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header title="Reception Portal" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<ReceptionDashboard />} />
            <Route path="appointments" element={<ReceptionAppointments />} />
            <Route path="check-in" element={<CheckIn />} />
            <Route path="queue" element={<ReceptionQueue />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
