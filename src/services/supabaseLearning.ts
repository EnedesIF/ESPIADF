import type {SupabaseClient} from '@supabase/supabase-js';
/** Production adapter, deliberately not enabled in the local vertical slice.
 * Requires v02-learning.sql and authenticated team_memberships (not legacy team_login).
 * Never embed service_role in a browser. RLS remains authoritative. */
export class SupabaseLearning{
 constructor(private sb:SupabaseClient){}
 async submit(teamId:string,id:string,data:{campaign:string;mission_id:string;texts:string[];url:string;activity_date:string;people:number},image:Blob,resubmit=false){const path=`${teamId}/${id}.jpg`;const upload=await this.sb.storage.from('missao-df-evidence').upload(path,image,{contentType:'image/jpeg',upsert:resubmit});if(upload.error)throw upload.error;const row={...data,id,team_id:teamId,image_path:path,privacy_confirmed:true,status:'pending',comment:''};const result=resubmit?await this.sb.from('real_mission_submissions').update(row).eq('id',id):await this.sb.from('real_mission_submissions').insert(row);if(result.error)throw result.error;}
 async imageURL(path:string){const {data,error}=await this.sb.storage.from('missao-df-evidence').createSignedUrl(path,60);if(error)throw error;return data.signedUrl}
 async review(id:string,status:'approved'|'adjust',comment:string){const {error}=await this.sb.from('real_mission_submissions').update({status,comment}).eq('id',id);if(error)throw error}
 async submissions(){const {data,error}=await this.sb.from('real_mission_submissions').select('*').order('updated_at',{ascending:false});if(error)throw error;return data}
 async suggest(row:{team_id:string;campaign:string;title:string;kind:'service'|'game';agency:string;text:string}){const {error}=await this.sb.from('city_suggestions').insert(row);if(error)throw error}
 async support(suggestion_id:string,team_id:string){const {error}=await this.sb.from('suggestion_supports').insert({suggestion_id,team_id});if(error)throw error}
 async comment(suggestion_id:string,team_id:string,text:string){const {error}=await this.sb.from('city_comments').insert({suggestion_id,team_id,text});if(error)throw error}
 async moderate(id:string,status:'published'|'hidden'|'forwarded',note:string){const {error}=await this.sb.from('city_suggestions').update({status,note}).eq('id',id);if(error)throw error}
 async ask(row:{team_id:string;campaign:string;phase:string;objective:string;text:string}){const {error}=await this.sb.from('help_requests').insert(row);if(error)throw error}
 async reply(id:string,reply:string,hint=false){const {error}=await this.sb.from('help_requests').update({reply,hint,answered_at:new Date().toISOString()}).eq('id',id);if(error)throw error}
}
