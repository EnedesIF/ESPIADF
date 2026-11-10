import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
const config=readFileSync('src/data/supabasePublic.ts','utf8'),url=config.match(/URL='([^']+)'/)[1],key=config.match(/ANON_KEY='([^']+)'/)[1];
const auth={'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'};
const password=randomBytes(24).toString('base64url');
const stamp=Date.now().toString(36),team={id:'qa-registration-'+stamp,name:'TESTE TÉCNICO • cadastro no banco',school:'Escola fictícia de teste',ra:'Plano Piloto',turma:'QA',mentor:{name:'Professor fictício',email:'qa@example.invalid',phone:'',school:'Escola fictícia',area:'Teste'},login:'QA-'+stamp.toUpperCase(),createdAt:new Date().toISOString(),members:['escuta','campo','verificacao','dados','articulacao'].map((missionRole,i)=>({id:'qa-member-'+i,name:'Participante fictício '+(i+1),missionRole,role:'campo',email:'',phone:'',turma:'QA',avatar:{cartoonLook:i}}))};
async function request(path,options={}){const r=await fetch(url+path,{headers:auth,signal:AbortSignal.timeout(30000),...options});let data;try{data=await r.json()}catch{data=null}return {status:r.status,data}}
const made=await request('/functions/v1/espia-register-team',{method:'POST',body:JSON.stringify({team,password})});
if(made.status!==200){console.log(JSON.stringify({phase:'register',status:made.status,error:made.data?.error??made.data?.message??made.data}));process.exitCode=1;}else{
 assert.equal(made.data.confirmed,true);assert.equal(made.data.memberCount,5);
 const again=await request('/functions/v1/espia-register-team',{method:'POST',body:JSON.stringify({team,password})});assert.equal(again.status,200);assert.equal(again.data.teamId,team.id);
 // New independent HTTP authentication: no SDK or browser cache.
 const signed=await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:team.login.toLowerCase()+'@equipes.espiadf.invalid',password})});assert.equal(signed.status,200);
 const ownHeaders={...auth,Authorization:'Bearer '+signed.data.access_token};
 const rows=await request('/rest/v1/espia_teams?id=eq.'+team.id+'&select=id,name,login,role_assignments,teacher_id,espia_members(id,real_name)',{headers:ownHeaders});
 assert.equal(rows.status,200);assert.equal(rows.data.length,1);assert.equal(rows.data[0].espia_members.length,5);assert.equal(Object.keys(rows.data[0].role_assignments).length,6);assert.equal(rows.data[0].teacher_id,null);
 const anonymous=await request('/rest/v1/espia_teams?id=eq.'+team.id+'&select=id');assert([200,401,403].includes(anonymous.status));assert(!Array.isArray(anonymous.data)||anonymous.data.length===0);
 const bad=await request('/functions/v1/espia-register-team',{method:'POST',body:JSON.stringify({team:{...team,id:'bad-'+stamp,login:'BAD-'+stamp.toUpperCase(),members:team.members.slice(0,4)},password})});assert.equal(bad.status,400);
 console.log(JSON.stringify({result:'PASS',teamId:team.id,login:team.login,members:5,registered:true,independentLoginAndRead:true,anonymousReadBlocked:true,retryCreatesNoDuplicate:true,fourMembersRejected:true}));
}
