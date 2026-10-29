import type { GameUI } from './GameUI';
import { h, clear } from '../dom';
import { AGENCIES, agencyById } from '@/data/agencies';
import { KIND_MARK } from '@/systems/EvidenceSystem';
import type { SolutionDraft } from '@/types';
import { bus } from '@/game/EventBus';

const AFFECTED = ['Estudantes', 'Trabalhadores', 'Pessoas com deficiência', 'Idosos', 'Moradores da Região Administrativa', 'Escola'];
const PROBLEMS = [
  'Estudantes da Quadra 214 chegam atrasados ao Centro de Ensino.',
  'Os ônibus da linha 0.214 chegam lotados e em intervalos irregulares.',
  'O trajeto até a parada é inseguro e pouco acessível.'
];
/** propostas-semente: `fits` liga a proposta às hipóteses que ela enfrenta */
const PROPOSALS: { t: string; fits: string[] }[] = [
  { t: 'Informar o desvio nas paradas e no app', fits: ['h_desvio'] },
  { t: 'Reforço de ônibus no pico enquanto durar a obra', fits: ['h_desvio', 'h_lotado'] },
  { t: 'Prioridade para ônibus no trecho do desvio', fits: ['h_desvio'] },
  { t: 'Publicar o prazo da obra e acompanhar', fits: ['h_desvio'] },
  { t: 'Rampa e iluminação no caminho até a parada', fits: [] },
  { t: 'Aumentar a frota da linha', fits: ['h_poucos'] },
  { t: 'Campanha contra boatos no grupo da escola', fits: ['h_acabar'] }
];
const IDEAS = ['Acompanhar a resposta do protocolo', 'Pedir dados de pontualidade via LAI', 'Levar ao conselho escolar', 'Mobilizar a comunidade da parada', 'Monitorar com fotos semanais'];

/** LABORATÓRIO DE SOLUÇÕES — painel de módulos, não formulário. */
export class SolutionLab {
  private el = h('div', { class: 'lab', role: 'dialog', 'aria-label': 'Laboratório de Soluções' });
  private d: SolutionDraft;

  constructor(private ui: GameUI) {
    const s = ui.g.ctx.session;
    this.d = s.solution ? structuredClone(s.solution) : {
      problem: '', evidenceIds: [], causeHypothesisId: s.activeHypothesisId, affected: [], agencies: [...s.agencies], proposal: '', proposalTags: [],
      feasibility: { custo: 3, prazo: 3, complexidade: 3 }, impact: { alcance: 3, texto: '' }, participationProtocols: s.participations.map(p => p.protocol), participationIdeas: []
    };
  }
  get g() { return this.ui.g; }

  open() { this.g.open('lab'); this.g.ctx.log('lab_open'); this.ui.root.append(this.el); this.render(); }
  close() { this.persist(); this.el.remove(); this.g.closeOverlay(); }
  private persist() { this.g.ctx.session.solution = structuredClone(this.d); this.g.ctx.save(); }

  private checks() {
    const d = this.d;
    return [
      d.problem.trim().length > 10, d.evidenceIds.length >= 2, !!d.causeHypothesisId, d.affected.length > 0, d.agencies.length > 0,
      d.proposalTags.length > 0 || d.proposal.trim().length > 15, true, d.impact.texto.trim().length > 5 || d.impact.alcance > 0,
      d.participationProtocols.length + d.participationIdeas.length > 0
    ];
  }

  private render() {
    const g = this.g, d = this.d, s = g.ctx.session;
    const sc = this.el.scrollTop;
    clear(this.el);
    const ok = this.checks(); const n = ok.filter(Boolean).length;
    const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.splice(arr.indexOf(v), 1) : arr.push(v);
    const re = () => { this.persist(); this.render(); };
    const mod = (i: number, title: string, ...body: (HTMLElement | null)[]) =>
      h('section', { class: 'mod' + (ok[i] ? ' ok' : ''), 'aria-label': title }, h('div', { class: 'h' }, h('span', { class: 'n' }, String(i + 1).padStart(2, '0')), title, ok[i] ? h('span', { class: 'sr-only' }, '(completo)') : null), ...body);

    const ring = `<svg class="ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="3"/><circle cx="18" cy="18" r="15.5" fill="none" stroke="#2fe3a1" stroke-width="3" stroke-dasharray="${(n / 9) * 97.4} 97.4" transform="rotate(-90 18 18)"/><text x="18" y="21" text-anchor="middle" font-size="9" fill="#eef5f3" font-family="Space Grotesk">${n}/9</text></svg>`;
    this.el.append(h('div', { class: 'lab-head' }, h('span', { html: ring }),
      h('div', {}, h('div', { class: 'eyebrow' }, 'LABORATÓRIO DE SOLUÇÕES'), h('h2', {}, 'Monte a proposta que sobrevive às evidências.')),
      h('span', { class: 'spacer' }), h('button', { class: 'btn ghost sm', onclick: () => this.close() }, 'Voltar ao jogo')));

    // 1 problema
    const pIn = h('input', { class: 'input', value: d.problem, placeholder: 'Ou escreva o problema com as palavras da equipe', 'aria-label': 'Problema' });
    pIn.onchange = () => { d.problem = pIn.value; re(); };
    // 2 evidências
    const evs = g.ev.list().filter(e => e.def.kind !== 'competencia');
    const onlyRumor = d.evidenceIds.length > 0 && d.evidenceIds.every(id => g.ev.def(id)?.kind === 'rumor');
    // 3 causa
    const hyps = g.dossier.hypotheses.filter(x => x.status !== 'descartada');
    const contra = d.causeHypothesisId ? g.dossier.contradictionsOf(d.causeHypothesisId) : [];
    // 6 proposta
    const pr = h('textarea', { class: 'input', placeholder: 'Detalhe a proposta (opcional)', 'aria-label': 'Detalhes da proposta', style: { minHeight: '64px' } });
    pr.value = d.proposal; pr.onchange = () => { d.proposal = pr.value; re(); };
    const imp = h('input', { class: 'input', value: d.impact.texto, placeholder: 'O que muda para quem é afetado?', 'aria-label': 'Impacto esperado' });
    imp.onchange = () => { d.impact.texto = imp.value; re(); };
    const slider = (label: string, val: number, set: (v: number) => void, lo: string, hi: string) => {
      const r = h('input', { type: 'range', min: 1, max: 5, value: val, 'aria-label': label });
      const out = h('span', { class: 'mono', style: { fontSize: '.7rem' } }, val <= 2 ? lo : val >= 4 ? hi : 'médio');
      r.oninput = () => { set(Number(r.value)); out.textContent = Number(r.value) <= 2 ? lo : Number(r.value) >= 4 ? hi : 'médio'; };
      r.onchange = () => this.persist();
      return h('label', { class: 'slider' }, h('span', {}, label), r, out);
    };

    this.el.append(h('div', { class: 'mods' },
      mod(0, 'PROBLEMA', h('div', { class: 'slots' }, PROBLEMS.map(p => h('button', { class: 'mini' + (d.problem === p ? ' on' : ''), onclick: () => { d.problem = p; re(); } }, p))), pIn),
      mod(1, 'EVIDÊNCIAS (mín. 2)', h('div', { class: 'slots' }, evs.length ? evs.map(e => h('button', { class: 'mini' + (d.evidenceIds.includes(e.id) ? ' on' : ''), onclick: () => { toggle(d.evidenceIds, e.id); re(); } }, `${KIND_MARK[e.def.kind]} ${e.def.title}`)) : h('span', { class: 'muted' }, 'Dossiê vazio.')),
        onlyRumor ? h('div', { class: 'notice' }, '⚠ Só boatos selecionados. Eles foram verificados?') : null),
      mod(2, 'CAUSA PROVÁVEL', h('div', { class: 'slots' }, hyps.length ? hyps.map(x => h('button', { class: 'mini' + (d.causeHypothesisId === x.id ? ' on' : ''), onclick: () => { d.causeHypothesisId = x.id; re(); } }, x.text)) : h('span', { class: 'muted' }, 'Nenhuma hipótese no dossiê.')),
        contra.length ? h('div', { class: 'notice' }, `⚠ O próprio dossiê tem ${contra.length} evidência(s) contra esta causa.`) : null),
      mod(3, 'QUEM É AFETADO', h('div', { class: 'slots' }, AFFECTED.map(a => h('button', { class: 'mini' + (d.affected.includes(a) ? ' on' : ''), onclick: () => { toggle(d.affected, a); re(); } }, a)))),
      mod(4, 'ÓRGÃO RESPONSÁVEL', h('div', { class: 'slots' }, AGENCIES.map(a => h('button', { class: 'mini' + (d.agencies.includes(a.id) ? ' on' : ''), onclick: () => { toggle(d.agencies, a.id); re(); } },
        a.short + (s.agencies.includes(a.id) ? ' ✓' : '')))), h('small', { class: 'muted' }, '✓ = identificado no Portal do GDF durante a investigação')),
      mod(5, 'SOLUÇÃO PROPOSTA', h('div', { class: 'slots' }, PROPOSALS.map(p => h('button', { class: 'mini' + (d.proposalTags.includes(p.t) ? ' on' : ''), onclick: () => { toggle(d.proposalTags, p.t); re(); } }, p.t))), pr),
      mod(6, 'VIABILIDADE',
        slider('Custo', d.feasibility.custo, v => d.feasibility.custo = v, 'baixo', 'alto'),
        slider('Prazo', d.feasibility.prazo, v => d.feasibility.prazo = v, 'curto', 'longo'),
        slider('Complexidade', d.feasibility.complexidade, v => d.feasibility.complexidade = v, 'baixa', 'alta')),
      mod(7, 'IMPACTO ESPERADO', slider('Alcance', d.impact.alcance, v => d.impact.alcance = v, 'poucos', 'muitos'), imp),
      mod(8, 'COMO A SOCIEDADE PARTICIPA', h('div', { class: 'slots' },
        s.participations.map(p => h('button', { class: 'mini' + (d.participationProtocols.includes(p.protocol) ? ' on' : ''), onclick: () => { toggle(d.participationProtocols, p.protocol); re(); } }, `Protocolo ${p.protocol} → ${agencyById(p.agency)?.short ?? p.agency}`)),
        IDEAS.map(i => h('button', { class: 'mini' + (d.participationIdeas.includes(i) ? ' on' : ''), onclick: () => { toggle(d.participationIdeas, i); re(); } }, i))))));

    this.el.append(h('div', { class: 'lab-foot' },
      n < 9 ? h('span', { class: 'notice' }, `Faltam ${9 - n} módulo(s).`) : h('span', { class: 'mono', style: { color: 'var(--neon)', fontSize: '.8rem' } }, 'PROPOSTA COMPLETA'),
      h('button', { class: 'btn amber', disabled: n < 9, onclick: () => this.submit() }, 'Levar ao Conselho da Cidade →')));
    this.el.scrollTop = sc;
  }

  private submit() {
    const g = this.g, d = this.d, c = g.ctx.campaign;
    this.persist();
    g.ctx.log('solution_submitted', { cause: d.causeHypothesisId, evidences: d.evidenceIds, agencies: d.agencies, tags: d.proposalTags, feasibility: d.feasibility, impact: d.impact.alcance });
    const R = (v: number, r: string, k: string) => g.rep.add(v, r, k);
    if (d.causeHypothesisId && c.bestCause.includes(d.causeHypothesisId)) R(120, 'Causa sustentada pelo dossiê', 'sol:cause');
    if (d.causeHypothesisId && g.dossier.contradictionsOf(d.causeHypothesisId).length) R(-40, 'Conclusão incompatível com o dossiê', 'sol:contra');
    const kinds = new Set(d.evidenceIds.map(id => g.ev.def(id)?.kind));
    if (d.evidenceIds.every(id => g.ev.def(id)?.kind === 'rumor')) R(-20, 'Usou informação sem verificar', 'sol:rumor');
    else if (kinds.size >= 3) R(40, 'Proposta com fontes variadas', 'sol:kinds');
    if (d.agencies.some(a => c.expectedAgencies.includes(a))) R(60, 'Endereçou o órgão competente', 'sol:agency');
    const fit = PROPOSALS.filter(p => d.proposalTags.includes(p.t)).some(p => d.causeHypothesisId && p.fits.includes(d.causeHypothesisId));
    if (fit) R(60, 'Solução conectada à causa', 'sol:fit');
    if (d.participationProtocols.length) R(40, 'Participação com protocolo', 'sol:part');
    const important = c.bestCause.flatMap(h0 => g.dossier.supportsOf(h0).map(e => e.id)).filter(id => g.ev.def(id)?.kind === 'dado' || g.ev.def(id)?.kind === 'documento');
    if (important.length && !important.some(id => d.evidenceIds.includes(id))) R(-10, 'Deixou de fora dados importantes', 'sol:ignored');
    g.ctx.setFlag('solution_ready');
    this.el.remove(); g.closeOverlay();
    bus.emit('state');
    this.ui.openCouncil();
  }
}
