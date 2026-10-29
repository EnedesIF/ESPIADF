import {teamRanking} from './TeamRanking';
import type {App} from '../App';
import type {CampaignId} from '@/types';
import {h,clear} from '../dom';
import {GDF_ROUTES} from '@/data/gdf/routes';
import {CHALLENGES,challengeFor} from '@/data/challenges';
import {activeChallengeCase,parkState,parkScore,activitiesFor} from '@/services/parkChallenge';
export function challengeChoice(app:App,initialCampaign?:CampaignId){
 const team=app.team!,root=h('main',{class:'screen real-central route-choice relay-choice'});
 const home=()=>{
  clear(root);
  const cards=CHALLENGES.map(c=>{
   const active=activeChallengeCase(team,c.id),s=active?parkState(team,active.id):undefined,score=s?parkScore(s):undefined;
   return h('button',{class:'route-card challenge-card',onclick:()=>cases(c.id)},
    h('span',{class:'eyebrow'},'DESAFIO '+c.number),h('h2',{},c.title),h('p',{},c.pitch),
    h('b',{},s?s.finished?'✓ Percurso entregue • '+score!.total+'/900':'Continuar • Etapa '+activitiesFor(s)[s.index].step+'/9':'Escolher situação →'),
    h('small',{},active?'Caso da equipe: '+active.title:'9 etapas • revezamento entre os 6 integrantes'));
  });
  root.append(h('button',{class:'btn ghost',onclick:()=>app.showOpening()},'← Voltar à abertura'),
   h('header',{},h('span',{class:'eyebrow'},'4 DESAFIOS • 9 ETAPAS • 6 INTEGRANTES'),h('h1',{},'Qual desafio vamos investigar?'),h('p',{},'Escolham um dos quatro desafios. Depois, selecionem uma situação para investigar e organizem a equipe.')),
   h('div',{class:'route-grid challenge-grid'},...cards),h('details',{},h('summary',{},'🏆 Ranking de todas as equipes'),teamRanking(team.id)),
   h('p',{},'Cada desafio vale até 900 pontos. A equipe constrói suas respostas em conjunto.'));
 };
 const cases=(campaign:CampaignId)=>{
  const c=challengeFor(campaign);clear(root);
  const cards=GDF_ROUTES.filter(r=>r.campaign===campaign).map(route=>h('button',{class:'route-card case-card',onclick:()=>void app.showChallenge(route.id)},h('span',{class:'eyebrow'},'CASO • '+route.title),h('p',{},route.question),h('small',{},route.source),h('b',{},'Começar investigação →')));
  root.append(h('button',{class:'btn ghost',onclick:home},'← Voltar aos quatro desafios'),h('header',{},h('span',{class:'eyebrow'},'DESAFIO '+c.number+' • 9 ETAPAS'),h('h1',{},'Qual situação vamos investigar?'),h('p',{},'Escolham uma situação. Depois, a equipe vai definir o que deseja descobrir.')),h('div',{class:'route-grid case-grid'},...cards));
 };
 initialCampaign?cases(initialCampaign):home();return root;
}
