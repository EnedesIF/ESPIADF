import {pendingGDFTopics} from '@/services/learning';
import {selectedRoute} from '@/services/gdfRoutes';
import {storyStep} from '@/services/demoJourney';
import {availability} from '@/services/missionCapacity';
import {openTeamInstructions} from './TeamInstructions';
import {DISTRICTS} from '@/worlds/CityDistrict';
import { brandCredits } from '../BrandCredits';
import { openTeamReport } from './OfficialMission';
import type { App } from '../App';
import { h, clear } from '../dom';
import { getCampaigns } from '@/data/campaigns';
import { roleById } from '@/data/roles';
import { backend } from '@/services/backend';
import { openSettings } from '@/components/SettingsPanel';
import type { CampaignDef, GameSession } from '@/types';

/** CENTRAL DE MISSÕES */
export function renderHub(app: App) {
  storyStep(4);const team = app.team;
  if (!team) { setTimeout(() => app.showOpening()); return h('div'); }
  const camps = getCampaigns();
  let sel: CampaignDef = camps.find(c => c.available) ?? camps[0];
  const sessions: Record<string, GameSession> = {};

  const root = h('div', { class: 'screen hub' });
  root.append(h('button',{class:'btn',onclick:()=>void app.showPilot()},'★ Jogar em equipe • escolher desafio'));
  const grid = h('div', { class: 'camps' });
  const side = h('div', { style: { display: 'grid', gap: '14px', alignContent: 'start' } });

  const drawCamps = () => {
    clear(grid);
    for (const c of camps) {
      const s = sessions[c.id];const slot=availability(c.id,team.id);
      const status = !c.available ? h('span', { class: 'status soon' }, '◇ EM PRODUÇÃO')
        : (s?.status === 'validada' || s?.status === 'aguardando_mentor') ? h('span', { class: 'status live' }, '◆ ENTREGUE')
        : s ? h('span', { class: 'status live' }, `◆ EM ANDAMENTO · ${s.evidences.length} EVIDÊNCIAS`)
        : h('span', { class: 'status live' }, '◆ DISPONÍVEL');
      grid.append(h('button', { class: 'camp' + (c.id === sel.id ? ' on' : '') + (c.available ? '' : ' locked'), 'aria-pressed': String(c.id === sel.id),
        onclick: () => {const current=availability(c.id,team.id);if(current.full&&!current.own){void app.startCity(c.id);return}sel = c; drawCamps(); drawSide(); } },
        h('span', { class: 'num', 'aria-hidden': 'true' }, c.number),
        h('div', {}, h('div', {class:'district-card-preview district-'+c.id},h('span',{class:'district-art '+c.id,'aria-hidden':'true'}),h('span',{},DISTRICTS[c.id].name),h('small',{},DISTRICTS[c.id].subtitle)), h('div', { class: 'eyebrow' }, `CAMPANHA ${c.number} // ${c.axis}`), h('h3', {}, c.title), h('p', {}, c.pitch)),
        h('div',{class:'camp-capacity'},h('div',{class:'challenge-slots '+(slot.full&&!slot.own?'full':'')},slot.own?'✓ SUA EQUIPE NESTE DESAFIO':slot.full?'LOTADO • 3/3 EQUIPES':`${slot.count}/3 EQUIPES • ${slot.remaining} VAGA(S)`),status)));
    }
  };

  const drawSide = () => {
    clear(side);
    const s = sessions[sel.id];const slot=availability(sel.id,team.id);
    side.append(
      h('div', { class: 'panel brief' },selectedRoute(team.id,sel.id)?h('p',{class:'real-feedback'},'Rota '+selectedRoute(team.id,sel.id)!.code+' • '+selectedRoute(team.id,sel.id)!.title):null,h('button',{class:'btn ghost',onclick:()=>app.showRouteChoice(sel.id)},'Escolher / trocar rota de investigação'),
        h('div', { class: 'eyebrow' }, `BRIEFING // ${sel.axis}`),
        h('p', {}, 'Entre na cidade com sua equipe. Converse, investigue objetos, consulte as fontes no celular e aplique uma solução no cenário.'),
        sel.available
          ? h('button', { class: 'btn block', onclick: () => app.startCity(sel.id) }, slot.own?'Continuar missão →':slot.full?'Desafio lotado • escolher outro': 'Aceitar missão • entrar na cidade →')
          : h('div', { class: 'muted', style: { fontSize: '.86rem' } }, 'Esta campanha está em produção. O conteúdo-base já está cadastrado e pode ser expandido pela área ADMIN.')),
      h('div', { class: 'panel teamcard' },
        h('div', { class: 'row' }, h('div', { class: 'eyebrow' }, 'EQUIPE'), h('span', { class: 'spacer' }), h('span', { class: 'mono muted', style: { fontSize: '.7rem' } }, team.login)),
        h('div', { style: { fontFamily: 'var(--display)', fontSize: '1.4rem', fontWeight: 700, margin: '6px 0 4px' } }, team.name),
        h('div', { class: 'muted', style: { fontSize: '.82rem', marginBottom: '8px' } }, `${team.school} · ${team.ra || '—'} · Mentor: ${team.mentor.name}`),
        team.members.map(m => h('div', { class: 'm' }, h('span', { class: 'dot' }), m.name, h('span', { class: 'role' }, roleById(m.role).short))),
        h('div', { class: 'row', style: { marginTop: '12px' } },
          h('button', { class: 'btn ghost sm', onclick: () => app.showAvatar('hub') }, 'Avatares'),
          h('button', { class: 'btn ghost sm', onclick: openSettings }, 'Acessibilidade'))));
  };

  root.append(
    h('div', { class: 'hub-top' },
      brandCredits(),
      h('div', { class: 'row' }, h('button', { class: 'linkbtn', onclick: () => { app.setTeam(null); app.showOpening(); } }, 'Sair da equipe'))),
    h('div', { class: 'eyebrow', style: { marginTop: '24px' } }, 'CENTRAL DE MISSÕES'),
    h('h1', {}, 'Escolha o desafio.', h('br'), 'A cidade espera.'),
    h('div', { class: 'row', style: { marginBottom: '18px' } }, h('button',{class:'btn sm',onclick:()=>app.showCentral()},'Área da equipe • missões, debates e conquistas'), h('button', { class: 'btn ghost sm', onclick: () => openTeamReport(app) }, 'Equipe • XP • Conquistas'), h('span', { class: 'mono muted', style: { fontSize: '.75rem' } }, '4 DESAFIOS • ATÉ 3 EQUIPES POR DESAFIO')), h('div', { class: 'hub-grid' }, grid, side));

  drawCamps(); drawSide();
  Promise.all(camps.map(async c => { const s = await backend().getSession(team.id, c.id); if (s) sessions[c.id] = s; }))
    .then(() => { drawCamps(); drawSide(); });
  const alert=h('button',{class:'btn',onclick:()=>app.showCentral()},'');const updateForum=()=>{const n=pendingGDFTopics(team.id).length;alert.hidden=!n;alert.textContent='🔔 GDF publicou questões • '+n+' resposta(s) pendente(s). Abrir área da equipe';};updateForum();root.prepend(alert);const forumTimer=setInterval(()=>{if(!root.isConnected){clearInterval(forumTimer);return}updateForum()},2000);return root;
}
