import { useNavigate } from 'react-router-dom'
import { Navbar, Btn } from '../components/UI'

const AC = '#FF6B00'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar right={
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={() => navigate('/investigar')} style={{ padding: '8px 14px', fontSize: 13 }}>🔍 Investigar</Btn>
          <Btn variant="ghost" onClick={() => navigate('/prompts')} style={{ padding: '8px 14px', fontSize: 13 }}>⚙️ Prompts</Btn>
          <Btn onClick={() => navigate('/crear')}>Crear PDF gratis →</Btn>
        </div>
      } />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '70px 24px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-block', background: '#1a0f00',
            border: `1px solid ${AC}44`, borderRadius: 20,
            padding: '6px 16px', fontSize: 11, color: AC,
            letterSpacing: 2, fontWeight: 700,
          }}>✦ GENERADOR DE CONTENIDO CON IA</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.05, marginBottom: 20 }}>
            Contenido profesional<br />
            <span style={{ color: AC }}>listo para vender.</span>
          </h1>
          <p style={{ color: '#aaa', fontSize: 18, maxWidth: 540, margin: '0 auto 32px' }}>
            Pegá el script de tu video o cualquier idea. La IA genera el contenido completo de tu ebook y bonos listo para copiar y pegar en Gamma, Canva o cualquier IA de diseño.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Btn onClick={() => navigate('/investigar')} style={{ padding: '14px 28px', fontSize: 15, background: '#22c55e', color: '#000' }}>
              🔍 Investigar mercado →
            </Btn>
            <Btn onClick={() => navigate('/crear')} style={{ padding: '14px 28px', fontSize: 15 }}>
              ✍️ Crear contenido →
            </Btn>
          </div>
        </div>

        {/* Flujo */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 28 }}>
            Cómo funciona
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              {
                num: '01', icon: '🔍', color: '#22c55e',
                title: 'Investigás el mercado',
                desc: 'Pegás el script del anuncio, comentarios reales, reseñas o quejas. La IA detecta el avatar, dolores y te da 6 ideas de PDFs.',
              },
              {
                num: '02', icon: '⚙️', color: AC,
                title: 'Configurás el contenido',
                desc: 'Elegís cuántos capítulos, bonos y páginas querés. Podés agregar voces reales del mercado e instrucciones específicas.',
              },
              {
                num: '03', icon: '📋', color: '#a855f7',
                title: 'Copiás y diseñás',
                desc: 'La IA genera todo el contenido en texto plano. Copiás y pegás directo en Gamma, Canva, ChatGPT o cualquier IA de diseño.',
              },
            ].map(({ num, icon, color, title, desc }) => (
              <div key={num} style={{ background: '#111', border: `1px solid ${color}33`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ color, fontSize: 11, fontWeight: 900, letterSpacing: 2 }}>{num}</span>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color }}>{title}</h3>
                <p style={{ color: '#777', fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cards de acceso */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          <div style={{
            background: '#0a1a0a', border: '1px solid #22c55e33',
            borderRadius: 20, padding: 28, cursor: 'pointer',
          }} onClick={() => navigate('/investigar')}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Investigar mercado</h3>
            <p style={{ color: '#777', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Analizá el anuncio, comentarios y reseñas. La IA detecta el avatar, dolores, mecanismo y genera 6 ideas de PDFs y bonos listas para crear.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {['Avatar detectado', 'Dolores reales', 'Mecanismo único', 'Ideas de PDFs', 'Ángulos de venta'].map(f => (
                <span key={f} style={{ background: '#22c55e11', border: '1px solid #22c55e33', borderRadius: 5, padding: '3px 8px', fontSize: 11, color: '#22c55e' }}>✓ {f}</span>
              ))}
            </div>
            <button style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#22c55e', border: 'none', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              🔍 Analizar mercado →
            </button>
          </div>

          <div style={{
            background: '#0f0a00', border: `1px solid ${AC}33`,
            borderRadius: 20, padding: 28, cursor: 'pointer',
          }} onClick={() => navigate('/crear')}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>✍️</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Crear contenido</h3>
            <p style={{ color: '#777', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Configurás capítulos, bonos y páginas. La IA genera el contenido completo en texto plano listo para copiar y pegar en tu herramienta de diseño favorita.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {['Ebook completo', 'Bonos incluidos', 'Plan de acción', 'Carta de cierre', 'Listo para copiar'].map(f => (
                <span key={f} style={{ background: AC + '11', border: `1px solid ${AC}33`, borderRadius: 5, padding: '3px 8px', fontSize: 11, color: AC }}>✓ {f}</span>
              ))}
            </div>
            <button style={{ width: '100%', padding: '12px', borderRadius: 10, background: AC, border: 'none', color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              ✍️ Crear contenido →
            </button>
          </div>

        </div>

        {/* CTA final */}
        <div style={{ background: '#111', border: `1px solid #333`, borderRadius: 20, padding: 36, textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>
            Sin diseñador. Sin plantillas. Sin límites.
          </h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
            Solo pegás tu contenido, configurás lo que querés y copiás el resultado.
          </p>
          <Btn onClick={() => navigate('/crear')} style={{ padding: '14px 36px', fontSize: 15 }}>
            Empezar ahora — es gratis →
          </Btn>
        </div>

      </div>
    </div>
  )
}
