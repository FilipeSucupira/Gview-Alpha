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

import { useEffect } from 'react'

function AuthActionsHelper({ action, email, password, name, onError, onSuccess }) {
  const { login, register } = useAuth()
  useEffect(() => {
    if (action === 'login') {
      login(email, password).then(onSuccess).catch(onError)
    } else if (action === 'register') {
      register(name, email, password).then(onSuccess).catch(onError)
    }
  }, [action])
  return null
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    }))
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

  it('CT-F26 — deve efetuar login com sucesso e salvar token', async () => {
    const fakeUser = { id: 1, email: 'test@gview.com', role: 'PLAYER' }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-jwt', user: fakeUser })
    })

    const onSuccess = vi.fn()
    const onError = vi.fn()

    render(
      <AuthProvider>
        <AuthConsumer />
        <AuthActionsHelper action="login" email="test@gview.com" password="password123" onSuccess={onSuccess} onError={onError} />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(fakeUser)
      expect(localStorage.getItem('gview_token')).toBe('fake-jwt')
      expect(screen.getByTestId('user').textContent).toBe('test@gview.com')
    })
  })

  it('CT-F27 — deve lançar erro se login falhar', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Credenciais inválidas' })
    })

    const onSuccess = vi.fn()
    const onError = vi.fn()

    render(
      <AuthProvider>
        <AuthConsumer />
        <AuthActionsHelper action="login" email="test@gview.com" password="password123" onSuccess={onSuccess} onError={onError} />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
      expect(onError.mock.calls[0][0].message).toBe('Credenciais inválidas')
    })
  })

  it('CT-F28 — deve registrar com sucesso e salvar token', async () => {
    const fakeUser = { id: 2, name: 'New User', email: 'new@gview.com', role: 'PLAYER' }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'new-jwt', user: fakeUser })
    })

    const onSuccess = vi.fn()
    const onError = vi.fn()

    render(
      <AuthProvider>
        <AuthConsumer />
        <AuthActionsHelper action="register" name="New User" email="new@gview.com" password="password123" onSuccess={onSuccess} onError={onError} />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(fakeUser)
      expect(localStorage.getItem('gview_token')).toBe('new-jwt')
      expect(screen.getByTestId('user').textContent).toBe('new@gview.com')
    })
  })

  it('CT-F29 — deve lançar erro se registro falhar', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'E-mail já cadastrado' })
    })

    const onSuccess = vi.fn()
    const onError = vi.fn()

    render(
      <AuthProvider>
        <AuthConsumer />
        <AuthActionsHelper action="register" name="New User" email="new@gview.com" password="password123" onSuccess={onSuccess} onError={onError} />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
      expect(onError.mock.calls[0][0].message).toBe('E-mail já cadastrado')
    })
  })
})
