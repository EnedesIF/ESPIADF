import type { GameUI } from './GameUI';
import { h } from '../dom';
import { toolById } from '@/data/tools';

/** Encerramento da missão: resumo para a equipe. */
export class Debrief {
  private el = h('div', { class: 'debrief', role: 'dialog', 'aria-label': 'Relatório da missão' });
  constructor(private ui: GameUI) {}
  open() {
    const g = this.ui.g, s = g.ctx.session;
    g.open('debrief');
    const tools = [...new Set(s.toolsUsed.map(t => t.tool))].map(t => toolById(t)?.name ?? t);
    const statusTxt = s.status === 'validada' ? `MISSÃO VALIDADA PELO MENTOR${s.mentorScore != null ? ` · NOTA ${s.mentorScore}` : ''}` : s.status === 'devolvida' ? 'DEVOLVIDA PARA INVESTIGAÇÃO' : 'AGUARDANDO AVALIAÇÃO DO PROFESSOR-MENTOR';
    const mins = (k: string) => Math.round((s.phaseTimes[k] ?? 0) / 60000);
    this.el.append(
      h('div', { class: 'eyebrow' }, `CAMPANHA ${g.ctx.campaign.number} // ${g.ctx.campaign.title}`),
      h('h1', {}, 'Missão', h('br'), h('span', { style: { color: 'var(--neon)' } }, 'encerrada.')),
      h('div', { class: 'tag', style: { color: 'var(--amber)', justifySelf: 'start' } }, statusTxt),
      h('div', { class: 'kpis' },
        h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'REPUTAÇÃO'), h('div', { class: 'v' }, String(s.reputation))),
        h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'EVIDÊNCIAS'), h('div', { class: 'v' }, String(s.evidences.length))),
        h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'REVISÕES DE HIPÓTESE'), h('div', { class: 'v' }, String(s.revisions.filter(r => r.from).length))),
        h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'PROTOCOLOS'), h('div', { class: 'v' }, String(s.participations.length)))),
      h('div', { class: 'grid2' },
        h('div', { class: 'panel' }, h('div', { class: 'eyebrow' }, 'FONTES CONSULTADAS'), h('p', {}, tools.join(' · ') || '—'),
          h('div', { class: 'eyebrow', style: { marginTop: '14px' } }, 'TEMPO POR ETAPA (MIN)'),
          h('p', { class: 'mono' }, `rotina ${mins('rotina')} · investigação ${mins('investigacao')} · laboratório ${mins('laboratorio')} · conselho ${mins('conselho')}`)),
        h('div', { class: 'panel' }, h('div', { class: 'eyebrow' }, 'REPUTAÇÃO — HISTÓRICO'),
          h('div', { class: 'timeline' }, [...s.repLog].reverse().map(r => h('div', {}, h('span', { class: 't' }, r.at), h('span', {}, r.reason), h('b', { style: { color: r.delta < 0 ? 'var(--amber)' : 'var(--neon)' } }, (r.delta > 0 ? '+' : '') + r.delta)))))),
      h('p', { class: 'muted', style: { maxWidth: '70ch' } }, 'Todos os números, documentos e respostas de órgãos exibidos nesta missão são simulados para demonstração. Para agir de verdade, use os canais oficiais — o caminho é o mesmo que vocês acabaram de percorrer.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => this.ui.app.showHub() }, 'Central de Missões'),
        h('button', { class: 'btn ghost', onclick: () => { this.el.remove(); g.closeOverlay(); } }, 'Continuar explorando a cidade')));
    this.ui.root.append(this.el);
  }
}
