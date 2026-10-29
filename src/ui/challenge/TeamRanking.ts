import {h,clear} from '../dom';
import {backend} from '@/services/backend';
import {rankingRows} from '@/services/teamRanking';
import {CHALLENGES} from '@/data/challenges';
import type {CampaignId} from '@/types';
/** Public projection: never render member names, answers, contacts or evidence. */
export function teamRanking(currentTeamId:string){
 const root=h('section',{class:'team-ranking'}),status=h('p',{role:'status'}),rows=h('div'),filter=h('select',{'aria-label':'Desafio do ranking'},h('option',{value:''},'Todos os desafios'),...CHALLENGES.map(c=>h('option',{value:c.id},c.title)));
 let request=0;
 const refresh=async()=>{const seq=++request;status.textContent='Atualizando classificação…';try{const teams=await backend().listTeams();if(seq!==request)return;const campaign=filter.value as CampaignId|'';const entries=rankingRows(teams,campaign||undefined);
 clear(rows);const table=h('table',{},h('caption',{},campaign?'Desempenho no desafio selecionado':'Desempenho nos quatro desafios'),h('thead',{},h('tr',{},...['Posição','Equipe','Pontos validados','Etapas validadas','Entregas enviadas'].map(t=>h('th',{scope:'col'},t))))),body=h('tbody');
 entries.forEach(r=>{body.append(h('tr',{'data-current-team':String(r.teamId===currentTeamId)},h('td',{},String(r.place)+'º'),h('th',{scope:'row'},r.name+(r.teamId===currentTeamId?' • sua equipe':'')),h('td',{},r.score+' / '+(campaign?900:3600)),h('td',{},r.completed+' / '+(campaign?9:36)),h('td',{},String(r.sent))))});table.append(body);rows.append(table);status.textContent=entries.length?entries.length+' equipe(s). Empates em pontos compartilham a posição.':'Ainda não há equipes cadastradas para exibir.';
 }catch{status.textContent='Não foi possível carregar o ranking. Tente atualizar novamente.'}};
 filter.onchange=()=>void refresh();root.append(h('h3',{},'Ranking das equipes'),h('p',{},'A classificação considera notas validadas: pelo professor em Nosso lugar na cidade e pelo GDF nos demais desafios. XP, notas provisórias e fórum não alteram esta classificação.'),h('label',{},'Comparar desempenho',filter),h('button',{onclick:()=>void refresh()},'Atualizar ranking'),status,rows);void refresh();return root;
}
