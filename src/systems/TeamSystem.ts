import { bus } from '@/game/EventBus';
import { ROLES, roleById } from '@/data/roles';
import type { GameContext } from './GameContext';
import type { EvidenceSystem } from './EvidenceSystem';
import type { ReputationSystem } from './ReputationSystem';

/** Papéis da equipe, revezamento de controle e tarefas complementares. */
export class TeamSystem {
  constructor(private ctx: GameContext, private ev: EvidenceSystem, private rep: ReputationSystem) {
    bus.on('state', () => this.checkTasks());
  }

  get members() { return this.ctx.team.members; }
  get controller() { return this.ctx.controller; }

  setController(id: string) {
    if (this.ctx.session.controllerId === id) return;
    this.ctx.session.controllerId = id;
    const m = this.members.find(x => x.id === id);
    this.ctx.log('controller_changed', { member: id, role: m?.role });
    bus.emit('controller', m);
    bus.emit('state'); this.ctx.save();
  }

  /** progresso de uma tarefa: [atual, meta] */
  taskProgress(roleId: string): [number, number] {
    const r = ROLES.find(x => x.id === roleId)!; const s = this.ctx.session; const t = r.task;
    let n = 0;
    if (t.check.startsWith('kind:')) { const k = t.check.slice(5); n = this.ev.list().filter(e => e.def.kind === k).length; }
    else if (t.check === 'revisions') n = s.revisions.filter(x => x.from).length;
    else if (t.check === 'talked') n = s.talkedTo.length;
    else if (t.check === 'visited') n = s.visited.length;
    else if (t.check === 'participation') n = s.participations.length;
    else if (t.check.startsWith('flag:')) n = s.flags[t.check.slice(5)] ? 1 : 0;
    return [Math.min(n, t.min), t.min];
  }

  /** papéis presentes na equipe (cada papel aparece se ao menos um integrante o tiver) */
  activeRoles() { return ROLES.filter(r => this.members.some(m => m.role === r.id)); }

  private checkTasks() {
    const s = this.ctx.session;
    for (const r of this.activeRoles()) {
      if (s.roleTasksDone.includes(r.task.id)) continue;
      const [a, b] = this.taskProgress(r.id);
      if (a >= b) {
        s.roleTasksDone.push(r.task.id);
        this.ctx.log('role_task_done', { role: r.id, task: r.task.id });
        this.rep.add(40, `Tarefa de papel cumprida: ${roleById(r.id).name}`);
        bus.emit('roletask', r);
      }
    }
  }
}
