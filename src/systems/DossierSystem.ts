import type { HypothesisState, HypothesisStatus } from '@/types';
import { bus } from '@/game/EventBus';
import type { GameContext } from './GameContext';
import type { ReputationSystem } from './ReputationSystem';
import type { EvidenceSystem } from './EvidenceSystem';
import { uid } from '@/services/util';

/** Hipóteses, conexões evidência→hipótese e revisões (o coração pedagógico). */
export class DossierSystem {
  private pendingTrigger: string | null = null;

  constructor(private ctx: GameContext, private rep: ReputationSystem, private ev: EvidenceSystem) {
    bus.on('hypothesis:contradicted', ({ hypothesisId, evidenceId }) => this.markReview(hypothesisId, evidenceId));
  }

  get hypotheses() { return this.ctx.session.hypotheses; }
  get active() { return this.hypotheses.find(h => h.id === this.ctx.session.activeHypothesisId) || null; }
  get(id: string) { return this.hypotheses.find(h => h.id === id); }

  addCandidate(id: string, origin: HypothesisState['origin'] = 'npc') {
    if (this.get(id)) return false;
    const def = this.ctx.campaign.hypotheses.find(h => h.id === id);
    if (!def) return false;
    const n = this.hypotheses.length;
    this.hypotheses.push({ id, text: def.text, origin, status: 'candidata', x: 20, y: 30 + n * 162 });
    this.ctx.log('hypothesis_added', { hypothesis: id, origin });
    bus.emit('hypothesis:new', def);
    bus.emit('state'); this.ctx.save();
    return true;
  }

  addCustom(text: string) {
    const id = uid('hj_');
    const n = this.hypotheses.length;
    this.hypotheses.push({ id, text: text.trim(), origin: 'jogador', status: 'candidata', x: 20, y: 30 + n * 162 });
    this.ctx.log('hypothesis_added', { hypothesis: id, origin: 'jogador', text });
    this.rep.add(15, 'Formulou hipótese própria', 'custom-hyp');
    bus.emit('state'); this.ctx.save();
    return id;
  }

  setActive(id: string) {
    const s = this.ctx.session;
    const prev = s.activeHypothesisId;
    if (prev === id) return;
    const prevH = prev ? this.get(prev) : null;
    const wasReview = prevH?.status === 'em_revisao';
    if (prevH) prevH.status = wasReview ? 'descartada' : 'candidata';
    const h = this.get(id); if (!h) return;
    h.status = 'ativa';
    s.activeHypothesisId = id;
    s.revisions.push({ from: prev, to: id, at: this.ctx.clock, ts: Date.now(), trigger: wasReview ? this.pendingTrigger : null });
    this.ctx.log(prev ? 'hypothesis_revised' : 'hypothesis_activated', { from: prev, to: id, afterContradiction: wasReview });
    if (!prev) this.rep.add(20, 'Definiu uma hipótese de trabalho', 'first-active');
    else if (wasReview) this.rep.add(80, 'Mudou de ideia diante das evidências');
    this.pendingTrigger = null;
    // a nova hipótese já nasce em revisão se o dossiê a contradiz
    const contra = this.ev.list().find(e => e.def.contradicts?.includes(id));
    if (contra) this.markReview(id, contra.id);
    bus.emit('hypothesis:active', h);
    bus.emit('state'); this.ctx.save();
  }

  /** manter a hipótese mesmo após contradição (registrado, sem punição) */
  keep(id: string) {
    const h = this.get(id); if (!h) return;
    h.status = 'ativa';
    this.ctx.log('hypothesis_kept', { hypothesis: id, trigger: this.pendingTrigger });
    this.pendingTrigger = null;
    bus.emit('state'); this.ctx.save();
  }

  setStatus(id: string, st: HypothesisStatus) {
    const h = this.get(id); if (!h) return;
    h.status = st;
    if (st === 'descartada' && this.ctx.session.activeHypothesisId === id) this.ctx.session.activeHypothesisId = null;
    this.ctx.log('hypothesis_status', { hypothesis: id, status: st });
    bus.emit('state'); this.ctx.save();
  }

  private markReview(hypId: string, evidenceId: string) {
    const h = this.get(hypId); if (!h || h.status === 'em_revisao') return;
    h.status = 'em_revisao';
    this.pendingTrigger = evidenceId;
    this.ctx.log('hypothesis_in_review', { hypothesis: hypId, evidence: evidenceId });
    bus.emit('hypothesis:review', { hypothesis: h, evidence: this.ev.def(evidenceId) });
    bus.emit('state'); this.ctx.save();
  }

  link(evidenceId: string, hypothesisId: string, relation: 'apoia' | 'contradiz') {
    const s = this.ctx.session;
    s.links = s.links.filter(l => !(l.evidenceId === evidenceId && l.hypothesisId === hypothesisId));
    s.links.push({ evidenceId, hypothesisId, relation });
    const def = this.ev.def(evidenceId);
    const consistent = relation === 'apoia' ? def?.supports?.includes(hypothesisId) : def?.contradicts?.includes(hypothesisId);
    this.ctx.log('evidence_linked', { evidence: evidenceId, hypothesis: hypothesisId, relation, consistent: !!consistent });
    if (consistent) this.rep.add(15, 'Conectou evidência e hipótese', `link:${evidenceId}:${hypothesisId}`);
    if (relation === 'contradiz' && s.activeHypothesisId === hypothesisId) this.markReview(hypothesisId, evidenceId);
    bus.emit('state'); this.ctx.save();
  }

  unlink(evidenceId: string, hypothesisId: string) {
    const s = this.ctx.session;
    s.links = s.links.filter(l => !(l.evidenceId === evidenceId && l.hypothesisId === hypothesisId));
    bus.emit('state'); this.ctx.save();
  }

  /** reorganiza o quadro em grade */
  arrange() {
    this.hypotheses.forEach((h, i) => { h.x = 20; h.y = 30 + i * 162; });
    this.ctx.session.evidences.forEach((e, n) => { e.x = 290 + (n % 4) * 236; e.y = 30 + Math.floor(n / 4) * 214; });
    this.ctx.save();
  }

  /** evidências do próprio dossiê que contradizem uma hipótese */
  contradictionsOf(hypId: string) { return this.ev.list().filter(e => e.def.contradicts?.includes(hypId)); }
  supportsOf(hypId: string) { return this.ev.list().filter(e => e.def.supports?.includes(hypId)); }
}
