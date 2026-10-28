import type { ToolResult, Participation } from '@/types';
import { bus } from '@/game/EventBus';
import { normalize } from '@/services/util';
import { agencyById } from '@/data/agencies';
import type { GameContext } from './GameContext';
import type { EvidenceSystem } from './EvidenceSystem';
import type { ReputationSystem } from './ReputationSystem';
import type { MessageSystem } from './MessageSystem';

/** Ferramentas públicas dentro do jogo. Não é quiz: a ferramenta inadequada
 *  simplesmente não tem a informação procurada — e o jogador percebe jogando. */
export class PublicToolsSystem {
  constructor(private ctx: GameContext, private ev: EvidenceSystem, private rep: ReputationSystem, private msgs: MessageSystem) {}

  content(toolId: string) { return this.ctx.campaign.tools[toolId]; }

  opened(toolId: string) {
    this.ctx.log('tool_open', { tool: toolId });
    this.rep.add(5, 'Abriu uma ferramenta pública', 'open:' + toolId);
  }

  query(toolId: string, text: string): ToolResult | null {
    const q = normalize(text);
    const c = this.content(toolId);
    const s = this.ctx.session;
    s.toolsUsed.push({ tool: toolId, query: text, ts: Date.now(), at: this.ctx.clock });
    let best: ToolResult | null = null, score = 0;
    for (const r of c?.results ?? []) {
      const sc = r.keywords.reduce((a, k) => a + (q.includes(normalize(k)) ? normalize(k).length : 0), 0);
      if (sc > score) { score = sc; best = r; }
    }
    this.ctx.log('tool_query', { tool: toolId, query: text, result: best?.id ?? null });
    if (best) this.rep.add(10, 'Consultou dado público', `q:${toolId}:${best.id}`);
    bus.emit('state'); this.ctx.save();
    return best;
  }

  /** usado pelo app DF no Ponto (rastreamento) */
  liveViewed() {
    this.ctx.session.toolsUsed.push({ tool: 'dfnoponto', query: '[mapa ao vivo]', ts: Date.now(), at: this.ctx.clock });
    this.ctx.log('tool_query', { tool: 'dfnoponto', query: 'live', result: 'live' });
  }

  markAgency(id: string) {
    const s = this.ctx.session;
    if (s.agencies.includes(id)) return;
    s.agencies.push(id);
    this.ctx.log('agency_marked', { agency: id, expected: this.ctx.campaign.expectedAgencies.includes(id) });
    this.ev.collect('comp:' + id, 'portal');
    if (this.ctx.campaign.expectedAgencies.includes(id)) this.rep.add(40, 'Encontrou órgão competente', 'agency:' + id);
    bus.emit('state'); this.ctx.save();
  }
  unmarkAgency(id: string) {
    const s = this.ctx.session; s.agencies = s.agencies.filter(a => a !== id);
    this.ctx.log('agency_unmarked', { agency: id }); bus.emit('state'); this.ctx.save();
  }

  submit(p: Omit<Participation, 'protocol' | 'at' | 'ts' | 'answered'>) {
    const s = this.ctx.session;
    const protocol = `SIM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    const full: Participation = { ...p, protocol, at: this.ctx.clock, ts: Date.now(), answered: false };
    s.participations.push(full);
    this.ctx.log('participation_submitted', { channel: p.channel, type: p.type, agency: p.agency, evidences: p.evidenceIds.length, chars: p.text.length });
    this.rep.add(60, 'Acionou um canal de participação', 'part:' + p.channel + ':' + p.agency);
    if (p.evidenceIds.length) this.rep.add(25, 'Fundamentou a manifestação com evidências', 'part-ev');
    this.msgs.push('participa', 'Participa DF', `Manifestação registrada. Protocolo ${protocol} (SIMULADO). Você será avisado quando houver resposta.`, 'sistema');
    this.scheduleResponse(full);
    bus.emit('state'); this.ctx.save();
    return full;
  }

  private responseFor(p: Participation) {
    const rs = this.ctx.campaign.agencyResponses;
    return rs.find(r => r.agency === p.agency && (r.channel === p.channel || r.channel === '*'))
      ?? rs.find(r => r.agency === '*');
  }

  private scheduleResponse(full: Participation) {
    const resp = this.responseFor(full);
    const total = resp && resp.agency === '*' ? 70000 : 40000;
    const remaining = Math.max(2000, total - (Date.now() - full.ts));
    window.setTimeout(() => {
      if (full.answered) return;
      full.answered = true;
      const ag = agencyById(full.agency)?.short ?? full.agency;
      this.msgs.push('participa', `Participa DF — ${ag}`, `Resposta ao protocolo ${full.protocol}: ${resp?.text ?? 'Manifestação recebida.'}`, 'resposta');
      if (resp?.evidence) this.ev.collect(resp.evidence, 'resposta_orgao');
      bus.emit('caption', { text: `Chegou resposta de ${ag} no Participa DF.` });
      this.ctx.log('agency_response', { protocol: full.protocol, agency: full.agency });
      this.ctx.save();
    }, remaining);
  }

  /** ao retomar uma sessão, reagenda respostas pendentes */
  resumePending() { this.ctx.session.participations.filter(p => !p.answered).forEach(p => this.scheduleResponse(p)); }
}
