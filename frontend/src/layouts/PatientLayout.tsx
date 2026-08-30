import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import PatientDashboard from '../pages/patient/Dashboard'
import FindDoctor from '../pages/patient/FindDoctor'
import Appointments from '../pages/patient/Appointments'
import MedicalRecords from '../pages/patient/MedicalRecords'
import Prescriptions from '../pages/patient/Prescriptions'
import LabReports from '../pages/patient/LabReports'
import Billing from '../pages/patient/Billing'
import Profile from '../pages/common/Profile'


export default function PatientLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header title="Patient Portal" />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="doctors" element={<FindDoctor />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="records" element={<MedicalRecords />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="labs" element={<LabReports />} />
            <Route path="billing" element={<Billing />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
