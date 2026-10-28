import * as THREE from 'three';
import type { Engine } from './Engine';
import { CameraRig } from './CameraRig';
import { Input } from './Input';
import { bus } from './EventBus';
import { settings } from './Settings';
import type { CityWorld } from '@/worlds/CityWorld';
import { BUS_ROUTE, BUS_STOP_IDX, DETOUR_IDX, CAR_ROUTE_WEST, FAST_TRAVEL, L } from '@/worlds/layout';
import { Player } from '@/entities/Player';
import { NPC } from '@/entities/NPC';
import { Bus, RouteFollower, Traffic } from '@/entities/Vehicle';
import { GameContext } from '@/systems/GameContext';
import { ReputationSystem } from '@/systems/ReputationSystem';
import { EvidenceSystem } from '@/systems/EvidenceSystem';
import { DossierSystem } from '@/systems/DossierSystem';
import { DialogueSystem } from '@/systems/DialogueSystem';
import { PublicToolsSystem } from '@/systems/PublicToolsSystem';
import { MessageSystem } from '@/systems/MessageSystem';
import { MissionEngine } from '@/systems/MissionEngine';
import { WorldEvents } from '@/systems/WorldEvents';
import { TeamSystem } from '@/systems/TeamSystem';
import { MentorSync } from '@/systems/MentorSync';
import { GAME } from '@/config';
import { parseClock } from '@/services/util';
import type { PoiDef } from '@/types';

export type Overlay = 'none' | 'dialogue' | 'observe' | 'phone' | 'dossier' | 'lab' | 'council' | 'debrief' | 'settings';

export interface Interactable { kind: 'npc' | 'poi' | 'bus'; id: string; label: string; pos: THREE.Vector3; radius: number; ref: any }
export interface Opportunity { evidence: string; label: string; until: number }

/** Orquestra mundo 3D + entidades + sistemas de uma partida. */
export class GameScene {
  readonly rig: CameraRig;
  readonly input: Input;
  readonly player: Player;
  readonly npcs: NPC[] = [];
  readonly buses: Bus[] = [];
  readonly route = new RouteFollower(BUS_ROUTE);
  private traffic: Traffic;
  private ray = new THREE.Raycaster();
  private ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private unsub: (() => void)[] = [];
  private stopUpdate: () => void;
  private riding: Bus | null = null;
  private lastFullPass = 0;
  private npcColliderStart: number;
  private baseCount: number;

  // sistemas
  readonly rep: ReputationSystem; readonly ev: EvidenceSystem; readonly dossier: DossierSystem;
  readonly dialogue: DialogueSystem; readonly tools: PublicToolsSystem; readonly msgs: MessageSystem;
  readonly mission: MissionEngine; readonly events: WorldEvents; readonly team: TeamSystem; readonly mentor: MentorSync;

  overlay: Overlay = 'none';
  focus: Interactable | null = null;
  opportunity: Opportunity | null = null;
  onFrame?: () => void;

  constructor(readonly engine: Engine, readonly world: CityWorld, readonly ctx: GameContext) {
    this.rig = new CameraRig(engine.camera);
    this.input = new Input(engine.canvas);
    this.input.onDrag = (dx, dy) => this.rig.rotate(dx, dy);
    this.input.onWheel = d => this.rig.zoom(d);

    // sistemas
    this.rep = new ReputationSystem(ctx);
    this.ev = new EvidenceSystem(ctx, this.rep);
    this.dossier = new DossierSystem(ctx, this.rep, this.ev);
    this.dialogue = new DialogueSystem(ctx, this.ev, this.dossier, this.rep);
    this.msgs = new MessageSystem(ctx);
    this.tools = new PublicToolsSystem(ctx, this.ev, this.rep, this.msgs);
    this.mission = new MissionEngine(ctx, this.ev);
    this.events = new WorldEvents(ctx);
    this.team = new TeamSystem(ctx, this.ev, this.rep);
    this.mentor = new MentorSync(ctx, this.msgs, this.mission, this.rep);
    this.tools.resumePending();

    // entidades
    const scene = world.scene;
    this.baseCount = scene.children.length;
    world.setTimeOfDay(ctx.session.phase === 'rotina' && ctx.session.clockMinutes < parseClock('07:05') ? 'dawn' : 'morning');
    this.player = new Player(ctx.controller.avatar, world, scene);
    const arrived = ctx.flag('arrived_school');
    const start = arrived ? FAST_TRAVEL.find(f => f.id === 'ced')!.pos : L.spawn;
    this.player.teleport(start[0], start[1]);
    this.player.heading = Math.PI;
    this.npcColliderStart = world.colliders.length;
    for (const d of ctx.campaign.npcs) {
      const n = new NPC(d, scene); n.heard = ctx.session.talkedTo.includes(d.id);
      this.npcs.push(n);
      world.colliders.push({ minX: d.pos[0] - 0.35, maxX: d.pos[0] + 0.35, minZ: d.pos[1] - 0.35, maxZ: d.pos[1] + 0.35 });
    }
    this.traffic = new Traffic([new RouteFollower(CAR_ROUTE_WEST)], scene, (r, s) => {
      const p = r.at(s); return p.z < -9 || (p.x > -22 && p.x < 42);
    });

    this.rig.target.copy(this.player.pos);
    this.rig.yaw = arrived ? Math.PI * 0.95 : -2.38; this.rig.pitch = 0.5; this.rig.distance = 13;
    this.rig.snap();

    // eventos do mundo
    this.unsub.push(
      bus.on('world:bus', p => this.spawnBus(p)),
      bus.on('world:rain', p => { world.setRain(!!p.on); if (p.caption) bus.emit('caption', { text: p.caption }); }),
      bus.on('world:caption', p => bus.emit('caption', { text: p.text })),
      bus.on('controller', m => m && this.player.setAvatar(m.avatar)),
      bus.on('flag', f => { if (f === 'arrived_school') world.setTimeOfDay('morning'); })
    );

    this.stopUpdate = engine.add((dt, t) => this.update(dt, t));
    engine.setScene(scene);
    ctx.log('session_resume', { phase: ctx.session.phase });
  }

  /* ---------------- ônibus ---------------- */
  private spawnBus(p: { full: boolean; stops: boolean; convoy?: boolean; id: string }) {
    // evita empilhar ônibus repetidos que ainda não passaram pela parada
    if (!p.convoy && this.buses.some(x => x.s < this.route.distAt(BUS_STOP_IDX.parada214) + 5 && x.state !== 'done')) return;
    // em comboio, o segundo ônibus nasce logo atrás do primeiro
    const b = new Bus(this.route, {
      id: p.id, full: p.full, stops: p.stops,
      stopAt: [this.route.distAt(BUS_STOP_IDX.parada214), this.route.distAt(BUS_STOP_IDX.paradaCed)],
      slowFrom: this.route.distAt(DETOUR_IDX[0]), slowTo: this.route.distAt(DETOUR_IDX[1])
    }, this.world.scene);
    if (p.convoy) {
      const ahead = this.buses.filter(x => x.state !== 'done').map(x => x.s);
      const min = ahead.length ? Math.min(...ahead) : 60;
      b.s = Math.max(0, Math.min(min - 18, 60));
    } else b.s = 40;
    b.holdForPlayer = false;
    this.buses.push(b);
    this.ctx.log('bus_spawned', { id: p.id, full: p.full, stops: p.stops });
  }

  private boardBus(b: Bus) {
    this.riding = b; b.riding = true; b.holdForPlayer = false; b.dwell = 1.2;
    this.player.hidden = true;
    this.events.speedMul = 3;
    this.ctx.log('bus_boarded', { bus: b.opt.id, clock: this.ctx.clock });
    bus.emit('caption', { text: 'Você embarcou no 0.214. O ônibus entra numa rua estreita, fora do caminho de sempre…' });
    bus.emit('riding', true);
  }

  private alight() {
    const b = this.riding!; this.riding = null; b.riding = false;
    this.player.hidden = false;
    this.player.teleport(L.paradaCed[0] - 2, L.paradaCed[1] - 2.5);
    this.player.heading = Math.PI;
    this.rig.mode = 'follow'; this.rig.target.copy(this.player.pos); this.rig.snap();
    this.events.speedMul = 1;
    bus.emit('riding', false);
    const late = this.ctx.session.clockMinutes > parseClock('07:30');
    this.ctx.log('bus_alighted', { clock: this.ctx.clock, late });
    if (late) {
      this.ev.collect('e_atraso', 'experiencia');
      bus.emit('banner', { k: `${this.ctx.clock} — CENTRO DE ENSINO`, t: 'ATRASADO.', s: 'O portão fechou às 07:30. Agora você sabe como é.', warn: true });
    } else {
      bus.emit('banner', { k: `${this.ctx.clock} — CENTRO DE ENSINO`, t: 'NO LIMITE.', s: 'Desta vez deu. Mas por quê tantos atrasam?' });
    }
    this.ctx.setFlag('arrived_school');
    if (!this.ctx.session.visited.includes('ced')) this.ctx.session.visited.push('ced');
  }

  /* ---------------- deslocamento rápido ---------------- */
  canFastTravel() { return this.ctx.flag('arrived_school') && !this.riding; }
  fastTravel(id: string) {
    const f = FAST_TRAVEL.find(x => x.id === id); if (!f || !this.canFastTravel()) return;
    this.player.teleport(f.pos[0], f.pos[1]);
    this.rig.target.copy(this.player.pos); this.rig.snap();
    this.ctx.log('fast_travel', { to: id });
  }

  /* ---------------- interação ---------------- */
  private interactables(): Interactable[] {
    const out: Interactable[] = [];
    for (const n of this.npcs) out.push({ kind: 'npc', id: n.def.id, label: `Conversar com ${n.def.name}`, pos: n.pos, radius: GAME.interactRadius, ref: n });
    for (const p of this.ctx.campaign.pois) out.push({ kind: 'poi', id: p.id, label: p.prompt, pos: new THREE.Vector3(p.pos[0], 0, p.pos[1]), radius: p.radius, ref: p });
    for (const b of this.buses) {
      if (b.stoppedAtStop === this.route.distAt(BUS_STOP_IDX.parada214) && !b.opt.full && !this.ctx.flag('arrived_school'))
        out.push({ kind: 'bus', id: b.opt.id, label: 'Embarcar no 0.214', pos: b.doorPos(), radius: 5.5, ref: b });
    }
    return out;
  }

  interact() {
    const f = this.focus; if (!f || this.overlay !== 'none') return;
    if (f.kind === 'npc') {
      const n = f.ref as NPC; n.talking = true; n.heard = true;
      this.overlay = 'dialogue';
      this.dialogue.start(n.def);
    } else if (f.kind === 'poi') {
      const p = f.ref as PoiDef;
      this.overlay = 'observe';
      this.ctx.log('poi_observed', { poi: p.id });
      if (p.flag) this.ctx.setFlag(p.flag);
      bus.emit('observe', p);
    } else if (f.kind === 'bus') {
      this.boardBus(f.ref as Bus);
    }
  }

  captureOpportunity() {
    if (!this.opportunity) return;
    this.ev.collect(this.opportunity.evidence, 'camera_momento');
    bus.emit('caption', { text: 'Registrado com a câmera.' });
    this.opportunity = null;
  }

  closeOverlay() {
    const was = this.overlay;
    this.overlay = 'none';
    if (was === 'dialogue' && this.dialogue.npc) this.dialogue.end();
    this.npcs.forEach(n => n.talking = false);
    bus.emit('overlay', 'none');
  }
  open(o: Overlay) { this.overlay = o; bus.emit('overlay', o); }

  /* ---------------- laço ---------------- */
  private update(dt: number, t: number) {
    const s = this.ctx.session;
    const blocked = this.overlay !== 'none' || !!this.riding;
    this.input.enabled = !blocked;
    this.events.fast = !blocked && this.input.keys.has('t') && s.phase === 'rotina';
    this.events.update(dt);

    // clique/toque = andar até o ponto
    if (this.input.click && !blocked) {
      const r = this.engine.canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(((this.input.click.x - r.left) / r.width) * 2 - 1, -((this.input.click.y - r.top) / r.height) * 2 + 1);
      this.ray.setFromCamera(ndc, this.engine.camera);
      const hit = new THREE.Vector3();
      if (this.ray.ray.intersectPlane(this.ground, hit)) {
        // clicou num personagem/ponto? interage ao chegar
        this.player.goTo(hit);
      }
    }

    this.player.frozen = blocked;
    this.player.update(dt, this.input, this.rig);

    // ônibus
    for (const b of this.buses) {
      const was = b.s;
      // segura o ônibus na parada enquanto o jogador está perto da porta (até 25 s)
      if (!b.opt.full && b.state === 'dwell' && b.stoppedAt === this.route.distAt(BUS_STOP_IDX.parada214) && !this.ctx.flag('arrived_school')) {
        const near = this.player.pos.distanceTo(b.doorPos()) < 9;
        b.holdForPlayer = near && b.dwell > -25;
      }
      b.update(dt);
      // passou cheio pela parada com o jogador por perto → oportunidade de registro
      const stopD = this.route.distAt(BUS_STOP_IDX.parada214);
      if (b.opt.full && was < stopD && b.s >= stopD && this.player.pos.distanceTo(new THREE.Vector3(L.parada[0], 0, L.parada[1])) < 30) {
        this.lastFullPass = performance.now();
        bus.emit('caption', { text: `${this.ctx.clock} — O 0.214 passou lotado. Não parou.`, warn: true });
        if (!this.ev.has('e_lotado')) this.opportunity = { evidence: 'e_lotado', label: 'Registrar: ônibus lotado passando direto', until: performance.now() + 9000 };
      }
      if (!b.opt.full && was < stopD && b.s >= stopD - 0.5 && b.state === 'dwell' && this.player.pos.distanceTo(new THREE.Vector3(L.parada[0], 0, L.parada[1])) < 30 && !this.ctx.flag('arrived_school')) {
        if (performance.now() - this.lastFullPass < 60000 && !this.ev.has('e_comboio'))
          this.opportunity = { evidence: 'e_comboio', label: 'Registrar: dois ônibus chegando juntos', until: performance.now() + 14000 };
        bus.emit('caption', { text: `${this.ctx.clock} — Um 0.214 parou. Tem lugar.` });
      }
      if (b === this.riding && b.state === 'dwell' && b.stoppedAt === this.route.distAt(BUS_STOP_IDX.paradaCed)) this.alight();
    }
    for (let i = this.buses.length - 1; i >= 0; i--) if (this.buses[i].state === 'done') { this.buses[i].dispose(this.world.scene); this.buses.splice(i, 1); }
    this.traffic.update(dt);
    if (this.opportunity && performance.now() > this.opportunity.until) this.opportunity = null;

    // foco de interação
    const ppos = this.player.pos;
    let best: Interactable | null = null, bd = Infinity;
    if (!blocked) for (const it of this.interactables()) {
      const d = it.pos.distanceTo(ppos);
      if (d < it.radius && d < bd) { bd = d; best = it; }
    }
    this.focus = best;

    // visita a pontos (mapeador) e flags de chegada
    for (const p of this.ctx.campaign.pois) {
      if (ppos.distanceTo(new THREE.Vector3(p.pos[0], 0, p.pos[1])) < p.radius + 2 && !s.visited.includes(p.id)) {
        s.visited.push(p.id);
        this.ctx.log('poi_visited', { poi: p.id });
        if (p.id === 'p_parada') this.ctx.setFlag('at_parada');
        bus.emit('state');
      }
    }

    // teclas
    if (!blocked) {
      if (this.input.wasPressed('e') || this.input.wasPressed('enter')) this.interact();
      if (this.input.wasPressed('f')) this.captureOpportunity();
    }

    // NPCs
    for (const n of this.npcs) n.update(dt, ppos, this.focus?.ref === n);

    // câmera
    if (this.riding) {
      const b = this.riding;
      const back = new THREE.Vector3(-Math.sin(b.heading), 0, -Math.cos(b.heading));
      this.rig.mode = 'cinematic';
      this.rig.cineFrom = b.pos.clone().addScaledVector(back, 16).add(new THREE.Vector3(6, 9, 4));
      this.rig.cineLook = b.pos.clone().add(new THREE.Vector3(0, 2, 0));
      this.world.followShadow(b.pos.x, b.pos.z);
    } else {
      const jumped = this.rig.mode !== 'follow' || this.rig.target.distanceTo(ppos) > 8;
      this.rig.mode = 'follow';
      this.rig.target.copy(ppos);
      if (jumped) this.rig.snap();
      this.world.followShadow(ppos.x, ppos.z);
    }
    if (settings.reduceMotion && this.rig.mode === 'follow') this.rig.update(1, t, true); else this.rig.update(dt, t);
    this.world.update(dt, t, this.riding ? this.riding.pos : ppos);
    this.ctx.telemetry.samplePosition(ppos.x, ppos.z);
    this.onFrame?.();
    this.input.endFrame();
  }

  /** projeta um ponto 3D para coordenadas de tela */
  project(p: THREE.Vector3, yOff = 2.2) {
    const v = p.clone(); v.y += yOff; v.project(this.engine.camera);
    const r = this.engine.canvas.getBoundingClientRect();
    return { x: (v.x * 0.5 + 0.5) * r.width, y: (-v.y * 0.5 + 0.5) * r.height, visible: v.z < 1 && v.z > -1 };
  }

  dispose() {
    this.stopUpdate();
    this.input.dispose();
    this.unsub.forEach(u => u());
    this.mentor.dispose();
    this.ctx.telemetry.dispose();
    this.ctx.save(true);
    const scene = this.world.scene;
    this.world.setRain(false);
    // remove tudo o que a partida adicionou (jogador, NPCs, ônibus, carros, marcadores)
    scene.children.slice(this.baseCount).forEach(o => scene.remove(o));
    this.world.colliders.splice(this.npcColliderStart);
  }
}
