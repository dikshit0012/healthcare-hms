import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import AdminDashboard from '../pages/admin/Dashboard'
import Users from '../pages/admin/Users'
import Doctors from '../pages/admin/Doctors'
import Staff from '../pages/admin/Staff'
import AdminAppointments from '../pages/admin/Appointments'
import Audit from '../pages/admin/Audit'
import Profile from '../pages/common/Profile'


export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header title="Admin Portal" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="staff" element={<Staff />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="audit" element={<Audit />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
