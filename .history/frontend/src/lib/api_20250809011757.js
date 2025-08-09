const defaultBase = typeof window !== 'undefined' && window.location.port === '8080'
  ? 'http://127.0.0.1:5000'
  : ''
const API_BASE = import.meta.env.VITE_API_BASE || defaultBase // use proxy in dev or backend:5000 when served on 8080

function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function apiGet(path, token) {
  const res = await fetch(`${API_BASE}/api${path}`, { headers: getHeaders(token) })
  if (!res.ok) throw new Error(await safeError(res))
  return res.json()
}

export async function apiPost(path, body, token) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await safeError(res))
  return res.json()
}

export async function apiGetBlob(path, token) {
  const res = await fetch(`${API_BASE}/api${path}`, { headers: getHeaders(token) })
  if (!res.ok) throw new Error(await safeError(res))
  return res.blob()
}

export async function apiDelete(path, token) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  })
  if (!res.ok) throw new Error(await safeError(res))
  return res.json()
}

async function safeError(res) {
  try { const j = await res.json(); return j.error || res.statusText } catch { return res.statusText }
}


