import {relayRoute} from '@/data/relayChallenges';
import {parkState} from './parkChallenge';
import {backend} from './backend';
import {createDemoTeam,correctDemoCast,DEMO_PASSWORD} from './demo';
import {newParkState,lockParkRoles,activitiesFor,savePark,activityTaskKey} from './parkChallenge';
import {delivery,submitTask,teacherGrade,gdfValidate} from './taskValidation';
export const COMPLETED_DEMO_ID='espia-completed-demo-v1';
export const completedDemoTeamId=(routeId:string)=>['park','employment','court','ubs'].includes(routeId)?COMPLETED_DEMO_ID:COMPLETED_DEMO_ID+'-'+routeId;
export const DEMO_ANSWERS=[
 'A equipe escolheu investigar a travessia do parque na ida às 7h e na volta às 19h. Vamos comparar horários, relatos e fontes oficiais antes de recomendar o caminho.',
 'A agente explicou que as entradas têm horários diferentes. Sua fala orienta a investigação, mas precisamos conferir o quadro e registrar o que ele realmente informa.',
 'No quadro deste cenário fictício, a entrada Norte abre às 6h e fecha às 18h. Ela atende a ida às 7h, mas não comprova uma travessia às 19h. A foto do quadro deve acompanhar esta interpretação.',
 'O morador atravessa à tarde e considera o trajeto bom. A agente pede atenção aos horários. O quadro informa fechamento às 18h. O relato do morador não comprova passagem às 19h, pois ele nunca voltou nesse horário.',
 'Escolhemos a fonte oficial do Brasília Ambiental para verificar o parque e suas regras. Hipótese: o parque serve para a ida, mas a volta requer outro percurso. É preciso conferir qual parque e a atualização da informação.',
 'No cenário, a ida é compatível com o horário informado. A volta às 19h não está sustentada pelas evidências. A conclusão se limita à simulação; horário atual e acessibilidade do parque real precisam de confirmação.',
 'Propomos usar a entrada Norte na ida e estudar uma rota externa para a volta. Cada integrante mantém o papel definido no cadastro, confere sua parte das informações e contribui para o plano coletivo.',
 'A equipe prepara uma consulta ao canal indicado pelo GDF: “Quais entradas e horários estão disponíveis e qual alternativa acessível atende a volta às 19h?” A minuta usa as evidências. Este exemplo não envia uma solicitação real.',
 'A resposta simulada esclarece o fechamento, mas não informa iluminação e acessibilidade da alternativa externa. A equipe deve confirmar esses pontos antes de divulgar a recomendação.',
 'A conclusão reúne horários, relatos e limites das fontes. Exemplo de pesquisa: conferir a orientação oficial e anotar data e endereço. Exemplo de participação: compartilhar uma orientação verificada com a comunidade. As duas práticas e os comprovantes apresentados aqui são fictícios, para demonstrar o fluxo.'
];
export async function completedDemo(routeId='park'){const route=relayRoute(routeId),campaign=route.campaign,demoId=completedDemoTeamId(route.id);
 let team=await backend().getTeam(demoId);if(!team){const base=await createDemoTeam();team=await backend().createTeam({...base,id:demoId,name:demoId===COMPLETED_DEMO_ID?'Percurso concluído (demo)':route.title+' • percurso concluído (demo)',login:demoId===COMPLETED_DEMO_ID?'DEMO-CONCLUIDA':'DEMO-CONCLUIDA-'+route.code,mentor:{...base.mentor,email:'concluida@demo.local'},members:base.members.map((m,i)=>({...m,id:demoId+'-'+i}))},DEMO_PASSWORD)}
 await correctDemoCast(team); const saved=parkState(team,route.id);if(saved.finished&&activitiesFor(saved).every((_,index)=>delivery(team!.id,campaign,activityTaskKey({...saved,index}))?.status==='validated'))return team;const s=newParkState(team,route.id);
 lockParkRoles(team,s,s.assignments,'A equipe escolheu investigar: '+route.question);const activities=activitiesFor(s);s.events=[];
 for(const [i,a] of activities.entries()){s.index=i;const member=team.members.find(m=>m.id===s.assignments[a.role])!,fields:Record<string,string>={answer:route.id==='park'?DEMO_ANSWERS[i]:exampleAnswer(routeId,a.kind),example:'DEMONSTRAÇÃO FICTÍCIA • não representa pesquisa ou participação real.'};if(a.kind==='final')for(const m of team.members)fields['contribution:'+m.id]=m.name+' participou na função atribuída, reuniu seu registro e colaborou na conclusão coletiva de exemplo.';
 const previous=delivery(team.id,campaign,activityTaskKey(s));const task=previous??submitTask(team,campaign,activityTaskKey(s),'EXEMPLO • '+a.title,member.id,JSON.stringify(fields));if(['teacher_pending','teacher_adjust'].includes(task.status))teacherGrade(task.id,team.mentor.email,'approve',100,'EXEMPLO FICTÍCIO: interpretação e evidências conferidas para apresentação do fluxo.');if(delivery(team.id,campaign,activityTaskKey(s))?.status==='gdf_pending')gdfValidate(task.id,'confirm','EXEMPLO FICTÍCIO: avaliação do professor confirmada para demonstração.');s.records.push({kind:a.kind,memberId:member.id,memberName:member.name,at:Date.now(),fields});s.events.push({id:'demo-'+i,at:Date.now(),kind:'exemplo',label:'EXEMPLO • '+a.title,memberId:member.id,place:a.place,step:a.step});}
 s.finished=true;s.clue=true;s.visited=['square','alameda','park','lab'];s.discoveredClues=Array.from({length:9},(_,i)=>'step:'+(i+1));savePark(s);return team;
}

function exampleAnswer(routeId:string,kind:string){const r=relayRoute(routeId);const answers:Record<string,string>={
 route:'A equipe escolheu investigar: '+r.question+' Vamos registrar as evidências, comparar perspectivas e consultar '+r.source+'.',
 agent:'A agente orientou: '+r.initial+' A equipe precisa verificar: '+r.search,
 board:'Examinamos o registro do cenário: '+r.facts.join(' ')+' Nossa interpretação respeita este limite: '+r.limit,
 compare:'Comparamos a orientação da agente com o outro relato: “'+r.other+'” O documento informa: '+r.facts[0]+' O relato isolado não substitui essa verificação.',
 source:'Consultamos '+r.source+'. O que buscamos: '+r.search+' Hipótese de exemplo a verificar: '+r.facts[1]+' Fonte indicada: '+r.url,
 verify:'As evidências permitem afirmar: '+r.facts[1]+' Limite da conclusão: '+r.limit,
 solution:'A equipe propõe verificar '+r.search+' O responsável pelos dados consulta a fonte, a verificação compara evidências, a articulação organiza a proposta e os demais participantes documentam e comunicam os resultados. '+r.limit,
 channel:'Encaminhamento de exemplo conforme orientação do GDF: '+r.participation+' A minuta deve apresentar o contexto, a informação procurada e as evidências, respeitando o canal indicado. Nenhum pedido real foi enviado.',
 response:'A resposta simulada esclarece: '+r.facts[1]+' Continua sendo necessário observar: '+r.limit+' A equipe compara esse retorno com sua pergunta antes de divulgar uma conclusão.',
 final:'Conclusão de exemplo: '+r.facts[1]+' '+r.limit+' A pesquisa deve registrar fonte, data, interpretação e comprovante. A participação deve seguir esta orientação: '+r.participation+' Os seis integrantes apresentam suas contribuições. Este registro é fictício e não representa atividades reais.'
 };return answers[kind];}
