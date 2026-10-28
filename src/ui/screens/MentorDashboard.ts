import { CASES } from '@/data/simulation';
import type { App } from '../App';
import { h, clear } from '../dom';
import { backend } from '@/services/backend';
import type { MentorAction } from '@/services/repository';
import type { GameSession, Team, TelemetryEvent } from '@/types';
import { getCampaign } from '@/data/campaigns';
import { roleById } from '@/data/roles';
import { agencyById } from '@/data/agencies';
import { toolById } from '@/data/tools';
import { KIND_LABEL } from '@/systems/EvidenceSystem';
import { EvidenceSystem } from '@/systems/EvidenceSystem';
import { uid } from '@/services/util';
import { ROADS, WORLD } from '@/worlds/layout';
import { DEMO_PASSWORD } from '@/services/demo';

const STATUS: Record<string, string> = { em_andamento: 'EM ANDAMENTO', aguardando_mentor: 'AGUARDANDO MENTOR', devolvida: 'DEVOLVIDA', validada: 'VALIDADA' };

/** Painel do professor-mentor. */
export function renderMentor(app: App) {
  const root = h('div', { class: 'screen dash' });
  let teams: Team[] = [];
  let sessions: GameSession[] = [];
  let sel: GameSession | null = null;
  let tab = 'progresso';
  let timer: number | null = null;

  const exit = () => { if (timer) clearInterval(timer); location.hash = ''; app.showOpening(); };

  const login = () => {
    clear(root);
    const email = h('input', { type: 'email', autocomplete: 'email' });
    const pass = h('input', { type: 'password', autocomplete: 'current-password' });
    const err = h('div', { class: 'err' });
    const form = h('form', { class: 'panel modal', style: { margin: '10vh auto' } },
      h('div', { class: 'eyebrow' }, 'PROFESSOR-MENTOR'), h('h2', {}, 'Painel de acompanhamento'),
      h('div', { class: 'stack' },
        h('label', { class: 'field' }, 'E-mail do mentor', email),
        h('label', { class: 'field' }, 'Senha da equipe', pass), err,
        h('button', { class: 'btn block', type: 'submit' }, 'Entrar'),
        backend().mode === 'local' ? h('small', { class: 'muted' }, `Demonstração: mentor@demo.local / ${DEMO_PASSWORD} (após jogar a demonstração).`) : null,
        h('button', { class: 'linkbtn', type: 'button', onclick: exit }, '← Voltar')));
    form.onsubmit = async e => {
      e.preventDefault();
      teams = await backend().loginMentor(email.value, pass.value);
      if (!teams.length) { err.textContent = 'Nenhuma equipe encontrada para este e-mail e senha.'; return; }
      await load(); draw();
      timer = window.setInterval(async () => { await load(); draw(true); }, 8000);
    };
    root.append(form);
  };

  const load = async () => {
    const ids = new Set(teams.map(t => t.id));
    sessions = (await backend().listSessions()).filter(s => ids.has(s.teamId));
    if (sel) sel = sessions.find(s => s.id === sel!.id) ?? sel;
  };

  const progress = (s: GameSession) => {
    const c = getCampaign(s.campaignId); const i = c.phases.findIndex(p => p.id === s.phase);
    return Math.round((Math.max(0, i) / Math.max(1, c.phases.length - 1)) * 100);
  };

  const draw = async (soft = false) => {
    const y = window.scrollY;
    clear(root);
    root.append(h('header', {},
      h('div', {}, h('div', { class: 'eyebrow' }, 'PROFESSOR-MENTOR'), h('h1', {}, 'Acompanhamento das equipes')),
      h('span', { class: 'spacer' }),
      h('button', { class: 'btn ghost sm', onclick: async () => { await load(); draw(); } }, 'Atualizar'),
      h('button', { class: 'btn ghost sm', onclick: exit }, 'Sair')));
    const list = h('div', { class: 'panel' }, h('div', { class: 'eyebrow' }, 'EQUIPES'));
    for (const t of teams) {
      list.append(h('div', { style: { margin: '12px 0 4px', fontWeight: 700 } }, t.name, h('small', { class: 'muted mono', style: { marginLeft: '8px', fontSize: '.66rem' } }, t.login)));
      const ss = sessions.filter(s => s.teamId === t.id);
      if (!ss.length) list.append(h('small', { class: 'muted' }, 'Ainda não iniciou nenhuma campanha.'));
      for (const s of ss) list.append(h('button', { class: 'list-item' + (sel?.id === s.id ? ' on' : ''), onclick: () => { sel = s; draw(); } },
        h('b', {}, getCampaign(s.campaignId).title), h('span', { class: 'status ' + s.status, style: { justifySelf: 'start' } }, STATUS[s.status]),
        h('div', { class: 'progressbar' }, h('i', { style: { width: progress(s) + '%' } })),
        h('small', {}, `Fase: ${s.phase} · ${s.evidences.length} evidências · reputação ${s.reputation}`)));
    }
    const detail = h('div', { class: 'panel' });
    root.append(h('div', { class: 'dash-grid' }, list, detail));
    if (!sel) { detail.append(h('p', { class: 'muted' }, 'Selecione uma equipe/campanha.')); return; }
    await drawDetail(detail, sel);
    if (soft) window.scrollTo(0, y);
  };

  const drawDetail = async (el: HTMLElement, s: GameSession) => {
    const team = teams.find(t => t.id === s.teamId)!;
    const c = getCampaign(s.campaignId);
    // reutiliza o catálogo de evidências do sistema (inclui competências)
    const fakeCtx: any = { campaign: c, session: s, clock: '', log() {}, save() {} };
    const evs = new EvidenceSystem(fakeCtx, { add() {} } as any);
    const actions = await backend().listMentorActions(s.id);
    el.append(h('div', { class: 'row' },
      h('div', {}, h('div', { class: 'eyebrow' }, `${team.name} // ${c.title}`), h('h2', { class: 'display', style: { margin: '4px 0' } }, `Fase atual: ${c.phases.find(p => p.id === s.phase)?.title ?? s.phase}`)),
      h('span', { class: 'spacer' }), h('span', { class: 'status ' + s.status }, STATUS[s.status])));
    el.append(h('div', { class: 'kpis', style: { margin: '12px 0' } },
      h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'REPUTAÇÃO'), h('div', { class: 'v' }, String(s.reputation))),
      h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'EVIDÊNCIAS'), h('div', { class: 'v' }, String(s.evidences.length))),
      h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'FONTES'), h('div', { class: 'v' }, String(new Set(s.toolsUsed.map(t => t.tool)).size))),
      h('div', { class: 'kpi' }, h('div', { class: 'k' }, 'REVISÕES'), h('div', { class: 'v' }, String(s.revisions.filter(r => r.from).length)))));

    const TABS: [string, string][] = [['progresso', 'PROGRESSO'], ['dossie', 'EVIDÊNCIAS'], ['hipoteses', 'HIPÓTESES'], ['fontes', 'FONTES'], ['solucao', 'SOLUÇÃO E PITCH'], ['trajeto', 'TRAJETO'], ['equipe', 'INTEGRANTES']];
    el.append(h('div', { class: 'tabs', role: 'tablist' }, TABS.map(([id, l]) => h('button', { class: tab === id ? 'on' : '', role: 'tab', 'aria-selected': String(tab === id), onclick: () => { tab = id; draw(); } }, l))));
    const box = h('div', {}); el.append(box);

    if (tab === 'progresso') {
      box.append(h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'FASE'), h('th', {}, 'TEMPO'), h('th', {}, 'SITUAÇÃO')),
        c.phases.filter(p => p.id !== 'encerrada').map((p, i) => {
          const idx = c.phases.findIndex(x => x.id === s.phase);
          return h('tr', {}, h('td', {}, p.title), h('td', { class: 'mono' }, `${Math.round((s.phaseTimes[p.id] ?? 0) / 60000)} min`), h('td', {}, i < idx ? 'concluída' : i === idx ? 'em curso' : '—'));
        })));
      box.append(h('div', { class: 'eyebrow', style: { marginTop: '14px' } }, 'REPUTAÇÃO — ÚLTIMOS REGISTROS'),
        h('div', { class: 'timeline' }, [...s.repLog].reverse().slice(0, 40).map(r => h('div', {}, h('span', { class: 't' }, r.at), h('span', {}, r.reason), h('b', {}, (r.delta > 0 ? '+' : '') + r.delta)))));
    }
    if (tab === 'dossie') box.append(h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'HORA'), h('th', {}, 'TIPO'), h('th', {}, 'EVIDÊNCIA'), h('th', {}, 'FONTE')),
      evs.list().map(e => h('tr', {}, h('td', { class: 'mono' }, e.at), h('td', {}, KIND_LABEL[e.def.kind]), h('td', {}, e.def.title, e.def.simulated ? ' (simulado)' : ''), h('td', { class: 'muted' }, e.def.source)))));
    if (tab === 'hipoteses') {
      box.append(h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'HIPÓTESE'), h('th', {}, 'ORIGEM'), h('th', {}, 'STATUS'), h('th', {}, 'CONEXÕES')),
        s.hypotheses.map(hy => h('tr', {}, h('td', {}, hy.text), h('td', {}, hy.origin), h('td', {}, hy.status),
          h('td', { class: 'mono' }, `${s.links.filter(l => l.hypothesisId === hy.id && l.relation === 'apoia').length}↑ ${s.links.filter(l => l.hypothesisId === hy.id && l.relation === 'contradiz').length}↓`)))));
      box.append(h('div', { class: 'eyebrow', style: { marginTop: '14px' } }, 'ALTERAÇÕES DE HIPÓTESE'),
        h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'HORA'), h('th', {}, 'DE'), h('th', {}, 'PARA'), h('th', {}, 'MOTIVO')),
          s.revisions.map(r => h('tr', {}, h('td', { class: 'mono' }, r.at), h('td', {}, r.from ? s.hypotheses.find(x => x.id === r.from)?.text ?? r.from : '— (primeira)'),
            h('td', {}, s.hypotheses.find(x => x.id === r.to)?.text ?? r.to), h('td', { class: 'muted' }, r.trigger ? `após: ${evs.def(r.trigger)?.title}` : '—')))));
    }
    if (tab === 'fontes') box.append(h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'HORA'), h('th', {}, 'FERRAMENTA'), h('th', {}, 'BUSCA')),
      s.toolsUsed.map(t => h('tr', {}, h('td', { class: 'mono' }, t.at), h('td', {}, toolById(t.tool)?.name ?? t.tool), h('td', {}, t.query)))),
      h('div', { class: 'eyebrow', style: { marginTop: '14px' } }, 'PARTICIPAÇÃO'),
      h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'PROTOCOLO'), h('th', {}, 'CANAL'), h('th', {}, 'ÓRGÃO'), h('th', {}, 'TEXTO')),
        s.participations.map(p => h('tr', {}, h('td', { class: 'mono' }, p.protocol), h('td', {}, p.channel === 'lai' ? 'LAI' : p.type), h('td', {}, agencyById(p.agency)?.short ?? p.agency), h('td', {}, p.text)))));
    if (tab === 'solucao') {
      const d = s.solution;
      if (!d) box.append(h('p', { class: 'muted' }, 'A equipe ainda não montou a proposta.'));
      else box.append(h('table', { class: 'tbl' },
        ...([['Problema', d.problem], ['Evidências', d.evidenceIds.map(i => (evs.def(i)?.title ?? CASES[s.campaignId]?.records.find(r=>r.id===i)?.title ?? i)).join('; ')], ['Causa provável', s.hypotheses.find(x => x.id === d.causeHypothesisId)?.text ?? '—'],
          ['Quem é afetado', d.affected.join(', ')], ['Órgão responsável', d.agencies.map(a => agencyById(a)?.short).join(', ')], ['Solução', [d.proposalTags.join(' + '), d.proposal].filter(Boolean).join(' — ')],
          ['Viabilidade', `custo ${d.feasibility.custo}/5 · prazo ${d.feasibility.prazo}/5 · complexidade ${d.feasibility.complexidade}/5`], ['Impacto', `alcance ${d.impact.alcance}/5 — ${d.impact.texto}`],
          ['Participação', [...d.participationProtocols, ...d.participationIdeas].join('; ')]] as [string, string][]).map(([k, v]) => h('tr', {}, h('th', {}, k.toUpperCase()), h('td', {}, v)))));
      box.append(h('p', {}, s.pitch ? `Pitch apresentado: ${Math.round(s.pitch.durationSec / 60)} min ${s.pitch.durationSec % 60}s, ${s.pitch.slidesSeen} slides.` : 'Pitch ainda não apresentado.'));
    }
    if (tab === 'trajeto') {
      const ev: TelemetryEvent[] = await backend().listEvents(s.id);
      const pts = ev.filter(e => e.type === 'pos').map(e => e.payload as { x: number; z: number });
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', `${WORLD.minX} ${WORLD.minZ} ${WORLD.maxX - WORLD.minX} ${WORLD.maxZ - WORLD.minZ}`); svg.setAttribute('class', 'pathmap');
      for (const [x1, z1, x2, z2] of ROADS) { const r = document.createElementNS(ns, 'rect'); Object.entries({ x: x1, y: z1, width: x2 - x1, height: z2 - z1, fill: '#24343a' }).forEach(([k, v]) => r.setAttribute(k, String(v))); svg.append(r); }
      const pl = document.createElementNS(ns, 'polyline'); pl.setAttribute('points', pts.map(p => `${p.x},${p.z}`).join(' ')); pl.setAttribute('fill', 'none'); pl.setAttribute('stroke', '#2fe3a1'); pl.setAttribute('stroke-width', '1.2');
      svg.append(pl);
      box.append(h('p', { class: 'muted' }, `${pts.length} pontos registrados (amostra a cada 3 s).`), svg as unknown as HTMLElement);
    }
    if (tab === 'equipe') box.append(h('table', { class: 'tbl' }, h('tr', {}, h('th', {}, 'NOME'), h('th', {}, 'PAPEL'), h('th', {}, 'TAREFA'), h('th', {}, 'CONTATO')),
      team.members.map(m => h('tr', {}, h('td', {}, m.name), h('td', {}, roleById(m.role).name), h('td', {}, s.roleTasksDone.includes(roleById(m.role).task.id) ? '✓ ' + roleById(m.role).task.text : roleById(m.role).task.text), h('td', { class: 'muted' }, [m.email, m.phone].filter(Boolean).join(' · '))))));

    // ações
    const text = h('textarea', { class: 'input', placeholder: 'Mensagem para a equipe (pista, comentário, motivo da devolução...)', style: { minHeight: '70px' } });
    const stage = h('select', { class: 'input', style: { maxWidth: '240px' } }, c.phases.filter(p => p.id !== 'rotina' && p.id !== 'encerrada').map(p => h('option', { value: p.id }, p.title)));
    const score = h('input', { class: 'input', type: 'number', min: 0, max: 10, step: 0.5, placeholder: 'Nota (0–10)', style: { maxWidth: '140px' } });
    const send = async (kind: MentorAction['kind']) => {
      const a: MentorAction = { id: uid('ma_'), sessionId: s.id, teamId: s.teamId, kind, text: text.value.trim(), ts: Date.now() };
      if (kind === 'liberacao') a.stage = stage.value;
      if (kind === 'validacao' && score.value) a.score = Number(score.value);
      if ((kind === 'pista' || kind === 'comentario') && !a.text) { text.focus(); return; }
      await backend().addMentorAction(a);
      text.value = '';
      draw();
    };
    el.append(h('div', { class: 'eyebrow', style: { marginTop: '22px' } }, 'AÇÕES DO MENTOR'),
      h('div', { style: { display: 'grid', gap: '10px', marginTop: '8px' } }, text,
        h('div', { class: 'row' },
          h('button', { class: 'btn sm', onclick: () => send('pista') }, 'Enviar pista'),
          h('button', { class: 'btn ghost sm', onclick: () => send('comentario') }, 'Comentar'),
          h('button', { class: 'btn danger sm', onclick: () => send('devolucao') }, 'Devolver para investigação')),
        h('div', { class: 'row' }, stage, h('button', { class: 'btn ghost sm', onclick: () => send('liberacao') }, 'Liberar etapa')),
        h('div', { class: 'row' }, score, h('button', { class: 'btn amber sm', onclick: () => send('validacao') }, 'Validar missão'))),
      h('div', { class: 'eyebrow', style: { marginTop: '18px' } }, 'HISTÓRICO DE AÇÕES'),
      h('div', { class: 'timeline' }, actions.slice().reverse().map(a => h('div', {}, h('span', { class: 't' }, new Date(a.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })), h('span', {}, `${a.kind.toUpperCase()}${a.stage ? ' → ' + a.stage : ''}: ${a.text}`), h('b', {}, a.score != null ? String(a.score) : '')))));
  };

  login();
  return root;
}
