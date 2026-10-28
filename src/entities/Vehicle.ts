import * as THREE from 'three';
import { flat } from './Avatar';
import { textSign } from '@/worlds/textures';
import type { VehicleFootprint } from '@/game/RoadSafety';
import type { V2 } from '@/worlds/layout';

/** Segue uma polilinha por distância percorrida. */
export class RouteFollower {
  readonly cum: number[] = [0];
  readonly total: number;
  constructor(readonly pts: V2[]) {
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    this.total = this.cum[this.cum.length - 1];
  }
  at(s: number) {
    s = Math.max(0, Math.min(this.total, s));
    let i = 1; while (i < this.cum.length - 1 && this.cum[i] < s) i++;
    const a = this.pts[i - 1], b = this.pts[i];
    const t = (s - this.cum[i - 1]) / Math.max(0.001, this.cum[i] - this.cum[i - 1]);
    return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, heading: Math.atan2(b[0] - a[0], b[1] - a[1]), seg: i - 1 };
  }
  distAt(idx: number) { return this.cum[idx]; }
}

let busTex: THREE.Texture | null = null;

export interface BusOptions { full: boolean; stops: boolean; stopAt: number[]; slowFrom: number; slowTo: number; id: string }

export class Bus {
  readonly root = new THREE.Group();
  s = 0; speed = 13; heading = 0;
  state: 'driving' | 'stopping' | 'dwell' | 'done' = 'driving';
  dwell = 0;
  stoppedAt: number | null = null;
  holdForPlayer = false;
  riding = false;
  private nextStop = 0;
  private passengers: THREE.Object3D[] = [];
  readonly pos = new THREE.Vector3();

  constructor(readonly route: RouteFollower, readonly opt: BusOptions, scene: THREE.Scene) {
    const livery = flat('#df9f26', 0.5, 0.15), white = flat('#fac64d', 0.5, 0.1), glass = flat('#1a2a31', 0.15, 0.5), tire = flat('#111', 0.9), acc = flat('#f5e7ae', 0.4);
    const L = 11.5, W = 2.55, H = 3.1;
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H - 0.6, L), white); body.position.y = 0.3 + (H - 0.6) / 2 + 0.3; body.castShadow = true;
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(W + 0.02, 0.9, L + 0.02), livery); skirt.position.y = 1.0;
    const win = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, 1.0, L - 1.2), glass); win.position.set(0, 2.35, -0.3);
    const front = new THREE.Mesh(new THREE.BoxGeometry(W - 0.2, 1.3, 0.05), glass); front.position.set(0, 2.2, L / 2 + 0.01);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(W + 0.05, 0.12, L + 0.04), acc); stripe.position.y = 1.5;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(W - 0.3, 0.25, L - 2), white); roof.position.y = 3.15;
    if (!busTex) busTex = textSign(['0.214', 'CED 214'], { w: 256, h: 96, bg: '#0b1418', fg: '#ffb23f' });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), new THREE.MeshBasicMaterial({ map: busTex }));
    sign.position.set(0, 2.98, L / 2 + 0.04);
    this.root.add(body, skirt, win, front, stripe, roof, sign);
    for (const [x, z] of [[-1.2, 3.6], [1.2, 3.6], [-1.2, -3.4], [1.2, -3.4]]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 10).rotateZ(Math.PI / 2), tire); w.position.set(x, 0.5, z); this.root.add(w);
    }
    // silhuetas de passageiros (ônibus lotado)
    if (opt.full) {
      const m = flat('#3a2f2a', 0.9);
      for (let i = 0; i < 16; i++) {
        const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.5, 2, 6), m);
        p.position.set((i % 2 ? 0.7 : -0.7) + (Math.random() - 0.5) * 0.3, 2.1, -4.6 + Math.floor(i / 2) * 1.2);
        this.root.add(p); this.passengers.push(p);
      }
    }
    this.root.traverse(o => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
    scene.add(this.root);
    const p = route.at(0); this.root.position.set(p.x, 0, p.z); this.heading = p.heading;
  }

  get stoppedAtStop() { return this.state === 'dwell' ? this.stoppedAt : null; }

  update(dt: number, allow?: (route: RouteFollower, s: number, next: number, length: number, width: number) => boolean) {
    if (this.state === 'done') return;
    const stops = this.opt.stops ? this.opt.stopAt : [];
    while (this.nextStop < stops.length && stops[this.nextStop] < this.s - 0.5) this.nextStop++;
    const target = stops[this.nextStop];
    const inDetour = this.s > this.opt.slowFrom && this.s < this.opt.slowTo;
    const cruise = inDetour ? 5.5 : 13;

    if (this.state === 'dwell') {
      this.dwell -= dt;
      if (this.dwell <= 0 && !this.holdForPlayer) { this.state = 'driving'; this.nextStop++; this.stoppedAt = null; }
      this.speed = 0;
    } else {
      let want = cruise;
      if (target !== undefined) {
        const d = target - this.s;
        if (d < 30) want = Math.min(cruise, Math.max(1.2, d * 0.55));
        if (d < 0.3) { this.state = 'dwell'; this.dwell = 9; this.stoppedAt = target; this.speed = 0; }
      }
      this.speed += (want - this.speed) * Math.min(1, dt * 1.8);
      const next = this.s + this.speed * dt;
      if (!allow || allow(this.route,this.s,next,5.75,1.35)) this.s=next; else this.speed=0;
      if (this.s >= this.route.total) this.state = 'done';
    }
    const p = this.route.at(this.s);
    this.pos.set(p.x, 0, p.z);
    this.root.position.copy(this.pos);
    let dh = p.heading - this.heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    this.heading += dh * Math.min(1, dt * 3.5);
    this.root.rotation.y = this.heading;
    // balanço leve
    this.root.rotation.z = Math.sin(performance.now() / 300 + this.s) * 0.004 * this.speed / 13;
  }

  /** ponto da porta (lado direito) para embarque */
  doorPos() {
    const r = new THREE.Vector3(Math.cos(this.heading), 0, -Math.sin(this.heading)).multiplyScalar(-1.8);
    const f = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading)).multiplyScalar(3.5);
    return this.pos.clone().add(r).add(f);
  }

  dispose(scene: THREE.Scene) { scene.remove(this.root); }
}

/** Carros simples para dar vida ao trânsito. */
export class Traffic {
  private cars: { root: THREE.Group; s: number; route: RouteFollower; speed: number; heading: number }[] = [];
  constructor(routes: RouteFollower[], scene: THREE.Scene, slow: (route: RouteFollower, s: number) => boolean) {
    this.slow = slow;
    const colors = ['#d9d9d9', '#1c1f22', '#8a1e1e', '#2b4e7a', '#c9c2b0', '#5b6a70', '#e8e8e8'];
    let k = 0;
    for (const route of routes) {
      for (let i = 0; i < 7; i++) {
        const g = new THREE.Group();
        const m = flat(colors[k++ % colors.length], 0.45, 0.25);
        const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 4.2), m); b.position.y = 0.65;
        const c = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), flat('#1d2a30', 0.2, 0.4)); c.position.set(0, 1.25, -0.2);
        g.add(b, c); g.traverse(o => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
        scene.add(g);
        this.cars.push({ root: g, s: (route.total / 7) * i + Math.random() * 8, route, speed: 11, heading: 0 });
      }
    }
  }
  footprints():VehicleFootprint[]{return this.cars.map(c=>{const p=c.route.at(c.s);return {x:p.x,z:p.z,heading:p.heading,halfLength:2.1,halfWidth:.95}})}
  private slow: (route: RouteFollower, s: number) => boolean;
  update(dt: number, allow?: (route: RouteFollower, s: number, next: number, length: number, width: number) => boolean) {
    for (const c of this.cars) {
      const want = this.slow(c.route, c.s) ? 4.5 : 12;
      c.speed += (want - c.speed) * Math.min(1, dt);
      const next=(c.s+c.speed*dt)%c.route.total;
      const blocked=this.cars.some(other=>other!==c&&other.route===c.route&&((other.s-c.s+c.route.total)%c.route.total)<7);
      if(!blocked&&(!allow||allow(c.route,c.s,next,2.1,.95))) c.s=next;else c.speed=0;
      const p = c.route.at(c.s);
      c.root.position.set(p.x, 0, p.z);
      let dh = p.heading - c.heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
      c.heading += Math.abs(dh) > 2.5 ? dh : dh * Math.min(1, dt * 4);
      c.root.rotation.y = c.heading;
    }
  }
}
