import { cookie, hash } from '../_shared/auth.js';

export async function onRequestGet({ request, env }) {
  const headers = { 'Cache-Control': 'no-store' };
  if (!env.DB) return new Response(null, { status: 503, headers });
  const session = cookie(request, '__Host-session');
  if (!session) return new Response(null, { status: 401, headers });
  try {
    const now = Math.floor(Date.now() / 1000);
    const user = await env.DB.prepare(
      'SELECT issuer, subject, email, display_name FROM sessions WHERE id_hash = ? AND expires_at > ?'
    ).bind(await hash(session), now).first();
    if (!user) return new Response(null, { status: 401, headers });
    return Response.json({ issuer: user.issuer, subject: user.subject,
      email: user.email, displayName: user.display_name }, { headers });
  } catch (_) {
    return new Response(null, { status: 500, headers });
  }
}
