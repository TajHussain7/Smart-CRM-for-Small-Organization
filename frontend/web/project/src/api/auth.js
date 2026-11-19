import { request, setTokens, clearTokens } from './client.js'
function persist(data) {
  setTokens(data.accessToken, data.refreshToken)
  localStorage.setItem('crm_user', JSON.stringify(data.user))
  localStorage.setItem('crm_workspace', JSON.stringify(data.workspace))
  return data
}
export async function register(input) {
  return persist(await request('/auth/register', {method:'POST',body:JSON.stringify(input)}))
}
export async function login(input) {
  return persist(await request('/auth/login', {method:'POST',body:JSON.stringify(input)}))
}
export function logout() { clearTokens(); window.location.hash = '#login' }
export const getMyWorkspace = () => request('/workspaces/me')
export function getStoredSession() {
  try { return { user:JSON.parse(localStorage.getItem('crm_user') || 'null'), workspace:JSON.parse(localStorage.getItem('crm_workspace') || 'null') } }
  catch { return {user:null,workspace:null} }
}
