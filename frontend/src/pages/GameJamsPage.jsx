import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../services/api.js'
import './GameJams.css'

export default function GameJamsPage() {
  const { user } = useAuth()
  const [gameJams, setGameJams] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJam, setSelectedJam] = useState(null)
  const [myGames, setMyGames] = useState([])
  const [selectedGameId, setSelectedGameId] = useState('')
  const [joinMsg, setJoinMsg] = useState('')

  useEffect(() => {
    fetch('/api/gamejams')
      .then(res => res.json())
      .then(data => setGameJams(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Fetch user's games when opening participation modal
  const handleParticipate = async (jam) => {
    setSelectedJam(jam)
    setJoinMsg('')
    setSelectedGameId('')
    if (user) {
      try {
        const r = await fetch('/api/games')
        const json = await r.json()
        setMyGames(json.data || [])
      } catch { setMyGames([]) }
    }
  }

  const handleJoin = async () => {
    if (!selectedGameId) return setJoinMsg('Selecione um jogo.')
    try {
      const r = await apiFetch(`/api/gamejams/${selectedJam.id}/join`, {
        method: 'POST',
        body: JSON.stringify({ gameId: selectedGameId })
      })
      if (r.ok) {
        setJoinMsg('✅ Inscrição realizada com sucesso!')
        // Refresh jam details
        const jr = await fetch(`/api/gamejams/${selectedJam.id}`)
        const jj = await jr.json()
        setSelectedJam(jj)
        setGameJams(prev => prev.map(j => j.id === jj.id ? { ...j, entries: jj.entries } : j))
      } else {
        const err = await r.json()
        setJoinMsg('❌ ' + (err.error || 'Erro ao participar.'))
      }
    } catch { setJoinMsg('❌ Erro de conexão.') }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'ACTIVE':   return { label: 'Ativa',     cls: 'jam-status-active' }
      case 'FINISHED': return { label: 'Encerrada', cls: 'jam-status-finished' }
      default:         return { label: 'Em breve',  cls: 'jam-status-upcoming' }
    }
  }

  return (
    <div className="jams-page">
      <div className="container">
        <div className="jams-header">
          <span className="jams-eyebrow">competições &amp; desafios</span>
          <h1 className="jams-title">Game Jams</h1>
          <p className="jams-subtitle">
            Participe de desafios criativos, desenvolva jogos em tempo recorde e mostre seu talento para a comunidade.
          </p>
        </div>

        {loading && <p className="admin-msg">Carregando Game Jams...</p>}

        {!loading && gameJams.length === 0 && (
          <div className="jams-empty">
            <span className="jams-empty-icon">🎯</span>
            <h3>Nenhuma Game Jam agendada</h3>
            <p>Fique de olho! Novas competições serão anunciadas em breve.</p>
          </div>
        )}

        <div className="jams-grid">
          {gameJams.map(jam => {
            const si = getStatusInfo(jam.status)
            return (
              <article key={jam.id} className="jam-card">
                <div className="jam-card-header">
                  <div className="jam-card-top">
                    <h2 className="jam-card-title">{jam.title}</h2>
                    <span className={`jam-status ${si.cls}`}>{si.label}</span>
                  </div>
                  <p className="jam-card-desc">{jam.description}</p>
                  {jam.theme && (
                    <div className="jam-theme">
                      <span className="jam-theme-label">Tema</span>
                      <span className="jam-theme-value">{jam.theme}</span>
                    </div>
                  )}
                  {jam.creator && (
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                      Organizado por <strong>{jam.creator.name}</strong>
                    </p>
                  )}
                </div>

                <div className="jam-card-footer">
                  <div className="jam-dates">
                    <div className="jam-date">
                      <span className="jam-date-label">Início</span>
                      <span className="jam-date-value">{new Date(jam.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="jam-date-divider"></div>
                    <div className="jam-date">
                      <span className="jam-date-label">Término</span>
                      <span className="jam-date-value">{new Date(jam.endDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="jam-card-actions">
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      {jam.entries?.length || 0} inscrição(ões)
                    </span>
                    {jam.status !== 'FINISHED' && user && (
                      <button className="btn btn-primary jam-participate-btn" onClick={() => handleParticipate(jam)}>
                        Participar
                      </button>
                    )}
                    {!user && jam.status !== 'FINISHED' && (
                      <span className="jam-login-hint">Faça login para participar</span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* Participation Modal */}
      {selectedJam && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setSelectedJam(null)}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 480, maxHeight: '80vh', overflowY: 'auto', color: 'var(--color-text)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: 'var(--color-text)' }}>Participar: {selectedJam.title}</h2>
              <button onClick={() => setSelectedJam(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text)' }}>✕</button>
            </div>

            {selectedJam.theme && <p style={{ color: 'var(--color-accent-2)', fontWeight: 600, marginBottom: '1rem' }}>🎨 Tema: {selectedJam.theme}</p>}
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{selectedJam.description}</p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>Selecione seu jogo:</label>
              <select value={selectedGameId} onChange={e => setSelectedGameId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none' }}>
                <option value="" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>-- Escolha um jogo --</option>
                {myGames.map(g => <option key={g.id} value={g.id} style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>{g.title}</option>)}
              </select>
            </div>

            {joinMsg && <p style={{ marginBottom: '1rem', fontWeight: 600, color: joinMsg.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{joinMsg}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedJam(null)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 600 }}>Fechar</button>
              <button onClick={handleJoin} style={{ padding: '0.5rem 1.2rem', borderRadius: 8, background: 'var(--color-accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Inscrever</button>
            </div>

            {(selectedJam.entries || []).length > 0 && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Inscrições ({selectedJam.entries.length})</h4>
                {selectedJam.entries.map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text)' }}>🎮 {e.game?.title || 'Jogo'}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>— {e.developer?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
