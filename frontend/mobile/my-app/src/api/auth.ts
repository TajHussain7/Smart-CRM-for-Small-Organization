import { request, setSession } from './client';
export type AuthResponse = { accessToken: string; refreshToken: string; user: { name: string; email: string }; workspace: { name: string } };
export async function authenticate(input: { email: string; password: string; name?: string; businessName?: string }, register: boolean, remember: boolean) {
  const data = await request<AuthResponse>(register ? '/auth/register' : '/auth/login', { method: 'POST', body: JSON.stringify(register ? { ...input, schoolEnabled: true, gymEnabled: true, barberEnabled: true } : input) }, false);
  await setSession(data.accessToken, data.refreshToken, remember);
  return data;
}
