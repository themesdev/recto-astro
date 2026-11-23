// The address the site lives at, and the structured data of its pages. The head tags themselves come from the kit's
// <Seo> (src/kit/components/Seo.astro), in src/components/SiteLayout.astro.

/** The address the site lives at (canonical links, sitemap, feed, Open Graph images): `site` in astro.config.mjs,
 *  from SITE_URL. */
export const siteUrl = (import.meta.env.SITE as string | undefined)?.replace(/\/+$/, '') || 'https://lowseason.example';

export const absolute = (path: string) => new URL(path, `${siteUrl}/`).href;

/** The Open Graph image of a page: /og/<key>.png (src/pages/og/[...key].png.ts). */
export const ogKey = (path: string) => path.replace(/^\/|\/$/g, '') || 'home';

/** schema.org Organization and WebSite, for the home page. */
export function siteJsonLd(site: { name: string; tagline: string; organisation?: { legalName?: string | null; email?: string | null } | null }) {
  const origin = absolute('/');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${origin}#organisation`, name: site.name, legalName: site.organisation?.legalName ?? undefined, url: origin, logo: absolute('/favicon.svg'), email: site.organisation?.email ?? undefined },
      { '@type': 'WebSite', '@id': `${origin}#website`, url: origin, name: site.name, description: site.tagline, publisher: { '@id': `${origin}#organisation` } },
    ],
  };
}

/** The trail of a nested page: Home, its section, the page (folders under a section, like page/, are not pages). */
export function breadcrumbTrail(path: string, title: string) {
  const NAMES: Record<string, string> = { blog: 'Essays' };
  const seg = path.split('/').filter(Boolean);
  if (seg.length < 2) return null;
  return [
    { name: 'Home', href: '/' },
    { name: NAMES[seg[0]] ?? seg[0].replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()), href: `/${seg[0]}/` },
    { name: title, href: path },
  ];
}
