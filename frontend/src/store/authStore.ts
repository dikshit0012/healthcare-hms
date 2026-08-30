import { create } from 'zustand'

export interface User {
  id: string
  email: string
  role: string
  status?: string
  fullName?: string
  phone?: string
  address?: string
  doctor?: any
  staff?: any
  patient?: any
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (data: { user: User; accessToken: string; refreshToken?: string }) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('hms_user') || 'null'),
  accessToken: localStorage.getItem('hms_token') || null,
  refreshToken: localStorage.getItem('hms_refresh') || null,
  isAuthenticated: !!localStorage.getItem('hms_token'),

  setAuth: (data) => {
    localStorage.setItem('hms_user', JSON.stringify(data.user))
    localStorage.setItem('hms_token', data.accessToken)
    if (data.refreshToken) {
      localStorage.setItem('hms_refresh', data.refreshToken)
    }
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || null,
      isAuthenticated: true,
    })
  },

  updateUser: (updatedUser) => {
    set((state) => {
      const newUser = state.user ? { ...state.user, ...updatedUser } : null
      if (newUser) {
        localStorage.setItem('hms_user', JSON.stringify(newUser))
      }
      return { user: newUser }
    })
  },

  logout: () => {
    localStorage.removeItem('hms_user')
    localStorage.removeItem('hms_token')
    localStorage.removeItem('hms_refresh')
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  },
}))
