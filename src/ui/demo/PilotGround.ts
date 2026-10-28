export type PilotPoint=[number,number];
/** Geometry traced against the 1672 × 941 first-scene illustration, in percentages. */
export const PILOT_FLOOR:PilotPoint[]=[[29,80],[52,70],[71,63],[81,62],[83,70],[86,74],[90,79],[90,84],[86,88],[80,97],[30,97],[30,89],[29,89]];
export const PILOT_SOLIDS:PilotPoint[][]=[
 [[0,64],[8,64],[20,72],[28,76],[28,88],[7,100],[0,100]],
 [[79,32],[100,31],[100,70],[89,71],[89,62],[79,59]],
 [[87,63],[100,60],[100,81],[91,79],[87,74]],
 [[88,84],[100,76],[100,100],[79,100]]
];
export const PILOT_AGENT:PilotPoint=[76,73];
export interface PilotMap{floor:PilotPoint[];solids:PilotPoint[][];agent?:PilotPoint}
export const PILOT_MAP:PilotMap={floor:PILOT_FLOOR,solids:PILOT_SOLIDS,agent:PILOT_AGENT};
export const pilotDistance=(a:PilotPoint,b:PilotPoint)=>Math.hypot(a[0]-b[0],(a[1]-b[1])*.563);
export function inside(p:PilotPoint,polygon:PilotPoint[]){let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes}
export function pilotWalkable(p:PilotPoint,map:PilotMap=PILOT_MAP){
 // The shoe contact is an ellipse, rather than an infinitely small click point.
 for(const [dx,dy] of [[0,0],[.65,0],[-.65,0],[0,.5],[0,-.5]] as PilotPoint[]){const q:PilotPoint=[p[0]+dx,p[1]+dy];if(!inside(q,map.floor)||map.solids.some(s=>inside(q,s))||(map.agent&&pilotDistance(q,map.agent)<2.1))return false}return true;
}
export function pilotSegment(a:PilotPoint,b:PilotPoint,map:PilotMap=PILOT_MAP){const steps=Math.max(1,Math.ceil(pilotDistance(a,b)*8));for(let i=1;i<=steps;i++)if(!pilotWalkable([a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps],map))return false;return true}
export function pilotPath(from:PilotPoint,to:PilotPoint,map:PilotMap=PILOT_MAP):PilotPoint[]{
 if(!pilotWalkable(to,map))return [];
 if(pilotSegment(from,to,map))return [[...to]];
 const key=(p:PilotPoint)=>p.join(','),parse=(s:string)=>s.split(',').map(Number) as PilotPoint;
 const nearest=(p:PilotPoint)=>{let best:PilotPoint|null=null,score=Infinity;for(let x=Math.round(p[0])-2;x<=Math.round(p[0])+2;x++)for(let y=Math.round(p[1])-2;y<=Math.round(p[1])+2;y++){const q:PilotPoint=[x,y];if(pilotWalkable(q,map)&&pilotSegment(p,q,map)&&pilotDistance(p,q)<score){best=q;score=pilotDistance(p,q)}}return best};
 const start=nearest(from),end=nearest(to);if(!start||!end)return [];
 const sk=key(start),ek=key(end),open=new Set([sk]),cost=new Map([[sk,0]]),prev=new Map<string,string>();
 while(open.size){let current='',best=Infinity;for(const k of open){const f=cost.get(k)!+pilotDistance(parse(k),end);if(f<best){best=f;current=k}}if(current===ek){const raw:PilotPoint[]=[to];for(let k=current;k;k=prev.get(k)??'')raw.unshift(parse(k));const smooth:PilotPoint[]=[];let a=from;for(let i=0;i<raw.length;){let far=i;while(far+1<raw.length&&pilotSegment(a,raw[far+1],map))far++;smooth.push(raw[far]);a=raw[far];i=far+1}return smooth}open.delete(current);const p=parse(current);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const q:PilotPoint=[p[0]+dx,p[1]+dy];if(!pilotWalkable(q,map)||!pilotSegment(p,q,map))continue;const k=key(q),c=cost.get(current)!+pilotDistance(p,q);if(c<(cost.get(k)??Infinity)){cost.set(k,c);prev.set(k,current);open.add(k)}}}return [];
}
