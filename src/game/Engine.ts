import * as THREE from 'three';
import { settings } from './Settings';

type Updater = (dt: number, t: number) => void;

/** Motor de renderização único (um contexto WebGL para todo o jogo). */
export class Engine {
  readonly renderer: THREE.WebGLRenderer | null;
  readonly illustratedOnly: boolean;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, 0.5, 900);
  private updaters = new Set<Updater>();
  private clock = new THREE.Clock();
  private running = false;
  private fpsAcc = 0; private fpsFrames = 0; private lowFpsStreak = 0;
  degraded = false;
  private illustrated=false;
  setIllustrated(value:boolean){this.illustrated=value}
  onDegrade?: () => void;

  constructor(readonly canvas: HTMLCanvasElement) {
    const leve = settings.quality === 'leve';
    let renderer:THREE.WebGLRenderer|null=null;
    try {renderer=new THREE.WebGLRenderer({canvas,antialias:!leve,powerPreference:'high-performance'});} catch { /* The illustrated city remains fully usable without GPU rendering. */ }
    this.renderer=renderer;this.illustratedOnly=!renderer;
    if(renderer){
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
      renderer.shadowMap.enabled=settings.quality!=='leve';renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    }else canvas.hidden=true;
    this.applyPixelRatio();
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement || document.body);
    this.resize();
  }

  applyPixelRatio() {
    if(!this.renderer)return;
    const dpr = window.devicePixelRatio || 1;
    const q = this.degraded ? 'leve' : settings.quality;
    this.renderer.setPixelRatio(q === 'leve' ? Math.min(dpr, 1) : q === 'alta' ? Math.min(dpr, 2) : Math.min(dpr, 1.5));
    this.renderer.shadowMap.enabled = q !== 'leve';
  }

  resize() {
    const el = this.canvas.parentElement || document.body;
    const w = el.clientWidth || window.innerWidth, h = el.clientHeight || window.innerHeight;
    this.renderer?.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  setScene(scene: THREE.Scene) { this.scene = scene; }
  add(fn: Updater) { this.updaters.add(fn); return () => this.updaters.delete(fn); }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      requestAnimationFrame(loop);
      const dt = Math.min(0.1, this.clock.getDelta());
      const t = this.clock.elapsedTime;
      this.updaters.forEach(u => u(dt, t));
      if(!this.illustrated)this.renderer?.render(this.scene, this.camera);
      this.monitor(dt);
    };
    requestAnimationFrame(loop);
  }

  /** Qualidade automática: se o FPS ficar baixo, reduz resolução e sombras. */
  private monitor(dt: number) {
    if (settings.quality !== 'auto' || this.degraded) return;
    this.fpsAcc += dt; this.fpsFrames++;
    if (this.fpsAcc >= 1) {
      const fps = this.fpsFrames / this.fpsAcc;
      this.fpsAcc = 0; this.fpsFrames = 0;
      this.lowFpsStreak = fps < 32 ? this.lowFpsStreak + 1 : 0;
      if (this.lowFpsStreak >= 4) {
        this.degraded = true; this.applyPixelRatio(); this.onDegrade?.();
      }
    }
  }
}
