import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar, Btn, Tag } from '../components/UI'

const AC = '#FF6B00'
const PU = '#a855f7'

// ── Prompts por defecto ───────────────────────────────────────────────────────
const DEFAULT_PROMPTS = {
  ebook_principal: {
    id: 'ebook_principal',
    label: 'Ebook — Generación completa',
    mode: 'ebook',
    desc: 'Prompt principal que genera el JSON completo del ebook con capítulos y bonos.',
    variables: ['{{script}}', '{{titulo}}', '{{nicho}}', '{{tono}}', '{{numCaps}}', '{{numBonos}}', '{{paginasPorBono}}', '{{extra}}', '{{promptReferencia}}'],
    content: `Sos el mejor escritor de infoproductos y ebooks para LATAM.

Creá un ebook completo basado en esta información:

SCRIPT/CONTENIDO PRINCIPAL:
{{script}}

TÍTULO SUGERIDO: {{titulo}}
NICHO: {{nicho}}
TONO: {{tono}}
INSTRUCCIONES ADICIONALES: {{extra}}
REFERENCIA ESTRATÉGICA: {{promptReferencia}}
Cada bono debe tener aproximadamente {{paginasPorBono}} páginas.

Generá exactamente {{numCaps}} capítulos y {{numBonos}} bonos.
Cada capítulo debe tener contenido rico y detallado. Usá el mismo vocabulario y estilo del script.

Respondé SOLO con JSON válido sin markdown:
{
  "ebook": {
    "titulo": "...",
    "subtitulo": "...",
    "tagline": "...",
    "nicho": "...",
    "categoria": "...",
    "introduccion": "texto de introduccion detallado...",
    "capitulos": [
      {"numero":1,"titulo":"...","subtitulo":"...","contenido":"parrafo detallado...","puntos_clave":["punto 1","punto 2","punto 3","punto 4"],"tip":"consejo practico aplicable hoy"}
    ],
    "bonos": [
      {"numero":1,"titulo":"...","objecion_que_resuelve":"...","descripcion":"...","contenido_resumen":["punto 1","punto 2","punto 3"]}
    ]
  }
}`,
  },

  pau_1_analisis: {
    id: 'pau_1_analisis',
    label: 'PAU 1/5 — Arquitecto (Análisis + Estructura)',
    mode: 'pau',
    desc: 'El Arquitecto: analiza el anuncio y genera nombres, transformación, estructura completa y bonos. Sin contenido todavía.',
    variables: ['{{script}}', '{{extra}}', '{{promptReferencia}}', '{{numCaps}}', '{{numBonos}}', '{{paginasPorBono}}'],
    content: `Actúa como un estratega experto en productos digitales low ticket premium ($3-$47 USD) y creador de ebooks de alta utilidad.

Tu trabajo NO es crear libros académicos ni contenido teórico.
Tu trabajo es DISEÑAR la arquitectura completa de un ecosistema de productos digitales que:
- se sientan prácticos y accionables
- den resultados visibles en 1-3 días
- tengan alto valor percibido aunque sean económicos
- generen la sensación de "pagó poco, pero recibió muchísimo valor"

SCRIPT DEL ANUNCIO A ANALIZAR:
{{script}}

INFORMACIÓN ADICIONAL: {{extra}}
REFERENCIA ESTRATÉGICA: {{promptReferencia}}

Genera la ARQUITECTURA COMPLETA. NO escribas el contenido todavía, solo la estructura.

SECCIÓN A — NOMBRE Y POSICIONAMIENTO:
1. NOMBRE DEL PAU: 5 opciones poderosas. Nada genérico. Nombres tipo "Kit de Salvación", "Sistema [nombre] en [tiempo]", "Protocolo [nombre]".
2. SUBTÍTULO: Para cada nombre, fórmula: "[Descripción práctica] para [audiencia] que quiere [resultado] sin [objeción]"
3. HOOKS DE PORTADA: 3 frases cortas y poderosas sobre transformación, no información.
4. NOMBRE RECOMENDADO: Cuál es el más vendible y por qué.

SECCIÓN B — TRANSFORMACIÓN:
ANTES (mínimo 6 puntos): cómo se siente, qué problemas tiene, qué errores comete, qué ha intentado, qué emociones negativas.
DESPUÉS (mínimo 6 puntos): resultados, qué sabe hacer, qué errores ya no comete, qué emociones positivas, qué posibilidades se abren.

SECCIÓN C — ESTRUCTURA ({{numCaps}} capítulos, 50-80 páginas):
Para cada capítulo: título atractivo, problema que resuelve, resultado concreto, páginas estimadas, elementos prácticos (plantillas/checklists/tablas/ejercicios), frase que debe sentir el lector al terminar.
Arco: Diagnóstico rápido → Fundamentos → Sistema central paso a paso → Herramientas → Problemas comunes → Resultados → Próximos pasos.

SECCIÓN D — BONOS ({{numBonos}} bonos, aproximadamente {{paginasPorBono}} páginas c/u):
Para cada bono: nombre poderoso, subtítulo, lógica de complemento (solución-nuevo problema), estructura, elementos prácticos, valor percibido.

SECCIÓN E — TONO Y ESTILO:
Cómo debe sonar, nivel de lenguaje, 8-10 frases motivadoras naturales, sensación general del producto.

Respondé SOLO con JSON válido sin markdown:
{
  "analisis": {"dolores":["...","...","...","..."],"avatar":"descripcion detallada...","nicho":"...","angulo":"..."},
  "nombres": [{"nombre":"...","subtitulo":"...","hook":"..."},{"nombre":"...","subtitulo":"...","hook":"..."},{"nombre":"...","subtitulo":"...","hook":"..."},{"nombre":"...","subtitulo":"...","hook":"..."},{"nombre":"...","subtitulo":"...","hook":"..."}],
  "nombre_recomendado": 0,
  "transformacion": {"antes":["...","...","...","...","...","..."],"despues":["...","...","...","...","...","..."]},
  "capitulos": [{"numero":1,"titulo":"...","problema":"...","resultado":"...","paginas":5,"elementos":["plantilla","checklist"],"frase_cierre":"Esto si lo puedo hacer"}],
  "bonos": [{"numero":1,"titulo":"...","subtitulo":"...","logica":"...","estructura":["seccion 1","seccion 2"],"valor_percibido":"$XX","paginas":20}],
  "tono": {"descripcion":"...","nivel":"...","frases_motivadoras":["...","...","...","...","...","...","...","..."]}
}`,
  },

  pau_2_contenido_primera_mitad: {
    id: 'pau_2_contenido_primera_mitad',
    label: 'PAU 2/5 — Escritor (primera mitad)',
    mode: 'pau',
    desc: 'El Escritor: genera el contenido completo de los primeros capítulos con formato visual completo.',
    variables: ['{{titulo}}', '{{avatar}}', '{{dolores}}', '{{angulo}}', '{{numCaps}}', '{{capsList}}'],
    content: `Perfecto. Ya tengo la arquitectura aprobada. Ahora escribí el CONTENIDO COMPLETO del PAU.

PAU: "{{titulo}}"
AVATAR: {{avatar}}
DOLORES: {{dolores}}
ÁNGULO: {{angulo}}

EXTENSIÓN: entre 50 y 80 páginas (250-300 palabras por página).
Tono: lenguaje simple y cercano. Cero académico. Frases cortas. Párrafos cortos (máximo 3-4 líneas).

FORMATO VISUAL OBLIGATORIO — usar CONSTANTEMENTE:
📋 LISTAS con bullets o números para cualquier secuencia
📊 TABLAS comparativas cuando haya opciones o comparaciones
🔢 PASOS NUMERADOS para cualquier proceso
⚠️ CUADROS DE ERROR COMÚN:
   ┌─ ⚠️ ERROR COMÚN ─────────────────────┐
   │ [Descripción del error]               │
   │ ✅ Lo correcto: [Qué hacer en cambio] │
   └───────────────────────────────────────┘
💡 CUADROS DE DATO CLAVE:
   ┌─ 💡 DATO CLAVE ──────────────────────┐
   │ [Información importante]              │
   └───────────────────────────────────────┘
⚡ TIP RÁPIDO: [Consejo en 1-2 líneas]
✅ CHECKLISTS con casillas
📌 EJEMPLOS PRÁCTICOS con números reales
🎯 MINI PASO DE ACCIÓN al final de cada capítulo

NUNCA más de 2 párrafos seguidos sin un elemento visual.

ESTRUCTURA DE CADA CAPÍTULO:
1. GANCHO DE APERTURA (2-3 líneas): situación real que el lector reconozca
2. CONTENIDO CENTRAL con todos los elementos visuales
3. HERRAMIENTAS PRÁCTICAS: plantillas/checklists COMPLETOS y listos para usar
4. EJEMPLOS REALES con números concretos
5. 🎯 PASO DE ACCIÓN: qué hacer ahora mismo

Escribí los primeros {{numCaps}} capítulos:
{{capsList}}

Respondé SOLO con JSON válido sin markdown:
{"capitulos":[{"numero":1,"titulo":"...","contenido":"texto completo con formato visual incluido...","puntos_clave":["...","...","..."],"tip":"consejo practico para hoy","tipo":"contenido"}]}`,
  },

  pau_3_contenido_segunda_mitad: {
    id: 'pau_3_contenido_segunda_mitad',
    label: 'PAU 3/5 — Escritor (segunda mitad + cierre)',
    mode: 'pau',
    desc: 'Genera el resto de capítulos más la página de cierre y el plan de 72 horas.',
    variables: ['{{titulo}}', '{{avatar}}', '{{numCapsDesde}}', '{{numCapsHasta}}'],
    content: `Continuá escribiendo el PAU. Mismo tono y formato del paso anterior.

PAU: "{{titulo}}"
AVATAR: {{avatar}}

Escribí el contenido COMPLETO de los capítulos restantes ({{numCapsDesde}} al {{numCapsHasta}}).
Mismas reglas: párrafos cortos, elementos visuales cada 1-2 párrafos, mínimo 400 palabras por capítulo.

Incluí al final:
- RESUMEN PRÁCTICO: checklist de todo lo aprendido en el ebook
- PLAN DE ACCIÓN 72hs: "Qué hacer en las próximas 72 horas"
  Formato: AHORA → MAÑANA → EN 3 DÍAS (pasos numerados, concretos y simples)
- CARTA DE CIERRE: mensaje motivador genuino, 10 líneas máximo, tipo carta del autor.
  Debe reforzar el cambio que el lector está a punto de lograr y motivarlo a actuar HOY.

Respondé SOLO con JSON válido sin markdown:
{"capitulos":[{"numero":{{numCapsDesde}},"titulo":"...","contenido":"texto completo...","puntos_clave":["..."],"tip":"...","tipo":"contenido"}],"cierre":"carta del autor completa y poderosa...","plan_accion":["AHORA: paso 1...","MAÑANA: paso 2...","EN 3 DÍAS: paso 3..."]}`,
  },

  pau_4_bonos_estructura: {
    id: 'pau_4_bonos_estructura',
    label: 'PAU 4/5 — Estructura de bonos',
    mode: 'pau',
    desc: 'Genera las ideas y estructura de todos los bonos usando la estrategia solución → nuevo problema.',
    variables: ['{{titulo}}', '{{dolores}}', '{{numBonos}}', '{{paginasPorBono}}'],
    content: `Creá {{numBonos}} BONOS para complementar el PAU "{{titulo}}".

DOLORES DEL AVATAR: {{dolores}}

Estrategia para cada bono — usa "solución → nuevo problema":
- ¿Qué problema secundario surge cuando el lector aplica el PAU?
- ¿O qué parte del proceso puede ACELERARSE con este bono?
- ¿O qué ESCENARIO ALTERNATIVO no cubre el PAU principal?

Para cada bono:
1. NOMBRE: Poderoso y atractivo (resultado + velocidad + herramienta). NADA GENÉRICO.
2. SUBTÍTULO: 1 línea con el beneficio concreto
3. LÓGICA: Por qué complementa al PAU (usa la estrategia solución → nuevo problema)
4. ESTRUCTURA: Todas las secciones con lo que incluirá cada una
5. ELEMENTOS: Plantillas, checklists, tablas, calendarios o herramientas que incluirá
6. EXTENSIÓN: Aproximadamente {{paginasPorBono}} páginas
7. VALOR PERCIBIDO: A cuánto podría venderse solo

Respondé SOLO con JSON válido sin markdown:
{"bonos":[{"numero":1,"titulo":"...","subtitulo":"...","logica":"...","por_que_complementa":"...","estructura":["seccion 1","seccion 2","seccion 3"],"elementos":["plantilla de X","checklist de Y"],"valor_percibido":"$XX","paginas":{{paginasPorBono}}}]}`,
  },

  pau_5_bonos_contenido: {
    id: 'pau_5_bonos_contenido',
    label: 'PAU 5/5 — Contenido completo de bonos',
    mode: 'pau',
    desc: 'El Escritor de Bonos: escribe el contenido completo de cada bono con plantillas y checklists listos para usar.',
    variables: ['{{numBonos}}', '{{bonosList}}', '{{paginasPorBono}}'],
    content: `Escribí el contenido COMPLETO de estos {{numBonos}} bonos:
{{bonosList}}

Extensión: {{paginasPorBono}} páginas por bono (250-300 palabras por página).

Usá EXACTAMENTE las mismas reglas de escritura del PAU principal:
- Mismo tono: mentor cercano, directo, sin relleno
- Mismo formato visual: ERROR COMÚN, DATO CLAVE, TIPS RÁPIDOS, CHECKLISTS, PASOS NUMERADOS
- Frases cortas, párrafos cortos (máximo 3-4 líneas)
- NUNCA más de 2 párrafos sin elemento visual
- Plantillas y checklists COMPLETOS y listos para usar (no solo mencionarlos, escribirlos enteros)
- Ejemplos reales con números concretos

Estructura de cada bono:
1. PORTADA: Nombre + subtítulo + 1 frase gancho
2. INTRODUCCIÓN BREVE (media página): para qué sirve, cómo usarlo junto al PAU
3. CONTENIDO COMPLETO con todas las secciones, plantillas y herramientas
4. CIERRE: 🎯 PASO DE ACCIÓN de las próximas 24 horas

Respondé SOLO con JSON válido sin markdown:
{"bonos":[{"numero":1,"titulo":"...","contenido_completo":"texto completo del bono con todo el formato visual...","herramientas":["PLANTILLA COMPLETA: nombre y contenido...","CHECKLIST COMPLETO: items listos para usar..."],"plan_accion_24hs":["Paso 1: ...","Paso 2: ...","Paso 3: ..."]}]}`,
  },
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'mvppdfs_prompts'

function loadPrompts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Merge with defaults to get any new prompts added in updates
      return { ...DEFAULT_PROMPTS, ...parsed }
    }
  } catch {}
  return { ...DEFAULT_PROMPTS }
}

function savePrompts(prompts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
  } catch {}
}

export function getPrompt(id) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed[id]?.content || DEFAULT_PROMPTS[id]?.content || ''
    }
  } catch {}
  return DEFAULT_PROMPTS[id]?.content || ''
}

// ── Main Prompts Page ─────────────────────────────────────────────────────────
export default function Prompts() {
  const navigate = useNavigate()
  const [prompts, setPrompts] = useState(loadPrompts)
  const [geminiKey, setGeminiKey] = useState(() => {
    try {
      const saved = localStorage.getItem('mvppdfs_config')
      return saved ? JSON.parse(saved).geminiKey || '' : ''
    } catch { return '' }
  })
  const [keySaved, setKeySaved] = useState(false)

  const saveKey = () => {
    try {
      localStorage.setItem('mvppdfs_config', JSON.stringify({ geminiKey }))
      setKeySaved(true)
      setTimeout(() => setKeySaved(false), 2000)
    } catch {}
  }
  const [selected, setSelected] = useState('ebook_principal')
  const [saved, setSaved] = useState(false)
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'ebook' | 'pau'

  const current = prompts[selected]

  const updateContent = (content) => {
    setPrompts(p => ({ ...p, [selected]: { ...p[selected], content } }))
    setSaved(false)
  }

  const handleSave = () => {
    savePrompts(prompts)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (!confirm('¿Resetear este prompt al valor por defecto?')) return
    setPrompts(p => ({ ...p, [selected]: { ...DEFAULT_PROMPTS[selected] } }))
    setSaved(false)
  }

  const handleResetAll = () => {
    if (!confirm('¿Resetear TODOS los prompts a los valores por defecto?')) return
    setPrompts({ ...DEFAULT_PROMPTS })
    savePrompts(DEFAULT_PROMPTS)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const filteredIds = Object.keys(prompts).filter(id => {
    if (filterMode === 'all') return true
    return prompts[id].mode === filterMode
  })

  const wordCount = current?.content?.split(/\s+/).filter(Boolean).length || 0
  const charCount = current?.content?.length || 0

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar right={
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={() => navigate('/')} style={{ padding: '8px 14px', fontSize: 13 }}>← Home</Btn>
          <Btn variant="ghost" onClick={() => navigate('/crear')} style={{ padding: '8px 14px', fontSize: 13 }}>Crear PDF</Btn>
        </div>
      } />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <Tag color={PU}>EDITOR DE PROMPTS</Tag>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '12px 0 6px' }}>Personalizá los prompts de IA</h1>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
            Editá los prompts que la IA usa para generar los ebooks y PAUs. Cuanto más específicos sean, mejor el resultado.
            Los cambios se guardan en tu navegador y se usan en todas las generaciones futuras.
          </p>
        </div>

        {/* API Key section */}
        <div style={{
          background: '#0a1a0a', border: '1px solid #22c55e33',
          borderRadius: 14, padding: 20, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#22c55e', fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                🔑 GEMINI API KEY — Llamada directa (sin límite de tiempo)
              </p>
              <p style={{ color: '#555', fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>
                Con la key guardada aquí la app llama directo a Gemini desde tu browser — sin pasar por Netlify, sin timeout, ebooks completos sin cortes.
                Conseguila gratis en <a href="https://aistudio.google.com/apikey" target="_blank" style={{ color: '#22c55e' }}>aistudio.google.com/apikey</a>
              </p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  type="password"
                  style={{ flex: 1, minWidth: 200, background: '#061006', borderColor: '#22c55e44', fontFamily: 'monospace', fontSize: 13 }}
                />
                <button onClick={saveKey} style={{
                  background: keySaved ? '#16a34a' : '#22c55e',
                  color: '#000', border: 'none', borderRadius: 8,
                  padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                }}>
                  {keySaved ? '✓ Guardada' : 'Guardar key'}
                </button>
              </div>
              {geminiKey && (
                <p style={{ color: '#22c55e', fontSize: 11, marginTop: 8 }}>
                  ✓ Key configurada — la app usará llamada directa a Gemini sin timeout
                </p>
              )}
              {!geminiKey && (
                <p style={{ color: '#555', fontSize: 11, marginTop: 8 }}>
                  Sin key local → usa el proxy de Netlify (puede tener timeout en ebooks largos)
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>

          {/* Sidebar — lista de prompts */}
          <div>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'ebook', label: '📖 Ebook' },
                { id: 'pau', label: '⚡ PAU' },
              ].map(f => (
                <button key={f.id} onClick={() => setFilterMode(f.id)} style={{
                  flex: 1, padding: '7px 0', borderRadius: 8, border: 'none',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: filterMode === f.id ? (f.id === 'pau' ? PU : f.id === 'ebook' ? AC : '#333') : '#1e1e1e',
                  color: filterMode === f.id ? '#fff' : '#666',
                }}>{f.label}</button>
              ))}
            </div>

            {/* Prompt list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredIds.map(id => {
                const p = prompts[id]
                const isDefault = p.content === DEFAULT_PROMPTS[id]?.content
                return (
                  <div key={id} onClick={() => setSelected(id)} style={{
                    background: selected === id ? (p.mode === 'pau' ? PU + '22' : AC + '22') : '#111',
                    border: `1px solid ${selected === id ? (p.mode === 'pau' ? PU : AC) : '#222'}`,
                    borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                    transition: 'all .15s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 1,
                        color: p.mode === 'pau' ? PU : AC,
                        background: p.mode === 'pau' ? PU + '22' : AC + '22',
                        padding: '2px 6px', borderRadius: 4,
                      }}>
                        {p.mode === 'pau' ? '⚡ PAU' : '📖 EBOOK'}
                      </span>
                      {!isDefault && (
                        <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 700 }}>EDITADO</span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: selected === id ? '#fff' : '#ccc', marginBottom: 2 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>
                      {p.desc?.slice(0, 60)}...
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Reset all */}
            <button onClick={handleResetAll} style={{
              width: '100%', marginTop: 12, padding: '10px', borderRadius: 8,
              background: 'transparent', border: '1px solid #330000',
              color: '#ff4444', fontSize: 12, cursor: 'pointer', fontWeight: 600,
            }}>
              ↺ Resetear todos al defecto
            </button>
          </div>

          {/* Editor */}
          <div>
            {current && (
              <div>
                {/* Prompt header */}
                <div style={{
                  background: '#111', border: '1px solid #222', borderRadius: 12,
                  padding: '16px 20px', marginBottom: 14,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: 1,
                        color: current.mode === 'pau' ? PU : AC,
                        background: current.mode === 'pau' ? PU + '22' : AC + '22',
                        padding: '3px 8px', borderRadius: 5,
                      }}>
                        {current.mode === 'pau' ? '⚡ PAU' : '📖 EBOOK'}
                      </span>
                      <h2 style={{ fontSize: 16, fontWeight: 800 }}>{current.label}</h2>
                    </div>
                    <p style={{ color: '#666', fontSize: 13 }}>{current.desc}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={handleReset} style={{
                      padding: '8px 14px', borderRadius: 8, fontSize: 12,
                      background: 'transparent', border: '1px solid #333',
                      color: '#888', cursor: 'pointer',
                    }}>↺ Resetear</button>
                    <Btn onClick={handleSave} style={{ padding: '8px 18px', background: saved ? '#16a34a' : AC }}>
                      {saved ? '✓ Guardado' : 'Guardar'}
                    </Btn>
                  </div>
                </div>

                {/* Variables disponibles */}
                <div style={{
                  background: '#0d0a1e', border: '1px solid #2d1b69',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 14,
                }}>
                  <p style={{ color: PU, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
                    VARIABLES DISPONIBLES — se reemplazan automáticamente al generar
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(current.variables || []).map(v => (
                      <code key={v} style={{
                        background: '#1a1040', border: '1px solid #2d1b69',
                        borderRadius: 5, padding: '3px 8px', fontSize: 11,
                        color: '#c084fc', cursor: 'pointer',
                      }}
                        onClick={() => {
                          // Insert variable at cursor position
                          const ta = document.getElementById('prompt-editor')
                          if (ta) {
                            const start = ta.selectionStart
                            const end = ta.selectionEnd
                            const newContent = current.content.slice(0, start) + v + current.content.slice(end)
                            updateContent(newContent)
                          }
                        }}
                        title="Click para insertar en el cursor"
                      >{v}</code>
                    ))}
                  </div>
                  <p style={{ color: '#555', fontSize: 10, marginTop: 8 }}>Click en una variable para insertarla donde está el cursor</p>
                </div>

                {/* Textarea editor */}
                <textarea
                  id="prompt-editor"
                  value={current.content}
                  onChange={e => updateContent(e.target.value)}
                  rows={24}
                  style={{
                    width: '100%', fontSize: 13, lineHeight: 1.7,
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    background: '#0a0a0a', border: '1px solid #2a2a2a',
                    borderRadius: 10, padding: 18, color: '#e2e8f0',
                    resize: 'vertical',
                  }}
                />

                {/* Stats + actions */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: 10, flexWrap: 'wrap', gap: 10,
                }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ color: '#555', fontSize: 12 }}>{wordCount} palabras</span>
                    <span style={{ color: '#555', fontSize: 12 }}>{charCount} caracteres</span>
                    {current.content !== DEFAULT_PROMPTS[selected]?.content && (
                      <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>● Modificado</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn onClick={handleSave} style={{ padding: '10px 24px', background: saved ? '#16a34a' : AC }}>
                      {saved ? '✓ Guardado' : 'Guardar cambios'}
                    </Btn>
                    <Btn variant="secondary" onClick={() => navigate('/crear')} style={{ padding: '10px 20px' }}>
                      Ir a crear →
                    </Btn>
                  </div>
                </div>

                {/* Tips */}
                <div style={{
                  background: '#111', border: '1px solid #222',
                  borderRadius: 10, padding: 16, marginTop: 16,
                }}>
                  <p style={{ color: '#666', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
                    💡 TIPS PARA MEJORES RESULTADOS
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      'Sé específico con el tono — "mentor cercano que habla como amigo" es mejor que "informal"',
                      'Agregá ejemplos del nicho que ya funcionan en tu mercado',
                      'Especificá la extensión mínima por sección (ej: "mínimo 400 palabras por capítulo")',
                      'Indicá qué NO querés — "sin relleno", "sin introducción larga", "sin jerga académica"',
                      'Agregá contexto cultural LATAM — referencias, expresiones, situaciones locales',
                    ].map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ color: AC, fontSize: 11, flexShrink: 0 }}>→</span>
                        <span style={{ color: '#666', fontSize: 12, lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
