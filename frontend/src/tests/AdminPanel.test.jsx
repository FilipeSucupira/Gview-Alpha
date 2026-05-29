import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminPanel from '../pages/AdminPanel'

// Mock do useAuth
const mockUser = { id: 'admin1', name: 'Admin User', email: 'admin@gview.com', role: 'ADMIN' }
const mockNavigate = vi.fn()

vi.mock('../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: mockUser,
    isAdmin: true,
    loading: false
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock da apiFetch
const mockApiFetch = vi.fn()
vi.mock('../services/api.js', () => ({
  apiFetch: (...args) => mockApiFetch(...args)
}))

// Mock do fetch global para outras abas se necessário
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

function renderAdminPanel() {
  return render(
    <MemoryRouter>
      <AdminPanel />
    </MemoryRouter>
  )
}

describe('AdminPanel - Contas Tab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock default list submissions response
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: async () => []
    })
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => []
    })
  })

  it('deve renderizar as abas do painel administrativo incluindo a aba Contas', async () => {
    renderAdminPanel()
    expect(screen.getByText('Painel Administrativo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submissões/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /jogos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /game jams/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /contas/i })).toBeInTheDocument()
  })

  it('deve carregar e listar usuários ao clicar na aba Contas', async () => {
    const mockUsersList = [
      { id: 'admin1', name: 'Admin User', email: 'admin@gview.com', role: 'ADMIN' },
      { id: 'player1', name: 'Player One', email: 'player@gview.com', role: 'PLAYER' }
    ]

    mockApiFetch.mockImplementation(async (path) => {
      if (path === '/api/users') {
        return { ok: true, json: async () => mockUsersList }
      }
      return { ok: true, json: async () => [] }
    })

    renderAdminPanel()

    const contasTab = screen.getByRole('button', { name: /contas/i })
    fireEvent.click(contasTab)

    await waitFor(() => {
      expect(screen.getByText('Gerenciamento de Contas')).toBeInTheDocument()
      expect(screen.getByText('Admin User')).toBeInTheDocument()
      expect(screen.getByText('admin@gview.com')).toBeInTheDocument()
      expect(screen.getByText('Player One')).toBeInTheDocument()
      expect(screen.getByText('player@gview.com')).toBeInTheDocument()
    })
  })

  it('deve desabilitar o botão de remover admin para o próprio administrador logado', async () => {
    const mockUsersList = [
      { id: 'admin1', name: 'Admin User', email: 'admin@gview.com', role: 'ADMIN' },
      { id: 'admin2', name: 'Other Admin', email: 'other@gview.com', role: 'ADMIN' }
    ]

    mockApiFetch.mockImplementation(async (path) => {
      if (path === '/api/users') {
        return { ok: true, json: async () => mockUsersList }
      }
      return { ok: true, json: async () => [] }
    })

    renderAdminPanel()

    const contasTab = screen.getByRole('button', { name: /contas/i })
    fireEvent.click(contasTab)

    await waitFor(() => {
      const demoteButtons = screen.getAllByRole('button', { name: /remover admin/i })
      // O primeiro botão é do admin logado (admin1), que deve estar desabilitado
      expect(demoteButtons[0]).toBeDisabled()
      // O segundo botão é do outro admin (admin2), que deve estar habilitado
      expect(demoteButtons[1]).not.toBeDisabled()
    })
  })

  it('deve chamar a API para promover um usuário a ADMIN ao clicar no botão de promover', async () => {
    const mockUsersList = [
      { id: 'player1', name: 'Player One', email: 'player@gview.com', role: 'PLAYER' }
    ]

    mockApiFetch.mockImplementation(async (path, options) => {
      if (path === '/api/users') {
        return { ok: true, json: async () => mockUsersList }
      }
      if (path === '/api/users/player1/role' && options?.method === 'PATCH') {
        const body = JSON.parse(options.body)
        expect(body.role).toBe('ADMIN')
        return {
          ok: true,
          json: async () => ({ id: 'player1', name: 'Player One', email: 'player@gview.com', role: 'ADMIN' })
        }
      }
      return { ok: true, json: async () => [] }
    })

    renderAdminPanel()

    const contasTab = screen.getByRole('button', { name: /contas/i })
    fireEvent.click(contasTab)

    await waitFor(() => {
      expect(screen.getByText('Player One')).toBeInTheDocument()
    })

    const promoteButton = screen.getByRole('button', { name: /promover a admin/i })
    fireEvent.click(promoteButton)

    await waitFor(() => {
      // Após o update de role para ADMIN, o botão deve se transformar em "Remover Admin ✕"
      expect(screen.getByRole('button', { name: /remover admin/i })).toBeInTheDocument()
    })
  })
})
