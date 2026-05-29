import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// CT-F08 a CT-F13 — Testes unitários da página de Login

// Mock do useAuth
const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('CT-F08 — exibe o campo de e-mail', () => {
    renderLogin()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
  })

  it('CT-F09 — exibe o campo de senha', () => {
    renderLogin()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
  })

  it('CT-F10 — exibe o botão de entrar', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('CT-F11 — link para registro está presente', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument()
  })

  it('CT-F12 — chama login e redireciona ao sucesso', async () => {
    mockLogin.mockResolvedValueOnce({ id: 1, email: 'test@test.com' })
    renderLogin()

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'senha123')
      expect(mockNavigate).toHaveBeenCalledWith('/profile')
    })
  })

  it('CT-F13 — exibe mensagem de erro quando login falha', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciais inválidas'))
    renderLogin()

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'wrong@test.com' } })
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'errada' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
    })
  })
})
