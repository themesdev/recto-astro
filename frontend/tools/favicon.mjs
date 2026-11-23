// The favicon (public/favicon.svg): a page on a rounded square, in the preset's accent (src/styles/presets/recto.css,
// its first :root block). Run again after changing the accent: pnpm favicon. The photos are not drawn here: they are
// generated (README › Customising the look).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/styles/presets/recto.css'), 'utf8');
const block = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
const token = (name) => block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
const [bg, fg] = [token('primary'), token('primary-foreground')];
if (!bg || !fg) throw new Error('favicon: no --primary or --primary-foreground in the preset');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="${bg}"/><path d="M20 14h18l8 8v28H20z" fill="${fg}"/><path d="M38 14v8h8" fill="none" stroke="${bg}" stroke-width="3"/><path d="M26 32h14M26 39h14M26 46h9" stroke="${bg}" stroke-width="3"/></svg>\n`;
writeFileSync(join(root, 'public/favicon.svg'), svg);
console.log(`favicon: ${bg} on ${fg}`);
