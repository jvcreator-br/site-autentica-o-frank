import { cookie, hash, sessionCookie } from '../_shared/auth.js';

export async function onRequest({ request, env }) {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  if (request.method !== 'POST') {
    headers.set('Allow', 'POST');
    return new Response(null, { status: 405, headers });
  }
  if (!env.DB || !env.PUBLIC_BASE_URL) return new Response(null, { status: 503, headers });
  if (request.headers.get('Origin') !== env.PUBLIC_BASE_URL)
    return new Response(null, { status: 403, headers });
  try {
    const session = cookie(request, '__Host-session');
    if (session) await env.DB.prepare('DELETE FROM sessions WHERE id_hash = ?')
      .bind(await hash(session)).run();
    headers.set('Set-Cookie', sessionCookie('', 0));
    headers.set('Location', env.PUBLIC_BASE_URL);
    return new Response(null, { status: 303, headers });
  } catch (_) {
    return new Response(null, { status: 500, headers });
  }
}
