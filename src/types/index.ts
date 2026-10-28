/* =====================================================================
   MISSÃO DF — Tipos centrais do domínio
   Mantidos simples e serializáveis (JSON) para persistir no Supabase.
   ===================================================================== */

export type CampaignId = 'mobility' | 'work' | 'territory' | 'health';

export type RoleId =
  | 'campo' | 'dados' | 'estrategista' | 'comunicador'
  | 'mapeador' | 'pesquisador' | 'articulador' | 'relator';

export interface AvatarConfig {
  characterGender?: 'menino' | 'menina';
  cartoonStyle?: {hair: number; outfit: number; trousers: number; accessory: 'nenhum'|'oculos'|'bone'|'fone'|'bandana'; accessories?: import('@/data/avatarCatalog').GearSelection};
  cartoonLook?: number;             // preset ilustrado, compartilhado entre estúdio e cidade
  build: 'A' | 'B' | 'C';          // apresentação corporal (não é rótulo de gênero)
  skin: number;                     // índice da paleta de tons de pele
  hair: 'curto' | 'crespo' | 'trancas' | 'coque' | 'raspado' | 'longo' | 'cacheado';
  hairColor: number;
  top: 'camiseta' | 'moletom' | 'jaqueta' | 'regata';
  topColor: number;
  bottom: 'calca' | 'bermuda' | 'saia';
  bottomColor: number;
  shoeColor: number;
  backpack: boolean;
  backpackColor: number;
  accessory: 'nenhum' | 'fone' | 'bone' | 'oculos' | 'bandana';
}

export interface Mentor {
  name: string;
  email: string;
  phone: string;
  school: string;
  area: string;
}

export interface Member {
  avatarName?: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  turma: string;
  role: RoleId;
  missionRole?: import("@/data/cityCooperation").TeamRole;
  avatar: AvatarConfig;
}

export interface Team {
  id: string;
  name: string;
  school: string;
  ra: string;          // Região Administrativa
  turma: string;
  mentor: Mentor;
  members: Member[];
  login: string;
  passwordHash: string;
  createdAt: string;
}

/* ---------- Investigação ---------- */

export type EvidenceKind =
  | 'campo'        // observação de campo / câmera
  | 'relato'       // relato pessoal de alguém
  | 'rumor'        // "ouvi dizer"
  | 'dado'         // dado oficial (sempre SIMULADO nesta versão)
  | 'documento'    // documento público (SIMULADO)
  | 'resposta'     // resposta de órgão (SIMULADA)
  | 'competencia'; // quem pode agir

export interface EvidenceDef {
  id: string;
  kind: EvidenceKind;
  title: string;
  summary: string;
  source: string;
  simulated?: boolean;
  supports?: string[];     // ids de hipóteses (oculto ao jogador)
  contradicts?: string[];  // ids de hipóteses (oculto ao jogador)
}

export interface CollectedEvidence {
  id: string;
  at: string;               // horário no jogo
  ts: number;               // timestamp real
  x?: number; y?: number;   // posição no quadro do dossiê
}

export type HypothesisStatus = 'candidata' | 'ativa' | 'em_revisao' | 'descartada' | 'sustentada';

export interface HypothesisDef {
  id: string;
  text: string;
}

export interface HypothesisState {
  id: string;
  text: string;
  origin: 'npc' | 'jogador' | 'descoberta';
  status: HypothesisStatus;
  x?: number; y?: number;
}

export interface EvidenceLink {
  evidenceId: string;
  hypothesisId: string;
  relation: 'apoia' | 'contradiz';
}

export interface HypothesisRevision {
  from: string | null;
  to: string;
  at: string;
  ts: number;
  trigger: string | null;   // evidência que motivou a revisão
}

export interface Participation {
  protocol: string;
  channel: 'ouvidoria' | 'lai';
  type: string;
  agency: string;
  text: string;
  evidenceIds: string[];
  at: string;
  ts: number;
  answered: boolean;
}

export interface SolutionDraft {
  problem: string;
  evidenceIds: string[];
  causeHypothesisId: string | null;
  affected: string[];
  agencies: string[];
  proposal: string;
  proposalTags: string[];
  feasibility: { custo: number; prazo: number; complexidade: number };
  impact: { alcance: number; texto: string };
  participationProtocols: string[];
  participationIdeas: string[];
}

export type SessionStatus = 'em_andamento' | 'aguardando_mentor' | 'devolvida' | 'validada';

export interface MentorMessage {
  id: string;
  kind: 'pista' | 'comentario' | 'devolucao' | 'liberacao' | 'validacao';
  text: string;
  ts: number;
  read: boolean;
}

export interface ChatMessage { id: string; thread: string; from: string; text: string; at: string; ts: number; read: boolean; kind?: string }

export interface RepEntry { delta: number; reason: string; ts: number; at: string }

export interface GameSession {
  id: string;
  teamId: string;
  campaignId: CampaignId;
  phase: string;
  status: SessionStatus;
  clockMinutes: number;
  flags: Record<string, boolean>;
  flagTimes: Record<string, number>;   // quando cada flag foi ativada (ms reais)
  reputation: number;
  repLog: RepEntry[];
  evidences: CollectedEvidence[];
  hypotheses: HypothesisState[];
  links: EvidenceLink[];
  activeHypothesisId: string | null;
  revisions: HypothesisRevision[];
  toolsUsed: { tool: string; query: string; ts: number; at: string }[];
  agencies: string[];
  participations: Participation[];
  talkedTo: string[];
  visited: string[];
  roleTasksDone: string[];
  controllerId: string | null;
  unlockedStages: string[];
  solution: SolutionDraft | null;
  pitch: { startedAt: number; endedAt: number; durationSec: number; slidesSeen: number } | null;
  mentorMessages: MentorMessage[];
  messages: ChatMessage[];
  appliedMentorActions: string[];
  mentorScore: number | null;
  phaseTimes: Record<string, number>;   // ms acumulados por fase
  startedAt: number;
  updatedAt: number;
}

export interface TelemetryEvent {
  sessionId: string;
  teamId: string;
  memberId: string | null;
  type: string;
  phase: string;
  gameTime: string;
  ts: number;
  payload?: Record<string, unknown>;
}

/* ---------- Conteúdo de campanha (editável pelo ADMIN) ---------- */

export interface DialogueChoice {
  label: string;
  next?: string;              // id do próximo nó; ausente = encerra
  grants?: Grants;
  requiresFlag?: string;
  hideIfFlag?: string;
}

export interface Grants {
  evidence?: string;
  hypothesis?: string;
  flag?: string;
  rep?: number;
  repReason?: string;
}

export interface DialogueNode {
  text: string;
  tag?: string;               // ex.: "OUVIU DIZER", "RELATO" — natureza da fala, nunca certo/errado
  grants?: Grants;
  choices?: DialogueChoice[];
}

export interface NpcDef {
  uniform?: 'vigilancia' | 'mobilidade' | 'educacao' | 'gestao';
  id: string;
  name: string;
  label: string;              // ex.: "2º ANO", "MORADORA"
  pos: [number, number];
  facing?: number;
  pose?: 'stand' | 'phone' | 'wheelchair' | 'work' | 'sit';
  look: Partial<AvatarConfig>;
  start: string;
  nodes: Record<string, DialogueNode>;
  zone?: string;
}

export interface PoiDef {
  id: string;
  name: string;
  pos: [number, number];
  radius: number;
  prompt: string;
  observation: string;
  evidence?: string;          // registrar com a câmera
  flag?: string;
}

export type Condition =
  | { type: 'flag'; flag: string }
  | { type: 'evidenceCount'; min: number }
  | { type: 'evidenceKinds'; min: number }
  | { type: 'hasHypothesis' }
  | { type: 'revised' }
  | { type: 'agency'; min: number }
  | { type: 'participation'; min: number }
  | { type: 'stage'; stage: string };

export interface ObjectiveDef {
  id: string;
  text: string;
  done: Condition;
  hint?: string;
}

export interface PhaseDef {
  id: string;
  title: string;
  objectives: ObjectiveDef[];
  next?: string;
  completeWhen: 'all' | 'manual';
}

export interface TimedEvent {
  id: string;
  at?: string;                    // horário do jogo "HH:MM"
  afterFlag?: string;             // ou: X segundos reais após uma flag
  delaySec?: number;
  type: 'bus' | 'message' | 'rain' | 'caption' | 'flag';
  params: Record<string, any>;
}

export interface CrossRef {
  id: string;
  evidences: string[];
  text: string;
  rep: number;
}

export interface ToolResult {
  id: string;
  keywords: string[];
  title: string;
  blocks: ToolBlock[];
  evidence?: string;
}

export type ToolBlock =
  | { t: 'text'; v: string }
  | { t: 'table'; head: string[]; rows: (string | number)[][] }
  | { t: 'bars'; label: string; items: { k: string; v: number }[]; unit?: string }
  | { t: 'note'; v: string };

export interface CampaignToolContent {
  suggestions: string[];
  results: ToolResult[];
  emptyText: string;
}

export interface AgencyDef {
  id: string;
  name: string;
  short: string;
  scope: string;              // descrição resumida de competência (validar com a CGDF)
  url?: string;
}

export interface CampaignDef {
  id: CampaignId;
  number: string;
  axis: string;
  title: string;
  pitch: string;
  available: boolean;
  briefing: string;
  startClock: string;
  phases: PhaseDef[];
  npcs: NpcDef[];
  pois: PoiDef[];
  evidences: EvidenceDef[];
  hypotheses: HypothesisDef[];
  events: TimedEvent[];
  crossRefs: CrossRef[];
  tools: Record<string, CampaignToolContent>;
  agencyResponses: { agency: string; channel: 'ouvidoria' | 'lai' | '*'; evidence?: string; text: string }[];
  expectedAgencies: string[];
  bestCause: string[];
  /** pontos de reputação por tipo de evidência (opcional — ADMIN) */
  scoring?: Partial<Record<EvidenceKind, number>>;
}
