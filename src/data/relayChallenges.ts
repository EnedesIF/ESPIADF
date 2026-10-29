import {COURT_STEP_BY_KIND} from './courtRights';
import {COURT_TASK_TITLES} from './territoryReview';
import {caseScript,QUESTION_INDEX} from './caseScripts';
import {routeExperience} from './routeExperience';
import {GDF_ROUTES,type GdfRoute} from './gdf/routes';
import type {ParkActivity} from '@/services/parkChallenge';
export function relayRoute(id='park'):GdfRoute{const route=GDF_ROUTES.find(r=>r.id===id);if(!route)throw Error('Desafio não encontrado.');return route}
/** Scenario records belong to their route; no invented fields or live statistics. */
export const CASE_OBJECTS:Record<string,string>={transport:'Mural do ponto de ônibus',accessibility:'Registro da calçada irregular',lighting:'Observação da luminária apagada',park:'Quadro de horários do parque',employment:'Anúncio de trabalho e quadro de requisitos',training:'Descrição do programa de formação',pay:'Registros de remuneração sem nomes',vacancies:'Quadro de cargos ocupados e vagos',court:'Norma de uso dos espaços esportivos',waste:'Cronograma e separação de resíduos',police:'Roteiro de leitura do relatório',ubs:'Orientação de acesso à unidade',vaccination:'Aviso de acesso à sala de vacina',dengue:'Observação do recipiente com água',sanitary:'Registro de observação da lanchonete'};
export function routeActivities(route:GdfRoute,park:ParkActivity[]):ParkActivity[]{
 const script=caseScript(route),experience=routeExperience(route);
 return park.map(a=>{
  const place=script.places[a.kind as keyof typeof script.places]??a.place;
  const titles:Record<string,string>={route:(route.id==='transport'?'Planejar o trajeto':'Conhecer o problema')+' • '+route.title,agent:'Ouvir orientação • '+route.title,board:'Abrir • '+CASE_OBJECTS[route.id],compare:'Ouvir • '+experience.witness,source:script.sourceTitle,verify:'Conferir a descoberta • '+route.title,solution:'Montar nosso plano • '+route.title,channel:'Preparar o próximo passo • '+route.title,response:'Ler o retorno • '+route.title,final:'Apresentar a descoberta • '+route.title};
  return {...a,place,step:route.id==='court'?COURT_STEP_BY_KIND[a.kind]:a.step,title:route.id==='court'?COURT_TASK_TITLES[a.kind]:titles[a.kind],prompt:script.questions[QUESTION_INDEX[a.kind]],...(a.kind==='agent'?{speech:script.agent}:a.kind==='compare'?{speech:route.other}:a.kind==='verify'?{speech:script.verify}:{})};
 });
}
export const routeClue=(route:GdfRoute)=>route.id==='park'?'O parque tem duas entradas. Nem sempre elas funcionam nos mesmos horários.':route.id==='lighting'?'Não presuma QR Code ou câmera: descubra quais dados o canal de iluminação realmente solicita.':route.id==='employment'?'Um anúncio que pede PIX não comprova vínculo com uma oportunidade oficial.':route.id==='vacancies'?'Cargo vago e concurso aberto são informações diferentes.':route.id==='pay'?'Bruto e líquido são medidas diferentes; compare recortes equivalentes.':route.id==='police'?'A definição do indicador vem antes da conclusão. Produtividade não equivale ao total de crimes.':route.limit;
