import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_URL || ''

const sanitizeToken = (token) => {
  if (typeof token !== 'string') return ''
  return token.replace(/[^a-zA-Z0-9-_.\/+=]/g, '')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('gview_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setUser(data.user || data))
        .catch(() => { logout() })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer login')
    
    const safeToken = sanitizeToken(data.token)
    localStorage.setItem('gview_token', safeToken)
    setToken(safeToken)
    setUser(data.user)
    return data.user
  }

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar')
    
    const safeToken = sanitizeToken(data.token)
    localStorage.setItem('gview_token', safeToken)
    setToken(safeToken)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('gview_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
