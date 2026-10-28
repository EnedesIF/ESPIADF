import {selectedRoute} from './gdfRoutes';
import type {CampaignId} from '@/types';
export interface ResearchEvent{teamId:string;campaign:CampaignId;kind:string;phase:string;routeId?:string;duration?:number;at:number}
const KEY='missaodf:research-events:v02';
export function researchEvents():ResearchEvent[]{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
export function researchEvent(e:Omit<ResearchEvent,'at'>){const rows=researchEvents();rows.push({...e,routeId:selectedRoute(e.teamId,e.campaign)?.id,at:Date.now()});localStorage.setItem(KEY,JSON.stringify(rows.slice(-10000)))}
