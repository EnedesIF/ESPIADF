/** Teclado (WASD/setas), mouse e toque. Arrastar = girar câmera; toque/clique curto = mover até o ponto. */
export class Input {
  private abort = new AbortController();
  keys = new Set<string>();
  private pressed = new Set<string>();
  click: { x: number; y: number } | null = null;
  private down: { x: number; y: number; id: number } | null = null;
  private dragging = false;
  enabled = true;
  onDrag?: (dx: number, dy: number) => void;
  onWheel?: (d: number) => void;

  constructor(private el: HTMLElement) {
    const listen = (el: any, event: string, fn: (e: any) => void, options: any = {}) => el.addEventListener(event, fn, { ...options, signal: this.abort.signal });
    listen(window, 'keydown', e => {
      if (this.isTyping(e)) return;
      const k = e.key.toLowerCase();
      if (!this.keys.has(k)) this.pressed.add(k);
      this.keys.add(k);
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) && this.enabled) e.preventDefault();
    });
    listen(window, 'keyup', e => this.keys.delete(e.key.toLowerCase()));
    listen(window, 'blur', () => this.keys.clear());

    listen(el, 'pointerdown', e => {
      this.down = { x: e.clientX, y: e.clientY, id: e.pointerId }; this.dragging = false;
      el.setPointerCapture?.(e.pointerId);
    });
    listen(el, 'pointermove', e => {
      if (!this.down || e.pointerId !== this.down.id) return;
      const dx = e.clientX - this.down.x, dy = e.clientY - this.down.y;
      if (!this.dragging && Math.hypot(dx, dy) > 7) this.dragging = true;
      if (this.dragging) { this.onDrag?.(e.movementX || dx * 0.2, e.movementY || dy * 0.2); }
    });
    listen(el, 'pointerup', e => {
      if (this.down && !this.dragging && this.enabled) this.click = { x: e.clientX, y: e.clientY };
      this.down = null; this.dragging = false;
    });
    listen(el, 'wheel', e => { e.preventDefault(); this.onWheel?.(e.deltaY * 0.02); }, { passive: false });
    listen(el, 'contextmenu', e => e.preventDefault());
  }

  dispose() { this.abort.abort(); this.keys.clear(); this.pressed.clear(); this.click = null; }

  private isTyping(e: KeyboardEvent) {
    const t = e.target as HTMLElement;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  }

  /** true apenas no quadro em que a tecla foi pressionada */
  wasPressed(k: string) { return this.pressed.has(k); }
  endFrame() { this.pressed.clear(); this.click = null; }

  axis() {
    if (!this.enabled) return { x: 0, z: 0, run: false };
    const k = this.keys;
    const x = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
    const z = (k.has('s') || k.has('arrowdown') ? 1 : 0) - (k.has('w') || k.has('arrowup') ? 1 : 0);
    return { x, z, run: k.has('shift') };
  }
}
