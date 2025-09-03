/**
 * API client for communicating with the Flask backend.
 * 
 * Automatically handles:
 * - Base URL resolution (dev proxy vs production)
 * - JWT token authentication
 * - Error handling and parsing
 * - JSON content-type headers
 */

const defaultBase = typeof window !== 'undefined' && (window.location.port === '8080' || window.location.port === '5173')
  ? `${window.location.protocol}//${window.location.hostname}:5001`
  : '' // En producción, usar rutas relativas
// Permite configurar una URL completa del backend por env (recomendado en acceso externo)
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '') || defaultBase

/**
 * Build headers for API requests with optional JWT token.
 * 
 * @param {string} token - JWT token for authentication
 * @returns {Object} Headers object
 */
function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

/**
 * Perform GET request to API endpoint.
 * 
 * @param {string} path - API endpoint path (without /api prefix)
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} JSON response data
 * @throws {Error} API error message
 */
export async function apiGet(path, token) {
  const res = await fetch(`${API_BASE}/api${path}`, { headers: getHeaders(token), credentials: 'include' })
  if (!res.ok) {
    const msg = await safeError(res)
    const e = new Error(msg)
    e.status = res.status
    throw e
  }
  return res.json()
}

/**
 * Perform POST request to API endpoint.
 * 
 * @param {string} path - API endpoint path (without /api prefix)
 * @param {Object} body - Request payload to send as JSON
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} JSON response data
 * @throws {Error} API error message
 */
export async function apiPost(path, body, token) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers: getHeaders(token),
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await safeError(res)
    const e = new Error(msg)
    e.status = res.status
    throw e
  }
  return res.json()
}

/**
 * Perform GET request and return binary data (for file downloads).
 * 
 * @param {string} path - API endpoint path (without /api prefix)
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Blob>} Binary response data
 * @throws {Error} API error message
 */
export async function apiGetBlob(path, token) {
  const res = await fetch(`${API_BASE}/api${path}`, { headers: getHeaders(token), credentials: 'include' })
  if (!res.ok) {
    const msg = await safeError(res)
    const e = new Error(msg)
    e.status = res.status
    throw e
  }
  return res.blob()
}

export async function apiDelete(path, token) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'DELETE',
    headers: getHeaders(token),
    credentials: 'include',
  })
  if (!res.ok) {
    const msg = await safeError(res)
    const e = new Error(msg)
    e.status = res.status
    throw e
  }
  return res.json()
}

export async function apiPut(path, body, token) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'PUT',
    headers: getHeaders(token),
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    // Debug: log full response body (use clone so safeError can still read it)
    try {
      const bodyText = await res.clone().text()
      if (typeof console !== 'undefined' && console.error) console.error('API PUT error response body:', bodyText)
  } catch (__) { void __ }
    const msg = await safeError(res)
    const e = new Error(msg)
    e.status = res.status
    throw e
  }
  return res.json()
}

export async function apiPatch(path, body, token) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await safeError(res)
    const e = new Error(msg)
    e.status = res.status
    throw e
  }
  return res.json()
}

/**
 * Extract error message from API response.
 * 
 * Attempts to parse JSON error message, falls back to status text.
 * 
 * @param {Response} res - Fetch response object
 * @returns {Promise<string>} Error message
 */
async function safeError(res) {
  try {
    // Try JSON first
    const j = await res.json()
    // If server provides structured error fields, prefer them
    if (j && (j.error || j.message)) return j.error || j.message
    // otherwise stringify the JSON
    return JSON.stringify(j)
  } catch {
    try {
      // fallback to plain text body
      const txt = await res.text()
      if (txt) return txt
  } catch {
      // ignore
    }
    return res.statusText
  }
}

