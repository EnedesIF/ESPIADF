import { bus } from '@/game/EventBus';
import type { GameContext } from './GameContext';

import type { ChatMessage as Message } from '@/types';
export type { Message };

/** Mensagens do celular (NPCs, grupos, central, mentor, respostas de órgãos). */
export class MessageSystem {
  constructor(private ctx: GameContext) {
    bus.on('world:message', p => this.push(p.thread, p.from, p.text));
  }
  get all(): Message[] {
    if (!this.ctx.session.messages) this.ctx.session.messages = [];
    return this.ctx.session.messages;
  }
  unread() { return this.all.filter(m => !m.read).length; }
  push(thread: string, from: string, text: string, kind?: string) {
    const m: Message = { id: Math.random().toString(36).slice(2), thread, from, text, at: this.ctx.clock, ts: Date.now(), read: false, kind };
    this.all.push(m);
    this.ctx.log('message_received', { thread, kind });
    bus.emit('message', m);
    bus.emit('state');
    this.ctx.save();
  }
  markAllRead() { this.all.forEach(m => m.read = true); bus.emit('state'); }
}
