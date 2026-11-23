// Every post as Markdown at its own address plus .md (/blog/<slug>.md), for answer engines.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getPost, getPostSlugs } from '../../lib/content';
import { toMarkdown } from '../../lib/markdown';
import { absolute } from '../../lib/seo';

export const getStaticPaths = (async () => (await getPostSlugs()).map(({ slug }) => ({ params: { slug } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug!;
  const post = await getPost(slug);
  if (!post) return new Response('Not found', { status: 404 });
  const head = `# ${post.title}\n\n${post.excerpt ? `> ${post.excerpt}\n\n` : ''}${post.author?.name ? `${post.author.name}, ` : ''}${post.date.slice(0, 10)} · ${absolute(`/blog/${slug}/`)}\n\n`;
  return new Response(`${head}${toMarkdown(post.body)}\n`, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
};
