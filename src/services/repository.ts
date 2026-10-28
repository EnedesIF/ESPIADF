import type { Team, GameSession, TelemetryEvent, CampaignDef, CampaignId } from '@/types';

export interface MentorAction {
  id: string;
  sessionId: string;
  teamId: string;
  kind: 'pista' | 'comentario' | 'devolucao' | 'liberacao' | 'validacao';
  text: string;
  stage?: string;
  score?: number;
  ts: number;
}

/** Contrato de persistência. Implementado em modo LOCAL (navegador) e SUPABASE. */
export interface Repository {
  readonly mode: 'local' | 'supabase';
  createTeam(team: Team, password: string): Promise<Team>;
  updateTeam(team: Team): Promise<void>;
  loginTeam(login: string, password: string): Promise<Team | null>;
  loginMentor(email: string, password: string): Promise<Team[]>;
  listTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | null>;

  getSession(teamId: string, campaignId: CampaignId): Promise<GameSession | null>;
  saveSession(s: GameSession): Promise<void>;
  listSessions(): Promise<GameSession[]>;

  addMentorAction(a: MentorAction): Promise<void>;
  listMentorActions(sessionId?: string): Promise<MentorAction[]>;

  logEvents(events: TelemetryEvent[]): Promise<void>;
  listEvents(sessionId?: string): Promise<TelemetryEvent[]>;

  getCampaignOverrides(): Promise<Partial<Record<CampaignId, Partial<CampaignDef>>>>;
  saveCampaignOverrides(o: Partial<Record<CampaignId, Partial<CampaignDef>>>): Promise<void>;
}
