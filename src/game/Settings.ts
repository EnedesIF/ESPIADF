/** Preferências de acessibilidade e desempenho (persistidas no navegador). */
export interface Settings {
  quality: 'auto' | 'alta' | 'leve';
  reduceMotion: boolean;
  textScale: 1 | 1.15 | 1.3;
  highContrast: boolean;
  captions: boolean;
  typewriter: boolean;
}

const KEY = 'missaodf:settings';
const prefersReduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const settings: Settings = {
  quality: 'auto', reduceMotion: prefersReduced, textScale: 1, highContrast: false, captions: true, typewriter: !prefersReduced
};

try { Object.assign(settings, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { /* sem storage */ }

const listeners = new Set<() => void>();
export function onSettings(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); }

export function applySettings() {
  const r = document.documentElement;
  r.style.setProperty('--text-scale', String(settings.textScale));
  r.classList.toggle('reduce-motion', settings.reduceMotion);
  r.classList.toggle('high-contrast', settings.highContrast);
}

export function updateSettings(p: Partial<Settings>) {
  Object.assign(settings, p);
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ok */ }
  applySettings();
  listeners.forEach(f => f());
}
