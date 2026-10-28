import type {GroundPoint} from './CartoonGround';
export const CROSSING_SOUTH:GroundPoint=[60,61],CROSSING_NORTH:GroundPoint=[55,53];
export const ACCESS:Record<string,GroundPoint[]>={praca:[[43,52],[34,49],[30,45]],calcadao:[[42,52],[28,51],[24,46]],servicos:[[43,52],[38,51],[35,46]],work:[[78,65],[88,62],[90,56]],territory:[[35,65],[29,57],[22,50]],health:[[75,63],[86,62],[87,58]]};
const dist=(a:GroundPoint,b:GroundPoint)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function segmentDistance(p:GroundPoint,a:GroundPoint,b:GroundPoint){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return dist(p,[a[0]+dx*t,a[1]+dy*t])}
export function navigation(zone='praca'){
 if(['work','territory','health'].includes(zone)){
 const extras:Record<string,GroundPoint[]>={work:[[70,66],[78,65],[84,65],[88,62],[90,56],[32,66],[17,61]],territory:[[35,65],[29,57],[22,50],[63,65],[69,61]],health:[[63,65],[75,63],[83,64],[86,62],[87,58]]};
 const nodes:GroundPoint[]=[[20,78],[33,77],[45,77],[57,76],[67,73],[78,71],[88,80],...extras[zone]];
 const edges:[number,number][]=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]];
 if(zone==='work')edges.push([3,7],[7,8],[8,9],[9,10],[10,11],[2,12],[12,13]);else if(zone==='territory')edges.push([2,7],[7,8],[8,9],[4,10],[10,11]);else edges.push([3,7],[7,8],[8,9],[9,10],[10,11]);
 return {nodes,edges};
 }
 const nodes:GroundPoint[]=[[20,78],[33,77],[45,77],[57,76],[67,73],[78,71],[88,80],CROSSING_SOUTH,CROSSING_NORTH,...(ACCESS[zone]??ACCESS.praca)];
 const edges:[number,number][]=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,7],[7,8],[8,9],[9,10],[10,11]];
 return {nodes,edges};
}
export function cityPath(from:GroundPoint,to:GroundPoint,zone='praca'){
 const {nodes,edges}=navigation(zone),nearest=(p:GroundPoint)=>nodes.reduce((best,n,i)=>dist(p,n)<dist(p,nodes[best])?i:best,0),start=nearest(from),end=nearest(to),cost=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),pending=new Set(nodes.map((_,i)=>i));cost[start]=0;
 while(pending.size){let u=-1;for(const i of pending)if(u<0||cost[i]<cost[u])u=i;if(u===end)break;pending.delete(u);for(const [a,b] of edges){const v=a===u?b:b===u?a:-1;if(v<0||!pending.has(v))continue;const c=cost[u]+dist(nodes[u],nodes[v]);if(c<cost[v]){cost[v]=c;prev[v]=u}}}
 const route:number[]=[];for(let u=end;u>=0;u=prev[u]){route.unshift(u);if(u===start)break}
 return [...route.map(i=>[...nodes[i]] as GroundPoint),[...to] as GroundPoint].filter((p,i,arr)=>dist(i?arr[i-1]:from,p)>.1);
}
function polygon(p:GroundPoint,vertices:GroundPoint[]){let inside=false;for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){const a=vertices[i],b=vertices[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
export function walkable(p:GroundPoint,zone='praca'){
 if(sceneryObstacle(p,zone))return false;
 if(explorationArea(p,zone))return true;
 if(polygon(p,[[16,75],[40,68],[60,61],[78,62],[90,72],[92,91],[32,93],[25,84]]))return true;
 const {nodes,edges}=navigation(zone);return edges.some(([a,b])=>segmentDistance(p,nodes[a],nodes[b])<2.5);
}
export function enteringCrossing(from:GroundPoint,to:GroundPoint){return from[1]>=60&&to[1]<60||from[1]<=54&&to[1]>54}
export function onStairs(p:GroundPoint,zone='praca'){if(zone==='territory')return false;const r=ACCESS[zone]??ACCESS.praca;return segmentDistance(p,r[1],r[2])<2&&p[1]<r[1][1]}
export function pedestrianWindow(clock:number){const phase=clock%32;return phase>=22&&phase<=28}

/** Connected paved areas for free exploration, rather than a single centerline. */
export function explorationArea(p:GroundPoint,zone='praca'){
 if(polygon(p,[[8,78],[19,72],[32,69],[40,68],[60,62],[78,63],[94,74],[94,94],[28,94],[20,87],[8,86]]))return true;
 // Upper pavement connects to the existing signed crossings and access stairs.
 // Upper areas are reachable only along mapped crossings and entrances.
 return false;
}
/** A* over walkable ground. Diagonals cannot cut across non-walkable corners. */
export function explorationPath(from:GroundPoint,to:GroundPoint,zone='praca'):GroundPoint[]{
 if(!walkable(to,zone))return [];
 const key=(x:number,y:number)=>x+','+y,parse=(s:string)=>s.split(',').map(Number) as GroundPoint;
 const line=(a:GroundPoint,b:GroundPoint)=>{const n=Math.max(1,Math.ceil(dist(a,b)*4));for(let i=1;i<=n;i++)if(!walkable([a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n],zone))return false;return true};
 if(line(from,to))return [[...to]];
 const nearest=(p:GroundPoint)=>{let best:GroundPoint|null=null,d=Infinity;for(let x=Math.floor(p[0])-3;x<=Math.ceil(p[0])+3;x++)for(let y=Math.floor(p[1])-3;y<=Math.ceil(p[1])+3;y++){const q:GroundPoint=[x,y];if(walkable(q,zone)&&line(p,q)&&dist(p,q)<d){best=q;d=dist(p,q)}}return best};
 const start=nearest(from),goal=nearest(to);if(!start||!goal)return [];
 const sk=key(...start),gk=key(...goal),open=new Set([sk]),cost=new Map([[sk,0]]),prev=new Map<string,string>();
 while(open.size){let current='';let score=Infinity;for(const k of open){const n=cost.get(k)!+dist(parse(k),goal);if(n<score){score=n;current=k}}if(current===gk){const path:GroundPoint[]=[to];for(let k=current;k;k=prev.get(k)??'')path.unshift(parse(k));return path}open.delete(current);const [x,y]=parse(current);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const p:GroundPoint=[x+dx,y+dy];if(p[0]<5||p[0]>95||p[1]<40||p[1]>95||!walkable(p,zone)||!line([x,y],p))continue;const k=key(...p),c=cost.get(current)!+Math.hypot(dx,dy);if(c<(cost.get(k)??Infinity)){cost.set(k,c);prev.set(k,current);open.add(k)}}}
 return [];
}

/** Planters and building faces are solid, even when a broad pavement polygon overlaps them. */
export function sceneryObstacle(p:GroundPoint,zone='praca'){
 const [x,y]=p;
 if(y>72&&x<Math.min(40,24+(y-72)*1.2))return true;
 if(x<29&&y>87)return true;
 if(x>90&&y<76)return true;
 if(zone==='work'&&polygon(p,[[29,58],[49,58],[49,67],[38,72],[29,69]]))return true;
 if(zone==='health'&&polygon(p,[[7,56],[31,56],[31,70],[24,75],[7,77]]))return true;
 return false;
}
