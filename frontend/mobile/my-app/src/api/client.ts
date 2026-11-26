import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1')).replace(/\/$/, '');
let accessToken: string | null = null;
let refreshToken: string | null = null;
let initialized = false;
let generation = 0;
let refreshing: Promise<void> | null = null;
const listeners = new Set<() => void>();
export const onSessionChange = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const emit = () => listeners.forEach(listener => listener());
async function readStored() {
  return Platform.OS === 'web' ? (typeof localStorage === 'undefined' ? null : localStorage.getItem('crm_refresh_token')) : SecureStore.getItemAsync('crm_refresh_token');
}
async function writeStored(value: string | null) {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') { if (value) localStorage.setItem('crm_refresh_token', value); else localStorage.removeItem('crm_refresh_token'); }
  } else if (value) await SecureStore.setItemAsync('crm_refresh_token', value);
  else await SecureStore.deleteItemAsync('crm_refresh_token');
}
export async function clearSession() {
  generation++; accessToken = null; refreshToken = null; initialized = true; emit();
  await writeStored(null);
}
export async function setSession(access: string, refresh: string, remember: boolean) {
  await writeStored(remember ? refresh : null);
  generation++; accessToken = access; refreshToken = refresh; initialized = true; emit();
}
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
async function send(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    return await fetch(API_BASE_URL + path, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...options.headers, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) } });
  } catch { throw new Error('Cannot reach the backend. Check your connection and API address.'); }
  finally { clearTimeout(timer); }
}
async function parse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, json.message || `Request failed (${response.status}).`);
  return json.data;
}
async function refresh() {
  if (!refreshing) refreshing = (async () => {
    const version = generation;
    if (!initialized) { refreshToken = await readStored(); initialized = true; }
    if (!refreshToken) throw new ApiError(401, 'Please log in to manage students.');
    try {
      const data = await parse<{ accessToken: string }>(await send('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }));
      if (version !== generation) throw new ApiError(401, 'Session changed. Please try again.');
      accessToken = data.accessToken;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && version === generation) await clearSession();
      throw error;
    }
  })().finally(() => { refreshing = null; });
  return refreshing;
}
export async function request<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  if (authenticated && !accessToken) await refresh();
  const version = generation;
  const token = accessToken;
  let response = await send(path, options);
  if (authenticated && response.status === 401) {
    if (version !== generation) throw new ApiError(401, 'Session changed. Please log in again.');
    if (token === accessToken) await refresh();
    response = await send(path, options);
    if (response.status === 401) { await clearSession(); throw new ApiError(401, 'Session expired. Please log in again.'); }
  }
  if (authenticated && version !== generation) throw new ApiError(401, 'Session changed. Please log in again.');
  return parse<T>(response);
}
