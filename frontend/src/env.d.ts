/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  /** Your Sanity project (sanity.io/manage). Empty: the site shows the demo content from seed/. */
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
}

/** The Content-Security-Policy (astro.config.mjs), for the Worker's answers. */
declare const __CSP__: string;
