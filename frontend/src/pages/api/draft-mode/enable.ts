// The Studio's Presentation tool opens the site through here: it checks the one-time secret the Studio created (with
// the read token, in the Worker), sets the signed preview cookie (src/lib/preview.ts) and goes to the page asked for,
// under /preview/. Nobody else gets in.
import type { APIRoute } from 'astro';
import { sanityClient } from 'sanity:client';
import { SANITY_API_READ_TOKEN } from 'astro:env/server';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { projectId } from '../../../lib/sanity';
import { startPreview } from '../../../lib/preview';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  if (!projectId || !SANITY_API_READ_TOKEN) return new Response('The preview needs PUBLIC_SANITY_PROJECT_ID and SANITY_API_READ_TOKEN.', { status: 501 });
  const client = sanityClient.withConfig({ token: SANITY_API_READ_TOKEN, useCdn: false, perspective: 'raw' });
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(client, request.url);
  if (!isValid) return new Response('Invalid secret', { status: 401 });
  await startPreview(cookies, SANITY_API_READ_TOKEN);
  // Only a path on this site, never an address somewhere else; drafts live under /preview/.
  const path = redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/';
  return redirect(path.startsWith('/preview/') ? path : `/preview${path}`, 307);
};
