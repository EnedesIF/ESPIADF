import type { GameUI } from './GameUI';
import { h, clear } from '../dom';
import { KIND_LABEL } from '@/systems/EvidenceSystem';
import { agencyById } from '@/data/agencies';
import { Debrief } from './Debrief';

/** CONSELHO DA CIDADE — pitch com slides gerados do dossiê e da proposta. */
export class Council {
  private el = h('div', { class: 'council', role: 'dialog', 'aria-label': 'Conselho da Cidade' });
  private i = 0;
  private left = 180;
  private timer: number | null = null;
  private start = Date.now();
  private seen = new Set<number>();

  constructor(private ui: GameUI) {}
  get g() { return this.ui.g; }

  open() {
    this.g.open('council'); this.g.ctx.log('pitch_started');
    this.ui.root.append(this.el);
    this.timer = window.setInterval(() => { this.left--; this.renderTimer(); }, 1000);
    window.addEventListener('keydown', this.key);
    this.render();
  }
  private key = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { this.go(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { this.go(-1); e.preventDefault(); }
  };
  private go(d: number) { const n = this.slides().length; this.i = Math.max(0, Math.min(n - 1, this.i + d)); this.render(); }

  private slides(): { k: string; body: HTMLElement[] }[] {
    const g = this.g, s = g.ctx.session, d = s.solution!;
    const ev = (id: string) => g.ev.def(id)!;
    const cause = d.causeHypothesisId ? g.dossier.get(d.causeHypothesisId)?.text : '—';
    const f = d.feasibility;
    const lvl = (v: number, a: string, b: string) => v <= 2 ? a : v >= 4 ? b : 'médio';
    return [
      { k: 'O PROBLEMA', body: [h('h2', {}, d.problem), h('p', {}, `Equipe ${g.ctx.team.name} · ${g.ctx.team.school}`), h('p', { class: 'muted' }, 'Quem é afetado: ' + d.affected.join(', '))] },
      { k: 'AS EVIDÊNCIAS', body: [h('h2', {}, `${d.evidenceIds.length} evidências, ${new Set(d.evidenceIds.map(id => ev(id).kind)).size} tipos de fonte.`),
        h('div', { class: 'cards' }, d.evidenceIds.map(id => h('div', { class: 'ev' }, h('small', {}, KIND_LABEL[ev(id).kind] + (ev(id).simulated ? ' · SIMULADO' : '')), h('b', {}, ev(id).title), h('p', { style: { fontSize: '.85rem', color: 'var(--muted)', margin: '6px 0 0' } }, ev(id).source))))] },
      { k: 'A CAUSA PROVÁVEL', body: [h('h2', {}, cause ?? '—'),
        h('p', {}, s.revisions.filter(r => r.from).length ? `A equipe revisou a hipótese ${s.revisions.filter(r => r.from).length} vez(es) ao longo da investigação.` : 'A equipe manteve a hipótese inicial.'),
        h('div', { class: 'cards' }, s.revisions.filter(r => r.from).map(r => h('div', { class: 'ev' }, h('small', {}, `${r.at} — REVISÃO`), h('b', {}, `${g.dossier.get(r.from!)?.text ?? ''} → ${g.dossier.get(r.to)?.text ?? ''}`))))] },
      { k: 'QUEM PODE AGIR', body: [h('h2', {}, d.agencies.map(a => agencyById(a)?.short ?? a).join(' · ')),
        h('div', { class: 'cards' }, d.agencies.map(a => h('div', { class: 'ev' }, h('small', {}, agencyById(a)?.short ?? a), h('b', {}, agencyById(a)?.name ?? ''), h('p', { style: { fontSize: '.85rem', color: 'var(--muted)', margin: '6px 0 0' } }, agencyById(a)?.scope ?? ''))))] },
      { k: 'A PROPOSTA', body: [h('h2', {}, d.proposalTags.join(' + ') || d.proposal), d.proposal ? h('p', {}, d.proposal) : null,
        h('div', { class: 'kpis' },
          h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'CUSTO'), h('div', { class: 'v' }, lvl(f.custo, 'baixo', 'alto'))),
          h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'PRAZO'), h('div', { class: 'v' }, lvl(f.prazo, 'curto', 'longo'))),
          h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'COMPLEXIDADE'), h('div', { class: 'v' }, lvl(f.complexidade, 'baixa', 'alta'))),
          h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'ALCANCE'), h('div', { class: 'v' }, lvl(d.impact.alcance, 'poucos', 'muitos')))),
        d.impact.texto ? h('p', {}, 'Impacto esperado: ' + d.impact.texto) : null].filter(Boolean) as HTMLElement[] },
      { k: 'PARTICIPAÇÃO', body: [h('h2', {}, 'Como a sociedade acompanha.'),
        h('div', { class: 'cards' }, [...d.participationProtocols.map(p => h('div', { class: 'ev' }, h('small', {}, 'PARTICIPA DF — SIMULADO'), h('b', {}, p))),
          ...d.participationIdeas.map(i => h('div', { class: 'ev' }, h('small', {}, 'AÇÃO DA COMUNIDADE'), h('b', {}, i)))])] },
      { k: 'INDICADORES DA INVESTIGAÇÃO', body: [h('h2', {}, 'O caminho até aqui.'),
        h('div', { class: 'kpis' },
          h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'EVIDÊNCIAS'), h('div', { class: 'v' }, String(s.evidences.length))),
          h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'FONTES CONSULTADAS'), h('div', { class: 'v' }, String(new Set(s.toolsUsed.map(t => t.tool)).size))),
          h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'REVISÕES DE HIPÓTESE'), h('div', { class: 'v' }, String(s.revisions.filter(r => r.from).length))),
          h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'REPUTAÇÃO'), h('div', { class: 'v' }, String(s.reputation)))),
        this.ui.phone.minimap(false)] }
    ];
  }

  private renderTimer() {
    const t = this.el.querySelector('.timer'); if (!t) return;
    const v = Math.abs(this.left);
    t.textContent = `${this.left < 0 ? '+' : ''}${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
    t.className = 'timer' + (this.left < 30 ? ' low' : '');
  }

  private render() {
    clear(this.el);
    const sl = this.slides(); this.seen.add(this.i);
    const cur = sl[this.i];
    this.el.append(
      h('header', {}, h('div', {}, h('div', { class: 'eyebrow' }, 'CONSELHO DA CIDADE'), h('b', { class: 'display', style: { fontSize: '1.2rem' } }, `Equipe ${this.g.ctx.team.name}`)),
        h('span', { class: 'muted mono', style: { fontSize: '.7rem' } }, 'TEMPO DE FALA'), h('div', { class: 'timer' })),
      h('div', { class: 'slide', 'aria-live': 'polite' }, h('div', { class: 'k' }, `${String(this.i + 1).padStart(2, '0')} / ${sl.length} — ${cur.k}`), ...cur.body),
      h('footer', {},
        h('button', { class: 'btn ghost sm', disabled: this.i === 0, onclick: () => this.go(-1) }, '← Anterior'),
        h('div', { class: 'dots' }, sl.map((_, j) => h('i', { class: j === this.i ? 'on' : '' }))),
        h('button', { class: 'btn ghost sm', disabled: this.i === sl.length - 1, onclick: () => this.go(1) }, 'Próximo →'),
        h('span', { class: 'spacer' }),
        h('button', { class: 'linkbtn', onclick: () => this.leave(false) }, 'Ensaiar depois'),
        h('button', { class: 'btn amber', onclick: () => this.leave(true) }, 'Encerrar apresentação')));
    this.renderTimer();
  }

  private leave(done: boolean) {
    if (this.timer) clearInterval(this.timer);
    window.removeEventListener('keydown', this.key);
    this.el.remove(); this.g.closeOverlay();
    if (!done) return;
    const s = this.g.ctx.session;
    const dur = Math.round((Date.now() - this.start) / 1000);
    s.pitch = { startedAt: this.start, endedAt: Date.now(), durationSec: dur, slidesSeen: this.seen.size };
    s.status = 'aguardando_mentor';
    this.g.ctx.log('pitch_done', { durationSec: dur, slidesSeen: this.seen.size });
    if (this.seen.size >= 6) this.g.rep.add(40, 'Apresentou ao Conselho', 'pitch');
    this.g.ctx.setFlag('pitch_done');
    this.g.ctx.save(true);
    new Debrief(this.ui).open();
  }
}
