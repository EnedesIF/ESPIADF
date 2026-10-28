import * as THREE from 'three';
import type {CityStage} from '@/data/cityMissions';
/** Shot composition follows the reference boards, with real scene geometry in every shot. */
export function fieldShot(stage:CityStage,subject:THREE.Vector3,viewer:THREE.Vector3,kind:'person'|'object'|'desk'='person'){
 const direction=new THREE.Vector3().subVectors(viewer,subject);direction.y=0;
 if(kind==='object')direction.set(-.2,0,1);
 if(direction.lengthSq()<.5)direction.set(-1,0,1);direction.normalize();
 const side=new THREE.Vector3(direction.z,0,-direction.x);
 const distance=kind==='object'?4.8:kind==='desk'?6.7:4.1;
 const from=subject.clone().addScaledVector(direction,distance).addScaledVector(side,kind==='person'?2.1:1.4);from.y=kind==='desk'?3.2:2.15;
 const look=subject.clone().addScaledVector(side,.9);look.y=kind==='object'?1.8:1.3;
 return {from,look,stage,kind};
}
