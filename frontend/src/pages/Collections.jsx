import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../services/api.js'
import './Collections.css'

export default function CollectionsPage() {
  const { user, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', isPublic: false })
  const [msg, setMsg] = useState('')
  const [detailCollection, setDetailCollection] = useState(null)
  const [addingGameId, setAddingGameId] = useState('')
  const [allGames, setAllGames] = useState([])

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading])

  useEffect(() => {
    if (user) {
      fetchCollections()
      fetchAllGames()
    }
  }, [user])

  const fetchCollections = async () => {
    setLoading(true)
    try {
      const r = await apiFetch('/api/collections/my')
      const json = await r.json()
      setCollections(json.data || [])
    } catch { setMsg('Erro ao carregar coleções.') }
    setLoading(false)
  }

  const fetchAllGames = async () => {
    try {
      const r = await fetch('/api/games')
      const json = await r.json()
      setAllGames(json.data || [])
    } catch {}
  }

  const openCreate = () => {
    setEditTarget(null)
    setForm({ name: '', description: '', isPublic: false })
    setShowModal(true)
  }

  const openEdit = (col) => {
    setEditTarget(col)
    setForm({ name: col.name, description: col.description || '', isPublic: col.isPublic })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setMsg('Nome é obrigatório.')
    try {
      if (editTarget) {
        await apiFetch(`/api/collections/${editTarget.id}`, { method: 'PUT', body: JSON.stringify(form) })
      } else {
        await apiFetch('/api/collections', { method: 'POST', body: JSON.stringify(form) })
      }
      setShowModal(false)
      setMsg('')
      fetchCollections()
    } catch { setMsg('Erro ao salvar coleção.') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir esta coleção?')) return
    try {
      await apiFetch(`/api/collections/${id}`, { method: 'DELETE' })
      setCollections(prev => prev.filter(c => c.id !== id))
      if (detailCollection?.id === id) setDetailCollection(null)
    } catch { setMsg('Erro ao deletar coleção.') }
  }

  const handleAddGame = async () => {
    if (!addingGameId || !detailCollection) return
    try {
      await apiFetch(`/api/collections/${detailCollection.id}/games`, {
        method: 'POST',
        body: JSON.stringify({ gameId: addingGameId })
      })
      setAddingGameId('')
      fetchCollections()
      // Refresh detail
      const r = await apiFetch(`/api/collections/${detailCollection.id}`)
      const json = await r.json()
      setDetailCollection(json)
    } catch (e) { setMsg('Erro ao adicionar jogo (pode já estar na coleção).') }
  }

  const handleRemoveGame = async (gameId) => {
    if (!detailCollection) return
    try {
      await apiFetch(`/api/collections/${detailCollection.id}/games/${gameId}`, { method: 'DELETE' })
      fetchCollections()
      setDetailCollection(prev => ({ ...prev, items: prev.items.filter(i => i.gameId !== gameId) }))
    } catch { setMsg('Erro ao remover jogo.') }
  }

  const openDetail = async (col) => {
    try {
      const r = await apiFetch(`/api/collections/${col.id}`)
      const json = await r.json()
      setDetailCollection(json)
    } catch { setDetailCollection(col) }
  }

  if (authLoading || loading) return <div className="container" style={{ padding: '2rem' }}>Carregando...</div>

  return (
    <div className="collections-page">
      <div className="container">
        <div className="collections-header">
          <span className="collections-eyebrow">sua biblioteca</span>
          <h1 className="collections-title">Minhas Coleções</h1>
          <p className="collections-subtitle">Organize seus jogos em coleções personalizadas e compartilhe com a comunidade.</p>
        </div>

        {msg && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{msg}</p>}

        <div className="collections-toolbar">
          <button className="btn-sm btn-primary" onClick={openCreate}>+ Nova Coleção</button>
        </div>

        {collections.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">📚</span>
            <h3>Nenhuma coleção ainda</h3>
            <p>Crie sua primeira coleção e comece a organizar seus jogos favoritos!</p>
          </div>
        )}

        <div className="collections-grid">
          {collections.map(col => (
            <div className="collection-card" key={col.id}>
              <div className="collection-card-header">
                <h2 className="collection-name">{col.name}</h2>
                {col.isPublic && <span className="collection-badge">Pública</span>}
              </div>
              <p className="collection-desc">{col.description || 'Sem descrição.'}</p>

              <div className="collection-games-preview">
                {(col.items || []).slice(0, 5).map(item => (
                  item.game?.coverUrl
                    ? <img key={item.id} className="collection-game-thumb" src={item.game.coverUrl} alt={item.game.title} title={item.game.title} />
                    : <div key={item.id} className="collection-game-thumb-placeholder">🎮</div>
                ))}
              </div>

              <p className="collection-meta">{(col.items || []).length} jogo(s) · criada em {new Date(col.createdAt).toLocaleDateString('pt-BR')}</p>

              <div className="collection-actions">
                <button className="btn-sm btn-secondary" onClick={() => openDetail(col)}>Ver detalhes</button>
                <button className="btn-sm btn-secondary" onClick={() => openEdit(col)}>Editar</button>
                <button className="btn-sm btn-danger" onClick={() => handleDelete(col.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editTarget ? 'Editar Coleção' : 'Nova Coleção'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Jogos de Terror Favoritos" required />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descreva sua coleção..." />
              </div>
              <div className="form-group">
                <label className="form-check">
                  <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} />
                  Tornar coleção pública
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-sm btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-sm btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailCollection && (
        <div className="modal-overlay" onClick={() => setDetailCollection(null)}>
          <div className="modal-box" style={{ maxWidth: 560, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>{detailCollection.name}</h2>
              <button className="btn-sm btn-secondary" onClick={() => setDetailCollection(null)}>✕</button>
            </div>
            {detailCollection.description && <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{detailCollection.description}</p>}

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <select className="form-input" style={{ flex: 1 }} value={addingGameId} onChange={e => setAddingGameId(e.target.value)}>
                <option value="">Selecione um jogo para adicionar...</option>
                {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
              <button className="btn-sm btn-primary" onClick={handleAddGame}>Adicionar</button>
            </div>

            <div className="collection-detail-games">
              {(detailCollection.items || []).length === 0 && <p style={{ color: '#9ca3af' }}>Nenhum jogo ainda.</p>}
              {(detailCollection.items || []).map(item => (
                <div className="collection-detail-game-item" key={item.id}>
                  {item.game?.coverUrl
                    ? <img src={item.game.coverUrl} alt={item.game?.title} />
                    : <div style={{ width: 40, height: 56, background: '#f3f4f6', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮</div>
                  }
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{item.game?.title || 'Jogo'}</p>
                    {item.game?.genre && <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>{item.game.genre}</p>}
                  </div>
                  <button className="btn-sm btn-danger" onClick={() => handleRemoveGame(item.gameId)}>Remover</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
