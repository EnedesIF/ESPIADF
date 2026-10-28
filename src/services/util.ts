export const uid = (p = '') => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export async function sha256(text: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // ambientes sem crypto.subtle (http não seguro): hash simples — apenas para modo local
    let h = 0; for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return 'x' + (h >>> 0).toString(16);
  }
}

export const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9. ]/g, ' ').trim();

export function slug(s: string) {
  return normalize(s).replace(/\s+/g, '').slice(0, 10).toUpperCase() || 'EQUIPE';
}

export function makeLogin(teamName: string) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = ''; for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return `${slug(teamName)}-${c}`;
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function fmtClock(min: number) {
  const m = Math.floor(min) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
export function parseClock(s: string) {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
