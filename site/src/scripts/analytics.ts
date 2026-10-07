/**
 * analytics.ts — GoatCounter click events (the page-view script is in Base.astro).
 *
 * Counts clicks on links to other sites (e.g. papers) and downloads of files
 * we host (slides, handouts). Records only the destination, never the person.
 * Does nothing if GoatCounter hasn't loaded (blocked, offline, local dev).
 */

declare global {
  interface Window {
    goatcounter?: { count?: (vars: { path: string; title?: string; event?: boolean }) => void };
  }
}

const FILE = /\.(pptx|pdf|docx|xlsx|zip)$/i;

function eventFor(a: HTMLAnchorElement): { path: string; title: string } | null {
  let url: URL;
  try { url = new URL(a.href, location.href); } catch { return null; }
  if (!/^https?:$/.test(url.protocol)) return null;
  if (url.origin === location.origin) {
    return FILE.test(url.pathname) ? { path: `download:${url.pathname}`, title: 'Download' } : null;
  }
  return { path: `outbound:${url.hostname}${url.pathname}`, title: 'Outbound link' };
}

export function initClickTracking() {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a) return;
    const ev = eventFor(a);
    if (ev) window.goatcounter?.count?.({ ...ev, event: true });
  });
  // Middle-click opens in a new tab without firing 'click'.
  document.addEventListener('auxclick', (e) => {
    if ((e as MouseEvent).button !== 1) return;
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    const ev = a && eventFor(a);
    if (ev) window.goatcounter?.count?.({ ...ev, event: true });
  });
}
