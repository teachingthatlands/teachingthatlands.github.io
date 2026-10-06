/**
 * rehype-file-download.mjs — turns a plain link in Markdown into a download card.
 *
 * Write this in any Markdown page:
 *   <a class="file-download" href="/slides/ttl-day1-death-by-powerpoint.pptx">Download the Day 1 deck</a>
 *
 * At build time it becomes the card: an icon for the file type, the label,
 * "filename · type · size" (and pages, for a PDF), and a Download button.
 * Types that can be previewed also get a Preview button, which the script in
 * src/scripts/file-preview.ts wires up; add data-preview="false" to the link
 * to leave it off. A link to a file that isn't in /public fails the build, so
 * a broken download never goes live. Without this plugin it is still a link.
 *
 * New file type? Add a line to FILE_TYPES (and an icon to /public/images).
 */

import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));

// preview: how file-preview.ts shows it ('office' = Microsoft's viewer,
// 'pdf' = the browser's own PDF viewer, 'image' = the image itself)
export const FILE_TYPES = {
  pptx: { name: 'PowerPoint', icon: '/images/powerpoint_icon.svg', preview: 'office' },
  pdf:  { name: 'PDF',        icon: '/images/pdf_icon.svg',        preview: 'pdf' },
  png:  { preview: 'image' },
  jpg:  { preview: 'image' },
  jpeg: { preview: 'image' },
  gif:  { preview: 'image' },
  webp: { preview: 'image' },
};
const FALLBACK_ICON = '/images/file_icon.svg';

// Astro hands rehype plugins raw HTML as text, so match the link in that form:
// either one raw node (<a …>label</a>) or an opening tag, text, closing tag.
const WHOLE = /^\s*<a\s([^>]*\bclass="file-download"[^>]*)>([\s\S]*?)<\/a>\s*$/;
const OPEN  = /^\s*<a\s([^>]*\bclass="file-download"[^>]*)>\s*$/;
const CLOSE = /^\s*<\/a>\s*$/;

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·' };
function decode(s) {
  return s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1))
                 : ENTITIES[e] ?? m);
}
const textOf = node => node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join('');

// Decimal units, as macOS Finder shows them
function formatSize(bytes) {
  if (bytes < 1e6) return `${Math.max(1, Math.round(bytes / 1e3))} KB`;
  return `${(bytes / 1e6).toFixed(1)} MB`;
}

// Page count and first-page shape, so the card can say "8 pages" and the
// preview opens at the right proportions. Reads the PDF's page tree as text,
// which works for the uncompressed files macOS and most tools write; if it
// can't tell, the card leaves the pages out and the preview assumes A4 portrait.
function pdfInfo(path) {
  const pdf = readFileSync(path, 'latin1');
  let pages = 0;
  for (const m of pdf.matchAll(/\/Type\s*\/Pages\b/g)) {
    const near = pdf.slice(Math.max(0, m.index - 300), m.index + 300).match(/\/Count\s+(\d+)/);
    if (near) pages = Math.max(pages, +near[1]);
  }
  const box = pdf.match(/\/MediaBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/);
  let ratio = box ? `${Math.round(box[3] - box[1])} / ${Math.round(box[4] - box[2])}` : '595 / 842';
  if (/\/Rotate\s+(90|270)\b/.test(pdf)) ratio = ratio.split(' / ').reverse().join(' / ');
  return { pages, ratio };
}

const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });

function card(attrs, label, file) {
  const href = decode(attrs.match(/\bhref="([^"]*)"/)?.[1] ?? '');
  if (!href) throw new Error(`file-download: link "${label}" has no href`);
  label = label.trim();
  const name = decodeURIComponent(href.split(/[?#]/)[0].split('/').pop());
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  const type = FILE_TYPES[ext];
  const preview = /\bdata-preview="false"/.test(attrs) ? undefined : type?.preview;

  const meta = [name, type?.name ?? ext.toUpperCase()];
  const props = {};
  if (href.startsWith('/')) {
    const path = PUBLIC + decodeURIComponent(href.slice(1).split(/[?#]/)[0]);
    let size;
    try { size = statSync(path).size; }
    catch { throw new Error(`file-download: ${href} (in ${file ?? 'a Markdown page'}) is not in site/public`); }
    meta.push(formatSize(size));
    if (ext === 'pdf') {
      const { pages, ratio } = pdfInfo(path);
      if (pages) meta.push(pages === 1 ? '1 page' : `${pages} pages`);
      props.dataPages = pages || undefined;
      props.style = `--preview-ratio: ${ratio}`;
    }
  }
  if (preview) Object.assign(props, { dataPreview: preview, dataSrc: href, dataTitle: label });

  const buttons = [];
  if (preview) {
    // Hidden until the script is running: without it, Preview couldn't work
    buttons.push(el('button', { type: 'button', className: ['btn', 'btn--quiet', 'file-preview-toggle'],
      dataFilePreviewToggle: '', ariaExpanded: 'false', hidden: true }, [
      el('span', { className: ['file-preview-chevron'], ariaHidden: 'true' }, [{ type: 'text', value: '▸' }]),
      el('span', { className: ['file-preview-toggle-label'] }, [{ type: 'text', value: 'Preview' }]),
    ]));
  }
  buttons.push(el('a', { className: ['btn', 'btn--primary', 'btn--sky'], href, download: name,
    ariaLabel: `Download ${label}` }, [{ type: 'text', value: '↓ Download' }]));

  return el('div', { className: ['file-download', ext && `file-download--${ext}`].filter(Boolean), ...props }, [
    el('img', { src: type?.icon ?? FALLBACK_ICON, alt: '', ariaHidden: 'true', className: ['file-download-icon'] }),
    el('span', { className: ['file-download-text'] }, [
      el('span', { className: ['file-download-label'] }, [{ type: 'text', value: label }]),
      el('span', { className: ['file-download-meta'] }, [{ type: 'text', value: meta.filter(Boolean).join(' · ') }]),
    ]),
    el('span', { className: ['file-download-buttons'] }, buttons),
  ]);
}

function transform(parent, file) {
  const kids = parent.children;
  if (!kids) return;
  for (let i = 0; i < kids.length; i++) {
    const node = kids[i];
    if (node.type !== 'raw') { transform(node, file); continue; }
    let m = node.value.match(WHOLE);
    if (m) {
      kids[i] = card(m[1], decode(m[2].replace(/<[^>]*>/g, '')), file);
      continue;
    }
    m = node.value.match(OPEN);
    if (!m) continue;
    const end = kids.findIndex((k, j) => j > i && k.type === 'raw' && CLOSE.test(k.value));
    if (end === -1) continue;
    const label = kids.slice(i + 1, end).map(textOf).join('');
    kids.splice(i, end - i + 1, card(m[1], label, file));
  }
}

// A card alone on its line arrives wrapped in <p>: unwrap it, so it sits in
// the flow like a block, with its preview panel inserted straight after it.
function unwrap(parent) {
  (parent.children ?? []).forEach((node, i) => {
    if (node.tagName === 'p') {
      const real = node.children.filter(k => !(k.type === 'text' && !k.value.trim()));
      if (real.length === 1 && real[0].properties?.className?.includes('file-download')) {
        parent.children[i] = real[0];
        return;
      }
    }
    unwrap(node);
  });
}

export default function rehypeFileDownload() {
  return (tree, vfile) => {
    transform(tree, vfile?.path);
    unwrap(tree);
  };
}
