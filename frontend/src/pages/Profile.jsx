import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../services/api.js'
import './Profile.css'

export default function Profile() {
  const { user, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('wishlist')
  const [wishlist, setWishlist] = useState([])
  const [collections, setCollections] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading])

  useEffect(() => {
    if (!user) return
    if (tab === 'wishlist') {
      setLoadingData(true)
      apiFetch(`/api/wishlist/${user.id}`)
        .then(r => r.json())
        .then(data => setWishlist(Array.isArray(data) ? data : (data.data || [])))
        .catch(() => setWishlist([]))
        .finally(() => setLoadingData(false))
    } else if (tab === 'collections') {
      setLoadingData(true)
      apiFetch('/api/collections/my')
        .then(r => r.json())
        .then(data => setCollections(data.data || []))
        .catch(() => setCollections([]))
        .finally(() => setLoadingData(false))
    } else {
      setLoadingData(false)
    }
  }, [tab, user])

  const removeFromWishlist = async (gameId) => {
    await apiFetch(`/api/wishlist/${gameId}`, { method: 'DELETE' })
    setWishlist(prev => prev.filter(w => w.gameId !== gameId))
  }

  if (authLoading || !user) return null

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar-lg">{user.name?.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <span className="profile-role-badge">
              {user.role === 'ADMIN' ? '🛡️ Administrador' : user.role === 'DEVELOPER' ? '🎮 Desenvolvedor' : '🎯 Jogador'}
            </span>
          </div>
        </div>

        <div className="profile-tabs">
          <button className={`profile-tab ${tab === 'wishlist' ? 'active' : ''}`} onClick={() => setTab('wishlist')}>
            <span className="tab-icon">♡</span> Lista de Desejos
          </button>
          <button className={`profile-tab ${tab === 'collections' ? 'active' : ''}`} onClick={() => setTab('collections')}>
            <span className="tab-icon">📚</span> Coleções
          </button>
          <button className={`profile-tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
            <span className="tab-icon">⚡</span> Atividade
          </button>
          <button className={`profile-tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
            <span className="tab-icon">⚙️</span> Configurações
          </button>
        </div>

        <div className="profile-content">
          {loadingData && <p className="profile-empty">Carregando...</p>}

          {/* Wishlist */}
          {!loadingData && tab === 'wishlist' && (
            <>
              {wishlist.length === 0 ? (
                <div className="profile-empty-state">
                  <span className="empty-icon">🎮</span>
                  <h3>Sua lista de desejos está vazia</h3>
                  <p>Navegue pelo catálogo e adicione demos que te interessam!</p>
                  <Link to="/" className="btn btn-primary">Explorar demos</Link>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map(item => (
                    <div key={item.id} className="wishlist-card">
                      <Link to={`/game/${item.game?.slug}`} className="wishlist-cover">
                        <img src={item.game?.coverUrl || `https://picsum.photos/seed/${item.gameId}/300/400`} alt={item.game?.title} loading="lazy" />
                      </Link>
                      <div className="wishlist-info">
                        <Link to={`/game/${item.game?.slug}`} className="wishlist-title">{item.game?.title || 'Jogo'}</Link>
                        <p className="wishlist-studio">{item.game?.studioName}</p>
                      </div>
                      <button className="wishlist-remove" onClick={() => removeFromWishlist(item.gameId)} title="Remover">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Collections */}
          {!loadingData && tab === 'collections' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <Link to="/collections" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: 8, fontWeight: 700 }}>
                  Gerenciar Coleções →
                </Link>
              </div>
              {collections.length === 0 ? (
                <div className="profile-empty-state">
                  <span className="empty-icon">📚</span>
                  <h3>Você ainda não tem coleções</h3>
                  <p>Crie coleções personalizadas para organizar seus jogos favoritos!</p>
                  <Link to="/collections" className="btn btn-primary">Criar Coleção</Link>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {collections.map(col => (
                    <div key={col.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
                      <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>{col.name}</h3>
                      {col.description && <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{col.description}</p>}
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '0.75rem' }}>
                        {(col.items || []).slice(0, 4).map(item => (
                          <img key={item.id} src={item.game?.coverUrl || `https://picsum.photos/seed/${item.gameId}/40/56`}
                            alt="" style={{ width: 36, height: 50, borderRadius: 4, objectFit: 'cover', background: '#f3f4f6' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>
                        {(col.items || []).length} jogo(s) · {col.isPublic ? '🌍 Pública' : '🔒 Privada'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Activity */}
          {!loadingData && tab === 'activity' && (
            <div className="profile-empty-state">
              <span className="empty-icon">📊</span>
              <h3>Histórico de atividades</h3>
              <p>Suas avaliações e interações aparecerão aqui.</p>
            </div>
          )}

          {/* Settings */}
          {!loadingData && tab === 'settings' && <ProfileSettings />}
        </div>
      </div>
    </div>
  )
}

function ProfileSettings() {
  const { user, setUser, logout } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [msg, setMsg] = useState('')

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMsg('Atualizando...')
    try {
      const r = await apiFetch('/api/auth/me', { method: 'PUT', body: JSON.stringify({ name }) })
      if (r.ok) {
        const { user: updated } = await r.json()
        setUser(updated)
        setMsg('✅ Nome atualizado com sucesso!')
      } else { setMsg('❌ Erro ao atualizar nome.') }
    } catch { setMsg('❌ Erro de conexão.') }
  }

  const handleDelete = async () => {
    if (!confirm('TEM CERTEZA? Esta ação deletará sua conta permanentemente!')) return
    try {
      const r = await apiFetch('/api/auth/me', { method: 'DELETE' })
      if (r.ok) { alert('Conta deletada com sucesso.'); logout() }
      else { alert('Erro ao deletar conta.') }
    } catch { alert('Erro de conexão.') }
  }

  return (
    <div className="profile-settings">
      <h2 style={{ marginBottom: '1.5rem' }}>Configurações da Conta</h2>
      <form onSubmit={handleUpdate} style={{ maxWidth: '400px', marginBottom: '3rem' }}>
        <div className="auth-field">
          <label>Nome de exibição</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Atualizar Nome</button>
        {msg && <p style={{ marginTop: '1rem', color: 'var(--color-accent)' }}>{msg}</p>}
      </form>
      <div style={{ padding: '1.5rem', background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>Zona de Perigo</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>
          Ao deletar sua conta, todas as suas reviews, lista de desejos e participações serão removidas permanentemente.
        </p>
        <button onClick={handleDelete} className="btn" style={{ background: '#e74c3c', color: '#fff' }}>Excluir minha conta</button>
      </div>
    </div>
  )
}
