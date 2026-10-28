import { h } from '@/ui/dom';
import { settings, updateSettings } from '@/game/Settings';
import { modal } from './Modal';

/** Acessibilidade e desempenho. */
export function openSettings() {
  const row = (label: string, ctl: HTMLElement) => h('div', { class: 'opt' }, h('span', {}, label), ctl);
  const toggle = (k: 'reduceMotion' | 'highContrast' | 'typewriter') => {
    const b = h('button', { class: 'chip' + (settings[k] ? ' on' : ''), 'aria-pressed': String(settings[k]) }, settings[k] ? 'LIGADO' : 'DESLIGADO');
    b.onclick = () => { updateSettings({ [k]: !settings[k] } as any); b.className = 'chip' + (settings[k] ? ' on' : ''); b.textContent = settings[k] ? 'LIGADO' : 'DESLIGADO'; b.setAttribute('aria-pressed', String(settings[k])); };
    return b;
  };
  const choice = <T extends string | number>(k: 'quality' | 'textScale', opts: [T, string][]) => {
    const wrap = h('div', { class: 'row' });
    const render = () => {
      wrap.replaceChildren(...opts.map(([v, l]) => {
        const b = h('button', { class: 'chip' + ((settings as any)[k] === v ? ' on' : '') }, l);
        b.onclick = () => { updateSettings({ [k]: v } as any); render(); };
        return b;
      }));
    };
    render(); return wrap;
  };
  modal(h('div', { class: 'settings' },
    h('div', { class: 'eyebrow' }, 'CONFIGURAÇÕES'),
    h('h2', {}, 'Acessibilidade e desempenho'),
    row('Tamanho do texto', choice('textScale', [[1, 'A'], [1.15, 'A+'], [1.3, 'A++']])),
    row('Reduzir movimento', toggle('reduceMotion')),
    row('Alto contraste', toggle('highContrast')),
    row('Texto dos diálogos digitando', toggle('typewriter')),
    row('Qualidade gráfica', choice('quality', [['auto', 'Auto'], ['alta', 'Alta'], ['leve', 'Leve']])),
    h('p', { class: 'muted', style: { fontSize: '.8rem', marginTop: '12px' } },
      'Qualidade "Leve" desliga sombras e reduz a resolução — indicada para notebooks escolares. Algumas mudanças valem ao reabrir o jogo.'),
    h('p', { class: 'muted', style: { fontSize: '.8rem' } },
      'Controles: WASD/setas andam · Shift corre · arraste gira a câmera · roda do mouse aproxima · clique/toque no chão para andar · E interage · C celular · J dossiê · M mapa · Esc fecha.')
  ));
}
