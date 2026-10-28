import type { SupabaseClient } from '@supabase/supabase-js';
import type { Repository, MentorAction } from './repository';
import type { Team, GameSession, TelemetryEvent } from '@/types';
import { sha256 } from './util';

/** Persistência no Supabase (PostgreSQL). Tabelas em /supabase/schema.sql.
 *
 *  Autenticação adotada:
 *   - MENTOR: Supabase Auth (e-mail + senha). O mentor cria a equipe autenticado.
 *   - EQUIPE: login da equipe + senha, validados pela função RPC `team_login`
 *     (security definer), que devolve a equipe sem expor hashes.
 *  ATENÇÃO: implementação pronta para conexão, mas ainda não validada contra uma
 *  instância real — testar políticas RLS antes de produção. */
export class SupabaseRepository implements Repository {
  readonly mode = 'supabase' as const;
  constructor(private sb: SupabaseClient) {}

  private toRow(t: Team) {
    return { id: t.id, name: t.name, school: t.school, ra: t.ra, turma: t.turma, mentor: t.mentor,
      members: t.members, login: t.login, password_hash: t.passwordHash, created_at: t.createdAt };
  }
  private fromRow(r: any): Team {
    return { id: r.id, name: r.name, school: r.school, ra: r.ra, turma: r.turma, mentor: r.mentor,
      members: r.members, login: r.login, passwordHash: r.password_hash ?? '', createdAt: r.created_at };
  }

  async createTeam(team: Team, password: string) {
    // cria (ou entra com) a conta do mentor no Supabase Auth
    const { error: signErr } = await this.sb.auth.signUp({ email: team.mentor.email, password });
    if (signErr && !/registered/i.test(signErr.message)) throw signErr;
    await this.sb.auth.signInWithPassword({ email: team.mentor.email, password }).catch(() => undefined);
    team.passwordHash = await sha256(team.login.toUpperCase() + '::' + password);
    const { error } = await this.sb.from('teams').insert(this.toRow(team));
    if (error) throw error;
    return team;
  }
  async updateTeam(team: Team) {
    const { error } = await this.sb.from('teams').update(this.toRow(team)).eq('id', team.id);
    if (error) throw error;
  }
  async loginTeam(login: string, password: string) {
    const hash = await sha256(login.trim().toUpperCase() + '::' + password);
    const { data, error } = await this.sb.rpc('team_login', { p_login: login.trim().toUpperCase(), p_hash: hash });
    if (error || !data) return null;
    return this.fromRow(Array.isArray(data) ? data[0] : data);
  }
  async loginMentor(email: string, password: string) {
    const { error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) return [];
    return this.listTeams();
  }
  async listTeams() {
    const { data } = await this.sb.from('teams').select('*').order('created_at', { ascending: false });
    return (data || []).map(r => this.fromRow(r));
  }
  async getTeam(id: string) {
    const { data } = await this.sb.from('teams').select('*').eq('id', id).maybeSingle();
    return data ? this.fromRow(data) : null;
  }

  async getSession(teamId: string, campaignId: string) {
    const { data } = await this.sb.from('game_sessions').select('state').eq('team_id', teamId).eq('campaign_id', campaignId).maybeSingle();
    return (data?.state as GameSession) || null;
  }
  async saveSession(s: GameSession) {
    s.updatedAt = Date.now();
    await this.sb.from('game_sessions').upsert({
      id: s.id, team_id: s.teamId, campaign_id: s.campaignId, phase: s.phase, status: s.status,
      reputation: s.reputation, state: s, updated_at: new Date(s.updatedAt).toISOString()
    });
  }
  async listSessions() {
    const { data } = await this.sb.from('game_sessions').select('state');
    return (data || []).map(r => r.state as GameSession);
  }

  async addMentorAction(a: MentorAction) {
    await this.sb.from('mentor_actions').insert({ id: a.id, session_id: a.sessionId, team_id: a.teamId, kind: a.kind,
      text: a.text, stage: a.stage ?? null, score: a.score ?? null, created_at: new Date(a.ts).toISOString() });
  }
  async listMentorActions(sessionId?: string) {
    let q = this.sb.from('mentor_actions').select('*').order('created_at');
    if (sessionId) q = q.eq('session_id', sessionId);
    const { data } = await q;
    return (data || []).map((r: any) => ({ id: r.id, sessionId: r.session_id, teamId: r.team_id, kind: r.kind, text: r.text,
      stage: r.stage ?? undefined, score: r.score ?? undefined, ts: Date.parse(r.created_at) }));
  }

  async logEvents(events: TelemetryEvent[]) {
    if (!events.length) return;
    await this.sb.from('telemetry_events').insert(events.map(e => ({
      session_id: e.sessionId, team_id: e.teamId, member_id: e.memberId, type: e.type, phase: e.phase,
      game_time: e.gameTime, created_at: new Date(e.ts).toISOString(), payload: e.payload ?? {}
    })));
  }
  async listEvents(sessionId?: string) {
    let q = this.sb.from('telemetry_events').select('*').order('created_at').limit(20000);
    if (sessionId) q = q.eq('session_id', sessionId);
    const { data } = await q;
    return (data || []).map((r: any) => ({ sessionId: r.session_id, teamId: r.team_id, memberId: r.member_id, type: r.type,
      phase: r.phase, gameTime: r.game_time, ts: Date.parse(r.created_at), payload: r.payload }));
  }

  async getCampaignOverrides() {
    const { data } = await this.sb.from('campaign_overrides').select('campaign_id, data');
    const o: Record<string, unknown> = {};
    for (const r of data || []) o[r.campaign_id] = r.data;
    return o;
  }
  async saveCampaignOverrides(o: Record<string, unknown>) {
    const rows = Object.entries(o).map(([campaign_id, data]) => ({ campaign_id, data, updated_at: new Date().toISOString() }));
    if (rows.length) await this.sb.from('campaign_overrides').upsert(rows);
  }
}
