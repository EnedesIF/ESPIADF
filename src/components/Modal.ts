import { h } from '@/ui/dom';

/** Modal acessível (Esc fecha, foco no primeiro campo). */
export function modal(content: HTMLElement, onClose?: () => void) {
  const back = h('div', { class: 'modal-back', role: 'dialog', 'aria-modal': 'true' });
  const box = h('div', { class: 'panel modal' }, content);
  back.append(box);
  const close = () => { back.remove(); window.removeEventListener('keydown', key); onClose?.(); };
  const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  back.addEventListener('pointerdown', e => { if (e.target === back) close(); });
  window.addEventListener('keydown', key);
  document.getElementById('ui')!.append(back);
  setTimeout(() => (box.querySelector('input,button,select,textarea') as HTMLElement | null)?.focus(), 30);
  return { close, el: back };
}
