import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../contexts/AuthContext.jsx'

// CT-F20 a CT-F25 — Testes unitários do AuthContext

// Componente auxiliar para expor os valores do contexto
function AuthConsumer() {
  const { user, loading, isAdmin, token } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <span data-testid="token">{token || 'null'}</span>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('CT-F20 — loading inicia como true e termina false quando não há token', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  it('CT-F21 — user é null quando não há token no localStorage', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null')
    })
  })

  it('CT-F22 — isAdmin é false para usuário não autenticado', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('isAdmin').textContent).toBe('false')
    })
  })

  it('CT-F23 — carrega usuário do token existente no localStorage', async () => {
    localStorage.setItem('gview_token', 'fake-token')
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 1, email: 'admin@gview.com', role: 'ADMIN' } }),
    })

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('admin@gview.com')
    })
  })

  it('CT-F24 — isAdmin é true quando role é ADMIN', async () => {
    localStorage.setItem('gview_token', 'fake-token')
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 1, email: 'admin@gview.com', role: 'ADMIN' } }),
    })

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('isAdmin').textContent).toBe('true')
    })
  })

  it('CT-F25 — faz logout quando token salvo é inválido', async () => {
    localStorage.setItem('gview_token', 'token-expirado')
    fetch.mockResolvedValueOnce({ ok: false })

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null')
      expect(screen.getByTestId('token').textContent).toBe('null')
    })
  })
})
