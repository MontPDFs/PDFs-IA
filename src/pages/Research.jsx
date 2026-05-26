import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar, Btn, Tag, Spinner } from '../components/UI'

const AC = '#FF6B00'
const PU = '#a855f7'
const GR = '#22c55e'

// ── Mini card component ───────────────────────────────────────────────────────
function MiniCard({ icon, title, color, children, loading }) {
  return (
    <div style={{
      background: '#0d0d0d',
      border: `1px solid ${color}33`,
      borderRadius: 14,
      padding: 20,
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <p style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{title}</p>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[80, 60, 90, 50, 70].map((w, i) => (
            <div key={i} style={{
              height: 10, borderRadius: 5,
              background: color + '22',
              width: w + '%',
              animation: 'pulse 1.5s infinite',
              animationDelay: i * 0.1 + 's',
            }} />
          ))}
        </div>
      ) : children}
    </div>
  )
}

// ── PDF Idea Card ─────────────────────────────────────────────────────────────
function IdeaCard({ idea, index, selected, onSelect }) {
  const colors = [AC, PU, GR, '#f59e0b', '#ec4899']
  const color = colors[index % colors.length]

  return (
    <div onClick={() => onSelect(idea)} style={{
      background: selected ? color + '11' : '#0d0d0d',
      border: `2px solid ${selected ? color : '#222'}`,
      borderRadius: 14, padding: 18, cursor: 'pointer',
      transition: 'all .2s',
      transform: selected ? 'scale(1.01)' : 'scale(1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{
          background: color + '22', border: `1px solid ${color}44`,
          borderRadius: 6, padding: '3px 10px', fontSize: 10,
          color, fontWeight: 700, letterSpacing: 1,
        }}>
          {idea.tipo === 'principal' ? '📦 EBOOK PRINCIPAL' : idea.tipo === 'bono' ? '🎁 BONO' : '⚡ ORDER BUMP'}
        </div>
        {selected && (
          <span style={{ color, fontSize: 18 }}>✓</span>
        )}
      </div>

      <h3 style={{ fontWeight: 900, fontSize: 16, color: '#fff', marginBottom: 4, lineHeight: 1.2 }}>
        {idea.titulo}
      </h3>
      <p style={{ color: '#777', fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
        {idea.subtitulo}
      </p>

      <div style={{ marginBottom: 12 }}>
        <p style={{ color: '#555', fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>RESUELVE</p>
        <p style={{ color: '#aaa', fontSize: 12, lineHeight: 1.5, fontStyle: 'italic' }}>
          "{idea.dolor_que_resuelve}"
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {(idea.elementos || []).map((e, i) => (
          <span key={i} style={{
            background: color + '11', border: `1px solid ${color}33`,
            borderRadius: 5, padding: '3px 8px', fontSize: 10, color,
          }}>{e}</span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <div>
          <p style={{ color: '#555', fontSize: 9, letterSpacing: 1 }}>PÁGINAS</p>
          <p style={{ color, fontWeight: 700, fontSize: 14 }}>{idea.paginas}</p>
        </div>
        <div>
          <p style={{ color: '#555', fontSize: 9, letterSpacing: 1 }}>PRECIO SUGERIDO</p>
          <p style={{ color, fontWeight: 700, fontSize: 14 }}>{idea.precio}</p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#555', fontSize: 9, letterSpacing: 1 }}>NIVEL DE URGENCIA</p>
          <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} style={{
                width: 16, height: 6, borderRadius: 3,
                background: n <= (idea.urgencia || 3) ? color : '#222',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Research Page ────────────────────────────────────────────────────────
export default function Research() {
  const navigate = useNavigate()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [activeTab, setActiveTab] = useState('ideas')

  const analyze = async () => {
    if (input.trim().length < 50) {
      setError('Pegá más información — mínimo 50 caracteres para un análisis útil.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    setSelectedIdea(null)

    try {
      const prompt = [
        'Sos un estratega experto en productos digitales para LATAM.',
        'Analizá toda esta información de mercado y generá un análisis completo.',
        '',
        'INFORMACIÓN A ANALIZAR:',
        input,
        '',
        'Generá los siguientes 5 bloques de análisis:',
        '',
        '1. AVATAR ENCONTRADO: quién es exactamente esta persona, edad, situación de vida, qué hace en su día a día, qué ha intentado antes, qué palabras usa para describir su problema, nivel socioeconómico, dónde consume contenido.',
        '',
        '2. PROBLEMAS DETECTADOS: lista de todos los dolores, frustraciones, miedos y objeciones que aparecen en el texto. Organizados por nivel de urgencia (del más urgente al menos urgente). Para cada problema: descripción, frase textual que lo representa, consecuencia emocional.',
        '',
        '3. MECANISMO ÚNICO: cuál es el ángulo diferenciador para posicionar el producto. Por qué las soluciones actuales no funcionan para este avatar. Cuál es la creencia que hay que romper. Cuál es la nueva oportunidad que podemos presentar.',
        '',
        '4. IDEAS DE EBOOKS Y BONOS: genera 6 ideas de productos concretos (3 ebooks principales + 2 bonos + 1 order bump). Cada idea debe atacar un dolor específico detectado.',
        '',
        '5. ÁNGULOS DE VENTA: 5 ángulos de copy diferentes para vender a este avatar. Cada ángulo con un hook de 1 línea.',
        '',
        'Respondé SOLO con JSON válido sin markdown:',
        '{',
        '  "avatar": {',
        '    "descripcion": "...",',
        '    "edad": "...",',
        '    "situacion": "...",',
        '    "dia_a_dia": "...",',
        '    "ha_intentado": ["...","...","..."],',
        '    "frases_textuales": ["...","...","...","..."],',
        '    "consume_contenido_en": ["...","...","..."],',
        '    "deseo_profundo": "..."',
        '  },',
        '  "problemas": [',
        '    {"titulo":"...","frase_textual":"...","consecuencia":"...","urgencia":5}',
        '  ],',
        '  "mecanismo": {',
        '    "angulo_diferenciador":"...",',
        '    "por_que_fallan_soluciones_actuales":"...",',
        '    "creencia_a_romper":"...",',
        '    "nueva_oportunidad":"...",',
        '    "promesa_unica":"..."',
        '  },',
        '  "ideas": [',
        '    {"tipo":"principal","titulo":"...","subtitulo":"...","dolor_que_resuelve":"...","elementos":["plantilla","checklist","plan"],"paginas":"50-80","precio":"$27-$47","urgencia":5},',
        '    {"tipo":"bono","titulo":"...","subtitulo":"...","dolor_que_resuelve":"...","elementos":["checklist","guia"],"paginas":"15-25","precio":"$17","urgencia":4},',
        '    {"tipo":"order_bump","titulo":"...","subtitulo":"...","dolor_que_resuelve":"...","elementos":["plantilla"],"paginas":"5-10","precio":"$7-$9","urgencia":3}',
        '  ],',
        '  "angulos_venta": [',
        '    {"angulo":"...","hook":"..."}',
        '  ]',
        '}',
      ].join('\n')

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 8192 }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en Gemini')

      const parsed = JSON.parse(data.text.replace(/```json|```/g, '').trim())
      setResult(parsed)
      setActiveTab('ideas')

    } catch (err) {
      setError('Error al analizar: ' + err.message + '. Verificá que GEMINI_KEY_1 esté configurada.')
    } finally {
      setLoading(false)
    }
  }

  const goToGenerator = () => {
    if (!selectedIdea) return
    const params = new URLSearchParams({
      titulo: selectedIdea.titulo,
      subtitulo: selectedIdea.subtitulo,
      dolor: selectedIdea.dolor_que_resuelve,
      tipo: selectedIdea.tipo,
      avatar: result?.avatar?.descripcion || '',
      problemas: (result?.problemas || []).map(p => p.titulo).join(', '),
      mecanismo: result?.mecanismo?.promesa_unica || '',
    })
    navigate('/crear?' + params.toString())
  }

  const TABS = [
    { id: 'ideas', label: '💡 Ideas de PDFs', count: result?.ideas?.length },
    { id: 'avatar', label: '👤 Avatar' },
    { id: 'problemas', label: '⚠️ Problemas', count: result?.problemas?.length },
    { id: 'mecanismo', label: '🎯 Mecanismo' },
    { id: 'angulos', label: '📢 Ángulos de venta', count: result?.angulos_venta?.length },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar right={
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={() => navigate('/')} style={{ padding: '8px 14px', fontSize: 13 }}>← Home</Btn>
          <Btn variant="ghost" onClick={() => navigate('/crear')} style={{ padding: '8px 14px', fontSize: 13 }}>Crear PDF</Btn>
        </div>
      } />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <Tag color={GR}>INVESTIGACIÓN DE MERCADO</Tag>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '12px 0 6px' }}>
            Analizá tu mercado con IA
          </h1>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, maxWidth: 600 }}>
            Pegá el script del anuncio, comentarios de clientes, reseñas, quejas o cualquier info.
            La IA detecta el avatar, los problemas reales y genera ideas de PDFs y bonos listos para crear.
          </p>
        </div>

        {/* Input area */}
        <div style={{
          background: '#0d0d0d', border: '1px solid #222',
          borderRadius: 16, padding: 20, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ color: '#555', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
              PEGÁ TODA LA INFORMACIÓN AQUÍ
            </p>
            <span style={{ color: input.length > 100 ? GR : '#555', fontSize: 11 }}>
              {input.length} caracteres
            </span>
          </div>

          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setError('') }}
            placeholder={`Podés pegar cualquier combinación de:

• Script o copy del anuncio
• Comentarios reales de clientes ("No puedo dormir desde hace meses...")
• Reseñas de Amazon o Google
• Respuestas a encuestas
• Preguntas frecuentes que recibís
• Quejas en redes sociales
• Descripciones del problema que hacen ellos mismos

Cuanta más información real, mejor el análisis.`}
            rows={10}
            style={{
              fontSize: 13, lineHeight: 1.7,
              background: '#060606',
              border: '1px solid #1a1a1a',
              borderRadius: 10,
            }}
          />

          {error && (
            <p style={{ color: '#ff4444', fontSize: 13, marginTop: 8 }}>⚠️ {error}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <p style={{ color: '#444', fontSize: 12 }}>
              Mínimo 50 caracteres · Máximo mejor
            </p>
            <Btn
              onClick={analyze}
              disabled={loading}
              style={{ padding: '12px 28px', background: loading ? '#333' : GR, color: '#000' }}
            >
              {loading ? '🔍 Analizando...' : '🔍 Analizar mercado'}
            </Btn>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spinner color={GR} />
            <p style={{ color: '#555', fontSize: 14, marginTop: 12 }}>
              Detectando avatar, problemas y oportunidades de mercado...
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ animation: 'fadeIn .4s ease' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: '#111', padding: 4, borderRadius: 12, marginBottom: 20, overflowX: 'auto' }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, padding: '10px 12px', borderRadius: 9, border: 'none',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all .15s', minWidth: 'fit-content',
                  background: activeTab === tab.id ? GR : 'transparent',
                  color: activeTab === tab.id ? '#000' : '#666',
                }}>
                  {tab.label}
                  {tab.count && <span style={{ marginLeft: 6, background: activeTab === tab.id ? '#00000033' : '#222', borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>{tab.count}</span>}
                </button>
              ))}
            </div>

            {/* Tab: Ideas de PDFs */}
            {activeTab === 'ideas' && (
              <div>
                <p style={{ color: '#555', fontSize: 13, marginBottom: 16 }}>
                  Elegí una idea para crear el PDF completo con diseño y todo.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 20 }}>
                  {(result.ideas || []).map((idea, i) => (
                    <IdeaCard
                      key={i}
                      idea={idea}
                      index={i}
                      selected={selectedIdea?.titulo === idea.titulo}
                      onSelect={setSelectedIdea}
                    />
                  ))}
                </div>

                {selectedIdea && (
                  <div style={{
                    background: '#0a1a0a', border: `1px solid ${GR}44`,
                    borderRadius: 14, padding: 20,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: 12,
                  }}>
                    <div>
                      <p style={{ color: GR, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>SELECCIONADO</p>
                      <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>{selectedIdea.titulo}</p>
                      <p style={{ color: '#777', fontSize: 13 }}>{selectedIdea.subtitulo}</p>
                    </div>
                    <Btn onClick={goToGenerator} style={{ padding: '14px 28px', background: GR, color: '#000', fontSize: 15, fontWeight: 800 }}>
                      Crear este PDF con IA →
                    </Btn>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Avatar */}
            {activeTab === 'avatar' && result.avatar && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'QUIÉN ES', value: result.avatar.descripcion, icon: '👤' },
                  { label: 'EDAD Y SITUACIÓN', value: result.avatar.edad + ' · ' + result.avatar.situacion, icon: '📍' },
                  { label: 'SU DÍA A DÍA', value: result.avatar.dia_a_dia, icon: '📅' },
                  { label: 'DESEO PROFUNDO', value: result.avatar.deseo_profundo, icon: '💫' },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 12, padding: 16 }}>
                    <p style={{ color: '#555', fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>{icon} {label}</p>
                    <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6 }}>{value}</p>
                  </div>
                ))}

                <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 12, padding: 16 }}>
                  <p style={{ color: '#555', fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>🔁 YA INTENTÓ</p>
                  {(result.avatar.ha_intentado || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <span style={{ color: '#ff4444' }}>✗</span>
                      <span style={{ color: '#aaa', fontSize: 13 }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 12, padding: 16 }}>
                  <p style={{ color: '#555', fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>💬 FRASES TEXTUALES</p>
                  {(result.avatar.frases_textuales || []).map((frase, i) => (
                    <div key={i} style={{
                      background: '#111', borderLeft: `3px solid ${AC}`,
                      borderRadius: '0 8px 8px 0', padding: '8px 12px', marginBottom: 8,
                    }}>
                      <p style={{ color: '#ccc', fontSize: 12, fontStyle: 'italic' }}>"{frase}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Problemas */}
            {activeTab === 'problemas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(result.problemas || []).map((p, i) => (
                  <div key={i} style={{
                    background: '#0d0d0d', border: '1px solid #1a1a1a',
                    borderRadius: 12, padding: 16,
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: '#1a0000', border: '1px solid #330000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#ff4444', fontWeight: 900, fontSize: 13, flexShrink: 0,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>{p.titulo}</p>
                      <div style={{
                        background: '#0a0000', borderLeft: '3px solid #ff4444',
                        borderRadius: '0 6px 6px 0', padding: '6px 10px', marginBottom: 8,
                      }}>
                        <p style={{ color: '#ff8888', fontSize: 12, fontStyle: 'italic' }}>"{p.frase_textual}"</p>
                      </div>
                      <p style={{ color: '#666', fontSize: 12 }}>Consecuencia: {p.consecuencia}</p>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <p style={{ color: '#555', fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>URGENCIA</p>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <div key={n} style={{
                            width: 12, height: 12, borderRadius: 2,
                            background: n <= (p.urgencia || 3) ? '#ff4444' : '#222',
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Mecanismo */}
            {activeTab === 'mecanismo' && result.mecanismo && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: '🎯 ÁNGULO DIFERENCIADOR', value: result.mecanismo.angulo_diferenciador, color: AC },
                  { label: '❌ POR QUÉ FALLAN LAS SOLUCIONES ACTUALES', value: result.mecanismo.por_que_fallan_soluciones_actuales, color: '#ff4444' },
                  { label: '🔓 CREENCIA QUE HAY QUE ROMPER', value: result.mecanismo.creencia_a_romper, color: PU },
                  { label: '✨ NUEVA OPORTUNIDAD', value: result.mecanismo.nueva_oportunidad, color: GR },
                  { label: '💎 PROMESA ÚNICA', value: result.mecanismo.promesa_unica, color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    background: '#0d0d0d',
                    border: `1px solid ${color}33`,
                    borderLeft: `4px solid ${color}`,
                    borderRadius: '0 12px 12px 0', padding: 18,
                  }}>
                    <p style={{ color, fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{label}</p>
                    <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.7 }}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Ángulos de venta */}
            {activeTab === 'angulos' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {(result.angulos_venta || []).map((a, i) => {
                  const colors = [AC, PU, GR, '#f59e0b', '#ec4899']
                  const color = colors[i % colors.length]
                  return (
                    <div key={i} style={{
                      background: '#0d0d0d', border: `1px solid ${color}33`,
                      borderRadius: 12, padding: 18,
                    }}>
                      <div style={{
                        background: color + '22', borderRadius: 6,
                        padding: '3px 10px', fontSize: 10, color,
                        fontWeight: 700, letterSpacing: 1,
                        display: 'inline-block', marginBottom: 10,
                      }}>ÁNGULO {i + 1}</div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 8 }}>{a.angulo}</p>
                      <div style={{
                        background: color + '11', borderLeft: `3px solid ${color}`,
                        borderRadius: '0 8px 8px 0', padding: '10px 14px',
                      }}>
                        <p style={{ color: '#555', fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>HOOK</p>
                        <p style={{ color, fontSize: 13, fontStyle: 'italic', lineHeight: 1.5 }}>"{a.hook}"</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
