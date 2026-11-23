// /llms.txt (llmstxt.org): the journal in a line, its pages, and every post as a Markdown link, for answer engines.
// The kit's endpoint, reading Sanity instead of a content collection.
import type { APIContext } from 'astro';
import { getFeed, getPage, getSite } from '../lib/content';

const PAGES: [slug: string, path: string][] = [['home', '/'], ['blog', '/blog/'], ['about', '/about/']];

export async function GET(context: APIContext) {
  const url = (path: string) => new URL(path, context.site).href;
  const [site, posts, ...pages] = await Promise.all([getSite(), getFeed(), ...PAGES.map(([slug]) => getPage(slug))]);
  const lines = [`# ${site.name}`, '', `> ${site.tagline}`, '', '## Pages', ''];
  PAGES.forEach(([, path], i) => {
    const p = pages[i];
    if (p) lines.push(`- [${p.title}](${url(path)})${p.description ? `: ${p.description}` : ''}`);
  });
  lines.push('', '## Essays', '', ...posts.map((p) => `- [${p.title}](${url(`/blog/${p.slug}.md`)})${p.excerpt ? `: ${p.excerpt}` : ''}`), '');
  lines.push('## Optional', '', `- [Privacy](${url('/privacy/')})`, `- [RSS feed](${url('/rss.xml')})`, '');
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
