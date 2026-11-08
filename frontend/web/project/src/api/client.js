/**
 * api/client.js
 * Central HTTP fetch wrapper for the Smart CRM backend.
 *
 * - Prepends VITE_API_BASE_URL to every request.
 * - Injects the JWT access token from localStorage automatically.
 * - On a 401 response (token expired), attempts a silent refresh and retries.
 * - On refresh failure, clears the session and redirects to login.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────
export function getAccessToken() {
  return localStorage.getItem('crm_access_token');
}

export function getRefreshToken() {
  return localStorage.getItem('crm_refresh_token');
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('crm_access_token', accessToken);
  if (refreshToken) localStorage.setItem('crm_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('crm_access_token');
  localStorage.removeItem('crm_refresh_token');
  localStorage.removeItem('crm_user');
  localStorage.removeItem('crm_workspace');
}

// ─── Token refresh ────────────────────────────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function attemptRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error('Refresh failed');

  const json = await res.json();
  const newAccessToken = json.data?.accessToken;
  if (!newAccessToken) throw new Error('No access token in refresh response');

  setTokens(newAccessToken, null);
  return newAccessToken;
}

// ─── Main request function ────────────────────────────────────────────────────
/**
 * @param {string} path       - e.g. '/auth/login' (without base URL)
 * @param {RequestInit} opts  - standard fetch options
 * @returns {Promise<any>}    - parsed JSON data field, or throws ApiError
 */
export async function request(path, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const accessToken = getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const response = await fetch(url, { ...opts, headers });

  // ── Silent token refresh on 401 ──────────────────────────────────────────
  if (response.status === 401 && !path.includes('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await attemptRefresh();
        isRefreshing = false;
        onRefreshed(newToken);
        // Retry the original request with the new token
        return request(path, opts);
      } catch {
        isRefreshing = false;
        clearTokens();
        window.location.hash = '#login';
        throw new ApiError(401, 'Session expired. Please log in again.');
      }
    }

    // If a refresh is already in flight, queue this request
    return new Promise((resolve, reject) => {
      refreshSubscribers.push((token) => {
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
        fetch(url, { ...opts, headers: retryHeaders })
          .then((r) => parseResponse(r).then(resolve).catch(reject))
          .catch(reject);
      });
    });
  }

  return parseResponse(response);
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

