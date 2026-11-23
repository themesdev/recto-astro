// Which Sanity project and dataset the site reads. Only these two are public (PUBLIC_): they are not secret. The read
// token is a server secret (astro:env/server › SANITY_API_READ_TOKEN): it never reaches a browser.
export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || '';
export const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
/** The Content Lake API version this theme's queries are written for (a date; change it only on purpose). */
export const apiVersion = '2026-10-01';
