// Where each document shows on the site, for the Presentation tool: which page to open beside a document, and which
// document belongs to an address. The Astro edition is static, so drafts are shown under /preview/ (pages rendered on
// request with drafts): every address here starts with it.
import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation';

/** Where the site shows drafts (frontend/src/pages/preview/). */
export const PREVIEW = '/preview';

/** A page document's slug → its address in the preview (home is /preview/). */
const pagePath = (slug?: string) => (!slug || slug === 'home' ? `${PREVIEW}/` : `${PREVIEW}/${slug}/`);

export const locations: PresentationPluginOptions['resolve'] extends infer R ? (R extends { locations?: infer L } ? L : never) : never = {
  page: defineLocations({
    select: { title: 'title', slug: 'slug.current' },
    resolve: (doc) => ({ locations: [{ title: doc?.title ?? 'Page', href: pagePath(doc?.slug) }] }),
  }),
  post: defineLocations({
    select: { title: 'title', slug: 'slug.current' },
    resolve: (doc) => ({ locations: [{ title: doc?.title ?? 'Post', href: `${PREVIEW}/blog/${doc?.slug}/` }, { title: 'Blog', href: `${PREVIEW}/blog/` }] }),
  }),
  siteSettings: defineLocations({ message: 'The Site document is on every page', tone: 'positive', locations: [{ title: 'Home', href: `${PREVIEW}/` }] }),
};

export const mainDocuments = defineDocuments([
  { route: `${PREVIEW}/`, filter: `_type == "page" && slug.current == "home"` },
  { route: `${PREVIEW}/blog/:slug/`, filter: `_type == "post" && slug.current == $slug` },
  { route: `${PREVIEW}/blog/`, filter: `_type == "page" && slug.current == "blog"` },
  { route: `${PREVIEW}/:slug/`, filter: `_type == "page" && slug.current == $slug` },
]);
