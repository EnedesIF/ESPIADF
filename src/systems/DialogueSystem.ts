import type { DialogueChoice, DialogueNode, Grants, NpcDef } from '@/types';
import { bus } from '@/game/EventBus';
import type { GameContext } from './GameContext';
import type { EvidenceSystem } from './EvidenceSystem';
import type { DossierSystem } from './DossierSystem';
import type { ReputationSystem } from './ReputationSystem';

/** Diálogos em grafo. Nenhum nó diz "certo/errado": cada fala tem natureza (relato, percepção, ouvi dizer, pista). */
export class DialogueSystem {
  npc: NpcDef | null = null;
  node: DialogueNode | null = null;
  nodeId = '';

  constructor(private ctx: GameContext, private ev: EvidenceSystem, private dossier: DossierSystem, private rep: ReputationSystem) {}

  start(npc: NpcDef) {
    this.npc = npc;
    const s = this.ctx.session;
    if (!s.talkedTo.includes(npc.id)) s.talkedTo.push(npc.id);
    this.ctx.log('dialogue_start', { npc: npc.id });
    this.goto(npc.start);
  }

  private goto(id: string) {
    if (!this.npc) return;
    this.nodeId = id;
    this.node = this.npc.nodes[id] ?? null;
    if (this.node?.grants) this.apply(this.node.grants);
    bus.emit('dialogue', { npc: this.npc, node: this.node, choices: this.choices() });
  }

  choices(): DialogueChoice[] {
    if (!this.node?.choices) return [];
    return this.node.choices.filter(c =>
      (!c.requiresFlag || this.ctx.flag(c.requiresFlag)) &&
      (!c.hideIfFlag || !this.ctx.flag(c.hideIfFlag)) &&
      (!c.grants?.hypothesis || !this.dossier.get(c.grants.hypothesis)));
  }

  choose(i: number) {
    const c = this.choices()[i];
    if (!c || !this.npc) return this.end();
    this.ctx.log('dialogue_choice', { npc: this.npc.id, node: this.nodeId, choice: c.label });
    if (c.grants) this.apply(c.grants);
    if (c.next) this.goto(c.next); else this.end();
  }

  end() {
    if (this.npc) this.ctx.log('dialogue_end', { npc: this.npc.id });
    this.npc = null; this.node = null;
    bus.emit('dialogue', null);
    bus.emit('state');
  }

  private apply(g: Grants) {
    if (g.evidence) this.ev.collect(g.evidence, 'dialogo');
    if (g.hypothesis) this.dossier.addCandidate(g.hypothesis, 'npc');
    if (g.flag) this.ctx.setFlag(g.flag);
    if (g.rep) this.rep.add(g.rep, g.repReason ?? 'Conversa');
  }
}
