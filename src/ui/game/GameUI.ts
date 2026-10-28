import * as THREE from 'three';
import type { App } from '../App';
import type { GameScene } from '@/game/GameScene';
import { h, clear, svgIcon } from '../dom';
import { bus } from '@/game/EventBus';
import { settings } from '@/game/Settings';
import { roleById } from '@/data/roles';
import { KIND_LABEL, KIND_MARK } from '@/systems/EvidenceSystem';
import { parseClock } from '@/services/util';
import { openSettings } from '@/components/SettingsPanel';
import type { DialogueNode, DialogueChoice, NpcDef, PoiDef, EvidenceDef } from '@/types';
import { Phone } from './Phone';
import { Dossier } from './Dossier';
import { SolutionLab } from './SolutionLab';
import { Council } from './Council';
import { Debrief } from './Debrief';

/** Camada de interface da partida: HUD, diálogos, legendas, celular e painéis. */
export class GameUI {
  readonly root = h('div', { class: 'screen hud', style: { overflow: 'hidden' } });
  private labels = h('div', { class: 'labels', 'aria-hidden': 'true' });
  private tl = h('div', { class: 'tl' });
  private tc = h('div', { class: 'tc' });
  private tr = h('div', { class: 'tr' });
  private obj = h('div', { class: 'obj hudbox' });
  private br = h('div', { class: 'br' });
  private bl = h('div', { class: 'bl', 'aria-live': 'polite' });
  private promptEl = h('div', { class: 'passthrough', style: { position: 'absolute', inset: '0', pointerEvents: 'none' } });
  private dlg = h('div', { class: 'passthrough', style: { position: 'absolute', inset: '0', pointerEvents: 'none' } });
  private layer = h('div', { class: 'passthrough', style: { position: 'absolute', inset: '0', pointerEvents: 'none' } });
  private help = h('div', { class: 'help' });
  private unsub: (() => void)[] = [];
  private labelEls = new Map<string, HTMLElement>();
  private lastPrompt = '';
  private typer: number | null = null;
  readonly phone: Phone;
  readonly dossier: Dossier;
  private repEl!: HTMLElement; private evEl!: HTMLElement; private clockEl!: HTMLElement;
  private badge!: HTMLElement;

  constructor(readonly app: App, readonly g: GameScene) {
    this.root.append(this.labels, this.tl, this.tc, this.tr, this.obj, this.bl, this.br, this.help, this.promptEl, this.dlg, this.layer);
    this.phone = new Phone(this);
    this.dossier = new Dossier(this);
    this.buildStatic();
    this.renderAll();

    const on = (e: string, f: (p: any) => void) => this.unsub.push(bus.on(e, f));
    on('state', () => this.renderDynamic());
    on('rep', p => this.repFloat(p.delta, p.reason));
    on('caption', p => this.caption(p.text, p.warn));
    on('banner', p => this.banner(p.k, p.t, p.s, p.warn));
    on('evidence:new', (d: EvidenceDef) => this.caption(`DOSSIÊ +1 · ${KIND_MARK[d.kind]} ${KIND_LABEL[d.kind]} — ${d.title}`));
    on('hypothesis:new', d => this.caption(`Hipótese anotada no dossiê: "${d.text}"`));
    on('crossref', x => this.caption(`CRUZAMENTO DE FONTES — ${x.text}`));
    on('hypothesis:review', p => this.banner('HIPÓTESE EM REVISÃO', 'Novas evidências.', `"${p.hypothesis.text}" — abra o dossiê (J) e decida: manter ou atualizar.`, true));
    on('hypothesis:active', hy => this.caption(`Hipótese ativa: "${hy.text}"`));
    on('message', m => { this.caption(`Mensagem de ${m.from}`); this.renderDynamic(); });
    on('roletask', r => this.caption(`Tarefa de papel cumprida — ${r.name}`));
    on('phase', p => this.onPhase(p.to, p.def?.title));
    on('dialogue', p => this.renderDialogue(p));
    on('observe', (p: PoiDef) => this.renderObserve(p));
    on('riding', r => { this.root.classList.toggle('letterbox', !!r); this.renderDynamic(); });
    on('overlay', () => this.renderDynamic());
    on('controller', () => this.renderStatic());
    on('mentor', a => this.banner('PROFESSOR-MENTOR', a.kind === 'pista' ? 'Nova pista.' : a.kind === 'validacao' ? 'Missão validada.' : a.kind === 'devolucao' ? 'De volta à investigação.' : a.kind === 'liberacao' ? 'Etapa liberada.' : 'Novo comentário.', 'Veja em MENSAGENS no celular.'));

    window.addEventListener('keydown', this.onKey);
    g.onFrame = () => this.frame();

    // abertura da missão
    const s = g.ctx.session;
    if (!s.flags['intro_seen']) {
      s.flags['intro_seen'] = true;
      this.banner(`${g.ctx.clock} — QUADRA 214`, 'NOVA MISSÃO', g.ctx.campaign.briefing);
      setTimeout(() => this.caption('Siga até a Parada 214. Converse com as pessoas. Nada do que disserem vem com selo de verdade.'), 3800);
    } else if (s.phase === 'encerrada') {
      setTimeout(() => new Debrief(this).open(), 300);
    }
  }

  /* ---------- HUD ---------- */
  private buildStatic() {
    this.repEl = h('div', { class: 'v' }, '000');
    this.evEl = h('div', { class: 'v' }, '0');
    this.clockEl = h('div', { class: 'clock' });
    this.tc.append(this.clockEl);
    this.tr.append(
      h('div', { class: 'hudbox stat' }, h('div', { class: 'k' }, 'REPUTAÇÃO'), this.repEl),
      h('div', { class: 'hudbox stat', style: { minWidth: '84px' } }, h('div', { class: 'k' }, 'DOSSIÊ'), this.evEl),
      h('button', { class: 'iconbtn', 'aria-label': 'Acessibilidade e configurações', onclick: openSettings }, svgIcon('settings', 18)),
      h('button', { class: 'iconbtn', 'aria-label': 'Voltar à Central de Missões', onclick: () => this.app.showHub() }, svgIcon('close', 18)));
    this.badge = h('span', { class: 'badge hidden' });
    const btn = (icon: string, label: string, key: string, fn: () => void, badge?: HTMLElement) =>
      h('button', { class: 'hudbtn', onclick: fn, 'aria-label': `${label} (tecla ${key})` }, svgIcon(icon, 22), h('small', {}, `${label} · ${key}`), badge);
    this.br.append(
      btn('phone', 'CELULAR', 'C', () => this.phone.toggle(), this.badge),
      btn('folder', 'DOSSIÊ', 'J', () => this.dossier.open()),
      btn('map', 'MAPA', 'M', () => this.phone.open('mapa')));
    this.renderStatic();
  }

  renderStatic() {
    const c = this.g.ctx.controller;
    clear(this.tl);
    this.tl.append(
      h('div', { class: 'hudbox team' }, 'EQUIPE // ', h('b', {}, this.g.ctx.team.name.toUpperCase())),
      h('button', { class: 'hudbox ctrl', style: { border: '1px solid var(--line)', color: 'var(--text)', textAlign: 'left' }, onclick: () => this.phone.open('equipe'),
        'aria-label': 'Trocar quem está no controle' },
        h('span', { class: 'dot' }), h('span', {}, 'NO CONTROLE: ', h('b', {}, c.name)), h('span', { class: 'mono', style: { fontSize: '.62rem', color: 'var(--neon)' } }, roleById(c.role).short)));
  }

  private renderAll() { this.renderStatic(); this.renderDynamic(); }

  renderDynamic() {
    const g = this.g, s = g.ctx.session;
    this.repEl.textContent = String(s.reputation).padStart(3, '0');
    this.evEl.textContent = String(s.evidences.length);
    const unread = g.msgs.unread();
    this.badge.textContent = String(unread); this.badge.classList.toggle('hidden', !unread);

    // objetivos
    const ph = g.mission.phase;
    clear(this.obj);
    if (ph) {
      const objs = g.mission.objectives();
      this.obj.append(h('div', { class: 'ph' }, h('span', {}, `FASE // ${ph.title}`), h('span', {}, `${objs.filter(o => o.ok).length}/${objs.length}`)));
      this.obj.append(h('ul', {}, objs.map(o => h('li', { class: o.ok ? 'ok' : '' },
        h('span', { class: 'box', 'aria-hidden': 'true' }), h('span', {}, o.text, h('span', { class: 'sr-only' }, o.ok ? ' (concluído)' : ' (pendente)')),
        h('span', { class: 'pg' }, o.ok ? '' : g.mission.progress(o.done) ?? '')))));
      const firstOpen = objs.find(o => !o.ok && o.hint);
      if (firstOpen && (s.phase !== 'rotina' || s.clockMinutes > parseClock('07:20'))) this.obj.append(h('div', { class: 'hint' }, firstOpen.hint!));
      const act = g.dossier.active;
      if (act) this.obj.append(h('div', { class: 'hyp-pill' + (act.status === 'em_revisao' ? ' review' : '') },
        act.status === 'em_revisao' ? '⚠ EM REVISÃO: ' : 'HIPÓTESE ATIVA: ', h('b', {}, act.text)));
      if (s.phase === 'laboratorio') this.obj.append(h('div', { class: 'act' }, h('button', { class: 'btn sm block', onclick: () => this.openLab() }, 'Abrir Laboratório de Soluções')));
      if (s.phase === 'conselho') this.obj.append(h('div', { class: 'act' }, h('button', { class: 'btn sm block amber', onclick: () => this.openCouncil() }, 'Ir ao Conselho da Cidade')));
      if (s.phase === 'encerrada') this.obj.append(h('div', { class: 'act' }, h('button', { class: 'btn sm block ghost', onclick: () => new Debrief(this).open() }, 'Ver relatório da missão')));
    }
    // ajuda
    const rot = s.phase === 'rotina';
    this.help.textContent = `WASD/setas andar · Shift correr · arraste girar · clique/toque andar · E interagir · C celular · J dossiê${rot ? ' · segure T acelerar o tempo' : ''}`;
    this.help.classList.toggle('hidden', g.overlay !== 'none');
  }

  /* ---------- por quadro ---------- */
  private frame() {
    const g = this.g, s = g.ctx.session;
    // relógio
    const late = s.phase === 'rotina' && s.clockMinutes > parseClock('07:30');
    this.clockEl.className = 'clock' + (late ? ' late' : '');
    const sub = s.phase === 'rotina' ? (g.events.fast ? '▶▶ TEMPO ACELERADO' : 'PORTÃO FECHA ÀS 07:30') : (g.mission.phase?.title ?? '');
    if (this.clockEl.dataset.v !== g.ctx.clock + sub) {
      this.clockEl.dataset.v = g.ctx.clock + sub;
      this.clockEl.innerHTML = '';
      this.clockEl.append(g.ctx.clock, h('small', {}, sub));
    }
    // prompt de interação + oportunidade de câmera
    const f = g.focus, o = g.opportunity;
    const key = (f && g.overlay === 'none' ? f.kind + f.id : '') + '|' + (o && g.overlay === 'none' ? o.evidence : '');
    if (key !== this.lastPrompt) {
      this.lastPrompt = key; clear(this.promptEl);
      if (o && g.overlay === 'none') this.promptEl.append(h('button', { class: 'prompt', style: { bottom: f ? '172px' : '120px', borderColor: 'var(--amber)', color: 'var(--text)', pointerEvents: 'auto' },
        onclick: () => g.captureOpportunity() }, h('span', { class: 'keycap', style: { background: 'var(--amber)' } }, 'F'), svgIcon('camera', 18), o.label));
      if (f && g.overlay === 'none') this.promptEl.append(h('button', { class: 'prompt', style: { color: 'var(--text)', pointerEvents: 'auto' }, onclick: () => g.interact() },
        h('span', { class: 'keycap' }, 'E'), f.label));
    }
    // rótulos 3D
    const ppos = g.player.pos;
    const seen = new Set<string>();
    if (g.overlay === 'none' || g.overlay === 'dialogue') {
      for (const n of g.npcs) {
        const d = n.pos.distanceTo(ppos); if (d > 15) continue;
        const p = g.project(n.pos, n.def.pose === 'wheelchair' ? 1.8 : 2.25); if (!p.visible) continue;
        this.placeLabel('n:' + n.def.id, p.x, p.y, `${n.def.name}`, n.heard ? 'JÁ CONVERSOU' : n.def.label, n.heard ? 'heard' : '');
        seen.add('n:' + n.def.id);
      }
      for (const pd of g.ctx.campaign.pois) {
        const pos = { x: pd.pos[0], z: pd.pos[1] };
        const d = Math.hypot(pos.x - ppos.x, pos.z - ppos.z); if (d > 9) continue;
        const p = g.project(new THREE.Vector3(pos.x, 0, pos.z), 3.4); if (!p.visible) continue;
        const done = pd.evidence ? g.ev.has(pd.evidence) : false;
        this.placeLabel('p:' + pd.id, p.x, p.y, pd.name, done ? 'REGISTRADO' : 'OBSERVAR', 'poi');
        seen.add('p:' + pd.id);
      }
    }
    for (const [k, el] of this.labelEls) if (!seen.has(k)) { el.remove(); this.labelEls.delete(k); }
  }

  private placeLabel(id: string, x: number, y: number, name: string, sub: string, cls: string) {
    let el = this.labelEls.get(id);
    if (!el) { el = h('div', { class: 'label3d ' + cls }); this.labels.append(el); this.labelEls.set(id, el); }
    const html = `${name}<small>${sub}</small>`;
    if (el.dataset.h !== html) { el.dataset.h = html; el.innerHTML = html; el.className = 'label3d ' + cls; }
    el.style.left = x + 'px'; el.style.top = y + 'px';
  }

  /* ---------- diálogo ---------- */
  private renderDialogue(p: { npc: NpcDef; node: DialogueNode | null; choices: DialogueChoice[] } | null) {
    clear(this.dlg);
    if (this.typer) { clearInterval(this.typer); this.typer = null; }
    if (!p || !p.node) { if (this.g.overlay === 'dialogue') this.g.closeOverlay(); return; }
    const { npc, node, choices } = p;
    const txt = h('div', { class: 'txt' });
    const list = h('div', { class: 'choices' });
    const box = h('div', { class: 'dlg', role: 'dialog', 'aria-label': `Conversa com ${npc.name}`, style: { pointerEvents: 'auto' } },
      h('div', { class: 'bar' }),
      h('div', { class: 'in' },
        h('div', { class: 'who' }, h('b', {}, npc.name), h('span', { class: 'role' }, npc.label), node.tag ? h('span', { class: 'tag' }, node.tag) : null),
        txt, list));
    this.dlg.append(box);
    const showChoices = () => {
      const items = choices.length ? choices : [{ label: 'Encerrar conversa' } as DialogueChoice];
      items.forEach((c, i) => list.append(h('button', { class: 'choice' + (c.grants?.hypothesis ? ' note' : ''), onclick: () => choices.length ? this.g.dialogue.choose(i) : this.g.closeOverlay() },
        h('span', { class: 'n' }, String(i + 1)), h('span', {}, c.label))));
      (list.querySelector('button') as HTMLElement | null)?.focus({ preventScroll: true });
    };
    if (settings.typewriter && !settings.reduceMotion) {
      let i = 0; const full = node.text;
      this.typer = window.setInterval(() => {
        i += 2; txt.textContent = full.slice(0, i);
        if (i >= full.length) { clearInterval(this.typer!); this.typer = null; showChoices(); }
      }, 16);
      box.addEventListener('pointerdown', () => { if (this.typer) { clearInterval(this.typer); this.typer = null; txt.textContent = full; showChoices(); } }, { once: true });
    } else { txt.textContent = node.text; showChoices(); }
  }

  private renderObserve(p: PoiDef) {
    clear(this.dlg);
    const has = p.evidence ? this.g.ev.has(p.evidence) : true;
    const close = () => { clear(this.dlg); this.g.closeOverlay(); };
    const box = h('div', { class: 'dlg', role: 'dialog', 'aria-label': p.name, style: { pointerEvents: 'auto' } },
      h('div', { class: 'bar', style: { background: 'var(--amber)' } }),
      h('div', { class: 'in' },
        h('div', { class: 'who' }, h('b', {}, p.name), h('span', { class: 'tag', style: { color: 'var(--amber)' } }, 'OBSERVAÇÃO')),
        h('div', { class: 'txt' }, p.observation),
        h('div', { class: 'row' },
          p.evidence && !has ? h('button', { class: 'btn sm', onclick: () => { this.g.ev.collect(p.evidence!, 'camera'); close(); } }, svgIcon('camera', 16), 'Registrar com a câmera') : null,
          p.evidence && has ? h('span', { class: 'mono muted', style: { fontSize: '.72rem' } }, '✓ JÁ REGISTRADO NO DOSSIÊ') : null,
          h('button', { class: 'btn ghost sm', onclick: close }, 'Fechar'))));
    this.dlg.append(box);
    (box.querySelector('button') as HTMLElement)?.focus();
  }

  /* ---------- feedback ---------- */
  caption(text: string, warn = false) {
    if (!settings.captions) return;
    const el = h('div', { class: 'caption' + (warn ? ' warn' : '') }, h('span', { class: 't' }, this.g.ctx.clock), text);
    this.bl.append(el);
    while (this.bl.children.length > 4) this.bl.firstElementChild?.remove();
    setTimeout(() => el.remove(), 9000);
  }

  banner(k: string, t: string, s?: string, warn = false) {
    const el = h('div', { class: 'banner' + (warn ? ' warn' : ''), role: 'status' }, h('div', { class: 'k' }, k), h('div', { class: 't' }, t), s ? h('div', { class: 's' }, s) : null);
    this.layer.append(el);
    setTimeout(() => el.remove(), 3500);
  }

  private repFloat(delta: number, reason: string) {
    const el = h('div', { class: 'repfloat' + (delta < 0 ? ' neg' : '') }, `${delta > 0 ? '+' : ''}${delta}  ${reason.toUpperCase()}`);
    const n = this.layer.querySelectorAll('.repfloat').length;
    el.style.top = 70 + n * 20 + 'px';
    this.layer.append(el);
    this.repEl.classList.remove('bump'); void this.repEl.offsetWidth; this.repEl.classList.add('bump');
    setTimeout(() => el.remove(), 2300);
  }

  private onPhase(to: string, title?: string) {
    this.renderDynamic();
    if (to === 'investigacao') this.banner('NOVA FASE', 'INVESTIGAÇÃO', 'Reúna evidências, teste hipóteses, descubra quem pode agir.');
    else if (to === 'laboratorio') this.banner('ETAPA LIBERADA', 'LABORATÓRIO DE SOLUÇÕES', 'O dossiê está pronto para virar proposta.');
    else if (to === 'conselho') this.banner('PRÓXIMA ETAPA', 'CONSELHO DA CIDADE', 'Hora de defender a proposta.');
    else if (title) this.banner('FASE', title);
  }

  openLab() { if (this.g.overlay !== 'none') this.g.closeOverlay(); new SolutionLab(this).open(); }
  openCouncil() { if (this.g.overlay !== 'none') this.g.closeOverlay(); new Council(this).open(); }

  /* ---------- teclado ---------- */
  private onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    const k = e.key.toLowerCase(); const g = this.g;
    if (k === 'escape') {
      if (g.overlay === 'phone') this.phone.close();
      else if (g.overlay === 'dossier') this.dossier.close();
      else if (g.overlay === 'dialogue' || g.overlay === 'observe') { clear(this.dlg); g.closeOverlay(); }
      return;
    }
    if (g.overlay === 'dialogue' && /^[1-9]$/.test(k)) {
      const btn = this.dlg.querySelectorAll('.choice')[Number(k) - 1] as HTMLElement | undefined; btn?.click(); return;
    }
    if (g.overlay === 'none' || g.overlay === 'phone') {
      if (k === 'c') this.phone.toggle();
      if (k === 'm') this.phone.open('mapa');
    }
    if (g.overlay === 'none' || g.overlay === 'dossier') { if (k === 'j') g.overlay === 'dossier' ? this.dossier.close() : this.dossier.open(); }
  };

  dispose() {
    this.unsub.forEach(u => u());
    window.removeEventListener('keydown', this.onKey);
    if (this.typer) clearInterval(this.typer);
    this.g.onFrame = undefined;
  }
}
