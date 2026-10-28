import {registrationAssignments,type TeamRole} from '@/data/cityCooperation';
import type {Team} from '@/types';
import type {PilotPlace} from './PilotWorld';
import type {PilotPoint} from './PilotGround';
export const PILOT_TASKS:{role:TeamRole;place:PilotPlace;target:PilotPoint;title:string;prompt:string}[]=[
 {role:'escuta',place:'park',target:[57,69],title:'Ouvir a agente e receber a pista',prompt:'O que a agente explicou? Que problema a equipe precisa investigar sobre a ida às 7h e a volta às 19h?'},
 {role:'campo',place:'park',target:[43,61],title:'Examinar o quadro de horários',prompt:'Norte: 6h–18h; Sul: 8h–18h. Registre o que observou e a diferença entre as entradas.'},
 {role:'dados',place:'alameda',target:[65,77],title:'Escolher a fonte da investigação',prompt:'Explique por que a página de parques da Brasília Ambiental é pertinente e que informação você precisa confirmar na pesquisa real.'},
 {role:'verificacao',place:'park',target:[57,69],title:'Comparar a pista e verificar os limites',prompt:'Um colega entrou à tarde. Isso confirma passagem às 19h? Compare o relato com os horários e explique os limites.'},
 {role:'articulacao',place:'square',target:[50,83],title:'Propor um próximo passo',prompt:'Proponha uma alternativa para a volta às 19h, com justificativa e responsável por confirmar as informações.'},
 {role:'participacao',place:'park',target:[57,69],title:'Preparar a participação da equipe',prompt:'Que informação ainda falta? Justifique consultar uma fonte, preparar uma LAI, uma manifestação pertinente ou concluir que a consulta bastou. Não envie pedido real neste teste.'}
];
export function pilotOwner(team:Team,index:number){const assignments=registrationAssignments(team.members),task=PILOT_TASKS[index];return team.members.find(m=>m.id===assignments[task.role])??team.members[0]}
export const pilotTaskKey=(index:number)=>'pilot:connected:'+index;
export const canPilotHandoff=(status:string|undefined)=>status==='validated';
