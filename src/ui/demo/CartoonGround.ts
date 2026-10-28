import {cityPath,walkable,explorationPath} from './WalkableCity';
export type GroundPoint=[number,number];
/** Painted promenade centerline, in image coordinates. Never interpolate across beds/road. */
export const GROUND_ANCHORS:Record<string,GroundPoint>={contact:[44,82],inspect:[45,76],witness:[50,76],research:[87,80],verify:[69,71],action:[50,78],mentor:[37,78],impact:[56,77]};
export const WALK_SPINE:GroundPoint[]=[[33,77],[45,77],[57,76],[67,73],[78,71]];
export function groundScale(y:number){return Math.max(.62,Math.min(1.12,.64+(y-68)*.035))}
const distance=(a:GroundPoint,b:GroundPoint)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function nearest(point:GroundPoint){let best=0;WALK_SPINE.forEach((p,i)=>{if(distance(point,p)<distance(point,WALK_SPINE[best]))best=i});return best}
export function groundPath(from:GroundPoint,to:GroundPoint){const a=nearest(from),b=nearest(to),out:GroundPoint[]=[];if(distance(from,to)<.5)return out;const step=a<=b?1:-1;for(let i=a;;i+=step){out.push([...WALK_SPINE[i]]);if(i===b)break}out.push([...to]);return out.filter((p,i)=>distance(i?out[i-1]:from,p)>.15)}
export class GroundWalker{
 zone='praca';
 pace=1;
 facing:'up'|'down'|'left'|'right'='down';
 blocked=false;
 allow:(from:GroundPoint,to:GroundPoint)=>boolean=()=>true;
 position:GroundPoint=[39,77];path:GroundPoint[]=[];moving=false;facingLeft=false;
 go(to:GroundPoint){
  const route=(this.position[1]<68||to[1]<68)?cityPath(this.position,to,this.zone):groundPath(this.position,to);
  let from=this.position;const clear=route.every(p=>{const n=Math.max(1,Math.ceil(Math.hypot(p[0]-from[0],p[1]-from[1])*5));for(let i=1;i<=n;i++)if(!walkable([from[0]+(p[0]-from[0])*i/n,from[1]+(p[1]-from[1])*i/n],this.zone))return false;from=p;return true});
  this.path=clear?route:explorationPath(this.position,to,this.zone);this.moving=!!this.path.length;
 }
 explore(to:GroundPoint){const route=explorationPath(this.position,to,this.zone);if(!route.length)return false;this.path=route;this.moving=true;return true}
 private face(dx:number,dy:number){this.facing=Math.abs(dy)>Math.abs(dx)*.65?dy<0?'up':'down':dx<0?'left':'right';if(Math.abs(dx)>.01)this.facingLeft=dx<0}
 stop(){this.path=[];this.moving=false}
 steer(dx:number,dy:number,dt:number){this.stop();this.blocked=false;const length=Math.hypot(dx,dy);if(!length)return;const step=Math.min(.1,Math.max(0,dt))*9*this.pace*groundScale(this.position[1]);const next:GroundPoint=[this.position[0]+dx/length*step,this.position[1]+dy/length*step];if(!walkable(next,this.zone))return;if(!this.allow(this.position,next)){this.blocked=true;return}this.moving=true;this.face(dx,dy);this.position=next}

 get arrived(){return !this.path.length}
 advance(dt:number,paused=false){if(paused){this.moving=false;return}let budget=Math.min(dt,.1)*9*this.pace*groundScale(this.position[1]);this.blocked=false;this.moving=!!this.path.length;while(budget>0&&this.path.length){const p=this.path[0],dx=p[0]-this.position[0],dy=p[1]-this.position[1],d=Math.hypot(dx,dy);if(d>.005)this.face(dx,dy);const next:GroundPoint=d<=budget?[...p]:[this.position[0]+dx/d*budget,this.position[1]+dy/d*budget];if(!this.allow(this.position,next)){this.blocked=true;this.moving=false;break}if(d<=budget){this.position=[...p];this.path.shift();budget-=d}else{this.position=[this.position[0]+dx/d*budget,this.position[1]+dy/d*budget];budget=0}}if(!this.path.length)this.moving=false}
}
