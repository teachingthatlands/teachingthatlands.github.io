/**
 * file-preview.ts — the Preview button on download cards.
 *
 * The cards come from plugins/rehype-file-download.mjs, which marks previewable
 * files with data-preview. Preview opens a panel under the card: the content
 * below slides down, then the preview fades in once loaded. Nothing loads
 * until it's opened. Each panel has New tab and Expand (fullscreen).
 *
 *   office  .pptx in Microsoft's Office Online viewer. Microsoft fetches the
 *           file from the live site, so a new deck only previews once deployed.
 *   pdf     the browser's own PDF viewer. Browsers that can't show a PDF in a
 *           page (navigator.pdfViewerEnabled === false) get "Open" instead,
 *           which opens the PDF in a new tab. On touch screens (iPhone, iPad)
 *           the frame shows page 1 only, so the hint points to New tab.
 *   image   the image itself.
 */

const SITE = 'https://teachingthatlands.uk';
let count = 0;

type Kind = 'office' | 'pdf' | 'image';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function previewUrl(kind: Kind, src: string) {
  if (kind === 'office') {
    return 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(new URL(src, SITE).href);
  }
  return src;
}

function build(card: HTMLElement) {
  if (card.dataset.ready) return;
  card.dataset.ready = 'true';
  const kind = card.dataset.preview as Kind;
  const src = card.dataset.src!;
  const toggle = card.querySelector<HTMLButtonElement>('[data-file-preview-toggle]');
  if (!toggle) return;

  // Can't show a PDF in the page: offer it in a new tab instead
  if (kind === 'pdf' && (navigator as any).pdfViewerEnabled === false) {
    const open = document.createElement('a');
    open.className = 'btn btn--quiet';
    open.href = src;
    open.target = '_blank';
    open.rel = 'noopener';
    open.innerHTML = 'Open&nbsp;&#x2197;';
    toggle.replaceWith(open);
    return;
  }

  const url = previewUrl(kind, src);
  const pages = Number(card.dataset.pages) || 0;
  // iPhone and iPad show only page 1 of a PDF in a frame, and it won't scroll
  const touch = matchMedia('(pointer: coarse)').matches;
  const pdfHint = touch ? `Page 1 of ${pages} here · New tab for all` : `Scroll for all ${pages} pages`;
  const id = `file-preview-${++count}`;
  const panel = document.createElement('div');
  panel.className = 'file-preview';
  panel.id = id;
  panel.innerHTML = `
    <div class="file-preview-clip">
      <div class="file-preview-panel file-preview-panel--${kind}" data-kind="${kind}" data-src="${esc(url)}">
        <div class="file-preview-stage">
          <span class="file-preview-loading">Loading ${kind === 'office' ? 'slides' : 'preview'}&hellip;</span>
        </div>
        <div class="file-preview-bar">
          <span class="file-preview-hint" aria-live="polite">${
            kind === 'office' ? HINT_OFF : kind === 'pdf' && pages > 1 ? pdfHint : ''
          }</span>
          <span class="file-preview-actions">
            <a class="btn btn--quiet" href="${esc(url)}" target="_blank" rel="noopener noreferrer">New tab&nbsp;&#x2197;</a>
            <button type="button" class="btn btn--primary btn--sky"
                    data-file-preview-expand aria-pressed="false">&#x2922;&nbsp;Expand</button>
          </span>
        </div>
      </div>
    </div>`;
  const ratio = card.style.getPropertyValue('--preview-ratio');
  if (ratio) panel.style.setProperty('--preview-ratio', ratio);
  card.after(panel);

  toggle.setAttribute('aria-controls', id);
  toggle.hidden = false;
}

// A deck runs in a cross-site frame, so the page can't pass key presses into it.
// Arrow keys only work while the frame has focus: give it focus when it matters,
// and keep the hint (and a focus ring) honest about whether the keys will work.
const HINT_OFF = 'Click the slide to use the arrow keys';
const HINT_ON = '← → to change slides';

function focusFrame(panel: HTMLElement) {
  const iframe = panel.querySelector<HTMLIFrameElement>('iframe');
  if (!iframe) return;
  iframe.focus({ preventScroll: true });
  try { iframe.contentWindow?.focus(); } catch { /* cross-site: iframe.focus() is enough */ }
  setTimeout(updateHints, 0);
}

function updateHints() {
  const active = document.activeElement;
  document.querySelectorAll<HTMLElement>('.file-preview-panel--office').forEach(panel => {
    const focused = !!active && active === panel.querySelector('iframe');
    panel.classList.toggle('has-focus', focused);
    const hint = panel.querySelector('.file-preview-hint');
    if (hint) hint.textContent = focused ? HINT_ON : HINT_OFF;
  });
}

function load(preview: HTMLElement, panel: HTMLElement, title: string) {
  const kind = panel.dataset.kind as Kind;
  const media = kind === 'image' ? document.createElement('img') : document.createElement('iframe');
  if (media instanceof HTMLImageElement) {
    media.alt = title;
    media.src = panel.dataset.src!;
  } else {
    media.title = `${title} (preview)`;
    media.allowFullscreen = true;
    // Fit the page width in the browser's PDF viewer
    media.src = kind === 'pdf' ? `${panel.dataset.src}#view=FitH` : panel.dataset.src!;
  }
  const ready = () => {
    panel.classList.add('is-loaded');
    if (kind === 'office' && preview.classList.contains('is-open')) focusFrame(panel);
  };
  media.addEventListener('load', ready, { once: true });
  media.addEventListener('error', ready, { once: true });
  panel.querySelector('.file-preview-stage')!.appendChild(media);
}

function setOpen(card: HTMLElement, toggle: HTMLElement, open: boolean) {
  const preview = document.getElementById(toggle.getAttribute('aria-controls')!);
  const panel = preview?.querySelector<HTMLElement>('.file-preview-panel');
  if (!preview || !panel) return;
  preview.classList.toggle('is-open', open);
  // Load once the panel has slid open: Chrome's PDF viewer can stay blank if it
  // starts up while its frame is still clipped to nothing.
  if (open && !panel.dataset.loading) {
    panel.dataset.loading = 'true';
    const go = () => { if (!panel.querySelector('iframe, img')) load(preview, panel, card.dataset.title || 'File'); };
    // The slide-open takes 0.45s (shared.css); no animation with reduced motion
    setTimeout(go, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 480);
  }
  if (open && panel.dataset.kind === 'office' && panel.classList.contains('is-loaded')) focusFrame(panel);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.file-preview-toggle-label')!.textContent = open ? 'Hide' : 'Preview';
}

function setExpanded(panel: HTMLElement, on: boolean) {
  panel.classList.toggle('is-expanded', on);
  if (on && panel.dataset.kind === 'office') focusFrame(panel);
  document.documentElement.classList.toggle('file-preview-fullscreen', on);
  const btn = panel.querySelector<HTMLButtonElement>('[data-file-preview-expand]');
  if (btn) {
    btn.setAttribute('aria-pressed', String(on));
    btn.innerHTML = on ? '&#x2715;&nbsp;Close' : '&#x2922;&nbsp;Expand';
  }
}

function toggleExpanded(panel: HTMLElement) {
  if (panel.classList.contains('is-expanded')) {
    if (document.fullscreenElement) document.exitFullscreen();
    else setExpanded(panel, false);
    return;
  }
  // Real fullscreen where supported; otherwise (e.g. iPhone) fill the window.
  if (panel.requestFullscreen) {
    panel.requestFullscreen().then(() => setExpanded(panel, true), () => setExpanded(panel, true));
  } else {
    setExpanded(panel, true);
  }
}

export function initFilePreviews() {
  document.querySelectorAll<HTMLElement>('.file-download[data-preview]').forEach(build);
}

// Delegated, so it survives pages that clone their content into cards.
document.addEventListener('click', e => {
  const target = e.target as Element;
  const toggle = target.closest?.<HTMLElement>('[data-file-preview-toggle]');
  if (toggle) {
    const card = toggle.closest<HTMLElement>('.file-download')!;
    setOpen(card, toggle, toggle.getAttribute('aria-expanded') !== 'true');
    return;
  }
  const panel = target.closest?.('[data-file-preview-expand]')?.closest<HTMLElement>('.file-preview-panel');
  if (panel) { toggleExpanded(panel); return; }
  const bar = target.closest?.('.file-preview-panel--office .file-preview-bar');
  if (bar && !target.closest('a, button')) focusFrame(bar.closest<HTMLElement>('.file-preview-panel')!);
});

document.addEventListener('fullscreenchange', () => {
  document.querySelectorAll<HTMLElement>('.file-preview-panel.is-expanded').forEach(panel => {
    if (document.fullscreenElement !== panel) setExpanded(panel, false);
  });
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || document.fullscreenElement) return;
  document.querySelectorAll<HTMLElement>('.file-preview-panel.is-expanded').forEach(p => setExpanded(p, false));
});

// Focus moving into the frame blurs the page window; moving back fires focusin.
window.addEventListener('blur', () => setTimeout(updateHints, 0));
window.addEventListener('focus', updateHints);
document.addEventListener('focusin', updateHints);
document.addEventListener('focusout', () => setTimeout(updateHints, 0));
// Clicking plain page text moves focus to <body> without a focusin, so re-check after any click.
document.addEventListener('pointerdown', () => setTimeout(updateHints, 0));
