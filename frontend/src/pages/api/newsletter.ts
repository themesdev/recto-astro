// The newsletter form posts here (its action in the Studio: /api/newsletter/). Runs in the Worker; see src/lib/forms.ts.
import type { APIRoute } from 'astro';
import { FORWARD_URL } from 'astro:env/server';
import { handleForm } from '../../lib/forms';

export const prerender = false;

export const POST: APIRoute = ({ request }) => handleForm('newsletter', request, { FORWARD_URL });

export const ALL: APIRoute = () => new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });
