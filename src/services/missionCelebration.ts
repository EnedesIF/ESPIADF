import {activitiesFor,activityTaskKey,stateRoute,parkCanAdvance,type ParkState} from './parkChallenge';
import {delivery} from './taskValidation';
/** Celebration acknowledges submissions; assessment never becomes automatic. */
export function canCelebrateMission(state:ParkState){return state.finished&&activitiesFor(state).every((_,index)=>{const task=delivery(state.teamId,stateRoute(state).campaign,activityTaskKey({...state,index}));return !!task&&task.status!=='student_adjust'})&&parkCanAdvance(state)}
export function celebrationPositions(count:number):[number,number][]{
 const columns=count<=6?count:Math.ceil(count/2);
 return Array.from({length:count},(_,i)=>{const row=Math.floor(i/columns),col=i%columns,n=Math.min(columns,count-row*columns);return [n===1?56:36+col*40/(n-1)+(count>6&&row===1?2:0),count<=6?90:row===0?84:94]});
}
