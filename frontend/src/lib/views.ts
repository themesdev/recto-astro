// What each kind of page needs, fetched in one place: the static pages (src/pages) and the preview (/preview/…, the
// same pages with drafts) both load through here, so a page looks the same in both. null: the page doesn't exist.
import type { NewsletterContent } from '../sections/items/sections/newsletter/types';
import type { SectionBlock } from '../components/sections';
import { getPage, getPost, getPostCount, getPosts, getSite } from './content';
import { fillLatest } from './latest';

/** Posts per index page: on page one the newest is drawn large above a row of three; later pages are rows of three
 *  (keep it 3n + 1). */
export const PAGE_SIZE = 4;

export const pageCount = (posts: number) => Math.max(1, Math.ceil(posts / PAGE_SIZE));

/** A page built in the Studio (home, about), its empty Posts sections filled with the newest posts. */
export async function loadCmsPage(slug: string, preview = false) {
  const [doc, site] = await Promise.all([getPage(slug, preview), getSite(preview)]);
  if (!doc) return null;
  return { page: { ...doc, sections: await fillLatest(doc.sections, preview) }, site };
}

/** One page of the blog index: the blog page's first section (its page header), the posts, its other sections. */
export async function loadBlogPage(page: number, preview = false) {
  const [doc, count] = await Promise.all([getPage('blog', preview), getPostCount(preview)]);
  const pages = pageCount(count);
  if (!doc || !Number.isInteger(page) || page < 1 || page > pages) return null;
  const posts = await getPosts((page - 1) * PAGE_SIZE, page * PAGE_SIZE, preview);
  const [head, ...rest] = (doc.sections ?? []) as SectionBlock[];
  const first = head && page > 1 && head._type === 'pageHeaderSection' ? { ...head, heading: `${head.heading}: page ${page}` } : head;
  return { doc, page, pages, posts, first, rest };
}

/** A post, three more posts and the blog page's newsletter section. */
export async function loadPost(slug: string, preview = false) {
  const [post, site, latest, blog] = await Promise.all([getPost(slug, preview), getSite(preview), getPosts(0, 4, preview), getPage('blog', preview)]);
  if (!post) return null;
  const more = latest.filter((p) => p.slug !== slug).slice(0, 3);
  const newsletter = blog?.sections?.find((b) => b._type === 'newsletterSection') as (NewsletterContent & { _key: string }) | undefined;
  return { post, site, more, newsletter };
}

export type CmsData = NonNullable<Awaited<ReturnType<typeof loadCmsPage>>>;
export type BlogData = NonNullable<Awaited<ReturnType<typeof loadBlogPage>>>;
export type PostData = NonNullable<Awaited<ReturnType<typeof loadPost>>>;
