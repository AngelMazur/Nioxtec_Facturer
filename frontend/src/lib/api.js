/**
 * API client for communicating with the Flask backend.
 * 
 * Automatically handles:
 * - Base URL resolution (dev proxy vs production)
 * - JWT token authentication
 * - Error handling and parsing
 * - JSON content-type headers
 */

const defaultBase = typeof window !== 'undefined' && window.location.port === '8080'
  ? 'http://127.0.0.1:5000'
  : ''
const API_BASE = import.meta.env.VITE_API_BASE || defaultBase // use proxy in dev or backend:5000 when served on 8080

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
  const res = await fetch(`${API_BASE}/api${path}`, { headers: getHeaders(token) })
  if (!res.ok) throw new Error(await safeError(res))
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
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await safeError(res))
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

export async function apiPut(path, body, token) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await safeError(res))
  return res.json()
}

export async function apiPatch(path, body, token) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await safeError(res))
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
  try { const j = await res.json(); return j.error || res.statusText } catch { return res.statusText }
}


