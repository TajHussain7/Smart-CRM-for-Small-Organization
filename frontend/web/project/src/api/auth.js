/**
 * api/auth.js
 * Authentication & workspace API calls for the Smart CRM frontend.
 */

import { request, setTokens, clearTokens } from './client.js';

// ─── Register (creates user + workspace in one shot) ─────────────────────────
/**
 * @param {{ name: string, email: string, password: string, businessName: string,
 *           schoolEnabled?: boolean, gymEnabled?: boolean, barberEnabled?: boolean }} input
 */
export async function register(input) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  // Persist tokens and session data immediately after registration
  setTokens(data.accessToken, data.refreshToken);
  persistSession(data.user, data.workspace);

  return data;
}

// ─── Login ───────────────────────────────────────────────────────────────────
/**
 * @param {{ email: string, password: string }} credentials
 */
export async function login(credentials) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  setTokens(data.accessToken, data.refreshToken);

  // After login, fetch the workspace separately (login returns user + tokens)
  const workspace = await getMyWorkspace();
  persistSession(data.user, workspace);

  return { user: data.user, workspace };
}

// ─── Logout ──────────────────────────────────────────────────────────────────
export function logout() {
  clearTokens();
  window.location.hash = '#login';
}

// ─── Get current user (from token) ───────────────────────────────────────────
export async function getCurrentUser() {
  return request('/auth/me');
}

// ─── Get workspace for the authenticated user ─────────────────────────────────
export async function getMyWorkspace() {
  return request('/workspaces/me');
}

// ─── Refresh access token ─────────────────────────────────────────────────────
export async function refreshToken(token) {
  return request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
  });
}

// ─── Persist session to localStorage ─────────────────────────────────────────
function persistSession(user, workspace) {
  if (user) localStorage.setItem('crm_user', JSON.stringify(user));
  if (workspace) localStorage.setItem('crm_workspace', JSON.stringify(workspace));
}

// ─── Restore session from localStorage ───────────────────────────────────────
export function getStoredSession() {
  try {
    const user = JSON.parse(localStorage.getItem('crm_user') || 'null');
    const workspace = JSON.parse(localStorage.getItem('crm_workspace') || 'null');
    return { user, workspace };
  } catch {
    return { user: null, workspace: null };
  }
}

