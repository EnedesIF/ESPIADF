/** Utilitários mínimos de DOM (sem framework — leve para notebook escolar). */
type Child = Node | string | number | null | undefined | false | Child[];
type Attrs = Record<string, any>;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') { for(const [key,value] of Object.entries(v)){if(key.startsWith('--'))el.style.setProperty(key,String(value));else (el.style as any)[key]=value;} }
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  append(el, children);
  return el;
}

function append(el: Element, children: Child[]) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.append(c instanceof Node ? c : String(c));
  }
}

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T | null;
export const clear = (el: Element) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };

export function svgIcon(name: string, size = 22) {
  const span = document.createElement('span');
  span.className = 'ico';
  span.innerHTML = ICONS[name] ? `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${ICONS[name]}</svg>` : '';
  return span;
}

const S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
export const ICONS: Record<string, string> = {
  bus: `<g ${S}><rect x="5" y="3" width="14" height="15" rx="2"/><path d="M5 11h14M8 18v2M16 18v2"/><circle cx="8.5" cy="14.5" r=".8"/><circle cx="15.5" cy="14.5" r=".8"/></g>`,
  megaphone: `<g ${S}><path d="M3 10v4h3l7 4V6L6 10z"/><path d="M17 9a4 4 0 0 1 0 6M6 14l1.5 5h2.5l-1-4.5"/></g>`,
  coin: `<g ${S}><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></g>`,
  grid: `<g ${S}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></g>`,
  building: `<g ${S}><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M9 11h.01M15 11h.01"/></g>`,
  pulse: `<g ${S}><path d="M3 12h4l2-5 4 10 2-5h6"/></g>`,
  drop: `<g ${S}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></g>`,
  leaf: `<g ${S}><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 13 11"/></g>`,
  map: `<g ${S}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></g>`,
  folder: `<g ${S}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M8 13h8"/></g>`,
  target: `<g ${S}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/></g>`,
  team: `<g ${S}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14.5 14.2c3 .2 5.5 2.5 5.5 5.8"/></g>`,
  chat: `<g ${S}><path d="M4 5h16v11H9l-5 4z"/></g>`,
  camera: `<g ${S}><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></g>`,
  back: `<g ${S}><path d="M15 5 8 12l7 7"/></g>`,
  close: `<g ${S}><path d="M6 6l12 12M18 6 6 18"/></g>`,
  phone: `<g ${S}><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></g>`,
  search: `<g ${S}><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/></g>`,
  external: `<g ${S}><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></g>`,
  lab: `<g ${S}><path d="M9 3h6M10 3v6L4 19a1.5 1.5 0 0 0 1.3 2h13.4A1.5 1.5 0 0 0 20 19l-6-10V3"/><path d="M7 15h10"/></g>`,
  settings: `<g ${S}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></g>`,
  link: `<g ${S}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></g>`,
  clock: `<g ${S}><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></g>`,
  check: `<g ${S}><path d="m5 12 4.5 4.5L19 7"/></g>`,
  star: `<g ${S}><path d="M12 3v18M3 12h18"/></g>`,
  play: `<g ${S}><path d="M7 4v16l13-8z"/></g>`,
  pin: `<g ${S}><path d="M12 21s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></g>`
};
