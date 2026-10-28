import * as THREE from 'three';
import { Avatar } from './Avatar';
import type { AvatarConfig } from '@/types';
import type { CityWorld } from '@/worlds/CityWorld';
import type { Input } from '@/game/Input';
import type { CameraRig } from '@/game/CameraRig';
import { GAME } from '@/config';

export class Player {
  readonly avatar: Avatar;
  readonly pos = new THREE.Vector3();
  heading = 0;
  speed = 0;
  frozen = false;
  hidden = false;
  moveTarget: THREE.Vector3 | null = null;
  private marker: THREE.Mesh;

  constructor(cfg: AvatarConfig, private world: CityWorld, scene: THREE.Scene) {
    this.avatar = new Avatar(cfg);
    scene.add(this.avatar.root);
    // anel de destino (clique/toque)
    this.marker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 20).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: '#2fe3a1', transparent: true, opacity: 0.8 }));
    this.marker.visible = false; scene.add(this.marker);
  }

  setAvatar(cfg: AvatarConfig) { this.avatar.rebuild(cfg); }

  teleport(x: number, z: number) {
    this.pos.set(x, 0, z); this.moveTarget = null; this.marker.visible = false;
    this.avatar.root.position.copy(this.pos);
  }

  goTo(p: THREE.Vector3) { this.moveTarget = p.clone(); this.marker.position.set(p.x, 0.2, p.z); this.marker.visible = true; }

  update(dt: number, input: Input, rig: CameraRig) {
    this.avatar.root.visible = !this.hidden;
    if (this.frozen || this.hidden) { this.speed = 0; this.avatar.update(dt, 0); return; }
    const ax = input.axis();
    const dir = new THREE.Vector3();
    if (ax.x || ax.z) {
      this.moveTarget = null; this.marker.visible = false;
      const f = rig.forward(); const r = new THREE.Vector3(-f.z, 0, f.x);
      dir.addScaledVector(f, -ax.z).addScaledVector(r, ax.x).normalize();
    } else if (this.moveTarget) {
      dir.subVectors(this.moveTarget, this.pos); dir.y = 0;
      if (dir.length() < 0.4) { this.moveTarget = null; this.marker.visible = false; dir.set(0, 0, 0); }
      else dir.normalize();
    }
    const target = dir.lengthSq() ? GAME.playerSpeed * (ax.run ? GAME.runMultiplier : 1) : 0;
    this.speed = THREE.MathUtils.lerp(this.speed, target, 1 - Math.pow(0.001, dt));
    if (dir.lengthSq()) {
      const want = Math.atan2(dir.x, dir.z);
      let d = want - this.heading; d = Math.atan2(Math.sin(d), Math.cos(d));
      this.heading += d * Math.min(1, dt * 12);
      const before = this.pos.clone();
      this.pos.addScaledVector(dir, this.speed * dt);
      this.world.resolve(this.pos, 0.38, true);
      // destino inalcançável (colisão): desiste
      if (this.moveTarget && before.distanceTo(this.pos) < this.speed * dt * 0.15) { this.moveTarget = null; this.marker.visible = false; }
    }
    this.avatar.root.position.copy(this.pos);
    this.avatar.root.rotation.y = this.heading;
    this.avatar.update(dt, this.speed);
    if (this.marker.visible) (this.marker.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(performance.now() / 150) * 0.3;
  }
}
