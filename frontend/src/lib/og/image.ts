// Open Graph images (1200×630 PNG), drawn at build time with satori and sharp in the preset's light colours and its
// font, Geist: the site's name, the page's kicker, its title and description, the address. The colours come from the
// preset's :root block, the font from Fontsource's static files (satori reads woff, not woff2).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import preset from '../../styles/presets/recto.css?raw';

const require = createRequire(import.meta.url);
const font = (file: string) => readFileSync(require.resolve(file));
let fonts: { heading: Buffer; body: Buffer } | undefined;
const getFonts = () =>
  (fonts ??= {
    heading: font('@fontsource/geist/files/geist-latin-600-normal.woff'),
    body: font('@fontsource/geist/files/geist-latin-400-normal.woff'),
  });

/** The preset's light colours (its first :root block). */
const root = preset.slice(preset.indexOf(':root {'), preset.indexOf('}', preset.indexOf(':root {')));
const colour = (name: string) => root.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim() ?? '#000';
const c = { background: colour('background'), foreground: colour('foreground'), muted: colour('muted-foreground'), primary: colour('primary'), kicker: colour('primary-soft-foreground'), border: colour('border') };

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: (Node | string)[] | string): Node => ({ type, props: { style, children } });

export async function ogImage({ title, description, eyebrow, siteName, host }: { title: string; description: string; eyebrow: string; siteName: string; host: string }) {
  const text = description.length > 150 ? `${description.slice(0, 147)}…` : description;
  const tree = h('div', { width: 1200, height: 630, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', background: c.background, color: c.foreground, fontFamily: 'Body' }, [
    h('div', { display: 'flex', width: 1040, alignItems: 'center', justifyContent: 'space-between' }, [
      h('div', { display: 'flex', alignItems: 'center', fontFamily: 'Heading', fontSize: 30, letterSpacing: -0.5 }, [h('div', { width: 14, height: 14, borderRadius: 7, background: c.primary, marginRight: 14 }), siteName]),
      h('div', { color: c.kicker, fontFamily: 'Heading', textTransform: 'uppercase', letterSpacing: 2, fontSize: 20 }, eyebrow),
    ]),
    h('div', { display: 'flex', flexDirection: 'column', width: 1040 }, [
      h('div', { fontFamily: 'Heading', fontSize: title.length > 60 ? 60 : 72, lineHeight: 1, letterSpacing: title.length > 60 ? -1.8 : -2.2 }, title),
      h('div', { marginTop: 28, fontSize: 30, lineHeight: 1.4, color: c.muted }, text),
    ]),
    h('div', { display: 'flex', width: 1040, borderTop: `2px solid ${c.border}`, paddingTop: 24, fontSize: 22, color: c.muted }, host),
  ]);
  const { heading, body } = getFonts();
  const svg = await satori(tree as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Heading', data: heading, weight: 600, style: 'normal' },
      { name: 'Body', data: body, weight: 400, style: 'normal' },
    ],
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
