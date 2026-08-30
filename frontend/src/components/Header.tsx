import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayName = user?.patient?.fullName || user?.doctor?.fullName || user?.staff?.fullName || user?.email?.split('@')[0]

  useEffect(() => {
    api.get('/notifications?limit=1').then(res => {
      setNotifCount(res.data?.unreadCount || 0)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const profilePath = `/${user?.role?.toLowerCase().replace('_', '-').replace('super-admin', 'super-admin').replace('lab-technician', 'lab').replace('billing-staff', 'billing')}/profile`

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="min-w-0 pl-12 lg:pl-0">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications bell */}
        <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell size={19} />
          {notifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{displayName}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 animate-dropdown">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="font-medium text-sm text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <Link to={profilePath} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <User size={16} className="text-gray-400" /> My Profile
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
