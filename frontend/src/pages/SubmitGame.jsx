import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../services/api.js'
import './SubmitGame.css'

export default function SubmitGame() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    gameTitle:'', projectUrl:'', description:'', launchPlans:'',
    targetPlatforms:'', launchDateRange:'', demoLink:'',
    contactRole:'', contactEmail:'', studioName:''
  })
  const [sent, setSent] = useState(false)

  const [error, setError] = useState('')

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('Você precisa estar logado para enviar uma submissão.')
      return
    }

    try {
      const res = await apiFetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao enviar a submissão')
      }
      setSent(true)
    } catch (err) {
      setError(err.message || 'Erro de conexão.')
    }
  }

  if (sent) return (
    <div className="container submit-success">
      <h2>🚀 Submissão enviada!</h2>
      <p>Obrigado! Nossa equipe vai analisar e entrar em contato pelo e-mail informado.</p>
    </div>
  )

  return (
    <div className="container submit-page">
      <div className="submit-header">
        <h1>envie seu jogo</h1>
        <p>Está desenvolvendo uma demo incrível? Adoraríamos conhecer! Preencha as informações abaixo e nossa equipe entrará em contato.</p>
      </div>
      {!user && (
        <div className="auth-error" style={{
          marginBottom: '2.5rem',
          background: 'rgba(244, 98, 42, 0.1)',
          border: '1px solid var(--color-primary)',
          color: 'var(--color-primary)',
          padding: '1.25rem 1.75rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: '0 4px 12px rgba(244,98,42,0.08)'
        }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
            ⚠️ <strong>Atenção:</strong> Você precisa estar logado para enviar uma submissão de jogo. Por favor, faça login antes de preencher o formulário.
          </span>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: 'var(--text-xs)', borderRadius: '9999px', whiteSpace: 'nowrap' }}>
            Fazer Login 🔑
          </Link>
        </div>
      )}
      {error && <div className="auth-error" style={{marginBottom: '2rem'}}>{error}</div>}
      <form className="submit-form" onSubmit={submit}>
        <fieldset>
          <legend>sobre o jogo</legend>
          <Field label="Título do jogo *" name="gameTitle" value={form.gameTitle} onChange={handle} required />
          <Field label="Link do projeto ou página Steam" name="projectUrl" value={form.projectUrl} onChange={handle} placeholder="https://" />
          <Field label="Conte sobre o jogo *" name="description" value={form.description} onChange={handle} required textarea hint="O que é? O que o torna único? Quais são os planos?" />
        </fieldset>
        <fieldset>
          <legend>planos de lançamento</legend>
          <Field label="Como planeja lançar e divulgar o jogo?" name="launchPlans" value={form.launchPlans} onChange={handle} textarea />
          <Field label="Plataformas-alvo" name="targetPlatforms" value={form.targetPlatforms} onChange={handle} placeholder="PC, Steam..." />
          <Field label="Previsão de lançamento" name="launchDateRange" value={form.launchDateRange} onChange={handle} placeholder="Ex: Q2 2026" />
        </fieldset>
        <fieldset>
          <legend>sobre a demo</legend>
          <Field label="Link da demo ou vídeo de gameplay" name="demoLink" value={form.demoLink} onChange={handle} placeholder="Steam, itch.io, link direto..." hint="Se não tiver demo, adicione link para vídeo de gameplay." />
        </fieldset>
        <fieldset>
          <legend>contato</legend>
          <Field label="Seu papel no projeto *" name="contactRole" value={form.contactRole} onChange={handle} required placeholder="Desenvolvedor, produtor, publisher..." />
          <Field label="E-mail *" name="contactEmail" value={form.contactEmail} onChange={handle} required type="email" />
          <Field label="Estúdio ou empresa" name="studioName" value={form.studioName} onChange={handle} />
        </fieldset>
        <button type="submit" className="btn btn-primary" style={{marginTop:'1rem'}}>Enviar submissão 🚀</button>
      </form>
    </div>
  )
}

function Field({ label, name, value, onChange, required, textarea, hint, placeholder, type='text' }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {hint && <span className="field-hint">{hint}</span>}
      {textarea
        ? <textarea id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={4} />
        : <input id={name} name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} />
      }
    </div>
  )
}
