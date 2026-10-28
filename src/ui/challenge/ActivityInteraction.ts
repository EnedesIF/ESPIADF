import type {ParkActivity} from '@/services/parkChallenge';
import {pilotDistance,type PilotPoint} from '../demo/PilotGround';
/** The visible speaker and the walk-to marker both accept interaction. */
export function speakerPosition(activity:ParkActivity):PilotPoint|undefined{
 if(!activity.speaker)return undefined;
 return activity.speaker==='caio'?[60,77]:[62,64];
}
export function nearActivity(activity:ParkActivity,place:string,point:PilotPoint){
 if(place!==activity.place)return false;
 const speaker=speakerPosition(activity);
 return pilotDistance(point,activity.target)<4.5||!!speaker&&pilotDistance(point,speaker)<4.5;
}
