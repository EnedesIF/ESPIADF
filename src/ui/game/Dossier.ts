import type { GameUI } from './GameUI';
import { h, clear } from '../dom';
import { KIND_LABEL, KIND_MARK } from '@/systems/EvidenceSystem';
import { modal } from '@/components/Modal';

const STATUS: Record<string, string> = { candidata: 'CANDIDATA', ativa: 'ATIVA', em_revisao: 'EM REVISÃO', descartada: 'DESCARTADA', sustentada: 'SUSTENTADA' };

/** Painel investigativo: evidências, hipóteses e conexões visuais. */
export class Dossier {
  private el = h('div', { class: 'dossier', role: 'dialog', 'aria-label': 'Dossiê de investigação' });
  private linking: { evidenceId: string; relation: 'apoia' | 'contradiz' } | null = null;
  private isOpen = false;

  constructor(private ui: GameUI) {}
  get g() { return this.ui.g; }

  open() {
    const g = this.g;
    if (g.overlay !== 'none' && g.overlay !== 'dossier') { if (g.overlay === 'phone') this.ui.phone.close(); else return; }
    this.isOpen = true; g.open('dossier'); g.ctx.log('dossier_open');
    this.ui.root.append(this.el);
    this.render();
  }
  close() {
    this.isOpen = false; this.linking = null; this.el.remove();
    if (this.g.overlay === 'dossier') this.g.closeOverlay();
  }

  private render() {
    const g = this.g, s = g.ctx.session;
    clear(this.el);
    const evs = g.ev.list();
    const kinds = new Map<string, number>(); evs.forEach(e => kinds.set(e.def.kind, (kinds.get(e.def.kind) ?? 0) + 1));

    // cabeçalho
    this.el.append(h('header', {},
      h('div', {}, h('div', { class: 'eyebrow' }, 'DOSSIÊ DE INVESTIGAÇÃO'), h('h2', {}, `${evs.length} evidências · ${g.dossier.hypotheses.length} hipóteses`)),
      h('div', { class: 'row', style: { fontSize: '.76rem' } }, [...kinds].map(([k, n]) => h('span', { class: 'chip' }, `${KIND_MARK[k as keyof typeof KIND_MARK]} ${KIND_LABEL[k as keyof typeof KIND_LABEL]} · ${n}`))),
      h('span', { class: 'spacer' }),
      h('button', { class: 'btn ghost sm', onclick: () => { g.dossier.arrange(); this.render(); } }, 'Organizar quadro'),
      h('button', { class: 'btn ghost sm', onclick: () => this.customHyp() }, '+ Hipótese própria'),
      h('button', { class: 'btn sm', onclick: () => this.close() }, 'Fechar · J')));

    // linha do raciocínio: hipótese → evidência → contradição → nova hipótese
    const flow = h('div', { class: 'flowline', 'aria-label': 'Linha do raciocínio' });
    const revs = s.revisions;
    if (!revs.length) {
      flow.append(h('span', { class: 'node' }, 'HIPÓTESE'), h('span', { class: 'arr' }, '→'), h('span', { class: 'node' }, 'EVIDÊNCIA'), h('span', { class: 'arr' }, '→'),
        h('span', { class: 'node c' }, 'CONTRADIÇÃO?'), h('span', { class: 'arr' }, '→'), h('span', { class: 'node' }, 'NOVA HIPÓTESE'),
        h('span', { class: 'muted', style: { marginLeft: '10px' } }, 'Defina uma hipótese ativa e confronte-a com o que encontrar.'));
    } else {
      revs.forEach((r, i) => {
        if (i === 0 && r.from === null) { flow.append(h('span', { class: 'node h', title: g.dossier.get(r.to)?.text }, g.dossier.get(r.to)?.text ?? r.to)); return; }
        if (r.trigger) flow.append(h('span', { class: 'arr' }, '→'), h('span', { class: 'node c', title: g.ev.def(r.trigger)?.title }, `CONTRADIÇÃO: ${g.ev.def(r.trigger)?.title ?? ''}`));
        flow.append(h('span', { class: 'arr' }, '→'), h('span', { class: 'node h', title: g.dossier.get(r.to)?.text }, g.dossier.get(r.to)?.text ?? r.to));
      });
    }
    this.el.append(flow);

    // banner de revisão
    const act = g.dossier.active;
    const wrap = h('div', { style: { display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: 0 } });
    if (act?.status === 'em_revisao') {
      const contra = g.dossier.contradictionsOf(act.id).at(-1);
      wrap.append(h('div', { class: 'review-banner', role: 'alert' },
        h('b', {}, 'HIPÓTESE EM REVISÃO'),
        h('span', {}, `Novas evidências sugerem outra explicação${contra ? ` (${contra.def.title})` : ''}. Mantenha com justificativa ou escolha outra hipótese no quadro.`),
        h('button', { class: 'btn ghost sm', onclick: () => { g.dossier.keep(act.id); this.render(); } }, 'Manter mesmo assim')));
    } else wrap.append(h('div'));

    // quadro
    const board = h('div', { class: 'board' });
    const inner = h('div', { class: 'board-inner' });
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('class', 'links');
    inner.append(svg as unknown as HTMLElement);
    board.append(inner);
    wrap.append(board);
    this.el.append(wrap);

    const cards = new Map<string, HTMLElement>();
    const drawLinks = () => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      for (const l of s.links) {
        const a = cards.get('e:' + l.evidenceId), b = cards.get('h:' + l.hypothesisId); if (!a || !b) continue;
        const ax = a.offsetLeft + a.offsetWidth / 2, ay = a.offsetTop + a.offsetHeight / 2;
        const bx = b.offsetLeft + b.offsetWidth, by = b.offsetTop + b.offsetHeight / 2;
        const line = document.createElementNS(ns, 'path');
        const mx = (ax + bx) / 2;
        line.setAttribute('d', `M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`);
        line.setAttribute('fill', 'none');
        line.setAttribute('stroke', l.relation === 'apoia' ? '#2fe3a1' : '#f2b84b');
        line.setAttribute('stroke-width', '2');
        if (l.relation === 'contradiz') line.setAttribute('stroke-dasharray', '7 5');
        svg.append(line);
        const tx = document.createElementNS(ns, 'text');
        tx.setAttribute('x', String(mx)); tx.setAttribute('y', String((ay + by) / 2 - 4));
        tx.setAttribute('fill', l.relation === 'apoia' ? '#2fe3a1' : '#f2b84b'); tx.setAttribute('font-size', '11'); tx.setAttribute('font-family', 'IBM Plex Mono, monospace');
        tx.setAttribute('text-anchor', 'middle'); tx.textContent = l.relation === 'apoia' ? 'APOIA' : 'CONTRADIZ';
        svg.append(tx);
      }
    };

    const drag = (el: HTMLElement, obj: { x?: number; y?: number }) => {
      let sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
      el.addEventListener('pointerdown', e => {
        if ((e.target as HTMLElement).closest('button')) return;
        sx = e.clientX; sy = e.clientY; ox = obj.x ?? 0; oy = obj.y ?? 0; moved = false;
        el.setPointerCapture(e.pointerId);
        const mv = (ev: PointerEvent) => {
          const dx = ev.clientX - sx, dy = ev.clientY - sy;
          if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
          obj.x = Math.max(0, ox + dx); obj.y = Math.max(0, oy + dy);
          el.style.left = obj.x + 'px'; el.style.top = obj.y + 'px'; drawLinks();
        };
        const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); if (moved) g.ctx.save(); };
        el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up);
      });
    };

    // hipóteses
    if (!g.dossier.hypotheses.length) inner.append(h('div', { class: 'card hyp', style: { left: '20px', top: '30px', cursor: 'default' } },
      h('div', { class: 'k' }, 'HIPÓTESES'), h('b', {}, 'Nenhuma ainda.'), h('p', {}, 'Converse com as pessoas e anote o que elas acham — ou escreva a sua.')));
    for (const hy of g.dossier.hypotheses) {
      const card = h('div', { class: `card hyp ${hy.status}`, style: { left: (hy.x ?? 20) + 'px', top: (hy.y ?? 30) + 'px' }, tabindex: '0' },
        h('div', { class: 'k' }, h('span', {}, hy.origin === 'jogador' ? 'HIPÓTESE DA EQUIPE' : 'HIPÓTESE'), h('span', { class: 'st' }, STATUS[hy.status])),
        h('b', {}, hy.text),
        h('p', {}, `${s.links.filter(l => l.hypothesisId === hy.id && l.relation === 'apoia').length} apoiam · ${s.links.filter(l => l.hypothesisId === hy.id && l.relation === 'contradiz').length} contradizem`),
        h('div', { class: 'acts' },
          hy.status !== 'ativa' && hy.status !== 'em_revisao' && hy.status !== 'descartada' ? h('button', { onclick: () => { g.dossier.setActive(hy.id); this.render(); } }, 'TORNAR ATIVA') : null,
          hy.status === 'descartada' ? h('button', { onclick: () => { g.dossier.setStatus(hy.id, 'candidata'); this.render(); } }, 'REABRIR') : null,
          hy.status !== 'descartada' && hy.status !== 'ativa' ? h('button', { onclick: () => { g.dossier.setStatus(hy.id, 'descartada'); this.render(); } }, 'DESCARTAR') : null));
      card.addEventListener('click', e => {
        if (!this.linking || (e.target as HTMLElement).closest('button')) return;
        g.dossier.link(this.linking.evidenceId, hy.id, this.linking.relation);
        this.linking = null; this.render();
      });
      if (this.linking) card.style.outline = '2px dashed var(--neon)';
      drag(card, hy); cards.set('h:' + hy.id, card); inner.append(card);
    }

    // evidências
    for (const e of evs) {
      const ref = s.evidences.find(x => x.id === e.id)!;
      const d = e.def;
      const card = h('div', { class: `card k-${d.kind}` + (this.linking?.evidenceId === e.id ? ' sel' : ''), style: { left: (ref.x ?? 300) + 'px', top: (ref.y ?? 40) + 'px' }, tabindex: '0' },
        h('div', { class: 'k' }, h('span', {}, h('span', { class: 'mk' }, KIND_MARK[d.kind] + ' '), KIND_LABEL[d.kind]), h('span', {}, ref.at)),
        h('b', {}, d.title), h('p', {}, d.summary),
        h('div', { class: 'src' }, 'Fonte: ' + d.source),
        d.simulated ? h('span', { class: 'sim-badge', style: { marginTop: '6px' } }, 'SIMULADO') : null,
        h('div', { class: 'acts' },
          h('button', { onclick: () => { this.linking = { evidenceId: e.id, relation: 'apoia' }; this.render(); } }, 'APOIA →'),
          h('button', { onclick: () => { this.linking = { evidenceId: e.id, relation: 'contradiz' }; this.render(); } }, 'CONTRADIZ →')));
      drag(card, ref); cards.set('e:' + e.id, card); inner.append(card);
    }
    if (!evs.length) inner.append(h('div', { class: 'card', style: { left: '300px', top: '40px', cursor: 'default' } }, h('b', {}, 'Dossiê vazio'), h('p', {}, 'Observe, converse, fotografe e consulte fontes públicas.')));

    if (this.linking) {
      const ev = g.ev.def(this.linking.evidenceId)!;
      this.el.append(h('div', { class: 'linkbar', role: 'status' },
        h('span', {}, `"${ev.title}" `, h('b', {}, this.linking.relation === 'apoia' ? 'APOIA' : 'CONTRADIZ'), ' → clique na hipótese'),
        h('button', { class: 'btn ghost sm', onclick: () => { this.linking = null; this.render(); } }, 'Cancelar')));
    }
    requestAnimationFrame(drawLinks);
  }

  private customHyp() {
    const input = h('textarea', { class: 'input', maxlength: 140, placeholder: 'Ex.: Os ônibus estão desviando por causa de algo no caminho.' });
    const m = modal(h('div', { class: 'stack' },
      h('div', { class: 'eyebrow' }, 'NOVA HIPÓTESE'), h('h2', {}, 'O que a equipe acha?'),
      h('p', { class: 'muted', style: { margin: 0, fontSize: '.86rem' } }, 'Uma hipótese é uma explicação que pode ser testada com evidências.'),
      input,
      h('button', { class: 'btn block', onclick: () => { if (input.value.trim().length < 8) return; this.g.dossier.addCustom(input.value); m.close(); this.render(); } }, 'Adicionar ao quadro')));
  }
}
