// /robots.txt (the kit's endpoint): everything but the API and the preview, and where the sitemap is
// (@astrojs/sitemap writes sitemap-index.xml).
import type { APIContext } from 'astro';

const disallow = ['/api/', '/preview/'];

export function GET(context: APIContext) {
  const lines = ['User-agent: *', 'Allow: /', ...disallow.map((p) => `Disallow: ${p}`), '', `Sitemap: ${new URL('/sitemap-index.xml', context.site).href}`, ''];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
