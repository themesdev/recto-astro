// Runs for the Worker's answers only (the preview, the draft-mode switch, the newsletter endpoint); the static pages get
// the same headers from dist/client/_headers (astro.config.mjs).
//   - Security headers, the same as the static pages'.
//   - In the preview (/preview/…), links to the site's pages point into the preview, so clicking around in the Studio's
//     Presentation tool keeps showing drafts. Files, the feed, the API and links elsewhere are left as they are.
import { defineMiddleware } from 'astro:middleware';

const PAGE_LINK = /(\shref=")\/(?!preview\/|api\/|_astro\/|images\/|og\/|favicon|rss\.xml|llms\.txt|sitemap|\/)/g;

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (context.isPrerendered) return response;
  const headers = new Headers(response.headers);
  headers.set('Content-Security-Policy', __CSP__);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (context.url.pathname.startsWith('/api/')) headers.set('X-Robots-Tag', 'noindex');
  const html = headers.get('content-type')?.includes('text/html');
  if (!context.url.pathname.startsWith('/preview/') || !html) return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  const body = (await response.text()).replace(PAGE_LINK, '$1/preview/');
  headers.delete('content-length');
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
});
