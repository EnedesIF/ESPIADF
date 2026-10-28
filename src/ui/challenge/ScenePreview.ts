import {routeExperience} from '@/data/routeExperience';
import {plazaMap} from './PlazaMap';
import {avatarName} from '@/services/avatarNames';
import {h} from '../dom';
import type {Team} from '@/types';
import type {GdfRoute} from '@/data/gdf/routes';
import type {ParkState,ParkActivity} from '@/services/parkChallenge';
import {worldFor,type ChallengePlace} from './ChallengeWorld';
import {cartoonAvatar} from '../demo/CartoonAvatar';
import {stageClue} from './Exploration';
/** Preview uses the same art, positions, labels and scene data as the playable city. */
export function scenePreview(route:GdfRoute,state:ParkState,team:Team,activity:ParkActivity,clueOnly=false){
 const clue=stageClue(route,activity.step),place:ChallengePlace=clueOnly?clue.place:activity.place,scene=worldFor(route.campaign,route.id)[place],owner=team.members.find(m=>m.id===state.assignments[activity.role])!,point=clueOnly?clue.at:activity.target;
 const root=h('div',{class:'scene-preview'+(place==='square'?' plaza-diorama plaza-diorama-preview':''),style:{backgroundImage:`url('${scene.asset}')`,backgroundSize:scene.atlasPosition?'201% 201%':'100% 100%',backgroundPosition:scene.atlasPosition??'0% 0%'},'aria-label':scene.title+' • '+(clueOnly?'local da pista':activity.title)});
 const position=(node:HTMLElement,at:[number,number])=>{Object.assign(node.style,{left:at[0]+'%',top:at[1]+'%'});root.append(node)};
 if(place==='square'){const map=plazaMap();map.disabled=true;position(map,[50,79]);}
 for(const portal of scene.portals)position(h('span',{class:'scene-preview-label'},portal.label),portal.at);
 const witness=activity.kind==='compare'&&place===activity.place;
 if(place==='park'||activity.speaker&&place===activity.place)position(h('div',{class:'scene-preview-npc'},h('span',{class:'pilot-agent-art',style:{backgroundPosition:witness?'50% 0':'100% 0'}}),h('b',{},witness?routeExperience(route).witness+' • relato':'Orientação • '+route.agency)),witness?[60,77]:[62,64]);
 if(clue.place===place)position(h('span',{class:'scene-preview-label clue'},'◆ PISTA • etapa '+activity.step),clue.at);
 if(!clueOnly)position(h('span',{class:'scene-preview-label target'},activity.title),activity.target);
 position(h('div',{class:'scene-preview-actor'},cartoonAvatar(owner.avatar.cartoonLook??team.members.indexOf(owner),'',owner.avatar)),[point[0]-5,Math.min(95,point[1]+5)]);
 return h('figure',{class:'scene-preview-figure'},root,h('figcaption',{},scene.title+' • '+avatarName(owner)+' • '+(clueOnly?'Procurar a placa dourada PISTA':activity.title)));
}
