import type { TelemetryEvent } from '@/types';
import type { GameContext } from './GameContext';
import { backend } from '@/services/backend';
import { GAME } from '@/config';

/** Registro de eventos para pesquisa (escolhas, trajetos, fontes, tempos, hipóteses).
 *  Usa apenas IDs pseudônimos de equipe/integrante — sem nome nos eventos. */
export class Telemetry {
  private buf: TelemetryEvent[] = [];
  private timer: number;
  private lastSample = 0;

  constructor(private ctx: GameContext) {
    this.timer = window.setInterval(() => this.flush(), GAME.flushSec * 1000);
    window.addEventListener('beforeunload', () => this.flush());
  }

  log(type: string, payload?: Record<string, unknown>) {
    const s = this.ctx.session;
    this.buf.push({ sessionId: s.id, teamId: s.teamId, memberId: s.controllerId, type, phase: s.phase,
      gameTime: this.ctx.clock, ts: Date.now(), payload });
  }

  samplePosition(x: number, z: number) {
    const now = performance.now();
    if (now - this.lastSample < GAME.telemetrySampleSec * 1000) return;
    this.lastSample = now;
    this.log('pos', { x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10 });
  }

  flush() {
    if (!this.buf.length) return;
    const out = this.buf; this.buf = [];
    backend().logEvents(out).catch(() => { this.buf.unshift(...out); });
  }

  dispose() { this.flush(); clearInterval(this.timer); }
}
