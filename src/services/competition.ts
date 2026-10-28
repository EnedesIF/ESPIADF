import {reputation} from './learning';
import {allProgress} from './cityAnalytics';
import type {CampaignId} from '@/types';
export interface Standing{id:string;name:string;xp:number;example:boolean;position:number}
export function standings(id:CampaignId,examples=false):Standing[]{const rows=allProgress().filter(p=>p.campaignId===id).map(p=>({id:p.team.id,name:p.team.name,xp:p.state.xp+reputation(p.team.id,id),example:false,position:0}));if(examples)rows.push(...[{id:'rival-cerrado',name:'Cerrado',xp:1100},{id:'rival-horizonte',name:'Horizonte',xp:760},{id:'rival-ipe',name:'Ipê',xp:420}].map(r=>({...r,example:true,position:0})));rows.sort((a,b)=>b.xp-a.xp||a.name.localeCompare(b.name,'pt-BR'));rows.forEach((r,i)=>r.position=i&&rows[i-1].xp===r.xp?rows[i-1].position:i+1);return rows}
