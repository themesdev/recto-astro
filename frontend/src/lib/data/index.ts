// The one way pages read content: query(groq, params, { preview }).
//   - Published content, at build time: straight from the Content Lake (no CDN), with the read token when there is one
//     (so a private dataset works too). Every page is then a static file until the next build.
//   - The preview (the Studio's Presentation tool, /preview/…), at request time in the Worker: drafts, with the read
//     token, and stega: each text carries an invisible pointer to its field, so a click in the preview opens that field.
//   - No Sanity project: the demo content in seed/ (./fixture.ts).
import { sanityClient } from 'sanity:client';
import { SANITY_API_READ_TOKEN } from 'astro:env/server';
import { projectId } from '../sanity';

export const usingFixture = !projectId;

/** The fields whose text gets stega in the preview: what a reader sees as words. Everything else (variants, tones,
 *  links, slugs, dates, ids, alt text) stays plain, so the page renders exactly as it does when published. */
const STEGA_FIELDS = new Set(['heading', 'lead', 'eyebrow', 'title', 'excerpt', 'text', 'name', 'role', 'bio', 'caption', 'label', 'tagline', 'description', 'note', 'quote', 'legal', 'buttonLabel', 'emailLabel', 'privacy']);

export async function query<T>(groq: string, params: Record<string, unknown> = {}, { preview = false }: { preview?: boolean } = {}): Promise<T> {
  if (usingFixture) return (await import('./fixture')).fixtureQuery<T>(groq, params);
  const token = SANITY_API_READ_TOKEN || undefined;
  if (!preview) return sanityClient.fetch<T>(groq, params, { perspective: 'published', useCdn: false, token });
  if (!token) throw new Error('The preview needs SANITY_API_READ_TOKEN (a Viewer token): README › Visual editing.');
  return sanityClient.fetch<T>(groq, params, {
    perspective: 'drafts',
    useCdn: false,
    token,
    resultSourceMap: 'withKeyArraySelector',
    stega: { enabled: true, filter: (p) => STEGA_FIELDS.has(String(p.sourcePath.at(-1))) && p.filterDefault(p) },
  });
}
