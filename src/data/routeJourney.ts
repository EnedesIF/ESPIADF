import type {CityStage} from './cityMissions';
import {GDF_STEPS,type GdfRoute} from './gdf/routes';
import type {HiddenClue} from './v02/clues';
export const ROUTE_STEP:Record<CityStage,number>={contact:2,inspect:2,listen:3,research:4,verify:5,action:6,participate:7,impact:8,return:9,done:9};
export const routeStepTitle=(stage:CityStage)=>GDF_STEPS[ROUTE_STEP[stage]-1];
/** Discoveries support a task; they never validate it or replace its evidence. */
export function investigationClues(route:GdfRoute,base:HiddenClue[]):HiddenClue[]{
 const details=[
  {title:'Um detalhe no registro inicial',near:'objeto de observação',steps:[route.initial,'Compare este registro com o primeiro relato. Que informação ainda falta?']},
  {title:'Outro olhar sobre o caso',near:'segunda pessoa do percurso',steps:[route.other,'O relato confirma toda a situação ou só uma experiência? Anote a diferença.']},
  {title:'Uma conclusão tem limites',near:'ponto de verificação',steps:[route.limit,'Cruze este alerta com os registros da rota antes de concluir.']},
  {title:'Qual será o próximo passo?',near:'agente de orientação',steps:[route.participation,'Escolha o canal com base na investigação. O professor revisa antes de qualquer envio real.']}
 ];
 return details.map((d,i)=>({...base[i%base.length],...d,id:route.id+':journey:'+i,link:(i===3?'participa':'gdf-'+route.id) as HiddenClue['link'],missionId:'gdf-research-'+route.id}));
}
