// The preview's cookie. The Studio's Presentation tool opens /api/draft-mode/enable/ with a one-time secret; once that
// checks out, the browser gets this cookie and /preview/… shows drafts. The cookie is signed with the read token
// (HMAC-SHA-256) and expires, so nobody can make one without the token.
import type { AstroCookies } from 'astro';

export const PREVIEW_COOKIE = 'recto-preview';
/** Hours a preview session lasts before the Studio has to open it again. */
const HOURS = 8;

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`recto-preview:${value}`));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time comparison of two hex strings. */
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// The Studio shows the site in a frame on another site, so the cookie must be SameSite=None (and so Secure; browsers
// accept that on http://localhost too). Partitioned keeps it to that frame where third-party cookies are blocked.
const OPTIONS = { path: '/', httpOnly: true, secure: true, sameSite: 'none', partitioned: true } as const;

export async function startPreview(cookies: AstroCookies, secret: string) {
  const expires = Date.now() + HOURS * 3600_000;
  cookies.set(PREVIEW_COOKIE, `${expires}.${await sign(String(expires), secret)}`, { ...OPTIONS, expires: new Date(expires) });
}

export function endPreview(cookies: AstroCookies) {
  cookies.delete(PREVIEW_COOKIE, OPTIONS);
}

export async function inPreview(cookies: AstroCookies, secret: string | undefined) {
  const value = cookies.get(PREVIEW_COOKIE)?.value;
  if (!value || !secret) return false;
  const [expires, mac] = value.split('.');
  if (!(Number(expires) > Date.now()) || !mac) return false;
  return same(mac, await sign(expires, secret));
}
