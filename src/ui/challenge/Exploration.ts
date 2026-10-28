import {caseScript} from '@/data/caseScripts';
import {routeExperience} from '@/data/routeExperience';
import {worldFor} from './ChallengeWorld';
import type {GdfRoute} from '@/data/gdf/routes';
import type {ChallengePlace} from './ChallengeWorld';
import {pilotDistance,type PilotPoint} from '../demo/PilotGround';
export function stageClue(route:GdfRoute,step:number):{id:string;place:ChallengePlace;at:PilotPoint;text:string}{
 const world=worldFor(route.campaign,route.id),script=caseScript(route);
 const board=script.places.board??'park',compare=script.places.compare??'square',source=script.places.source??'alameda',verify=script.places.verify??'park',solution=script.places.solution??'lab',channel=script.places.channel??'lab',response=script.places.response??'lab';
 const places:ChallengePlace[]=['square','alameda',board,compare,source,verify,solution,channel,response];
 const at:PilotPoint[]=[[61,89],[58,80],[40,81],[68,84],[73,84],[35,83],[48,91],[76,84],[62,88]];
 // Keep clue interaction circles clear of automatic passage triggers.
 const proposed=at[step-1],location=world[places[step-1]];
 const point:PilotPoint=location.portals.some(portal=>pilotDistance(proposed,portal.at)<6)?[45,84]:proposed;
 const next:ChallengePlace[]=['square','park',compare,source,verify,solution,channel,response,'lab'];
 const hint=script.clues[step-1]+(step===3?' Procure '+routeExperience(route).witness.toLowerCase()+'.':'');return {id:'step:'+step,place:places[step-1],at:point,text:hint+' Próximo encontro ou atividade: '+world[next[step-1]].title+'.'};
}
export const nearGuide=(place:string,point:PilotPoint)=>place==='park'&&pilotDistance(point,[57,69])<4.5;
export function sceneCamera(viewWidth:number,viewHeight:number,point:PilotPoint){const width=Math.max(viewWidth,viewHeight*1.77683),height=width/1.77683;return {width,height,x:Math.max(viewWidth-width,Math.min(0,viewWidth*.5-point[0]/100*width)),y:Math.max(viewHeight-height,Math.min(0,viewHeight*.72-point[1]/100*height))}}
