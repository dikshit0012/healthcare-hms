import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import NurseDashboard from '../pages/nurse/Dashboard'
import Queue from '../pages/nurse/Queue'
import Assessments from '../pages/nurse/Assessments'
import Vitals from '../pages/nurse/Vitals'
import Profile from '../pages/common/Profile'


export default function NurseLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header title="Nurse Portal" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<NurseDashboard />} />
            <Route path="queue" element={<Queue />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="vitals" element={<Vitals />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
