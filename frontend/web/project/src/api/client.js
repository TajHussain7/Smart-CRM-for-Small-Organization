import { createApi } from '../api-shared/http.ts'
export { ApiError } from '../api-shared/http.ts'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '')
export const getAccessToken = () => localStorage.getItem('crm_access_token')
export const getRefreshToken = () => localStorage.getItem('crm_refresh_token')
export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('crm_access_token', accessToken)
  if (refreshToken) localStorage.setItem('crm_refresh_token', refreshToken)
}
export function clearTokens() {
  for (const key of ['crm_access_token','crm_refresh_token','crm_user','crm_workspace']) localStorage.removeItem(key)
  window.dispatchEvent(new Event('crm-session-cleared'))
}
const api = createApi({
  baseUrl: BASE_URL,
  getSession: async () => getAccessToken() ? { accessToken: getAccessToken(), refreshToken: getRefreshToken() } : null,
  saveSession: async session => setTokens(session.accessToken, session.refreshToken),
  expireSession: async () => { clearTokens(); window.location.hash = '#login' },
})
export const request = api.request
export async function download(path, filename) {
  const response = await api.download(path)
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
