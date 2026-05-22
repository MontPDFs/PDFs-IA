import { useNavigate } from 'react-router-dom'
import { Navbar, Btn } from '../components/UI'

const AC = '#FF6B00'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar right={
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={() => navigate('/prompts')} style={{ padding: '8px 14px', fontSize: 13 }}>⚙️ Prompts</Btn>
          <Btn onClick={() => navigate('/crear')}>Crear PDF gratis →</Btn>
        </div>
      } />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '70px 24px 80px' }}>

        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-block', background: '#1a0f00',
            border: `1px solid ${AC}44`, borderRadius: 20,
            padding: '6px 16px', fontSize: 11, color: AC,
            letterSpacing: 2, fontWeight: 700,
          }}>✦ GENERADOR DE EBOOKS CON IA</span>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.05, marginBottom: 20 }}>
            PDFs profesionales<br />
            <span style={{ color: AC }}>mejores que Gamma.</span>
          </h1>
          <p style={{ color: '#aaa', fontSize: 18, maxWidth: 540, margin: '0 auto 32px' }}>
            Pegá el script de tu video o cualquier idea. La IA genera un ebook completo con diseño editorial, imágenes IA y exportación en PDF real.
          </p>
          <Btn onClick={() => navigate('/crear')} style={{ padding: '16px 40px', fontSize: 16 }}>
            Crear mi ebook ahora →
          </Btn>
        </div>

        {/* Features grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 56 }}>
          {[
            { icon: '📝', title: 'Script o ideas', desc: 'Pegá el guion de tu video, descripción del producto o cualquier texto. La IA lo transforma en contenido estructurado.' },
            { icon: '🎨', title: 'Diseño editorial', desc: 'Portada con imagen IA, páginas con iconos, diagramas, texto corrido y callouts. Mejor que cualquier plantilla.' },
            { icon: '⬇️', title: 'PDF real descargable', desc: 'No es captura de pantalla. Es un PDF vectorial de alta calidad listo para vender por WhatsApp o redes.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: '#111', border: '1px solid #222',
              borderRadius: 16, padding: 24,
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#777', fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Styles preview */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>
            Dos estilos de diseño
          </h2>
          <p style={{ color: '#777', textAlign: 'center', fontSize: 14, marginBottom: 28 }}>
            Gamma-style (slides visuales) o Editorial (libro profesional)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              {
                name: 'Gamma Style', icon: '🎨',
                desc: 'Slides visuales con fondos de color, iconos grandes, diagramas y callouts. Ideal para presentaciones y cursos.',
                color: '#a855f7', features: ['Fondos coloridos por sección', 'Iconos SVG automáticos', 'Diagramas de flujo', 'Cards y callouts visuales'],
              },
              {
                name: 'Editorial Style', icon: '📖',
                desc: 'Diseño tipo libro profesional. Texto corrido con imágenes flotantes, tipografía serif elegante y layout editorial.',
                color: AC, features: ['Portada con imagen IA', 'Texto + imagen por página', 'Tipografía editorial serif', 'Iconos por cada punto'],
              },
            ].map(s => (
              <div key={s.name} style={{
                background: '#111', border: `1px solid ${s.color}44`,
                borderRadius: 16, padding: 24,
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: s.color }}>{s.name}</h3>
                <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
                {s.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: s.color }}>✓</span>
                    <span style={{ color: '#ccc', fontSize: 13 }}>{f}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: '#111', border: `1px solid ${AC}33`,
          borderRadius: 20, padding: 40, textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>
            ¿Listo para crear tu ebook?
          </h2>
          <p style={{ color: '#888', fontSize: 15, marginBottom: 24 }}>
            Sin diseñador. Sin plantillas complicadas. Solo pegás tu contenido y listo.
          </p>
          <Btn onClick={() => navigate('/crear')} style={{ padding: '14px 36px', fontSize: 15 }}>
            Empezar ahora — es gratis →
          </Btn>
        </div>
      </div>
    </div>
  )
}
