import {ACCESS} from './WalkableCity';
import {GroundWalker,type GroundPoint,GROUND_ANCHORS} from './CartoonGround';
export const RESIDENT_SPOTS:GroundPoint[]=[[14,74],[40,72],[57,80],[73,74],[53,74],[70,79],[20,82],[45,84],[82,82],[61,85]];
export const ACTIVITY_LABELS=['Sentado no banco','Consultando o mapa','Circulando pelo bairro','Pesquisando no celular','Lendo no banco','Observando a cidade'];
/** Independent schedules, never retargeted when the controlled character moves. */
export class CityResident{
 readonly walker=new GroundWalker();
 discovered=false;
 extended=false;
 readonly activity:number;
 get zone(){return ['praca','calcadao','praca','calcadao','servicos','servicos'][this.index%6]}
 private wait:number;
 private leg=0;
 constructor(readonly index:number,look:number){this.activity=look;this.walker.position=[...RESIDENT_SPOTS[index%RESIDENT_SPOTS.length]];this.wait=3+index*2.3}
 get moving(){return this.walker.moving}
 update(dt:number,paused:boolean,controlled:boolean){
  if(paused||controlled){this.walker.advance(0,true);return}
  if(this.walker.arrived){this.wait-=Math.min(dt,.1);if(this.wait<=0&&(this.activity===2||this.activity===5)){
   const route:GroundPoint[]=this.extended&&['work','territory','health'].includes(this.walker.zone)?[[33,77],[57,76],...ACCESS[this.walker.zone],[57,76],[78,71]]:this.extended?[[33,77],[57,76],[60,61],[55,53],[42,52],[55,53],[60,61],[67,73],[78,71]]:[[51,77],[58,74],[63,71],[55,73]];
   this.walker.go(route[(this.leg+this.index)%route.length]);this.leg++;this.wait=7+this.index*1.7;
  }}this.walker.advance(dt);
 }
 nearby(hero:GroundPoint){return Math.hypot(this.walker.position[0]-hero[0],(this.walker.position[1]-hero[1])*1.5)<=10}
 encounter(hero:GroundPoint){if(!this.nearby(hero)||this.discovered)return false;this.discovered=true;return true}
 nearestStation(){if(!this.walker.moving)return ['contact','witness','impact','verify','research','mentor'][this.index%6];let result='contact',best=Infinity;for(const [name,p] of Object.entries(GROUND_ANCHORS)){const d=Math.hypot(p[0]-this.walker.position[0],p[1]-this.walker.position[1]);if(d<best){best=d;result=name}}return result}
}
