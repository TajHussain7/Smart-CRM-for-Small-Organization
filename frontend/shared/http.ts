export type Session = { accessToken: string; refreshToken: string };
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status=status; this.name = 'ApiError'; }
}
type Options = {
  baseUrl: string;
  getSession: () => Promise<Session | null>;
  saveSession: (session: Session) => Promise<void>;
  expireSession: () => Promise<void>;
  fetcher?: typeof fetch;
};
/** Shared transport: one refresh for concurrent requests, one retry, no write retries. */
export function createApi(options: Options) {
  const base = options.baseUrl.replace(/\/+$/, '');
  const fetcher = options.fetcher || fetch;
  let refresh: Promise<Session> | null = null;
  async function send(path: string, init: RequestInit, session: Session | null) {
    if (!base) throw new ApiError(0, 'The API address has not been configured.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      return await fetcher(`${base}${path}`, {
        ...init, signal: controller.signal,
        headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers,
          ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}) },
      });
    } catch {
      throw new ApiError(0, 'Unable to reach the server. Check your connection and try again.');
    } finally { clearTimeout(timer); }
  }
  async function parse(response: Response) {
    const json = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(response.status, json?.message || `Request failed (${response.status}).`);
    if (!json) throw new ApiError(response.status, 'The server returned an unexpected response.');
    return json.data !== undefined ? json.data : json;
  }
  async function response(path: string, init: RequestInit = {}) {
    const session = await options.getSession();
    let result = await send(path, init, session);
    if (result.status === 401 && !['/auth/login', '/auth/register', '/auth/refresh'].includes(path)) {
      if (!session?.refreshToken) { await options.expireSession(); throw new ApiError(401, 'Please sign in again.'); }
      const current = await options.getSession();
      if (current && current.accessToken !== session.accessToken) {
        result = await send(path, init, current);
      } else {
        if (!refresh) {
          refresh = (async () => {
            const data = await parse(await send('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: session.refreshToken }) }, null));
            if (!data.accessToken) throw new ApiError(401, 'Please sign in again.');
            const next = { ...session, accessToken: data.accessToken };
            const active = await options.getSession();
            if (active?.refreshToken !== session.refreshToken) throw new ApiError(401, 'Session changed. Please sign in again.');
            await options.saveSession(next);
            return next;
          })().catch(async error => {
            const active = await options.getSession();
            if ((error.status === 401 || error.status === 403) && active?.refreshToken === session.refreshToken) await options.expireSession();
            throw error;
          }).finally(() => { refresh = null; });
        }
        result = await send(path, init, await refresh);
      }
      if (result.status === 401) { await options.expireSession(); throw new ApiError(401, 'Session expired. Please sign in again.'); }
    }
    return result;
  }
  return {
    async request(path: string, init: RequestInit = {}) { return parse(await response(path, init)); },
    async download(path: string) {
      const result = await response(path);
      if (!result.ok) await parse(result);
      return result;
    },
  };
}
