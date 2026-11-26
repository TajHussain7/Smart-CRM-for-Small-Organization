/**
 * api/client.js
 * Central HTTP fetch wrapper for the Smart CRM backend.
 *
 * - Prepends VITE_API_BASE_URL to every request.
 * - Injects the JWT access token from localStorage automatically.
 * - On a 401 response (token expired), attempts a silent refresh and retries.
 * - On refresh failure, clears the session and redirects to login.
 */

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────
export function getAccessToken() {
  return localStorage.getItem('crm_access_token');
}

export function getRefreshToken() {
  return localStorage.getItem('crm_refresh_token');
}

export function setTokens(accessToken, refreshToken) {
  sessionVersion++;
  localStorage.setItem('crm_access_token', accessToken);
  if (refreshToken) localStorage.setItem('crm_refresh_token', refreshToken);
}

export function clearTokens() {
  sessionVersion++;
  localStorage.removeItem('crm_access_token');
  localStorage.removeItem('crm_refresh_token');
  localStorage.removeItem('crm_user');
  localStorage.removeItem('crm_workspace');
  window.dispatchEvent(new Event('crm-session-cleared'));
}

// A single refresh promise settles all concurrent requests, including failures.
let refreshing = null
let sessionVersion = 0
async function attemptRefresh() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new ApiError(401, 'Please log in again.')
  const version = sessionVersion
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  const data = await parseResponse(res)
  if (!data.accessToken || version !== sessionVersion) throw new ApiError(401, 'Session changed. Please log in again.')
  localStorage.setItem('crm_access_token', data.accessToken)
}
export async function request(path, opts = {}, retried = false) {
  const version = sessionVersion
  const token = getAccessToken()
  const response = await fetch(`${BASE_URL}${path}`, { ...opts, headers: {
    'Content-Type': 'application/json', ...opts.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } })
  if (version !== sessionVersion) throw new ApiError(401, 'Session changed. Please retry.')
  if (response.status === 401 && !path.startsWith('/auth/')) {
    try {
      if (retried) throw new ApiError(401, 'Session expired. Please log in again.')
      if (token === getAccessToken()) {
        if (!refreshing) refreshing = attemptRefresh().finally(() => { refreshing = null })
        await refreshing
      }
      return request(path, opts, true)
    } catch (error) {
      if (error.status === 401 && version === sessionVersion) {
        clearTokens()
        window.location.hash = '#login'
      }
      throw error
    }
  }
  return parseResponse(response)
}

async function parseResponse(response) {
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      json.message || `HTTP error ${response.status}`
    );
  }

  // Backend wraps all success responses in { success, message, data }
  return json.data !== undefined ? json.data : json;
}

// ─── Error class ──────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

