import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import SuperAdminDashboard from '../pages/super-admin/Dashboard'
import SAUsers from '../pages/super-admin/Users'
import SARoles from '../pages/super-admin/Roles'
import SASettings from '../pages/super-admin/Settings'
import SAAudit from '../pages/super-admin/Audit'
import Profile from '../pages/common/Profile'


export default function SuperAdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header title="Super Admin Portal" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="users" element={<SAUsers />} />
            <Route path="roles" element={<SARoles />} />
            <Route path="settings" element={<SASettings />} />
            <Route path="audit" element={<SAAudit />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
