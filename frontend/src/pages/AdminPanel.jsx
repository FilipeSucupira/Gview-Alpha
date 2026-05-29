import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../services/api.js'
import './AdminPanel.css'

const STATUS_LABEL = { PENDING: 'pendente', APPROVED: 'aprovado', REJECTED: 'rejeitado' }
const STATUS_CLASS = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' }

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('submissions')
  const [submissions, setSubmissions] = useState([])
  const [games, setGames] = useState([])
  const [gameJams, setGameJams] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rawgId, setRawgId] = useState('')
  const [importMsg, setImportMsg] = useState('')

  // Jam form / edit
  const [showJamForm, setShowJamForm] = useState(false)
  const [jamForm, setJamForm] = useState({ title: '', description: '', theme: '', startDate: '', endDate: '', status: 'UPCOMING' })
  const [editingJam, setEditingJam] = useState(null)

  // Submission edit
  const [editingSub, setEditingSub] = useState(null)
  const [editSubForm, setEditSubForm] = useState({})

  // Game edit
  const [editingGame, setEditingGame] = useState(null)
  const [editGameForm, setEditGameForm] = useState({})

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/login')
  }, [isAdmin, authLoading])

  useEffect(() => { fetchData() }, [tab])

  const fetchData = async () => {
    setLoading(true); setError(null)
    try {
      if (tab === 'submissions') {
        const r = await apiFetch('/api/submissions')
        const json = await r.json()
        setSubmissions(Array.isArray(json) ? json : (json.data || []))
      } else if (tab === 'games') {
        const r = await fetch('/api/games')
        const json = await r.json()
        setGames(Array.isArray(json) ? json : (json.data || []))
      } else if (tab === 'gamejams') {
        const r = await fetch('/api/gamejams')
        const json = await r.json()
        setGameJams(Array.isArray(json) ? json : [])
      } else if (tab === 'users') {
        const r = await apiFetch('/api/users')
        const json = await r.json()
        setUsers(Array.isArray(json) ? json : [])
      }
    } catch { setError('Erro ao carregar dados.') }
    setLoading(false)
  }

  // ── USERS / ACCOUNTS ─────────────────────────────────
  const handleUpdateRole = async (id, role) => {
    try {
      const res = await apiFetch(`/api/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
      })
      if (res.ok) {
        const updated = await res.json()
        setUsers(prev => prev.map(u => u.id === id ? updated : u))
      } else {
        const err = await res.json()
        alert(err.error || 'Erro ao atualizar cargo.')
      }
    } catch {
      alert('Erro de conexão.')
    }
  }

  // ── SUBMISSIONS ──────────────────────────────────────
  const handleStatus = async (id, status) => {
    try {
      await apiFetch(`/api/submissions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
      if (status === 'APPROVED') {
        setSubmissions(prev => prev.filter(s => s.id !== id))
      } else {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, reviewStatus: status } : s))
      }
    } catch { alert('Erro ao atualizar status.') }
  }

  const handleDeleteSub = async (id) => {
    if (!confirm('Excluir esta submissão definitivamente?')) return
    await apiFetch(`/api/submissions/${id}`, { method: 'DELETE' })
    setSubmissions(prev => prev.filter(s => s.id !== id))
  }

  const handleStartEditSub = (sub) => {
    setEditingSub(sub.id)
    setEditSubForm({ gameTitle: sub.gameTitle, studioName: sub.studioName || '', contactEmail: sub.contactEmail, description: sub.description })
  }

  const handleUpdateSub = async (e) => {
    e.preventDefault()
    try {
      const res = await apiFetch(`/api/submissions/${editingSub}`, { method: 'PUT', body: JSON.stringify(editSubForm) })
      if (res.ok) {
        const updated = await res.json()
        setSubmissions(prev => prev.map(s => s.id === editingSub ? updated : s))
        setEditingSub(null)
      } else { alert('Erro ao atualizar submissão.') }
    } catch { alert('Erro de conexão.') }
  }

  // ── GAMES ────────────────────────────────────────────
  const handleDeleteGame = async (id) => {
    if (!confirm('Remover este jogo do catálogo?')) return
    await apiFetch(`/api/games/${id}`, { method: 'DELETE' })
    setGames(prev => prev.filter(g => g.id !== id))
  }

  const handleStartEditGame = (game) => {
    setEditingGame(game.id)
    setEditGameForm({ title: game.title, genre: game.genre || '', studioName: game.studioName || '', status: game.status, shortDescription: game.shortDescription || '', coverUrl: game.coverUrl || '', demoUrl: game.demoUrl || '' })
  }

  const handleUpdateGame = async (e) => {
    e.preventDefault()
    try {
      const res = await apiFetch(`/api/games/${editingGame}`, { method: 'PUT', body: JSON.stringify(editGameForm) })
      if (res.ok) {
        const updated = await res.json()
        setGames(prev => prev.map(g => g.id === editingGame ? updated : g))
        setEditingGame(null)
      } else { alert('Erro ao atualizar jogo.') }
    } catch { alert('Erro de conexão.') }
  }

  const handleImportRAWG = async () => {
    if (!rawgId) return
    setImportMsg('Importando...')
    try {
      const res = await apiFetch(`/api/rawg/import/${rawgId}`, { method: 'POST' })
      if (res.ok) { setImportMsg('✅ Jogo importado!'); setRawgId(''); fetchData() }
      else { const err = await res.json(); setImportMsg('❌ ' + (err.error || 'Erro')) }
    } catch { setImportMsg('❌ Erro de conexão.') }
  }

  // ── GAME JAMS ────────────────────────────────────────
  const handleOpenJamCreate = () => {
    setEditingJam(null)
    setJamForm({ title: '', description: '', theme: '', startDate: '', endDate: '', status: 'UPCOMING' })
    setShowJamForm(true)
  }

  const handleStartEditJam = (jam) => {
    setEditingJam(jam.id)
    const toLocal = (dt) => dt ? new Date(dt).toISOString().slice(0, 16) : ''
    setJamForm({ title: jam.title, description: jam.description, theme: jam.theme || '', startDate: toLocal(jam.startDate), endDate: toLocal(jam.endDate), status: jam.status })
    setShowJamForm(true)
  }

  const handleSaveJam = async (e) => {
    e.preventDefault()
    try {
      if (editingJam) {
        const res = await apiFetch(`/api/gamejams/${editingJam}`, { method: 'PUT', body: JSON.stringify(jamForm) })
        if (res.ok) { const updated = await res.json(); setGameJams(prev => prev.map(j => j.id === editingJam ? updated : j)) }
      } else {
        await apiFetch('/api/gamejams', { method: 'POST', body: JSON.stringify({ ...jamForm, creatorId: user.id }) })
        fetchData()
      }
      setShowJamForm(false)
      setEditingJam(null)
      setJamForm({ title: '', description: '', theme: '', startDate: '', endDate: '', status: 'UPCOMING' })
    } catch { alert('Erro ao salvar Game Jam.') }
  }

  const handleDeleteJam = async (id) => {
    if (!confirm('Excluir esta Game Jam?')) return
    await apiFetch(`/api/gamejams/${id}`, { method: 'DELETE' })
    setGameJams(prev => prev.filter(j => j.id !== id))
    if (showJamForm && editingJam === id) setShowJamForm(false)
  }

  if (authLoading || !isAdmin) return null

  return (
    <div className="container admin-page">
      <div className="admin-header">
        <div className="admin-header-top">
          <div>
            <h1>Painel Administrativo</h1>
            <p>Gerencie jogos, submissões e eventos da plataforma Gview.</p>
          </div>
          <span className="admin-role-badge">🛡️ Admin</span>
        </div>
        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'submissions' ? 'active' : ''}`} onClick={() => setTab('submissions')}>
            Submissões {submissions.length > 0 && <span className="tab-count">{submissions.length}</span>}
          </button>
          <button className={`admin-tab ${tab === 'games' ? 'active' : ''}`} onClick={() => setTab('games')}>Jogos</button>
          <button className={`admin-tab ${tab === 'gamejams' ? 'active' : ''}`} onClick={() => setTab('gamejams')}>Game Jams</button>
          <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Contas</button>
        </div>
      </div>

      {loading && <p className="admin-msg">Carregando…</p>}
      {error && <p className="admin-msg admin-error">{error}</p>}

      {/* ─── Submissions Tab ─── */}
      {!loading && !error && tab === 'submissions' && (
        <div className="submissions-list">
          {submissions.length === 0 && <p className="admin-msg">Nenhuma submissão recebida.</p>}
          {submissions.map(s => (
            editingSub === s.id ? (
              <form key={s.id} className="submission-card" onSubmit={handleUpdateSub} style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: 0 }}>Editando Submissão</h3>
                <div className="jam-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="auth-field"><label>Título do Jogo</label><input required value={editSubForm.gameTitle} onChange={e => setEditSubForm({...editSubForm, gameTitle: e.target.value})} /></div>
                  <div className="auth-field"><label>Estúdio</label><input value={editSubForm.studioName} onChange={e => setEditSubForm({...editSubForm, studioName: e.target.value})} /></div>
                  <div className="auth-field"><label>E-mail de Contato</label><input required type="email" value={editSubForm.contactEmail} onChange={e => setEditSubForm({...editSubForm, contactEmail: e.target.value})} /></div>
                </div>
                <div className="auth-field"><label>Descrição</label><textarea rows={3} value={editSubForm.description} onChange={e => setEditSubForm({...editSubForm, description: e.target.value})} /></div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditingSub(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar</button>
                </div>
              </form>
            ) : (
              <div key={s.id} className="submission-card">
                <div className="submission-top">
                  <div>
                    <h2 className="submission-title">{s.gameTitle}</h2>
                    <p className="submission-meta">{s.studioName && <span>{s.studioName} · </span>}{s.contactEmail}{s.contactRole && <span> · {s.contactRole}</span>}</p>
                  </div>
                  <span className={`badge ${STATUS_CLASS[s.reviewStatus] || 'badge-pending'}`}>
                    {STATUS_LABEL[s.reviewStatus] || s.reviewStatus}
                  </span>
                </div>
                {s.description && <p className="submission-desc">{s.description}</p>}
                <div className="submission-details">
                  {s.targetPlatforms && <span>Plataformas: {s.targetPlatforms}</span>}
                  {s.launchDateRange && <span>Previsão: {s.launchDateRange}</span>}
                  {s.demoLink && <a href={s.demoLink} target="_blank" rel="noreferrer">ver demo ↗</a>}
                </div>
                <div className="submission-actions">
                  {s.reviewStatus === 'PENDING' && <>
                    <button className="btn-approve" onClick={() => handleStatus(s.id, 'APPROVED')}>✓ Aprovar</button>
                    <button className="btn-reject" onClick={() => handleStatus(s.id, 'REJECTED')}>✕ Rejeitar</button>
                  </>}
                  {s.reviewStatus !== 'PENDING' && (
                    <button className="btn-approve" style={{ background: '#fef3c7', color: '#92400e' }} onClick={() => handleStatus(s.id, 'PENDING')}>↩ Pendente</button>
                  )}
                  <button className="btn-approve" style={{ background: '#e0f2fe', color: '#0369a1', marginLeft: 'auto' }} onClick={() => handleStartEditSub(s)}>✏️ Editar</button>
                  <button className="btn-reject" onClick={() => handleDeleteSub(s.id)}>🗑️ Excluir</button>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* ─── Games Tab ─── */}
      {!loading && !error && tab === 'games' && (
        <div className="admin-games">
          <div className="admin-rawg-import">
            <h3>Importar da RAWG API</h3>
            <p className="admin-rawg-hint">Insira o ID de um jogo na RAWG para importar metadados para o catálogo.</p>
            <div className="rawg-input-row">
              <input type="text" placeholder="ID do Jogo (ex: 3498)" value={rawgId} onChange={e => setRawgId(e.target.value)} className="rawg-input" />
              <button className="btn btn-primary" onClick={handleImportRAWG}>Importar</button>
            </div>
            {importMsg && <p className="rawg-msg">{importMsg}</p>}
          </div>

          <h3 className="admin-subtitle">Jogos Cadastrados</h3>
          <div className="admin-games-list">
            {games.length === 0 && <p className="admin-msg">Nenhum jogo no catálogo.</p>}
            {games.map(g => (
              editingGame === g.id ? (
                <form key={g.id} className="admin-game-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }} onSubmit={handleUpdateGame}>
                  <div className="jam-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="auth-field"><label>Título</label><input required value={editGameForm.title} onChange={e => setEditGameForm({...editGameForm, title: e.target.value})} /></div>
                    <div className="auth-field"><label>Estúdio</label><input value={editGameForm.studioName} onChange={e => setEditGameForm({...editGameForm, studioName: e.target.value})} /></div>
                    <div className="auth-field"><label>Gênero</label><input value={editGameForm.genre} onChange={e => setEditGameForm({...editGameForm, genre: e.target.value})} /></div>
                    <div className="auth-field">
                      <label>Status</label>
                      <select value={editGameForm.status} onChange={e => setEditGameForm({...editGameForm, status: e.target.value})} style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', width: '100%' }}>
                        <option value="AVAILABLE">Disponível</option>
                        <option value="FEATURED">Destaque</option>
                        <option value="COMING_SOON">Em Breve</option>
                      </select>
                    </div>
                    <div className="auth-field"><label>Descrição curta</label><input value={editGameForm.shortDescription} onChange={e => setEditGameForm({...editGameForm, shortDescription: e.target.value})} /></div>
                    <div className="auth-field"><label>URL da Capa</label><input value={editGameForm.coverUrl} onChange={e => setEditGameForm({...editGameForm, coverUrl: e.target.value})} /></div>
                    <div className="auth-field"><label>URL da Demo</label><input value={editGameForm.demoUrl} onChange={e => setEditGameForm({...editGameForm, demoUrl: e.target.value})} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setEditingGame(null)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Salvar</button>
                  </div>
                </form>
              ) : (
                <div key={g.id} className="admin-game-row">
                  <img src={g.coverUrl || `https://picsum.photos/seed/${g.slug}/60/80`} alt="" className="admin-game-thumb" />
                  <div className="admin-game-info">
                    <strong>{g.title}</strong>
                    <span>{g.genre} · {g.studioName}</span>
                  </div>
                  <span className={`badge ${g.status === 'FEATURED' ? 'badge-accent' : g.status === 'COMING_SOON' ? 'badge-coming' : ''}`}>{g.status}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-approve" onClick={() => handleStartEditGame(g)} style={{ fontSize: 'var(--text-xs)', padding: '0.4rem 0.8rem' }}>Editar</button>
                    <button className="btn-reject" onClick={() => handleDeleteGame(g.id)} style={{ fontSize: 'var(--text-xs)', padding: '0.4rem 0.8rem' }}>Excluir</button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* ─── Game Jams Tab ─── */}
      {!loading && !error && tab === 'gamejams' && (
        <div className="admin-jams">
          <div className="admin-jams-header">
            <h3 className="admin-subtitle">Game Jams</h3>
            <button className="btn btn-primary" onClick={handleOpenJamCreate}>+ Criar Game Jam</button>
          </div>

          {showJamForm && (
            <form className="jam-form" onSubmit={handleSaveJam}>
              <h3 style={{ margin: '0 0 1rem' }}>{editingJam ? '✏️ Editar Game Jam' : '➕ Nova Game Jam'}</h3>
              <div className="jam-form-grid">
                <div className="auth-field"><label>Título *</label><input required value={jamForm.title} onChange={e => setJamForm({...jamForm, title: e.target.value})} /></div>
                <div className="auth-field"><label>Tema</label><input value={jamForm.theme} onChange={e => setJamForm({...jamForm, theme: e.target.value})} placeholder="Opcional" /></div>
                <div className="auth-field"><label>Início *</label><input type="datetime-local" required value={jamForm.startDate} onChange={e => setJamForm({...jamForm, startDate: e.target.value})} /></div>
                <div className="auth-field"><label>Término *</label><input type="datetime-local" required value={jamForm.endDate} onChange={e => setJamForm({...jamForm, endDate: e.target.value})} /></div>
              </div>
              <div className="auth-field"><label>Descrição *</label><textarea required rows={3} value={jamForm.description} onChange={e => setJamForm({...jamForm, description: e.target.value})} /></div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowJamForm(false); setEditingJam(null) }}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingJam ? 'Salvar Alterações' : 'Criar Jam'}</button>
              </div>
            </form>
          )}

          <div className="submissions-list">
            {gameJams.length === 0 && <p className="admin-msg">Nenhuma Game Jam cadastrada.</p>}
            {gameJams.map(jam => (
              <div key={jam.id} className="submission-card">
                <div className="submission-top">
                  <div>
                    <h2 className="submission-title">{jam.title}</h2>
                    <p className="submission-meta">
                      {new Date(jam.startDate).toLocaleDateString('pt-BR')} — {new Date(jam.endDate).toLocaleDateString('pt-BR')}
                      {jam.theme && <span> · Tema: {jam.theme}</span>}
                      {jam.creator && <span> · por {jam.creator.name}</span>}
                    </p>
                  </div>
                  <div className="admin-jam-actions">
                    <span className="badge">{jam.status}</span>
                  </div>
                </div>
                {jam.description && <p className="submission-desc">{jam.description}</p>}
                <div className="submission-actions">
                  <button className="btn-approve" style={{ background: '#e0f2fe', color: '#0369a1' }} onClick={() => handleStartEditJam(jam)}>✏️ Editar</button>
                  <button className="btn-reject" onClick={() => handleDeleteJam(jam.id)}>🗑️ Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Users Tab ─── */}
      {!loading && !error && tab === 'users' && (
        <div className="admin-games">
          <h3 className="admin-subtitle">Gerenciamento de Contas</h3>
          <p className="admin-rawg-hint" style={{ marginBottom: '1.5rem' }}>
            Visualize as contas registradas no Gview e altere cargos de administrador.
          </p>
          <div className="admin-games-list">
            {users.length === 0 && <p className="admin-msg">Nenhum usuário cadastrado.</p>}
            {users.map(u => (
              <div key={u.id} className="admin-game-row" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="admin-game-info" style={{ marginLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-text)' }}>{u.name}</strong>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{u.email}</span>
                </div>
                <span className={`badge ${u.role === 'ADMIN' ? 'badge-accent' : 'badge-pending'}`} style={{ textTransform: 'uppercase', fontSize: 'var(--text-xs)', marginLeft: '1rem' }}>
                  {u.role}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                  {u.role === 'ADMIN' ? (
                    <button 
                      className="btn-reject" 
                      style={{ fontSize: 'var(--text-xs)', padding: '0.4rem 0.8rem', cursor: user.id === u.id ? 'not-allowed' : 'pointer', opacity: user.id === u.id ? 0.5 : 1 }}
                      disabled={user.id === u.id}
                      onClick={() => handleUpdateRole(u.id, 'PLAYER')}
                      title={user.id === u.id ? "Você não pode se despromover" : "Tirar cargo de admin"}
                    >
                      Remover Admin ✕
                    </button>
                  ) : (
                    <button 
                      className="btn-approve" 
                      style={{ fontSize: 'var(--text-xs)', padding: '0.4rem 0.8rem' }}
                      onClick={() => handleUpdateRole(u.id, 'ADMIN')}
                    >
                      Promover a Admin ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
