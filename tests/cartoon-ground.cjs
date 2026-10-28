const assert=require('node:assert/strict'),esbuild=require('esbuild');
esbuild.buildSync({entryPoints:['src/ui/demo/CartoonGround.ts'],bundle:true,platform:'node',format:'cjs',outfile:'/tmp/cartoon-ground.cjs'});
const {GROUND_ANCHORS,WALK_SPINE,GroundWalker,groundScale,groundPath}=require('/tmp/cartoon-ground.cjs');
for(const from of Object.values(GROUND_ANCHORS))for(const to of Object.values(GROUND_ANCHORS)){
 const walker=new GroundWalker();walker.position=[...from];walker.go(to);const paused=[...walker.position];walker.advance(.05,true);assert.deepEqual(walker.position,paused,'Pause does not slide feet');
 let previous=[...walker.position];for(let i=0;i<3000&&!walker.arrived;i++){walker.advance(.016);const [x,y]=walker.position;assert(x>=24&&x<=87&&y>=68&&y<=82,'Position stays inside painted pedestrian corridor');assert(Math.hypot(x-previous[0],y-previous[1])<.2,'No averaging jumps or teleporting');previous=[x,y]}
 assert(walker.arrived);assert.deepEqual(walker.position,to);assert(!walker.moving,'Walking animation stops at destination');
}
assert(groundScale(68)<groundScale(78),'Distant people are smaller');assert(groundPath([33,74],[78,68]).length>3,'Long walk follows promenade bends');
console.log('PASS: 64 illustrated journeys stay on the pedestrian corridor; stable foot anchors, perspective scale, pause and no shortcut jumps.');
const manual=new GroundWalker();manual.go([78,71]);manual.steer(1,0,.1);assert(manual.path.length===0&&manual.position[0]>39,'Manual input cancels automatic path and moves right');for(let i=0;i<1000;i++)manual.steer(0,-1,.1);assert(manual.position[1]>=61,'Manual walking stops at the curb outside the crossing');manual.stop();assert(!manual.moving&&manual.arrived,'Stop clears motion and destination');
console.log('PASS: manual directions, automatic-path cancellation, stop and sidewalk bounds.');
