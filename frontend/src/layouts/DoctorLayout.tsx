import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import DoctorDashboard from '../pages/doctor/Dashboard'
import DoctorAppointments from '../pages/doctor/Appointments'
import DoctorPatients from '../pages/doctor/Patients'
import DoctorEncounters from '../pages/doctor/Encounters'
import DoctorPrescriptions from '../pages/doctor/Prescriptions'
import DoctorLabs from '../pages/doctor/LabOrders'
import Profile from '../pages/common/Profile'


export default function DoctorLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header title="Doctor Portal" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="encounters" element={<DoctorEncounters />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="labs" element={<DoctorLabs />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
