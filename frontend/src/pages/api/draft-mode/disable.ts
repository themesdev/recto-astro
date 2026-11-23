// Leaves the preview: removes the preview cookie and goes back to the published page.
import type { APIRoute } from 'astro';
import { endPreview } from '../../../lib/preview';

export const prerender = false;

export const GET: APIRoute = ({ cookies, redirect, request }) => {
  endPreview(cookies);
  const from = new URL(request.headers.get('referer') ?? '/', request.url);
  const back = from.origin === new URL(request.url).origin ? from.pathname.replace(/^\/preview(?=\/)/, '') : '/';
  return redirect(back || '/', 307);
};
