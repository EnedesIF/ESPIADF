import type { CampaignDef, GameSession, Team, CampaignId } from '@/types';
import { bus } from '@/game/EventBus';
import { backend } from '@/services/backend';
import { fmtClock, parseClock, uid } from '@/services/util';
import { Telemetry } from './Telemetry';

/** Estado compartilhado de uma partida: sessão + campanha + equipe. */
export class GameContext {
  readonly telemetry: Telemetry;
  private saveTimer: number | null = null;

  constructor(public session: GameSession, readonly campaign: CampaignDef, public team: Team) {
    this.telemetry = new Telemetry(this);
  }

  static newSession(team: Team, campaign: CampaignDef): GameSession {
    return {
      id: uid('ses_'), teamId: team.id, campaignId: campaign.id as CampaignId, phase: campaign.phases[0]?.id ?? 'inicio',
      status: 'em_andamento', clockMinutes: parseClock(campaign.startClock), flags: {}, flagTimes: {}, reputation: 0, repLog: [],
      evidences: [], hypotheses: [], links: [], activeHypothesisId: null, revisions: [], toolsUsed: [], agencies: [],
      participations: [], talkedTo: [], visited: [], roleTasksDone: [], controllerId: team.members[0]?.id ?? null,
      unlockedStages: [], solution: null, pitch: null, mentorMessages: [], messages: [], appliedMentorActions: [], mentorScore: null, phaseTimes: {},
      startedAt: Date.now(), updatedAt: Date.now()
    };
  }

  get clock() { return fmtClock(this.session.clockMinutes); }
  get controller() { return this.team.members.find(m => m.id === this.session.controllerId) ?? this.team.members[0]; }

  flag(f: string) { return !!this.session.flags[f]; }
  setFlag(f: string, v = true) {
    if (this.session.flags[f] === v) return;
    this.session.flags[f] = v;
    if (v) this.session.flagTimes[f] = Date.now();
    this.log('flag', { flag: f, value: v });
    bus.emit('flag', f);
    bus.emit('state');
    this.save();
  }
  flagTime(f: string): number | undefined { return this.session.flagTimes?.[f]; }

  log(type: string, payload?: Record<string, unknown>) { this.telemetry.log(type, payload); }

  save(immediate = false) {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    const run = () => { this.saveTimer = null; backend().saveSession(this.session).catch(e => console.warn('save', e)); };
    if (immediate) run(); else this.saveTimer = window.setTimeout(run, 600);
  }
}
