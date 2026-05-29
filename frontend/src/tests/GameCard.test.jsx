import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GameCard from '../components/GameCard'

// CT-F01 a CT-F04 — Testes unitários do componente GameCard

const mockGame = {
  slug: 'hollow-knight',
  title: 'Hollow Knight',
  studioName: 'Team Cherry',
  coverUrl: 'https://example.com/cover.jpg',
  status: 'AVAILABLE',
}

function renderCard(game) {
  return render(
    <MemoryRouter>
      <GameCard game={game} />
    </MemoryRouter>
  )
}

describe('GameCard', () => {
  it('CT-F01 — exibe o título do jogo', () => {
    renderCard(mockGame)
    expect(screen.getByText('Hollow Knight')).toBeInTheDocument()
  })

  it('CT-F02 — exibe o nome do estúdio', () => {
    renderCard(mockGame)
    expect(screen.getByText('Team Cherry')).toBeInTheDocument()
  })

  it('CT-F03 — link aponta para a rota correta do jogo', () => {
    renderCard(mockGame)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/game/hollow-knight')
  })

  it('CT-F04 — exibe badge "em breve" quando status é COMING_SOON', () => {
    renderCard({ ...mockGame, status: 'COMING_SOON' })
    expect(screen.getByText('em breve')).toBeInTheDocument()
  })

  it('CT-F05 — exibe badge "destaque" quando status é FEATURED', () => {
    renderCard({ ...mockGame, status: 'FEATURED' })
    expect(screen.getByText('destaque')).toBeInTheDocument()
  })

  it('CT-F06 — não exibe badges quando status é AVAILABLE', () => {
    renderCard(mockGame)
    expect(screen.queryByText('em breve')).not.toBeInTheDocument()
    expect(screen.queryByText('destaque')).not.toBeInTheDocument()
  })

  it('CT-F07 — usa imagem placeholder quando coverUrl é nulo', () => {
    renderCard({ ...mockGame, coverUrl: null })
    const img = screen.getByRole('img')
    expect(img.src).toContain('picsum.photos')
  })
})
