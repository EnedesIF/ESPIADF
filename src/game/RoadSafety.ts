import * as THREE from 'three';
import type {RouteFollower} from '@/entities/Vehicle';
import {textSign} from '@/worlds/textures';
export interface VehicleFootprint{x:number;z:number;heading:number;halfLength:number;halfWidth:number}
export const CROSSWALKS=[-100,-60,-18,48,70,110];
export type Signal='cars'|'amber'|'clearance'|'pedestrians';
export function signalPhase(clock:number):Signal{const n=clock%32;return n<16?'cars':n<19?'amber':n<21?'clearance':n<30?'pedestrians':'clearance'}
export function pointInVehicle(p:{x:number;z:number},v:VehicleFootprint,pad=.6){const dx=p.x-v.x,dz=p.z-v.z;const forward=dx*Math.sin(v.heading)+dz*Math.cos(v.heading),side=dx*Math.cos(v.heading)-dz*Math.sin(v.heading);return Math.abs(forward)<v.halfLength+pad&&Math.abs(side)<v.halfWidth+pad}
/** Faixas, sinais e prioridade ao pedestre. Não existe dano/atropelamento no game. */
export class RoadSafety{
 private clock=0;
 private lights:{car:THREE.MeshStandardMaterial[];walk:THREE.MeshStandardMaterial}[]=[];
 status='';
 constructor(scene:THREE.Scene){
  const group=new THREE.Group();group.name='crosswalks-and-signals';scene.add(group);
  const box=(x:number,y:number,z:number,w:number,h:number,d:number,color:string)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.7}));m.position.set(x,y,z);group.add(m);return m};
  for(const x of CROSSWALKS){
   for(let z=-7;z<=7;z+=1.7)box(x,.09,z,5,.04,.9,'#f3edcf');
   for(const z of [-10,10]){box(x,1.9,z,.14,3.8,.14,'#33434b');box(x,3.5,z,.7,1.8,.45,'#182b30');const car=[];
    for(let i=0;i<3;i++){const mat=new THREE.MeshStandardMaterial({color:['#ee534b','#edbc45','#51d794'][i],emissive:'#000',emissiveIntensity:0});const light=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),mat);light.position.set(x,4.06-i*.52,z+(z<0?.3:-.3));group.add(light);car.push(mat)}
    const walk=new THREE.MeshStandardMaterial({color:'#ed6754',emissive:'#ed6754',emissiveIntensity:.7});const indicator=new THREE.Mesh(new THREE.BoxGeometry(.6,.5,.1),walk);indicator.position.set(x+.7,2.5,z);group.add(indicator);this.lights.push({car,walk});
   }
   const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.5,.8),new THREE.MeshBasicMaterial({map:textSign(['TRAVESSIA','AGUARDE O VERDE'],{w:512,h:160,bg:'#153a47',fg:'#fff'}),side:THREE.DoubleSide}));sign.position.set(x,1.3,11.5);group.add(sign);
  }
 }
 phase(){return signalPhase(this.clock)}
 update(dt:number,player:{x:number;z:number}){this.clock=(this.clock+dt)%32;const near=CROSSWALKS.some(x=>Math.abs(player.x-x)<5)&&Math.abs(player.z)<13;if(near&&this.clock>3&&this.clock<16)this.clock=16;
  const phase=this.phase();for(const l of this.lights){l.car.forEach((m,i)=>{const on=i===0?(phase==='clearance'||phase==='pedestrians'):i===1?phase==='amber':phase==='cars';m.emissive.set(on?['#f04030','#f6bb32','#37d98f'][i]:'#000');m.emissiveIntensity=on?1:0});l.walk.color.set(phase==='pedestrians'?'#38d791':'#ed6754');l.walk.emissive.copy(l.walk.color)}
 }
 vehicleAllowed(route:RouteFollower,s:number,next:number,halfLength:number,halfWidth:number,player:{x:number;z:number}){
  const from=route.at(s),to=route.at(next);
  if(pointInVehicle(player,{x:to.x,z:to.z,heading:to.heading,halfLength,halfWidth},1.1))return false;
  if(this.phase()!=='cars')for(const x of CROSSWALKS){if(Math.abs(from.z)>8||Math.abs(to.z)>8)continue;const dir=Math.sign(to.x-from.x);if(!dir)continue;const before=dir*(x-from.x),after=dir*(x-to.x),stop=3+halfLength+1;
   if(before>=stop-.001&&after<stop)return false;
  }return true;
 }
 pedestrianAllowed(before:{x:number;z:number},after:{x:number;z:number},vehicles:VehicleFootprint[]){
  this.status='';if(vehicles.some(v=>pointInVehicle(after,v,.65)&&!pointInVehicle(before,v,.65))){this.status='VEÍCULO PASSANDO • aguarde';return false}
  const entering=(Math.abs(before.z)>=8.7&&Math.abs(after.z)<8.7);
  if(entering){if(!CROSSWALKS.some(x=>Math.abs(after.x-x)<=2.6)){this.status='USE A FAIXA DE PEDESTRES';return false}if(this.phase()!=='pedestrians'){this.status='SINAL FECHADO • aguarde o verde';return false}
   if(vehicles.some(v=>Math.abs(v.z)<9&&Math.abs(v.x-after.x)<v.halfLength+3.5)){this.status='TRAVESSIA LIBERANDO • aguarde';return false}
  }if(Math.abs(after.z)<9)this.status='ATRAVESSANDO • siga até a calçada';return true;
 }
 /** A* usa as faixas, e o movimento manual também respeita o sinal. */
 navigationObstacles(){const o:{minX:number;maxX:number;minZ:number;maxZ:number}[]=[];let start=-150;for(const x of CROSSWALKS){o.push({minX:start,maxX:x-2.5,minZ:-10,maxZ:10});start=x+2.5}o.push({minX:start,maxX:150,minZ:-10,maxZ:10});return o}
}
