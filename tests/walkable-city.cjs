const assert=require('node:assert/strict'),esbuild=require('esbuild');
esbuild.buildSync({stdin:{contents:"export * from './src/ui/demo/CartoonGround';export * from './src/ui/demo/WalkableCity';export * from './src/ui/demo/IllustratedTraffic'",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',outfile:'/tmp/espia-navigation.cjs'});
const {GroundWalker,ACCESS,CROSSING_NORTH,enteringCrossing,pedestrianWindow,walkable,onStairs}=require('/tmp/espia-navigation.cjs');
for(const zone of ['praca','calcadao','servicos']){
 const w=new GroundWalker();w.zone=zone;let clock=0,waited=false,crossed=false;w.allow=(a,b)=>!enteringCrossing(a,b)||pedestrianWindow(clock);w.go(ACCESS[zone][2]);
 for(let i=0;i<20000&&!w.arrived;i++){clock+=.016;const before=[...w.position];w.advance(.016);waited||=w.blocked;if(enteringCrossing(before,w.position)){assert(pedestrianWindow(clock),'Crossing starts only during protected interval');crossed=true}}
 assert(w.arrived&&waited&&crossed,'Player reaches the stairs after waiting for the crossing');assert.deepEqual(w.position,ACCESS[zone][2]);assert(onStairs(w.position,zone));
 w.go([39,77]);for(let i=0;i<20000&&!w.arrived;i++){clock+=.016;w.advance(.016)}assert(w.arrived&&w.position[1]>68,'Can return from the other sidewalk');
}
const manual=new GroundWalker();manual.position=[60,60.01];manual.allow=(a,b)=>!enteringCrossing(a,b);manual.steer(0,-1,.1);assert(manual.blocked&&manual.position[1]>=60,'Manual movement also respects crossing signal');assert(!walkable([70,45]),'Garden/building outside paths is not walkable');
console.log('PASS: three stair access routes, protected crossing, return route, manual red-light stop and scenery bounds.');
for(const zone of ['work','territory','health']){const w=new GroundWalker();w.zone=zone;w.go(ACCESS[zone][2]);for(let i=0;i<10000&&!w.arrived;i++)w.advance(.016);assert(w.arrived);assert.deepEqual(w.position,ACCESS[zone][2]);w.go([39,77]);for(let i=0;i<10000&&!w.arrived;i++)w.advance(.016);assert(w.arrived,'Every campaign access has a return path')}
const turning=new GroundWalker();turning.steer(-1,0,.1);assert(turning.facing==='left');turning.steer(1,0,.1);assert(turning.facing==='right');turning.steer(0,-1,.1);assert(turning.facing==='up');turning.steer(0,1,.1);assert(turning.facing==='down');
console.log('PASS: all campaign access/return paths and four movement orientations.');

const {IllustratedTraffic,busOccupies,roadPoint,depthAt}=require('/tmp/espia-navigation.cjs');
for(const zone of ['praca','calcadao','servicos']){
 for(let s=0;s<90;s+=3){const p=roadPoint(s,zone);assert(busOccupies(p,s,zone)||p[0]>=68&&zone!=='servicos');assert(!busOccupies([p[0],p[1]+12],s,zone));}
}
const yielding=new IllustratedTraffic(),before=yielding.buses.map(b=>b.s);
yielding.update(.1,false,()=>false);
assert.deepEqual(yielding.buses.map(b=>b.s),before,'Bus stops when pedestrian footprint blocks its next position');
assert(depthAt(53)<depthAt(58)&&depthAt(63)>depthAt(58),'Bus and pedestrians share a consistent ground-depth order');
console.log('PASS: bus footprints, yielding to pedestrians and shared painter depth.');
for(const zone of ['praca','calcadao','servicos','work','territory','health']){
 const free=new GroundWalker();free.zone=zone;
 for(const target of [[42,88],[88,90],[38,79],[76,84]]){assert(free.explore(target),'Free paved destination reachable '+zone);for(let i=0;i<10000&&!free.arrived;i++){free.advance(.016);assert(walkable(free.position,zone),'Free path stays on walkable ground')}assert(free.arrived);assert.deepEqual(free.position,target)}
 assert(!free.explore([70,30]),'Roof destination rejected');assert(!free.explore([5,5]),'Outside city rejected');
 free.position=[39,77];for(let i=0;i<50;i++)free.steer(-1,0,.1);assert(free.position[0]>=24&&free.position[0]<33,'Manual movement stops before the foreground planter');
}
console.log('PASS: free exploration across six districts, click-destination paths, manual extended movement and roof rejection.');

for(const zone of ['praca','calcadao','servicos','work','territory','health']){assert(!walkable([15,80],zone),'Planter rejects movement');assert(!walkable([20,90],zone),'Foreground wall rejects movement');assert(!walkable([70,50],zone),'Upper building face is outside mapped entrances')}
