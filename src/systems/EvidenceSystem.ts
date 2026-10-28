import type { EvidenceDef, EvidenceKind } from '@/types';
import { bus } from '@/game/EventBus';
import { AGENCIES } from '@/data/agencies';
import type { GameContext } from './GameContext';
import type { ReputationSystem } from './ReputationSystem';

export const KIND_LABEL: Record<EvidenceKind, string> = {
  campo: 'OBSERVAÇÃO DE CAMPO', relato: 'RELATO', rumor: 'OUVIU DIZER', dado: 'DADO PÚBLICO',
  documento: 'DOCUMENTO PÚBLICO', resposta: 'RESPOSTA DE ÓRGÃO', competencia: 'COMPETÊNCIA'
};
/** marcador visual por tipo (forma + texto, não só cor) */
export const KIND_MARK: Record<EvidenceKind, string> = {
  campo: '◉', relato: '❝', rumor: '≈', dado: '▤', documento: '▦', resposta: '↩', competencia: '⬢'
};

export const DEFAULT_REP: Record<EvidenceKind, number> = { campo: 30, relato: 25, rumor: 10, dado: 60, documento: 60, resposta: 70, competencia: 50 };

export class EvidenceSystem {
  private defs = new Map<string, EvidenceDef>();

  constructor(private ctx: GameContext, private rep: ReputationSystem) {
    for (const e of ctx.campaign.evidences) this.defs.set(e.id, e);
    for (const a of AGENCIES) this.defs.set('comp:' + a.id, {
      id: 'comp:' + a.id, kind: 'competencia', title: `${a.short} pode agir`, source: 'Portal do GDF', summary: a.scope
    });
  }

  def(id: string) { return this.defs.get(id); }
  has(id: string) { return this.ctx.session.evidences.some(e => e.id === id); }
  list() { return this.ctx.session.evidences.map(e => ({ ...e, def: this.defs.get(e.id)! })).filter(e => e.def); }
  kinds() { return new Set(this.list().map(e => e.def.kind)); }

  collect(id: string, via = 'jogo') {
    const def = this.defs.get(id);
    if (!def || this.has(id)) return false;
    const n = this.ctx.session.evidences.length;
    this.ctx.session.evidences.push({ id, at: this.ctx.clock, ts: Date.now(), x: 290 + (n % 4) * 236, y: 30 + Math.floor(n / 4) * 214 });
    this.ctx.log('evidence_collected', { evidence: id, kind: def.kind, via });
    this.rep.add(this.ctx.campaign.scoring?.[def.kind] ?? DEFAULT_REP[def.kind], `Evidência: ${KIND_LABEL[def.kind].toLowerCase()}`);
    bus.emit('evidence:new', def);

    // cruzamento de fontes
    for (const x of this.ctx.campaign.crossRefs) {
      if (x.evidences.includes(id) && x.evidences.every(e => this.has(e))) {
        this.rep.add(x.rep, 'Cruzou fontes', 'cross:' + x.id);
        this.ctx.log('cross_reference', { id: x.id });
        bus.emit('crossref', x);
      }
    }
    // contradição com a hipótese ativa
    const active = this.ctx.session.activeHypothesisId;
    if (active && def.contradicts?.includes(active)) {
      bus.emit('hypothesis:contradicted', { hypothesisId: active, evidenceId: id });
    }
    bus.emit('state');
    this.ctx.save();
    return true;
  }
}
