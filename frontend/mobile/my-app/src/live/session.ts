import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createApi, type Session } from '../api-shared/http';
import type { RecordData } from '../api-shared/records';

type AuthState = { ready: boolean; user: RecordData | null; workspace: RecordData | null; error: string };
let state: AuthState = { ready:false,user:null,workspace:null,error:'' };
let tokens: Session | null = null;
const listeners = new Set<()=>void>();
const subscribe = (fn:()=>void) => { listeners.add(fn); return ()=>{listeners.delete(fn);}; };
const snapshot = () => state;
const publish = (next: Partial<AuthState>) => { state={...state,...next};listeners.forEach(fn=>fn()); };
export const useSession = () => useSyncExternalStore(subscribe,snapshot,snapshot);
const storage = {
  async get(key:string) { return Platform.OS==='web' ? (typeof localStorage==='undefined'?null:localStorage.getItem(key)) : SecureStore.getItemAsync(key); },
  async set(key:string,value:string) { if(Platform.OS==='web')localStorage.setItem(key,value);else await SecureStore.setItemAsync(key,value); },
  async remove(key:string) { if(Platform.OS==='web'){if(typeof localStorage!=='undefined')localStorage.removeItem(key);}else await SecureStore.deleteItemAsync(key); },
};
async function saveTokens(next:Session) {
  await storage.set('crm_access_token',next.accessToken);
  await storage.set('crm_refresh_token',next.refreshToken);
  tokens=next;
}
export async function logout() {
  tokens=null;publish({ready:true,user:null,workspace:null,error:''});
  await Promise.all([storage.remove('crm_access_token'),storage.remove('crm_refresh_token')]);
}
export const api = createApi({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '',
  getSession:async()=>tokens,
  saveSession:saveTokens,
  expireSession:logout,
});
let initialization: Promise<void> | undefined;
export function initialize() {
  if(initialization)return initialization;
  initialization=(async()=>{
    try {
      const accessToken=await storage.get('crm_access_token'), refreshToken=await storage.get('crm_refresh_token');
      if(accessToken&&refreshToken) {
        tokens={accessToken,refreshToken};
        const context=await api.request('/auth/me');
        const [user,workspace]=await Promise.all([api.request(`/users/${context.userId}`),api.request('/workspaces/me')]);
        publish({user,workspace,error:''});
      }
    }catch(error){publish({error:error instanceof Error?error.message:'Unable to restore session.'});}
    finally{publish({ready:true});}
  })();
  return initialization;
}
export async function signIn(input:RecordData, register=false) {
  const data=await api.request(register?'/auth/register':'/auth/login',{method:'POST',body:JSON.stringify(input)});
  await saveTokens({accessToken:data.accessToken,refreshToken:data.refreshToken});
  publish({ready:true,user:data.user,workspace:data.workspace,error:''});
}
export function updateWorkspace(workspace:RecordData) { publish({workspace}); }
