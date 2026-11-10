import type {SupabaseClient} from '@supabase/supabase-js';
import type {Repository,MentorAction} from './repository';
import type {Team,GameSession,TelemetryEvent,CampaignId} from '@/types';
import {LocalRepository} from './localRepository';
const demo=(team:Team)=>team.name.toLowerCase().includes('(demo)');
/** Remote registrations; explicit local demos. No silent local fallback for registration. */
export class RegistrationRepository implements Repository{
 readonly mode='supabase' as const;
 private local=new LocalRepository();
 constructor(private sb:SupabaseClient){}
 private fromRow(row:any):Team{
  const stored=row.registration_data??{},old=Array.isArray(stored.members)?stored.members:[];
  return {...stored,id:row.id,name:row.name,school:row.school,ra:stored.ra??'',turma:row.class_name??'',mentor:stored.mentor??{name:'',email:'',phone:'',school:'',area:''},login:row.login,passwordHash:'',createdAt:row.created_at,members:[...(row.espia_members??[])].sort((a:any,b:any)=>old.findIndex((m:any)=>m.id===a.id)-old.findIndex((m:any)=>m.id===b.id)).map((m:any)=>({...old.find((x:any)=>x.id===m.id),id:m.id,name:m.real_name,avatarName:m.avatar_name??undefined,missionRole:m.mission_role??old.find((x:any)=>x.id===m.id)?.missionRole,avatar:m.avatar,email:old.find((x:any)=>x.id===m.id)?.email??'',phone:old.find((x:any)=>x.id===m.id)?.phone??'',turma:stored.turma??'',role:old.find((x:any)=>x.id===m.id)?.role??'campo'}))};
 }
 async createTeam(team:Team,password:string):Promise<Team>{
  if(demo(team))return this.local.createTeam(team,password);
  const {data,error}=await this.sb.functions.invoke('espia-register-team',{body:{team:{...team,passwordHash:''},password}});
  if(error){let message='O banco não confirmou o cadastro. Confira a conexão e tente novamente.';try{const payload=await (error as any).context?.json();if(payload?.error)message=payload.error}catch{}throw Error(message)}
  if(!data?.confirmed||data.teamId!==team.id||data.memberCount!==team.members.length||!data.session?.access_token||!data.session?.refresh_token)throw Error('Resposta de confirmação do banco inválida. Cadastro não confirmado.');
  const auth=await this.sb.auth.setSession(data.session);if(auth.error)throw auth.error;
  const saved=await this.getRemoteTeam(team.id);
  if(!saved||saved.members.length!==team.members.length)throw Error('Não foi possível reler os integrantes gravados no banco. Use o mesmo login para tentar novamente.');
  return saved;
 }
 private async getRemoteTeam(id:string){const {data,error}=await this.sb.from('espia_teams').select('*,espia_members(*)').eq('id',id).maybeSingle();if(error)throw error;return data?this.fromRow(data):null}
 async getTeam(id:string){const local=await this.local.getTeam(id);if(local&&demo(local))return local;return this.getRemoteTeam(id)}
 async listTeams(){const {data:auth,error:authError}=await this.sb.auth.getSession();if(authError)throw authError;const samples=(await this.local.listTeams()).filter(demo);if(!auth.session)return samples;const {data,error}=await this.sb.from('espia_teams').select('*,espia_members(*)');if(error)throw error;return [...(data??[]).map(r=>this.fromRow(r)),...samples]}
 async updateTeam(team:Team){if(demo(team))return this.local.updateTeam(team);for(const member of team.members){if(!member.avatarName?.trim())continue;const {error}=await this.sb.rpc('espia_save_avatar',{p_team:team.id,p_member:member.id,p_name:member.avatarName,p_avatar:member.avatar});if(error)throw error}const saved=await this.getRemoteTeam(team.id);if(!saved)throw Error('Atualização não confirmada no banco.');}
 async loginTeam(login:string,password:string){const local=await this.local.loginTeam(login,password);if(local&&demo(local))return local;const normalized=login.trim().toUpperCase();if(!/^[A-Z0-9-]{3,80}$/.test(normalized))return null;const {error}=await this.sb.auth.signInWithPassword({email:normalized.toLowerCase()+'@equipes.espiadf.invalid',password});if(error)return null;const {data,error:readError}=await this.sb.from('espia_teams').select('*,espia_members(*)').eq('login',normalized).maybeSingle();if(readError)throw readError;return data?this.fromRow(data):null}
 async loginMentor(email:string,password:string){const {error}=await this.sb.auth.signInWithPassword({email,password});if(error)throw Error('Acesso do professor não confirmado. O e-mail informado no cadastro da equipe não cria acesso de professor automaticamente.');return this.listTeams()}
 // Legacy sessions are not the nine-stage relay. Never claim they were sent remotely.
 async getSession(teamId:string,campaignId:CampaignId){const t=await this.local.getTeam(teamId);return t&&demo(t)?this.local.getSession(teamId,campaignId):null}
 async saveSession(s:GameSession){const t=await this.local.getTeam(s.teamId);if(t&&demo(t))return this.local.saveSession(s);throw Error('Cadastro salvo no banco; a integração das partidas ainda não está habilitada.');}
 async listSessions(){return (await this.local.listSessions()).filter(s=>s.teamId.startsWith('espia-'))}
 async addMentorAction(_a:MentorAction){throw Error('Esta ação ainda não tem confirmação de gravação remota.')}
 async listMentorActions(_id?:string){return []}
 async logEvents(_events:TelemetryEvent[]){/* Legacy analytics explicitly disabled; no fake success UI. */}
 async listEvents(_id?:string){return []}
 async getCampaignOverrides(){return {}}
 async saveCampaignOverrides(_o:object){throw Error('Configuração remota ainda não disponível.')}
}
