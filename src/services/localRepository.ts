import type { Repository, MentorAction } from './repository';
import type { Team, GameSession, TelemetryEvent } from '@/types';
import { sha256 } from './util';

/** Persistência no navegador (localStorage, com fallback em memória).
 *  Serve para demonstração e uso offline. Os dados ficam só neste navegador. */
const mem = new Map<string, string>();
const K = (k: string) => 'missaodf:v1:' + k;

function read<T>(k: string, def: T): T {
  try {
    const raw = window.localStorage.getItem(K(k));
    return raw ? JSON.parse(raw) as T : def;
  } catch {
    const raw = mem.get(k); return raw ? JSON.parse(raw) as T : def;
  }
}
function write(k: string, v: unknown) {
  const raw = JSON.stringify(v);
  try { window.localStorage.setItem(K(k), raw); } catch { mem.set(k, raw); }
}

export class LocalRepository implements Repository {
  readonly mode = 'local' as const;

  async createTeam(team: Team, password: string) {
    team.passwordHash = await sha256(team.login.toUpperCase() + '::' + password);
    const teams = read<Team[]>('teams', []);
    teams.push(team); write('teams', teams);
    return team;
  }
  async updateTeam(team: Team) {
    const teams = read<Team[]>('teams', []).map(t => t.id === team.id ? team : t);
    write('teams', teams);
  }
  async loginTeam(login: string, password: string) {
    const h = await sha256(login.trim().toUpperCase() + '::' + password);
    return read<Team[]>('teams', []).find(t => t.login.toUpperCase() === login.trim().toUpperCase() && t.passwordHash === h) || null;
  }
  async loginMentor(email: string, password: string) {
    const out: Team[] = [];
    for (const t of read<Team[]>('teams', [])) {
      if (t.mentor.email.trim().toLowerCase() !== email.trim().toLowerCase()) continue;
      if (t.passwordHash === await sha256(t.login.toUpperCase() + '::' + password)) out.push(t);
    }
    return out;
  }
  async listTeams() { return read<Team[]>('teams', []); }
  async getTeam(id: string) { return read<Team[]>('teams', []).find(t => t.id === id) || null; }

  async getSession(teamId: string, campaignId: string) {
    return read<GameSession[]>('sessions', []).find(s => s.teamId === teamId && s.campaignId === campaignId) || null;
  }
  async saveSession(s: GameSession) {
    const all = read<GameSession[]>('sessions', []);
    const i = all.findIndex(x => x.id === s.id);
    s.updatedAt = Date.now();
    if (i >= 0) all[i] = s; else all.push(s);
    write('sessions', all);
  }
  async listSessions() { return read<GameSession[]>('sessions', []); }

  async logEvents(events: TelemetryEvent[]) {
    const all = read<TelemetryEvent[]>('events', []);
    all.push(...events);
    write('events', all.slice(-20000));
  }
  async listEvents(sessionId?: string) {
    const all = read<TelemetryEvent[]>('events', []);
    return sessionId ? all.filter(e => e.sessionId === sessionId) : all;
  }

  async getCampaignOverrides() { return read('overrides', {}); }
  async saveCampaignOverrides(o: object) { write('overrides', o); }

  async addMentorAction(a: MentorAction) {
    const all = read<MentorAction[]>('mentorActions', []); all.push(a); write('mentorActions', all);
  }
  async listMentorActions(sessionId?: string) {
    const all = read<MentorAction[]>('mentorActions', []);
    return sessionId ? all.filter(a => a.sessionId === sessionId) : all;
  }
}
