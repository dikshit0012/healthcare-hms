import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

import SuperAdminLayout from './layouts/SuperAdminLayout'
import AdminLayout from './layouts/AdminLayout'
import DoctorLayout from './layouts/DoctorLayout'
import PatientLayout from './layouts/PatientLayout'
import NurseLayout from './layouts/NurseLayout'
import ReceptionLayout from './layouts/ReceptionLayout'
import LabLayout from './layouts/LabLayout'
import PharmacyLayout from './layouts/PharmacyLayout'
import BillingLayout from './layouts/BillingLayout'

function ProtectedRoute({ children, allowedRole }: { children: JSX.Element; allowedRole?: string }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && user.role !== allowedRole && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  const { user, isAuthenticated } = useAuthStore()

  const getHomeRedirect = () => {
    if (!isAuthenticated || !user) return '/login'
    const map: Record<string, string> = {
      SUPER_ADMIN: '/super-admin/dashboard',
      ADMIN: '/admin/dashboard',
      DOCTOR: '/doctor/dashboard',
      PATIENT: '/patient/dashboard',
      NURSE: '/nurse/dashboard',
      RECEPTIONIST: '/reception/dashboard',
      LAB_TECHNICIAN: '/lab/dashboard',
      PHARMACIST: '/pharmacy/dashboard',
      BILLING_STAFF: '/billing/dashboard',
    }
    return map[user.role] || '/login'
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/super-admin/*"
        element={
          <ProtectedRoute allowedRole="SUPER_ADMIN">
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute allowedRole="DOCTOR">
            <DoctorLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/*"
        element={
          <ProtectedRoute allowedRole="PATIENT">
            <PatientLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nurse/*"
        element={
          <ProtectedRoute allowedRole="NURSE">
            <NurseLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reception/*"
        element={
          <ProtectedRoute allowedRole="RECEPTIONIST">
            <ReceptionLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab/*"
        element={
          <ProtectedRoute allowedRole="LAB_TECHNICIAN">
            <LabLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/*"
        element={
          <ProtectedRoute allowedRole="PHARMACIST">
            <PharmacyLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/*"
        element={
          <ProtectedRoute allowedRole="BILLING_STAFF">
            <BillingLayout />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={getHomeRedirect()} replace />} />
    </Routes>
  )
}
