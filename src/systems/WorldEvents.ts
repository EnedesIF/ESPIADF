import type { TimedEvent } from '@/types';
import { bus } from '@/game/EventBus';
import { parseClock } from '@/services/util';
import { GAME } from '@/config';
import type { GameContext } from './GameContext';

/** Relógio do jogo + eventos dinâmicos (ônibus, mensagens, chuva, legendas). */
export class WorldEvents {
  speedMul = 1;
  fast = false;
  paused = false;
  private repeats = new Map<string, number>(); // id -> próximo minuto

  constructor(private ctx: GameContext) {}

  update(dt: number) {
    const s = this.ctx.session;
    if (!this.paused) {
      const mul = this.speedMul * (this.fast ? GAME.clockFastMultiplier : 1);
      // depois da rotina, o relógio anda mais devagar (investigação sem pressa)
      const phaseMul = s.phase === 'rotina' ? 1 : 0.35;
      s.clockMinutes += (dt * GAME.clockSpeed * mul * phaseMul) / 60;
    }
    for (const ev of this.ctx.campaign.events) this.consider(ev);
  }

  private fired(id: string) { return !!this.ctx.session.flags['ev:' + id]; }

  private consider(ev: TimedEvent) {
    const s = this.ctx.session;
    if (ev.params.repeatEvery) {
      if (ev.params.untilFlag && s.flags[ev.params.untilFlag]) return;
      const next = this.repeats.get(ev.id) ?? parseClock(ev.at!);
      if (s.clockMinutes >= next) {
        this.repeats.set(ev.id, s.clockMinutes + ev.params.repeatEvery);
        this.fire(ev);
      }
      return;
    }
    if (this.fired(ev.id)) return;
    if (ev.at) {
      const t = parseClock(ev.at);
      if (s.clockMinutes >= t) {
        // eventos muito antigos (ex.: sessão retomada) não disparam ônibus atrasados
        if (ev.type === 'bus' && s.clockMinutes - t > 3) { s.flags['ev:' + ev.id] = true; return; }
        s.flags['ev:' + ev.id] = true; this.fire(ev);
      }
    } else if (ev.afterFlag) {
      const ft = this.ctx.flagTime(ev.afterFlag);
      if (ft && Date.now() - ft >= (ev.delaySec ?? 0) * 1000) { s.flags['ev:' + ev.id] = true; this.fire(ev); }
    }
  }

  private fire(ev: TimedEvent) {
    this.ctx.log('world_event', { id: ev.id, type: ev.type });
    bus.emit('world:' + ev.type, { ...ev.params, id: ev.id });
  }
}
