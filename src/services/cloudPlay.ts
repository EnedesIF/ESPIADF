import type {SupabaseClient} from '@supabase/supabase-js';
import type {Team} from '@/types';
import type {ParkState} from './parkChallenge';
let sb:SupabaseClient|undefined,active:Team|undefined;
let running:Promise<void>|undefined,timer:ReturnType<typeof setTimeout>|undefined;
const versions=new Map<string,number>();
const pending=new Map<string,{state:ParkState;mutation:string;attempt?:string;attempts?:string[]}>();
const status=new Map<string,string>();
const OUTBOX='espia:cloud-outbox:v1:';
const stateKey=(team:string,route:string)=>route==='park'?'park-challenge:v1:'+team:route==='court'?'relay-challenge:v1:court:rights:'+team:'relay-challenge:v1:'+route+':'+team;
export const cloudEnabled=(id:string)=>!!sb&&active?.id===id;
export const cloudStatus=(id:string)=>status.get(id)??'Demonstração • cópia neste dispositivo';
function announce(id:string,text:string){status.set(id,text);if(typeof window!=='undefined')window.dispatchEvent(new Event('espia-cloud-save'));}
export function configureCloud(client:SupabaseClient){sb=client;}
export function suspendCloud(){active=undefined;cloudContext=false;}
function persist(route:string){if(!active)return;const item=pending.get(route);if(item)localStorage.setItem(OUTBOX+active.id+':'+route,JSON.stringify({...item,revision:versions.get(route)??0}));else localStorage.removeItem(OUTBOX+active.id+':'+route);}
export function queuePlay(state:ParkState){
 if(!cloudEnabled(state.teamId))return;
 const route=state.routeId??'park',old=pending.get(route);
 pending.set(route,{state:structuredClone(state),mutation:crypto.randomUUID(),attempt:old?.attempt,attempts:old?.attempts});
 persist(route);announce(state.teamId,'Alterações neste dispositivo • envio ao banco pendente');
 if(!timer)timer=setTimeout(()=>{timer=undefined;void flushPlay().catch(()=>{});},800);
}
export async function refreshCapacity(){if(!sb||!active)return;const {data,error}=await sb.rpc('espia_play_capacity');if(error)throw error;localStorage.setItem('espia:cloud-capacity:v1',JSON.stringify(data));}
export function remoteCapacity(campaign:string,teamId?:string){if(!cloudEnabled(teamId??''))return null;let rows:any[]=[];try{rows=JSON.parse(localStorage.getItem('espia:cloud-capacity:v1')||'[]')}catch{}const row=rows.find(r=>r.challenge_id===campaign);if(!row)return {count:0,remaining:0,own:false,full:true,unknown:true};const own=!!localStorage.getItem('espia:cloud-enrolled:'+teamId+':'+campaign);return {count:Number(row.occupied),remaining:Math.max(0,3-Number(row.occupied)),own,full:Number(row.occupied)>=3};}
function taskKey(route:string,kind:string,step:number){return (route==='park'?'park-challenge:v1:':route==='court'?'relay-challenge:v1:court:rights:':'relay-challenge:v1:'+route+':')+'step:'+step+(route==='court'?(kind==='source'?':source':''):(kind==='agent'?':agent':''));}
async function hydrateDeliveries(team:Team){
 const {data,error}=await sb!.from('espia_deliveries').select('*,espia_reviews(*)').eq('team_id',team.id);if(error)throw error;
 let old:any[]=[];try{old=JSON.parse(localStorage.getItem('espia:task-validation:v1')||'[]')}catch{}
 for(const d of data??[])remoteTaskIds.add(d.id);
 const rows=(data??[]).map(d=>({id:d.id,teamId:team.id,teamName:team.name,mentor:team.mentor.email.toLowerCase(),campaign:d.challenge_id,key:d.payload?._client?.key??taskKey(d.case_id,d.kind,d.step),title:d.payload?._client?.title??d.kind,memberId:d.member_id,memberName:team.members.find(m=>m.id===d.member_id)?.name??'',payload:d.payload?._client?.originalPayload??JSON.stringify({respostas:d.payload}),status:d.status,score:d.teacher_score??undefined,revision:d.revision,history:(d.espia_reviews??[]).map((r:any)=>({by:r.reviewer_role,actor:r.reviewer_role==='teacher'?'Professor':'GDF',at:Date.parse(r.created_at),status:r.action==='approve'?'gdf_pending':r.action==='adjust'?'student_adjust':r.action==='confirm'?'validated':'teacher_adjust',score:r.score,note:r.note,revision:r.revision})),at:Date.parse(d.submitted_at)}));
 localStorage.setItem('espia:task-validation:v1',JSON.stringify([...old.filter(t=>t.teamId!==team.id),...rows]));
 window.dispatchEvent(new Event('task-validation-change'));
}
export async function hydratePlay(team:Team){
 if(!sb)return;cloudContext=true;staffTeams=[];active=team;versions.clear();pending.clear();
 const {data,error}=await sb.from('espia_play_states').select('*').eq('team_id',team.id);if(error)throw error;
 for(const row of data??[]){
  versions.set(row.case_id,row.revision);
  localStorage.setItem('espia:cloud-enrolled:'+team.id+':'+row.challenge_id,row.case_id);
  localStorage.setItem('espiadf:route:'+team.id+':'+row.challenge_id,row.case_id);
  let journal:any;try{journal=JSON.parse(localStorage.getItem(OUTBOX+team.id+':'+row.case_id)||'null')}catch{}
  if(journal){
   if(journal.revision!==row.revision&&journal.attempt!==row.mutation&&!(journal.attempts??[]).includes(row.mutation))throw Error('Outra sessão atualizou esta equipe. A cópia pendente foi preservada neste dispositivo.');
   pending.set(row.case_id,{state:journal.state,mutation:journal.mutation,attempt:journal.attempt,attempts:journal.attempts});
   localStorage.setItem(stateKey(team.id,row.case_id),JSON.stringify(journal.state));
  }else if(row.state?.version===1){localStorage.setItem(stateKey(team.id,row.case_id),JSON.stringify(row.state));}
  if(row.state?.started)localStorage.setItem('espia:challenge-case:v1:'+team.id+':'+row.challenge_id,row.case_id);
 }
 await hydrateDeliveries(team);await refreshCapacity();await refreshCloudForum();
 announce(team.id,pending.size?'Cópia local recuperada • envio ao banco pendente':'Dados recuperados do banco');
}
export async function openCloudPlay(team:Team,route:string){
 if(!cloudEnabled(team.id))throw Error('Entre novamente com a equipe antes de jogar.');
 await flushPlay();
 const {data,error}=await sb!.rpc('espia_play_open',{p_team:team.id,p_case:route});if(error)throw error;
 versions.set(route,data.revision);
 localStorage.setItem('espia:cloud-enrolled:'+team.id+':'+data.challenge_id,route);
 if(data.state?.version===1){localStorage.setItem(stateKey(team.id,route),JSON.stringify(data.state));if(data.state.started)localStorage.setItem('espia:challenge-case:v1:'+team.id+':'+data.challenge_id,route);}
 await hydrateDeliveries(team);await refreshCapacity();await refreshCloudForum();announce(team.id,'Inscrição confirmada no banco');
}
function collectTasks(state:ParkState){let rows:any[]=[];try{rows=JSON.parse(localStorage.getItem('espia:task-validation:v1')||'[]')}catch{}return state.records.map(r=>{const t=rows.find(t=>{if(t.teamId!==state.teamId||t.memberId!==r.memberId)return false;try{return JSON.stringify(JSON.parse(t.payload).respostas)===JSON.stringify(r.fields)}catch{return false}});return t?{key:t.key,payload:t.payload,memberId:t.memberId,payloadFields:{kind:r.kind}}:{memberId:r.memberId,payloadFields:{kind:r.kind}};});}
export async function flushPlay():Promise<void>{
 if(running){await running;if(pending.size)return flushPlay();return;}
 if(!sb||!active||!pending.size)return;
 const client=sb,team=active;
 running=(async()=>{
  for(const route of [...pending.keys()]){
   const item=pending.get(route)!;
   // Reconcile a successful server commit whose HTTP response was lost.
   if(item.attempt){const {data,error}=await client.from('espia_play_states').select('revision,mutation').eq('team_id',team.id).eq('case_id',route).single();if(error)throw error;if(data.revision!==(versions.get(route)??0)){if(data.mutation!==item.attempt&&!(item.attempts??[]).includes(data.mutation))throw Error('Conflito: outra sessão atualizou a equipe. Cópia local preservada.');versions.set(route,data.revision);}}
   item.attempt=item.mutation;item.attempts=[...(item.attempts??[]),item.mutation].slice(-20);persist(route);
   const {data,error}=await client.rpc('espia_play_save',{p_team:team.id,p_case:route,p_state:item.state,p_expected:versions.get(route)??0,p_mutation:item.mutation,p_tasks:collectTasks(item.state)});
   if(error)throw error;
   versions.set(route,data);
   const current=pending.get(route);if(current?.mutation===item.mutation)pending.delete(route);else if(current){current.attempt=item.mutation;current.attempts=item.attempts;}
   persist(route);
  }
  if(!pending.size){await hydrateDeliveries(team);announce(team.id,'✓ Salvo no banco às '+new Date().toLocaleTimeString('pt-BR'));}
 })().catch(e=>{announce(team.id,'Envio pendente • cópia neste dispositivo. '+(e?.message??'Confira a conexão.'));throw e;}).finally(()=>{running=undefined;});
 await running;if(pending.size)return flushPlay();
}
export async function uploadPlayImage(id:string,blob:Blob){
 if(!sb||!active)return;
 if(blob.size>650000||!['image/jpeg','image/png','image/webp'].includes(blob.type))throw Error('Imagem excede o limite de 650 KB.');
 const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(const b of bytes)binary+=String.fromCharCode(b);const encoded=btoa(binary);
 const {error}=await sb.from('espia_play_images').insert({team_id:active.id,id,mime:blob.type,data:encoded});
 if(error){const {data,error:readError}=await sb.from('espia_play_images').select('data').eq('team_id',active.id).eq('id',id).maybeSingle();if(readError||data?.data!==encoded)throw error;}
}
export async function remotePlayImage(id:string):Promise<Blob|undefined>{if(!sb||!cloudContext)return;let query=sb.from('espia_play_images').select('mime,data').eq('id',id);if(active)query=query.eq('team_id',active.id);const {data,error}=await query.maybeSingle();if(error)throw error;if(data){const bytes=Uint8Array.from(atob(data.data),c=>c.charCodeAt(0));return new Blob([bytes],{type:data.mime});}}
const remoteTaskIds=new Set<string>();
let staffTeams:Team[]=[];
export async function hydrateStaff(teams:Team[]){
 staffTeams=teams;
 const {data,error}=await sb!.from('espia_play_states').select('*');if(error)throw error;
 for(const row of data??[])if(row.state?.version===1){localStorage.setItem(stateKey(row.team_id,row.case_id),JSON.stringify(row.state));if(row.state.started)localStorage.setItem('espia:challenge-case:v1:'+row.team_id+':'+row.challenge_id,row.case_id);}
 for(const team of teams)await hydrateDeliveries(team);await refreshCloudForum();
}
export function reviewCloudTask(id:string,action:string,score:number|undefined,note:string):Promise<void>|undefined{
 if(!sb||!remoteTaskIds.has(id))return;
 return (async()=>{const {error}=await sb!.rpc(remoteForumIds.has(id)?'espia_review_forum':'espia_review_task',{p_id:id,p_action:action,p_score:score??null,p_note:note});if(error)throw error;for(const team of staffTeams)await hydrateDeliveries(team);await refreshCloudForum();})();
}
export async function createStaffAccess(email:string,password:string){
 if(!sb)throw Error('Conexão com o banco indisponível.');
 const {error}=await sb.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:location.origin}});if(error)throw error;
 return 'Acesso solicitado. Confira o e-mail de confirmação antes de entrar. Caso a conta já exista, entre com sua senha pessoal.';
}
export async function loginStaff(email:string,password:string,required?:'gdf'){
 if(!sb)throw Error('Conexão com o banco indisponível.');await flushPlay();
 const {error}=await sb.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;
 const claim=await sb.rpc('espia_claim_staff');if(claim.error)throw claim.error;if(required&&claim.data!==required)throw Error('Este acesso exige o perfil GDF.');suspendCloud();cloudContext=true;return claim.data;
}
export async function refreshTeamReviews(){if(active&&sb){await hydrateDeliveries(active);await refreshCloudForum();}}
let cloudContext=false;
const remoteForumIds=new Set<string>();
export async function refreshCloudForum(){
 if(!sb||!cloudContext)return;
 const questions=await sb.from('espia_forum_questions').select('*');if(questions.error)throw questions.error;
 const responses=await sb.from('espia_forum_responses').select('*');if(responses.error)throw responses.error;
 let learning:any={submissions:[],help:[],suggestions:[],notices:[],clues:[],links:{},preModerate:true};try{learning={...learning,...JSON.parse(localStorage.getItem('missaodf:learning:v02')||'{}')}}catch{}
 learning.suggestions=[...learning.suggestions.filter((q:any)=>q.teamId!=='gdf'),...(questions.data??[]).map(q=>({id:q.id,teamId:'gdf',teamName:'GDF',mentor:'',campaign:q.challenge_id??'mobility',routeId:q.case_id??undefined,title:q.title,text:q.question,kind:'service',agency:'GDF',status:q.published?'published':'hidden',deadline:q.deadline?.slice(0,10)??'',supports:[],note:'',at:Date.parse(q.created_at),comments:(responses.data??[]).filter(r=>r.question_id===q.id&&r.status==='validated').map(r=>({id:r.id,teamId:r.team_id,teamName:staffTeams.find(t=>t.id===r.team_id)?.name??active?.name??'Equipe',mentor:'',text:r.answer,status:'published'}))}))];
 localStorage.setItem('missaodf:learning:v02',JSON.stringify(learning));
 let tasks:any[]=[];try{tasks=JSON.parse(localStorage.getItem('espia:task-validation:v1')||'[]')}catch{}
 const forum=(responses.data??[]).map(r=>{remoteTaskIds.add(r.id);remoteForumIds.add(r.id);const q=(questions.data??[]).find(q=>q.id===r.question_id),team=staffTeams.find(t=>t.id===r.team_id)??active;return {id:r.id,teamId:r.team_id,teamName:team?.name??'Equipe',mentor:team?.mentor.email??'',campaign:q?.challenge_id??'mobility',key:'forum:'+r.question_id,title:'Fórum GDF • '+(q?.title??''),memberId:'',memberName:'Entrega coletiva',payload:JSON.stringify({questao:q?.question,resposta:r.answer}),status:r.status,score:r.teacher_score??undefined,revision:r.revision,history:[],at:Date.parse(r.updated_at)}});
 localStorage.setItem('espia:task-validation:v1',JSON.stringify([...tasks.filter(t=>!t.key.startsWith('forum:')||!forum.some(r=>r.teamId===t.teamId&&r.key===t.key)),...forum]));
 window.dispatchEvent(new Event('learning-change'));
}
export function publishCloudQuestion(campaign:string,title:string,text:string,deadline:string,route:string):Promise<void>|undefined{
 if(!sb||!cloudContext)return;
 return (async()=>{const {error}=await sb!.rpc('espia_publish_question',{p_challenge:campaign,p_case:route||null,p_title:title.trim(),p_question:text.trim(),p_deadline:deadline?deadline+'T23:59:59-03:00':null});if(error)throw error;await refreshCloudForum();})();
}
export function answerCloudQuestion(id:string,team:Team,text:string):Promise<void>|undefined{
 if(!cloudEnabled(team.id))return;
 return (async()=>{const {error}=await sb!.rpc('espia_answer_forum',{p_question:id,p_team:team.id,p_answer:text.trim()});if(error)throw error;await refreshCloudForum();})();
}
export const isCloudContext=()=>cloudContext;
export function moderateCloudQuestion(id:string,published:boolean):Promise<void>|undefined{if(!sb||!cloudContext)return;return (async()=>{const {error}=await sb!.rpc('espia_set_question',{p_id:id,p_published:published});if(error)throw error;await refreshCloudForum();})();}
