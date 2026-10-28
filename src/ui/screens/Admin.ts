import {relayDashboard} from '../challenge/RelayDashboard';
import {cityMonitor} from './CityDashboard';
import type { App } from '../App';
import { h, clear } from '../dom';
import { backend } from '@/services/backend';
import { ADMIN_PIN } from '@/config';
import { BASE_CAMPAIGNS, getCampaigns, setCampaignOverrides } from '@/data/campaigns';
import { PUBLIC_TOOLS, toolById } from '@/data/tools';
import { KIND_LABEL, DEFAULT_REP } from '@/systems/EvidenceSystem';
import type { CampaignDef, CampaignId, EvidenceKind, GameSession, Team, TelemetryEvent } from '@/types';

/** Área ADMIN — conteúdo das campanhas, equipes e analytics para pesquisa. */
export function renderAdmin(app: App) {
  const root = h('div', { class: 'screen dash' });
  let tab = 'dashboard';
  let campId: CampaignId = 'mobility';
  let overrides: Partial<Record<CampaignId, Partial<CampaignDef>>> = {};
  const exit = () => { location.hash = ''; app.showOpening(); };

  const gate = () => {
    const pin = h('input', { type: 'password', autocomplete: 'off' });
    const err = h('div', { class: 'err' });
    const f = h('form', { class: 'panel modal', style: { margin: '10vh auto' } }, h('div', { class: 'eyebrow' }, 'ADMINISTRAÇÃO'), h('h2', {}, 'Área restrita'),
      h('div', { class: 'stack' }, h('label', { class: 'field' }, 'PIN de administração', pin), err, h('button', { class: 'btn block' }, 'Entrar'),
        h('small', { class: 'muted' }, 'Modo local: PIN definido em VITE_ADMIN_PIN (padrão de demonstração: enedes-admin). Em produção, use o papel "admin" do Supabase.'),
        backend().mode==='local'?h('button',{class:'btn ghost',type:'button',onclick:async()=>{overrides=await backend().getCampaignOverrides();draw()}},'Explorar dashboard da demo'):null,
        h('button', { class: 'linkbtn', type: 'button', onclick: exit }, '← Voltar')));
    f.onsubmit = async e => { e.preventDefault(); if (pin.value !== ADMIN_PIN) { err.textContent = 'PIN incorreto.'; return; } overrides = await backend().getCampaignOverrides() as any; draw(); };
    root.append(f);
  };

  const save = async () => {
    await backend().saveCampaignOverrides(overrides);
    setCampaignOverrides(overrides);
  };

  const draw = async () => {
    clear(root);
    root.append(h('header', {}, h('div', {}, h('div', { class: 'eyebrow' }, 'ADMIN'), h('h1', {}, 'Gestão do ESPIA DF')), h('span', { class: 'spacer' }),
      h('button', { class: 'btn ghost sm', onclick: exit }, 'Sair')),
      h('div', { class: 'tabs' }, [['dashboard','DASHBOARD DA CIDADE'], ['campanhas', 'CAMPANHAS E DIÁLOGOS'], ['pontuacao', 'PONTUAÇÃO'], ['ferramentas', 'FERRAMENTAS'], ['json', 'JSON AVANÇADO'], ['equipes', 'EQUIPES'], ['analytics', 'ANALYTICS']]
        .map(([id, l]) => h('button', { class: tab === id ? 'on' : '', onclick: () => { tab = id; draw(); } }, l))));
    if(tab==='dashboard'){root.append(relayDashboard('admin'));return}
    const box = h('div', { class: 'panel' }); root.append(box);
    const c = getCampaigns().find(x => x.id === campId)!;
    const ov = (overrides[campId] ??= {});
    const campSel = h('select', { class: 'input', style: { maxWidth: '360px' } }, BASE_CAMPAIGNS.map(x => h('option', { value: x.id, selected: x.id === campId }, `${x.number} — ${x.title}`)));
    campSel.onchange = () => { campId = campSel.value as CampaignId; draw(); };
    const status = h('span', { class: 'mono muted', style: { fontSize: '.72rem' } });
    const saveBtn = h('button', { class: 'btn sm', onclick: async () => { await save(); status.textContent = 'SALVO ✓'; } }, 'Salvar alterações');

    if (tab === 'campanhas') {
      const field = (label: string, key: 'title' | 'pitch' | 'briefing' | 'startClock', area = false) => {
        const el = area ? h('textarea', { class: 'input' }) : h('input', { class: 'input' });
        (el as any).value = (c as any)[key] ?? '';
        el.oninput = () => { (ov as any)[key] = (el as any).value; };
        return h('label', { class: 'field' }, label, el);
      };
      const avail = h('input', { type: 'checkbox', checked: c.available });
      avail.onchange = () => { ov.available = avail.checked; };
      box.append(h('div', { class: 'row' }, campSel, h('span', { class: 'spacer' }), status, saveBtn),
        h('div', { class: 'grid2', style: { marginTop: '14px' } }, field('Título', 'title'), field('Horário inicial (HH:MM)', 'startClock')),
        h('div', { style: { display: 'grid', gap: '12px', marginTop: '12px' } }, field('Chamada', 'pitch', true), field('Briefing', 'briefing', true),
          h('label', { class: 'row' }, avail, 'Campanha disponível para as equipes (exige fases, NPCs e evidências configurados)')));
      box.append(h('div', { class: 'eyebrow', style: { marginTop: '22px' } }, 'NPCs E DIÁLOGOS'));
      if (!c.npcs.length) box.append(h('p', { class: 'muted' }, 'Nenhum NPC nesta campanha. Use o JSON avançado para cadastrar (copie a estrutura da Campanha 01).'));
      const npcs = structuredClone(c.npcs);
      npcs.forEach(n => {
        const sec = h('details', { style: { borderTop: '1px solid var(--line)', padding: '10px 0' } }, h('summary', { style: { cursor: 'pointer', fontWeight: 700 } }, `${n.name} — ${n.label}`));
        for (const [id, node] of Object.entries(n.nodes)) {
          const ta = h('textarea', { class: 'input', style: { minHeight: '60px' } }); ta.value = node.text;
          ta.oninput = () => { node.text = ta.value; ov.npcs = npcs; };
          const tag = h('input', { class: 'input', value: node.tag ?? '', placeholder: 'natureza da fala (RELATO, OUVIU DIZER, PISTA...)', style: { maxWidth: '320px' } });
          tag.oninput = () => { node.tag = tag.value || undefined; ov.npcs = npcs; };
          sec.append(h('div', { style: { display: 'grid', gap: '6px', margin: '10px 0' } }, h('small', { class: 'mono muted' }, `nó "${id}"${node.grants?.evidence ? ' · gera evidência ' + node.grants.evidence : ''}`), ta, tag,
            (node.choices ?? []).map(ch => { const i = h('input', { class: 'input', value: ch.label }); i.oninput = () => { ch.label = i.value; ov.npcs = npcs; }; return i; })));
        }
        box.append(sec);
      });
    }

    if (tab === 'pontuacao') {
      const sc = { ...DEFAULT_REP, ...(c.scoring ?? {}) };
      box.append(h('div', { class: 'row' }, campSel, h('span', { class: 'spacer' }), status, saveBtn),
        h('p', { class: 'muted' }, 'Pontos de reputação ao coletar cada tipo de evidência. Os bônus de cruzamento de fontes ficam no JSON avançado (crossRefs).'),
        h('div', { class: 'grid3' }, (Object.keys(DEFAULT_REP) as EvidenceKind[]).map(k => {
          const i = h('input', { type: 'number', value: sc[k], min: 0, max: 500 });
          i.oninput = () => { ov.scoring = { ...(ov.scoring ?? c.scoring ?? {}), [k]: Number(i.value) }; };
          return h('label', { class: 'field' }, KIND_LABEL[k], i);
        })));
    }

    if (tab === 'ferramentas') {
      box.append(h('div', { class: 'row' }, campSel, h('span', { class: 'spacer' }), status, saveBtn),
        h('p', { class: 'muted' }, 'Conteúdo que cada ferramenta pública mostra nesta campanha: sugestões de busca e texto exibido quando não há resultado. Resultados detalhados (tabelas, gráficos, evidências) no JSON avançado.'));
      const tools = structuredClone(c.tools);
      for (const t of PUBLIC_TOOLS) {
        if (t.kind === 'participation' || t.kind === 'directory') continue;
        const tc = (tools[t.id] ??= { suggestions: [], results: [], emptyText: '' });
        const sug = h('input', { class: 'input', value: tc.suggestions.join('; ') }); sug.oninput = () => { tc.suggestions = sug.value.split(';').map(x => x.trim()).filter(Boolean); ov.tools = tools; };
        const emp = h('textarea', { class: 'input', style: { minHeight: '56px' } }); emp.value = tc.emptyText; emp.oninput = () => { tc.emptyText = emp.value; ov.tools = tools; };
        box.append(h('div', { style: { borderTop: '1px solid var(--line)', padding: '12px 0', display: 'grid', gap: '8px' } },
          h('b', {}, `${t.name} `, h('small', { class: 'muted' }, t.url ?? 'URL oficial não cadastrada')),
          h('small', { class: 'muted' }, `${tc.results.length} resultado(s) cadastrado(s)`),
          h('label', { class: 'field' }, 'Sugestões (separe por ;)', sug), h('label', { class: 'field' }, 'Texto sem resultado', emp)));
      }
    }

    if (tab === 'json') {
      const ta = h('textarea', { class: 'code', spellcheck: 'false' }); ta.value = JSON.stringify(c, null, 2);
      const err = h('div', { class: 'err' });
      box.append(h('div', { class: 'row' }, campSel, h('span', { class: 'spacer' }), status,
        h('button', { class: 'btn ghost sm', onclick: () => { delete overrides[campId]; save().then(draw); } }, 'Restaurar original'),
        h('button', { class: 'btn sm', onclick: async () => {
          try { const parsed = JSON.parse(ta.value); parsed.id = campId; overrides[campId] = parsed; await save(); status.textContent = 'SALVO ✓'; err.textContent = ''; }
          catch (e: any) { err.textContent = 'JSON inválido: ' + e.message; }
        } }, 'Validar e salvar')),
        h('p', { class: 'muted', style: { fontSize: '.84rem' } }, 'Edite fases, objetivos, NPCs, eventos dinâmicos, evidências, hipóteses, cruzamentos de fonte, conteúdo das ferramentas e respostas simuladas dos órgãos.'),
        err, ta);
    }

    if (tab === 'equipes') {
      const [teams, sessions] = await Promise.all([backend().listTeams(), backend().listSessions()]);
      box.append(h('table', { class: 'tbl' }, h('tr', {}, ['EQUIPE', 'ESCOLA / RA', 'MENTOR', 'INTEGRANTES', 'CAMPANHA', 'FASE', 'STATUS', 'REP.'].map(x => h('th', {}, x))),
        teams.flatMap((t: Team) => {
          const ss = sessions.filter(s => s.teamId === t.id);
          const base = [h('td', {}, t.name, h('br'), h('small', { class: 'mono muted' }, t.login)), h('td', {}, `${t.school} · ${t.ra}`), h('td', {}, t.mentor.name), h('td', {}, String(t.members.length))];
          if (!ss.length) return [h('tr', {}, ...base, h('td', { colspan: 4, class: 'muted' }, 'sem sessão'))];
          return ss.map(s => h('tr', {}, ...base.map(b => b.cloneNode(true) as HTMLElement), h('td', {}, s.campaignId), h('td', {}, s.phase), h('td', {}, h('span', { class: 'status ' + s.status }, s.status)), h('td', {}, String(s.reputation))));
        })));
    }

    if (tab === 'analytics') {
      const [events, sessions] = await Promise.all([backend().listEvents(), backend().listSessions()]);
      box.append(analytics(events, sessions));
    }
  };

  gate();
  return root;
}

function analytics(events: TelemetryEvent[], sessions: GameSession[]) {
  const wrap = h('div', { style: { display: 'grid', gap: '18px' } });
  const count = (f: (e: TelemetryEvent) => boolean) => events.filter(f).length;
  const n = Math.max(1, sessions.length);
  const avg = (f: (s: GameSession) => number) => (sessions.reduce((a, s) => a + f(s), 0) / n).toFixed(1);
  wrap.append(h('div', { class: 'kpis' },
    h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'SESSÕES'), h('div', { class: 'v' }, String(sessions.length))),
    h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'EVIDÊNCIAS / SESSÃO'), h('div', { class: 'v' }, avg(s => s.evidences.length))),
    h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'REVISÕES DE HIPÓTESE / SESSÃO'), h('div', { class: 'v' }, avg(s => s.revisions.filter(r => r.from).length))),
    h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'EVENTOS REGISTRADOS'), h('div', { class: 'v' }, String(events.length)))));

  const bars = (title: string, data: [string, number][]) => {
    const max = Math.max(1, ...data.map(d => d[1]));
    return h('div', {}, h('div', { class: 'eyebrow', style: { marginBottom: '8px' } }, title),
      data.length ? data.map(([k, v]) => h('div', { class: 'bigbar' }, h('span', {}, k), h('span', { class: 't' }, h('i', { style: { width: (v / max) * 100 + '%' } })), h('span', { class: 'mono' }, String(v))))
        : h('p', { class: 'muted' }, 'Sem dados ainda.'));
  };
  const tally = (type: string, key: string, label = (k: string) => k) => {
    const m = new Map<string, number>();
    events.filter(e => e.type === type).forEach(e => { const k = String((e.payload as any)?.[key] ?? '—'); m.set(k, (m.get(k) ?? 0) + 1); });
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => [label(k), v] as [string, number]);
  };
  wrap.append(h('div', { class: 'grid2' },
    bars('FERRAMENTAS CONSULTADAS (buscas)', tally('tool_query', 'tool', k => toolById(k)?.name ?? k)),
    bars('EVIDÊNCIAS POR TIPO', tally('evidence_collected', 'kind', k => KIND_LABEL[k as EvidenceKind] ?? k)),
    bars('NPCs MAIS OUVIDOS', tally('dialogue_start', 'npc')),
    bars('PONTOS VISITADOS', tally('poi_visited', 'poi'))));
  const phaseAvg = ['rotina', 'investigacao', 'laboratorio', 'conselho'].map(p => [p, Math.round(sessions.reduce((a, s) => a + (s.phaseTimes[p] ?? 0), 0) / n / 60000)] as [string, number]);
  wrap.append(bars('TEMPO MÉDIO POR FASE (MIN)', phaseAvg));
  wrap.append(h('p', { class: 'muted' }, `Hipóteses mantidas após contradição: ${count(e => e.type === 'hypothesis_kept')} · revisadas após contradição: ${count(e => e.type === 'hypothesis_revised' && !!(e.payload as any)?.afterContradiction)} · manifestações: ${count(e => e.type === 'participation_submitted')}`));

  const dl = (name: string, content: string, type: string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
  const csv = () => {
    const head = ['sessionId', 'teamId', 'memberId', 'type', 'phase', 'gameTime', 'ts', 'payload'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    return [head.join(','), ...events.map(e => [e.sessionId, e.teamId, e.memberId, e.type, e.phase, e.gameTime, new Date(e.ts).toISOString(), JSON.stringify(e.payload ?? {})].map(esc).join(','))].join('\n');
  };
  wrap.append(h('div', { class: 'row' },
    h('button', { class: 'btn sm', onclick: () => dl('missaodf-telemetria.csv', csv(), 'text/csv') }, 'Exportar telemetria (CSV)'),
    h('button', { class: 'btn ghost sm', onclick: () => dl('missaodf-sessoes.json', JSON.stringify(sessions, null, 2), 'application/json') }, 'Exportar sessões (JSON)'),
    h('small', { class: 'muted' }, 'Eventos usam IDs pseudônimos. Dados pessoais ficam apenas no cadastro da equipe.')));
  return wrap;
}
