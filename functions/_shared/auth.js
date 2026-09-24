const enc = new TextEncoder();
const noStore = { 'Cache-Control': 'no-store' };

export function error(status = 400) {
  return new Response('Falha na autenticação.', { status, headers: noStore });
}
export function random() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64url(bytes);
}
export function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export async function hash(value) {
  return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(value))));
}
export function cookie(request, name) {
  const part = (request.headers.get('Cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  return part ? part.slice(name.length + 1) : null;
}
export function txCookie(value, age = 600) {
  return '__Host-oauth-tx=' + value + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + age;
}
export function sessionCookie(value, age = 28800) {
  return '__Host-session=' + value + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + age;
}
export function configured(env) {
  return env.DB && env.PUBLIC_BASE_URL === 'https://site-autentica-o-frank.pages.dev' &&
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET;
}
export function providerConfig(env, provider) {
  const redirect = env.PUBLIC_BASE_URL + '/oauth/callback/' + provider;
  if (provider === 'google') return {
    id: env.GOOGLE_CLIENT_ID, secret: env.GOOGLE_CLIENT_SECRET, redirect,
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token'
  };
  if (provider === 'github') return {
    id: env.GITHUB_CLIENT_ID, secret: env.GITHUB_CLIENT_SECRET, redirect,
    authorize: 'https://github.com/login/oauth/authorize',
    token: 'https://github.com/login/oauth/access_token'
  };
  return null;
}
export async function exchange(config, code, verifier) {
  const body = new URLSearchParams({
    client_id: config.id, client_secret: config.secret, code,
    redirect_uri: config.redirect, code_verifier: verifier,
    grant_type: 'authorization_code'
  });
  const response = await fetch(config.token, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body
  });
  if (!response.ok) throw new Error('token exchange');
  return response.json();
}
function decodePart(part) {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - part.length % 4) % 4);
  return Uint8Array.from(atob(padded), ch => ch.charCodeAt(0));
}
export async function googleIdentity(idToken, env, expectedNonce) {
  if (typeof idToken !== 'string') throw new Error('missing id token');
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('invalid jwt');
  const header = JSON.parse(new TextDecoder().decode(decodePart(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(decodePart(parts[1])));
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('invalid header');
  const discoveryResponse = await fetch('https://accounts.google.com/.well-known/openid-configuration');
  if (!discoveryResponse.ok) throw new Error('discovery');
  const discovery = await discoveryResponse.json();
  if (discovery.issuer !== 'https://accounts.google.com' ||
      typeof discovery.jwks_uri !== 'string' || !discovery.jwks_uri.startsWith('https://www.googleapis.com/')) throw new Error('discovery');
  const keyResponse = await fetch(discovery.jwks_uri);
  if (!keyResponse.ok) throw new Error('jwks');
  const { keys } = await keyResponse.json();
  const jwk = keys.find(key => key.kid === header.kid && key.kty === 'RSA' && key.use === 'sig');
  if (!jwk) throw new Error('key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decodePart(parts[2]), enc.encode(parts[0] + '.' + parts[1]))) throw new Error('signature');
  const now = Math.floor(Date.now() / 1000);
  if (!['https://accounts.google.com', 'accounts.google.com'].includes(claims.iss) ||
      claims.aud !== env.GOOGLE_CLIENT_ID || !Number.isInteger(claims.exp) || claims.exp <= now ||
      !Number.isInteger(claims.iat) || claims.iat > now + 60 ||
      claims.nonce !== expectedNonce || typeof claims.sub !== 'string' || !claims.sub) throw new Error('claims');
  return { issuer: 'https://accounts.google.com', subject: claims.sub,
    email: typeof claims.email === 'string' ? claims.email : null,
    displayName: typeof claims.name === 'string' ? claims.name : null };
}
export async function githubIdentity(tokenResponse, config) {
  if (typeof tokenResponse.access_token !== 'string' ||
      String(tokenResponse.token_type).toLowerCase() !== 'bearer') throw new Error('github token');
  const token = tokenResponse.access_token;
  const headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' };
  const profileResponse = await fetch('https://api.github.com/user', { headers });
  if (!profileResponse.ok) throw new Error('github user');
  const profile = await profileResponse.json();
  if (!Number.isSafeInteger(profile.id) || profile.id <= 0) throw new Error('github identity');
  const revoke = await fetch('https://api.github.com/applications/' + encodeURIComponent(config.id) + '/grant', {
    method: 'DELETE', headers: {
      Authorization: 'Basic ' + btoa(config.id + ':' + config.secret),
      Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10',
      'Content-Type': 'application/json'
    }, body: JSON.stringify({ access_token: token })
  });
  if (revoke.status !== 204) throw new Error('github revoke');
  return { issuer: 'https://github.com', subject: String(profile.id),
    email: typeof profile.email === 'string' ? profile.email : null,
    displayName: typeof profile.name === 'string' && profile.name ? profile.name : profile.login };
}
