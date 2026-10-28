import * as THREE from 'three';
import { Avatar } from './Avatar';
import type { NpcDef } from '@/types';

export class NPC {
  readonly avatar: Avatar;
  readonly pos: THREE.Vector3;
  private baseFacing: number;
  private ring: THREE.Mesh;
  talking = false;
  heard = false;

  constructor(readonly def: NpcDef, scene: THREE.Scene) {
    this.avatar = new Avatar(def.look, def.pose ?? 'stand');
    if (def.uniform) this.avatar.addUniform(def.uniform);
    this.pos = new THREE.Vector3(def.pos[0], 0, def.pos[1]);
    this.baseFacing = def.facing ?? 0;
    this.avatar.root.position.copy(this.pos);
    this.avatar.root.rotation.y = this.baseFacing;
    scene.add(this.avatar.root);
    // anel de interação (forma + cor; o prompt textual também aparece)
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.78, 24).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: '#2fe3a1', transparent: true, opacity: 0 }));
    this.ring.position.set(this.pos.x, 0.18, this.pos.z);
    scene.add(this.ring);
  }

  update(dt: number, player: THREE.Vector3, highlighted: boolean) {
    const m = this.ring.material as THREE.MeshBasicMaterial;
    m.opacity += ((highlighted ? 0.9 : this.heard ? 0 : 0.28) - m.opacity) * Math.min(1, dt * 8);
    m.color.set(this.heard ? '#9eb0b5' : '#2fe3a1');
    let want = this.baseFacing;
    if (this.talking || highlighted) want = Math.atan2(player.x - this.pos.x, player.z - this.pos.z);
    if (this.def.pose === 'wheelchair' && !this.talking) want = this.baseFacing;
    const r = this.avatar.root;
    let d = want - r.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
    r.rotation.y += d * Math.min(1, dt * 5);
    this.avatar.update(dt, 0);
  }
}
