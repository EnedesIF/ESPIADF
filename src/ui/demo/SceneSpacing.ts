import type {GroundPoint} from './CartoonGround';
/** Screen-space silhouettes need horizontal room even when their feet differ in depth. */
export const NPC_FEET:Record<string,GroundPoint>={contact:[40,82],witness:[54,74],research:[83,80],mentor:[33,76]};
export function silhouettesOverlap(a:GroundPoint,b:GroundPoint){return Math.abs(a[0]-b[0])<7&&Math.abs(a[1]-b[1])<14}
export function freeAppearance(desired:GroundPoint,occupied:GroundPoint[],focus?:GroundPoint):GroundPoint|null{
 for(const dx of [0,8,-8,16,-16,24,-24,32,-32]){const candidate:GroundPoint=[desired[0]+dx,desired[1]];if(focus&&Math.hypot(candidate[0]-focus[0],(candidate[1]-focus[1])*1.5)>10)continue;if(candidate[0]<25||candidate[0]>87)continue;if(occupied.every(p=>!silhouettesOverlap(candidate,p)))return candidate}return null;
}
