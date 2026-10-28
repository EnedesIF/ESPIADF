import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { flat } from '@/entities/Avatar';
import { L, ROADS, PEDESTRIAN_WALL, WORLD, type V2 } from './layout';
import { facadeTextures, textSign, stripes, courtTexture, groundTexture } from './textures';

/* =====================================================================
   "Quadra 214" — bairro fictício inspirado no DF:
   superquadras sobre pilotis, eixos largos, ipês, cerrado e terra vermelha,
   parada de concreto, obra na via, Centro de Ensino e Administração Regional.
   Geometria estática agrupada por material (poucos draw calls).
   ===================================================================== */

export interface Collider { minX: number; maxX: number; minZ: number; maxZ: number; pedestrianOnly?: boolean }
export interface Footprint { x: number; z: number; w: number; d: number; kind: string; label?: string }
export type TimeOfDay = 'night' | 'dawn' | 'morning';

class Batcher {
  private groups = new Map<THREE.Material, THREE.BufferGeometry[]>();
  add(geo: THREE.BufferGeometry, mat: THREE.Material, pos: THREE.Vector3Like, rotY = 0, scale?: THREE.Vector3Like) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(pos.x, pos.y, pos.z),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY),
      scale ? new THREE.Vector3(scale.x, scale.y, scale.z) : new THREE.Vector3(1, 1, 1));
    g.applyMatrix4(m);
    if (!this.groups.has(mat)) this.groups.set(mat, []);
    this.groups.get(mat)!.push(g);
  }
  build(parent: THREE.Object3D, shadows = true) {
    this.groups.forEach((list, mat) => {
      const merged = mergeGeometries(list, false);
      if (!merged) return;
      const m = new THREE.Mesh(merged, mat);
      m.castShadow = shadows; m.receiveShadow = true; m.matrixAutoUpdate = false;
      parent.add(m);
    });
    this.groups.clear();
  }
}

const v = (x: number, y: number, z: number) => ({ x, y, z });
const BOX = new THREE.BoxGeometry(1, 1, 1);

export class CityWorld {
  readonly scene = new THREE.Scene();
  readonly colliders: Collider[] = [];
  readonly footprints: Footprint[] = [];
  private sun = new THREE.DirectionalLight('#ffe2b8', 2.4);
  private hemi = new THREE.HemisphereLight('#bcd7e6', '#5d5137', 0.9);
  private skyMat!: THREE.ShaderMaterial;
  private windowMats: THREE.MeshStandardMaterial[] = [];
  private lampMat = new THREE.MeshStandardMaterial({ color: '#fff4d6', emissive: '#ffcf7a', emissiveIntensity: 0, flatShading: true });
  private nightLights: THREE.PointLight[] = [];
  private rain?: THREE.LineSegments;
  private rainOn = false;
  private animated: ((dt: number, t: number) => void)[] = [];

  constructor() {
    this.scene.fog = new THREE.Fog('#c8d6d6', 90, 330);
    this.buildSky();
    this.buildLights();
    this.buildGround();
    this.buildRoads();
    this.buildBlocks();
    this.buildParada();
    this.buildObra();
    this.buildStreetLights();
    this.buildEast();
    this.buildShops();
    this.buildTrees();
    this.buildHorizon();
    this.setTimeOfDay('morning');
  }

  /* ---------------- céu e luz ---------------- */
  private buildSky() {
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color('#5d93b8') }, mid: { value: new THREE.Color('#cfe0e3') }, bottom: { value: new THREE.Color('#e8d7b4') } },
      vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vp;
        void main(){ float h = vp.y; vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h*1.6,0.0,1.0), 0.7)) : mix(mid, bottom, clamp(-h*4.0,0.0,1.0)); gl_FragColor = vec4(c,1.0); }`
    });
    this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(600, 24, 12), this.skyMat));
  }

  private buildLights() {
    this.sun.position.set(120, 90, 40);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera as THREE.OrthographicCamera;
    sc.left = -42; sc.right = 42; sc.top = 42; sc.bottom = -42; sc.near = 10; sc.far = 400;
    this.sun.shadow.bias = -0.0006; this.sun.shadow.normalBias = 0.035;
    this.scene.add(this.sun, this.sun.target, this.hemi);
  }

  setTimeOfDay(t: TimeOfDay) {
    const u = this.skyMat.uniforms;
    const fog = this.scene.fog as THREE.Fog;
    if (t === 'night') {
      u.top.value.set('#060d1a'); u.mid.value.set('#16304a'); u.bottom.value.set('#35304a');
      this.sun.color.set('#8aa6e0'); this.sun.intensity = 0.6; this.sun.position.set(-80, 120, -60);
      this.hemi.color.set('#4d6f9e'); this.hemi.groundColor.set('#2a2430'); this.hemi.intensity = 1.0;
      fog.color.set('#16304a'); fog.near = 70; fog.far = 300;
      this.windowMats.forEach(m => m.emissiveIntensity = 1.3);
      this.lampMat.emissiveIntensity = 2.6;
      this.nightLights.forEach(l => l.visible = true);
    } else if (t === 'dawn') {
      u.top.value.set('#2d5d88'); u.mid.value.set('#f0b27a'); u.bottom.value.set('#c9846a');
      this.sun.color.set('#ffb070'); this.sun.intensity = 1.6; this.sun.position.set(160, 40, -30);
      this.hemi.color.set('#9fb8cf'); this.hemi.groundColor.set('#5a4636'); this.hemi.intensity = 0.8;
      fog.color.set('#e2b48f'); fog.near = 80; fog.far = 320;
      this.windowMats.forEach(m => m.emissiveIntensity = 0.5);
      this.lampMat.emissiveIntensity = 1.2;
      this.nightLights.forEach(l => l.visible = false);
    } else {
      u.top.value.set('#4a88b5'); u.mid.value.set('#cfe2e6'); u.bottom.value.set('#e2d2ad');
      this.sun.color.set('#ffe6c4'); this.sun.intensity = 2.5; this.sun.position.set(130, 85, 35);
      this.hemi.color.set('#cfe3ee'); this.hemi.groundColor.set('#6a5a3c'); this.hemi.intensity = 0.95;
      fog.color.set('#cbdadc'); fog.near = 90; fog.far = 340;
      this.windowMats.forEach(m => m.emissiveIntensity = 0);
      this.lampMat.emissiveIntensity = 0;
      this.nightLights.forEach(l => l.visible = false);
    }
  }

  /** o sol segue o jogador para manter sombras nítidas numa área menor */
  followShadow(x: number, z: number) {
    const off = this.sun.position.clone().sub(this.sun.target.position);
    this.sun.target.position.set(x, 0, z);
    this.sun.position.copy(this.sun.target.position).add(off);
  }

  /* ---------------- chão e ruas ---------------- */
  private buildGround() {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(460, 340), new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 1 }));
    g.rotation.x = -Math.PI / 2; g.receiveShadow = true;
    this.scene.add(g);
    // manchas de terra vermelha
    const b = new Batcher(); const earth = flat('#a5603a', 1);
    const spots: [number, number, number][] = [[-120, 60, 14], [-35, 62, 9], [120, -75, 12], [20, 70, 10], [-130, -80, 8], [95, 75, 9]];
    spots.forEach(([x, z, r]) => b.add(new THREE.CircleGeometry(r, 9).rotateX(-Math.PI / 2), earth, v(x, 0.02, z)));
    b.build(this.scene, false);
  }

  private buildRoads() {
    const b = new Batcher();
    const asphalt = flat('#3a4146', 0.95), walk = flat('#c9c3b5', 0.95), curb = flat('#e0dbd0', 0.9), mark = flat('#f1ead2', 0.6), yellow = flat('#e2b53a', 0.6);
    for (const [x1, z1, x2, z2] of ROADS) {
      const w = x2 - x1, d = z2 - z1;
      b.add(BOX, walk, v((x1 + x2) / 2, 0.05, (z1 + z2) / 2), 0, v(w + 5, 0.1, d + 5));
    }
    for (const [x1, z1, x2, z2] of ROADS) {
      const w = x2 - x1, d = z2 - z1;
      b.add(BOX, curb, v((x1 + x2) / 2, 0.07, (z1 + z2) / 2), 0, v(w + 0.6, 0.12, d + 0.6));
      b.add(BOX, asphalt, v((x1 + x2) / 2, 0.08, (z1 + z2) / 2), 0, v(w, 0.12, d));
    }
    // faixas
    for (let x = -158; x < 158; x += 8) {
      if (x > -8 && x < 28) continue;
      b.add(BOX, mark, v(x, 0.15, 0), 0, v(4, 0.02, 0.25));
    }
    b.add(BOX, yellow, v(0, 0.15, -7.4), 0, v(320, 0.02, 0.18));
    b.add(BOX, yellow, v(0, 0.15, 7.4), 0, v(320, 0.02, 0.18));
    // faixa de pedestres perto da parada
    for (let i = 0; i < 7; i++) b.add(BOX, mark, v(-50 + i * 1.1 - 3.3, 0.15, 0), 0, v(0.6, 0.02, 14));
    b.build(this.scene, false);
    this.footprints.push(...ROADS.map(([x1, z1, x2, z2]) => ({ x: (x1 + x2) / 2, z: (z1 + z2) / 2, w: x2 - x1, d: z2 - z1, kind: 'road' })));
  }

  /* ---------------- superquadras (pilotis) ---------------- */
  private blockTex = facadeTextures(7);
  private block(cx: number, cz: number, w: number, d: number, floors = 6, label?: string, rot = 0) {
    const pil = 3.4, fh = 3, h = floors * fh;
    const b = new Batcher(); const conc = flat('#cfc9bb', 0.9), col = flat('#e6e1d4', 0.8), roof = flat('#8f8a80');
    // pilotis: colunas com colisão individual — dá para atravessar por baixo, como em Brasília
    const nx = Math.max(2, Math.round(w / 6)), nz = 2;
    for (let i = 0; i <= nx; i++) for (let j = 0; j < nz; j++) {
      const x = cx - w / 2 + 1 + (i * (w - 2)) / nx, z = cz - d / 2 + 1.6 + j * (d - 3.2);
      b.add(new THREE.CylinderGeometry(0.42, 0.32, pil, 7), col, v(x, pil / 2, z));
      this.colliders.push({ minX: x - 0.5, maxX: x + 0.5, minZ: z - 0.5, maxZ: z + 0.5 });
    }
    // núcleo de circulação (escada) sob o bloco
    b.add(BOX, conc, v(cx, pil / 2, cz), 0, v(4, pil, 3));
    this.colliders.push({ minX: cx - 2.2, maxX: cx + 2.2, minZ: cz - 1.7, maxZ: cz + 1.7 });
    b.add(BOX, conc, v(cx, pil + 0.25, cz), 0, v(w + 0.6, 0.5, d + 0.6));
    b.add(BOX, roof, v(cx, pil + h + 0.4, cz), 0, v(w + 0.4, 0.8, d + 0.4));
    b.build(this.scene);
    const m = new THREE.MeshStandardMaterial({ map: this.blockTex.map.clone(), emissiveMap: this.blockTex.emissive, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.8 });
    m.map!.wrapS = m.map!.wrapT = THREE.RepeatWrapping; m.map!.repeat.set(w / 14, floors / 6); m.map!.needsUpdate = true;
    this.windowMats.push(m);
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    body.position.set(cx, pil + 0.5 + h / 2, cz); body.castShadow = true; body.receiveShadow = true; body.rotation.y = rot;
    this.scene.add(body);
    this.footprints.push({ x: cx, z: cz, w, d, kind: 'block', label });
  }

  private buildBlocks() {
    this.block(-105, -42, 34, 12, 6, 'Bloco A — Quadra 214');
    this.block(-48, -45, 30, 12, 6, 'Bloco B');
    this.block(-110, 40, 34, 12, 6, 'Bloco C');
    this.block(-62, 44, 34, 12, 6, 'Bloco D');
    this.block(-128, -10 + 70, 10, 34, 6);
    this.block(118, -40 + 105, 30, 12, 6);
    this.block(-20, 45, 26, 12, 6);
  }

  /* ---------------- Paradas (abrigo de concreto, aberto para a via) ---------------- */
  private shelter(x: number, z: number, w: number) {
    const b = new Batcher(); const conc = flat('#12634e', 0.42, .2), bench = flat('#ad8051', 0.8);
    b.add(BOX, conc, v(x, 3.2, z + 1.5), 0, v(w, 0.35, 4.2));
    b.add(BOX, conc, v(x - w / 2 + 0.9, 1.6, z + 2.9), 0, v(0.5, 3.2, 0.5));
    b.add(BOX, conc, v(x + w / 2 - 0.9, 1.6, z + 2.9), 0, v(0.5, 3.2, 0.5));
    const glass=new THREE.MeshPhysicalMaterial({color:'#a5c7c3',transparent:true,opacity:.28,roughness:.18,metalness:.1,side:THREE.DoubleSide,depthWrite:false});
    const pane=new THREE.Mesh(new THREE.BoxGeometry(w-.8,2.6,.08),glass);pane.position.set(x,1.3,z+3.25);pane.receiveShadow=true;this.scene.add(pane);
    for(let i=-1;i<=1;i++)b.add(BOX,conc,v(x+i*(w/3),1.4,z+3.2),0,v(.075,2.8,.12));
    for(let i=0;i<6;i++)b.add(BOX,bench,v(x,.57,z+2.35+i*.09),0,v(w-3,.07,.065));
    b.add(BOX,bench,v(x,1.1,z+2.94),0,v(w-3,.7,.08));
    b.add(BOX,conc,v(x-2,.3,z+2.6),0,v(.09,.6,.5));b.add(BOX,conc,v(x+2,.3,z+2.6),0,v(.09,.6,.5));
    b.add(BOX, bench, v(x, 0.55, z + 2.6), 0, v(w - 3, 0.12, 0.6));
    b.build(this.scene);
    this.colliders.push({ minX: x - w / 2 + 0.4, maxX: x + w / 2 - 0.4, minZ: z + 2.9, maxZ: z + 3.6 });
  }
  private plane(w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number, rotY = Math.PI) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex }));
    m.position.set(x, y, z); m.rotation.y = rotY; this.scene.add(m); return m;
  }

  private buildParada() {
    const [x, z] = L.parada;
    this.shelter(x, z, 9);
    const pb = new Batcher(); pb.add(BOX, flat('#26313a', 0.6), v(x + 5.5, 1.6, z - 0.4), 0, v(0.12, 3.2, 0.12)); pb.build(this.scene);
    this.plane(1.4, 0.9, textSign(['0.214', 'PARADA 214'], { w: 256, h: 160, bg: '#0f5f74', accent: '#2fe3a1' }), x + 5.5, 3.1, z - 0.48);
    this.plane(4.5, 1.6, textSign(['PARTICIPA DF', 'sua voz tem protocolo'], { w: 512, h: 180, bg: '#13323c', accent: '#e2b53a' }), x - 1.6, 1.5, z + 3.1);
    this.footprints.push({ x, z: z + 2, w: 9, d: 4, kind: 'poi', label: 'Parada 214' });

    const [cx, cz] = L.paradaCed;
    this.shelter(cx, cz, 7);
    this.plane(2.2, 1.4, textSign(['ITINERÁRIO 0.214', '— via principal (sem desvio) —'], { w: 512, h: 300, bg: '#f2efe6', fg: '#14323c', accent: '#0f5f74' }), cx + 1.4, 1.7, cz + 3.1);
    this.footprints.push({ x: cx, z: cz + 2, w: 7, d: 3.6, kind: 'poi', label: 'Parada CED' });

    // meio-fio alto, sem rampa, na faixa de pedestres
    const [rx] = L.rampa;
    const r = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 0.45), flat('#e4ddcf'));
    r.position.set(rx, 0.2, 8.3); r.castShadow = true; this.scene.add(r);
  }

  /* ---------------- obra na via + desvio ---------------- */
  private buildObra() {
    const b = new Batcher();
    const barrier = new THREE.MeshStandardMaterial({ map: stripes(), roughness: 0.7 });
    const cone = flat('#ff6a13', 0.6), dirt = flat('#9a5b37', 1), yellow = flat('#e8b21f', 0.6), dark = flat('#2a2f33', 0.6), glass = flat('#5f7f8a', 0.2, 0.3);
    // área escavada
    b.add(BOX, dirt, v(10, 0.2, 0), 0, v(30, 0.4, 14));
    b.add(new THREE.ConeGeometry(4, 3, 7), dirt, v(16, 1.5, 2));
    b.add(new THREE.ConeGeometry(2.6, 2, 6), dirt, v(4, 1, -3));
    // barreiras listradas
    for (let z = -7; z <= 7; z += 2.4) { b.add(BOX, barrier, v(-6.5, 0.6, z), 0, v(0.4, 1.0, 2.2)); b.add(BOX, barrier, v(26.5, 0.6, z), 0, v(0.4, 1.0, 2.2)); }
    for (let x = -6; x <= 26; x += 2.4) { b.add(BOX, barrier, v(x, 0.6, -7.6), 0, v(2.2, 1.0, 0.4)); b.add(BOX, barrier, v(x, 0.6, 7.6), 0, v(2.2, 1.0, 0.4)); }
    for (let i = 0; i < 8; i++) b.add(new THREE.ConeGeometry(0.3, 0.8, 6), cone, v(-9 - i * 1.6, 0.5, -3.5 + (i % 2)));
    // retroescavadeira estilizada
    b.add(BOX, yellow, v(11, 1.5, -2), 0.3, v(4.5, 1.6, 2.4));
    b.add(BOX, yellow, v(10.4, 3.0, -2.2), 0.3, v(2, 1.6, 2));
    b.add(BOX, glass, v(10.4, 3.1, -1.1), 0.3, v(1.6, 1.1, 0.1));
    b.add(BOX, dark, v(9.6, 0.6, -0.9), 0.3, v(5, 1.0, 0.5));
    b.add(BOX, dark, v(12.2, 0.6, -3.1), 0.3, v(5, 1.0, 0.5));
    b.add(BOX, yellow, v(14.6, 3.0, -1), -0.5, v(4.5, 0.4, 0.4));
    b.add(BOX, yellow, v(16.4, 1.8, -0.2), 0, v(0.4, 2.6, 0.4));
    b.build(this.scene);
    this.colliders.push({ minX: -7, maxX: 27, minZ: -8, maxZ: 8 });

    // placa "OBRA — DESVIO"
    const [px, pz] = L.obraPlaca;
    const placa = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2), new THREE.MeshStandardMaterial({ map: textSign(['OBRA', 'DESVIO DE LINHAS', 'PELA VIA DA QUADRA 300'], { w: 512, h: 300, bg: '#ff7a1a', fg: '#111' }), side: THREE.DoubleSide }));
    placa.position.set(px, 2.4, pz); placa.rotation.y = 0.35; this.scene.add(placa);
    const pb = new Batcher(); const pole = flat('#5a5f63', 0.5, 0.4);
    pb.add(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), pole, v(px - 1.4, 1.2, pz));
    pb.add(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), pole, v(px + 1.4, 1.2, pz));
    pb.build(this.scene);

    // tapumes: barreira de pedestres em x≈9
    const tap = new THREE.MeshStandardMaterial({ map: textSign(['OBRA', 'passagem interditada'], { w: 256, h: 128, bg: '#e8e2d2', fg: '#7a3d17', accent: '#ff7a1a' }), roughness: 0.9 });
    const tb = new Batcher();
    const W = PEDESTRIAN_WALL;
    for (let z = W.z1; z < W.z2; z += 4) {
      if (z > -9 && z < 9) continue;       // obra ocupa a via
      if (z > -52 && z < -40) continue;    // passagem de ônibus do desvio
      tb.add(BOX, tap, v(9, 1.2, z + 2), 0, v(0.3, 2.4, 3.9));
    }
    tb.build(this.scene);
    // cancela do desvio
    const gb = new Batcher(); const red = flat('#c8332a'), white = flat('#f1f1f1');
    gb.add(BOX, dark, v(9, 0.6, -51.5), 0, v(0.5, 1.2, 0.5));
    gb.add(BOX, dark, v(9, 0.6, -40.5), 0, v(0.5, 1.2, 0.5));
    for (let i = 0; i < 5; i++) gb.add(BOX, i % 2 ? red : white, v(7.6, 1.15, -51.5 + i * 0.6 + 0.3), 0, v(0.1, 0.12, 0.6));
    gb.build(this.scene);
    const onlyBus = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), new THREE.MeshStandardMaterial({ map: textSign(['SOMENTE ÔNIBUS', 'desvio da obra'], { w: 256, h: 128, bg: '#0f5f74', accent: '#e2b53a' }), side: THREE.DoubleSide }));
    onlyBus.position.set(9, 2.2, -52.6); onlyBus.rotation.y = Math.PI / 2; this.scene.add(onlyBus);
    this.colliders.push({ minX: W.x1, maxX: W.x2, minZ: W.z1, maxZ: W.z2, pedestrianOnly: true });
    this.footprints.push({ x: 10, z: 0, w: 34, d: 16, kind: 'obra', label: 'Obra' });
  }

  /* ---------------- iluminação pública ---------------- */
  private buildStreetLights() {
    const b = new Batcher(); const pole = flat('#4b5257', 0.5, 0.5); const broken = flat('#2b2f31', 0.7);
    const put = (x: number, z: number, rot: number, isBroken = false) => {
      b.add(new THREE.CylinderGeometry(0.1, 0.15, 7, 6), pole, v(x, 3.5, z));
      if (isBroken) {
        b.add(BOX, pole, v(x + Math.sin(rot) * 0.9, 6.9, z + Math.cos(rot) * 0.9), rot, v(0.12, 0.12, 1.8));
        b.add(BOX, broken, v(x + Math.sin(rot) * 1.6, 6.2, z + Math.cos(rot) * 1.6), rot + 0.4, v(0.5, 0.18, 0.9));
      } else {
        b.add(BOX, pole, v(x + Math.sin(rot) * 0.9, 6.9, z + Math.cos(rot) * 0.9), rot, v(0.12, 0.12, 1.8));
        b.add(BOX, this.lampMat, v(x + Math.sin(rot) * 1.7, 6.8, z + Math.cos(rot) * 1.7), rot, v(0.5, 0.16, 0.9));
      }
      this.colliders.push({ minX: x - 0.25, maxX: x + 0.25, minZ: z - 0.25, maxZ: z + 0.25 });
    };
    for (let x = -150; x <= 150; x += 22) {
      if (x > -10 && x < 30) continue;
      put(x, -10.2, 0); put(x + 11, 10.2, Math.PI);
    }
    [-15, -27, -39, -51, -63].forEach((z, i) => put(-77.4, z, -Math.PI / 2, i === 2 || i === 3));
    b.build(this.scene);
    // poucas luzes reais (só à noite, na abertura)
    for (const [x, z] of [[-60, 10], [-104, -10], [70, 10], [62, 22]] as V2[]) {
      const l = new THREE.PointLight('#ffc977', 60, 28, 2); l.position.set(x, 6, z); l.visible = false;
      this.nightLights.push(l); this.scene.add(l);
    }
  }

  /* ---------------- área central (leste) ---------------- */
  private buildEast() {
    const b = new Batcher();
    const white = flat('#eceae3', 0.8), teal = flat('#1b6e73', 0.7), green = flat('#2c7a54', 0.7), glass = flat('#4c6f7c', 0.25, 0.3), conc = flat('#c3bcad', 0.9), fence = flat('#4a5358', 0.5, 0.5), yellow = flat('#e2b53a', 0.6), blue = flat('#2b6f9a', 0.7);
    // Centro de Ensino — CED (2 pavimentos, painéis coloridos, brises)
    const cx = 84, cz = -46;
    b.add(BOX, white, v(cx, 3.6, cz), 0, v(40, 7.2, 14));
    b.add(BOX, glass, v(cx, 2.1, cz + 7.05), 0, v(38, 1.6, 0.1));
    b.add(BOX, glass, v(cx, 5.3, cz + 7.05), 0, v(38, 1.6, 0.1));
    for (let i = 0; i < 20; i++) b.add(BOX, i % 5 === 0 ? yellow : teal, v(cx - 19 + i * 2, 3.6, cz + 7.4), 0, v(0.35, 7, 0.6));
    b.add(BOX, conc, v(cx, 7.5, cz), 0, v(41, 0.6, 15));
    this.colliders.push({ minX: cx - 20.5, maxX: cx + 20.5, minZ: cz - 7.5, maxZ: cz + 8 });
    // muro e portão
    for (let x = 60; x <= 106; x += 2) {
      if (x > 76 && x < 84) continue;
      b.add(BOX, fence, v(x, 1, -30), 0, v(0.12, 2, 0.12));
    }
    b.add(BOX, fence, v(68, 1.9, -30), 0, v(16, 0.1, 0.1)); b.add(BOX, fence, v(95, 1.9, -30), 0, v(22, 0.1, 0.1));
    this.colliders.push({ minX: 59, maxX: 77, minZ: -30.4, maxZ: -29.6 }, { minX: 83, maxX: 107, minZ: -30.4, maxZ: -29.6 });
    this.colliders.push({ minX: 59, maxX: 60, minZ: -70, maxZ: -30 }, { minX: 106, maxX: 107, minZ: -70, maxZ: -30 });
    b.add(BOX, teal, v(80, 3.2, -30), 0, v(9, 0.5, 1.2));
    // quadra poliesportiva
    const court = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), new THREE.MeshStandardMaterial({ map: courtTexture(), roughness: 0.9 }));
    court.rotation.x = -Math.PI / 2; court.position.set(84, 0.12, -64); court.receiveShadow = true; this.scene.add(court);
    b.add(BOX, fence, v(72, 1.6, -64), 0, v(0.15, 3.2, 0.15)); b.add(BOX, fence, v(96, 1.6, -64), 0, v(0.15, 3.2, 0.15));
    b.add(BOX, white, v(72.3, 3.0, -64), 0, v(0.1, 1, 1.6)); b.add(BOX, white, v(95.7, 3.0, -64), 0, v(0.1, 1, 1.6));
    const ced = new THREE.Mesh(new THREE.PlaneGeometry(11, 1.6), new THREE.MeshStandardMaterial({ map: textSign(['CENTRO DE ENSINO 214'], { w: 768, h: 112, bg: '#0f3d44', accent: '#2fe3a1' }) }));
    ced.position.set(80, 4.0, -29.35); this.scene.add(ced);
    this.footprints.push({ x: cx, z: cz, w: 40, d: 14, kind: 'school', label: 'Centro de Ensino' });

    // Administração Regional — bloco modernista sobre pilotis com cobertura curva
    const ax = 62, az = 38;
    for (let i = 0; i < 6; i++) for (const zz of [-5, 5]) {
      const xx = ax - 12.5 + i * 5;
      b.add(new THREE.CylinderGeometry(0.4, 0.3, 4, 7), white, v(xx, 2, az + zz));
      this.colliders.push({ minX: xx - 0.5, maxX: xx + 0.5, minZ: az + zz - 0.5, maxZ: az + zz + 0.5 });
    }
    b.add(BOX, white, v(ax, 6.5, az), 0, v(30, 5, 13));
    b.add(BOX, glass, v(ax, 6.5, az - 6.55), 0, v(28, 3.2, 0.1));
    b.add(BOX, glass, v(ax, 2, az + 2), 0, v(10, 4, 6));
    this.colliders.push({ minX: ax - 5, maxX: ax + 5, minZ: az - 1, maxZ: az + 5 });
    const roofG = new THREE.CylinderGeometry(9, 9, 32, 18, 1, true, -0.7, 1.4).rotateX(-Math.PI / 2).rotateY(Math.PI / 2);
    b.add(roofG, conc, v(ax, 0.6, az), 0, v(1, 1, 1));
    const adm = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.5), new THREE.MeshStandardMaterial({ map: textSign(['ADMINISTRAÇÃO REGIONAL'], { w: 768, h: 96, bg: '#f1eee6', fg: '#0f3d44' }) }));
    adm.position.set(ax, 9.4, az - 6.62); adm.rotation.y = Math.PI; this.scene.add(adm);
    this.footprints.push({ x: ax, z: az, w: 30, d: 13, kind: 'gov', label: 'Administração Regional' });

    // UBS
    const [ux, uz] = L.ubs;
    b.add(BOX, white, v(ux, 2.2, uz + 6), 0, v(22, 4.4, 12));
    b.add(BOX, green, v(ux, 4.5, uz + 6), 0, v(22.4, 0.5, 12.4));
    b.add(BOX, blue, v(ux, 1.2, uz + 0.02), 0, v(22, 0.4, 0.1));
    this.colliders.push({ minX: ux - 11, maxX: ux + 11, minZ: uz, maxZ: uz + 12 });
    const ubs = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.3), new THREE.MeshStandardMaterial({ map: textSign(['UNIDADE BÁSICA DE SAÚDE'], { w: 640, h: 100, bg: '#f4f7f6', fg: '#1d6b5a' }) }));
    ubs.position.set(ux, 3.4, uz - 0.05); ubs.rotation.y = Math.PI; this.scene.add(ubs);
    this.footprints.push({ x: ux, z: uz + 6, w: 22, d: 12, kind: 'health', label: 'UBS' });
    b.build(this.scene);
  }

  private buildShops() {
    const b = new Batcher(); const wall = flat('#e7dfcf'), cols = ['#c8562e', '#1d6b5a', '#2b6f9a', '#d4a72c'].map(c => flat(c, 0.7)), dark = flat('#2b3237', 0.6);
    for (let i = 0; i < 4; i++) {
      const x = -38 + i * 7;
      b.add(BOX, wall, v(x, 2, 18), 0, v(6.6, 4, 6));
      b.add(BOX, cols[i], v(x, 3.1, 14.6), 0, v(6.4, 0.15, 1.6));
      b.add(BOX, dark, v(x, 1.4, 14.95), 0, v(3.6, 2.6, 0.1));
    }
    b.build(this.scene);
    this.colliders.push({ minX: -41.5, maxX: -13.5, minZ: 15, maxZ: 21 });
    this.footprints.push({ x: -27.5, z: 18, w: 28, d: 6, kind: 'shop', label: 'Comércio local' });
  }

  /* ---------------- vegetação (ipês e cerrado) ---------------- */
  private buildTrees() {
    const trunkM = flat('#5b4330', 0.95);
    const crowns = [flat('#e8b81f', 0.8), flat('#d86aa2', 0.8), flat('#5f7d3a', 0.9), flat('#6f8a3e', 0.9)];
    const b = new Batcher();
    let s = 42; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const free = (x: number, z: number) => {
      if (Math.abs(z) < 12) return false;
      for (const [x1, z1, x2, z2] of ROADS) if (x > x1 - 4 && x < x2 + 4 && z > z1 - 4 && z < z2 + 4) return false;
      for (const f of this.footprints) if (Math.abs(x - f.x) < f.w / 2 + 4 && Math.abs(z - f.z) < f.d / 2 + 4) return false;
      if (x > 4 && x < 14) return false;
      if (x > 56 && x < 110 && z < -26 && z > -74) return false;
      return true;
    };
    let placed = 0;
    for (let i = 0; i < 900 && placed < 150; i++) {
      const x = WORLD.minX + rnd() * (WORLD.maxX - WORLD.minX), z = WORLD.minZ + rnd() * (WORLD.maxZ - WORLD.minZ);
      if (!free(x, z)) continue;
      placed++;
      const kind = rnd(); const crown = kind < 0.18 ? crowns[0] : kind < 0.26 ? crowns[1] : kind < 0.7 ? crowns[2] : crowns[3];
      const h = 2.6 + rnd() * 2.6, lean = (rnd() - 0.5) * 0.4;
      const tg = new THREE.CylinderGeometry(0.16, 0.28, h, 5); tg.rotateZ(lean);
      b.add(tg, trunkM, v(x, h / 2, z));
      const r = 1.6 + rnd() * 1.8;
      const cg = new THREE.SphereGeometry(r,12,9); cg.scale(1.25, 0.62, 1.15);
      b.add(cg, crown, v(x + Math.sin(-lean) * h * 0.5, h + r * 0.3, z), rnd() * 6);
      this.colliders.push({ minX: x - 0.4, maxX: x + 0.4, minZ: z - 0.4, maxZ: z + 0.4 });
    }
    // arbustos de cerrado
    const shrub = flat('#76884a', 1);
    for (let i = 0; i < 160; i++) {
      const x = WORLD.minX + rnd() * (WORLD.maxX - WORLD.minX), z = WORLD.minZ + rnd() * (WORLD.maxZ - WORLD.minZ);
      if (!free(x, z)) continue;
      b.add(new THREE.SphereGeometry(0.6 + rnd() * 0.5,10,7).scale(1.3, 0.6, 1.2), shrub, v(x, 0.3, z));
    }
    b.build(this.scene);
  }

  private buildHorizon() {
    const b = new Batcher(); const far = flat('#9fb0b3', 1), farD = flat('#8a9ca0', 1);
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2, r = 230 + (i % 3) * 25;
      const h = 14 + ((i * 37) % 30);
      b.add(BOX, i % 2 ? far : farD, v(Math.cos(a) * r, h / 2, Math.sin(a) * r * 0.8), -a, v(24 + (i % 4) * 6, h, 10));
    }
    b.build(this.scene, false);
  }

  /* ---------------- chuva ---------------- */
  setRain(on: boolean) {
    this.rainOn = on;
    if (on && !this.rain) {
      const N = 2200, pos = new Float32Array(N * 6);
      for (let i = 0; i < N; i++) {
        const x = (Math.random() - 0.5) * 90, y = Math.random() * 40, z = (Math.random() - 0.5) * 90;
        pos.set([x, y, z, x + 0.05, y - 0.9, z], i * 6);
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#b9d2dc', transparent: true, opacity: 0.45 }));
      this.rain.frustumCulled = false;
      this.scene.add(this.rain);
    }
    if (this.rain && !this.rain.parent) this.scene.add(this.rain);
    if (this.rain) this.rain.visible = on;
    const fog = this.scene.fog as THREE.Fog;
    fog.far = on ? 180 : 340; fog.color.set(on ? '#9fb0b5' : '#cbdadc');
    this.sun.intensity = on ? 1.0 : 2.5;
  }

  update(dt: number, t: number, center: THREE.Vector3) {
    if (this.rain && this.rainOn) {
      this.rain.position.set(center.x, 0, center.z);
      const p = this.rain.geometry.getAttribute('position') as THREE.BufferAttribute;
      const a = p.array as Float32Array;
      for (let i = 0; i < a.length; i += 6) {
        a[i + 1] -= dt * 38; a[i + 4] -= dt * 38;
        if (a[i + 4] < 0) { a[i + 1] += 40; a[i + 4] += 40; }
      }
      p.needsUpdate = true;
    }
    this.animated.forEach(f => f(dt, t));
  }

  /** resolve colisão de um círculo (jogador) contra os colisores */
  resolve(pos: THREE.Vector3, r: number, pedestrian = true) {
    pos.x = Math.max(WORLD.minX + 2, Math.min(WORLD.maxX - 2, pos.x));
    pos.z = Math.max(WORLD.minZ + 2, Math.min(WORLD.maxZ - 2, pos.z));
    for (const c of this.colliders) {
      if (c.pedestrianOnly && !pedestrian) continue;
      const nx = Math.max(c.minX, Math.min(pos.x, c.maxX));
      const nz = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
      const dx = pos.x - nx, dz = pos.z - nz;
      const d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        if (d2 > 1e-6) { const d = Math.sqrt(d2); pos.x = nx + (dx / d) * r; pos.z = nz + (dz / d) * r; }
        else {
          // dentro do retângulo: empurra pelo lado mais próximo
          const pushes = [pos.x - c.minX, c.maxX - pos.x, pos.z - c.minZ, c.maxZ - pos.z];
          const m = Math.min(...pushes); const i = pushes.indexOf(m);
          if (i === 0) pos.x = c.minX - r; else if (i === 1) pos.x = c.maxX + r; else if (i === 2) pos.z = c.minZ - r; else pos.z = c.maxZ + r;
        }
      }
    }
  }
}
