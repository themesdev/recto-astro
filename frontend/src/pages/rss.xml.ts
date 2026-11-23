// The blog's RSS feed at /rss.xml (the kit's feed endpoint, with @astrojs/rss), from the posts in Sanity.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getFeed, getSite } from '../lib/content';

export async function GET(context: APIContext) {
  const [site, posts] = await Promise.all([getSite(), getFeed()]);
  return rss({
    title: `${site.name} blog`,
    description: site.tagline,
    site: context.site!,
    customData: '<language>en</language>',
    items: posts.map((p) => ({ title: p.title, description: p.excerpt ?? '', pubDate: new Date(p.date), link: `/blog/${p.slug}/`, categories: p.tags ?? [] })),
  });
}
