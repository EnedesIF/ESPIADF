import type {GdfRoute} from './routes';
import type {CampaignId} from '@/types';
import {CASES,type SimCase} from '../simulation';
import {CITY_MISSIONS,CITY_EXTENSIONS,REQUIRED_CITY_RECORDS} from '../cityMissions';
export function routeScenario(route:GdfRoute){
 const id=route.campaign,base=CASES[id],keys=REQUIRED_CITY_RECORDS[id];
 const records=keys.map((key,i)=>({id:key,tool:route.tool,title:[route.source,'Interpretar a fonte','Limites da conclusão','Verificar antes de agir'][i],body:route.facts[Math.min(i,route.facts.length-1)],source:route.source,date:'DADO SIMULADO PARA DEMONSTRAÇÃO • cenário pedagógico',relevant:true}));
 const scenario:SimCase={...base,target:route.title+' • espaço fictício do DF',question:route.question,focus:route.title,rumor:route.initial,response:route.other,agency:route.agency,channel:route.channel,reason:route.participation,request:'',tools:[route.tool,'participa'],records,priorities:['Planejar o próximo passo','Tornar a informação compreensível','Propor melhoria fundamentada'],outcome:'Resposta fictícia: foram indicadas as orientações ou os registros disponíveis para análise. Isso não confirma execução, inscrição, reserva nem atendimento. A equipe precisa avaliar o que foi esclarecido e o que falta.',uncertain:route.limit};
 const def={...CITY_MISSIONS[id],field:'Observe o local e identifique o período e as informações que faltam.',object:route.title+' • ponto de observação',observation:route.initial,staff:'Orientação • '+route.agency,actions:[{name:'Planejar o próximo passo',description:route.record,type:'board' as const,impact:'Proposta representada; resultado real não garantido'},{name:'Melhorar a informação no local',description:'Proponha orientação clara apoiada nas fontes.',type:'board' as const,impact:'Visualização de proposta, não execução real'},{name:'Preparar participação fundamentada',description:route.participation,type:'board' as const,impact:'Encaminhamento a revisar com o professor'}]};
 if(route.art==='bus')def.object='Painel digital da parada';
 const extension={...CITY_EXTENSIONS[id],testimony:route.other,place:'Verificação • '+route.title,verifyText:route.limit+' Compare a observação com as fontes antes de decidir.'};
 const questions=Object.fromEntries(keys.map((k,i)=>[k,[route.search,'O que a informação permite decidir?',route.limit,'O que falta confirmar?'][i]]));
 return {scenario,def,extension,required:keys,questions};
}
