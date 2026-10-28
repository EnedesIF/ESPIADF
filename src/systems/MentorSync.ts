import { bus } from '@/game/EventBus';
import { backend } from '@/services/backend';
import type { GameContext } from './GameContext';
import type { MessageSystem } from './MessageSystem';
import type { MissionEngine } from './MissionEngine';
import type { ReputationSystem } from './ReputationSystem';

/** Recebe as ações do professor-mentor (pista, comentário, liberar etapa, devolver, validar). */
export class MentorSync {
  private timer: number;
  constructor(private ctx: GameContext, private msgs: MessageSystem, private mission: MissionEngine, private rep: ReputationSystem) {
    this.timer = window.setInterval(() => this.poll(), 5000);
    window.addEventListener('storage', this.onStorage);
    this.poll();
  }
  private onStorage = (e: StorageEvent) => { if (e.key?.includes('mentorActions')) this.poll(); };

  async poll() {
    const s = this.ctx.session;
    const actions = await backend().listMentorActions(s.id).catch(() => []);
    const mentor = this.ctx.team.mentor.name.split(' ')[0] || 'Mentor';
    for (const a of actions) {
      if (s.appliedMentorActions.includes(a.id)) continue;
      s.appliedMentorActions.push(a.id);
      s.mentorMessages.push({ id: a.id, kind: a.kind, text: a.text, ts: a.ts, read: false });
      const from = `Mentor(a) ${mentor}`;
      if (a.kind === 'pista') this.msgs.push('mentor', from, 'PISTA: ' + a.text, 'pista');
      if (a.kind === 'comentario') this.msgs.push('mentor', from, a.text, 'comentario');
      if (a.kind === 'liberacao' && a.stage) {
        if (!s.unlockedStages.includes(a.stage)) s.unlockedStages.push(a.stage);
        this.msgs.push('mentor', from, `Etapa liberada: ${a.stage.toUpperCase()}. ${a.text}`.trim(), 'liberacao');
        const phases = this.ctx.campaign.phases.map(p => p.id);
        if (phases.indexOf(a.stage) > phases.indexOf(s.phase)) this.mission.advance(a.stage);
      }
      if (a.kind === 'devolucao') {
        s.status = 'devolvida';
        s.flags['solution_ready'] = false; s.flags['pitch_done'] = false;
        this.msgs.push('mentor', from, 'A missão voltou para investigação. ' + a.text, 'devolucao');
        this.mission.sendBack();
      }
      if (a.kind === 'validacao') {
        s.status = 'validada'; s.mentorScore = a.score ?? null;
        this.msgs.push('mentor', from, 'MISSÃO VALIDADA. ' + a.text, 'validacao');
        this.rep.add(100, 'Missão validada pelo mentor', 'validated');
      }
      bus.emit('mentor', a);
      this.ctx.log('mentor_action_received', { kind: a.kind });
    }
    if (actions.length) this.ctx.save();
  }

  dispose() { clearInterval(this.timer); window.removeEventListener('storage', this.onStorage); }
}
