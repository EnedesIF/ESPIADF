import type {Team,CampaignId} from '@/types';
import {buildRelayDashboard} from './relayDashboard';
/** The ranking exposes aggregate team results only. */
export function rankingRows(teams:Team[],campaign?:CampaignId){
 const entries=buildRelayDashboard(teams.filter(t=>!t.name.toLowerCase().includes('(demo)')&&!t.id.startsWith('espia-completed-demo')),'admin',undefined,campaign?{campaign}:{}).rows.sort((a,b)=>b.score-a.score||a.team.name.localeCompare(b.team.name,'pt-BR'));
 let place=0,last=-1;return entries.map((r,i)=>{if(r.score!==last)place=i+1;last=r.score;return {place,teamId:r.team.id,name:r.team.name,score:r.score,maximum:campaign?900:3600,completed:r.completed,steps:campaign?9:36,sent:r.challenges.reduce((n,c)=>n+(c.state?.records.length??0),0)}});
}
