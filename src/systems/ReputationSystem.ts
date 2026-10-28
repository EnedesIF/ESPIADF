import { bus } from '@/game/EventBus';
import type { GameContext } from './GameContext';

/** Reputação da equipe — sobe com boas práticas de investigação, cai pouco com descuidos. */
export class ReputationSystem {
  constructor(private ctx: GameContext) {}
  add(delta: number, reason: string, key?: string) {
    const s = this.ctx.session;
    if (key) { if (s.flags['rep:' + key]) return; s.flags['rep:' + key] = true; }
    s.reputation = Math.max(0, s.reputation + delta);
    s.repLog.push({ delta, reason, ts: Date.now(), at: this.ctx.clock });
    this.ctx.log('reputation', { delta, reason });
    bus.emit('rep', { delta, reason });
    bus.emit('state');
    this.ctx.save();
  }
}
