import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from '../pages/Register'

// CT-F14 a CT-F19 — Testes unitários da página de Cadastro

const mockRegister = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({ register: mockRegister }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function fillForm({ name = 'Usuário Teste', email = 'test@test.com', password = 'senha123', confirmPassword = 'senha123' } = {}) {
  fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: name } })
  fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: email } })
  fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: password } })
  fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: confirmPassword } })
}

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  )
}

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('CT-F14 — exibe os quatro campos do formulário', () => {
    renderRegister()
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
  })

  it('CT-F15 — exibe erro quando senhas não coincidem', async () => {
    renderRegister()
    fillForm({ confirmPassword: 'diferente' })
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument()
    })
  })

  it('CT-F16 — exibe erro quando senha tem menos de 6 caracteres', async () => {
    renderRegister()
    fillForm({ password: '123', confirmPassword: '123' })
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText(/pelo menos 6 caracteres/i)).toBeInTheDocument()
    })
  })

  it('CT-F17 — chama register e redireciona ao sucesso', async () => {
    mockRegister.mockResolvedValueOnce({ id: 1, email: 'test@test.com' })
    renderRegister()
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('Usuário Teste', 'test@test.com', 'senha123')
      expect(mockNavigate).toHaveBeenCalledWith('/profile')
    })
  })

  it('CT-F18 — exibe mensagem de erro quando register falha', async () => {
    mockRegister.mockRejectedValueOnce(new Error('E-mail já cadastrado'))
    renderRegister()
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText('E-mail já cadastrado')).toBeInTheDocument()
    })
  })

  it('CT-F19 — link para login está presente', () => {
    renderRegister()
    expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument()
  })
})
