import type {GroundPoint} from './CartoonGround';
/** Routes calibrated against the painted asphalt in each district.
 * The plaza/school road recedes behind the central planted island; it does not
 * continue across the sidewalk at the right of the image. */
export const ROAD_ROUTES:Record<string,GroundPoint[]>={
 praca:[[-18,65],[25,62],[39,60],[49,58],[59,56],[65,54],[70,51]],
 calcadao:[[-18,64],[25,61],[39,59],[49,58],[59,56],[65,54],[70,51]],
 servicos:[[-18,57.5],[25,57.5],[39,57.5],[49,57.5],[63,57.5],[77,57.5],[118,57.5]]
};
export const BUS_ROAD=ROAD_ROUTES.praca;
const lengths=BUS_ROAD.slice(1).map((p,i)=>Math.hypot(p[0]-BUS_ROAD[i][0],p[1]-BUS_ROAD[i][1]));
export const ROAD_LENGTH=lengths.reduce((a,b)=>a+b,0);
const STOP=lengths[0],LIGHT=STOP+lengths[1];
export function roadPoint(s:number,zone='praca'):GroundPoint{
 const route=ROAD_ROUTES[zone]??BUS_ROAD;
 // Keep stop/light landmarks on the same simulation segments in every sector.
 let i=0;for(;i<lengths.length-1&&s>lengths[i];i++)s-=lengths[i];
 const t=Math.max(0,Math.min(1,s/lengths[i]));
 return [route[i][0]+(route[i+1][0]-route[i][0])*t,route[i][1]+(route[i+1][1]-route[i][1])*t];
}
export function roadPose(s:number,zone='praca'){
 const [x,y]=roadPoint(s,zone);
 const civic=zone==='servicos';
 const scale=civic?.92:Math.max(.5,1.12-(x+18)/88*.62);
 // At the far end the vehicle passes behind the planted island, never over the plaza.
 const opacity=civic?1:Math.max(0,Math.min(1,(68-x)/7));
 return {x,y,scale,opacity,skew:civic?0:Math.min(0,(x-30)*-.16)};
}
/** Ground footprint, independent of the vehicle's tall painted silhouette. */
export function busOccupies(point:GroundPoint,s:number,zone='praca',margin=1.5){
 const pose=roadPose(s,zone);
 return pose.opacity>.05&&Math.abs(point[0]-pose.x)<9.57*pose.scale+margin&&Math.abs(point[1]-pose.y)<2.2+margin*.3;
}
export function depthAt(y:number){return Math.round(y)}
export class IllustratedTraffic{
 clock=0;
 buses=[{s:0,wait:0,stopped:false,status:'circulando'},{s:ROAD_LENGTH*.56,wait:0,stopped:true,status:'circulando'}];
 get green(){return this.clock%32<18}
 update(dt:number,paused=false,mayMove:(s:number,next:number)=>boolean=()=>true){if(paused)return;dt=Math.max(0,Math.min(dt,.1));this.clock+=dt;
  const before=this.buses.map(b=>b.s);
  this.buses.forEach((b,i)=>{
   if(b.wait>0){b.wait=Math.max(0,b.wait-dt);b.status='embarque no ponto';return}
   let next=b.s+dt*4.2;
   if(!b.stopped&&b.s<=STOP&&next>=STOP){next=STOP;b.wait=4;b.stopped=true;b.status='embarque no ponto'}
   else if(!this.green&&b.s<=LIGHT&&next>=LIGHT){next=LIGHT;b.status='aguardando semáforo'}else b.status='circulando';
   if(!mayMove(b.s,next)){next=b.s;b.status='aguardando pedestre'}
   const gap=(before[1-i]-b.s+ROAD_LENGTH)%ROAD_LENGTH;if(gap<20)next=Math.min(next,b.s+Math.max(0,gap-18));
   b.s=next;if(b.s>ROAD_LENGTH){b.s=0;b.stopped=false;b.wait=0}
  });
 }
}
