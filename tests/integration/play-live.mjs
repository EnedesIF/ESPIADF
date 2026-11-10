import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
const config=readFileSync('src/data/supabasePublic.ts','utf8'),url=config.match(/URL='([^']+)'/)[1],key=config.match(/ANON_KEY='([^']+)'/)[1];
let token=key;const password=randomBytes(24).toString('base64url'),stamp=Date.now().toString(36);
const team={id:'qa-play-'+stamp,name:'TESTE TÉCNICO • partida em nuvem',school:'Escola fictícia',ra:'Plano Piloto',turma:'QA',mentor:{name:'Professor fictício',email:'qa@example.invalid',school:'Escola fictícia',area:'QA',phone:''},login:'QA-PLAY-'+stamp.toUpperCase(),members:['escuta','campo','verificacao','dados','articulacao'].map((missionRole,i)=>({id:'qm'+i,name:'Fictício '+i,missionRole,role:'campo',email:'',phone:'',turma:'QA',avatar:{cartoonLook:i}}))};
async function req(path,body,method){const response=await fetch(url+path,{method:method??(body?'POST':'GET'),headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=representation'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});const txt=await response.text();let data;try{data=JSON.parse(txt)}catch{data=txt}if(!response.ok)throw Error(JSON.stringify({status:response.status,data}));return data;}
const made=await req('/functions/v1/espia-register-team',{team,password});token=made.session.access_token;
const [{role_assignments:assignments}]=await req('/rest/v1/espia_teams?select=role_assignments&id=eq.'+team.id);
const checks=[];
await Promise.all(['lighting','pay','waste','dengue'].map(async route=>{
 const opened=await req('/rest/v1/rpc/espia_play_open',{p_team:team.id,p_case:route});let revision=opened.revision;
 const activities=await req('/rest/v1/espia_activities?case_id=eq.'+route+'&select=kind,step,sequence,mission_role,title&order=sequence');
 assert.equal(activities.length,10);
 const state={version:1,teamId:team.id,routeId:route,started:true,discussion:'Equipe fictícia discutiu e escolheu esta investigação para teste técnico.',assignments,index:0,place:'square',position:[40,90],visited:['square'],clue:true,records:[],drafts:{},rewards:[],finished:false};
 const imageId='qa-image-'+route+'-'+stamp;
 await req('/rest/v1/espia_play_images',{team_id:team.id,id:imageId,mime:'image/jpeg',data:'/9j/2Q=='});
 for(const a of activities){
  assert.equal(state.index,a.sequence);
  const fields={answer:'Esta é uma resposta fictícia suficientemente longa para verificar a persistência no banco.',source:'oficial',toolOpened:'sim',hypothesis:'Hipótese fictícia baseada na consulta para o teste técnico.',responsibilities:'A equipe fictícia vai comparar as fontes e justificar o encaminhamento.',channel:'consulta',draft:'Conclusão fictícia que documenta o resultado da consulta técnica.',researchEvidence:imageId};
  const memberId=assignments[a.mission_role];assert(memberId);
  state.records.push({kind:a.kind,memberId,memberName:'Fictício',at:Date.now(),fields});state.drafts[a.kind]=fields;
  const mutation=randomUUID(),args={p_team:team.id,p_case:route,p_state:structuredClone(state),p_expected:revision,p_mutation:mutation,p_tasks:[]};
  revision=await req('/rest/v1/rpc/espia_play_save',args);
  assert.equal(await req('/rest/v1/rpc/espia_play_save',args),revision,'retry must be idempotent');
  if(a.sequence===9)state.finished=true;else state.index++;
  revision=await req('/rest/v1/rpc/espia_play_save',{p_team:team.id,p_case:route,p_state:state,p_expected:revision,p_mutation:randomUUID(),p_tasks:[]});
 }
 const d=await req('/rest/v1/espia_deliveries?team_id=eq.'+team.id+'&case_id=eq.'+route+'&select=id,status,payload');assert.equal(d.length,10);assert(d.every(d=>d.status==='teacher_pending'));
 checks.push({route,deliveries:d.length,finished:state.finished,revision});console.log(JSON.stringify({route,completed:true}));
}));
// Fresh authentication and client, independent of all earlier request state.
const signed=await req('/auth/v1/token?grant_type=password',{email:team.login.toLowerCase()+'@equipes.espiadf.invalid',password});token=signed.access_token;
const states=await req('/rest/v1/espia_play_states?team_id=eq.'+team.id+'&select=state');assert.equal(states.length,4);assert(states.every(r=>r.state.finished&&r.state.records.length===10));
const images=await req('/rest/v1/espia_play_images?team_id=eq.'+team.id+'&select=id,data');assert.equal(images.length,4);
const others=await req('/rest/v1/espia_teams?select=id&id=neq.'+team.id);assert.equal(others.length,0);
await assert.rejects(()=>req('/rest/v1/rpc/espia_play_save',{p_team:'team_1qlpv4x7yw',p_case:'lighting',p_state:{},p_expected:0,p_mutation:randomUUID(),p_tasks:[]}));
token=key;try{const anon=await req('/rest/v1/espia_play_states?select=state');assert(Array.isArray(anon)&&anon.length===0)}catch(e){assert(/\"status\":(401|403)/.test(e.message));}
const result={result:'PASS',teamId:team.id,checks,newLoginRestoredFourRoutes:true,privateImagesConfirmed:4,otherTeamReadBlocked:true,otherTeamWriteBlocked:true,anonymousBlocked:true};
writeFileSync('/tmp/espia-play-test-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
