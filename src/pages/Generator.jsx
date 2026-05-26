import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Navbar, Btn, Tag, Spinner } from '../components/UI'

const AC = '#FF6B00'
const PU = '#a855f7'

// ── Lee prompts guardados ─────────────────────────────────────────────────────
function getStoredPrompt(id, fallback) {
  try {
    const saved = localStorage.getItem('mvppdfs_prompts')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed[id]?.content) return parsed[id].content
    }
  } catch {}
  return fallback
}

// ── Llamada a Gemini ──────────────────────────────────────────────────────────
async function callGemini(prompt, maxTokens = 8192) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, maxTokens }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error en Gemini')
  return data.text
}

// ── STEP 1: Formulario ────────────────────────────────────────────────────────
function StepForm({ onNext }) {
  const [searchParams] = useSearchParams()
  const [modo, setModo] = useState('ebook')
  const [titulo, setTitulo] = useState(searchParams.get('titulo') || '')
  const [nicho, setNicho] = useState('')
  const [tono, setTono] = useState('cercano y motivacional')
  const [numCaps, setNumCaps] = useState(50)
  const [numBonos, setNumBonos] = useState(3)
  const [paginasPorBono, setPaginasPorBono] = useState(15)
  const [script, setScript] = useState('')
  const [voces, setVoces] = useState('')
  const [extra, setExtra] = useState('')
  const [promptReferencia, setPromptReferencia] = useState(() => {
    const parts = []
    if (searchParams.get('avatar')) parts.push('AVATAR: ' + searchParams.get('avatar'))
    if (searchParams.get('problemas')) parts.push('PROBLEMAS: ' + searchParams.get('problemas'))
    if (searchParams.get('mecanismo')) parts.push('MECANISMO: ' + searchParams.get('mecanismo'))
    return parts.join('\n')
  })
  const [showPrompt, setShowPrompt] = useState(false)
  const [err, setErr] = useState('')

  const prefilled = searchParams.get('avatar') || searchParams.get('problemas')

  const submit = () => {
    if (!script.trim() && !titulo.trim()) {
      setErr('Pegá el script del anuncio o completá el título')
      return
    }
    onNext({ modo, titulo, nicho, tono, numCaps, numBonos, paginasPorBono, script, voces, extra, promptReferencia })
  }

  const TONOS = ['cercano y motivacional', 'profesional y serio', 'directo y urgente', 'educativo y claro', 'inspirador y empático']

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Tag>PASO 01 — CONFIGURAR</Tag>

      {/* Selector modo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0 24px' }}>
        {[
          { id: 'ebook', icon: '📖', title: 'Ebook / Guía', desc: 'Genera el contenido completo de un ebook con capítulos y bonos.', color: AC },
          { id: 'pau', icon: '⚡', title: 'PAU Completo', desc: 'Sistema de 5 prompts en cadena. Analiza el anuncio y genera estructura, contenido y bonos.', color: PU },
        ].map(m => (
          <div key={m.id} onClick={() => setModo(m.id)} style={{
            background: modo === m.id ? m.color + '11' : '#111',
            border: `2px solid ${modo === m.id ? m.color : '#222'}`,
            borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all .15s',
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: modo === m.id ? m.color : '#fff', marginBottom: 4 }}>{m.title}</div>
            <div style={{ color: '#666', fontSize: 12, lineHeight: 1.5 }}>{m.desc}</div>
            {modo === m.id && <div style={{ marginTop: 8, fontSize: 11, color: m.color, fontWeight: 700 }}>✓ Seleccionado</div>}
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px' }}>
        {modo === 'pau' ? '⚡ Crear PAU desde anuncio' : '📖 Crear ebook / guía'}
      </h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
        El resultado será el contenido completo en texto, listo para copiar y pegar en Gamma, Canva o cualquier IA de diseño.
      </p>

      {/* Prefill notice */}
      {prefilled && (
        <div style={{ background: '#0a1a0a', border: '1px solid #22c55e44', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
          <span>✓</span>
          <div>
            <p style={{ color: '#22c55e', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Datos importados desde Investigación de mercado</p>
            <p style={{ color: '#555', fontSize: 11 }}>Avatar, problemas y mecanismo ya cargados en el prompt de referencia</p>
          </div>
        </div>
      )}

      {/* Prompt referencia */}
      <div style={{ background: '#0d0a1e', border: '1px solid #a855f733', borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <button onClick={() => setShowPrompt(!showPrompt)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: PU, fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>🔮 Prompt de referencia estratégica</div>
            <div style={{ color: '#666', fontSize: 12 }}>Ángulos, referencias, tipos de ebooks, recomendaciones de mercado</div>
          </div>
          <span style={{ color: PU, fontSize: 16 }}>{showPrompt ? '▲' : '▼'}</span>
        </button>
        {showPrompt && (
          <div style={{ marginTop: 14 }}>
            <textarea value={promptReferencia} onChange={e => setPromptReferencia(e.target.value)}
              placeholder="Ángulos de venta que funcionan, referencias de ebooks exitosos, tendencias del nicho, estilo de escritura de referencia..."
              rows={5} style={{ fontSize: 13, lineHeight: 1.6, borderColor: '#a855f744', background: '#130d2e' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ color: '#555', fontSize: 11 }}>Más contexto = contenido más alineado al mercado</span>
              <span style={{ color: promptReferencia.length > 100 ? PU : '#555', fontSize: 11 }}>{promptReferencia.length} car.</span>
            </div>
          </div>
        )}
      </div>

      {/* Script */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', color: '#666', fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
          Script del video / Copy del anuncio / Información principal ✦
        </label>
        <textarea value={script} onChange={e => { setScript(e.target.value); setErr('') }}
          placeholder="Pegá aquí el script completo del video, el copy del anuncio, el guion del curso, o cualquier texto que quieras transformar en ebook..."
          rows={7} style={{ fontSize: 13, lineHeight: 1.7 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ color: '#555', fontSize: 11 }}>Más contenido = mejor resultado</span>
          <span style={{ color: script.length > 100 ? '#22c55e' : '#555', fontSize: 11 }}>{script.length} car.</span>
        </div>
      </div>

      {/* Voces reales */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ background: '#0a1a0a', border: '1px solid #16a34a44', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16 }}>💬</span>
            <label style={{ color: '#22c55e', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              Voces reales del mercado (opcional)
            </label>
          </div>
          <p style={{ color: '#555', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
            Comentarios reales, reseñas, quejas, preguntas frecuentes, frases de clientes.
            La IA habla exactamente el idioma de tu cliente.
          </p>
          <textarea value={voces} onChange={e => setVoces(e.target.value)}
            placeholder={"\"Ya probé de todo y nada me funciona...\" / \"Me cuesta la constancia\" / Comentarios de redes, reseñas, quejas frecuentes..."}
            rows={3} style={{ fontSize: 13, borderColor: '#16a34a44', background: '#061006' }} />
        </div>
      </div>

      {/* Campos opcionales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', color: '#666', fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>Título (opcional)</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="La IA lo genera si no ponés nada" />
        </div>
        <div>
          <label style={{ display: 'block', color: '#666', fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>Nicho / Tema</label>
          <input value={nicho} onChange={e => setNicho(e.target.value)} placeholder="salud, negocios, coaching..." />
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

      {/* Sliders */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label style={{ color: '#666', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Capítulos del ebook</label>
          <span style={{ color: AC, fontWeight: 700, fontSize: 16 }}>{numCaps}</span>
        </div>
        <input type="range" min={3} max={200} step={1} value={numCaps}
          onChange={e => setNumCaps(+e.target.value)} style={{ width: '100%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ color: '#555', fontSize: 11 }}>3</span>
          <span style={{ color: '#555', fontSize: 11 }}>≈ {Math.ceil(numCaps * 2.5)} páginas totales</span>
          <span style={{ color: '#555', fontSize: 11 }}>200</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 18 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ color: '#666', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Bonos</label>
            <span style={{ color: AC, fontWeight: 700, fontSize: 16 }}>{numBonos}</span>
          </div>
          <input type="range" min={0} max={10} step={1} value={numBonos}
            onChange={e => setNumBonos(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ color: '#666', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>Páginas por bono</label>
            <span style={{ color: AC, fontWeight: 700, fontSize: 16 }}>{paginasPorBono}</span>
          </div>
          <input type="range" min={5} max={50} step={1} value={paginasPorBono}
            onChange={e => setPaginasPorBono(+e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Resumen */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 16px', marginBottom: 18, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 10 }}>
        {[
          { v: numCaps, l: 'capítulos' },
          { v: Math.ceil(numCaps * 2.5), l: 'págs. ebook' },
          { v: numBonos, l: 'bonos' },
          { v: numBonos * paginasPorBono, l: 'págs. bonos' },
          { v: Math.ceil(numCaps * 2.5) + numBonos * paginasPorBono, l: 'total págs.' },
        ].map(({ v, l }) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ color: AC, fontWeight: 900, fontSize: 20 }}>{v}</div>
            <div style={{ color: '#555', fontSize: 10 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Instrucciones */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', color: '#666', fontSize: 11, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
          Instrucciones adicionales (opcional)
        </label>
        <textarea value={extra} onChange={e => setExtra(e.target.value)}
          placeholder="Ej: El capítulo 3 debe hablar de respiración 4-7-8. El público son mujeres 30-50 años con ansiedad..."
          rows={3} style={{ fontSize: 13 }} />
      </div>

      {err && <p style={{ color: '#ff4444', fontSize: 13, marginBottom: 12 }}>{err}</p>}
      <Btn fullWidth onClick={submit} style={{ padding: '14px', fontSize: 15 }}>
        Generar contenido completo →
      </Btn>
    </div>
  )
}

// ── STEP 2: Generando ─────────────────────────────────────────────────────────
function StepGenerating({ formData, onDone }) {
  const [prog, setProg] = useState(0)
  const [log, setLog] = useState(['Preparando...'])
  const add = msg => setLog(p => [...p, msg])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const { modo, titulo, nicho, tono, numCaps, numBonos, paginasPorBono, script, voces, extra, promptReferencia } = formData

      try {
        if (modo === 'pau') {
          // ── PAU: 3 prompts en cadena ──────────────────────────────────────
          if (!cancelled) { add('PASO 1/3 — Analizando anuncio y creando estructura...'); setProg(10) }

          const p1 = [
            'Sos un estratega experto en productos digitales de alta utilidad (PAU) para LATAM.',
            'Analizá este script/anuncio y creá la arquitectura completa.',
            '',
            'SCRIPT: ' + script,
            voces ? 'VOCES REALES DEL MERCADO: ' + voces : '',
            extra ? 'INSTRUCCIONES: ' + extra : '',
            promptReferencia ? 'REFERENCIA ESTRATÉGICA: ' + promptReferencia : '',
            '',
            'Generá:',
            '1. ANÁLISIS: dolores (min 4), avatar detallado, nicho, ángulo de venta',
            '2. NOMBRE DEL PAU: el más poderoso y vendible',
            '3. ESTRUCTURA: ' + numCaps + ' capítulos organizados en secciones. Arco: Diagnóstico → Sistema → Herramientas → Resultados → Próximos pasos',
            '',
            'JSON sin markdown:',
            '{"analisis":{"dolores":["..."],"avatar":"...","nicho":"...","angulo":"..."},"titulo":"...","subtitulo":"...","tagline":"...","capitulos":[{"numero":1,"titulo":"...","subtitulo":"...","elementos":["plantilla","checklist"]}]}',
          ].filter(Boolean).join('\n')

          const r1 = await callGemini(p1, 4096)
          const arq = JSON.parse(r1.replace(/```json|```/g, '').trim())

          if (!cancelled) { add('PASO 2/3 — Escribiendo contenido completo...'); setProg(35) }

          const capsTitulos = (arq.capitulos || []).map(c => c.numero + '. ' + c.titulo).join('\n')
          const mitad = Math.ceil(numCaps / 2)

          const p2 = [
            'Escribí el contenido COMPLETO de los primeros ' + mitad + ' capítulos del PAU "' + arq.titulo + '".',
            'Avatar: ' + arq.analisis?.avatar,
            'Dolores: ' + (arq.analisis?.dolores || []).join(', '),
            voces ? 'Frases reales del cliente: ' + voces : '',
            'Tono: ' + tono,
            '',
            'CAPÍTULOS A ESCRIBIR:',
            capsTitulos.split('\n').slice(0, mitad).join('\n'),
            '',
            'Para cada capítulo: gancho emocional + contenido detallado (mínimo 400 palabras) + plantillas/checklists COMPLETOS + mini paso de acción.',
            'Formato: títulos claros, bullets, listas numeradas, cuadros de TIP/ERROR COMÚN, ejemplos reales.',
            'Cero relleno. Todo accionable.',
            '',
            'JSON sin markdown:',
            '{"capitulos":[{"numero":1,"titulo":"...","contenido":"texto completo con formato...","puntos_clave":["..."],"tip":"..."}]}',
          ].filter(Boolean).join('\n')

          const r2 = await callGemini(p2, 8192)
          const caps1 = JSON.parse(r2.replace(/```json|```/g, '').trim())

          if (!cancelled) { add('PASO 3/3 — Escribiendo segunda mitad y bonos...'); setProg(65) }

          const p3 = [
            'Continuá el PAU "' + arq.titulo + '". Mismo tono: ' + tono,
            '',
            'Escribí los capítulos ' + (mitad + 1) + ' al ' + numCaps + ':',
            capsTitulos.split('\n').slice(mitad).join('\n'),
            '',
            'Mismas reglas: mínimo 400 palabras por capítulo, formato visual, cero relleno.',
            '',
            'Al final incluí:',
            '- PLAN DE ACCIÓN 72hs: AHORA / MAÑANA / EN 3 DÍAS',
            '- CARTA DE CIERRE: 10 líneas motivadoras tipo carta del autor',
            numBonos > 0 ? '- ' + numBonos + ' BONOS completos de ' + paginasPorBono + ' páginas c/u. Cada bono resuelve un problema secundario.' : '',
            '',
            'JSON sin markdown:',
            '{"capitulos":[{"numero":' + (mitad + 1) + ',"titulo":"...","contenido":"...","puntos_clave":["..."],"tip":"..."}],"plan_accion":["AHORA: ...","MAÑANA: ...","EN 3 DÍAS: ..."],"cierre":"...","bonos":[{"numero":1,"titulo":"...","contenido":"texto completo del bono...","plan_accion_24hs":["..."]}]}',
          ].filter(Boolean).join('\n')

          const r3 = await callGemini(p3, 8192)
          const caps2 = JSON.parse(r3.replace(/```json|```/g, '').trim())

          if (!cancelled) { add('Contenido completo generado ✓'); setProg(100) }
          await new Promise(r => setTimeout(r, 300))

          if (!cancelled) onDone({
            modo: 'pau',
            titulo: arq.titulo,
            subtitulo: arq.subtitulo,
            tagline: arq.tagline,
            analisis: arq.analisis,
            capitulos: [...(caps1.capitulos || []), ...(caps2.capitulos || [])],
            plan_accion: caps2.plan_accion || [],
            cierre: caps2.cierre || '',
            bonos: caps2.bonos || [],
          })

        } else {
          // ── EBOOK MODE ────────────────────────────────────────────────────
          if (!cancelled) { add('Generando estructura del ebook...'); setProg(20) }

          const numCapsFirst = Math.ceil(numCaps / 2)

          const p1 = [
            'Sos el mejor escritor de infoproductos para LATAM. Tono: ' + tono,
            '',
            'Creá un ebook completo basado en:',
            script ? 'SCRIPT: ' + script : '',
            titulo ? 'TÍTULO: ' + titulo : '',
            nicho ? 'NICHO: ' + nicho : '',
            voces ? 'VOCES REALES DEL CLIENTE: ' + voces : '',
            extra ? 'INSTRUCCIONES: ' + extra : '',
            promptReferencia ? 'REFERENCIA: ' + promptReferencia : '',
            '',
            'Generá la estructura: título, subtítulo, tagline, introducción, y lista de ' + numCaps + ' capítulos con sus títulos.',
            '',
            'JSON sin markdown:',
            '{"titulo":"...","subtitulo":"...","tagline":"...","introduccion":"texto completo...","capitulos":[{"numero":1,"titulo":"...","subtitulo":"..."}]}',
          ].filter(Boolean).join('\n')

          const r1 = await callGemini(p1, 4096)
          const estructura = JSON.parse(r1.replace(/```json|```/g, '').trim())

          if (!cancelled) { add('Escribiendo primera mitad del ebook...'); setProg(40) }

          const capsTitulos = (estructura.capitulos || []).map(c => c.numero + '. ' + c.titulo).join('\n')

          const p2 = [
            'Escribí el contenido COMPLETO de los primeros ' + numCapsFirst + ' capítulos del ebook "' + estructura.titulo + '".',
            'Tono: ' + tono,
            voces ? 'Frases reales del cliente a usar: ' + voces : '',
            '',
            'CAPÍTULOS:',
            capsTitulos.split('\n').slice(0, numCapsFirst).join('\n'),
            '',
            'Para cada capítulo: gancho emocional + contenido detallado (mínimo 400 palabras) + plantillas/checklists COMPLETOS si aplica + paso de acción.',
            'Formato: títulos, bullets, listas, TIPs, ejemplos reales. Cero relleno.',
            '',
            'JSON sin markdown:',
            '{"capitulos":[{"numero":1,"titulo":"...","contenido":"texto completo...","puntos_clave":["..."],"tip":"..."}]}',
          ].filter(Boolean).join('\n')

          const r2 = await callGemini(p2, 8192)
          const caps1 = JSON.parse(r2.replace(/```json|```/g, '').trim())

          if (!cancelled) { add('Escribiendo segunda mitad y bonos...'); setProg(65) }

          const p3 = [
            'Continuá el ebook "' + estructura.titulo + '". Mismo tono: ' + tono,
            '',
            'Escribí los capítulos ' + (numCapsFirst + 1) + ' al ' + numCaps + ':',
            capsTitulos.split('\n').slice(numCapsFirst).join('\n'),
            '',
            'Mismas reglas: mínimo 400 palabras por capítulo, formato visual.',
            '',
            'Al final:',
            '- PLAN DE ACCIÓN 72hs: AHORA / MAÑANA / EN 3 DÍAS',
            '- CARTA DE CIERRE motivadora (10 líneas)',
            numBonos > 0 ? '- ' + numBonos + ' BONOS de ' + paginasPorBono + ' páginas c/u. Cada bono resuelve una objeción específica.' : '',
            '',
            'JSON sin markdown:',
            '{"capitulos":[{"numero":' + (numCapsFirst + 1) + ',"titulo":"...","contenido":"...","puntos_clave":["..."],"tip":"..."}],"plan_accion":["AHORA: ...","MAÑANA: ...","EN 3 DÍAS: ..."],"cierre":"...","bonos":[{"numero":1,"titulo":"...","contenido":"texto completo...","plan_accion_24hs":["..."]}]}',
          ].filter(Boolean).join('\n')

          const r3 = await callGemini(p3, 8192)
          const caps2 = JSON.parse(r3.replace(/```json|```/g, '').trim())

          if (!cancelled) { add('Ebook completo generado ✓'); setProg(100) }
          await new Promise(r => setTimeout(r, 300))

          if (!cancelled) onDone({
            modo: 'ebook',
            titulo: estructura.titulo,
            subtitulo: estructura.subtitulo,
            tagline: estructura.tagline,
            introduccion: estructura.introduccion,
            capitulos: [...(caps1.capitulos || []), ...(caps2.capitulos || [])],
            plan_accion: caps2.plan_accion || [],
            cierre: caps2.cierre || '',
            bonos: caps2.bonos || [],
          })
        }

      } catch (err) {
        if (!cancelled) {
          add('Error: ' + err.message)
          setProg(0)
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
      <Tag>GENERANDO</Tag>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: '12px 0 6px' }}>Creando el contenido completo</h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 28 }}>Esto puede tardar 1-2 minutos...</p>

      <div style={{ background: '#222', borderRadius: 100, height: 6, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: AC, borderRadius: 100, width: prog + '%', transition: 'width .5s ease' }} />
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

// ── STEP 3: Resultado — texto completo para copiar ────────────────────────────
function StepResult({ result, onRestart }) {
  const [copied, setCopied] = useState(false)
  const [copiedSection, setCopiedSection] = useState(null)
  const [activeTab, setActiveTab] = useState('ebook')

  // Armar texto completo del ebook
  const buildFullText = () => {
    const lines = []

    lines.push('═══════════════════════════════════════')
    lines.push(result.titulo?.toUpperCase())
    if (result.subtitulo) lines.push(result.subtitulo)
    if (result.tagline) lines.push('')
    if (result.tagline) lines.push('"' + result.tagline + '"')
    lines.push('═══════════════════════════════════════')
    lines.push('')

    if (result.introduccion) {
      lines.push('── INTRODUCCIÓN ─────────────────────────')
      lines.push(result.introduccion)
      lines.push('')
    }

    ;(result.capitulos || []).forEach(cap => {
      lines.push('')
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      lines.push('CAPÍTULO ' + cap.numero + ': ' + cap.titulo?.toUpperCase())
      if (cap.subtitulo) lines.push(cap.subtitulo)
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      lines.push('')
      lines.push(cap.contenido || '')
      if (cap.puntos_clave?.length > 0) {
        lines.push('')
        lines.push('PUNTOS CLAVE:')
        cap.puntos_clave.forEach(p => lines.push('• ' + p))
      }
      if (cap.tip) {
        lines.push('')
        lines.push('⚡ TIP: ' + cap.tip)
      }
      lines.push('')
    })

    if (result.plan_accion?.length > 0) {
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      lines.push('PLAN DE ACCIÓN 72 HORAS')
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      result.plan_accion.forEach(p => lines.push(p))
      lines.push('')
    }

    if (result.cierre) {
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      lines.push('CARTA DE CIERRE')
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      lines.push(result.cierre)
    }

    return lines.join('\n')
  }

  const buildBonosText = () => {
    const lines = []
    ;(result.bonos || []).forEach((bono, i) => {
      lines.push('═══════════════════════════════════════')
      lines.push('BONO ' + bono.numero + ': ' + bono.titulo?.toUpperCase())
      lines.push('═══════════════════════════════════════')
      lines.push('')
      lines.push(bono.contenido || '')
      if (bono.plan_accion_24hs?.length > 0) {
        lines.push('')
        lines.push('🎯 PLAN DE ACCIÓN 24HS:')
        bono.plan_accion_24hs.forEach(p => lines.push(p))
      }
      lines.push('')
      lines.push('')
    })
    return lines.join('\n')
  }

  const ebookText = buildFullText()
  const bonosText = buildBonosText()
  const todoText = ebookText + '\n\n' + (result.bonos?.length > 0 ? '═══════════════════════════════════════\nBONOS\n═══════════════════════════════════════\n\n' + bonosText : '')

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(id)
      setTimeout(() => setCopiedSection(null), 2000)
    })
  }

  const stats = [
    { v: result.capitulos?.length || 0, l: 'capítulos' },
    { v: result.bonos?.length || 0, l: 'bonos' },
    { v: Math.round(ebookText.split(' ').length / 250), l: 'páginas aprox.' },
    { v: ebookText.split(' ').length.toLocaleString(), l: 'palabras' },
  ]

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: '#111', border: '1px solid #2a1a00', borderRadius: 16, padding: 22, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Tag color="#22c55e">CONTENIDO LISTO</Tag>
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: '10px 0 4px' }}>{result.titulo}</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>{result.subtitulo}</p>
            {result.tagline && <p style={{ color: AC, fontSize: 12, fontStyle: 'italic' }}>"{result.tagline}"</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stats.map(({ v, l }) => (
              <div key={l} style={{ background: '#1a1a1a', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ color: AC, fontWeight: 900, fontSize: 18 }}>{v}</div>
                <div style={{ color: '#555', fontSize: 10 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copy all button */}
      <div style={{
        background: '#0a1a0a', border: '1px solid #22c55e44',
        borderRadius: 12, padding: '16px 20px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
            ✓ Contenido completo listo para copiar
          </p>
          <p style={{ color: '#555', fontSize: 12 }}>
            Pegalo en Gamma, Canva, ChatGPT o cualquier IA de diseño
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => copyText(todoText, 'todo')} style={{
            background: copiedSection === 'todo' ? '#16a34a' : '#22c55e',
            color: '#000', border: 'none', borderRadius: 10,
            padding: '12px 24px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
          }}>
            {copiedSection === 'todo' ? '✓ Copiado!' : '📋 Copiar todo'}
          </button>
          <Btn variant="ghost" onClick={onRestart} style={{ padding: '12px 16px' }}>Nuevo</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#111', padding: 4, borderRadius: 12, marginBottom: 14 }}>
        {[
          { id: 'ebook', label: '📖 Ebook principal' },
          ...(result.bonos?.length > 0 ? [{ id: 'bonos', label: '🎁 Bonos (' + result.bonos.length + ')' }] : []),
          ...(result.analisis ? [{ id: 'analisis', label: '🔍 Análisis' }] : []),
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '10px 0', borderRadius: 9, border: 'none',
            fontWeight: 700, fontSize: 12, cursor: 'pointer',
            background: activeTab === t.id ? AC : 'transparent',
            color: activeTab === t.id ? '#000' : '#666',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab: Ebook */}
      {activeTab === 'ebook' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button onClick={() => copyText(ebookText, 'ebook')} style={{
              background: copiedSection === 'ebook' ? '#16a34a' : '#1e1e1e',
              color: copiedSection === 'ebook' ? '#fff' : '#888',
              border: '1px solid #333', borderRadius: 8,
              padding: '8px 16px', fontSize: 12, cursor: 'pointer',
            }}>
              {copiedSection === 'ebook' ? '✓ Copiado!' : '📋 Copiar ebook'}
            </button>
          </div>

          {/* Intro */}
          {result.introduccion && (
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: 18, marginBottom: 12 }}>
              <p style={{ color: '#555', fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>INTRODUCCIÓN</p>
              <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{result.introduccion}</p>
            </div>
          )}

          {/* Capítulos */}
          {(result.capitulos || []).map((cap, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{ background: '#161616', padding: '12px 18px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: AC, fontWeight: 900, fontSize: 13 }}>{String(cap.numero).padStart(2, '0')}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{cap.titulo}</p>
                    {cap.subtitulo && <p style={{ color: '#666', fontSize: 11 }}>{cap.subtitulo}</p>}
                  </div>
                </div>
                <button onClick={() => copyText('CAPÍTULO ' + cap.numero + ': ' + cap.titulo + '\n\n' + cap.contenido, 'cap' + i)} style={{
                  background: 'transparent', border: '1px solid #333', borderRadius: 6,
                  padding: '4px 10px', fontSize: 11, color: '#666', cursor: 'pointer',
                }}>
                  {copiedSection === 'cap' + i ? '✓' : '📋'}
                </button>
              </div>
              <div style={{ padding: '14px 18px' }}>
                <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: cap.puntos_clave?.length ? 12 : 0 }}>
                  {cap.contenido}
                </p>
                {cap.puntos_clave?.length > 0 && (
                  <div style={{ background: '#0d0d0d', borderRadius: 8, padding: 12 }}>
                    <p style={{ color: '#555', fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>PUNTOS CLAVE</p>
                    {cap.puntos_clave.map((p, j) => (
                      <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                        <span style={{ color: AC }}>→</span>
                        <span style={{ color: '#aaa', fontSize: 13 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
                {cap.tip && (
                  <div style={{ background: '#1a1000', border: '1px solid #2a1a00', borderRadius: 8, padding: '10px 14px', marginTop: 10 }}>
                    <p style={{ color: AC, fontSize: 12 }}>⚡ TIP: {cap.tip}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Plan acción + Cierre */}
          {result.plan_accion?.length > 0 && (
            <div style={{ background: '#0a1a0a', border: '1px solid #22c55e33', borderRadius: 10, padding: 18, marginBottom: 10 }}>
              <p style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>PLAN DE ACCIÓN 72HS</p>
              {result.plan_accion.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: '#22c55e', fontSize: 11 }}>→</span>
                  <span style={{ color: '#aaa', fontSize: 13 }}>{p}</span>
                </div>
              ))}
            </div>
          )}

          {result.cierre && (
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: 18 }}>
              <p style={{ color: '#555', fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>CARTA DE CIERRE</p>
              <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.8, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{result.cierre}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Bonos */}
      {activeTab === 'bonos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button onClick={() => copyText(bonosText, 'bonos')} style={{
              background: copiedSection === 'bonos' ? '#16a34a' : '#1e1e1e',
              color: copiedSection === 'bonos' ? '#fff' : '#888',
              border: '1px solid #333', borderRadius: 8,
              padding: '8px 16px', fontSize: 12, cursor: 'pointer',
            }}>
              {copiedSection === 'bonos' ? '✓ Copiado!' : '📋 Copiar todos los bonos'}
            </button>
          </div>
          {(result.bonos || []).map((bono, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #222', borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ background: '#161616', padding: '12px 18px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ background: AC, color: '#000', fontWeight: 900, borderRadius: 6, padding: '3px 10px', fontSize: 11 }}>BONO {bono.numero}</span>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{bono.titulo}</p>
                </div>
                <button onClick={() => copyText('BONO ' + bono.numero + ': ' + bono.titulo + '\n\n' + bono.contenido, 'bono' + i)} style={{
                  background: 'transparent', border: '1px solid #333', borderRadius: 6,
                  padding: '4px 10px', fontSize: 11, color: '#666', cursor: 'pointer',
                }}>
                  {copiedSection === 'bono' + i ? '✓' : '📋'}
                </button>
              </div>
              <div style={{ padding: '14px 18px' }}>
                <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{bono.contenido}</p>
                {bono.plan_accion_24hs?.length > 0 && (
                  <div style={{ background: '#0a1a0a', border: '1px solid #22c55e33', borderRadius: 8, padding: 12 }}>
                    <p style={{ color: '#22c55e', fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>🎯 PLAN 24HS</p>
                    {bono.plan_accion_24hs.map((p, j) => (
                      <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                        <span style={{ color: '#22c55e', fontSize: 11 }}>→</span>
                        <span style={{ color: '#aaa', fontSize: 13 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Análisis */}
      {activeTab === 'analisis' && result.analisis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'AVATAR', value: result.analisis.avatar, color: PU },
            { label: 'NICHO', value: result.analisis.nicho, color: AC },
            { label: 'ÁNGULO DE VENTA', value: result.analisis.angulo, color: '#22c55e' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#111', border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`, borderRadius: '0 10px 10px 0', padding: 16 }}>
              <p style={{ color, fontSize: 10, letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>{label}</p>
              <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6 }}>{value}</p>
            </div>
          ))}
          <div style={{ background: '#111', border: '1px solid #ff444433', borderRadius: 10, padding: 16 }}>
            <p style={{ color: '#ff4444', fontSize: 10, letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>DOLORES DETECTADOS</p>
            {(result.analisis.dolores || []).map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#ff4444' }}>✗</span>
                <span style={{ color: '#ccc', fontSize: 13 }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Generator ────────────────────────────────────────────────────────────
export default function Generator() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState(null)
  const [result, setResult] = useState(null)

  const STEPS = ['Configurar', 'Generando', 'Contenido']

  const dots = STEPS.map((label, i) => (
    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{dots}</div>
          <span style={{ color: '#555', fontSize: 12 }}>{STEPS[step]}</span>
          <Btn variant="ghost" onClick={() => navigate('/investigar')} style={{ padding: '6px 12px', fontSize: 12 }}>🔍 Investigar</Btn>
        </div>
      } />
      <div style={{ padding: '44px 24px 80px' }}>
        {step === 0 && <StepForm onNext={d => { setFormData(d); setStep(1) }} />}
        {step === 1 && <StepGenerating formData={formData} onDone={r => { setResult(r); setStep(2) }} />}
        {step === 2 && result && <StepResult result={result} onRestart={() => { setStep(0); setFormData(null); setResult(null) }} />}
      </div>
    </div>
  )
}
