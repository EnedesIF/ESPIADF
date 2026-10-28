type Handler = (payload: any) => void;

/** Barramento de eventos do jogo — desacopla sistemas, UI e telemetria. */
export class EventBus {
  private map = new Map<string, Set<Handler>>();
  on(ev: string, h: Handler) {
    if (!this.map.has(ev)) this.map.set(ev, new Set());
    this.map.get(ev)!.add(h);
    return () => this.map.get(ev)?.delete(h);
  }
  emit(ev: string, payload?: any) {
    this.map.get(ev)?.forEach(h => { try { h(payload); } catch (e) { console.error('[bus]', ev, e); } });
    this.map.get('*')?.forEach(h => h({ ev, payload }));
  }
  clear() { this.map.clear(); }
}

export const bus = new EventBus();
