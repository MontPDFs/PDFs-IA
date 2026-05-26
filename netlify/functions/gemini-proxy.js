const MODELS = ['gemini-3.1-flash-lite','gemini-2.5-flash','gemini-2.5-flash-lite','gemini-3.5-flash']

function getKeys() {
  const keys = []
  let i = 1
  while (true) {
    const k = process.env['GEMINI_KEY_' + i]
    if (!k) break
    keys.push(k)
    i++
  }
  if (keys.length === 0 && process.env.GEMINI_KEY) keys.push(process.env.GEMINI_KEY)
  return keys
}

export default async (req) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  const keys = getKeys()
  if (!keys.length) return new Response(JSON.stringify({ error: 'No hay GEMINI_KEY configurada' }), { status: 500, headers })
  let body
  try { body = await req.json() } catch { return new Response(JSON.stringify({ error: 'Body invalido' }), { status: 400, headers }) }
  const { prompt, maxTokens = 4096 } = body
  if (!prompt) return new Response(JSON.stringify({ error: 'prompt requerido' }), { status: 400, headers })
  const errors = []
  for (const key of keys) {
    for (const model of MODELS) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: maxTokens } }),
        })
        const data = await res.json()
        if (res.status === 429 || res.status === 403 || res.status === 400) { errors.push(`${model}: ${data.error?.message?.slice(0,80)}`); continue }
        if (!res.ok) return new Response(JSON.stringify({ error: data.error?.message || 'Error Gemini' }), { status: res.status, headers })
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        if (!text) { errors.push(`${model}: respuesta vacia`); continue }
        return new Response(JSON.stringify({ text, model_used: model }), { status: 200, headers })
      } catch (err) { errors.push(`${model}: ${err.message}`); continue }
    }
  }
  return new Response(JSON.stringify({ error: 'Todos los modelos fallaron', details: errors }), { status: 500, headers })
}

export const config = { path: '/api/gemini' }
