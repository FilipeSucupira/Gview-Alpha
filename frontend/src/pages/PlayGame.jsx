import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mockGames } from '../services/mockData'

export default function PlayGame() {
  const { slug } = useParams()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tryIframe, setTryIframe] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    fetch(`/api/games/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setGame(data))
      .catch(() => {
        const mock = mockGames.find(g => g.slug === slug)
        setGame(mock || null)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div style={{background:'#000', minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center'}}><p style={{color:'var(--color-text-muted)'}}>Carregando demo...</p></div>

  if (!game || !game.demoUrl) return (
    <div className="container" style={{padding:'4rem 0'}}>
      <p>Demo não disponível.</p>
      <Link to="/" className="btn btn-ghost" style={{marginTop:'1rem'}}>← voltar</Link>
    </div>
  )

  const getCleanedUrl = (url) => {
    if (!url) return '';
    let targetUrl = url.trim();
    
    // Extrai o link caso o usuário cole a tag iframe inteira
    const iframeSrcMatch = targetUrl.match(/src=["']([^"']+)["']/);
    if (iframeSrcMatch && iframeSrcMatch[1]) {
      targetUrl = iframeSrcMatch[1];
    }
    
    // Transforma links CDN diretos do itch.io para links oficiais de embed
    // Exemplo: https://html-classic.itch.zone/html/14943635/oficialiaca/index.html
    const cdnMatch = targetUrl.match(/html-classic\.itch\.zone\/html\/(\d+)/);
    if (cdnMatch && cdnMatch[1]) {
      return `https://itch.io/embed-upload/${cdnMatch[1]}?color=333333`;
    }
    
    // Padroniza links já existentes de embed-upload
    const embedMatch = targetUrl.match(/itch\.io\/embed-upload\/(\d+)/);
    if (embedMatch && embedMatch[1]) {
      return `https://itch.io/embed-upload/${embedMatch[1]}?color=333333`;
    }
    
    return targetUrl;
  };

  const cleanedUrl = getCleanedUrl(game.demoUrl);
  // Se for itch.io mas NÃO for do tipo embed-upload, consideramos que precisa de abertura externa (ex: username.itch.io)
  const isEmbeddable = !cleanedUrl.includes('itch.io') || cleanedUrl.includes('embed-upload');

  if (!isEmbeddable && !tryIframe) {
    return (
      <div style={{background:'#0e0e0e', minHeight:'calc(100dvh - 65px)', display:'flex', flexDirection:'column', color:'#f0f0f0'}}>
        <div style={{padding:'0.75rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem', borderBottom:'1px solid var(--color-border)', background:'var(--color-surface)'}}>
          <Link to={`/game/${slug}`} className="btn btn-ghost" style={{padding:'0.3rem 0.8rem', fontSize:'var(--text-xs)'}}>← voltar</Link>
          <span style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)'}}>{game.title}</span>
        </div>
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', flexDirection:'column', gap:'2rem'}}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '1rem',
            padding: '3rem 2rem',
            maxWidth: '540px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div style={{fontSize: '3.5rem', filter: 'drop-shadow(0 0 10px rgba(244,98,42,0.4))'}}>🎮</div>
            <h2 style={{fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em'}}>Jogar Demo no Itch.io</h2>
            <p style={{color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0'}}>
              Este jogo é hospedado no <strong>Itch.io</strong>. Para garantir a melhor performance, suporte completo a gamepads e evitar downloads automáticos indesejados, recomendamos jogar a demo diretamente em uma nova aba.
            </p>
            <a
              href={cleanedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                padding: '0.8rem 2.5rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                borderRadius: '9999px',
                boxShadow: '0 0 20px rgba(244,98,42,0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginTop: '0.5rem'
              }}
            >
              Jogar Demo Externamente 🚀
            </a>
            <button 
              onClick={() => setTryIframe(true)}
              style={{
                color: 'var(--color-text-faint)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                textDecoration: 'underline',
                border: 'none',
                background: 'none',
                marginTop: '1rem'
              }}
            >
              Tentar carregar na plataforma mesmo assim
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{background:'#000', minHeight:'calc(100dvh - 65px)', display:'flex', flexDirection:'column'}}>
      <div style={{padding:'0.75rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem', borderBottom:'1px solid var(--color-border)', background:'var(--color-surface)'}}>
        <Link to={`/game/${slug}`} className="btn btn-ghost" style={{padding:'0.3rem 0.8rem', fontSize:'var(--text-xs)'}}>← voltar</Link>
        <span style={{fontSize:'var(--text-sm)', color:'var(--color-text-muted)'}}>{game.title}</span>
      </div>
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', flexDirection:'column', gap:'1.5rem'}}>
        <iframe
          src={cleanedUrl}
          title={game.title}
          width="960"
          height="600"
          frameBorder="0"
          scrolling="no"
          allowFullScreen={true}
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          msallowfullscreen="true"
          style={{border:'none', borderRadius:'0.5rem', maxWidth:'100%'}}
          allow="autoplay; fullscreen *; gamepad; gyroscope; accelerometer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}
