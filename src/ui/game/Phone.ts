import type { GameUI } from './GameUI';
import { h, clear, svgIcon } from '../dom';
import { PUBLIC_TOOLS, toolById } from '@/data/tools';
import { AGENCIES, agencyById } from '@/data/agencies';
import { ROLES, roleById } from '@/data/roles';
import { KIND_LABEL, KIND_MARK } from '@/systems/EvidenceSystem';
import { ROADS, BUS_ROUTE, BUS_ROUTE_OFFICIAL, FAST_TRAVEL, PEDESTRIAN_WALL, WORLD } from '@/worlds/layout';
import type { ToolResult, ToolBlock } from '@/types';
import { bus } from '@/game/EventBus';

type View = string;

/** O celular do personagem: interface central do jogo. */
export class Phone {
  private wrap = h('div', { class: 'phone-wrap' });
  private body = h('div', { class: 'body' });
  private sbar = h('div', { class: 'sbar' });
  private view: View = 'home';
  private stack: View[] = [];
  private timer: number | null = null;
  private isOpen = false;
  private toolState: Record<string, { q: string; result: ToolResult | null | undefined }> = {};

  constructor(private ui: GameUI) {
    const nav = h('div', { class: 'nav' },
      h('button', { onclick: () => this.back(), 'aria-label': 'Voltar' }, svgIcon('back', 16), 'VOLTAR'),
      h('button', { onclick: () => this.go('home', true), 'aria-label': 'Tela inicial' }, '●'),
      h('button', { onclick: () => this.close(), 'aria-label': 'Fechar celular' }, 'FECHAR', svgIcon('close', 16)));
    this.wrap.append(h('div', { class: 'phone', role: 'dialog', 'aria-label': 'Celular' }, h('div', { class: 'scr' }, this.sbar, this.body, nav)));
    bus.on('state', () => { if (this.isOpen && ['home', 'mensagens', 'equipe', 'missoes'].includes(this.view)) this.render(); });
  }

  get g() { return this.ui.g; }

  toggle() { this.isOpen ? this.close() : this.open(); }

  open(view: View = 'home') {
    const g = this.g;
    if (g.overlay !== 'none' && g.overlay !== 'phone') return;
    if (!this.isOpen) { this.ui.root.append(this.wrap); this.isOpen = true; g.open('phone'); g.ctx.log('phone_open'); }
    this.stack = []; this.go(view, true);
    this.timer ??= window.setInterval(() => this.tick(), 500);
  }

  close() {
    if (!this.isOpen) return;
    this.wrap.remove(); this.isOpen = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.g.overlay === 'phone') this.g.closeOverlay();
  }

  private go(v: View, reset = false) {
    if (reset) this.stack = []; else this.stack.push(this.view);
    this.view = v;
    if (v === 'mensagens') this.g.msgs.markAllRead();
    const tool = toolById(v);
    if (tool) this.g.tools.opened(tool.id);
    this.g.ctx.log('phone_app', { app: v });
    this.render();
  }
  private back() { const v = this.stack.pop(); if (v) { this.view = v; this.render(); } else if (this.view !== 'home') this.go('home', true); else this.close(); }

  private tick() {
    this.sbar.replaceChildren(h('span', {}, this.g.ctx.clock), h('span', {}, 'ESPIA DF  ▂▄▆ ▮'));
    if (this.view === 'mapa' || this.view === 'live') this.render(true);
    if (this.view === 'camera') this.render(true);
  }

  private appbar(title: string, url?: string) {
    return h('div', { class: 'appbar' }, h('h3', {}, title),
      url ? h('a', { class: 'ext', href: url, target: '_blank', rel: 'noopener', title: 'Abre o site oficial em outra aba' }, 'site oficial', svgIcon('external', 14)) : null);
  }

  private render(soft = false) {
    this.tick0();
    const v = this.view;
    if (soft && v !== 'mapa' && v !== 'live' && v !== 'camera') return;
    const scroll = this.body.scrollTop;
    clear(this.body);
    if (v === 'home') this.home();
    else if (v === 'mapa') this.map();
    else if (v === 'missoes') this.missions();
    else if (v === 'equipe') this.team();
    else if (v === 'mensagens') this.messages();
    else if (v === 'camera') this.camera();
    else if (v === 'live') this.live();
    else if (v === 'participa') this.participa();
    else if (v === 'portalgdf') this.portal();
    else if (v === 'dfnoponto') this.dfnoponto();
    else if (toolById(v)) this.searchTool(v);
    if (soft) this.body.scrollTop = scroll;
  }
  private tick0() { if (!this.sbar.childElementCount) this.tick(); }

  /* ---------------- home ---------------- */
  private home() {
    const unread = this.g.msgs.unread();
    const app = (id: string, name: string, icon: string, color = '#183a45', badge = 0) =>
      h('button', { class: 'app', onclick: () => id === 'dossie' ? (this.close(), this.ui.dossier.open()) : this.go(id) },
        h('span', { class: 'ic', style: { background: color } }, svgIcon(icon, 26)), h('span', { class: 'n' }, name),
        badge ? h('span', { class: 'badge' }, String(badge)) : null);
    this.body.append(
      h('div', { style: { fontFamily: 'var(--display)', fontSize: '2.6rem', fontWeight: 700, margin: '10px 0 0', letterSpacing: '-.03em' } }, this.g.ctx.clock),
      h('div', { class: 'muted', style: { fontSize: '.8rem' } }, this.g.mission.phase?.title ?? ''),
      h('div', { class: 'apps' },
        app('mapa', 'Mapa', 'map', '#1b4d3a'), app('dossie', 'Dossiê', 'folder', '#3a3315'), app('missoes', 'Missões', 'target', '#2a2440'),
        app('equipe', 'Equipe', 'team', '#123a4a'), app('mensagens', 'Mensagens', 'chat', '#123a4a', unread), app('camera', 'Câmera', 'camera', '#2b2b2b')),
      h('div', { class: 'apps-sec' }, 'SERVIÇOS PÚBLICOS'),
      h('div', { class: 'apps' }, PUBLIC_TOOLS.map(t => app(t.id, t.name, t.glyph, '#0f4f5e'))));
  }

  /* ---------------- mapa ---------------- */
  private map() {
    const g = this.g;
    this.body.append(this.appbar('Mapa'));
    this.body.append(this.minimap(true));
    const can = g.canFastTravel();
    this.body.append(h('div', { class: 'apps-sec' }, 'DESLOCAMENTO RÁPIDO'));
    if (!can) this.body.append(h('div', { class: 'empty' }, 'Liberado depois que você chegar ao Centro de Ensino. Por enquanto: a pé — ou de ônibus.'));
    else FAST_TRAVEL.forEach(f => this.body.append(h('button', { class: 'list-item', onclick: () => { g.fastTravel(f.id); this.close(); } },
      h('b', {}, f.name), h('small', {}, f.side === 'west' ? 'Bairro — Quadra 214' : 'Área central'))));
  }

  minimap(full = false) {
    const g = this.g;
    const vb = full ? { x: -150, z: -90, w: 300, h: 180 } : { x: -150, z: -90, w: 300, h: 180 };
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `${vb.x} ${vb.z} ${vb.w} ${vb.h}`); svg.setAttribute('class', 'minimap'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Mapa da Quadra 214 com sua posição');
    const add = (tag: string, a: Record<string, any>, text?: string) => { const e = document.createElementNS(ns, tag); for (const k in a) e.setAttribute(k, String(a[k])); if (text) e.textContent = text; svg.append(e); return e; };
    for (const [x1, z1, x2, z2] of ROADS) add('rect', { x: x1, y: z1, width: x2 - x1, height: z2 - z1, fill: '#2a3a40' });
    for (const f of g.world.footprints) if (f.kind !== 'road') add('rect', { x: f.x - f.w / 2, y: f.z - f.d / 2, width: f.w, height: f.d, fill: f.kind === 'obra' ? '#8a4a1c' : f.kind === 'school' ? '#1b6e73' : f.kind === 'gov' ? '#5b6a70' : '#3c4a4e' });
    add('rect', { x: PEDESTRIAN_WALL.x1, y: WORLD.minZ, width: PEDESTRIAN_WALL.x2 - PEDESTRIAN_WALL.x1, height: WORLD.maxZ - WORLD.minZ, fill: '#ff7a1a', opacity: .55 });
    for (const p of g.ctx.campaign.pois) {
      const done = p.evidence ? g.ev.has(p.evidence) : g.ctx.session.visited.includes(p.id);
      add('rect', { x: p.pos[0] - 2.2, y: p.pos[1] - 2.2, width: 4.4, height: 4.4, transform: `rotate(45 ${p.pos[0]} ${p.pos[1]})`, fill: done ? '#93aaae' : '#f2b84b' });
    }
    for (const n of g.npcs) add('circle', { cx: n.pos.x, cy: n.pos.z, r: 2, fill: n.heard ? '#93aaae' : '#2fe3a1' });
    for (const b of g.buses) add('rect', { x: b.pos.x - 3, y: b.pos.z - 1.5, width: 6, height: 3, fill: '#5bb6e6' });
    const pp = g.player.pos, hd = g.player.heading;
    add('path', { d: `M ${pp.x + Math.sin(hd) * 5} ${pp.z + Math.cos(hd) * 5} L ${pp.x + Math.sin(hd + 2.5) * 3.5} ${pp.z + Math.cos(hd + 2.5) * 3.5} L ${pp.x + Math.sin(hd - 2.5) * 3.5} ${pp.z + Math.cos(hd - 2.5) * 3.5} Z`, fill: '#fff', stroke: '#2fe3a1', 'stroke-width': 1 });
    if (full) {
      const leg = h('div', { class: 'legend', style: { marginTop: '6px' } },
        h('span', {}, h('i', { style: { background: '#fff' } }), 'você'), h('span', {}, h('i', { style: { background: '#2fe3a1' } }), 'pessoas (●)'),
        h('span', {}, h('i', { style: { background: '#f2b84b' } }), 'pontos a observar (◆)'), h('span', {}, h('i', { style: { background: '#ff7a1a' } }), 'obra / interdição'),
        h('span', {}, h('i', { style: { background: '#5bb6e6' } }), 'ônibus'));
      const wrap = h('div', {}); wrap.append(svg, leg); return wrap;
    }
    return svg as unknown as HTMLElement;
  }

  /* ---------------- missões ---------------- */
  private missions() {
    const g = this.g, c = g.ctx.campaign, s = g.ctx.session;
    this.body.append(this.appbar('Missões'), h('div', { class: 'eyebrow' }, `CAMPANHA ${c.number} // ${c.axis}`), h('h3', { style: { fontFamily: 'var(--display)', margin: '6px 0' } }, c.title),
      h('p', { class: 'muted', style: { fontSize: '.84rem', lineHeight: 1.45 } }, c.briefing));
    const idx = g.mission.phaseIndex();
    c.phases.forEach((p, i) => {
      if (p.id === 'encerrada') return;
      const st = i < idx ? '✓ CONCLUÍDA' : i === idx ? '▶ EM CURSO' : '◇ BLOQUEADA';
      this.body.append(h('div', { class: 'list-item' + (i === idx ? ' on' : '') }, h('small', { class: 'mono' }, st), h('b', {}, p.title),
        i === idx ? p.objectives.map(o => h('small', {}, `${g.mission.check(o.done) ? '■' : '□'} ${o.text}`)) : null));
    });
    if (s.phase === 'laboratorio') this.body.append(h('button', { class: 'btn block', onclick: () => { this.close(); this.ui.openLab(); } }, 'Abrir laboratório'));
    if (s.phase === 'conselho') this.body.append(h('button', { class: 'btn amber block', onclick: () => { this.close(); this.ui.openCouncil(); } }, 'Ir ao Conselho'));
  }

  /* ---------------- equipe ---------------- */
  private team() {
    const g = this.g;
    this.body.append(this.appbar('Equipe'), h('p', { class: 'muted', style: { fontSize: '.8rem' } }, 'Revezem o controle. Cada papel tem uma tarefa — o crédito vai para o papel.'));
    for (const m of g.ctx.team.members) {
      const r = roleById(m.role);
      const [a, b] = g.team.taskProgress(m.role);
      const done = g.ctx.session.roleTasksDone.includes(r.task.id);
      const isCtrl = g.ctx.session.controllerId === m.id;
      this.body.append(h('div', { class: 'list-item' + (isCtrl ? ' on' : '') },
        h('small', { class: 'mono', style: { color: 'var(--neon)' } }, r.name.toUpperCase()),
        h('b', {}, m.name, isCtrl ? '  · NO CONTROLE' : ''),
        h('small', {}, `${done ? '✓' : '□'} ${r.task.text} — ${a}/${b}`),
        !isCtrl ? h('button', { class: 'btn ghost sm', style: { marginTop: '6px' }, onclick: () => { g.team.setController(m.id); this.render(); } }, 'Passar o controle') : null));
    }
    const roles = new Set(g.ctx.team.members.map(m => m.role));
    const missing = ROLES.filter(r => !roles.has(r.id));
    if (missing.length) this.body.append(h('small', { class: 'muted' }, `Papéis sem integrante: ${missing.map(r => r.name).join(', ')}.`));
  }

  /* ---------------- mensagens ---------------- */
  private messages() {
    const all = [...this.g.msgs.all].reverse();
    this.body.append(this.appbar('Mensagens'));
    if (!all.length) this.body.append(h('div', { class: 'empty' }, 'Nenhuma mensagem ainda.'));
    for (const m of all) this.body.append(h('div', { class: 'msg k-' + (m.kind ?? '') }, h('div', { class: 'f' }, m.from, h('span', {}, m.at)), h('p', {}, m.text)));
  }

  /* ---------------- câmera ---------------- */
  private camera() {
    const g = this.g;
    this.body.append(this.appbar('Câmera'));
    const opp = g.opportunity;
    const pos = g.player.pos;
    const poi = g.ctx.campaign.pois.find(p => p.evidence && !g.ev.has(p.evidence) && Math.hypot(p.pos[0] - pos.x, p.pos[1] - pos.z) < p.radius + 1.5);
    let content: HTMLElement;
    if (opp) content = h('div', { class: 'viewfinder' }, h('div', {}, h('b', {}, opp.label), h('br'), h('button', { class: 'btn', style: { marginTop: '14px' }, onclick: () => { g.captureOpportunity(); this.render(); } }, 'Fotografar')));
    else if (poi) content = h('div', { class: 'viewfinder' }, h('div', {}, h('b', {}, poi.name), h('p', { class: 'muted', style: { fontSize: '.82rem' } }, poi.observation),
      h('button', { class: 'btn', onclick: () => { g.ev.collect(poi.evidence!, 'camera_app'); if (poi.flag) g.ctx.setFlag(poi.flag); this.render(); } }, 'Fotografar')));
    else content = h('div', { class: 'viewfinder' }, h('div', { class: 'muted', style: { fontSize: '.86rem' } }, 'Nada de novo no enquadramento.', h('br'), 'Aproxime-se de algo que valha registrar (◆ no mapa).'));
    this.body.append(content, h('p', { class: 'muted', style: { fontSize: '.76rem' } }, 'Fotos viram evidências de campo no dossiê.'));
  }

  /* ---------------- ferramentas de busca ---------------- */
  private renderBlocks(r: ToolResult) {
    const out: HTMLElement[] = [];
    for (const b of r.blocks as ToolBlock[]) {
      if (b.t === 'text') out.push(h('p', { style: { margin: 0, fontSize: '.84rem', lineHeight: 1.45 } }, b.v));
      if (b.t === 'note') out.push(h('span', { class: 'sim-badge' }, b.v));
      if (b.t === 'table') out.push(h('table', {}, h('thead', {}, h('tr', {}, b.head.map(x => h('th', {}, x)))), h('tbody', {}, b.rows.map(row => h('tr', {}, row.map(c => h('td', {}, String(c))))))));
      if (b.t === 'bars') {
        const max = Math.max(...b.items.map(i => i.v));
        out.push(h('div', { class: 'bars', role: 'img', 'aria-label': b.label + ': ' + b.items.map(i => `${i.k} ${i.v}${b.unit ?? ''}`).join(', ') },
          h('small', { class: 'muted' }, b.label),
          b.items.map(i => h('div', { class: 'b' }, h('span', {}, i.k), h('span', { class: 't' }, h('i', { style: { width: (i.v / max) * 100 + '%' } })), h('span', { class: 'mono' }, `${i.v}${b.unit ?? ''}`)))));
      }
    }
    return out;
  }

  private searchBox(toolId: string, after?: () => void) {
    const g = this.g;
    const st = this.toolState[toolId] ??= { q: '', result: undefined };
    const content = g.tools.content(toolId);
    const input = h('input', { value: st.q, placeholder: 'Pesquisar…', 'aria-label': 'Pesquisar' });
    const run = (q: string) => { st.q = q; st.result = q.trim() ? g.tools.query(toolId, q) : undefined; this.render(); after?.(); };
    const form = h('form', { class: 'search' }, input, h('button', { type: 'submit', 'aria-label': 'Buscar' }, svgIcon('search', 18)));
    form.onsubmit = e => { e.preventDefault(); run(input.value); };
    const out: HTMLElement[] = [form];
    if (content?.suggestions?.length) out.push(h('div', { class: 'sugs' }, h('span', { class: 'muted', style: { fontSize: '.7rem', alignSelf: 'center' } }, 'Buscas frequentes:'),
      content.suggestions.map(s => h('button', { type: 'button', onclick: () => run(s) }, s))));
    if (st.result) {
      const r = st.result;
      const has = r.evidence ? g.ev.has(r.evidence) : false;
      out.push(h('div', { class: 'result' }, h('h4', {}, r.title), ...this.renderBlocks(r),
        r.evidence ? (has ? h('small', { class: 'mono muted' }, '✓ NO DOSSIÊ') : h('button', { class: 'btn sm', onclick: () => { g.ev.collect(r.evidence!, 'ferramenta:' + toolId); this.render(); } }, '+ Registrar no dossiê')) : null));
    } else if (st.result === null) {
      out.push(h('div', { class: 'empty' }, content?.emptyText ?? 'Nenhum resultado.'));
    }
    return out;
  }

  private searchTool(id: string) {
    const t = toolById(id)!;
    this.body.append(this.appbar(t.name, t.url), h('p', { class: 'muted', style: { fontSize: '.8rem', margin: '0 0 10px' } }, t.tagline), ...this.searchBox(id));
  }

  /* ---------------- DF no Ponto ---------------- */
  private dfnoponto() {
    const t = toolById('dfnoponto')!;
    this.body.append(this.appbar(t.name, t.url),
      h('button', { class: 'list-item', onclick: () => this.go('live') }, h('b', {}, '◉ Ônibus agora — linha 0.214'), h('small', {}, 'Posição dos veículos no mapa')),
      h('div', { class: 'apps-sec' }, 'LINHAS E HORÁRIOS'), ...this.searchBox('dfnoponto'));
  }

  private live() {
    const g = this.g;
    if (!(this as any)._liveLogged) { g.tools.liveViewed(); (this as any)._liveLogged = true; }
    this.body.append(this.appbar('0.214 — ao vivo', toolById('dfnoponto')!.url));
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '-90 -62 200 80'); svg.setAttribute('class', 'livemap');
    const add = (tag: string, a: Record<string, any>, text?: string) => { const e = document.createElementNS(ns, tag); for (const k in a) e.setAttribute(k, String(a[k])); if (text) e.textContent = text; svg.append(e); return e; };
    for (const [x1, z1, x2, z2] of ROADS) add('rect', { x: x1, y: z1, width: x2 - x1, height: z2 - z1, fill: '#1b272c' });
    add('polyline', { points: BUS_ROUTE_OFFICIAL.map(p => p.join(',')).join(' '), fill: 'none', stroke: '#93aaae', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' });
    add('polyline', { points: BUS_ROUTE.map(p => p.join(',')).join(' '), fill: 'none', stroke: '#2fe3a1', 'stroke-width': 0.8, opacity: 0.5 });
    add('rect', { x: -6, y: -8, width: 33, height: 16, fill: '#ff7a1a', opacity: .5 });
    add('text', { x: 10, y: 14, fill: '#ff9a4a', 'font-size': 5, 'text-anchor': 'middle' }, 'obra');
    add('text', { x: -60, y: 16, fill: '#eef5f3', 'font-size': 5, 'text-anchor': 'middle' }, 'Parada 214');
    add('text', { x: 70, y: 16, fill: '#eef5f3', 'font-size': 5, 'text-anchor': 'middle' }, 'CED');
    let off = 0;
    for (const b of g.buses) {
      add('circle', { cx: b.pos.x, cy: b.pos.z, r: 3, fill: b.opt.full ? '#f2b84b' : '#5bb6e6', stroke: '#000', 'stroke-width': .6 });
      if (b.pos.z < -6) off++;
    }
    this.body.append(svg, h('div', { class: 'legend' },
      h('span', {}, h('i', { style: { background: '#93aaae' } }), 'itinerário oficial (tracejado)'), h('span', {}, h('i', { style: { background: '#2fe3a1' } }), 'trajeto rastreado'),
      h('span', {}, h('i', { style: { background: '#5bb6e6' } }), 'ônibus'), h('span', {}, h('i', { style: { background: '#f2b84b' } }), 'ônibus lotado')),
      h('div', { class: 'result' },
        h('h4', {}, `Veículos fora do itinerário agora: ${off}`),
        h('p', { style: { margin: 0, fontSize: '.82rem', lineHeight: 1.45 } }, 'Histórico dos últimos 30 min: veículos da 0.214 circulando pela via da Quadra 300 e chegando em sequência à parada do CED.'),
        h('span', { class: 'sim-badge' }, 'DADO SIMULADO PARA DEMONSTRAÇÃO'),
        g.ev.has('e_dado_aovivo') ? h('small', { class: 'mono muted' }, '✓ NO DOSSIÊ')
          : h('button', { class: 'btn sm', onclick: () => { g.ev.collect('e_dado_aovivo', 'ferramenta:dfnoponto'); this.render(); } }, '+ Registrar no dossiê')));
  }

  /* ---------------- Portal do GDF ---------------- */
  private portal() {
    const g = this.g; const t = toolById('portalgdf')!;
    const st = this.toolState['portalgdf'] ??= { q: '', result: undefined };
    this.body.append(this.appbar(t.name, t.url), h('p', { class: 'muted', style: { fontSize: '.8rem', margin: '0 0 10px' } }, 'Órgãos do GDF e o que cada um faz. Marque quem pode agir sobre o problema que vocês investigam.'));
    const sel = st.q;
    if (sel) {
      const a = agencyById(sel)!;
      const marked = g.ctx.session.agencies.includes(a.id);
      this.body.append(h('div', { class: 'result' },
        h('small', { class: 'mono', style: { color: 'var(--neon)' } }, a.short), h('h4', {}, a.name),
        h('p', { style: { margin: 0, fontSize: '.86rem', lineHeight: 1.45 } }, a.scope),
        h('small', { class: 'muted' }, 'Resumo para fins do jogo — conferir no site oficial.'),
        marked ? h('button', { class: 'btn ghost sm', onclick: () => { g.tools.unmarkAgency(a.id); this.render(); } }, '✓ Marcado — desmarcar')
          : h('button', { class: 'btn sm', onclick: () => { g.tools.markAgency(a.id); this.render(); } }, 'Este órgão pode agir no nosso caso'),
        h('button', { class: 'linkbtn', onclick: () => { st.q = ''; this.render(); } }, '← todos os órgãos')));
      return;
    }
    for (const a of AGENCIES) this.body.append(h('button', { class: 'list-item' + (g.ctx.session.agencies.includes(a.id) ? ' on' : ''), onclick: () => { st.q = a.id; g.ctx.log('agency_viewed', { agency: a.id }); this.render(); } },
      h('b', {}, `${a.short}${g.ctx.session.agencies.includes(a.id) ? '  ✓' : ''}`), h('small', {}, a.name)));
  }

  /* ---------------- Participa DF ---------------- */
  private pform = { channel: 'ouvidoria' as 'ouvidoria' | 'lai', type: 'Reclamação', agency: '', text: '', ev: [] as string[] };
  private participa() {
    const g = this.g; const t = toolById('participa')!; const f = this.pform;
    if (!f.agency) f.agency = g.ctx.session.agencies[0] ?? '';
    this.body.append(this.appbar(t.name, t.url));
    const parts = g.ctx.session.participations;
    if (parts.length) {
      this.body.append(h('div', { class: 'apps-sec' }, 'SEUS PROTOCOLOS'));
      parts.forEach(p => this.body.append(h('div', { class: 'list-item' }, h('b', {}, p.protocol), h('small', {}, `${p.channel === 'lai' ? 'Acesso à informação' : p.type} → ${agencyById(p.agency)?.short ?? p.agency} · ${p.answered ? 'RESPONDIDO (veja Mensagens)' : 'aguardando resposta'}`))));
    }
    this.body.append(h('div', { class: 'apps-sec' }, 'NOVA MANIFESTAÇÃO'));
    const chip = (on: boolean, label: string, fn: () => void) => h('button', { class: 'chip' + (on ? ' on' : ''), type: 'button', onclick: fn }, label);
    this.body.append(h('div', { class: 'row', style: { marginBottom: '8px' } },
      chip(f.channel === 'ouvidoria', 'Ouvidoria', () => { f.channel = 'ouvidoria'; this.render(); }),
      chip(f.channel === 'lai', 'Acesso à informação (LAI)', () => { f.channel = 'lai'; this.render(); })));
    this.body.append(h('small', { class: 'muted', style: { display: 'block', marginBottom: '8px', lineHeight: 1.4 } },
      f.channel === 'ouvidoria' ? 'Para reclamar, sugerir, denunciar, elogiar ou solicitar um serviço.' : 'Para pedir uma informação pública a um órgão (Lei de Acesso à Informação).'));
    if (f.channel === 'ouvidoria') this.body.append(h('div', { class: 'row', style: { marginBottom: '8px' } },
      ['Reclamação', 'Sugestão', 'Solicitação', 'Denúncia', 'Elogio'].map(tp => chip(f.type === tp, tp, () => { f.type = tp; this.render(); }))));
    const agSel = h('select', { class: 'input', 'aria-label': 'Órgão destinatário' }, h('option', { value: '' }, 'Órgão destinatário…'), AGENCIES.map(a => h('option', { value: a.id, selected: f.agency === a.id }, `${a.short} — ${a.name}`)));
    agSel.onchange = () => f.agency = agSel.value;
    const ta = h('textarea', { class: 'input', placeholder: f.channel === 'lai' ? 'Qual informação vocês querem? Seja específico.' : 'Descreva o problema, onde e desde quando. Fatos, não boatos.', 'aria-label': 'Texto da manifestação' });
    ta.value = f.text; ta.oninput = () => f.text = ta.value;
    this.body.append(agSel, h('div', { style: { height: '8px' } }), ta);
    const evs = g.ev.list().filter(e => e.def.kind !== 'competencia');
    if (evs.length) {
      this.body.append(h('div', { class: 'apps-sec' }, 'ANEXAR EVIDÊNCIAS DO DOSSIÊ'));
      this.body.append(h('div', { class: 'row' }, evs.map(e => chip(f.ev.includes(e.id), `${KIND_MARK[e.def.kind]} ${e.def.title}`, () => {
        f.ev = f.ev.includes(e.id) ? f.ev.filter(x => x !== e.id) : [...f.ev, e.id]; this.render();
      }))));
    }
    const err = h('div', { class: 'err' });
    this.body.append(err, h('button', { class: 'btn block', onclick: () => {
      if (!f.agency) { err.textContent = 'Escolha o órgão destinatário.'; return; }
      if (f.text.trim().length < 30) { err.textContent = 'Escreva ao menos 30 caracteres — explique o que, onde e desde quando.'; return; }
      g.tools.submit({ channel: f.channel, type: f.channel === 'lai' ? 'Pedido de informação' : f.type, agency: f.agency, text: f.text.trim(), evidenceIds: [...f.ev] });
      this.pform = { channel: 'ouvidoria', type: 'Reclamação', agency: '', text: '', ev: [] };
      this.render();
    } }, 'Enviar manifestação'),
    h('small', { class: 'muted', style: { display: 'block', marginTop: '8px' } }, 'Simulação: nada é enviado ao Participa DF real. Para registrar de verdade, use o site oficial.'));
  }
}
