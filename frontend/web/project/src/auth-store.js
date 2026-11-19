/**
 * auth-store.js
 * Global authentication state using useSyncExternalStore.
 * Syncs with localStorage so sessions survive page reloads.
 */

import { useSyncExternalStore } from 'react';
import { getStoredSession } from './api/auth.js';
import { getAccessToken, clearTokens } from './api/client.js';

// ─── Initial state from localStorage ─────────────────────────────────────────
function buildInitialState() {
  const { user, workspace } = getStoredSession();
  return {
    user,       // { id, name, email, role } or null
    workspace,  // { id, name, schoolEnabled, gymEnabled, barberEnabled } or null
    isAuthenticated: !!(user && getAccessToken()),
    isLoading: false,
    error: null,
  };
}

let state = buildInitialState();
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

// ─── Public getters ───────────────────────────────────────────────────────────
export const getAuthState = () => state;

export function useAuth() {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    getAuthState,
    getAuthState
  );
}

// ─── State mutators (called after API calls in App.jsx) ───────────────────────
export function setAuthSession(user, workspace) {
  state = { user, workspace, isAuthenticated: true, isLoading: false, error: null };
  emit();
}

export function setAuthLoading(isLoading) {
  state = { ...state, isLoading, error: null };
  emit();
}

export function setAuthError(error) {
  state = { ...state, isLoading: false, error };
  emit();
}

export function clearAuthSession() {
  clearTokens();
  state = { user: null, workspace: null, isAuthenticated: false, isLoading: false, error: null };
  emit();
}

