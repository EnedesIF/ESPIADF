import {createClient} from 'npm:@supabase/supabase-js@2.45.0';
const allowed=new Set(['https://espiadf-amyx.vercel.app','http://terminal.local:4173','http://localhost:5173']);
Deno.serve(async req=>{
 const origin=req.headers.get('origin');const cors={'Access-Control-Allow-Origin':origin&&allowed.has(origin)?origin:'https://espiadf-amyx.vercel.app','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
 const reply=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(origin&&!allowed.has(origin))return reply(403,{error:'Origem não autorizada'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return reply(405,{error:'Use POST'});
 try{
  const raw=await req.text();if(raw.length>150000)return reply(413,{error:'Cadastro muito grande'});
  const {team,password}=JSON.parse(raw);
  if(!team||typeof password!=='string'||password.length<6||password.length>128||!Array.isArray(team.members)||team.members.length<5||team.members.length>10||!/^[A-Z0-9-]{3,80}$/.test(team.login??'')||!/^[a-zA-Z0-9_-]{3,120}$/.test(team.id??''))return reply(400,{error:'Confira login, senha e os 5 a 10 integrantes'});
  const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!;
  const admin=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  const client=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
  const email=team.login.toLowerCase()+'@equipes.espiadf.invalid';
  // This address is an internal team identifier, never the mentor's identity.
  let signed=await client.auth.signInWithPassword({email,password});
  if(signed.error){
   const made=await admin.auth.admin.createUser({email,password,email_confirm:true});
   if(made.error)return reply(409,{error:'Login já utilizado ou indisponível. Confira os dados; nenhuma equipe foi confirmada.'});
   signed=await client.auth.signInWithPassword({email,password});
  }
  if(signed.error||!signed.data.session||!signed.data.user)return reply(401,{error:'Não foi possível confirmar o acesso da equipe. Tente novamente com os mesmos dados.'});
  const user=signed.data.user;
  const saved=await admin.rpc('espia_register_team_internal',{p_team:team,p_user:user.id});
  if(saved.error)return reply(400,{error:saved.error.message});
  // Re-read via the team's token and RLS, not via service_role.
  const read=await client.from('espia_teams').select('id,login').eq('id',team.id).single();
  const members=await client.from('espia_members').select('id').eq('team_id',team.id);
  if(read.error||members.error||members.data?.length!==team.members.length)return reply(503,{error:'Cadastro não pôde ser confirmado por leitura. Tente novamente; não altere o login.'});
  return reply(200,{teamId:read.data.id,login:read.data.login,memberCount:members.data.length,confirmed:true,session:{access_token:signed.data.session.access_token,refresh_token:signed.data.session.refresh_token}});
 }catch{return reply(500,{error:'Falha de comunicação. O cadastro não foi confirmado; tente novamente com os mesmos dados.'})}
});
