import type {CampaignId} from '@/types';
import {GDF_ROUTES} from '@/data/gdf/routes';
export function selectedRoute(teamId:string,campaign:CampaignId){const id=localStorage.getItem(`espiadf:route:${teamId}:${campaign}`);return GDF_ROUTES.find(r=>r.id===id&&r.campaign===campaign)}
export function selectRoute(teamId:string,campaign:CampaignId,id:string,question:string){if(!GDF_ROUTES.some(r=>r.id===id&&r.campaign===campaign)||question.trim().length<15)throw Error('Escolha a rota e formule a pergunta da equipe com pelo menos 15 caracteres.');localStorage.setItem(`espiadf:route:${teamId}:${campaign}`,id);localStorage.setItem(`espiadf:question:${teamId}:${campaign}`,question.trim())}
export const routeQuestion=(teamId:string,campaign:CampaignId)=>localStorage.getItem(`espiadf:question:${teamId}:${campaign}`)||selectedRoute(teamId,campaign)?.question||'';
export function cityStateKey(teamId:string,campaign:CampaignId){const r=selectedRoute(teamId,campaign);return `missaodf:city:v3:${teamId}:${campaign}`+(r?':gdf:'+r.id:'')}
