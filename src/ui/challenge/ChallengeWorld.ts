import {CASE_SCRIPTS} from '@/data/caseScripts';
import {ROUTE_SCENERY} from '@/data/routeScenery';
import {PILOT_WORLD,type PilotLocation} from '../demo/PilotWorld';
import {pilotDistance,type PilotPoint} from '../demo/PilotGround';
export type ChallengePlace='square'|'alameda'|'park'|'lab';
export interface ChallengePortal{id:string;label:string;at:PilotPoint;to:ChallengePlace;spawn:PilotPoint}
type Location=Omit<PilotLocation,'portals'> & {portals:ChallengePortal[]};
export const CHALLENGE_WORLD:Record<ChallengePlace,Location>={
 square:{...PILOT_WORLD.square,asset:'/art/plaza-diorama-v1.webp',spawn:[40,90],portals:[...PILOT_WORLD.square.portals]},
 park:{...PILOT_WORLD.park,portals:[...PILOT_WORLD.park.portals]},
 alameda:{...PILOT_WORLD.alameda,portals:[...PILOT_WORLD.alameda.portals,{id:'lab-entry',label:'Laboratório de Soluções →',at:[68,90],to:'lab',spawn:[40,85]}]},
 lab:{title:'Laboratório de Soluções • pátio',asset:'/art/cartoon-mobility-civic.webp',map:PILOT_WORLD.alameda.map,spawn:[40,85],objective:'Construa uma proposta e prepare a participação da equipe.',portals:[{id:'lab-exit',label:'← Voltar à alameda',at:[36,84],to:'alameda',spawn:[63,88]}],leftClip:PILOT_WORLD.alameda.leftClip,rightClip:PILOT_WORLD.alameda.rightClip}
};
export const challengePortalAt=(place:ChallengePlace,p:PilotPoint,campaign:import('@/types').CampaignId='mobility',routeId?:string)=>worldFor(campaign,routeId)[place].portals.find(portal=>pilotDistance(p,portal.at)<2.5);

// Each atlas has four distinct 16:9 panels; the foreground was authored as open floor.
// The collision polygon excludes the rear architecture and the extreme side borders.
const OPEN_FLOOR:import('../demo/PilotGround').PilotMap={floor:[[7,58],[93,58],[95,97],[5,97]],solids:[]};
const TITLES={
 work:['Praça de formação e carreiras','Alameda das oficinas','Centro de orientação profissional','Laboratório de projetos e carreiras'],
 territory:['Praça e quadra comunitária','Alameda da coleta e do jardim','Pavilhão de serviços comunitários','Sala de planejamento do bairro'],
 health:['Praça da UBS','Alameda de educação em saúde','Orientação e vacinação','Sala de orientação em saúde']
};
const PLACES:ChallengePlace[]=['square','alameda','park','lab'];
const POSITIONS=['0% 0%','100% 0%','0% 100%','100% 100%'];
type AtlasLocation=Location&{atlasPosition?:string};
export type ChallengeWorld=Record<ChallengePlace,AtlasLocation>;
const WORLDS:Partial<Record<import('@/types').CampaignId,ChallengeWorld>>={mobility:CHALLENGE_WORLD};
for(const campaign of ['work','territory','health'] as const){
 const world={} as ChallengeWorld;
 for(const [i,place] of PLACES.entries())world[place]={...CHALLENGE_WORLD[place],title:TITLES[campaign][i],asset:'/art/challenge-'+campaign+'-atlas.png',atlasPosition:POSITIONS[i],map:{...OPEN_FLOOR,...(place==='park'?{agent:[62,64] as PilotPoint}:{})},leftClip:'polygon(0 0,0 0,0 0)',rightClip:'polygon(0 0,0 0,0 0)',portals:CHALLENGE_WORLD[place].portals.map(p=>({...p,at:p.to==='lab'?[80,62]:[...p.at],label:(p.to==='square'?'← ':'')+TITLES[campaign][PLACES.indexOf(p.to)]+(p.to==='square'?'':' →')}))};
 WORLDS[campaign]=world;
}
const CASE_WORLDS=new Map<string,ChallengeWorld>();
export const worldFor=(campaign:import('@/types').CampaignId,routeId?:string):ChallengeWorld=>{
 if(!routeId)return WORLDS[campaign]!;
 const cached=CASE_WORLDS.get(routeId);if(cached)return cached;
 const titles=ROUTE_SCENERY[routeId];if(!titles)throw Error('Cenário do caso não encontrado: '+routeId);
 const world={} as ChallengeWorld;const script=CASE_SCRIPTS[routeId];const scenes:[ChallengePlace,string][]=[['square','Escolher o caminho'],['park','Conversar com a agente'],[script.places.board??'park','Abrir o registro do caso'],[script.places.compare??'square','Ouvir a outra pessoa'],[script.places.source??'alameda',script.sourceTitle],[script.places.verify??'park','Conferir o que foi descoberto'],[script.places.solution??'lab','Montar o plano da equipe'],[script.places.channel??'lab','Preparar o próximo passo'],[script.places.response??'lab','Ler o retorno'],['lab','Apresentar a prática real']];
 for(const [i,place] of PLACES.entries())world[place]={...WORLDS[campaign]![place],title:titles[i],objective:scenes.filter(([p])=>p===place).map(([,label])=>label).join(' • '),asset:'/art/cases/'+routeId+'-atlas.webp',atlasPosition:POSITIONS[i],map:{...OPEN_FLOOR,solids:place==='square'?[[[48.5,78.5],[51.5,78.5],[51.5,79.5],[48.5,79.5]]]:[],...(place==='park'?{agent:[62,64] as PilotPoint}:{})},leftClip:'polygon(0 0,0 0,0 0)',rightClip:'polygon(0 0,0 0,0 0)',portals:WORLDS[campaign]![place].portals.map(p=>({...p,label:(p.to==='square'?'← ':'')+titles[PLACES.indexOf(p.to)]+(p.to==='square'?'':' →')}))};
 CASE_WORLDS.set(routeId,world);return world;
};

/** Choose the next connected passage; no teleporting between distant environments. */
export function passageTo(campaign:import('@/types').CampaignId,from:ChallengePlace,to:ChallengePlace,routeId?:string){
 const world=worldFor(campaign,routeId),queue:[ChallengePlace,ChallengePortal|undefined][]=[[from,undefined]],seen=new Set<ChallengePlace>();
 while(queue.length){const [place,first]=queue.shift()!;if(place===to)return first;if(seen.has(place))continue;seen.add(place);for(const portal of world[place].portals)queue.push([portal.to,first??portal]);}return undefined;
}
