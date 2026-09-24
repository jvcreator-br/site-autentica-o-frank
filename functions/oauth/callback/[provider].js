import { cookie, hash, random, txCookie, sessionCookie, configured, providerConfig, exchange, googleIdentity, githubIdentity, error } from '../../_shared/auth.js';

export async function onRequestGet({ request, env, params }) {
  const provider = params.provider;
  if (provider !== 'google' && provider !== 'github') return error(404);
  if (!configured(env)) return error(503);
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const transaction = cookie(request, '__Host-oauth-tx');
  if (url.searchParams.has('error') || !code || !state || !transaction) return error();
  let stage = 'transaction';
  try {
    const now = Math.floor(Date.now() / 1000);
    const result = await env.DB.prepare(
      'DELETE FROM oauth_transactions WHERE id_hash = ? AND provider = ? AND state_hash = ? AND expires_at > ? RETURNING nonce, code_verifier'
    ).bind(await hash(transaction), provider, await hash(state), now).first();
    if (!result) {
      console.error('OAuth callback failed', provider, stage);
      return error();
    }
    const config = providerConfig(env, provider);
    stage = 'token';
    const tokens = await exchange(config, code, result.code_verifier);
    stage = 'identity';
    const identity = provider === 'google'
      ? await googleIdentity(tokens.id_token, env, result.nonce)
      : await githubIdentity(tokens, config);
    stage = 'session';
    const session = random();
    await env.DB.prepare(
      'INSERT INTO sessions (id_hash, issuer, subject, email, display_name, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(await hash(session), identity.issuer, identity.subject, identity.email,
      identity.displayName, now + 28800, now).run();
    const headers = new Headers({ Location: env.PUBLIC_BASE_URL, 'Cache-Control': 'no-store' });
    headers.append('Set-Cookie', txCookie('', 0));
    headers.append('Set-Cookie', sessionCookie(session));
    return new Response(null, { status: 302, headers });
    } catch (caught) {
    const reason = provider === 'github' && stage === 'identity' &&
      ['github token', 'github user', 'github identity', 'github revoke'].includes(caught?.message)
      ? caught.message : 'other';
    console.error('OAuth callback failed', provider, stage, reason);
    return error();
  }
}
