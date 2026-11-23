// @ts-check
// Recto, the Astro edition. The public site is static: every page is built ahead of time from Sanity (or, before you
// connect a project, from the demo content in seed/). Only the preview (/preview/…), the draft-mode switch and the
// newsletter endpoint run on demand, in a Cloudflare Worker. README › Deploy.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { defineConfig, envField, fontProviders, sessionDrivers } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';

// .env.local, then .env: the shell wins over both, .env.local over .env (a file never overwrites a value already set).
for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
const env = process.env;
const projectId = env.PUBLIC_SANITY_PROJECT_ID || '';
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
/** The address the site lives at: canonical links, the sitemap, the feed and Open Graph images. */
const site = (env.SITE_URL || 'https://lowseason.example').replace(/\/+$/, '');
/** Your Studio: the only site allowed to show this one in a frame (the Presentation tool). */
const studio = (() => {
  try {
    return new URL(env.SANITY_STUDIO_URL || 'http://localhost:3333').origin;
  } catch {
    throw new Error(`SANITY_STUDIO_URL is not an address: ${env.SANITY_STUDIO_URL}`);
  }
})();

// Without a Sanity project the site shows the demo content (seed/). A production build refuses that unless you ask for
// it, so a site never goes live with the demo journal by accident.
if (!projectId && process.argv.includes('build') && env.SANITY_FIXTURE !== '1')
  throw new Error('No Sanity project: set PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET (README › Set up Sanity). To build the demo content from seed/ instead, set SANITY_FIXTURE=1.');

// Content-Security-Policy for the static pages (dist/client/_headers) and the Worker's answers (src/middleware.ts).
// Scripts and styles from this site (Astro inlines small scripts and styles, hence 'unsafe-inline'), images from here
// and Sanity's CDN, framing only by your Studio, forms only to this site. Posting a form to a service elsewhere? Add
// its origin to form-action.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "font-src 'self'",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `frame-ancestors 'self' ${studio}`,
].join('; ');

/** Writes _headers next to the static files: Workers static assets apply it to every page it serves. */
const headersFile = () => ({
  name: 'recto-headers',
  hooks: {
    /** @param {{ dir: URL }} options */
    'astro:build:done': ({ dir }) => {
      const file = new URL('_headers', dir);
      const lines = ['/*', `  Content-Security-Policy: ${csp}`, '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin', '  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()', ''];
      // The Cloudflare adapter adds the long cache for /_astro/* to the same file: keep what is there.
      writeFileSync(file, [...lines, existsSync(file) ? readFileSync(file, 'utf8') : ''].join('\n'));
    },
  },
});

export default defineConfig({
  site,
  output: 'static',
  // Addresses end in a slash (/about/), as every link in the content does.
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  server: { port: 4321 },
  adapter: cloudflare({
    // Pages are built in Node (Open Graph images use sharp); the Worker only runs the on-demand routes.
    prerenderEnvironment: 'node',
    // No image transforms: the images are Sanity's (its CDN resizes them) or the demo photos in public/ (WebP, sized for their slots).
    imageService: 'passthrough',
  }),
  // Astro sessions are not used: an in-memory driver, so the adapter does not create a KV namespace for them.
  session: { driver: sessionDrivers.lruCache({ max: 1 }) },
  env: {
    schema: {
      // Read in the Worker at request time (wrangler secret put …), and during the build for published content.
      SANITY_API_READ_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      FORWARD_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    sanity({
      projectId: projectId || 'unset',
      dataset,
      apiVersion: '2026-10-01',
      // The build reads published content straight from the API; the preview reads drafts with the token.
      useCdn: false,
      stega: { studioUrl: studio },
    }),
    sitemap({ filter: (page) => !/\/(thanks|404|preview)\//.test(page) }),
    headersFile(),
  ],
  // Geist and Geist Mono (SIL Open Font License 1.1, from Fontsource), self-hosted: Astro serves the files, preloads the
  // text face and draws a fallback sized to match, so nothing shifts while it loads. Each fills the variable the
  // preset's font stacks start with (src/styles/presets/recto.css). Headings and text share Geist: sans everywhere.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-preset-sans',
      fallbacks: ['Arial', 'sans-serif'],
      options: { variants: [{ src: ['@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'], weight: '100 900', style: 'normal' }] },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Mono',
      cssVariable: '--font-preset-mono',
      fallbacks: ['Menlo', 'monospace'],
      options: { variants: [{ src: ['@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'], weight: '100 900', style: 'normal' }] },
    },
  ],
  // The policy for the Worker's answers too (src/middleware.ts reads it as __CSP__).
  vite: { plugins: [tailwindcss()], define: { __CSP__: JSON.stringify(csp) } },
});
