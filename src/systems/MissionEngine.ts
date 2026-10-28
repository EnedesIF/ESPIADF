import type { Condition, PhaseDef } from '@/types';
import { bus } from '@/game/EventBus';
import type { GameContext } from './GameContext';
import type { EvidenceSystem } from './EvidenceSystem';

/** Fases e objetivos dirigidos por dados (editáveis pelo ADMIN). */
export class MissionEngine {
  private phaseStart = performance.now();

  constructor(private ctx: GameContext, private ev: EvidenceSystem) {
    bus.on('state', () => this.evaluate());
    window.setInterval(() => this.tickTime(), 5000);
  }

  get phase(): PhaseDef | undefined { return this.ctx.campaign.phases.find(p => p.id === this.ctx.session.phase); }
  phaseIndex() { return this.ctx.campaign.phases.findIndex(p => p.id === this.ctx.session.phase); }

  check(c: Condition): boolean {
    const s = this.ctx.session;
    switch (c.type) {
      case 'flag': return !!s.flags[c.flag];
      case 'evidenceCount': return s.evidences.length >= c.min;
      case 'evidenceKinds': return this.ev.kinds().size >= c.min;
      case 'hasHypothesis': return !!s.activeHypothesisId;
      case 'revised': return s.revisions.some(r => r.from);
      case 'agency': return s.agencies.length >= c.min;
      case 'participation': return s.participations.length >= c.min;
      case 'stage': return s.unlockedStages.includes(c.stage);
    }
  }

  objectives() {
    return (this.phase?.objectives ?? []).map(o => ({ ...o, ok: this.check(o.done) }));
  }

  /** progresso numérico, ex.: 3/6 evidências */
  progress(c: Condition): string | null {
    const s = this.ctx.session;
    if (c.type === 'evidenceCount') return `${Math.min(s.evidences.length, c.min)}/${c.min}`;
    if (c.type === 'evidenceKinds') return `${Math.min(this.ev.kinds().size, c.min)}/${c.min}`;
    return null;
  }

  evaluate() {
    const p = this.phase; if (!p || p.completeWhen !== 'all' || !p.next) return;
    const done = p.objectives.every(o => this.check(o.done));
    const forced = this.ctx.session.unlockedStages.includes(p.next);
    if (done || forced) this.advance(p.next);
  }

  advance(next: string) {
    const s = this.ctx.session;
    if (s.phase === next) return;
    this.tickTime();
    const prev = s.phase;
    s.phase = next;
    this.phaseStart = performance.now();
    this.ctx.log('phase_changed', { from: prev, to: next });
    bus.emit('phase', { from: prev, to: next, def: this.phase });
    this.ctx.save(true);
  }

  /** volta para investigação (mentor devolveu) */
  sendBack() { this.advance('investigacao'); }

  private tickTime() {
    const s = this.ctx.session;
    const now = performance.now();
    s.phaseTimes[s.phase] = (s.phaseTimes[s.phase] || 0) + (now - this.phaseStart);
    this.phaseStart = now;
    this.ctx.log('phase_time', { phase: s.phase, ms: Math.round(s.phaseTimes[s.phase]) });
  }
}
