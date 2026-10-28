import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { textSign } from '@/worlds/textures';
import * as THREE from 'three';
import type { AvatarConfig } from '@/types';
import { SKIN, HAIR_COLORS, CLOTH, SHOES, DEFAULT_AVATAR } from '@/data/avatarOptions';

/* Personagens de animação estilizada: silhueta modelada, costuras e membros articulados.
   Arte procedural local: mantém a personalização sem depender de downloads externos. */

const matCache = new Map<string, THREE.MeshStandardMaterial>();
export function flat(color: string, rough = 0.85, metal = 0) {
  const k = color + rough + metal;
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, flatShading: false }));
  return matCache.get(k)!;
}

const box = (w: number, h: number, d: number) => new RoundedBoxGeometry(w,h,d,3,Math.min(.035,w*.15,h*.15,d*.15));
const profile = (points: [number,number][], depth=1) => {const g=new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),24);g.scale(1,1,depth);return g};
const cyl = (rt: number, rb: number, h: number, s = 16) => new THREE.CylinderGeometry(rt, rb, h, s);

function mesh(g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; return o;
}

export type Pose = 'stand' | 'phone' | 'wheelchair' | 'work' | 'sit';

export class Avatar {
  readonly root = new THREE.Group();
  private legL = new THREE.Group(); private legR = new THREE.Group();
  private armL = new THREE.Group(); private armR = new THREE.Group();
  private knees:THREE.Group[]=[];
  private torso = new THREE.Group(); private head = new THREE.Group();
  private phase = Math.random() * 6;
  cfg: AvatarConfig;
  pose: Pose;

  constructor(cfg: Partial<AvatarConfig> = {}, pose: Pose = 'stand') {
    this.cfg = { ...DEFAULT_AVATAR, ...cfg };
    this.pose = pose;
    this.build();
  }

  addUniform(kind: 'vigilancia' | 'mobilidade' | 'educacao' | 'gestao') {
    const vest = kind === 'vigilancia' ? '#d5dc67' : kind === 'mobilidade' ? '#d5dc67' : '#3e7486';
    const jacket = mesh(box(.36,.42,.025),flat(vest),0,.28,.15); this.torso.add(jacket);
    for (const y of [.19,.39]) this.torso.add(mesh(box(.35,.026,.03),flat('#e7ece8',.35),0,y,.17));
    const word = kind === 'vigilancia' ? 'VIGILÂNCIA' : kind === 'mobilidade' ? 'MOBILIDADE' : kind === 'educacao' ? 'ORIENTAÇÃO' : 'GESTÃO';
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(.3,.075),new THREE.MeshBasicMaterial({map:textSign([word],{w:512,h:128,bg:vest,fg:'#16323e'}),side:THREE.DoubleSide})); badge.position.set(0,.3,.18);this.torso.add(badge);
    const back = badge.clone();back.material = badge.material.clone();back.position.z=-.16;back.rotation.y=Math.PI;this.torso.add(back);
    const id = mesh(box(.075,.095,.015),flat('#f2f5ef'),-.1,.1,.18);this.torso.add(id);
    this.root.userData.uniform = kind;
  }

  rebuild(cfg: Partial<AvatarConfig>) {
    this.cfg = { ...this.cfg, ...cfg };
    this.root.clear();this.knees=[];
    this.legL = new THREE.Group(); this.legR = new THREE.Group();
    this.armL = new THREE.Group(); this.armR = new THREE.Group();
    this.torso = new THREE.Group(); this.head = new THREE.Group();
    this.build();
  }

  private build() {
    const c = this.cfg;
    const skin = flat(SKIN[c.skin % SKIN.length], 0.7);
    const top = flat(CLOTH[c.topColor % CLOTH.length]);
    const bot = flat(CLOTH[c.bottomColor % CLOTH.length]);
    const shoe = flat(SHOES[c.shoeColor % SHOES.length], 0.6);
    const sole = flat('#e8e8e8', 0.6);
    const hairM = flat(HAIR_COLORS[c.hairColor % HAIR_COLORS.length], 0.9);

    const sh = c.build === 'B' ? 0.40 : c.build === 'C' ? 0.49 : 0.45;  // ombros
    const hip = c.build === 'B' ? 0.33 : c.build === 'C' ? 0.31 : 0.3;  // quadril
    const scale = c.build === 'C' ? 1.04 : c.build === 'B' ? 0.97 : 1;
    const hipY = 0.9;

    // ---------- pernas ----------
    const legMat = c.bottom === 'calca' ? bot : skin;
    for (const [g, sx] of [[this.legL, -1], [this.legR, 1]] as const) {
      g.position.set(sx * hip * 0.33, hipY, 0);
      const thighM = c.bottom === 'saia' ? skin : bot;
      g.add(mesh(profile([[0,0],[.075,.015],[.09,.12],[.095,.33],[.08,.44],[0,.46]],.9),thighM,0,-.46,0));
      const knee=new THREE.Group();knee.position.y=-.44;this.knees.push(knee);g.add(knee);
      knee.add(mesh(profile([[0,0],[.056,.01],[.07,.12],[.08,.31],[.073,.42],[0,.44]],.92),legMat,0,-.43,0));
      knee.add(mesh(box(.15,.10,.29),shoe,0,-.42,.055));
      knee.add(mesh(box(.16,.035,.30),sole,0,-.475,.055));
      for(let i=0;i<3;i++)knee.add(mesh(box(.085,.009,.012),sole,0,-.372,.075+i*.027));
      knee.add(mesh(box(.065,.045,.008),sole,0,-.42,-.093));
      this.root.add(g);
    }
    if (c.bottom === 'saia') this.root.add(mesh(cyl(0.17, 0.27, 0.36, 8), bot, 0, hipY - 0.12, 0));
    this.root.add(mesh(box(hip, 0.16, 0.2), bot, 0, hipY + 0.02, 0));

    // ---------- tronco ----------
    this.torso.position.y = hipY + 0.08;
    const torsoG=profile([[0,0],[hip*.49,.015],[hip*.53,.08],[sh*.43,.3],[sh*.51,.43],[sh*.49,.5],[.09,.57],[0,.575]],.61);
    this.torso.add(mesh(torsoG,top));
    // Collar, hem and subtle seams give clothing volume at conversation distance.
    const collar=mesh(new THREE.TorusGeometry(.065,.012,8,24),top,0,.568,.005);collar.rotation.x=Math.PI/2;this.torso.add(collar);
    const seam=flat(CLOTH[c.topColor%CLOTH.length],.95);
    this.torso.add(mesh(box(hip*.9,.018,.19),seam,0,.03,0));
    if (c.top === 'moletom') {
      const hood = mesh(new THREE.TorusGeometry(0.11, 0.045, 10, 24), top, 0, 0.56, -0.08); hood.rotation.x = Math.PI / 2.4;
      this.torso.add(hood);
      this.torso.add(mesh(box(.23,.11,.025),top,0,.13,.119));
      for(const side of [-1,1]){const cord=mesh(cyl(.006,.006,.17,8),flat('#dcd7d1'),side*.046,.43,.12);cord.rotation.z=side*.08;this.torso.add(cord)}
    }
    if (c.top === 'jaqueta') {
      this.torso.add(mesh(box(0.02, 0.52, 0.02), flat('#d9dde0', 0.4, 0.5), 0, 0.28, sh * 0.29));
    }
    if (this.pose === 'work') this.torso.add(mesh(new THREE.CylinderGeometry(sh * 0.52, hip * 0.52, 0.4, 8).scale(1, 1, 0.58), flat('#ff7a1a'), 0, 0.32, 0));
    // pescoço
    this.torso.add(mesh(cyl(0.05, 0.055, 0.1), skin, 0, 0.6, 0));
    this.root.add(this.torso);

    // ---------- braços ----------
    const upper = c.top === 'regata' ? skin : top;
    const lower = c.top === 'moletom' || c.top === 'jaqueta' ? top : skin;
    for (const [g, sx] of [[this.armL, -1], [this.armR, 1]] as const) {
      g.position.set(sx * (sh * 0.5 + 0.04), 0.52, 0);
      g.add(mesh(profile([[0,0],[.052,.01],[.068,.08],[.074,.22],[.057,.30],[0,.31]],.92),upper,0,-.31,0));
      g.add(mesh(profile([[0,0],[.04,.01],[.05,.1],[.058,.23],[.052,.28],[0,.29]],.9),lower,0,-.58,.012));
      g.add(mesh(new THREE.SphereGeometry(.047,16,12).scale(.83,1.3,.65),skin,0,-.61,.015));
      const thumb=mesh(new THREE.CapsuleGeometry(.014,.035,4,8),skin,-sx*.033,-.603,.04);thumb.rotation.z=sx*.5;g.add(thumb);
      g.rotation.z = sx * 0.06;
      this.torso.add(g);
    }

    // ---------- cabeça ----------
    this.head.position.y = 0.76;
    const headG = new THREE.SphereGeometry(.151,24,18);headG.scale(.94,1.13,1);this.head.add(mesh(headG,skin));
    for(const side of [-1,1]){
      this.head.add(mesh(new THREE.SphereGeometry(.028,12,8).scale(.65,1,.7),skin,side*.143,-.01,0));
      this.head.add(mesh(new THREE.SphereGeometry(.028,14,10).scale(1.12,.8,.36),flat('#f2eee7'),side*.052,.022,.132));
      this.head.add(mesh(new THREE.SphereGeometry(.014,12,8).scale(.9,1,.45),flat('#292019'),side*.052,.022,.143));
      this.head.add(mesh(new THREE.SphereGeometry(.0045,8,6),flat('#fff'),side*.052-.004,.027,.15));
      const brow=mesh(box(.045,.009,.008),hairM,side*.051,.061,.13);brow.rotation.z=side*.1;this.head.add(brow);
    }
    this.head.add(mesh(new THREE.SphereGeometry(.019,12,8).scale(.85,1,1.2),skin,0,-.014,.146));
    const smile=mesh(new THREE.TorusGeometry(.035,.004,6,18,Math.PI*.65),flat('#794c40'),0,-.047,.135);smile.rotation.z=Math.PI*1.175;this.head.add(smile);
    this.head.scale.setScalar(1.17);
    this.addHair(hairM);
    this.addAccessory();
    this.torso.add(this.head);

    // mochila
    if (c.backpack) {
      const bp = flat(CLOTH[c.backpackColor % CLOTH.length]);
      this.torso.add(mesh(box(sh * 0.7, 0.4, 0.15), bp, 0, 0.3, -0.17));
      this.torso.add(mesh(box(sh * 0.55, 0.16, 0.06), bp, 0, 0.18, -0.26));
      const strap=flat('#d1a14e');for(const side of [-1,1]){const band=mesh(box(.025,.47,.025),strap,side*sh*.3,.3,.13);band.rotation.z=side*.1;this.torso.add(band)}
      this.torso.add(mesh(box(.18,.012,.015),flat('#e4b44e'),0,.27,-.299));

    }

    // poses
    if (this.pose === 'phone') {
      this.armR.rotation.set(-1.1, 0, 0.25);
      this.armR.add(mesh(box(0.07, 0.13, 0.012), flat('#0b0f12', 0.3, 0.4), 0, -0.6, 0.05));
      this.head.rotation.x = 0.35;
    }
    if (this.pose === 'wheelchair' || this.pose === 'sit') {
      this.legL.rotation.x = this.legR.rotation.x = -Math.PI / 2;
      this.legL.position.y = this.legR.position.y = hipY - 0.42;
      this.legL.position.z = this.legR.position.z = 0;
      this.torso.position.y = hipY - 0.34;
      this.root.children.forEach(ch => { if (ch !== this.legL && ch !== this.legR && ch !== this.torso && (ch as THREE.Mesh).isMesh) ch.position.y -= 0.42; });
      if (this.pose === 'wheelchair') this.root.add(this.wheelchair());
    }
    this.root.scale.setScalar(scale);
  }

  private wheelchair() {
    const g = new THREE.Group();
    const frame = flat('#2a3136', 0.4, 0.6), seat = flat('#14191c');
    g.add(mesh(box(0.46, 0.06, 0.44), seat, 0, 0.46, 0));
    g.add(mesh(box(0.46, 0.44, 0.05), seat, 0, 0.7, -0.22));
    for (const sx of [-1, 1]) {
      const w = mesh(new THREE.TorusGeometry(0.28, 0.03, 5, 14), frame, sx * 0.27, 0.3, -0.05); w.rotation.y = Math.PI / 2; g.add(w);
      g.add(mesh(cyl(0.04, 0.04, 0.05, 6).rotateZ(Math.PI / 2), frame, sx * 0.18, 0.06, 0.3));
    }
    return g;
  }

  private addHair(m: THREE.Material) {
    const c = this.cfg; const h = this.head;
    const cap = (s = 1.08) => {
      const g = new THREE.SphereGeometry(0.151, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
      g.scale(s * 0.95, s * 1.12, s);
      return mesh(g, m, 0, 0.012, -0.008);
    };
    switch (c.hair) {
      case 'raspado': { const g = cap(1.02); h.add(g); break; }
      case 'curto': h.add(cap(1.1)); break;
      case 'crespo': case 'cacheado': {h.add(cap(1.1));for(let i=0;i<26;i++){const a=i*2.399;const r=.07+.065*((i%5)/4);h.add(mesh(new THREE.SphereGeometry(.042,10,8),m,Math.cos(a)*r,.11+(i%4)*.023,Math.sin(a)*r-.035))}break;}
      case 'trancas':
        h.add(cap(1.08));
        for (let i = -2; i <= 2; i++) {
          const b = mesh(cyl(0.018, 0.014, 0.34, 5), m, i * 0.045, -0.14, -0.11); b.rotation.x = 0.2; h.add(b);
        }
        break;
      case 'coque':
        h.add(cap(1.08)); h.add(mesh(new THREE.IcosahedronGeometry(0.075, 1), m, 0, 0.13, -0.09)); break;
      case 'longo':
        h.add(cap(1.12));
        for(let i=0;i<13;i++){const a=.55+i/12*(Math.PI*2-1.1);const x=Math.sin(a)*.14,z=Math.cos(a)*.14;const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,.10,z),new THREE.Vector3(x*1.2,-.03,z*1.08),new THREE.Vector3(x*1.15,-.15,z*.95),new THREE.Vector3(x*1.3,-.26,z*.9)]);h.add(mesh(new THREE.TubeGeometry(curve,14,.032,7,false),m))}
        break;
    }
  }

  private addAccessory() {
    const h = this.head;
    switch (this.cfg.accessory) {
      case 'fone': {
        const m = flat('#0c1114', 0.35, 0.3), acc = flat('#2fe3a1', 0.4);
        const band = mesh(new THREE.TorusGeometry(0.15, 0.018, 4, 12, Math.PI), m, 0, 0.02, 0); h.add(band);
        h.add(mesh(cyl(0.05, 0.05, 0.04, 8).rotateZ(Math.PI / 2), m, -0.14, 0, 0));
        h.add(mesh(cyl(0.05, 0.05, 0.04, 8).rotateZ(Math.PI / 2), m, 0.14, 0, 0));
        h.add(mesh(cyl(0.02, 0.02, 0.042, 6).rotateZ(Math.PI / 2), acc, 0.142, 0, 0));
        break;
      }
      case 'bone': {
        const m = flat(CLOTH[(this.cfg.topColor + 3) % CLOTH.length]);
        h.add(mesh(new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1, 0.8, 1.05), m, 0, 0.03, 0));
        h.add(mesh(box(0.2, 0.015, 0.13), m, 0, 0.04, 0.15));
        break;
      }
      case 'oculos': {
        const m = flat('#111', 0.3, 0.2);
        h.add(mesh(box(0.07, 0.045, 0.01), m, -0.048, 0.02, 0.125));
        h.add(mesh(box(0.07, 0.045, 0.01), m, 0.048, 0.02, 0.125));
        h.add(mesh(box(0.03, 0.01, 0.01), m, 0, 0.03, 0.125));
        break;
      }
      case 'bandana':
        h.add(mesh(cyl(0.135, 0.135, 0.04, 10), flat('#a33b3b'), 0, 0.07, 0));
        break;
    }
  }

  /** speed em m/s — anima ciclo de caminhada; parado faz respiração leve */
  update(dt: number, speed: number) {
    if (this.pose === 'wheelchair' || this.pose === 'sit') return;
    const moving = speed > 0.3;
    this.phase += dt * (moving ? 2.2 + speed * 0.9 : 1.4);
    const amp = moving ? Math.min(0.7, 0.25 + speed * 0.07) : 0;
    const s = Math.sin(this.phase * (moving ? 1 : 0));
    this.legL.rotation.x = s * amp;
    this.legR.rotation.x = -s * amp;
    this.knees.forEach((k,i)=>k.rotation.x=moving?Math.max(0,Math.sin(this.phase+(i?Math.PI:0)))*.65:0);
    if (this.pose !== 'phone') { this.armL.rotation.x = -s * amp * 0.8; this.armR.rotation.x = s * amp * 0.8; }
    else this.armL.rotation.x = -s * amp * 0.6;
    const bob = moving ? Math.abs(Math.cos(this.phase)) * 0.04 : Math.sin(this.phase) * 0.006;
    this.torso.position.y = 0.98 + bob;
    if (this.pose === 'work' && !moving) this.armR.rotation.x = -0.4 + Math.sin(this.phase * 2) * 0.15;
  }
}
