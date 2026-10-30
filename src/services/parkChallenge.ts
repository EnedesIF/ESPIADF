import {COURT_STEPS} from '@/data/courtRights';
import {relayRoute,routeActivities} from '@/data/relayChallenges';
import {GDF_ROUTES} from '@/data/gdf/routes';
import {challengeFor} from '@/data/challenges';
import type {CampaignId,Team} from '@/types';
import {registrationAssignments,type TeamRole} from '@/data/cityCooperation';
import {delivery,submitTask,type TaskDelivery} from './taskValidation';
import {validURL,normalizeSourceURL,learning,pendingGDFTopics} from './learning';
export const PARK_PREFIX='park-challenge:v1:';
export const PARK_ROLES:TeamRole[]=['escuta','campo','verificacao','dados','articulacao','participacao'];
export const PARK_STEPS=['Escolher a rota','Examinar informações iniciais','Comparar perspectivas','Escolher fontes','Interpretar e verificar','Propor uma resposta','Preparar participação','Avaliar a resposta','Apresentar e realizar a prática'];
export type ParkKind='route'|'agent'|'board'|'compare'|'source'|'verify'|'solution'|'channel'|'response'|'final';
export interface ParkActivity{kind:ParkKind;step:number;role:TeamRole;place:'square'|'alameda'|'park'|'lab';target:[number,number];title:string;prompt:string;speaker?:'tech'|'caio';speech?:string}
export const PARK_ACTIVITIES:ParkActivity[]=[
 {kind:'route',step:1,role:'escuta',place:'square',target:[50,83],title:'Examinar o mapa da praça',prompt:'Escolha o percurso que a equipe quer investigar e explique por quê. Ida às 7h e volta às 19h.'},
 {kind:'agent',step:2,role:'escuta',place:'park',target:[57,69],title:'Conversar com a agente',prompt:'O que a agente explicou? Qual problema a equipe precisa verificar?',speaker:'tech',speech:'Vocês pretendem passar às 7h e voltar às 19h? Antes de escolher o caminho, observem os horários de cada entrada. O quadro está aqui no parque. O que vocês precisam descobrir para saber se esse trajeto funciona?'},
 {kind:'board',step:2,role:'campo',place:'park',target:[43,61],title:'Examinar o quadro de horários',prompt:'Qual entrada permite passar às 7h? Alguma permite voltar às 19h? Capture o quadro e interprete a evidência.'},
 {kind:'compare',step:3,role:'verificacao',place:'square',target:[55,81],title:'Ouvir o morador na praça',prompt:'Compare o relato do morador, a fala da agente e o quadro. O relato comprova passagem às 19h? Explique.',speaker:'caio',speech:'Eu sempre atravesso por ali à tarde. Para mim, o caminho funciona muito bem. Mas nunca precisei voltar às 19h.'},
 {kind:'source',step:4,role:'dados',place:'alameda',target:[65,77],title:'Consultar o Laboratório de Evidências',prompt:'Escolha uma fonte pertinente, justifique e registre uma hipótese sustentada pelas evidências.'},
 {kind:'verify',step:5,role:'dados',place:'park',target:[57,69],title:'Verificar os limites com a agente',prompt:'O que podemos concluir no cenário? O que ainda precisa de confirmação em uma fonte atualizada?',speaker:'tech',speech:'Esses são os horários informados neste cenário fictício. Para planejar um deslocamento real, confiram a informação atualizada no canal responsável. Diferenciem o que observaram do que ainda precisam verificar.'},
 {kind:'solution',step:6,role:'articulacao',place:'lab',target:[57,77],title:'Construir uma proposta no laboratório',prompt:'Proponha um encaminhamento para a ida às 7h e a volta às 19h. Justifique com evidências e indique quem fará cada ação.'},
 {kind:'channel',step:7,role:'articulacao',place:'lab',target:[69,80],title:'Escolher a ferramenta de participação',prompt:'Justifique o canal escolhido e prepare a minuta ou a conclusão da consulta. Nenhum pedido será enviado automaticamente.'},
 {kind:'response',step:8,role:'participacao',place:'lab',target:[45,81],title:'Ler a resposta no atendimento',prompt:'O que a resposta esclarece? O que continua pendente? A proposta precisa mudar?'},
 {kind:'final',step:9,role:'participacao',place:'lab',target:[57,77],title:'Reunir a equipe e apresentar a prática',prompt:'Organize a conclusão com os seis participantes, a pesquisa real e a participação pertinente, com comprovantes e interpretação.'}
];
export interface ParkRecord{kind:ParkKind;memberId:string;memberName:string;at:number;fields:Record<string,string>}
export interface ParkEvent{id:string;at:number;kind:string;label:string;memberId:string;place:string;step:number}
export interface ParkState{events?:ParkEvent[];discoveredClues?:string[];routeId?:string;version:1;teamId:string;started:boolean;discussion:string;assignments:Record<string,string>;index:number;place:string;position:[number,number];visited:string[];clue:boolean;records:ParkRecord[];drafts:Record<string,Record<string,string>>;rewards:string[];finished:boolean}
export const challengePrefix=(id='park')=>id==='park'?PARK_PREFIX:id==='court'?'relay-challenge:v1:court:rights:':'relay-challenge:v1:'+relayRoute(id).id+':';
const key=(id:string,routeId='park')=>challengePrefix(routeId)+id;
export const stateRoute=(s:ParkState)=>relayRoute(s.routeId??'park');
export const activitiesFor=(s:ParkState)=>routeActivities(stateRoute(s),PARK_ACTIVITIES);
export function newParkState(team:Team,routeId='park'):ParkState{return {routeId:relayRoute(routeId).id,version:1,teamId:team.id,started:false,discussion:'',assignments:registrationAssignments(team.members),index:0,place:'square',position:[40,90],visited:['square'],clue:false,records:[],drafts:{},rewards:[],finished:false}}
export function parkState(team:Team,routeId='park'):ParkState{try{const s=JSON.parse(localStorage.getItem(key(team.id,routeId))||'null');if(s?.version===1&&s.teamId===team.id&&Number.isInteger(s.index)&&s.index>=0&&s.index<PARK_ACTIVITIES.length&&Array.isArray(s.records)&&s.drafts&&Array.isArray(s.rewards))return {...s,routeId:relayRoute(routeId).id}}catch{}return newParkState(team,routeId)}
export function savePark(s:ParkState){localStorage.setItem(key(s.teamId,s.routeId??'park'),JSON.stringify(s))}
export const challengeLockKey=(teamId:string,campaign:CampaignId)=>'espia:challenge-case:v1:'+teamId+':'+campaign;
export function activeChallengeCase(team:Team,campaign:CampaignId){const id=localStorage.getItem(challengeLockKey(team.id,campaign));const locked=GDF_ROUTES.find(r=>r.id===id&&r.campaign===campaign);if(locked)return locked;return GDF_ROUTES.filter(r=>r.campaign===campaign).map(r=>({route:r,state:parkState(team,r.id)})).filter(v=>v.state.started).sort((a,b)=>Number(b.state.finished)-Number(a.state.finished)||b.state.index-a.state.index)[0]?.route}
export function lockParkRoles(team:Team,s:ParkState,assignments:Record<string,string>,discussion:string){if(s.started)throw Error('Os papéis deste desafio já estão bloqueados.');const active=activeChallengeCase(team,stateRoute(s).campaign);if(active&&active.id!==stateRoute(s).id)throw Error('Este desafio já foi iniciado no caso '+active.title+'. Continue o progresso da equipe.');if(team.members.length<6)throw Error('Cadastre pelo menos seis participantes.');if(discussion.trim().length<20)throw Error('Registre a decisão da equipe em pelo menos 20 caracteres.');const ids=PARK_ROLES.map(r=>assignments[r]);if(new Set(ids).size!==6||ids.some(id=>!team.members.some(m=>m.id===id)))throw Error('Escolha seis responsáveis diferentes, um por papel.');if(PARK_ROLES.some(role=>assignments[role]!==registrationAssignments(team.members)[role]))throw Error('Os responsáveis são os definidos no cadastro da equipe.');s.assignments={...assignments};s.discussion=discussion.trim();s.started=true;localStorage.setItem(challengeLockKey(team.id,stateRoute(s).campaign),stateRoute(s).id);savePark(s)}
export const parkTaskKey=(step:number,routeId='park')=>challengePrefix(routeId)+'step:'+step;
export const taskKeyForActivity=(s:ParkState,a:ParkActivity)=>parkTaskKey(a.step,s.routeId)+(stateRoute(s).id==='court'?(a.kind==='source'?':source':''):(a.kind==='agent'?':agent':''));
export const activityTaskKey=(s:ParkState)=>taskKeyForActivity(s,activitiesFor(s)[s.index]);
export const stepsFor=(s:ParkState)=>stateRoute(s).id==='court'?COURT_STEPS:PARK_STEPS;
export const parkReview=(s:ParkState)=>delivery(s.teamId,stateRoute(s).campaign,activityTaskKey(s));
export function parkScore(s:ParkState){let total=0,completed=0;for(let step=1;step<=9;step++){const acts=activitiesFor(s).filter(a=>a.step===step),tasks=acts.map(a=>delivery(s.teamId,stateRoute(s).campaign,taskKeyForActivity(s,a)));if(tasks.length&&tasks.every(t=>t?.status==='validated')){total+=tasks.reduce((sum,t)=>sum+(t?.score??0),0)/tasks.length;completed++}}return {total,completed}}
export function parkForumPending(s:ParkState){return learning().suggestions.filter(t=>t.teamId==='gdf'&&t.status==='published'&&t.campaign===stateRoute(s).campaign&&(!t.routeId||t.routeId===(s.routeId??'park'))&&delivery(s.teamId,t.campaign,'forum:'+t.id)?.status!=='validated')}
/** Match the forum visible to this team: general questions plus this case. */
export function parkForumToAnswer(s:ParkState){return pendingGDFTopics(s.teamId).filter(topic=>!topic.routeId||topic.routeId===stateRoute(s).id)}
export function parkCanAdvance(s:ParkState){const t=parkReview(s);return !!t&&t.status!=='student_adjust'&&(activitiesFor(s)[s.index].kind!=='final'||parkForumToAnswer(s).length===0)}
const long=(fields:Record<string,string>,name:string,label:string)=>{if((fields[name]?.trim().length??0)<20||fields[name].length>6000)throw Error(label+': escreva pelo menos 20 caracteres para continuar (máximo de 6.000).')};
export function validateParkFields(a:ParkActivity,f:Record<string,string>,s:ParkState,team:Team){
 long(f,'answer','Sua interpretação');
 if(['vaccination','sanitary'].includes(stateRoute(s).id)){validateReviewedHealthFields(a,f,s);return;}
 if(stateRoute(s).id==='waste'){validateWasteFields(a,f,s);return;}
 if(stateRoute(s).id==='court'){validateCourtFields(a,f,s,team);return;}
 if(a.kind==='route'&&!(stateRoute(s).id==='park'?['parque','externo']:['principal','alternativa']).includes(f.route))throw Error('Escolha uma rota para investigar.');
 if(a.kind==='agent'&&!s.clue)throw Error('Encontre primeiro a pista na alameda.');
 if(a.kind==='board'){if(!f.evidenceId)throw Error('Capture o quadro ou anexe sua imagem.');if(!s.records.some(r=>r.kind==='agent'))throw Error('Registre a conversa com a agente.');}
 if(a.kind==='source'){if(f.toolOpened!=='sim')throw Error('Abra a fonte indicada pelo GDF antes de registrar a análise.');if(f.source!=='oficial')throw Error('A ferramenta selecionada não responde à pergunta desta etapa. Compare as opções e escolha a fonte pertinente.');if((stateRoute(s).campaign==='mobility'||['ubs','dengue'].includes(stateRoute(s).id))){f.researchURL=normalizeSourceURL(f.researchURL,true);if(!validResearchDate(f.researchDate))throw Error('Informe a data da consulta à fonte oficial.');if(!f.researchEvidence)throw Error('Adicione uma evidência da consulta real (print ou foto).');if(f.sourceStatus==='unavailable')long(f,'accessIssue','O que aconteceu ao consultar a fonte')}else long(f,'hypothesis','Sua ideia antes da pesquisa');}
 if(a.kind==='solution')long(f,'responsibilities','Responsáveis e ações');
 if(a.kind==='channel'){if(!['consulta','lai','ouvidoria','servico'].includes(f.channel))throw Error('Escolha a ferramenta adequada.');long(f,'draft',f.channel==='consulta'?'Conclusão da consulta':'Texto do encaminhamento');if((stateRoute(s).campaign==='mobility'||['ubs','dengue'].includes(stateRoute(s).id)))validateExternalParticipation(f);}
 if(a.kind==='final'){
  if(activitiesFor(s).slice(0,-1).some(a=>{const t=delivery(s.teamId,stateRoute(s).campaign,taskKeyForActivity(s,a));return !t||t.status==='student_adjust'}))throw Error('Envie as tarefas dos oito passos anteriores e corrija eventuais ajustes solicitados.');
  if((stateRoute(s).campaign==='mobility'||['ubs','dengue'].includes(stateRoute(s).id))){
   const consolidated=consolidateParkFields(s,team,f);Object.assign(f,consolidated);f.researchURL=normalizeSourceURL(f.researchURL,true);
   if(!validResearchDate(f.researchDate))throw Error('Confira a data da pesquisa registrada no percurso.');
   if(!f.researchEvidence)throw Error('Anexe a evidência da pesquisa real.');long(f,'research','Conclusão da pesquisa');
   if(!['consulta','lai','ouvidoria','servico','acao'].includes(f.realChannel))throw Error('Confira o encaminhamento da etapa 7.');long(f,'participation','Conclusão ou encaminhamento');validateExternalParticipation(f);if(f.externalSent==='sim'&&f.realChannel!=='acao'){const decision=delivery(s.teamId,stateRoute(s).campaign,parkTaskKey(7,s.routeId));if(!decision||!['gdf_pending','validated'].includes(decision.status))throw Error('A minuta precisa da revisão do professor antes de registrar um envio externo.');}
   if(f.confirm!=='sim')throw Error('Confirme a conferência das informações e evidências reais da equipe.');
  }else{
  if(stateRoute(s).id==='court'&&f.realChannel==='consulta'){f.participationDate=f.researchDate;f.participationEvidence=f.researchEvidence;}
  if(!validURL(f.researchURL,true))throw Error('Informe um link HTTPS de uma fonte oficial para a pesquisa real.');
  for(const date of [f.researchDate,f.participationDate]){if(!/^\d{4}-\d{2}-\d{2}$/.test(date??'')||!Number.isFinite(Date.parse(date))||Date.parse(date)>Date.now()+86400000)throw Error('Informe datas válidas para as duas entregas reais.');}
  if(!f.researchEvidence||!f.participationEvidence)throw Error('Anexe um print ou foto para cada uma das duas entregas reais.');
  long(f,'research','Interpretação da pesquisa real');long(f,'participation','Participação pertinente e resultado');
  if(!['consulta','lai','ouvidoria','acao','servico'].includes(f.realChannel))throw Error('Identifique a participação real realizada.');
  for(const m of team.members)long(f,'contribution:'+m.id,'Contribuição de '+m.name);
  if(f.confirm!=='sim')throw Error('Confirme que as duas atividades foram realizadas fora da simulação.');
  }
 }
}
export function submitPark(team:Team,s:ParkState,fields:Record<string,string>,index=s.index){if(!Number.isInteger(index)||index<0||index>s.index)throw Error('Tarefa indisponível.');const context={...s,index},previous=parkReview(context);if(!s.started||(s.finished&&previous?.status!=='student_adjust'))throw Error('Desafio indisponível.');const a=activitiesFor(s)[index],member=team.members.find(m=>m.id===s.assignments[a.role]);if(!member)throw Error('Responsável não encontrado.');validateParkFields(a,fields,context,team);const d=parkReview(context);if(d&&d.status!=='student_adjust')throw Error('Aguarde a avaliação e a confirmação do GDF.');
 const record:ParkRecord={kind:a.kind,memberId:member.id,memberName:member.name,at:Date.now(),fields:{...fields}};
 let task:TaskDelivery|undefined;
 task=submitTask(team,stateRoute(s).campaign,activityTaskKey(context),'Desafio '+challengeFor(stateRoute(s).campaign).number+' • '+stateRoute(s).title+' • Etapa '+a.step+'/9 • '+stepsFor(s)[a.step-1],member.id,JSON.stringify({tarefa:a.title,participante:member.name,respostas:fields,historico:[...s.records.filter(r=>r.kind!==a.kind),record].map(({kind,memberId,memberName,at})=>({kind,memberId,memberName,at})),evidenceId:fields.evidenceId,evidenceIds:[fields.researchEvidence,fields.participationEvidence].filter(Boolean),reuniao:s.discussion},null,2));
 s.records=[...s.records.filter(r=>r.kind!==a.kind),record];s.drafts[a.kind]={...fields};if(a.kind==='source'&&!s.rewards.includes('source'))s.rewards.push('source');savePark(s);return task;
}
export function advancePark(s:ParkState){if(!parkCanAdvance(s))throw Error('Envie a tarefa e corrija ajustes solicitados antes de continuar. Aguarde apenas o registro do envio.');if(s.index===PARK_ACTIVITIES.length-1){s.finished=true}else{s.index++}savePark(s)}

export const validResearchDate=(date:string)=>/^\d{4}-\d{2}-\d{2}$/.test(date??'')&&Number.isFinite(Date.parse(date))&&new Date(date+'T12:00:00').toISOString().slice(0,10)===date&&Date.parse(date)<=Date.now()+86400000;
export function validateExternalParticipation(f:Record<string,string>){
 if(f.externalSent!=='sim')return;
 if((f.realChannel??f.channel)==='consulta')throw Error('Uma consulta suficiente não é um envio externo. Revise a opção escolhida.');
 if(!validResearchDate(f.participationDate))throw Error('Informe a data apenas da participação que realmente ocorreu.');
 if(!f.participationEvidence)throw Error('Adicione o comprovante da participação externa realizada.');
 if(f.externalConfirm!=='sim')throw Error('Confirme que essa participação externa realmente ocorreu.');
}
export function consolidateParkFields(s:ParkState,team:Team,current:Record<string,string>={}){
 const recorded=(kind:ParkKind)=>s.records.find(r=>r.kind===kind)?.fields??{};
 const source={...s.drafts.source,...recorded('source')},channel={...s.drafts.channel,...recorded('channel')};
 const result:Record<string,string>={researchURL:source.researchURL??'',researchDate:source.researchDate??'',researchEvidence:source.researchEvidence??'',research:source.answer??'',sourceStatus:source.sourceStatus??'consulted',accessIssue:source.accessIssue??'',realChannel:channel.channel??'',participation:channel.draft??channel.answer??'',externalSent:channel.externalSent??'nao',participationDate:channel.participationDate??'',participationEvidence:channel.participationEvidence??'',externalConfirm:channel.externalConfirm??''};
 for(const m of team.members){const own=s.records.filter(r=>r.memberId===m.id&&r.kind!=='final').map(r=>r.fields.answer||r.fields.draft||'').filter(Boolean);result['contribution:'+m.id]=own.join('\n\n')}
 for(const [key,value] of Object.entries(current))if(value!==undefined)result[key]=value;
 return result;
}

function validateCourtFields(a:ParkActivity,f:Record<string,string>,s:ParkState,team:Team){
 if(a.kind==='agent'&&!s.clue)throw Error('Leia a pista antes de conversar com a Administração.');
 if(a.kind==='board'){f.researchURL=normalizeSourceURL(f.researchURL,true);if(!validResearchDate(f.researchDate))throw Error('Informe a data da consulta à norma.');if((f.normExcerpt?.trim().length??0)<20&&!f.researchEvidence)throw Error('Registre o trecho consultado ou anexe uma imagem da norma.');if(f.toolOpened!=='sim')throw Error('Abra a norma oficial antes de registrar a análise.');}
 if(a.kind==='source'){if(!['oficial','administracao'].includes(f.source)||f.toolOpened!=='sim')throw Error('Consulte a norma ou a Administração para verificar a alegação.');if(!['found','not_found','not_checked'].includes(f.authorisationStatus))throw Error('Informe o que conseguiu verificar sobre a autorização.');if(f.authorisationStatus==='found'){f.authorisationURL=normalizeSourceURL(f.authorisationURL,true);long(f,'authorisationExcerpt','O que o documento confirma sobre grupo, espaço e horário');}}
 if(a.kind==='solution')long(f,'responsibilities','Responsáveis e próximo passo');
 if(a.kind==='channel'){if(!['consulta','lai','ouvidoria'].includes(f.channel))throw Error('Escolha consulta suficiente, LAI ou ouvidoria.');long(f,'draft','Conclusão ou proposta de encaminhamento');}
 if(a.kind==='final'){
  if(activitiesFor(s).slice(0,-1).some(previous=>{const t=delivery(s.teamId,'territory',taskKeyForActivity(s,previous));return !t||t.status==='student_adjust'}))throw Error('Registre as atividades anteriores e corrija ajustes solicitados.');
  f.researchURL=normalizeSourceURL(f.researchURL,true);if(!validResearchDate(f.researchDate))throw Error('Confira a data da pesquisa.');if((f.normExcerpt?.trim().length??0)<20&&!f.researchEvidence)throw Error('Inclua o trecho consultado ou uma imagem da norma.');
  long(f,'confirmedFacts','O que a fonte confirmou');long(f,'remainingLimits','O que não foi possível verificar');long(f,'teamWork','Síntese do trabalho em equipe');
  if(f.confirm!=='sim')throw Error('Confirme a revisão da pesquisa e dos registros da equipe.');
  if(f.externalSent==='sim'){const decision=delivery(s.teamId,'territory',parkTaskKey(7,'court'));if(!decision||decision.status!=='validated')throw Error('Aguarde a revisão do professor antes de registrar participação externa.');if(!['lai','ouvidoria'].includes(f.externalChannel))throw Error('Informe o canal da participação externa.');if(!validResearchDate(f.participationDate)||!f.participationEvidence)throw Error('Inclua data e evidência apenas da participação realmente realizada.');}
 }
}
export function consolidateCourtFields(s:ParkState,team:Team,current:Record<string,string>={}){
 const board=s.records.find(r=>r.kind==='board')?.fields??{},verify=s.records.find(r=>r.kind==='verify')?.fields??{},channel=s.records.find(r=>r.kind==='channel')?.fields??{};
 return {researchURL:board.researchURL??'',researchDate:board.researchDate??'',normExcerpt:board.normExcerpt??'',researchEvidence:board.researchEvidence??'',confirmedFacts:board.answer??'',remainingLimits:verify.answer??'',teamWork:team.members.map(m=>m.name+': '+s.records.filter(r=>r.memberId===m.id).map(r=>r.fields.answer).filter(Boolean).join(' ').slice(0,500)).join('\n'),decision:channel.channel??'',proposal:channel.draft??'',externalSent:'nao',...current};
}

function validateWasteFields(a:ParkActivity,f:Record<string,string>,s:ParkState){
 if(a.kind==='route'&&!['principal','alternativa'].includes(f.route))throw Error('Escolha por onde começar.');
 if(a.kind==='agent'&&!s.clue)throw Error('Guarde a pista antes de conversar.');
 if(a.kind==='board'&&!s.records.some(r=>r.kind==='agent'))throw Error('Registre a conversa com a agente.');
 if(a.kind==='source'){
  if(!['oficial','carta'].includes(f.source)||f.toolOpened!=='sim')throw Error('Consulte uma fonte de coleta do SLU.');
  long(f,'hypothesis','Antes da consulta');f.researchURL=normalizeSourceURL(f.researchURL,true);
  if(!validResearchDate(f.researchDate))throw Error('Informe a data da consulta.');long(f,'realPlace','Local real pesquisado');
 }
 if(a.kind==='solution'){long(f,'missingInformation','Informação pendente e instrumento');long(f,'responsibilities','Responsáveis');}
 if(a.kind==='channel'){if(!['consulta','lai','ouvidoria'].includes(f.channel))throw Error('Escolha o próximo passo.');long(f,'need','O que ainda falta saber');long(f,'draft','Justificativa e orientação ou minuta');}
 if(a.kind==='final'){
  if(activitiesFor(s).slice(0,-1).some(previous=>{const t=delivery(s.teamId,'territory',taskKeyForActivity(s,previous));return !t||t.status==='student_adjust'}))throw Error('Registre as etapas anteriores e corrija os ajustes solicitados.');
  f.researchURL=normalizeSourceURL(f.researchURL,true);if(!validResearchDate(f.researchDate))throw Error('Confira a data da pesquisa real.');
  for(const key of ['realPlace','research','remainingLimits','teamWork'])long(f,key,'Registro final');
  if(!f.researchEvidence)throw Error('Anexe a evidência da pesquisa real.');if(f.confirm!=='sim')throw Error('Confirme a revisão da pesquisa e dos registros.');
  if(f.externalSent==='sim'){const decision=delivery(s.teamId,'territory',parkTaskKey(7,'waste'));if(decision?.status!=='validated')throw Error('Aguarde a revisão do professor antes de registrar participação externa.');if(!validResearchDate(f.participationDate)||!f.participationEvidence)throw Error('Registre data e comprovante da participação que realmente ocorreu.');}
 }
}
export function consolidateWasteFields(s:ParkState,current:Record<string,string>={}){
 const source=s.records.find(r=>r.kind==='source')?.fields??{},channel=s.records.find(r=>r.kind==='channel')?.fields??{};
 return {researchURL:source.researchURL??'',researchDate:source.researchDate??'',realPlace:source.realPlace??'',research:source.answer??'',researchEvidence:source.researchEvidence??'',realChannel:channel.channel??'',participation:channel.draft??'',externalSent:'nao',...current};
}

function validateReviewedHealthFields(a:ParkActivity,f:Record<string,string>,s:ParkState){
 if(a.kind==='route'&&f.route!=='principal')throw Error('Siga o percurso principal da investigação.');
 if(a.kind==='agent'&&!s.clue)throw Error('Guarde a pista antes da conversa.');
 if(a.kind==='board'&&!s.records.some(r=>r.kind==='agent'))throw Error('Registre a conversa da equipe antes de analisar o documento fictício.');
 if(a.kind==='source'){
  if(f.source!=='oficial'||f.toolOpened!=='sim')throw Error('Abra a fonte oficial de saúde antes de registrar a descoberta.');
  f.researchURL=normalizeSourceURL(f.researchURL,true);if(!validResearchDate(f.researchDate))throw Error('Registre a data da consulta real.');
  if((f.sourceName?.trim().length??0)<3)throw Error('Informe o nome da página ou documento consultado.');
 }
 if(a.kind==='solution')long(f,'nextStep','Próximo passo e informação a verificar');
 if(a.kind==='channel'){if(!['consulta','lai','ouvidoria',...(stateRoute(s).id==='vaccination'?['servico']:[])].includes(f.channel))throw Error('Escolha o encaminhamento pertinente.');long(f,'draft','Conclusão ou rascunho para o professor');}
 if(a.kind==='final'){
  if(activitiesFor(s).slice(0,-1).some(previous=>{const t=delivery(s.teamId,'health',taskKeyForActivity(s,previous));return !t||t.status==='student_adjust'}))throw Error('Envie os registros anteriores e corrija os ajustes solicitados.');
  f.researchURL=normalizeSourceURL(f.researchURL,true);if(!validResearchDate(f.researchDate))throw Error('Confira a data da pesquisa real.');if((f.sourceName?.trim().length??0)<3)throw Error('Confira o nome da fonte.');
  long(f,'research','Informação encontrada');long(f,'verification','Verificação e limites');if(stateRoute(s).id==='sanitary')long(f,'participation','Canal adequado e justificativa');
  if(f.confirm!=='sim')throw Error('Confirme a conferência da pesquisa pública e da conclusão.');
 }
}
export function consolidateHealthFields(s:ParkState,current:Record<string,string>={}){
 const source=s.records.find(r=>r.kind==='source')?.fields??{},verify=s.records.find(r=>r.kind==='verify')?.fields??{},channel=s.records.find(r=>r.kind==='channel')?.fields??{};
 return {sourceName:source.sourceName??'',researchURL:source.researchURL??'',researchDate:source.researchDate??'',research:source.answer??'',researchEvidence:source.researchEvidence??'',verification:verify.answer??'',realChannel:channel.channel??'',participation:channel.draft??'',...current};
}
