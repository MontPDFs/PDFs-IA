import { useState, useRef } from 'react'

// Lee prompts guardados del localStorage, fallback al defecto
function getStoredPrompt(id, defaultContent) {
  try {
    const saved = localStorage.getItem('mvppdfs_prompts')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed[id]?.content) return parsed[id].content
    }
  } catch {}
  return defaultContent
}
import { useNavigate } from 'react-router-dom'
import { Navbar, Btn, Tag, Spinner } from '../components/UI'

const AC = '#FF6B00'

// ── Pollinations image URL ────────────────────────────────────────────────────
function imgUrl(prompt, seed = 1, w = 800, h = 500) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', professional, high quality, photorealistic')}?width=${w}&height=${h}&seed=${seed}&nologo=true`
}

// ── THEMES ────────────────────────────────────────────────────────────────────
const THEMES = [
  {
    id: 'gamma_dark', name: 'Gamma Dark', style: 'gamma', icon: '🌑',
    desc: 'Oscuro con acentos naranjas — negocios, ventas, marketing',
    niches: ['negocio', 'venta', 'marketing', 'finanza', 'dinero'],
    vars: { bg: '#0a0a0a', bg2: '#111', bg3: '#1a1a1a', accent: '#FF6B00', accent2: '#ff8c00', text: '#fff', text2: '#ccc', text3: '#888', card: '#1e1e1e', border: '#2a2a2a' },
  },
  {
    id: 'gamma_purple', name: 'Gamma Purple', style: 'gamma', icon: '💜',
    desc: 'Violeta vibrante — coaching, desarrollo personal, cursos',
    niches: ['coach', 'personal', 'curso', 'aprendiz', 'habit'],
    vars: { bg: '#0d0a1e', bg2: '#130d2e', bg3: '#1a1040', accent: '#a855f7', accent2: '#c084fc', text: '#fff', text2: '#e2d9f3', text3: '#9ca3af', card: '#1a1040', border: '#2d1b69' },
  },
  {
    id: 'gamma_green', name: 'Gamma Green', style: 'gamma', icon: '🌿',
    desc: 'Verde natural — salud, bienestar, cosmética, nutrición',
    niches: ['salud', 'bienestar', 'natural', 'cosmet', 'nutri', 'respir', 'ansiedad', 'ejercicio'],
    vars: { bg: '#f0faf4', bg2: '#fff', bg3: '#e8f5e9', accent: '#16a34a', accent2: '#22c55e', text: '#1a1a1a', text2: '#374151', text3: '#6b7280', card: '#fff', border: '#d1fae5' },
  },
  {
    id: 'editorial_cream', name: 'Editorial Cream', style: 'editorial', icon: '📖',
    desc: 'Elegante crema — bienestar, lifestyle, libros, guías',
    niches: ['guia', 'libro', 'vida', 'lifestyle', 'bienestar', 'ansiedad', 'respir'],
    vars: { bg: '#faf8f5', bg2: '#fff', bg3: '#f5f0e8', accent: '#c87941', accent2: '#d4956a', text: '#1a1209', text2: '#3d3020', text3: '#8a7560', card: '#fff', border: '#e8ddd0' },
  },
  {
    id: 'editorial_minimal', name: 'Editorial Minimal', style: 'editorial', icon: '⬜',
    desc: 'Blanco y negro puro — profesional, educativo, técnico',
    niches: ['tecnolog', 'educac', 'profesional', 'tecnic', 'product'],
    vars: { bg: '#ffffff', bg2: '#f8f8f8', bg3: '#f0f0f0', accent: '#1a1a1a', accent2: '#333', text: '#1a1a1a', text2: '#444', text3: '#888', card: '#f8f8f8', border: '#e0e0e0' },
  },
  {
    id: 'editorial_luxury', name: 'Editorial Luxury', style: 'editorial', icon: '✨',
    desc: 'Dorado oscuro — moda, lujo, premium, alta gama',
    niches: ['moda', 'lujo', 'premium', 'luxury', 'estetic', 'belleza'],
    vars: { bg: '#1a1209', bg2: '#221809', bg3: '#2a2010', accent: '#d4a017', accent2: '#e8b820', text: '#f5f0e8', text2: '#d4c9a8', text3: '#a89060', card: '#2a2010', border: '#3a2d10' },
  },
]

function detectTheme(nicho = '', tono = '') {
  const text = (nicho + ' ' + tono).toLowerCase()
  for (const t of THEMES) {
    if (t.niches.some(n => text.includes(n))) return t.id
  }
  return 'gamma_dark'
}

// ── ICONS (SVG inline simples) ────────────────────────────────────────────────
const ICONS = ['⭐', '🎯', '💡', '✅', '🔑', '🚀', '💪', '🌟', '📌', '🎪', '🔥', '💎', '🌈', '⚡', '🏆', '🎁', '🌺', '🦋', '🌙', '☀️']

function randomIcon(seed) { return ICONS[seed % ICONS.length] }

// ── RENDER GAMMA PAGE ─────────────────────────────────────────────────────────
function GammaPage({ page, theme, index, onEdit }) {
  const v = theme.vars
  const isDark = v.bg.startsWith('#0') || v.bg.startsWith('#1')

  const pageStyle = {
    width: '210mm', minHeight: '297mm', background: v.bg,
    fontFamily: "'Inter', sans-serif", position: 'relative',
    overflow: 'hidden', pageBreakAfter: 'always',
  }

  if (page.type === 'cover') {
    return (
      <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column' }}>
        {/* Cover image */}
        <div style={{ height: '55%', position: 'relative', overflow: 'hidden' }}>
          <img src={imgUrl(page.imagePrompt || page.titulo, index)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="anonymous" />
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to bottom, transparent 40%, ${v.bg} 100%)`,
          }} />
        </div>
        {/* Cover content */}
        <div style={{ padding: '8mm 16mm', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '8pt', color: v.accent, letterSpacing: '3px', fontWeight: 700, marginBottom: '4mm', textTransform: 'uppercase' }}>
            {page.categoria || 'GUÍA COMPLETA'}
          </div>
          <h1 style={{ fontSize: '28pt', fontWeight: 900, lineHeight: 1.1, color: v.text, marginBottom: '4mm', fontFamily: "'DM Sans', sans-serif" }}>
            {page.titulo}
          </h1>
          {page.subtitulo && (
            <p style={{ fontSize: '12pt', color: v.text2, lineHeight: 1.5, marginBottom: '6mm' }}>
              {page.subtitulo}
            </p>
          )}
          <div style={{ width: '30mm', height: '2px', background: v.accent }} />
        </div>
      </div>
    )
  }

  if (page.type === 'section_title') {
    return (
      <div style={{
        ...pageStyle,
        background: v.accent,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '20mm',
      }}>
        <div style={{ fontSize: '60pt', marginBottom: '8mm' }}>{randomIcon(index)}</div>
        <div style={{ fontSize: '8pt', color: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)', letterSpacing: '3px', marginBottom: '4mm', textTransform: 'uppercase' }}>
          {page.label || `SECCIÓN ${index}`}
        </div>
        <h2 style={{ fontSize: '32pt', fontWeight: 900, color: isDark ? '#000' : '#fff', lineHeight: 1.1, fontFamily: "'DM Sans', sans-serif" }}>
          {page.titulo}
        </h2>
        {page.subtitulo && (
          <p style={{ fontSize: '13pt', color: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)', marginTop: '6mm', lineHeight: 1.5 }}>
            {page.subtitulo}
          </p>
        )}
      </div>
    )
  }

  if (page.type === 'content_cards') {
    return (
      <div style={{ ...pageStyle, padding: '16mm' }}>
        <h3 style={{ fontSize: '16pt', fontWeight: 800, color: v.accent, marginBottom: '8mm', fontFamily: "'DM Sans', sans-serif" }}>
          {page.titulo}
        </h3>
        {page.intro && (
          <p style={{ fontSize: '10pt', color: v.text2, lineHeight: 1.7, marginBottom: '8mm' }}>{page.intro}</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5mm' }}>
          {(page.cards || []).map((card, i) => (
            <div key={i} style={{
              background: v.card, borderRadius: '4mm', padding: '5mm',
              border: `1px solid ${v.border}`,
            }}>
              <div style={{ fontSize: '20pt', marginBottom: '3mm' }}>{randomIcon(i + index)}</div>
              <div style={{ fontSize: '9pt', fontWeight: 700, color: v.text, marginBottom: '2mm' }}>{card.titulo}</div>
              <div style={{ fontSize: '8pt', color: v.text3, lineHeight: 1.5 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (page.type === 'content_bullets') {
    return (
      <div style={{ ...pageStyle, padding: '16mm' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4mm', marginBottom: '6mm' }}>
          <div style={{ width: '4px', height: '30pt', background: v.accent, borderRadius: '2px' }} />
          <h3 style={{ fontSize: '16pt', fontWeight: 800, color: v.text, fontFamily: "'DM Sans', sans-serif" }}>
            {page.titulo}
          </h3>
        </div>
        {page.intro && (
          <p style={{ fontSize: '10pt', color: v.text2, lineHeight: 1.7, marginBottom: '8mm' }}>{page.intro}</p>
        )}
        {(page.bullets || []).map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: '4mm', marginBottom: '5mm', alignItems: 'flex-start' }}>
            <div style={{
              width: '7mm', height: '7mm', background: v.accent,
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '8pt', color: isDark ? '#000' : '#fff',
              fontWeight: 700, flexShrink: 0, marginTop: '1mm',
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10pt', fontWeight: 700, color: v.text, marginBottom: '1mm' }}>{b.titulo}</div>
              <div style={{ fontSize: '9pt', color: v.text2, lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          </div>
        ))}
        {page.tip && (
          <div style={{
            background: v.accent + '22', border: `1px solid ${v.accent}44`,
            borderRadius: '3mm', padding: '5mm', marginTop: '6mm',
            borderLeft: `4px solid ${v.accent}`,
          }}>
            <div style={{ fontSize: '8pt', color: v.accent, fontWeight: 700, marginBottom: '2mm', letterSpacing: '1px' }}>💡 TIP CLAVE</div>
            <div style={{ fontSize: '9pt', color: v.text2, lineHeight: 1.6 }}>{page.tip}</div>
          </div>
        )}
      </div>
    )
  }

  if (page.type === 'content_image') {
    return (
      <div style={{ ...pageStyle, padding: '16mm' }}>
        <h3 style={{ fontSize: '14pt', fontWeight: 800, color: v.text, marginBottom: '5mm', fontFamily: "'DM Sans', sans-serif" }}>
          {page.titulo}
        </h3>
        <div style={{ borderRadius: '4mm', overflow: 'hidden', marginBottom: '6mm', height: '70mm' }}>
          <img src={imgUrl(page.imagePrompt || page.titulo, index + 10)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="anonymous" />
        </div>
        <p style={{ fontSize: '10pt', color: v.text2, lineHeight: 1.7 }}>{page.content}</p>
      </div>
    )
  }

  if (page.type === 'quote') {
    return (
      <div style={{
        ...pageStyle, padding: '20mm',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        background: v.bg2,
      }}>
        <div style={{ fontSize: '60pt', color: v.accent, lineHeight: 0.8, marginBottom: '8mm', fontFamily: 'serif' }}>"</div>
        <p style={{ fontSize: '16pt', color: v.text, lineHeight: 1.5, fontStyle: 'italic', marginBottom: '8mm', fontFamily: "'Playfair Display', serif" }}>
          {page.content}
        </p>
        {page.author && (
          <div style={{ fontSize: '10pt', color: v.accent, fontWeight: 700 }}>— {page.author}</div>
        )}
      </div>
    )
  }

  if (page.type === 'cta') {
    return (
      <div style={{
        ...pageStyle, padding: '20mm',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', background: v.accent,
      }}>
        <div style={{ fontSize: '48pt', marginBottom: '8mm' }}>🎯</div>
        <h2 style={{ fontSize: '24pt', fontWeight: 900, color: isDark ? '#000' : '#fff', marginBottom: '6mm', fontFamily: "'DM Sans', sans-serif" }}>
          {page.titulo}
        </h2>
        <p style={{ fontSize: '12pt', color: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)', marginBottom: '10mm', maxWidth: '140mm', lineHeight: 1.6 }}>
          {page.content}
        </p>
        <div style={{
          background: isDark ? '#000' : '#fff',
          color: isDark ? v.accent : v.accent,
          padding: '4mm 10mm', borderRadius: '3mm',
          fontSize: '12pt', fontWeight: 800,
        }}>{page.cta || 'Comenzar ahora'}</div>
      </div>
    )
  }

  // Default content page
  return (
    <div style={{ ...pageStyle, padding: '16mm' }}>
      <h3 style={{ fontSize: '14pt', fontWeight: 800, color: v.text, marginBottom: '6mm' }}>{page.titulo}</h3>
      <p style={{ fontSize: '10pt', color: v.text2, lineHeight: 1.7 }}>{page.content || ''}</p>
    </div>
  )
}

// ── RENDER EDITORIAL PAGE ─────────────────────────────────────────────────────
function EditorialPage({ page, theme, index }) {
  const v = theme.vars
  const isDark = v.bg.startsWith('#1') || v.bg.startsWith('#0')

  const pageStyle = {
    width: '210mm', minHeight: '297mm',
    background: v.bg, fontFamily: "'Playfair Display', serif",
    position: 'relative', overflow: 'hidden', pageBreakAfter: 'always',
  }

  if (page.type === 'cover') {
    return (
      <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '50%', position: 'relative', overflow: 'hidden' }}>
          <img src={imgUrl(page.imagePrompt || page.titulo, index, 800, 600)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="anonymous" />
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to bottom, ${v.accent}22 0%, ${v.bg} 90%)`,
          }} />
        </div>
        <div style={{ padding: '10mm 18mm', flex: 1 }}>
          <div style={{ width: '20mm', height: '3px', background: v.accent, marginBottom: '6mm' }} />
          <p style={{ fontSize: '8pt', letterSpacing: '3px', color: v.accent, fontWeight: 700, marginBottom: '4mm', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
            {page.categoria || 'GUÍA COMPLETA'}
          </p>
          <h1 style={{ fontSize: '30pt', fontWeight: 900, lineHeight: 1.1, color: v.text, marginBottom: '4mm' }}>
            {page.titulo}
          </h1>
          {page.subtitulo && (
            <p style={{ fontSize: '12pt', color: v.text2, lineHeight: 1.5, fontStyle: 'italic', fontFamily: "'Inter', sans-serif" }}>
              {page.subtitulo}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (page.type === 'section_title') {
    return (
      <div style={{ ...pageStyle, padding: '20mm', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ width: '100%', height: '1px', background: v.accent, marginBottom: '10mm', opacity: 0.3 }} />
        <p style={{ fontSize: '8pt', letterSpacing: '4px', color: v.accent, fontWeight: 700, marginBottom: '6mm', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
          {page.label || `CAPÍTULO ${index}`}
        </p>
        <h2 style={{ fontSize: '28pt', fontWeight: 900, lineHeight: 1.15, color: v.text, marginBottom: '6mm' }}>
          {page.titulo}
        </h2>
        {page.subtitulo && (
          <p style={{ fontSize: '12pt', color: v.text2, lineHeight: 1.6, fontStyle: 'italic' }}>{page.subtitulo}</p>
        )}
        <div style={{ width: '100%', height: '1px', background: v.accent, marginTop: '10mm', opacity: 0.3 }} />
      </div>
    )
  }

  if (page.type === 'content_image') {
    const imgRight = index % 2 === 0
    return (
      <div style={{ ...pageStyle, padding: '16mm', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '14pt', fontWeight: 700, color: v.accent, marginBottom: '6mm', fontFamily: "'Inter', sans-serif" }}>
          {page.titulo}
        </h3>
        <div style={{ display: 'flex', gap: '6mm', flex: 1 }}>
          {!imgRight && (
            <div style={{ width: '45%', flexShrink: 0, borderRadius: '3mm', overflow: 'hidden' }}>
              <img src={imgUrl(page.imagePrompt || page.titulo, index + 20, 400, 500)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                crossOrigin="anonymous" />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '10pt', color: v.text2, lineHeight: 1.8 }}>{page.content}</p>
            {(page.bullets || []).map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: '3mm', marginTop: '4mm' }}>
                <span style={{ color: v.accent, fontSize: '10pt' }}>{randomIcon(i + index)}</span>
                <span style={{ fontSize: '9pt', color: v.text2, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{b}</span>
              </div>
            ))}
          </div>
          {imgRight && (
            <div style={{ width: '45%', flexShrink: 0, borderRadius: '3mm', overflow: 'hidden' }}>
              <img src={imgUrl(page.imagePrompt || page.titulo, index + 20, 400, 500)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                crossOrigin="anonymous" />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (page.type === 'content_bullets') {
    return (
      <div style={{ ...pageStyle, padding: '16mm' }}>
        <h3 style={{ fontSize: '14pt', fontWeight: 700, color: v.text, marginBottom: '3mm', fontFamily: "'Inter', sans-serif" }}>
          {page.titulo}
        </h3>
        <div style={{ width: '15mm', height: '2px', background: v.accent, marginBottom: '7mm' }} />
        {page.intro && (
          <p style={{ fontSize: '10pt', color: v.text2, lineHeight: 1.8, marginBottom: '7mm' }}>{page.intro}</p>
        )}
        {(page.bullets || []).map((b, i) => (
          <div key={i} style={{
            display: 'flex', gap: '4mm', marginBottom: '5mm', alignItems: 'flex-start',
            paddingBottom: '5mm', borderBottom: i < (page.bullets.length - 1) ? `1px solid ${v.border}` : 'none',
          }}>
            <span style={{ fontSize: '16pt', flexShrink: 0 }}>{randomIcon(i + index)}</span>
            <div>
              <div style={{ fontSize: '10pt', fontWeight: 700, color: v.text, marginBottom: '1mm', fontFamily: "'Inter', sans-serif" }}>{b.titulo}</div>
              <div style={{ fontSize: '9pt', color: v.text2, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{b.desc}</div>
            </div>
          </div>
        ))}
        {page.tip && (
          <div style={{
            background: v.bg3, borderLeft: `3px solid ${v.accent}`,
            padding: '5mm 6mm', borderRadius: '0 3mm 3mm 0', marginTop: '4mm',
          }}>
            <div style={{ fontSize: '8pt', color: v.accent, fontWeight: 700, marginBottom: '2mm', fontFamily: "'Inter', sans-serif", letterSpacing: '1px' }}>NOTA IMPORTANTE</div>
            <div style={{ fontSize: '9pt', color: v.text2, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{page.tip}</div>
          </div>
        )}
      </div>
    )
  }

  if (page.type === 'quote') {
    return (
      <div style={{ ...pageStyle, padding: '24mm', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '80pt', color: v.accent, lineHeight: 0.7, marginBottom: '6mm', opacity: 0.4 }}>"</div>
        <p style={{ fontSize: '18pt', color: v.text, lineHeight: 1.5, fontStyle: 'italic', marginBottom: '8mm' }}>
          {page.content}
        </p>
        {page.author && (
          <div style={{ fontSize: '10pt', color: v.accent, fontFamily: "'Inter', sans-serif" }}>— {page.author}</div>
        )}
      </div>
    )
  }

  if (page.type === 'cta') {
    return (
      <div style={{
        ...pageStyle, padding: '24mm',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{ width: '40mm', height: '2px', background: v.accent, marginBottom: '10mm' }} />
        <h2 style={{ fontSize: '22pt', fontWeight: 900, color: v.text, marginBottom: '6mm' }}>{page.titulo}</h2>
        <p style={{ fontSize: '11pt', color: v.text2, lineHeight: 1.7, marginBottom: '10mm', maxWidth: '130mm', fontFamily: "'Inter', sans-serif" }}>
          {page.content}
        </p>
        <div style={{
          border: `2px solid ${v.accent}`, padding: '4mm 12mm',
          fontSize: '11pt', fontWeight: 700, color: v.accent,
          fontFamily: "'Inter', sans-serif", letterSpacing: '1px',
        }}>{page.cta || 'COMENZAR AHORA'}</div>
        <div style={{ width: '40mm', height: '2px', background: v.accent, marginTop: '10mm' }} />
      </div>
    )
  }

  // Default
  return (
    <div style={{ ...pageStyle, padding: '16mm' }}>
      <h3 style={{ fontSize: '14pt', fontWeight: 700, color: v.text, marginBottom: '6mm', fontFamily: "'Inter', sans-serif" }}>{page.titulo}</h3>
      <p style={{ fontSize: '10pt', color: v.text2, lineHeight: 1.8 }}>{page.content}</p>
    </div>
  )
}

// ── Page renderer ─────────────────────────────────────────────────────────────
function PageRenderer({ page, theme, index, onEdit }) {
  const style = theme.style
  const wrap = {
    border: '1px solid #333', borderRadius: 4, overflow: 'hidden',
    cursor: 'pointer', transition: 'all .15s', transform: 'scale(1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  }
  return (
    <div style={wrap} onClick={() => onEdit && onEdit(index)}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.border = `1px solid ${AC}` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.border = '1px solid #333' }}
    >
      <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: '285%', pointerEvents: 'none' }}>
        {style === 'gamma'
          ? <GammaPage page={page} theme={theme} index={index} />
          : <EditorialPage page={page} theme={theme} index={index} />
        }
      </div>
    </div>
  )
}

// ── Generate pages from ebook data ────────────────────────────────────────────
function buildPages(data, theme) {
  const pages = []
  const eb = data.ebook || data

  pages.push({
    type: 'cover',
    titulo: eb.titulo,
    subtitulo: eb.subtitulo,
    categoria: eb.categoria || eb.nicho,
    imagePrompt: `${eb.titulo} ${eb.nicho || ''} professional lifestyle`,
  })

  if (eb.introduccion) {
    pages.push({
      type: 'content_bullets',
      titulo: 'Introducción',
      intro: eb.introduccion,
      bullets: [],
    })
  }

  ;(eb.capitulos || []).forEach((cap, i) => {
    pages.push({
      type: 'section_title',
      titulo: cap.titulo,
      subtitulo: cap.subtitulo,
      label: `CAPÍTULO ${cap.numero || i + 1}`,
    })

    if (theme.style === 'editorial' && cap.contenido) {
      pages.push({
        type: 'content_image',
        titulo: cap.titulo,
        content: cap.contenido,
        imagePrompt: `${cap.titulo} professional`,
        bullets: (cap.puntos_clave || []).slice(0, 3),
      })
    }

    if (cap.puntos_clave && cap.puntos_clave.length > 0) {
      pages.push({
        type: 'content_bullets',
        titulo: cap.titulo,
        intro: cap.contenido,
        bullets: cap.puntos_clave.map(p => ({ titulo: p, desc: '' })),
        tip: cap.tip,
      })
    }

    if (theme.style === 'gamma' && i % 3 === 2) {
      pages.push({
        type: 'content_cards',
        titulo: 'Puntos clave de esta sección',
        cards: (cap.puntos_clave || []).slice(0, 4).map(p => ({ titulo: p, desc: cap.tip || '' })),
      })
    }
  })

  ;(eb.bonos || []).forEach((bono, i) => {
    pages.push({
      type: 'section_title',
      titulo: `BONO ${bono.numero || i + 1}: ${bono.titulo}`,
      subtitulo: bono.objecion_que_resuelve,
      label: 'BONUS',
    })
    pages.push({
      type: 'content_bullets',
      titulo: bono.titulo,
      intro: bono.descripcion,
      bullets: (bono.contenido_resumen || []).map(p => ({ titulo: p, desc: '' })),
    })
  })

  pages.push({
    type: 'cta',
    titulo: eb.titulo,
    content: eb.subtitulo || eb.tagline || '',
    cta: 'Comenzar ahora',
  })

  return pages
}

// ── STEP 1: Form ──────────────────────────────────────────────────────────────
function StepForm({ onNext }) {
  const [modo, setModo] = useState('ebook') // 'ebook' | 'pau'
  const [titulo, setTitulo] = useState('')
  const [nicho, setNicho] = useState('')
  const [tono, setTono] = useState('cercano y motivacional')
  const [precio, setPrecio] = useState('')
  const [numCaps, setNumCaps] = useState(50)
  const [numBonos, setNumBonos] = useState(3)
  const [paginasPorBono, setPaginasPorBono] = useState(10)
  const [script, setScript] = useState('')
  const [extra, setExtra] = useState('')
  const [voces, setVoces] = useState('')
  const [promptReferencia, setPromptReferencia] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [err, setErr] = useState('')

  const submit = () => {
    if (!script.trim() && !titulo.trim()) {
      setErr('Pegá el script del anuncio o completá el título')
      return
    }
    if (script.trim().length < 50 && !titulo.trim()) {
      setErr('El script es muy corto. Pegá al menos 50 caracteres.')
      return
    }
    onNext({ modo, titulo, nicho, tono, precio, numCaps, numBonos, paginasPorBono, script, extra, voces, promptReferencia })
  }

  const TONOS = ['cercano y motivacional', 'profesional y serio', 'directo y urgente', 'educativo y claro', 'inspirador y empático']

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Tag>PASO 01 — CONTENIDO</Tag>

      {/* Selector de modo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0 28px' }}>
        {[
          {
            id: 'ebook', icon: '📖', title: 'Ebook / Guía',
            desc: 'Genera un ebook completo con capítulos, contenido detallado, imágenes IA y diseño profesional.',
            color: AC,
          },
          {
            id: 'pau', icon: '⚡', title: 'PAU Completo',
            desc: 'Sistema de 5 prompts en cadena. Analiza el anuncio y genera estructura, contenido y bonos listos para vender.',
            color: '#a855f7',
          },
        ].map(m => (
          <div key={m.id} onClick={() => setModo(m.id)} style={{
            background: modo === m.id ? m.color + '11' : '#111',
            border: `2px solid ${modo === m.id ? m.color : '#222'}`,
            borderRadius: 14, padding: 18, cursor: 'pointer',
            transition: 'all .15s',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: modo === m.id ? m.color : '#fff', marginBottom: 6 }}>{m.title}</div>
            <div style={{ color: '#666', fontSize: 12, lineHeight: 1.5 }}>{m.desc}</div>
            {modo === m.id && (
              <div style={{ marginTop: 10, fontSize: 11, color: m.color, fontWeight: 700 }}>✓ Seleccionado</div>
            )}
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px' }}>
        {modo === 'pau' ? '⚡ Crear PAU desde anuncio' : '📖 Crear ebook / guía'}
      </h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
        {modo === 'pau'
          ? 'Pegá el script o copy del anuncio. La IA corre 5 prompts en cadena y genera el PAU completo con bonos.'
          : 'Pegá el script de tu video, el guion, o cualquier información. La IA arma todo.'
        }
      </p>

      {/* Prompt de referencia — destacado arriba */}
      <div style={{
        background: '#0d0a1e', border: '1px solid #a855f733',
        borderRadius: 12, padding: 16, marginBottom: 20,
      }}>
        <button onClick={() => setShowPrompt(!showPrompt)} style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#a855f7', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
              🔮 Prompt de referencia estratégica
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              Alimenta la IA con ángulos, referencias, tipos de ebooks y recomendaciones
            </div>
          </div>
          <span style={{ color: '#a855f7', fontSize: 18 }}>{showPrompt ? '▲' : '▼'}</span>
        </button>

        {showPrompt && (
          <div style={{ marginTop: 14 }}>
            <p style={{ color: '#888', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
              Este campo es poderoso: colocá aquí ángulos de venta, referencias de ebooks exitosos, 
              tipos de contenido que funcionan en tu nicho, recomendaciones de expertos, tendencias del mercado, 
              o cualquier prompt estratégico que quieras que la IA use como base para crear el ebook.
            </p>
            <p style={{ color: '#555', fontSize: 11, marginBottom: 10, fontStyle: 'italic' }}>
              Ej: "Los ebooks de bienestar más vendidos en 2024 usan un tono de acompañamiento, no de enseñanza. 
              El ángulo que mejor convierte es el de 'ya intentaste todo y nada funcionó'. 
              Referencia: el estilo de Mel Robbins, directo y sin filtros. 
              El capítulo 1 siempre debe validar el dolor del lector antes de dar soluciones..."
            </p>
            <textarea
              value={promptReferencia}
              onChange={e => setPromptReferencia(e.target.value)}
              placeholder="Pegá aquí tu prompt estratégico: ángulos de venta, referencias de ebooks exitosos, tipos de contenido que funcionan, tendencias del nicho, estilo de escritura de referencia..."
              rows={6}
              style={{ fontSize: 13, lineHeight: 1.6, borderColor: '#a855f744', background: '#130d2e' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ color: '#555', fontSize: 11 }}>Más contexto estratégico = ebook más alineado al mercado</span>
              <span style={{ color: promptReferencia.length > 100 ? '#a855f7' : '#555', fontSize: 11 }}>{promptReferencia.length} car.</span>
            </div>
          </div>
        )}
      </div>

      {/* Script — campo principal */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', color: '#666', fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
          Script del video / Guion / Información principal ✦
        </label>
        <textarea value={script} onChange={e => { setScript(e.target.value); setErr('') }}
          placeholder="Pegá aquí el script completo de tu video, el guion de tu curso, la descripción de tu producto, o cualquier texto que quieras transformar en ebook..."
          rows={8} style={{ fontSize: 13, lineHeight: 1.7 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ color: '#555', fontSize: 11 }}>Más contenido = mejor ebook</span>
          <span style={{ color: script.length > 100 ? '#22c55e' : '#555', fontSize: 11 }}>{script.length} caracteres</span>
        </div>
      </div>

      {/* Campos opcionales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={{ display: 'block', color: '#666', fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>Título del ebook (opcional)</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="La IA lo genera si no ponés nada" />
        </div>
        <div>
          <label style={{ display: 'block', color: '#666', fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>Nicho / Tema</label>
          <input value={nicho} onChange={e => setNicho(e.target.value)} placeholder="salud, negocios, coaching..." />
        </div>
        <div>
          <label style={{ display: 'block', color: '#666', fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>Precio de venta</label>
          <input value={precio} onChange={e => setPrecio(e.target.value)} placeholder="$47 USD" />
        </div>
      </div>

      {/* Tono */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', color: '#666', fontSize: 11, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Tono del contenido</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TONOS.map(t => (
            <button key={t} onClick={() => setTono(t)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              background: tono === t ? AC : '#1e1e1e',
              color: tono === t ? '#000' : '#888',
              border: `1px solid ${tono === t ? AC : '#333'}`,
              fontWeight: tono === t ? 700 : 400,
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Sliders — capítulos hasta 200 + bonos + páginas por bono */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ color: '#666', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Capítulos del ebook</label>
          <span style={{ color: AC, fontWeight: 700, fontSize: 16 }}>{numCaps}</span>
        </div>
        <input type="range" min={3} max={200} step={1} value={numCaps}
          onChange={e => setNumCaps(+e.target.value)} style={{ width: '100%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ color: '#555', fontSize: 11 }}>3 mínimo</span>
          <span style={{ color: '#555', fontSize: 11 }}>
            ≈ {Math.ceil(numCaps * 2.5)} páginas totales
          </span>
          <span style={{ color: '#555', fontSize: 11 }}>200 máximo</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ color: '#666', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Bonos</label>
            <span style={{ color: AC, fontWeight: 700, fontSize: 16 }}>{numBonos}</span>
          </div>
          <input type="range" min={0} max={10} step={1} value={numBonos}
            onChange={e => setNumBonos(+e.target.value)} style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: '#555', fontSize: 11 }}>0</span>
            <span style={{ color: '#555', fontSize: 11 }}>10 bonos</span>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ color: '#666', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Páginas por bono</label>
            <span style={{ color: AC, fontWeight: 700, fontSize: 16 }}>{paginasPorBono}</span>
          </div>
          <input type="range" min={5} max={50} step={1} value={paginasPorBono}
            onChange={e => setPaginasPorBono(+e.target.value)} style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: '#555', fontSize: 11 }}>5</span>
            <span style={{ color: '#555', fontSize: 11 }}>50 págs.</span>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div style={{
        background: '#111', border: '1px solid #222', borderRadius: 10,
        padding: '12px 16px', marginBottom: 18,
        display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 10,
      }}>
        {[
          { v: numCaps, l: 'capítulos' },
          { v: Math.ceil(numCaps * 2.5), l: 'páginas ebook' },
          { v: numBonos, l: 'bonos' },
          { v: numBonos > 0 ? numBonos * paginasPorBono : 0, l: 'págs. bonos' },
          { v: Math.ceil(numCaps * 2.5) + (numBonos * paginasPorBono), l: 'total páginas' },
        ].map(({ v, l }) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ color: AC, fontWeight: 900, fontSize: 20 }}>{v}</div>
            <div style={{ color: '#555', fontSize: 10 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Voces reales del mercado */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          background: '#0a1a0a', border: '1px solid #16a34a44',
          borderRadius: 12, padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>💬</span>
            <label style={{ color: '#22c55e', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              Voces reales del mercado (opcional pero muy poderoso)
            </label>
          </div>
          <p style={{ color: '#555', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
            Pegá aquí comentarios reales de clientes, reseñas, quejas en redes, problemas que reportaron, 
            cosas que intentaron y no funcionaron, preguntas frecuentes. 
            La IA usa esto para que el contenido hable exactamente el idioma de tu cliente.
          </p>
          <textarea value={voces} onChange={e => setVoces(e.target.value)}
            placeholder={"Ejemplos: \"Ya probé de todo y nada me funciona...\" / \"Me cuesta la constancia\" / \"Quisiera algo más simple\" / Comentarios de redes, reseñas, quejas frecuentes..."}
            rows={5} style={{ fontSize: 13, lineHeight: 1.6, borderColor: '#16a34a44', background: '#061006' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: '#374a37', fontSize: 11 }}>Más voces reales = contenido más conectado con el cliente</span>
            <span style={{ color: voces.length > 50 ? '#22c55e' : '#374a37', fontSize: 11 }}>{voces.length} car.</span>
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', color: '#666', fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
          Instrucciones adicionales para la IA (opcional)
        </label>
        <textarea value={extra} onChange={e => setExtra(e.target.value)}
          placeholder="Ej: El capítulo 3 debe hablar de respiración 4-7-8. Incluir ejercicios prácticos. El público son mujeres 30-50 años con ansiedad..."
          rows={3} style={{ fontSize: 13 }} />
      </div>

      {err && <p style={{ color: '#ff4444', fontSize: 13, marginBottom: 12 }}>{err}</p>}
      <Btn fullWidth onClick={submit} style={{ padding: '14px', fontSize: 15 }}>
        Continuar → Elegir diseño
      </Btn>
    </div>
  )
}

// ── STEP 2: Theme selector ────────────────────────────────────────────────────
function StepTheme({ formData, onNext, onBack }) {
  const recommended = detectTheme(formData.nicho, formData.script)
  const [sel, setSel] = useState(recommended)
  const gamma = THEMES.filter(t => t.style === 'gamma')
  const editorial = THEMES.filter(t => t.style === 'editorial')

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Tag>PASO 02 — DISEÑO</Tag>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: '12px 0 6px' }}>Elegí el estilo de diseño</h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 6 }}>
        Recomendado para tu nicho: <strong style={{ color: AC }}>{THEMES.find(t => t.id === recommended)?.name}</strong>
      </p>
      <p style={{ color: '#555', fontSize: 12, marginBottom: 24 }}>
        Gamma Style = slides visuales con colores · Editorial Style = libro profesional con imágenes
      </p>

      <h3 style={{ color: '#888', fontSize: 12, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>🎨 Gamma Style</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {gamma.map(t => (
          <ThemeCard key={t.id} theme={t} selected={sel === t.id} recommended={t.id === recommended} onSelect={() => setSel(t.id)} />
        ))}
      </div>

      <h3 style={{ color: '#888', fontSize: 12, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>📖 Editorial Style</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
        {editorial.map(t => (
          <ThemeCard key={t.id} theme={t} selected={sel === t.id} recommended={t.id === recommended} onSelect={() => setSel(t.id)} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="ghost" onClick={onBack}>← Volver</Btn>
        <Btn fullWidth onClick={() => onNext(THEMES.find(t => t.id === sel))} style={{ padding: '14px' }}>
          Generar ebook con este diseño →
        </Btn>
      </div>
    </div>
  )
}

function ThemeCard({ theme, selected, recommended, onSelect }) {
  const v = theme.vars
  return (
    <div onClick={onSelect} style={{
      border: `2px solid ${selected ? AC : '#2a2a2a'}`,
      borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
      transition: 'all .15s', transform: selected ? 'scale(1.02)' : 'scale(1)',
    }}>
      <div style={{ background: v.bg, height: 80, padding: 12, position: 'relative' }}>
        {recommended && <span style={{ position: 'absolute', top: 6, left: 6, background: '#16a34a', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>REC.</span>}
        {selected && <span style={{ position: 'absolute', top: 6, right: 6, background: AC, color: '#000', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>✓</span>}
        <div style={{ width: '60%', height: 6, background: v.accent, borderRadius: 3, marginBottom: 5 }} />
        <div style={{ width: '80%', height: 4, background: v.text, opacity: 0.4, borderRadius: 3, marginBottom: 3 }} />
        <div style={{ width: '50%', height: 4, background: v.text3, opacity: 0.3, borderRadius: 3 }} />
      </div>
      <div style={{ padding: '8px 10px', background: '#111' }}>
        <p style={{ fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{theme.icon} {theme.name}</p>
        <p style={{ color: '#555', fontSize: 10, lineHeight: 1.4 }}>{theme.desc}</p>
      </div>
    </div>
  )
}


// ── STEP 2.5: Arquitectura PAU (revisión antes de generar contenido) ──────────
function StepArquitectura({ formData, onNext, onBack }) {
  const [loading, setLoading] = useState(true)
  const [arq, setArq] = useState(null)
  const [error, setError] = useState('')
  const [editingNombre, setEditingNombre] = useState(0)
  const [log, setLog] = useState(['Analizando el anuncio...'])
  const add = msg => setLog(p => [...p, msg])

  useState(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { script, extra, voces, promptReferencia, numCaps, numBonos, paginasPorBono } = formData

        const stored = getStoredPrompt('pau_1_analisis', '')
        const prompt = stored || [
          'Actúa como un estratega experto en productos digitales low ticket premium ($3-$47 USD) para LATAM.',
          'Un PAU NO es un libro académico ni contenido teórico. Es una herramienta práctica que da resultados en 1-3 días.',
          '',
          'Analizá este script/copy de anuncio:',
          'SCRIPT DEL ANUNCIO:',
          script,
          extra ? 'INFORMACIÓN ADICIONAL:\n' + extra : '',
          voces ? '\nVOCES REALES DEL MERCADO (usá estas expresiones y problemas reales en el contenido):\n' + voces : '',
          promptReferencia ? 'REFERENCIA ESTRATÉGICA:\n' + promptReferencia : '',
          '',
          'Generá la ARQUITECTURA COMPLETA (sin contenido todavía):',
          '',
          '1. ANÁLISIS: dolores detectados (min 4), avatar detallado, nicho, ángulo de venta principal',
          '2. NOMBRES (5 opciones): resultado + velocidad + herramienta. Nada genérico.',
          '3. TRANSFORMACIÓN: ANTES (6 puntos) y DESPUÉS (6 puntos)',
          '4. ESTRUCTURA: ' + numCaps + ' capítulos con título, problema que resuelve, resultado concreto, páginas estimadas, elementos prácticos',
          '   Arco: Diagnóstico → Fundamentos → Sistema central → Herramientas → Problemas comunes → Resultados → Próximos pasos',
          '5. BONOS: ' + numBonos + ' bonos, cada uno con nombre poderoso, lógica de complemento, estructura y valor percibido. Cada bono ~' + paginasPorBono + ' págs.',
          '6. TONO Y ESTILO: cómo debe sonar, nivel de lenguaje, 8 frases motivadoras naturales',
          '',
          'Respondé SOLO con JSON válido sin markdown:',
          '{',
          '  "analisis": {"dolores":["..."],"avatar":"...","nicho":"...","angulo":"..."},',
          '  "nombres": [{"nombre":"...","subtitulo":"...","hook":"..."},{"nombre":"...","subtitulo":"...","hook":"..."},{"nombre":"...","subtitulo":"...","hook":"..."},{"nombre":"...","subtitulo":"...","hook":"..."},{"nombre":"...","subtitulo":"...","hook":"..."}],',
          '  "nombre_recomendado": 0,',
          '  "transformacion": {"antes":["...","...","...","...","...","..."],"despues":["...","...","...","...","...","..."]},',
          '  "capitulos": [{"numero":1,"titulo":"...","problema":"...","resultado":"...","paginas":5,"elementos":["plantilla","checklist"],"frase_cierre":"Esto si lo puedo hacer"}],',
          '  "bonos": [{"numero":1,"titulo":"...","subtitulo":"...","logica":"...","estructura":["seccion 1","seccion 2"],"valor_percibido":"$XX","paginas":20}],',
          '  "tono": {"descripcion":"...","nivel":"...","frases_motivadoras":["...","...","...","...","...","...","...","..."]}',
          '}',
        ].filter(Boolean).join('\n')

        if (!cancelled) { add('Generando nombres y posicionamiento...') }

        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, maxTokens: 8192 }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error en Gemini')

        const parsed = JSON.parse(data.text.replace(/```json|```/g, '').trim())
        if (!cancelled) {
          add('Arquitectura lista — revisá y ajustá antes de continuar')
          setArq(parsed)
          setEditingNombre(parsed.nombre_recomendado || 0)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  if (loading) return (
    <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
      <Tag color="#a855f7">ANALIZANDO</Tag>
      <h2 style={{ fontSize: 24, fontWeight: 900, margin: '12px 0 6px' }}>Construyendo la arquitectura del PAU</h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 28 }}>Analizando el anuncio, dolores y estructura óptima...</p>
      <div style={{ background: '#222', borderRadius: 100, height: 6, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#a855f7', borderRadius: 100, width: '60%', animation: 'pulse 2s infinite' }} />
      </div>
      <Spinner color="#a855f7" />
      <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 10, padding: 18, fontFamily: 'monospace', fontSize: 12, textAlign: 'left', marginTop: 20 }}>
        {log.map((l, i) => (
          <div key={i} style={{ color: i === log.length - 1 ? '#a855f7' : '#444', marginBottom: 6, display: 'flex', gap: 8 }}>
            <span>{i === log.length - 1 ? '►' : '✓'}</span>{l}
          </div>
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ color: '#ff4444', marginBottom: 16 }}>Error: {error}</p>
      <Btn onClick={onBack}>← Volver</Btn>
    </div>
  )

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Tag color="#a855f7">ARQUITECTURA PAU — REVISÁ ANTES DE GENERAR</Tag>
      <h2 style={{ fontSize: 24, fontWeight: 900, margin: '12px 0 6px' }}>Arquitectura lista</h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
        Revisá la estructura. Podés continuar o volver para ajustar el script y los datos.
      </p>

      {/* Análisis */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <p style={{ color: '#a855f7', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ANÁLISIS DEL ANUNCIO</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <p style={{ color: '#555', fontSize: 11, marginBottom: 4 }}>NICHO</p>
            <p style={{ color: '#ccc', fontSize: 13 }}>{arq.analisis?.nicho}</p>
          </div>
          <div>
            <p style={{ color: '#555', fontSize: 11, marginBottom: 4 }}>ÁNGULO DE VENTA</p>
            <p style={{ color: '#ccc', fontSize: 13 }}>{arq.analisis?.angulo}</p>
          </div>
        </div>
        <p style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>DOLORES DETECTADOS</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(arq.analisis?.dolores || []).map((d, i) => (
            <span key={i} style={{ background: '#1a0000', border: '1px solid #330000', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#ff6b6b' }}>
              ✗ {d}
            </span>
          ))}
        </div>
      </div>

      {/* Selector de nombre */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <p style={{ color: '#a855f7', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>ELEGÍ EL NOMBRE DEL PAU</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(arq.nombres || []).map((n, i) => (
            <div key={i} onClick={() => setEditingNombre(i)} style={{
              background: editingNombre === i ? '#1a1040' : '#0a0a0a',
              border: `1.5px solid ${editingNombre === i ? '#a855f7' : '#222'}`,
              borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
              transition: 'all .15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 15, color: editingNombre === i ? '#c084fc' : '#ccc', marginBottom: 3 }}>{n.nombre}</p>
                  <p style={{ color: '#666', fontSize: 12 }}>{n.subtitulo}</p>
                  {n.hook && <p style={{ color: '#555', fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>"{n.hook}"</p>}
                </div>
                {editingNombre === i && (
                  <span style={{ color: '#a855f7', fontSize: 18, flexShrink: 0 }}>✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transformación */}
      {arq.transformacion && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ background: '#1a0000', border: '1px solid #330000', borderRadius: 12, padding: 16 }}>
            <p style={{ color: '#ff4444', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>ANTES</p>
            {(arq.transformacion.antes || []).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#ff4444', fontSize: 11 }}>✗</span>
                <span style={{ color: '#ff8888', fontSize: 12, lineHeight: 1.5 }}>{a}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#001a00', border: '1px solid #004400', borderRadius: 12, padding: 16 }}>
            <p style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>DESPUÉS</p>
            {(arq.transformacion.despues || []).map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#22c55e', fontSize: 11 }}>✓</span>
                <span style={{ color: '#86efac', fontSize: 12, lineHeight: 1.5 }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capítulos */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <p style={{ color: '#a855f7', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
          ESTRUCTURA — {(arq.capitulos || []).length} CAPÍTULOS · {(arq.capitulos || []).reduce((s, c) => s + (c.paginas || 0), 0)} PÁGINAS
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(arq.capitulos || []).map((cap, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < arq.capitulos.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
              <span style={{ color: '#a855f7', fontWeight: 900, fontSize: 13, flexShrink: 0, minWidth: 24 }}>{cap.numero || i + 1}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#ccc', marginBottom: 3 }}>{cap.titulo}</p>
                <p style={{ color: '#555', fontSize: 11, marginBottom: 4 }}>{cap.resultado}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(cap.elementos || []).map((e, j) => (
                    <span key={j} style={{ background: '#1a1040', borderRadius: 4, padding: '2px 7px', fontSize: 10, color: '#c084fc' }}>{e}</span>
                  ))}
                </div>
              </div>
              <span style={{ color: '#555', fontSize: 11, flexShrink: 0 }}>{cap.paginas}p</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bonos */}
      {(arq.bonos || []).length > 0 && (
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <p style={{ color: '#a855f7', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            BONOS — {(arq.bonos || []).length} documentos adicionales
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(arq.bonos || []).map((b, i) => (
              <div key={i} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ background: '#a855f722', border: '1px solid #a855f744', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: '#a855f7', fontWeight: 700 }}>BONO {b.numero || i + 1}</span>
                    <p style={{ fontWeight: 800, fontSize: 14, color: '#ccc', marginTop: 6, marginBottom: 3 }}>{b.titulo}</p>
                    <p style={{ color: '#555', fontSize: 12 }}>{b.logica}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 13 }}>{b.valor_percibido}</p>
                    <p style={{ color: '#555', fontSize: 11 }}>{b.paginas}p</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="ghost" onClick={onBack} style={{ flexShrink: 0 }}>← Ajustar datos</Btn>
        <Btn fullWidth onClick={() => onNext({ ...arq, nombreSeleccionado: editingNombre })}
          style={{ padding: '14px', background: '#a855f7', fontSize: 15 }}>
          ✓ Aprobado — Generar contenido completo →
        </Btn>
      </div>
    </div>
  )
}

// ── STEP 3: Generating ────────────────────────────────────────────────────────
function StepGenerating({ formData, theme, arquitectura, onDone }) {
  const [prog, setProg] = useState(0)
  const [log, setLog] = useState(['Analizando tu contenido...'])
  const add = msg => setLog(p => [...p, msg])

  useState(() => {
    let cancelled = false
    const run = async () => {
      await new Promise(r => setTimeout(r, 500))
      if (!cancelled) { add('Estructurando capítulos y bonos...'); setProg(20) }

      try {
        const { modo, titulo, nicho, tono, precio, numCaps, numBonos, paginasPorBono, script, extra, promptReferencia } = formData

        // ── PAU MODE: Prompt 2 (El Escritor) usando arquitectura aprobada ─────
        if (modo === 'pau') {
          if (!cancelled) { add('FASE 2 — Escribiendo contenido completo del PAU...'); setProg(10) }
          const arq = arquitectura || {}
          const nombreIdx = arq.nombreSeleccionado || 0
          const nombreElegido = (arq.nombres || [])[nombreIdx]?.nombre || formData.titulo || 'PAU Principal'
          const avatarDesc = arq.analisis?.avatar || ''
          const doloresDesc = (arq.analisis?.dolores || []).join(', ')
          const tono = arq.tono?.descripcion || formData.tono
          const frases = (arq.tono?.frases_motivadoras || []).join(', ')
          const capsEstructura = (arq.capitulos || []).map(c => c.titulo).join('\n')

          if (!cancelled) { add('PASO 1/3 — Escribiendo primera mitad del PAU...'); setProg(15) }

          // Prompt 2 — El Escritor (primera mitad)
          const mitad = Math.ceil(numCaps / 2)
          const storedP2 = getStoredPrompt('pau_2_contenido_primera_mitad', '')
          const prompt2 = storedP2 || [
            'Sos el mejor escritor de infoproductos para LATAM. Tono: ' + tono,
            'Como alguien con experiencia real explicándole a un principiante.',
            '',
            'PAU: "' + nombreElegido + '"',
            'AVATAR: ' + avatarDesc,
            'DOLORES: ' + doloresDesc,
            voces ? 'VOCES REALES DEL MERCADO (usá estas expresiones textuales en el contenido): ' + voces : '',
            'FRASES MOTIVADORAS A INSERTAR NATURALMENTE: ' + frases,
            '',
            'Escribí el contenido COMPLETO de los primeros ' + mitad + ' capítulos:',
            capsEstructura.split('\n').slice(0, mitad).join('\n'),
            '',
            'REGLAS DE ESCRITURA CRÍTICAS:',
            '- Frases cortas. Párrafos cortos (máximo 3-4 líneas)',
            '- NUNCA más de 2 párrafos seguidos sin un elemento visual',
            '- Usar: listas con bullets, tablas comparativas, pasos numerados',
            '- CUADROS DE ERROR COMÚN: ⚠️ ERROR COMÚN / ✅ Lo correcto',
            '- DATOS CLAVE: 💡 DATO CLAVE con información importante',
            '- ⚡ TIP RÁPIDO cada 2-3 párrafos',
            '- ✅ CHECKLISTS con casillas al final de cada sección práctica',
            '- 🎯 MINI PASO DE ACCIÓN al final de cada capítulo (algo concreto para hacer HOY)',
            '- Gancho emocional al inicio de cada capítulo (situación real que el lector reconozca)',
            '- Plantillas y checklists: escribirlas COMPLETAS y listas para usar',
            '- Ejemplos reales con números concretos',
            '- Cero relleno — cada párrafo aporta valor práctico o emocional',
            '',
            'Mínimo 400 palabras de contenido real por capítulo.',
            '',
            'Respondé SOLO con JSON válido sin markdown:',
            '{"capitulos":[{"numero":1,"titulo":"...","contenido":"texto completo con formato visual incluido...","puntos_clave":["...","...","..."],"tip":"consejo practico aplicable hoy","tipo":"contenido"}]}',
          ].filter(Boolean).join('\n')

          const res2a = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: prompt2, maxTokens: 8192 }) })
          const data2a = await res2a.json()
          if (!res2a.ok) throw new Error(data2a.error || 'Error Prompt 2')
          const caps1 = JSON.parse(data2a.text.replace(/```json|```/g, '').trim())

          if (!cancelled) { add('PASO 2/3 — Escribiendo segunda mitad + cierre + plan 72hs...'); setProg(45) }

          // Prompt 3 — El Escritor (segunda mitad + cierre)
          const storedP3 = getStoredPrompt('pau_3_contenido_segunda_mitad', '')
          const prompt3 = storedP3 || [
            'Continuá escribiendo el PAU. Mismo tono: ' + tono,
            '',
            'PAU: "' + nombreElegido + '"',
            'AVATAR: ' + avatarDesc,
            '',
            'Escribí el contenido COMPLETO de los capítulos restantes (' + (mitad + 1) + ' al ' + numCaps + '):',
            capsEstructura.split('\n').slice(mitad).join('\n'),
            '',
            'Mismas reglas de escritura: párrafos cortos, elementos visuales cada 1-2 párrafos,',
            'cuadros de ERROR COMÚN, DATOS CLAVE, TIPS RÁPIDOS, CHECKLISTS, PASOS DE ACCIÓN.',
            'Mínimo 400 palabras por capítulo.',
            '',
            'Al final incluí:',
            '- RESUMEN PRÁCTICO: checklist de todo lo aprendido',
            '- PLAN DE ACCIÓN 72hs: qué hacer ahora, mañana y en 3 días (pasos numerados, concretos)',
            '- CARTA DE CIERRE: mensaje motivador genuino, 10 líneas máximo (tipo carta del autor)',
            '',
            'Respondé SOLO con JSON válido sin markdown:',
            '{"capitulos":[{"numero":' + (mitad + 1) + ',"titulo":"...","contenido":"texto completo...","puntos_clave":["..."],"tip":"...","tipo":"contenido"}],"cierre":"carta del autor completa...","plan_accion":["Ahora: paso 1","Mañana: paso 2","En 3 días: paso 3"]}',
          ].filter(Boolean).join('\n')

          const res3 = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: prompt3, maxTokens: 8192 }) })
          const data3 = await res3.json()
          if (!res3.ok) throw new Error(data3.error || 'Error Prompt 3')
          const caps2 = JSON.parse(data3.text.replace(/```json|```/g, '').trim())

          if (!cancelled) { add('PASO 3/3 — Generando contenido de bonos...'); setProg(72) }

          // Prompts 4+5 — Bonos (estructura ya viene de la arquitectura)
          const bonosArq = arq.bonos || []
          const storedP5 = getStoredPrompt('pau_5_bonos_contenido', '')
          const prompt5 = storedP5 || [
            'Escribí el contenido COMPLETO de estos ' + numBonos + ' bonos:',
            bonosArq.map(b => '- BONO ' + b.numero + ': ' + b.titulo + ' — ' + (b.logica || '')).join('\n'),
            '',
            'Cada bono: ~' + paginasPorBono + ' páginas de contenido real (250 palabras/página).',
            'Mismo tono que el PAU: ' + tono,
            '',
            'Para cada bono incluí:',
            '- Portada con nombre + subtítulo + frase gancho',
            '- Introducción breve: para qué sirve y cómo usarlo junto al PAU',
            '- Contenido completo con plantillas y checklists ESCRITOS ENTEROS (no solo mencionados)',
            '- Mismos elementos visuales: ERROR COMÚN, DATO CLAVE, TIPS, CHECKLISTS',
            '- Cierre: 🎯 PASO DE ACCIÓN de las próximas 24 horas',
            '',
            'Respondé SOLO con JSON válido sin markdown:',
            '{"bonos":[{"numero":1,"titulo":"...","contenido_completo":"texto completo del bono...","herramientas":["plantilla 1 completa","checklist 1"],"plan_accion_24hs":["Paso 1: ...","Paso 2: ..."]}]}',
          ].filter(Boolean).join('\n')

          const res5 = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: prompt5, maxTokens: 8192 }) })
          const data5 = await res5.json()
          if (!res5.ok) throw new Error(data5.error || 'Error Prompt 5')
          const bonosContenido = JSON.parse(data5.text.replace(/```json|```/g, '').trim())

          const todosLosCaps = [...(caps1.capitulos || []), ...(caps2.capitulos || [])]

          const ebookData = {
            ebook: {
              titulo: nombreElegido,
              subtitulo: (arq.nombres || [])[nombreIdx]?.subtitulo || '',
              tagline: (arq.nombres || [])[nombreIdx]?.hook || '',
              nicho: arq.analisis?.nicho || formData.nicho,
              categoria: 'PAU — PRODUCTO DE ALTA UTILIDAD',
              introduccion: 'Avatar: ' + avatarDesc + '. Dolores: ' + doloresDesc,
              capitulos: todosLosCaps.map((c, i) => ({
                numero: i + 1,
                titulo: c.titulo,
                subtitulo: c.tipo === 'plantilla' ? 'Plantilla lista para usar' : c.tipo === 'checklist' ? 'Checklist accionable' : 'Contenido detallado',
                contenido: c.contenido,
                puntos_clave: c.puntos_clave || [],
                tip: c.tip || '',
              })),
              bonos: (bonosContenido.bonos || bonosArq).map((b, i) => ({
                numero: i + 1,
                titulo: b.titulo,
                objecion_que_resuelve: b.logica || bonosArq[i]?.logica || '',
                descripcion: b.contenido_completo || bonosArq[i]?.logica || '',
                contenido_resumen: b.herramientas || bonosArq[i]?.estructura || [],
              })),
              cierre: caps2.cierre || '',
              plan_accion: caps2.plan_accion || [],
              analisis: arq.analisis,
              nombres_alternativos: arq.nombres || [],
            }
          }

          if (!cancelled) { add('PAU completo con Prompt 2 (El Escritor) ✓'); setProg(100) }
          await new Promise(r => setTimeout(r, 300))
          if (!cancelled) onDone({ ebookData, pages: buildPages(ebookData, theme), modo: 'pau' })
          return
        }

        // ── EBOOK MODE (original) ──────────────────────────────────────────────
        const prompt = [
          'Sos el mejor escritor de infoproductos y ebooks para LATAM.',
          '',
          'Creá un ebook completo basado en esta información:',
          script ? `SCRIPT/CONTENIDO PRINCIPAL:\n${script}` : '',
          titulo ? `TÍTULO SUGERIDO: ${titulo}` : '',
          nicho ? `NICHO: ${nicho}` : '',
          tono ? `TONO: ${tono}` : '',
          precio ? `PRECIO DE VENTA: ${precio}` : '',
          extra ? `INSTRUCCIONES ADICIONALES:\n${extra}` : '',
          formData.voces ? `\nVOCES REALES DEL MERCADO (usá estas expresiones en el contenido para que resuene con el lector):\n${formData.voces}` : '',
          promptReferencia ? `\nPROMPT DE REFERENCIA ESTRATEGICA (usá esto como guia de angulos, estilos y recomendaciones de mercado):\n${promptReferencia}` : '',
          numBonos > 0 ? `Cada bono debe tener aproximadamente ${paginasPorBono} paginas de contenido.` : '',
          '',
          `Generá exactamente ${numCaps} capítulos y ${numBonos} bonos.`,
          'Cada capítulo debe tener contenido rico y detallado. Usá el mismo vocabulario y estilo del script.',
          '',
          'Responde SOLO con JSON válido sin markdown:',
          '{',
          '  "ebook": {',
          '    "titulo": "...",',
          '    "subtitulo": "...",',
          '    "tagline": "...",',
          '    "nicho": "...",',
          '    "categoria": "...",',
          '    "introduccion": "texto de introduccion detallado...",',
          '    "capitulos": [',
          '      {"numero":1,"titulo":"...","subtitulo":"...","contenido":"parrafo detallado del contenido...","puntos_clave":["punto 1","punto 2","punto 3","punto 4"],"tip":"consejo practico aplicable hoy"}',
          '    ],',
          '    "bonos": [',
          '      {"numero":1,"titulo":"...","objecion_que_resuelve":"...","descripcion":"...","contenido_resumen":["punto 1","punto 2","punto 3"]}',
          '    ]',
          '  }',
          '}',
        ].filter(Boolean).join('\n')

        if (!cancelled) { add('Llamando a Gemini IA...'); setProg(40) }

        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, maxTokens: 8192 }),
        })

        if (!cancelled) { add('Procesando respuesta...'); setProg(65) }
        const data = await res.json()

        let ebookData
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Error en IA')
        }

        const text = data.text.replace(/```json|```/g, '').trim()
        ebookData = JSON.parse(text)

        if (!cancelled) { add('Construyendo páginas con diseño...'); setProg(82) }
        await new Promise(r => setTimeout(r, 400))

        const pages = buildPages(ebookData, theme)

        if (!cancelled) { add('Preparando imágenes con IA...'); setProg(95) }
        await new Promise(r => setTimeout(r, 300))

        if (!cancelled) { add('¡Ebook listo! Revisá y editá antes de descargar'); setProg(100) }
        await new Promise(r => setTimeout(r, 300))
        if (!cancelled) onDone({ ebookData, pages })

      } catch (err) {
        console.error(err)
        if (!cancelled) { add(`Error de IA: ${err.message} — usando demo`); setProg(60) }
        await new Promise(r => setTimeout(r, 400))

        // Demo fallback
        const demo = {
          ebook: {
            titulo: formData.titulo || '100 Ejercicios para Calmar la Ansiedad',
            subtitulo: 'Guía práctica para recuperar tu paz interior',
            tagline: 'Herramientas reales para días difíciles',
            nicho: formData.nicho || 'bienestar',
            categoria: 'GUÍA COMPLETA',
            introduccion: 'Este ebook nació de la experiencia real. Cada ejercicio fue seleccionado por su efectividad comprobada para reducir la ansiedad en minutos, sin medicamentos ni conocimiento previo.',
            capitulos: Array.from({ length: formData.numCaps }, (_, i) => ({
              numero: i + 1,
              titulo: `Técnica ${i + 1}: ${['Respiración Consciente', 'Anclaje Sensorial', 'Movimiento Liberador', 'Escritura Terapéutica', 'Visualización Guiada', 'Conexión con la Naturaleza', 'Rutina de Gratitud'][i % 7]}`,
              subtitulo: 'Ejercicios prácticos para implementar hoy',
              contenido: 'La respiración es el puente entre tu cuerpo y tu mente. Es automática, sí, pero también puede volverse consciente. Cuando respiras de forma intencional, puedes calmar tu sistema nervioso y anclar tu atención.',
              puntos_clave: ['Técnica 4-7-8 para calma inmediata', 'Respiración diafragmática profunda', 'Exhalación prolongada anti-ansiedad', 'Respiración de fuego (versión suave)'],
              tip: 'Practicá este ejercicio 3 veces al día durante 5 minutos para ver resultados en menos de una semana.',
            })),
            bonos: Array.from({ length: formData.numBonos }, (_, i) => ({
              numero: i + 1,
              titulo: `Bono ${i + 1}: ${['Diario de Ansiedad', 'Meditaciones Guiadas', 'Plan de 30 Días'][i % 3]}`,
              objecion_que_resuelve: 'No tengo tiempo para practicar',
              descripcion: 'Complemento esencial que maximiza los resultados del programa principal.',
              contenido_resumen: ['Rutina de 5 minutos', 'Para cualquier momento del día', 'Sin experiencia previa', 'Resultados desde el día 1'],
            })),
          }
        }
        const pages = buildPages(demo, theme)
        if (!cancelled) { add('Demo listo — configurá Gemini para contenido real'); setProg(100) }
        await new Promise(r => setTimeout(r, 300))
        if (!cancelled) onDone({ ebookData: demo, pages })
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
      <Tag>GENERANDO</Tag>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: '12px 0 6px' }}>Creando tu ebook</h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 28 }}>Diseño: {theme.name}</p>

      <div style={{ background: '#222', borderRadius: 100, height: 6, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: AC, borderRadius: 100, width: `${prog}%`, transition: 'width .5s ease' }} />
      </div>
      <Spinner />

      <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 10, padding: 18, fontFamily: 'monospace', fontSize: 12, textAlign: 'left', marginTop: 20 }}>
        {log.map((l, i) => (
          <div key={i} style={{ color: i === log.length - 1 ? AC : '#444', marginBottom: 6, display: 'flex', gap: 8 }}>
            <span>{i === log.length - 1 ? '►' : '✓'}</span>{l}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── STEP 4: Editor + Export ───────────────────────────────────────────────────
function StepEditor({ ebookData, pages: initPages, theme, onRestart }) {
  const [pages, setPages] = useState(initPages)
  const [view, setView] = useState('grid')
  const [current, setCurrent] = useState(0)
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef(null)

  const exportPDF = async () => {
    setExporting(true)
    try {
      if (!window.html2pdf) {
        await new Promise((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
          s.onload = res; s.onerror = rej
          document.head.appendChild(s)
        })
      }
      const el = exportRef.current
      await window.html2pdf().set({
        margin: 0,
        filename: `${ebookData.ebook?.titulo || 'ebook'}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 1.5, useCORS: true, allowTaint: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'css', before: '.page-break' },
      }).from(el).save()
    } catch (e) {
      alert('Error al exportar PDF: ' + e.message)
    } finally {
      setExporting(false)
    }
  }

  const eb = ebookData.ebook || ebookData

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, flexWrap: 'wrap', gap: 10,
        background: '#111', border: '1px solid #222', borderRadius: 12, padding: '14px 18px',
      }}>
        <div>
          <Tag color="#22c55e">LISTO</Tag>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginTop: 6, marginBottom: 2 }}>{eb.titulo}</h2>
          <p style={{ color: '#666', fontSize: 12 }}>{pages.length} páginas · Tema: {theme.name} · {theme.style === 'gamma' ? 'Gamma Style' : 'Editorial Style'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setView(v => v === 'grid' ? 'single' : 'grid')} style={{
            background: '#1e1e1e', border: '1px solid #333', borderRadius: 8,
            padding: '8px 14px', cursor: 'pointer', color: '#ccc', fontSize: 13,
          }}>
            {view === 'grid' ? '▤ Vista única' : '⊞ Vista grilla'}
          </button>
          <Btn onClick={exportPDF} disabled={exporting} style={{ padding: '8px 18px' }}>
            {exporting ? '⏳ Exportando...' : '⬇ Descargar PDF'}
          </Btn>
          <Btn variant="ghost" onClick={onRestart} style={{ padding: '8px 14px' }}>Nuevo</Btn>
        </div>
      </div>

      <p style={{ color: '#555', fontSize: 12, marginBottom: 16 }}>
        Click en cualquier página para seleccionarla
      </p>

      {/* Grid view */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {pages.map((page, i) => (
            <div key={i}>
              <PageRenderer page={page} theme={theme} index={i} onEdit={setCurrent} />
              <p style={{ color: '#444', fontSize: 9, textAlign: 'center', marginTop: 4 }}>
                {i + 1} · {page.type}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Single view */}
      {view === 'single' && (
        <div>
          <div style={{ maxWidth: 600, margin: '0 auto 16px' }}>
            <PageRenderer page={pages[current]} theme={theme} index={current} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600, margin: '0 auto 12px' }}>
            <Btn variant="ghost" onClick={() => setCurrent(p => Math.max(0, p - 1))} style={{ padding: '8px 16px' }}>←</Btn>
            <span style={{ color: '#666', fontSize: 13 }}>{current + 1} / {pages.length}</span>
            <Btn variant="ghost" onClick={() => setCurrent(p => Math.min(pages.length - 1, p + 1))} style={{ padding: '8px 16px' }}>→</Btn>
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, maxWidth: 600, margin: '0 auto' }}>
            {pages.map((_, i) => (
              <div key={i} onClick={() => setCurrent(i)} style={{
                width: 44, height: 28, flexShrink: 0, borderRadius: 4,
                border: `2px solid ${i === current ? AC : '#333'}`,
                background: '#1e1e1e', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: i === current ? AC : '#555',
              }}>{i + 1}</div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden export element */}
      <div ref={exportRef} style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
        {pages.map((page, i) => (
          <div key={i} className="page-break" style={{ width: '210mm' }}>
            {theme.style === 'gamma'
              ? <GammaPage page={page} theme={theme} index={i} />
              : <EditorialPage page={page} theme={theme} index={i} />
            }
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Generator ────────────────────────────────────────────────────────────
export default function Generator() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState(null)
  const [theme, setTheme] = useState(null)
  const [result, setResult] = useState(null)
  const [arquitectura, setArquitectura] = useState(null)

  const STEPS = ['Contenido', 'Diseño', 'Arquitectura', 'Generando', 'Editor']

  const dots = STEPS.map((label, i) => (
    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', transition: 'all .3s',
        background: i === step ? AC : i < step ? '#22c55e' : '#222',
        border: i === step ? `2px solid ${AC}` : '2px solid transparent',
      }} />
      {i < STEPS.length - 1 && <div style={{ width: 20, height: 1, background: '#333' }} />}
    </div>
  ))

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar right={
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{dots}</div>
          <span style={{ color: '#555', fontSize: 12 }}>{STEPS[step]}</span>
        </div>
      } />

      <div style={{ padding: '44px 24px 80px' }}>
        {step === 0 && <StepForm onNext={d => { setFormData(d); setStep(1) }} />}
        {step === 1 && <StepTheme formData={formData} onNext={t => { setTheme(t); setStep(formData?.modo === 'pau' ? 2 : 3) }} onBack={() => setStep(0)} />}
        {step === 2 && formData?.modo === 'pau' && (
          <StepArquitectura
            formData={formData}
            onNext={arq => { setArquitectura(arq); setStep(3) }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && <StepGenerating formData={formData} theme={theme} arquitectura={arquitectura} onDone={r => { setResult(r); setStep(4) }} />}
        {step === 4 && result && (
          <StepEditor
            ebookData={result.ebookData}
            pages={result.pages}
            theme={theme}
            onRestart={() => { setStep(0); setFormData(null); setTheme(null); setResult(null); setArquitectura(null) }}
          />
        )}
      </div>
    </div>
  )
}
