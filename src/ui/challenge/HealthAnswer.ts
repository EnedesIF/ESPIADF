import {h,clear} from '../dom';
import {caseScript,QUESTION_INDEX} from '@/data/caseScripts';
import {VACCINE_NOTICE,SANITARY_OBSERVATION} from '@/data/healthRoutesReview';
import {HEALTH_PRIVACY} from '@/data/healthReview';
import {CIVIC_CONCEPTS} from '@/data/mobilityReview';
import {sourceChoices} from './SourceChoices';
import {officialURL,compressImage,putImage} from '@/services/learning';
import type {GdfRoute} from '@/data/gdf/routes';
import type {ParkActivity,ParkState} from '@/services/parkChallenge';
export function healthAnswerFields(route:GdfRoute,a:ParkActivity,f:Record<string,string>,state:ParkState,save:()=>void){
 const rows:HTMLElement[]=[],vacc=route.id==='vaccination',script=caseScript(route),set=(k:string,v:string)=>{f[k]=v;save()};
 const text=(key:string,label:string,type='textarea',target=rows)=>{const input=type==='textarea'?h('textarea',{rows:3,maxlength:6000,'aria-label':label}):h('input',{type,'aria-label':label});input.value=f[key]??'';input.oninput=()=>set(key,input.value);target.push(h('label',{},label,input));return input};
 const concept=(value:string)=>h('p',{class:'learning-concept'},value);
 const evidence=()=>{const status=h('p',{role:'status'},f.researchEvidence?'✓ Imagem da consulta salva':'Imagem opcional. Não anexe cartão, documento ou dados de saúde.'),file=h('input',{type:'file',accept:'image/png,image/jpeg,image/webp','aria-label':'Imagem opcional da fonte pública'});file.onchange=async()=>{if(!file.files?.[0])return;try{const id='health-source-'+crypto.randomUUID();await putImage(id,await compressImage(file.files[0]));set('researchEvidence',id);status.textContent='✓ Imagem da consulta salva'}catch(error){status.textContent=(error as Error).message}};rows.push(h('label',{},'Evidência opcional • imagem da página pública',file),status,h('button',{type:'button',onclick:()=>{set('researchEvidence','');status.textContent='Sem imagem. A evidência permanece no link e na interpretação registrados.'}},'Remover imagem opcional'))};
 if(a.kind==='route'){f.route='principal';rows.push(h('p',{},vacc?'Investigue a orientação oficial atual sobre atendimento sem o cartão de vacinação.':'Investigue a situação e descubra como a Vigilância Sanitária do DF atua.'));}
 if(a.kind==='agent'&&vacc)rows.push(concept(CIVIC_CONCEPTS.active));
 if(a.kind==='board'){
  rows.push(h('article',{class:'health-fiction-document'},h('b',{},'DOCUMENTO FICTÍCIO — material do jogo'),h('pre',{},vacc?VACCINE_NOTICE:SANITARY_OBSERVATION)));
  if(!vacc)rows.push(concept('Uma observação é o relato do que foi visto. A confirmação de infração depende de análise da autoridade competente.'));
 }
 if(a.kind==='compare'){rows.push(h('blockquote',{},route.other));if(vacc)rows.push(concept(CIVIC_CONCEPTS.control));}
 if(a.kind==='source'){
  rows.push(h('b',{},'PESQUISA REAL • fonte pública'),concept(CIVIC_CONCEPTS.active));
  for(const choice of sourceChoices(route))rows.push(h('a',{class:'park-tool-link',href:officialURL(choice.key),target:'_blank',rel:'noopener noreferrer',onclick:()=>{set('source','oficial');set('toolOpened','sim')}},choice.label+' ↗'));
  if(route.extra)rows.push(h('a',{class:'park-tool-link',href:route.extra.url,target:'_blank',rel:'noopener noreferrer',onclick:()=>{set('source','oficial');set('toolOpened','sim')}},route.extra.label+' ↗'));
  rows.push(h('p',{},'Abra a publicação, procure a orientação pertinente e registre o que encontrou. Se a informação não estiver disponível, descreva a lacuna.'));
  text('sourceName','Nome da página ou documento consultado','text');text('researchURL','Link oficial efetivamente consultado','url');text('researchDate','Data da consulta','date');evidence();
 }
 if(a.kind==='solution'){
  rows.push(concept(vacc?CIVIC_CONCEPTS.lai:CIVIC_CONCEPTS.control));
  text('nextStep',vacc?'Onde o jovem deve confirmar sua situação individual?':'O que ainda seria necessário verificar?');
 }
 if(a.kind==='channel'){
  rows.push(h('p',{},script.questions[7]),h('p',{},vacc?'Dúvidas clínicas individuais devem ser esclarecidas com a equipe de saúde.':'Prepare somente um rascunho para o professor, sem dados pessoais nem acusações.'));
  const select=h('select',{'aria-label':'Encaminhamento da equipe'},h('option',{value:''},'Escolha…'),h('option',{value:'consulta'},'A consulta pública respondeu à dúvida'),h('option',{value:'lai'},'Preparar pedido de acesso à informação'),h('option',{value:'ouvidoria'},'Preparar registro à Ouvidoria'),...(vacc?[h('option',{value:'servico'},'Confirmar orientação com o serviço de saúde')]:[]));select.value=f.channel??'';rows.push(h('label',{},'Encaminhamento da equipe',select));
  const panel=h('section',{class:'gdf-channel-details'}),draw=()=>{clear(panel);const channel=f.channel;if(!channel)return;const fields:HTMLElement[]=[];
   if(channel==='lai')fields.push(concept(CIVIC_CONCEPTS.lai),concept(CIVIC_CONCEPTS.request),concept(CIVIC_CONCEPTS.passive));
   if(channel==='ouvidoria')fields.push(concept(CIVIC_CONCEPTS.ombudsman));
   if(['lai','ouvidoria'].includes(channel))fields.push(h('a',{class:'park-tool-link',href:officialURL('participa'),target:'_blank',rel:'noopener noreferrer'},'Consultar Participa DF ↗'));
   text('draft',channel==='consulta'?'Que informação respondeu à dúvida e como compartilhá-la?':channel==='lai'?'Qual informação pública falta? Escreva o pedido simulado.':channel==='ouvidoria'?'Qual problema concreto justificaria o canal? Escreva o rascunho, sem dados pessoais.':'Como confirmar a orientação com a unidade de saúde?','textarea',fields);
   fields.push(h('p',{},'Este registro vai para avaliação no jogo. Nada é enviado ao órgão público.'));panel.append(...fields)};select.onchange=()=>{set('channel',select.value);draw()};draw();rows.push(panel,concept(HEALTH_PRIVACY));return rows;
 }
 if(a.kind==='response'){
  const channel=state.records.find(r=>r.kind==='channel')?.fields.channel??state.drafts.channel?.channel;
  rows.push(h('article',{class:'park-hours'},h('b',{},channel==='consulta'?'REVISÃO DA CONSULTA • não houve resposta de órgão público':'RETORNO FICTÍCIO — SIMULAÇÃO DO JOGO • não enviado por órgão público'),h('p',{},channel==='consulta'?'Revejam o que encontraram na publicação oficial e os limites registrados. Não houve envio nem retorno de órgão público.':script.response)));
 }
 if(a.kind==='final'){
  rows.push(h('b',{},'PESQUISA REAL • consolidação'),h('p',{},'A situação da história é fictícia. Confiram os dados da consulta já registrada e complementem apenas o necessário; nenhuma manifestação externa é obrigatória.'));
  const metadata:HTMLElement[]=[];text('sourceName','Fonte oficial consultada','text',metadata);text('researchURL','Link oficial consultado','url',metadata);text('researchDate','Data da consulta','date',metadata);rows.push(h('details',{},h('summary',{},'Conferir fonte, link e data já registrados'),...metadata));
  text('research',vacc?'O que a equipe descobriu? • orientação encontrada':'O que a fonte informa? • atribuição e canal oficial');text('verification',vacc?'Como a equipe verificou?':'O que ainda precisa ser verificado?');if(!vacc)text('participation','Canal adequado e por quê • conclusão ou rascunho já registrado');evidence();const confirm=h('input',{type:'checkbox','aria-label':'Conferimos a pesquisa pública e a conclusão da equipe',checked:f.confirm==='sim'});confirm.onchange=()=>set('confirm',confirm.checked?'sim':'');rows.push(h('label',{},confirm,'Conferimos a pesquisa pública e a conclusão da equipe.'));
 }
 text('answer',script.questions[QUESTION_INDEX[a.kind]]);rows.push(h('p',{class:'health-privacy'},HEALTH_PRIVACY));return rows;
}
