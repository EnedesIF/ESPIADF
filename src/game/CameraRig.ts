import * as THREE from 'three';
import { settings } from './Settings';

/** Câmera em terceira pessoa (isométrica moderna) com órbita e zoom. */
export class CameraRig {
  target = new THREE.Vector3();
  yaw = Math.PI * 0.18;
  pitch = 0.78;
  distance = 22;
  minDist = 9; maxDist = 42;
  mode: 'follow' | 'orbit' | 'cinematic' = 'follow';
  private cur = new THREE.Vector3();
  private look = new THREE.Vector3();
  orbitCenter = new THREE.Vector3();
  orbitRadius = 120; orbitHeight = 55; orbitSpeed = 0.035;
  cineFrom?: THREE.Vector3; cineLook?: THREE.Vector3;

  constructor(readonly camera: THREE.PerspectiveCamera) {}

  rotate(dx: number, dy: number) {
    this.yaw -= dx * 0.006;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.004, 0.35, 1.25);
  }
  zoom(d: number) { this.distance = THREE.MathUtils.clamp(this.distance + d, this.minDist, this.maxDist); }

  snap() { this.update(1, 0, true); }

  update(dt: number, t: number, instant = false) {
    if (this.mode === 'orbit') {
      const a = t * this.orbitSpeed * (settings.reduceMotion ? 0.3 : 1);
      this.camera.position.set(
        this.orbitCenter.x + Math.cos(a) * this.orbitRadius,
        this.orbitHeight,
        this.orbitCenter.z + Math.sin(a) * this.orbitRadius);
      this.camera.lookAt(this.orbitCenter);
      return;
    }
    if (this.mode === 'cinematic' && this.cineFrom && this.cineLook) {
      this.cur.lerp(this.cineFrom, instant ? 1 : 1 - Math.pow(0.02, dt));
      this.look.lerp(this.cineLook, instant ? 1 : 1 - Math.pow(0.02, dt));
      this.camera.position.copy(this.cur); this.camera.lookAt(this.look);
      return;
    }
    const off = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)).multiplyScalar(this.distance);
    const desired = this.target.clone().add(off);
    const k = instant ? 1 : 1 - Math.pow(0.0008, dt);
    this.cur.lerp(desired, k);
    this.look.lerp(this.target.clone().add(new THREE.Vector3(0, 1.4, 0)), k);
    this.camera.position.copy(this.cur);
    this.camera.lookAt(this.look);
  }

  /** vetor "para frente" da câmera no plano XZ */
  forward() { return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)); }
}
