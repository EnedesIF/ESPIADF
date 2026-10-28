/** Caminhos a pé: grade A* respeita paredes, construções e cantos. */
export interface WalkObstacle{minX:number;maxX:number;minZ:number;maxZ:number}
export function walkPath(start:[number,number],end:[number,number],obstacles:WalkObstacle[]):[number,number][]{
 const size=2,minX=-148,minZ=-92,w=149,h=93;
 const cell=(p:[number,number])=>[Math.max(0,Math.min(w-1,Math.round((p[0]-minX)/size))),Math.max(0,Math.min(h-1,Math.round((p[1]-minZ)/size)))];
 const xy=(k:number):[number,number]=>[minX+(k%w)*size,minZ+Math.floor(k/w)*size];
 const blocked=(k:number)=>{const [x,z]=xy(k);return obstacles.some(o=>x>o.minX-.65&&x<o.maxX+.65&&z>o.minZ-.65&&z<o.maxZ+.65)};
 const sc=cell(start),ec=cell(end),s=sc[1]*w+sc[0];let goal=ec[1]*w+ec[0];
 if(blocked(goal)){let best=Infinity;for(let z=-3;z<=3;z++)for(let x=-3;x<=3;x++){const nx=ec[0]+x,nz=ec[1]+z;if(nx<0||nx>=w||nz<0||nz>=h)continue;const k=nz*w+nx,d=x*x+z*z;if(!blocked(k)&&d<best){goal=k;best=d}}}
 const open=new Set([s]),cost=new Map([[s,0]]),parent=new Map<number,number>();
 const heuristic=(k:number)=>{const a=xy(k),b=xy(goal);return Math.hypot(a[0]-b[0],a[1]-b[1])/size};
 let count=0;while(open.size&&count++<w*h){let cur=-1,best=Infinity;for(const k of open){const f=cost.get(k)!+heuristic(k);if(f<best){cur=k;best=f}}if(cur===goal){const path:[number,number][]=[];let k=goal;while(k!==s){path.unshift(xy(k));k=parent.get(k)!}return path}open.delete(cur);const cx=cur%w,cz=Math.floor(cur/w);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=cx+dx,z=cz+dz;if(x<0||x>=w||z<0||z>=h)continue;const k=z*w+x;if(blocked(k)||(dx&&dz&&(blocked(cz*w+x)||blocked(z*w+cx))))continue;const g=cost.get(cur)!+Math.hypot(dx,dz);if(g<(cost.get(k)??Infinity)){cost.set(k,g);parent.set(k,cur);open.add(k)}}}return [];
}
