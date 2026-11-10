import {remoteCapacity} from './cloudPlay';
import type {CampaignId} from '@/types';
import {allProgress} from './cityAnalytics';
export const CHALLENGE_LIMIT=3;
const KEY='missaodf:challenge-reservations:v1';
type Reservation={teamId:string;campaignId:CampaignId;at:number};
function reservations():Reservation[]{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
const demoId=(id:string)=>id.startsWith('espia-playable-demo-')||id.startsWith('espia-completed-demo');
export function challengeTeams(id:CampaignId){const progress=allProgress();const demos=new Set(progress.filter(p=>p.team.name.toLowerCase().includes('(demo)')).map(p=>p.team.id));return [...new Set([...reservations().filter(r=>r.campaignId===id).map(r=>r.teamId),...progress.filter(p=>p.campaignId===id).map(p=>p.team.id)])].filter(id=>!demoId(id)&&!demos.has(id))}
export function availability(id:CampaignId,teamId?:string){const remote=remoteCapacity(id,teamId);if(remote)return remote;const teams=challengeTeams(id);return {count:teams.length,remaining:Math.max(0,CHALLENGE_LIMIT-teams.length),own:!!teamId&&teams.includes(teamId),full:teams.length>=CHALLENGE_LIMIT}}
export async function reserveChallenge(teamId:string,id:CampaignId,demo=false){if(demo||demoId(teamId))return true;const remote=remoteCapacity(id,teamId);if(remote)return remote.own||!remote.full;const take=()=>{const a=availability(id,teamId);if(a.own)return true;if(a.full)return false;const rows=reservations();rows.push({teamId,campaignId:id,at:Date.now()});localStorage.setItem(KEY,JSON.stringify(rows));return true};if(typeof navigator!=='undefined'&&navigator.locks)return navigator.locks.request('df-em-jogo-vagas',take);return take()}
