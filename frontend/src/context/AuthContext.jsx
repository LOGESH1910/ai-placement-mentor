import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [token, setToken]   = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // ── Keep axios header in sync with token ─────────────────────────────────
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }, [token])

  // ── On mount: restore session from localStorage ───────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (!stored) { setLoading(false); return }

    // Token exists — set header immediately so the profile fetch is authenticated
    api.defaults.headers.common['Authorization'] = `Bearer ${stored}`

    api.get('/profile')
      .then(res => {
        setUser(res.data.data)
        setToken(stored)
      })
      .catch(() => {
        // Token invalid or expired — clear it
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth actions ──────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: jwt, user: userData } = res.data.data
    setToken(jwt)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data)
    const { token: jwt, user: userData } = res.data.data
    setToken(jwt)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await api.get('/profile')
    setUser(res.data.data)
    return res.data.data
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
