const API_BASE = import.meta.env.VITE_API_BASE || '' // use proxy in dev

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

async function safeError(res) {
  try { const j = await res.json(); return j.error || res.statusText } catch { return res.statusText }
}


