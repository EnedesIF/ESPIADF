export interface LabelRect{left:number;top:number;right:number;bottom:number}
const intersects=(a:LabelRect,b:LabelRect)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
/** Move only the UI label; the ground target, path and actor feet stay unchanged. */
export function clearActorOffset(label:LabelRect,actors:LabelRect[],bounds:LabelRect):[number,number]{
 const gap=10,protectedRects=actors.map(r=>({left:r.left-gap,right:r.right+gap,top:r.top-gap,bottom:r.bottom+gap}));
 if(!protectedRects.some(r=>intersects(label,r)))return [0,0];
 const xs=[0,...protectedRects.flatMap(r=>[r.left-label.right,r.right-label.left])],ys=[0,...protectedRects.flatMap(r=>[r.top-label.bottom,r.bottom-label.top])];
 const options=xs.flatMap(x=>ys.map(y=>({x,y,r:{left:label.left+x,right:label.right+x,top:label.top+y,bottom:label.bottom+y}}))).filter(p=>!protectedRects.some(r=>intersects(p.r,r)));
 const overflow=(r:LabelRect)=>Math.max(0,bounds.left-r.left)+Math.max(0,r.right-bounds.right)+Math.max(0,bounds.top-r.top)+Math.max(0,r.bottom-bounds.bottom);
 options.sort((a,b)=>(overflow(a.r)*100+Math.hypot(a.x,a.y))-(overflow(b.r)*100+Math.hypot(b.x,b.y)));
 return options.length?[options[0].x,options[0].y]:[0,0];
}
export function avoidActorLabels(labels:HTMLElement[],actors:HTMLElement[],viewport:HTMLElement){
 const protectedRects=actors.filter(n=>!n.hidden).map(n=>n.getBoundingClientRect()),bounds=viewport.getBoundingClientRect();
 for(const label of labels){if(label.hidden)continue;label.style.translate='none';const [x,y]=clearActorOffset(label.getBoundingClientRect(),protectedRects,bounds);label.style.translate=x+'px '+y+'px';}
}
