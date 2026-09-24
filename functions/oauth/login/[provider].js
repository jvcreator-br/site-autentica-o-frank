import { random, hash, txCookie, configured, providerConfig, error } from '../../_shared/auth.js';

export async function onRequestGet({ env, params }) {
  const provider = params.provider;
  if (provider !== 'google' && provider !== 'github') return error(404);
  if (!configured(env)) return error(503);
  try {
    const config = providerConfig(env, provider);
    const transaction = random();
    const state = random();
    const verifier = random();
    const nonce = provider === 'google' ? random() : null;
    const expires = Math.floor(Date.now() / 1000) + 600;
    await env.DB.prepare('INSERT INTO oauth_transactions (id_hash, provider, state_hash, nonce, code_verifier, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(await hash(transaction), provider, await hash(state), nonce, verifier, expires).run();
    const url = new URL(config.authorize);
    url.searchParams.set('client_id', config.id);
    url.searchParams.set('redirect_uri', config.redirect);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', await hash(verifier));
    url.searchParams.set('code_challenge_method', 'S256');
    if (provider === 'google') {
      url.searchParams.set('scope', 'openid email profile');
      url.searchParams.set('nonce', nonce);
    }
    return new Response(null, { status: 302, headers: {
      Location: url.toString(), 'Set-Cookie': txCookie(transaction), 'Cache-Control': 'no-store'
    }});
  } catch (_) {
    return error(500);
  }
}
