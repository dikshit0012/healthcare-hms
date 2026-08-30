import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  Stethoscope, LayoutDashboard, Users, Calendar, FileText,
  FlaskConical, Pill, Receipt, Shield, Settings, Activity,
  ClipboardList, CheckSquare, Clock, UserCheck, User, Menu, X,
  Heart, ChevronRight
} from 'lucide-react'

export default function Sidebar() {
  const { user } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = user?.role || ''

  const getNavLinks = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { to: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/super-admin/users', label: 'Users', icon: Users },
          { to: '/super-admin/roles', label: 'Roles & Permissions', icon: Shield },
          { to: '/super-admin/settings', label: 'Settings', icon: Settings },
          { to: '/super-admin/audit', label: 'Audit Logs', icon: Activity },
          { to: '/super-admin/profile', label: 'My Profile', icon: User },
        ]
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/users', label: 'Users', icon: Users },
          { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
          { to: '/admin/staff', label: 'Staff', icon: Users },
          { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
          { to: '/admin/audit', label: 'Audit Logs', icon: Activity },
          { to: '/admin/profile', label: 'My Profile', icon: User },
        ]
      case 'DOCTOR':
        return [
          { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
          { to: '/doctor/patients', label: 'My Patients', icon: Users },
          { to: '/doctor/encounters', label: 'Encounters', icon: Activity },
          { to: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
          { to: '/doctor/labs', label: 'Lab Orders', icon: FlaskConical },
          { to: '/doctor/profile', label: 'My Profile', icon: User },
        ]
      case 'PATIENT':
        return [
          { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
          { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
          { to: '/patient/records', label: 'Medical Records', icon: FileText },
          { to: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
          { to: '/patient/labs', label: 'Lab Reports', icon: FlaskConical },
          { to: '/patient/billing', label: 'Billing', icon: Receipt },
          { to: '/patient/profile', label: 'My Profile', icon: User },
        ]
      case 'NURSE':
        return [
          { to: '/nurse/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/nurse/queue', label: 'Patient Queue', icon: Clock },
          { to: '/nurse/assessments', label: 'Assessments', icon: ClipboardList },
          { to: '/nurse/vitals', label: 'Vitals Entry', icon: Activity },
          { to: '/nurse/profile', label: 'My Profile', icon: User },
        ]
      case 'RECEPTIONIST':
        return [
          { to: '/reception/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/reception/appointments', label: 'Appointments', icon: Calendar },
          { to: '/reception/check-in', label: 'Patient Check-In', icon: UserCheck },
          { to: '/reception/queue', label: 'Waiting Room', icon: Clock },
          { to: '/reception/profile', label: 'My Profile', icon: User },
        ]
      case 'LAB_TECHNICIAN':
        return [
          { to: '/lab/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/lab/orders', label: 'Lab Orders', icon: FlaskConical },
          { to: '/lab/samples', label: 'Samples', icon: CheckSquare },
          { to: '/lab/results', label: 'Results', icon: Activity },
          { to: '/lab/profile', label: 'My Profile', icon: User },
        ]
      case 'PHARMACIST':
        return [
          { to: '/pharmacy/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/pharmacy/prescriptions', label: 'Prescriptions', icon: FileText },
          { to: '/pharmacy/dispensing', label: 'Dispensing', icon: Pill },
          { to: '/pharmacy/inventory', label: 'Inventory', icon: ClipboardList },
          { to: '/pharmacy/profile', label: 'My Profile', icon: User },
        ]
      case 'BILLING_STAFF':
        return [
          { to: '/billing/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/billing/invoices', label: 'Invoices', icon: Receipt },
          { to: '/billing/payments', label: 'Payments', icon: FileText },
          { to: '/billing/profile', label: 'My Profile', icon: User },
        ]
      default:
        return []
    }
  }

  const links = getNavLinks()
  const displayName = user?.patient?.fullName || user?.doctor?.fullName || user?.staff?.fullName || user?.email?.split('@')[0]

  const nav = (
    <>
      <div className="h-[72px] flex items-center gap-3 px-5 border-b border-white/[0.08]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Heart size={20} className="text-white" fill="white" />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-[15px] tracking-tight text-white block">MediCare</span>
          <p className="text-[10px] text-sky-300 font-medium tracking-widest uppercase">Hospital Cloud</p>
        </div>
        <button className="ml-auto lg:hidden p-1 text-white/60" onClick={() => setMobileOpen(false)}><X size={20} /></button>
      </div>

      <div className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.06]'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{link.label}</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
            </NavLink>
          )
        })}
      </div>

      <div className="p-3 border-t border-white/[0.08]">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.06]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white/90 truncate">{displayName}</p>
            <p className="text-[10px] text-sky-300 capitalize truncate">{role.toLowerCase().replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-slate-900 text-white rounded-xl shadow-lg">
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-900 flex flex-col transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] bg-slate-900 min-h-screen flex-col sticky top-0 h-screen">
        {nav}
      </aside>
    </>
  )
}
